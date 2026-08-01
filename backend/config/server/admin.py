from django.contrib import admin
from . import models

# Register your models here.

admin.site.register(models.Voter)
admin.site.register(models.Election)
admin.site.register(models.Position)
admin.site.register(models.Candidate)
admin.site.register(models.Contract)
admin.site.register(models.NFT)
admin.site.register(models.Vote)
