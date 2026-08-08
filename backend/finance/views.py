from decimal import Decimal

from django.db import transaction
from django.db.models import Sum

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from drf_spectacular.utils import extend_schema

from .models import (
    Category,
    Transaction,
    AccountBalance,
    Budget,
    Notification,
)

from .serializers import (
    CategorySerializer,
    TransactionSerializer,
    AccountBalanceSerializer,
    BudgetSerializer,
    NotificationSerializer,
)


# ============================================================
# CATEGORY
# ============================================================

class CategoryView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        categories = Category.objects.filter(
            user=request.user
        )

        serializer = CategorySerializer(
            categories,
            many=True
        )

        return Response(serializer.data)

    @extend_schema(
        request=CategorySerializer,
        responses=CategorySerializer
    )
    def post(self, request):

        serializer = CategorySerializer(
            data=request.data
        )

        if serializer.is_valid():

            serializer.save(
                user=request.user
            )

            return Response(
                serializer.data,
                status=status.HTTP_201_CREATED
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


# ============================================================
# CATEGORY DETAIL
# ============================================================

class CategoryDetailView(APIView):

    permission_classes = [IsAuthenticated]

    @extend_schema(
        request=CategorySerializer,
        responses=CategorySerializer
    )
    def put(self, request, id):

        try:

            category = Category.objects.get(
                id=id,
                user=request.user
            )

        except Category.DoesNotExist:

            return Response(
                {
                    "error": "Category not found"
                },
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = CategorySerializer(
            category,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():

            serializer.save()

            return Response(
                serializer.data,
                status=status.HTTP_200_OK
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

    def delete(self, request, id):

        try:

            category = Category.objects.get(
                id=id,
                user=request.user
            )

        except Category.DoesNotExist:

            return Response(
                {
                    "error": "Category not found"
                },
                status=status.HTTP_404_NOT_FOUND
            )

        category.delete()

        return Response(
            {
                "message": "Category deleted successfully"
            },
            status=status.HTTP_200_OK
        )


# ============================================================
# TRANSACTIONS
# ============================================================

class AddTransactionView(APIView):

    permission_classes = [IsAuthenticated]

    # ========================================================
    # GET TRANSACTIONS
    # ========================================================

    def get(self, request):

        transactions = Transaction.objects.filter(
            user=request.user
        ).order_by("-created_at")

        transaction_type = request.query_params.get("type")

        if transaction_type:

            transactions = transactions.filter(
                transaction_type=transaction_type
            )

        category = request.query_params.get("category")

        if category:

            transactions = transactions.filter(
                category_id=category
            )

        serializer = TransactionSerializer(
            transactions,
            many=True
        )

        return Response(serializer.data)

    # ========================================================
    # ADD TRANSACTION
    # ========================================================

    @extend_schema(
        request=TransactionSerializer,
        responses=TransactionSerializer
    )
    @transaction.atomic
    def post(self, request):

        # ----------------------------------------------------
        # VALIDATE TRANSACTION
        # ----------------------------------------------------

        serializer = TransactionSerializer(
            data=request.data,
            context={
                "request": request
            }
        )

        if not serializer.is_valid():

            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )

        amount = serializer.validated_data["amount"]

        transaction_type = serializer.validated_data[
            "transaction_type"
        ]

        transaction_date = serializer.validated_data[
            "transaction_date"
        ]

        category = serializer.validated_data[
            "category"
        ]

        # ----------------------------------------------------
        # ACCOUNT BALANCE
        # ----------------------------------------------------

        balance, created = AccountBalance.objects.get_or_create(
            user=request.user
        )

        # ----------------------------------------------------
        # EXPENSE BALANCE CHECK
        # ----------------------------------------------------

        if transaction_type == "EXPENSE":

            if balance.current_balance < amount:

                message = (
                    f"Insufficient balance for "
                    f"{category.name} expense. "
                    f"You tried to spend "
                    f"{amount:.2f} ETB, "
                    f"but your current balance is "
                    f"{balance.current_balance:.2f} ETB."
                )

                Notification.objects.create(
                    user=request.user,
                    message=message,
                    notification_type="BALANCE"
                )

                return Response(
                    {
                        "error": message
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

        # ----------------------------------------------------
        # SAVE TRANSACTION
        # ----------------------------------------------------

        transaction_obj = serializer.save(
            user=request.user
        )

        # ----------------------------------------------------
        # INCOME
        # ----------------------------------------------------

        if transaction_type == "INCOME":

            balance.total_income += amount

            balance.current_balance += amount

        # ----------------------------------------------------
        # EXPENSE
        # ----------------------------------------------------

        else:

            balance.total_expense += amount

            balance.current_balance -= amount

            # ------------------------------------------------
            # FIND BUDGET
            # ------------------------------------------------

            budget = Budget.objects.filter(
                user=request.user,
                category=category,
                month=transaction_date.month,
                year=transaction_date.year
            ).first()

            # ------------------------------------------------
            # UPDATE BUDGET
            # ------------------------------------------------

            if budget:

                old_spent = budget.spent_amount

                budget.spent_amount += amount

                budget.remaining_amount = (
                    budget.limit_amount
                    - budget.spent_amount
                )

                budget.save()

                # --------------------------------------------
                # BUDGET NOTIFICATION
                # --------------------------------------------

                crossed_limit = (
                    old_spent < budget.limit_amount
                    and
                    budget.spent_amount >= budget.limit_amount
                )

                if crossed_limit:

                    if budget.spent_amount > budget.limit_amount:

                        exceeded_amount = (
                            budget.spent_amount
                            - budget.limit_amount
                        )

                        message = (
                            f"{budget.category.name} budget "
                            f"exceeded by "
                            f"{exceeded_amount:.2f} ETB. "
                            f"You have spent "
                            f"{budget.spent_amount:.2f} ETB "
                            f"out of "
                            f"{budget.limit_amount:.2f} ETB."
                        )

                    else:

                        message = (
                            f"{budget.category.name} budget "
                            f"limit has been reached. "
                            f"You have spent "
                            f"{budget.spent_amount:.2f} ETB "
                            f"out of "
                            f"{budget.limit_amount:.2f} ETB."
                        )

                    Notification.objects.create(
                        user=request.user,
                        message=message,
                        notification_type="BUDGET"
                    )

        # ----------------------------------------------------
        # SAVE BALANCE
        # ----------------------------------------------------

        balance.save()

        # ----------------------------------------------------
        # RESPONSE
        # ----------------------------------------------------

        return Response(
            TransactionSerializer(
                transaction_obj
            ).data,
            status=status.HTTP_201_CREATED
        )


# ============================================================
# TRANSACTION DETAIL
# ============================================================

class TransactionDetailView(APIView):

    permission_classes = [IsAuthenticated]

    # ========================================================
    # UPDATE TRANSACTION
    # ========================================================

    @extend_schema(
        request=TransactionSerializer,
        responses=TransactionSerializer
    )
    @transaction.atomic
    def put(self, request, id):

        # ----------------------------------------------------
        # FIND TRANSACTION
        # ----------------------------------------------------

        try:

            transaction_obj = Transaction.objects.get(
                id=id,
                user=request.user
            )

        except Transaction.DoesNotExist:

            return Response(
                {
                    "error": "Transaction not found"
                },
                status=status.HTTP_404_NOT_FOUND
            )

        # ----------------------------------------------------
        # OLD VALUES
        # ----------------------------------------------------

        old_amount = transaction_obj.amount

        old_type = transaction_obj.transaction_type

        old_category = transaction_obj.category

        old_date = transaction_obj.transaction_date

        # ----------------------------------------------------
        # VALIDATE NEW DATA
        # ----------------------------------------------------

        serializer = TransactionSerializer(
            transaction_obj,
            data=request.data,
            partial=True,
            context={
                "request": request
            }
        )

        if not serializer.is_valid():

            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )

        # ----------------------------------------------------
        # NEW VALUES
        # ----------------------------------------------------

        new_amount = serializer.validated_data.get(
            "amount",
            old_amount
        )

        new_type = serializer.validated_data.get(
            "transaction_type",
            old_type
        )

        new_category = serializer.validated_data.get(
            "category",
            old_category
        )

        new_date = serializer.validated_data.get(
            "transaction_date",
            old_date
        )

        # ----------------------------------------------------
        # ACCOUNT BALANCE
        # ----------------------------------------------------

        balance, created = AccountBalance.objects.get_or_create(
            user=request.user
        )

        # ----------------------------------------------------
        # REVERSE OLD TRANSACTION
        # ----------------------------------------------------

        if old_type == "INCOME":

            balance.total_income -= old_amount

            balance.current_balance -= old_amount

        else:

            balance.total_expense -= old_amount

            balance.current_balance += old_amount

        # ----------------------------------------------------
        # REVERSE OLD BUDGET
        # ----------------------------------------------------

        if old_type == "EXPENSE":

            old_budget = Budget.objects.filter(
                user=request.user,
                category=old_category,
                month=old_date.month,
                year=old_date.year
            ).first()

            if old_budget:

                old_budget.spent_amount -= old_amount

                if old_budget.spent_amount < Decimal("0.00"):

                    old_budget.spent_amount = Decimal("0.00")

                old_budget.remaining_amount = (
                    old_budget.limit_amount
                    - old_budget.spent_amount
                )

                old_budget.save()

        # ----------------------------------------------------
        # CHECK NEW EXPENSE BALANCE
        # ----------------------------------------------------

        if new_type == "EXPENSE":

            if balance.current_balance < new_amount:

                message = (
                    f"Insufficient balance for "
                    f"{new_category.name} expense. "
                    f"Your current balance is "
                    f"{balance.current_balance:.2f} ETB."
                )

                Notification.objects.create(
                    user=request.user,
                    message=message,
                    notification_type="BALANCE"
                )

                return Response(
                    {
                        "error": message
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

        # ----------------------------------------------------
        # SAVE UPDATED TRANSACTION
        # ----------------------------------------------------

        updated_transaction = serializer.save()

        # ----------------------------------------------------
        # APPLY NEW BALANCE
        # ----------------------------------------------------

        if new_type == "INCOME":

            balance.total_income += new_amount

            balance.current_balance += new_amount

        else:

            balance.total_expense += new_amount

            balance.current_balance -= new_amount

        # ----------------------------------------------------
        # APPLY NEW BUDGET
        # ----------------------------------------------------

        if new_type == "EXPENSE":

            new_budget = Budget.objects.filter(
                user=request.user,
                category=new_category,
                month=new_date.month,
                year=new_date.year
            ).first()

            if new_budget:

                old_spent = new_budget.spent_amount

                new_budget.spent_amount += new_amount

                new_budget.remaining_amount = (
                    new_budget.limit_amount
                    - new_budget.spent_amount
                )

                new_budget.save()

                # --------------------------------------------
                # BUDGET NOTIFICATION
                # --------------------------------------------

                crossed_limit = (
                    old_spent < new_budget.limit_amount
                    and
                    new_budget.spent_amount >= new_budget.limit_amount
                )

                if crossed_limit:

                    if new_budget.spent_amount > new_budget.limit_amount:

                        exceeded_amount = (
                            new_budget.spent_amount
                            - new_budget.limit_amount
                        )

                        message = (
                            f"{new_budget.category.name} budget "
                            f"exceeded by "
                            f"{exceeded_amount:.2f} ETB. "
                            f"You have spent "
                            f"{new_budget.spent_amount:.2f} ETB "
                            f"out of "
                            f"{new_budget.limit_amount:.2f} ETB."
                        )

                    else:

                        message = (
                            f"{new_budget.category.name} budget "
                            f"limit has been reached. "
                            f"You have spent "
                            f"{new_budget.spent_amount:.2f} ETB "
                            f"out of "
                            f"{new_budget.limit_amount:.2f} ETB."
                        )

                    Notification.objects.create(
                        user=request.user,
                        message=message,
                        notification_type="BUDGET"
                    )

        # ----------------------------------------------------
        # SAVE BALANCE
        # ----------------------------------------------------

        balance.save()

        return Response(
            TransactionSerializer(
                updated_transaction
            ).data,
            status=status.HTTP_200_OK
        )

    # ========================================================
    # DELETE TRANSACTION
    # ========================================================

    @transaction.atomic
    def delete(self, request, id):

        # ----------------------------------------------------
        # FIND TRANSACTION
        # ----------------------------------------------------

        try:

            transaction_obj = Transaction.objects.get(
                id=id,
                user=request.user
            )

        except Transaction.DoesNotExist:

            return Response(
                {
                    "error": "Transaction not found"
                },
                status=status.HTTP_404_NOT_FOUND
            )

        # ----------------------------------------------------
        # ACCOUNT BALANCE
        # ----------------------------------------------------

        balance, created = AccountBalance.objects.get_or_create(
            user=request.user
        )

        # ----------------------------------------------------
        # REVERSE BALANCE
        # ----------------------------------------------------

        if transaction_obj.transaction_type == "INCOME":

            balance.total_income -= transaction_obj.amount

            balance.current_balance -= transaction_obj.amount

        else:

            balance.total_expense -= transaction_obj.amount

            balance.current_balance += transaction_obj.amount

        balance.save()

        # ----------------------------------------------------
        # REVERSE BUDGET
        # ----------------------------------------------------

        if transaction_obj.transaction_type == "EXPENSE":

            budget = Budget.objects.filter(
                user=request.user,
                category=transaction_obj.category,
                month=transaction_obj.transaction_date.month,
                year=transaction_obj.transaction_date.year
            ).first()

            if budget:

                budget.spent_amount -= transaction_obj.amount

                if budget.spent_amount < Decimal("0.00"):

                    budget.spent_amount = Decimal("0.00")

                budget.remaining_amount = (
                    budget.limit_amount
                    - budget.spent_amount
                )

                budget.save()

        # ----------------------------------------------------
        # DELETE TRANSACTION
        # ----------------------------------------------------

        transaction_obj.delete()

        return Response(
            {
                "message": "Transaction deleted successfully"
            },
            status=status.HTTP_200_OK
        )


# ============================================================
# ACCOUNT BALANCE
# ============================================================

class BalanceView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        balance, created = AccountBalance.objects.get_or_create(
            user=request.user
        )

        serializer = AccountBalanceSerializer(
            balance
        )

        return Response(
            serializer.data
        )


# ============================================================
# BUDGET
# ============================================================

class BudgetView(APIView):

    permission_classes = [IsAuthenticated]

    # ========================================================
    # CREATE BUDGET
    # ========================================================

    @extend_schema(
        request=BudgetSerializer,
        responses=BudgetSerializer
    )
    def post(self, request):

        serializer = BudgetSerializer(
            data=request.data,
            context={
                "request": request
            }
        )

        if not serializer.is_valid():

            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )

        limit_amount = serializer.validated_data[
            "limit_amount"
        ]

        category = serializer.validated_data[
            "category"
        ]

        month = serializer.validated_data[
            "month"
        ]

        year = serializer.validated_data[
            "year"
        ]

        # ----------------------------------------------------
        # CALCULATE ACTUAL SPENDING
        # ----------------------------------------------------

        spent_amount = (
            Transaction.objects
            .filter(
                user=request.user,
                category=category,
                transaction_type="EXPENSE",
                transaction_date__month=month,
                transaction_date__year=year
            )
            .aggregate(
                total=Sum("amount")
            )["total"]
            or Decimal("0.00")
        )

        # ----------------------------------------------------
        # CALCULATE REMAINING
        # ----------------------------------------------------

        remaining_amount = (
            limit_amount - spent_amount
        )

        # ----------------------------------------------------
        # CREATE BUDGET
        # ----------------------------------------------------

        budget = serializer.save(
            user=request.user,
            spent_amount=spent_amount,
            remaining_amount=remaining_amount
        )

        # ----------------------------------------------------
        # BUDGET ALREADY REACHED / EXCEEDED
        # ----------------------------------------------------

        if spent_amount >= limit_amount:

            if spent_amount > limit_amount:

                exceeded_amount = (
                    spent_amount - limit_amount
                )

                message = (
                    f"{category.name} budget has already "
                    f"been exceeded by "
                    f"{exceeded_amount:.2f} ETB. "
                    f"You have spent "
                    f"{spent_amount:.2f} ETB out of "
                    f"{limit_amount:.2f} ETB."
                )

            else:

                message = (
                    f"{category.name} budget limit has "
                    f"already been reached. "
                    f"You have spent "
                    f"{spent_amount:.2f} ETB out of "
                    f"{limit_amount:.2f} ETB."
                )

            Notification.objects.create(
                user=request.user,
                message=message,
                notification_type="BUDGET"
            )

        return Response(
            BudgetSerializer(
                budget
            ).data,
            status=status.HTTP_201_CREATED
        )

    # ========================================================
    # GET BUDGETS
    # ========================================================

    def get(self, request):

        budgets = Budget.objects.filter(
            user=request.user
        ).order_by(
            "-year",
            "-month",
            "-created_at"
        )

        serializer = BudgetSerializer(
            budgets,
            many=True
        )

        return Response(
            serializer.data
        )


# ============================================================
# BUDGET DETAIL
# ============================================================

class BudgetDetailView(APIView):

    permission_classes = [IsAuthenticated]

    # ========================================================
    # UPDATE BUDGET
    # ========================================================

    @extend_schema(
        request=BudgetSerializer,
        responses=BudgetSerializer
    )
    def put(self, request, id):

        try:

            budget = Budget.objects.get(
                id=id,
                user=request.user
            )

        except Budget.DoesNotExist:

            return Response(
                {
                    "error": "Budget not found"
                },
                status=status.HTTP_404_NOT_FOUND
            )

        # ----------------------------------------------------
        # OLD VALUES
        # ----------------------------------------------------

        old_limit = budget.limit_amount

        # ----------------------------------------------------
        # VALIDATE
        # ----------------------------------------------------

        serializer = BudgetSerializer(
            budget,
            data=request.data,
            partial=True,
            context={
                "request": request
            }
        )

        if not serializer.is_valid():

            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )

        # ----------------------------------------------------
        # SAVE BASIC CHANGES
        # ----------------------------------------------------

        updated_budget = serializer.save()

        # ----------------------------------------------------
        # RECALCULATE SPENDING
        # ----------------------------------------------------

        spent_amount = (
            Transaction.objects
            .filter(
                user=request.user,
                category=updated_budget.category,
                transaction_type="EXPENSE",
                transaction_date__month=updated_budget.month,
                transaction_date__year=updated_budget.year
            )
            .aggregate(
                total=Sum("amount")
            )["total"]
            or Decimal("0.00")
        )

        updated_budget.spent_amount = spent_amount

        updated_budget.remaining_amount = (
            updated_budget.limit_amount
            - updated_budget.spent_amount
        )

        updated_budget.save()

        # ----------------------------------------------------
        # NOTIFY IF NEW LIMIT IS REACHED
        # ----------------------------------------------------

        if (
            spent_amount >= updated_budget.limit_amount
            and
            old_limit > updated_budget.limit_amount
        ):

            if spent_amount > updated_budget.limit_amount:

                exceeded_amount = (
                    spent_amount
                    - updated_budget.limit_amount
                )

                message = (
                    f"{updated_budget.category.name} budget "
                    f"has been exceeded by "
                    f"{exceeded_amount:.2f} ETB. "
                    f"You have spent "
                    f"{spent_amount:.2f} ETB out of "
                    f"{updated_budget.limit_amount:.2f} ETB."
                )

            else:

                message = (
                    f"{updated_budget.category.name} budget "
                    f"limit has been reached. "
                    f"You have spent "
                    f"{spent_amount:.2f} ETB out of "
                    f"{updated_budget.limit_amount:.2f} ETB."
                )

            Notification.objects.create(
                user=request.user,
                message=message,
                notification_type="BUDGET"
            )

        return Response(
            BudgetSerializer(
                updated_budget
            ).data,
            status=status.HTTP_200_OK
        )

    # ========================================================
    # DELETE BUDGET
    # ========================================================

    def delete(self, request, id):

        try:

            budget = Budget.objects.get(
                id=id,
                user=request.user
            )

        except Budget.DoesNotExist:

            return Response(
                {
                    "error": "Budget not found"
                },
                status=status.HTTP_404_NOT_FOUND
            )

        budget.delete()

        return Response(
            {
                "message": "Budget deleted successfully"
            },
            status=status.HTTP_200_OK
        )


# ============================================================
# NOTIFICATIONS
# ============================================================

class NotificationView(APIView):

    permission_classes = [IsAuthenticated]

    # ========================================================
    # GET NOTIFICATIONS
    # ========================================================

    def get(self, request, id=None):

        # ----------------------------------------------------
        # SINGLE NOTIFICATION
        # ----------------------------------------------------

        if id is not None:

            try:

                notification = Notification.objects.get(
                    id=id,
                    user=request.user
                )

            except Notification.DoesNotExist:

                return Response(
                    {
                        "error": "Notification not found."
                    },
                    status=status.HTTP_404_NOT_FOUND
                )

            serializer = NotificationSerializer(
                notification
            )

            return Response(
                serializer.data
            )

        # ----------------------------------------------------
        # ALL NOTIFICATIONS
        # ----------------------------------------------------

        notifications = Notification.objects.filter(
            user=request.user
        ).order_by(
            "-created_at"
        )

        serializer = NotificationSerializer(
            notifications,
            many=True
        )

        return Response(
            serializer.data
        )

    # ========================================================
    # CREATE NOTIFICATION
    # ========================================================

    def post(self, request):

        serializer = NotificationSerializer(
            data=request.data
        )

        if serializer.is_valid():

            serializer.save(
                user=request.user
            )

            return Response(
                serializer.data,
                status=status.HTTP_201_CREATED
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

    # ========================================================
    # UPDATE NOTIFICATION
    # ========================================================

    def put(self, request, id=None):

        if id is None:

            return Response(
                {
                    "error": "Notification ID is required."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        try:

            notification = Notification.objects.get(
                id=id,
                user=request.user
            )

        except Notification.DoesNotExist:

            return Response(
                {
                    "error": "Notification not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = NotificationSerializer(
            notification,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():

            serializer.save()

            return Response(
                serializer.data,
                status=status.HTTP_200_OK
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

    # ========================================================
    # DELETE NOTIFICATION
    # ========================================================

    def delete(self, request, id=None):

        if id is None:

            return Response(
                {
                    "error": "Notification ID is required."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        try:

            notification = Notification.objects.get(
                id=id,
                user=request.user
            )

        except Notification.DoesNotExist:

            return Response(
                {
                    "error": "Notification not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        notification.delete()

        return Response(
            status=status.HTTP_204_NO_CONTENT
        )


# ============================================================
# DASHBOARD
# ============================================================

class DashboardView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        # ====================================================
        # ACCOUNT BALANCE
        # ====================================================

        balance, created = AccountBalance.objects.get_or_create(
            user=request.user
        )

        # ====================================================
        # EXPENSES BY CATEGORY
        # ====================================================

        expenses = (
            Transaction.objects
            .filter(
                user=request.user,
                transaction_type="EXPENSE"
            )
            .values(
                "category__name"
            )
            .annotate(
                total=Sum("amount")
            )
            .order_by("-total")
        )

        # ====================================================
        # RECENT TRANSACTIONS
        # ====================================================

        recent_transactions = (
            Transaction.objects
            .filter(
                user=request.user
            )
            .select_related(
                "category"
            )
            .order_by(
                "-created_at"
            )[:5]
        )

        recent_transactions_data = []

        for transaction_obj in recent_transactions:

            recent_transactions_data.append({

                "id":
                    transaction_obj.id,

                "transaction_type":
                    transaction_obj.transaction_type,

                "category":
                    transaction_obj.category.name,

                "amount":
                    transaction_obj.amount,

                "description":
                    transaction_obj.description,

                "transaction_date":
                    transaction_obj.transaction_date,
            })

        # ====================================================
        # BUDGETS
        # ====================================================

        budgets = (
            Budget.objects
            .filter(
                user=request.user
            )
            .select_related(
                "category"
            )
            .order_by(
                "-year",
                "-month",
                "-created_at"
            )
        )

        budgets_data = []

        for budget in budgets:

            # ------------------------------------------------
            # ACTUAL SPENDING
            # ------------------------------------------------

            spent_amount = (
                Transaction.objects
                .filter(
                    user=request.user,
                    category=budget.category,
                    transaction_type="EXPENSE",
                    transaction_date__month=budget.month,
                    transaction_date__year=budget.year
                )
                .aggregate(
                    total=Sum("amount")
                )["total"]
                or Decimal("0.00")
            )

            # ------------------------------------------------
            # REMAINING
            # ------------------------------------------------

            remaining_amount = (
                budget.limit_amount
                - spent_amount
            )

            # ------------------------------------------------
            # PERCENTAGE
            # ------------------------------------------------

            if budget.limit_amount > 0:

                percentage_used = (
                    spent_amount
                    / budget.limit_amount
                ) * Decimal("100")

            else:

                percentage_used = Decimal("0.00")

            # ------------------------------------------------
            # DISPLAY PERCENTAGE
            # ------------------------------------------------

            display_percentage = max(
                Decimal("0.00"),
                min(
                    percentage_used,
                    Decimal("100.00")
                )
            )

            # ------------------------------------------------
            # EXCEEDED
            # ------------------------------------------------

            is_exceeded = (
                spent_amount
                >= budget.limit_amount
            )

            budgets_data.append({

                "id":
                    budget.id,

                "category":
                    budget.category.name,

                "category_id":
                    budget.category.id,

                "month":
                    budget.month,

                "year":
                    budget.year,

                "limit_amount":
                    budget.limit_amount,

                "spent_amount":
                    spent_amount,

                "remaining_amount":
                    remaining_amount,

                "percentage_used":
                    round(
                        percentage_used,
                        2
                    ),

                "display_percentage":
                    round(
                        display_percentage,
                        2
                    ),

                "is_exceeded":
                    is_exceeded,
            })

        # ====================================================
        # NOTIFICATIONS
        # ====================================================

        notifications = (
            Notification.objects
            .filter(
                user=request.user
            )
            .order_by(
                "-created_at"
            )[:10]
        )

        notifications_data = []

        for notification in notifications:

            notification_data = {

                "id":
                    notification.id,

                "message":
                    notification.message,

                "notification_type":
                    notification.notification_type,

                "created_at":
                    notification.created_at,
            }

            # Add is_read only if model contains it

            if hasattr(notification, "is_read"):

                notification_data["is_read"] = (
                    notification.is_read
                )

            notifications_data.append(
                notification_data
            )

        # ====================================================
        # UNREAD NOTIFICATIONS
        # ====================================================

        unread_notifications = 0

        if hasattr(Notification, "is_read"):

            unread_notifications = (
                Notification.objects
                .filter(
                    user=request.user,
                    is_read=False
                )
                .count()
            )

        # ====================================================
        # TOTAL TRANSACTIONS
        # ====================================================

        total_transactions = (
            Transaction.objects
            .filter(
                user=request.user
            )
            .count()
        )

        # ====================================================
        # DASHBOARD RESPONSE
        # ====================================================

        data = {

            "total_income":
                balance.total_income,

            "total_expense":
                balance.total_expense,

            "current_balance":
                balance.current_balance,

            "total_transactions":
                total_transactions,

            "expense_categories":
                expenses,

            "recent_transactions":
                recent_transactions_data,

            "budgets":
                budgets_data,

            "total_budgets":
                len(budgets_data),

            "notifications":
                notifications_data,

            "unread_notifications":
                unread_notifications,
        }

        return Response(
            data,
            status=status.HTTP_200_OK
        )