from django.contrib import admin
from .models import (
    Category,
    Transaction,
    AccountBalance,
    Budget,
    Notification
)


admin.site.register(Category)
admin.site.register(Transaction)
admin.site.register(AccountBalance)
admin.site.register(Budget)
admin.site.register(Notification)