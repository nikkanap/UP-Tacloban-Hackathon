from rest_framework import serializers
from . import models


class VoterSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Voter
        fields = '__all__'


class ElectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Election
        fields = '__all__'


class ContractSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Contract
        fields = '__all__'


class CandidateSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Candidate
        fields = '__all__'