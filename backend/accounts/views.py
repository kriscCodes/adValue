from django.contrib.auth import authenticate
from django.contrib.auth import get_user_model
from django.conf import settings
from django.db import IntegrityError
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from .models import Business, Content, SavedBusiness

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


class SavedBusinessesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        saved = SavedBusiness.objects.filter(customer=request.user).order_by("-created_at")
        return Response(
            {
                "saved_businesses": [
                    {
                        "id": item.saved_business_id,
                        "business_external_id": item.business_external_id,
                        "name": item.business_name,
                        "type": item.business_type,
                        "img": item.business_img,
                        "rating": item.business_rating,
                        "lat": item.business_lat,
                        "lng": item.business_lng,
                    }
                    for item in saved
                ]
            },
            status=status.HTTP_200_OK,
        )

    def post(self, request):
        business_external_id = request.data.get("business_external_id")
        business_name = request.data.get("name")

        if business_external_id is None or not business_name:
            return Response(
                {"error": "business_external_id and name are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            business_external_id = int(business_external_id)
        except (TypeError, ValueError):
            return Response(
                {"error": "business_external_id must be an integer."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            saved = SavedBusiness.objects.create(
                customer=request.user,
                business_external_id=business_external_id,
                business_name=business_name,
                business_type=request.data.get("type", ""),
                business_img=request.data.get("img", ""),
                business_rating=float(request.data.get("rating", 0) or 0),
                business_lat=float(request.data.get("lat", 0) or 0),
                business_lng=float(request.data.get("lng", 0) or 0),
            )
        except IntegrityError:
            return Response(
                {"message": "Business already saved."},
                status=status.HTTP_200_OK,
            )
        except (TypeError, ValueError):
            return Response(
                {"error": "Invalid numeric values for rating/lat/lng."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            {
                "id": saved.saved_business_id,
                "business_external_id": saved.business_external_id,
                "name": saved.business_name,
            },
            status=status.HTTP_201_CREATED,
        )

    def delete(self, request):
        business_external_id = request.data.get("business_external_id")
        if business_external_id is None:
            return Response(
                {"error": "business_external_id is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            business_external_id = int(business_external_id)
        except (TypeError, ValueError):
            return Response(
                {"error": "business_external_id must be an integer."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        deleted_count, _ = SavedBusiness.objects.filter(
            customer=request.user,
            business_external_id=business_external_id,
        ).delete()

        if deleted_count == 0:
            return Response({"message": "Saved business not found."}, status=status.HTTP_404_NOT_FOUND)

        return Response({"message": "Saved business removed."}, status=status.HTTP_200_OK)


class ContentSubmissionView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        submissions = Content.objects.filter(customer=request.user).order_by("-submitted_at")
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

    def post(self, request):
        business_id = request.data.get("business_id")
        business_title = (request.data.get("business_title") or "").strip()
        platform = request.data.get("platform")
        content_url = request.data.get("content_url")
        views = request.data.get("views")

        if (business_id is None and not business_title) or not platform or not content_url or views is None:
            return Response(
                {"error": "business_id or business_title, platform, content_url, and views are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if business_id is None and business_title:
            exact_match = Business.objects.filter(business_name__iexact=business_title).first()
            if exact_match:
                business_id = exact_match.business_id
            else:
                partial_matches = Business.objects.filter(business_name__icontains=business_title).order_by("business_id")
                match_count = partial_matches.count()
                if match_count == 1:
                    business_id = partial_matches.first().business_id
                elif match_count > 1:
                    return Response(
                        {"error": "Multiple businesses matched this title. Please submit with business_id."},
                        status=status.HTTP_400_BAD_REQUEST,
                    )
                else:
                    return Response(
                        {"error": "No business found for the provided business_title."},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

        try:
            business_id = int(business_id)
            views = int(views)
        except (TypeError, ValueError):
            return Response(
                {"error": "business_id and views must be integers."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if business_id < 0 or views < 0:
            return Response(
                {"error": "business_id and views must be non-negative integers."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        valid_platforms = {choice[0] for choice in Content.PlatformChoices.choices}
        if platform not in valid_platforms:
            return Response(
                {"error": "platform must be one of: tiktok, instagram, youtube."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        submission = Content.objects.create(
            customer=request.user,
            business_id=business_id,
            platform=platform,
            content_url=content_url,
            views=views,
            status=Content.StatusChoices.PENDING,
        )

        return Response(
            {
                "content_id": submission.content_id,
                "customer_id": submission.customer_id,
                "business_id": submission.business_id,
                "platform": submission.platform,
                "content_url": submission.content_url,
                "views": submission.views,
                "status": submission.status,
                "submitted_at": submission.submitted_at,
            },
            status=status.HTTP_201_CREATED,
        )