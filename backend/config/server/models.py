from django.db import models

# Create your models here.
class Voter(models.Model):
  class Gender(models.TextChoices):
    FEMALE = 'FE', 'Female'
    MALE = 'MA', 'Male'
    NOT_TO_SAY = 'NTS', 'Not to say'
  
  id = models.CharField(max_length=100, unique=True, primary_key=True)
  last_name = models.CharField(max_length=200, unique=True)
  given_name = models.CharField(max_length=200, unique=True)
  middle_name = models.CharField(max_length=200, unique=True)
  gender = models.CharField(max_length=200, unique=True)
  date_of_birth = models.DateField()
  place_of_birth = models.CharField(max_length=300)
  email_address = models.EmailField(max_length=200, unique=True)
  date_of_registration = models.DateTimeField(auto_now_add=True) 
  department = models.CharField(max_length=200, null=True, blank=True)
  
  def __str__(self):
    return self.voter_id
  
class Election(models.Model):
  id = models.CharField(max_length=100, unique=True, primary_key=True)
  name = models.CharField(max_length=100, unique=True)
  date_created = models.DateTimeField(auto_now_add=True) 
  date_start = models.DateTimeField() 
  date_end = models.DateTimeField() 
  
class Candidate(models.Model):
  id = models.CharField(max_length=100, unique=True, primary_key=True)
  name = models.CharField(max_length=100, unique=True)
  position = models.CharField(max_length=100)
  election = models.ForeignKey(Election, on_delete=models.CASCADE)  
  
class Contract(models.Model):
  election = models.ForeignKey(Election, on_delete=models.CASCADE)

class Votes(models.Model):
  id = models.CharField(max_length=100, unique=True, primary_key=True)
  