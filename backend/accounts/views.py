from django.contrib.auth import authenticate
from django.contrib.auth import get_user_model
from django.conf import settings
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

# This fetched customer model
User = get_user_model() 

def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        "refresh": str(refresh),
        "access": str(refresh.access_token),
        "user": {"id": user.customer_id, "email": user.customer_email},
    }


class RegisterView(APIView):
    #allows anyone to access this view without authentication
    #so that ppl can register
    permission_classes = [AllowAny]

    #defines logic behind our post request when creating a user
    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")

        if not email or not password:
            return Response(
                {"error": "email and password required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if User.objects.filter(customer_email=email).exists():
            # Should replace this later so that instead of sedning a 400 it reroutes to our login page
            return Response(
                {"error": "A user with this email already exists."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = User.objects.create_user(
            customer_email=email,
            password=password,
            customer_first_name=request.data.get("first_name", ""),
            customer_last_name=request.data.get("last_name", ""),
        )

        return Response(get_tokens_for_user(user), status=status.HTTP_201_CREATED)


class LoginView(APIView):
    #same use as above but for login
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")

        if not email or not password:
            return Response(
                {"error": "email and password required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = authenticate(request, username=email, password=password)
        
        if user is None:
            google_user = User.objects.filter(customer_email=email, auth_provider="google").first()
            if google_user:
                return Response(
                    {"error": "This account uses Google sign-in. Please continue with Google."},
                    status=status.HTTP_401_UNAUTHORIZED,
                )
            return Response(
                {"error": "Invalid email or password."},
                status=status.HTTP_401_UNAUTHORIZED,
            )
            
        return Response(get_tokens_for_user(user))


class GoogleLoginView(APIView):

    permission_classes = [AllowAny]

    def post(self, request):
        #reject login for people who havent authetnicated with google yet but are trying to login
        google_id_token = request.data.get("id_token")
        if not google_id_token:
            return Response(
                {"error": "id_token is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        #for testing our auth was setup correctly
        if not settings.GOOGLE_CLIENT_ID:
            return Response(
                {"error": "Google auth is not configured on the server."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
        # generated JWT from google
        try:
            payload = id_token.verify_oauth2_token(
                google_id_token,
                google_requests.Request(),
                settings.GOOGLE_CLIENT_ID,
            )
        except ValueError:
            return Response(
                {"error": "Invalid Google token."},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        #get subject info from google and return error if any of these are missing
        email = payload.get("email")
        sub = payload.get("sub")
        if not email or not sub:
            return Response(
                {"error": "Google token is missing required claims."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if not payload.get("email_verified"):
            return Response(
                {"error": "Google account email is not verified."},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        # if exisitng populate user with their previous info other wise create user info based on google response/payload
        existing_google_user = User.objects.filter(google_subject_id=sub).first()
        if existing_google_user:
            user = existing_google_user
        else:
            defaults = {
                "customer_first_name": payload.get("given_name", ""),
                "customer_last_name": payload.get("family_name", ""),
                "auth_provider": "google",
                "google_subject_id": sub,
                "email_verified": bool(payload.get("email_verified")),
            }
            user, created = User.objects.get_or_create(customer_email=email, defaults=defaults)
            if created:
                user.set_unusable_password()
                user.save(update_fields=["password"])
            else:
                changed_fields = []
                if user.google_subject_id != sub:
                    user.google_subject_id = sub
                    changed_fields.append("google_subject_id")
                if user.auth_provider == "local":
                    user.auth_provider = "hybrid"
                    changed_fields.append("auth_provider")
                if payload.get("given_name") and not user.customer_first_name:
                    user.customer_first_name = payload.get("given_name")
                    changed_fields.append("customer_first_name")
                if payload.get("family_name") and not user.customer_last_name:
                    user.customer_last_name = payload.get("family_name")
                    changed_fields.append("customer_last_name")
                if not user.email_verified and payload.get("email_verified"):
                    user.email_verified = True
                    changed_fields.append("email_verified")
                if changed_fields:
                    user.save(update_fields=changed_fields)

        return Response(get_tokens_for_user(user), status=status.HTTP_200_OK)
   
class profileView(APIView):
    #Return the current authenticated user's info only if they are authenticated, to fill profile.
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            "id": user.customer_id,
            "email": user.customer_email,
            "first_name": user.customer_first_name,
            "last_name": user.customer_last_name,
            "location_enabled": user.location_enabled,
        })