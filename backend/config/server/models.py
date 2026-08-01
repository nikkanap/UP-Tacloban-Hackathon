from django.db import models

# Create your models here.
class Voter(models.Model):
  class Gender(models.TextChoices):
    FEMALE = 'FE', 'Female'
    MALE = 'MA', 'Male'
    NOT_TO_SAY = 'NTS', 'Not to say'
  
  id = models.CharField(max_length=100, unique=True, primary_key=True)
  full_name = models.CharField(max_length=200)
  gender = models.CharField(max_length=3, choices=Gender.choices)
  date_of_birth = models.DateField()
  place_of_birth = models.CharField(max_length=300)
  email_address = models.EmailField(max_length=200, unique=True)
  date_of_registration = models.DateTimeField(auto_now_add=True) 
  
  def __str__(self):
    return f'{self.id}' 
  
class Election(models.Model):
  id = models.CharField(max_length=100, unique=True, primary_key=True)
  name = models.CharField(max_length=100, unique=True)
  date_created = models.DateTimeField(auto_now_add=True) 
  date_start = models.DateTimeField() 
  date_end = models.DateTimeField() 
  nft_category = models.CharField(max_length=100, null=True, blank=True) 
    
  def __str__(self):
      return self.name
  
class Position(models.Model):
  id = models.CharField(max_length=100, unique=True, primary_key=True)
  election = models.ForeignKey(Election, on_delete=models.CASCADE)
  name = models.CharField(max_length=100)
    
  def __str__(self):
    return f'{self.id}'  
  
class Candidate(models.Model):
  id = models.CharField(max_length=100, unique=True, primary_key=True)
  full_name = models.CharField(max_length=200)
  position = models.ForeignKey(Position, on_delete=models.CASCADE) 
  election = models.ForeignKey(Election, on_delete=models.CASCADE, related_name="candidates")   
  
  def __str__(self):
      return self.name
  
class Contract(models.Model):
  wallet_public_key = models.CharField(max_length=100)  
  election = models.ForeignKey(Election, on_delete=models.CASCADE)
  
  def __str__(self):
    return f'{self.id}'

class Vote(models.Model):
  voter = models.ForeignKey(Voter, on_delete=models.CASCADE)
  candidate = models.ForeignKey(Candidate, on_delete=models.CASCADE)
  election = models.ForeignKey(Election, on_delete=models.CASCADE, related_name='votes')
  vote_txid = models.CharField(max_length=100)
  date_voted = models.DateTimeField(auto_now_add=True)
    
  def __str__(self):
    return f'{self.id}'
  
class NFT(models.Model):
  id = models.CharField(max_length=100, unique=True, primary_key=True)
  user = models.ForeignKey(Voter, on_delete=models.CASCADE)
  election = models.ForeignKey(Election, on_delete=models.CASCADE)
    
  def __str__(self):
    return f'{self.id}'