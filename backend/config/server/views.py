from django.shortcuts import render
from rest_framework import views, generics, viewsets, status
from . import models, serializers

# Create your views here.

class VotersViewSet(viewsets.ModelViewSet):
    queryset = models.Voter.objects.all()
    serializer_class = serializers.VoterSerializer
    #permission_classes = [ IsVoter ]


class ElectionsViewSet(viewsets.ModelViewSet):
    queryset = models.Election.objects.all()
    serializer_class = serializers.ElectionSerializer
    #permission_classes = [ IsAdmin ]


class ContractsViewSet(viewsets.ModelViewSet):
    queryset = models.Contract.objects.all()
    serializer_class = serializers.ContractSerializer
    #permission_classes = [ IsVoter ]


class CandidatesViewSet(viewsets.ModelViewSet):
    queryset = models.Candidate.objects.all()
    serializer_class = serializers.CandidateSerializer
    #permission_classes = [ IsAdmin ]
  