from django.urls import path

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

from .views import (
    RegisterView,
    ProfileView,
)


urlpatterns = [

    # ========================================================
    # REGISTER
    # ========================================================

    path(
        "register/",
        RegisterView.as_view(),
        name="register"
    ),

    # ========================================================
    # LOGIN
    # ========================================================

    path(
        "login/",
        TokenObtainPairView.as_view(),
        name="login"
    ),

    # ========================================================
    # REFRESH TOKEN
    # ========================================================

    path(
        "refresh/",
        TokenRefreshView.as_view(),
        name="refresh"
    ),

    # ========================================================
    # PROFILE
    # ========================================================

    path(
        "profile/",
        ProfileView.as_view(),
        name="profile"
    ),

]