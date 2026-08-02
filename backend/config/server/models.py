from django.db import models

# Create your models here.
class Voter(models.Model):
  class Gender(models.TextChoices):
    FEMALE = 'FE', 'Female'
    MALE = 'MA', 'Male'
    NOT_TO_SAY = 'NTS', 'Not to say'
  
  id = models.CharField(max_length=100, unique=True, primary_key=True)
  voter_key = models.CharField(max_length=100, null=True, blank=True)
  full_name = models.CharField(max_length=200, null=True, blank=True)
  gender = models.CharField(max_length=3, choices=Gender.choices, null=True, blank=True)
  date_of_birth = models.DateField(null=True, blank=True)
  place_of_birth = models.CharField(max_length=300, null=True, blank=True)
  email_address = models.EmailField(max_length=200, null=True, blank=True)
  date_of_registration = models.DateTimeField(auto_now_add=True, null=True, blank=True) 
  
  def __str__(self):
    return f'{self.id}' 
  
class Election(models.Model):
  id = models.CharField(max_length=100, unique=True, primary_key=True)
  name = models.CharField(max_length=100, unique=True, null=True, blank=True)
  date_created = models.DateTimeField(auto_now_add=True, null=True, blank=True) 
  date_start = models.DateTimeField(null=True, blank=True) 
  date_end = models.DateTimeField(null=True, blank=True) 
  nft_category = models.CharField(max_length=100, null=True, blank=True) 
    
  def __str__(self):
      return self.name
  
class Position(models.Model):
  id = models.CharField(max_length=100, unique=True, primary_key=True)
  election = models.ForeignKey(Election, on_delete=models.CASCADE, null=True, blank=True)
  name = models.CharField(max_length=100, null=True, blank=True)
    
  def __str__(self):
    return f'{self.id}'  
  
class Candidate(models.Model):
  id = models.CharField(max_length=100, unique=True, primary_key=True)
  full_name = models.CharField(max_length=200, null=True, blank=True)
  position = models.ForeignKey(Position, on_delete=models.CASCADE, null=True, blank=True) 
  election = models.ForeignKey(Election, on_delete=models.CASCADE, related_name="candidates", null=True, blank=True)   
  
  def __str__(self):
      return self.full_name or f'{self.id}'
  
class Contract(models.Model):
  wallet_public_key = models.CharField(max_length=100, null=True, blank=True)  
  election = models.ForeignKey(Election, on_delete=models.CASCADE, null=True, blank=True)
  
  def __str__(self):
    return f'{self.id}'

class Vote(models.Model):
  voter = models.ForeignKey(Voter, on_delete=models.CASCADE, null=True, blank=True)
  candidate = models.ForeignKey(Candidate, on_delete=models.CASCADE, null=True, blank=True)
  election = models.ForeignKey(Election, on_delete=models.CASCADE, related_name='votes', null=True, blank=True)
  vote_txid = models.CharField(max_length=100, null=True, blank=True)
  date_voted = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    
  def __str__(self):
    return f'{self.id}'
  
class NFT(models.Model):
  id = models.CharField(max_length=100, unique=True, primary_key=True)
  user = models.ForeignKey(Voter, on_delete=models.CASCADE, null=True, blank=True)
  election = models.ForeignKey(Election, on_delete=models.CASCADE, null=True, blank=True)
    
  def __str__(self):
    return f'{self.id}'
