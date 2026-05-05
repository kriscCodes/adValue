from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.db.models import Q, Sum
from django.db.models.functions import TruncDate
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
from django.utils import timezone
from datetime import timedelta

from .models import Business, Content


def get_tokens_for_business(business):
    refresh = RefreshToken()
    refresh["business_id"] = business.business_id
    refresh["email"] = business.business_email
    refresh["type"] = "business"
    return {
        "refresh": str(refresh),
        "access": str(refresh.access_token),
        "business": {
            "id": business.business_id,
            "email": business.business_email,
            "name": business.business_name,
        },
    }


def get_business_from_token(request):
    """Decode JWT and return the Business, or None if invalid/not a business token."""
    from rest_framework_simplejwt.state import token_backend
    from rest_framework_simplejwt.exceptions import TokenError, TokenBackendError

    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        return None

    raw_token = auth.split(" ")[1]

    try:
        payload = token_backend.decode(raw_token, verify=True)
    except (TokenError, TokenBackendError):
        return None

    business_id = payload.get("business_id")
    if not business_id:
        return None

    if payload.get("type") != "business":
        return None

    try:
        return Business.objects.get(business_id=business_id)
    except Business.DoesNotExist:
        return None


class BusinessRegisterView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")
        business_name = request.data.get("business_name")

        if not email or not password or not business_name:
            return Response(
                {"error": "email, password, and business_name are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if Business.objects.filter(business_email=email).exists():
            return Response(
                {"error": "A business with this email already exists."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        business = Business(
            business_email=email,
            business_name=business_name,
            business_owner_first_name=request.data.get("first_name", ""),
            business_owner_last_name=request.data.get("last_name", ""),
            business_description=request.data.get("description", ""),
            business_address=request.data.get("address", ""),
            auth_provider="local",
        )
        business.set_password(password)
        business.save()

        return Response(get_tokens_for_business(business), status=status.HTTP_201_CREATED)


class BusinessLoginView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")

        if not email or not password:
            return Response(
                {"error": "email and password are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            business = Business.objects.get(business_email=email)
        except Business.DoesNotExist:
            return Response(
                {"error": "Invalid email or password."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        if not business.check_password(password):
            return Response(
                {"error": "Invalid email or password."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        return Response(get_tokens_for_business(business), status=status.HTTP_200_OK)


class BusinessSearchView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def get(self, request):
        query = (request.query_params.get("q") or "").strip()
        if not query:
            return Response({"businesses": []}, status=status.HTTP_200_OK)

        businesses = (
            Business.objects.filter(
                Q(business_name__icontains=query)
                | Q(business_address__icontains=query)
            )
            .order_by("business_name")[:10]
        )

        return Response(
            {
                "businesses": [
                    {
                        "business_id": item.business_id,
                        "business_name": item.business_name,
                        "business_address": item.business_address,
                    }
                    for item in businesses
                ]
            },
            status=status.HTTP_200_OK,
        )


class BusinessProfileView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def get(self, request):
        business = get_business_from_token(request)
        if not business:
            return Response(
                {"error": "Unauthorized."},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        return Response({
            "id": business.business_id,
            "email": business.business_email,
            "name": business.business_name,
            "owner_first_name": business.business_owner_first_name,
            "owner_last_name": business.business_owner_last_name,
            "description": business.business_description,
            "address": business.business_address,
            "google_place_id": business.google_place_id,
            "auth_provider": business.auth_provider,
        })

    def patch(self, request):
        business = get_business_from_token(request)
        if not business:
            return Response(
                {"error": "Unauthorized."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        changed_fields = []

        email = request.data.get("email")
        if email is not None:
            email = str(email).strip().lower()
            if not email:
                return Response(
                    {"error": "email cannot be empty."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            try:
                validate_email(email)
            except ValidationError:
                return Response(
                    {"error": "Enter a valid email address."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            if (
                Business.objects.filter(business_email=email)
                .exclude(business_id=business.business_id)
                .exists()
            ):
                return Response(
                    {"error": "A business with this email already exists."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            business.business_email = email
            changed_fields.append("business_email")

        password = request.data.get("password")
        if password is not None:
            password = str(password)
            if len(password) < 8:
                return Response(
                    {"error": "password must be at least 8 characters."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            business.set_password(password)
            changed_fields.append("business_password")

        field_map = {
            "business_name": "business_name",
            "owner_first_name": "business_owner_first_name",
            "owner_last_name": "business_owner_last_name",
            "description": "business_description",
            "address": "business_address",
            "google_place_id": "google_place_id",
        }
        for request_field, model_field in field_map.items():
            value = request.data.get(request_field)
            if value is not None:
                setattr(business, model_field, value)
                changed_fields.append(model_field)

        if changed_fields:
            business.save(update_fields=list(set(changed_fields)))

        return Response(
            {
                "message": "Profile updated.",
                "profile": {
                    "id": business.business_id,
                    "email": business.business_email,
                    "name": business.business_name,
                    "owner_first_name": business.business_owner_first_name,
                    "owner_last_name": business.business_owner_last_name,
                    "description": business.business_description,
                    "address": business.business_address,
                    "google_place_id": business.google_place_id,
                    "auth_provider": business.auth_provider,
                },
            },
            status=status.HTTP_200_OK,
        )


class BusinessContentReviewView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def get(self, request):
        business = get_business_from_token(request)
        if not business:
            return Response(
                {"error": "Unauthorized."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        submissions = Content.objects.filter(business_id=business.business_id).order_by("-submitted_at")
        return Response(
            {
                "submissions": [
                    {
                        "content_id": item.content_id,
                        "customer_id": item.customer_id,
                        "business_id": item.business_id,
                        "platform": item.platform,
                        "content_url": item.content_url,
                        "views": item.views,
                        "status": item.status,
                        "submitted_at": item.submitted_at,
                    }
                    for item in submissions
                ]
            },
            status=status.HTTP_200_OK,
        )

    def patch(self, request):
        business = get_business_from_token(request)
        if not business:
            return Response(
                {"error": "Unauthorized."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        content_id = request.data.get("content_id")
        new_status = request.data.get("status")

        if content_id is None or not new_status:
            return Response(
                {"error": "content_id and status are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            content_id = int(content_id)
        except (TypeError, ValueError):
            return Response(
                {"error": "content_id must be an integer."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        valid_statuses = {
            Content.StatusChoices.PENDING,
            Content.StatusChoices.REJECTED,
            Content.StatusChoices.VALID,
        }
        if new_status not in valid_statuses:
            return Response(
                {"error": "status must be one of: pending, rejected, valid."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        submission = Content.objects.filter(
            content_id=content_id,
            business_id=business.business_id,
        ).first()
        if not submission:
            return Response(
                {"error": "Submission not found for this business."},
                status=status.HTTP_404_NOT_FOUND,
            )

        submission.status = new_status
        submission.save(update_fields=["status"])

        return Response(
            {
                "content_id": submission.content_id,
                "status": submission.status,
            },
            status=status.HTTP_200_OK,
        )


class BusinessDashboardView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    VALID_PLATFORMS = {"tiktok", "instagram", "youtube"}
    VALID_STATUSES = {"pending", "valid", "rejected"}

    def get(self, request):
        business = get_business_from_token(request)
        if not business:
            return Response({"error": "Unauthorized."}, status=status.HTTP_401_UNAUTHORIZED)

        # --- Query param filters ---
        platform_filter = request.query_params.get("platform", "").lower() or None
        status_filter = request.query_params.get("status", "").lower() or None
        try:
            days_filter = int(request.query_params.get("days", 30))
        except (TypeError, ValueError):
            days_filter = 30

        if platform_filter and platform_filter not in self.VALID_PLATFORMS:
            return Response({"error": "Invalid platform."}, status=status.HTTP_400_BAD_REQUEST)
        if status_filter and status_filter not in self.VALID_STATUSES:
            return Response({"error": "Invalid status."}, status=status.HTTP_400_BAD_REQUEST)

        # Base queryset — always scoped to this business
        qs = Content.objects.filter(business_id=business.business_id)

        if platform_filter:
            qs = qs.filter(platform=platform_filter)
        if status_filter:
            qs = qs.filter(status=status_filter)
        if days_filter > 0:
            qs = qs.filter(submitted_at__gte=timezone.now() - timedelta(days=days_filter))

        # Total views per platform (respects status + days filters, not platform filter
        # so the stats card always shows all platforms for context)
        stats_qs = Content.objects.filter(business_id=business.business_id)
        if status_filter:
            stats_qs = stats_qs.filter(status=status_filter)
        if days_filter > 0:
            stats_qs = stats_qs.filter(submitted_at__gte=timezone.now() - timedelta(days=days_filter))

        platform_totals = stats_qs.values("platform").annotate(total=Sum("views"))
        total_views = {row["platform"]: row["total"] for row in platform_totals}
        for p in self.VALID_PLATFORMS:
            total_views.setdefault(p, 0)

        # Platforms used by this business (unfiltered, for the tag pills)
        all_platforms = list(
            Content.objects.filter(business_id=business.business_id)
            .values_list("platform", flat=True)
            .distinct()
        )

        # Views over time (filtered)
        views_over_time = list(
            qs.annotate(date=TruncDate("submitted_at"))
            .values("date")
            .annotate(total=Sum("views"))
            .order_by("date")
            .values("date", "total")
        )

        # Creator submissions (filtered)
        submissions = qs.select_related("customer").order_by("-submitted_at")[:50]
        creators = [
            {
                "content_id": item.content_id,
                "name": (
                    f"{item.customer.customer_first_name} {item.customer.customer_last_name}".strip()
                    or item.customer.customer_email
                ),
                "platform": item.platform,
                "views": item.views,
                "content_url": item.content_url,
                "status": item.status,
                "submitted_at": item.submitted_at.isoformat(),
            }
            for item in submissions
        ]

        return Response(
            {
                "business_name": business.business_name,
                "platforms": all_platforms,
                "total_views": total_views,
                "views_over_time": [
                    {"date": row["date"].isoformat(), "views": row["total"]}
                    for row in views_over_time
                ],
                "creators": creators,
                "active_filters": {
                    "platform": platform_filter,
                    "status": status_filter,
                    "days": days_filter,
                },
            },
            status=status.HTTP_200_OK,
        )
