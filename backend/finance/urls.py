from django.urls import path

from .views import (
    CategoryView,
    CategoryDetailView,
    AddTransactionView,
    TransactionDetailView,
    BalanceView,
    BudgetView,
    BudgetDetailView,
    NotificationView,
    DashboardView,
)


urlpatterns = [

    # ============================================================
    # CATEGORIES
    # ============================================================

    path(
        "categories/",
        CategoryView.as_view(),
        name="categories"
    ),

    path(
        "categories/<int:id>/",
        CategoryDetailView.as_view(),
        name="category-detail"
    ),


    # ============================================================
    # TRANSACTIONS
    # ============================================================

    path(
        "transactions/",
        AddTransactionView.as_view(),
        name="transactions"
    ),

    path(
        "transactions/<int:id>/",
        TransactionDetailView.as_view(),
        name="transaction-detail"
    ),


    # ============================================================
    # ACCOUNT BALANCE
    # ============================================================

    path(
        "balance/",
        BalanceView.as_view(),
        name="balance"
    ),


    # ============================================================
    # BUDGETS
    # ============================================================

    path(
        "budgets/",
        BudgetView.as_view(),
        name="budgets"
    ),

    path(
        "budgets/<int:id>/",
        BudgetDetailView.as_view(),
        name="budget-detail"
    ),


    # ============================================================
    # NOTIFICATIONS
    # ============================================================

    path(
        "notifications/",
        NotificationView.as_view(),
        name="notifications"
    ),

    path(
        "notifications/<int:id>/",
        NotificationView.as_view(),
        name="notification-detail"
    ),


    # ============================================================
    # DASHBOARD
    # ============================================================

    path(
        "dashboard/",
        DashboardView.as_view(),
        name="dashboard"
    ),
]