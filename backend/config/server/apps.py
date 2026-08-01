from django.apps import AppConfig
from django.db.models.signals import post_migrate
from os import getenv

class ServerConfig(AppConfig):
    name = 'server'
    
    def ready(self):
        post_migrate.connect(seed_data, sender=self)

# add superuser if none yet
def seed_data(sender, **kwargs):
    from django.contrib.auth import get_user_model
    from . import models
    
    User = get_user_model()
    if not User.objects.exists():
        User.objects.create_superuser(
            username=getenv('SUPERUSER_NAME'),
            password=getenv('SUPERUSER_PASSWORD'),
            email=getenv('SUPERUSER_EMAIL'),
        )