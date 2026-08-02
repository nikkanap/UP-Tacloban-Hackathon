from django.apps import AppConfig
from django.db.models.signals import post_migrate
import json
from os import getenv

class ServerConfig(AppConfig):
    name = 'server'
    
    def ready(self):
        post_migrate.connect(seed_data, sender=self, dispatch_uid="server_seed_data")

def get_admin_seed_users():
    configured_users = getenv("ADMIN_USERS")

    if configured_users:
        try:
            users = json.loads(configured_users)
        except json.JSONDecodeError:
            users = []

        if isinstance(users, list):
            return users

    return [
        {
            "username": getenv("SUPERUSER_NAME") or "admin",
            "password": getenv("SUPERUSER_PASSWORD") or "admin12345",
            "email": getenv("SUPERUSER_EMAIL") or "admin@smartelect.local",
        }
    ]

# Seed Django auth users used by the admin login.
def seed_data(sender, **kwargs):
    from django.contrib.auth import get_user_model
    
    User = get_user_model()

    for seed_user in get_admin_seed_users():
        username = str(seed_user.get("username") or "").strip()
        password = seed_user.get("password")
        email = str(seed_user.get("email") or "").strip()

        if not username or not password:
            continue

        user, created = User.objects.get_or_create(
            username=username,
            defaults={
                "email": email,
                "is_staff": True,
                "is_superuser": True,
            },
        )

        if created:
            user.set_password(password)
            user.save()
            continue

        changed = False
        if email and user.email != email:
            user.email = email
            changed = True
        if not user.is_staff:
            user.is_staff = True
            changed = True
        if not user.is_superuser:
            user.is_superuser = True
            changed = True
        if not user.has_usable_password() or not user.check_password(password):
            user.set_password(password)
            changed = True

        if changed:
            user.save()
