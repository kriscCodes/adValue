from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Business


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
    try:
        token = AT(auth.split(" ")[1])
        if token.get("type") != "business":
            return None
        return Business.objects.get(business_id=token["business_id"])
    except Exception:
        return None


class BusinessRegisterView(APIView):
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


class BusinessProfileView(APIView):
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
