from rest_framework import serializers

from .models import (
    Category,
    Transaction,
    AccountBalance,
    Budget,
    Notification
)


class CategorySerializer(serializers.ModelSerializer):

    class Meta:
        model = Category

        fields = [
            "id",
            "name",
            "type",
            "created_at",
            "user"
        ]

        read_only_fields = [
            "id",
            "created_at",
            "user"
        ]


class TransactionSerializer(serializers.ModelSerializer):

    category_name = serializers.CharField(
        source="category.name",
        read_only=True
    )

    class Meta:
        model = Transaction

        fields = [
            "id",
            "category",
            "category_name",
            "amount",
            "transaction_type",
            "description",
            "transaction_date",
            "created_at",
            "user"
        ]

        read_only_fields = [
            "id",
            "created_at",
            "user",
            "category_name"
        ]

    def validate_category(self, category):

        request = self.context.get("request")

        if request:
            if category.user != request.user:
                raise serializers.ValidationError(
                    "You cannot use another user's category."
                )

        return category

    def validate(self, data):

        category = data.get(
            "category",
            getattr(self.instance, "category", None)
        )

        transaction_type = data.get(
            "transaction_type",
            getattr(self.instance, "transaction_type", None)
        )

        if category and transaction_type:
            if category.type != transaction_type:
                raise serializers.ValidationError(
                    {
                        "transaction_type":
                        "Transaction type must match category type."
                    }
                )

        return data



class AccountBalanceSerializer(serializers.ModelSerializer):

    class Meta:
        model = AccountBalance
        fields = "__all__"



class BudgetSerializer(serializers.ModelSerializer):

    category_name = serializers.CharField(
        source="category.name",
        read_only=True
    )

    category_type = serializers.CharField(
        source="category.type",
        read_only=True
    )

    class Meta:

        model = Budget

        fields = [
            "id",
            "limit_amount",
            "spent_amount",
            "remaining_amount",
            "month",
            "year",
            "category",
            "category_name",
            "category_type",
            "user",
        ]

        read_only_fields = [
            "id",
            "spent_amount",
            "remaining_amount",
            "user",
            "category_name",
            "category_type",
        ]

    def validate_category(self, category):

        request = self.context.get("request")

        if request:

            if category.user != request.user:

                raise serializers.ValidationError(
                    "You cannot create a budget for another user's category."
                )

        return category


class NotificationSerializer(serializers.ModelSerializer):

    class Meta:

        model = Notification

        fields = "__all__"