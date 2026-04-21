from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    ContentSubmissionView,
    GoogleLoginView,
    LoginView,
    RegisterView,
    profileView,
    SavedBusinessesView,
)
from .business_views import (
    BusinessContentReviewView,
    BusinessSearchView,
    BusinessRegisterView,
    BusinessLoginView,
    BusinessProfileView,
)

urlpatterns = [
    # Customer auth
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),
    path("google/", GoogleLoginView.as_view(), name="google_login"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("profile/", profileView.as_view(), name="profile"),
    path("saved-businesses/", SavedBusinessesView.as_view(), name="saved_businesses"),
    path("content/submissions/", ContentSubmissionView.as_view(), name="content_submissions"),

    # Business auth
    path("business/register/", BusinessRegisterView.as_view(), name="business_register"),
    path("business/login/", BusinessLoginView.as_view(), name="business_login"),
    path("business/profile/", BusinessProfileView.as_view(), name="business_profile"),
    path("business/content-submissions/", BusinessContentReviewView.as_view(), name="business_content_submissions"),
    path("business/search/", BusinessSearchView.as_view(), name="business_search"),
]
