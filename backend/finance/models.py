from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator


class Category(models.Model):

    CATEGORY_TYPES = (
        ('INCOME', 'Income'),
        ('EXPENSE', 'Expense'),
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE
    )

    name = models.CharField(
        max_length=100
    )

    type = models.CharField(
        max_length=10,
        choices=CATEGORY_TYPES
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )


    def __str__(self):
        return self.name



class Transaction(models.Model):

    TRANSACTION_TYPES = (
        ('INCOME', 'Income'),
        ('EXPENSE', 'Expense'),
    )


    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE
    )


    category = models.ForeignKey(
        Category,
        on_delete=models.CASCADE
    )


    amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[
            MinValueValidator(0)
        ]
    )


    transaction_type = models.CharField(
        max_length=10,
        choices=TRANSACTION_TYPES
    )


    description = models.TextField(
        blank=True
    )


    transaction_date = models.DateField()


    created_at = models.DateTimeField(
        auto_now_add=True
    )


    class Meta:
        ordering = [
            '-created_at'
        ]


    def __str__(self):
        return f"{self.transaction_type} {self.amount}"



class AccountBalance(models.Model):

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE
    )


    total_income = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
        validators=[
            MinValueValidator(0)
        ]
    )


    total_expense = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
        validators=[
            MinValueValidator(0)
        ]
    )


    current_balance = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
        validators=[
            MinValueValidator(0)
        ]
    )


    updated_at = models.DateTimeField(
        auto_now=True
    )


    def __str__(self):
        return self.user.username



class Budget(models.Model):

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE
    )


    category = models.ForeignKey(
        Category,
        on_delete=models.CASCADE
    )


    limit_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[
            MinValueValidator(0)
        ]
    )


    spent_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
        validators=[
            MinValueValidator(0)
        ]
    )


    remaining_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
        validators=[
            MinValueValidator(0)
        ]
    )


    month = models.IntegerField()


    year = models.IntegerField()


    created_at = models.DateTimeField(
        auto_now_add=True
    )


    updated_at = models.DateTimeField(
        auto_now=True
    )


    class Meta:

        unique_together = (
            "user",
            "category",
            "month",
            "year"
        )


    def __str__(self):
        return self.category.name



class Notification(models.Model):

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE
    )


    message = models.TextField()


    notification_type = models.CharField(
        max_length=50
    )


    is_read = models.BooleanField(
        default=False
    )


    created_at = models.DateTimeField(
        auto_now_add=True
    )


    def __str__(self):
        return self.message