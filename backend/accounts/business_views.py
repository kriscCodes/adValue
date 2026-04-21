from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.db.models import Q

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
    from rest_framework_simplejwt.tokens import AccessToken as AT
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        return None

    raw_token = auth.split(" ")[1]

    def _resolve_business_id(token_obj):
        business_id = token_obj.get("business_id")
        if not business_id:
            return None
        token_type = token_obj.get("type")
        if token_type is not None and token_type != "business":
            return None
        return business_id

    try:
        access_token = AT(raw_token)
        business_id = _resolve_business_id(access_token)
        if business_id:
            return Business.objects.get(business_id=business_id)
    except Exception:
        pass

    # Backward/fault tolerance: allow refresh tokens from business auth flow as fallback.
    try:
        refresh_token = RefreshToken(raw_token)
        business_id = _resolve_business_id(refresh_token)
        if business_id:
            return Business.objects.get(business_id=business_id)
    except Exception:
        pass

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

        updatable = [
            "business_name", "business_owner_first_name", "business_owner_last_name",
            "business_description", "business_address", "google_place_id",
        ]
        for field in updatable:
            value = request.data.get(field)
            if value is not None:
                setattr(business, field, value)
        business.save()

        return Response({"message": "Profile updated."}, status=status.HTTP_200_OK)


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
