import hmac
from hashlib import sha256

from django.conf import settings
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


class PositionSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Position
        fields = '__all__'


class VoteSerializer(serializers.ModelSerializer):
    # The tally is public; who cast which ballot is not. The voter is accepted
    # on write but never returned, so /votes/ cannot be read as a record of how
    # each person voted.
    voter = serializers.PrimaryKeyRelatedField(
        queryset=models.Voter.objects.all(),
        write_only=True,
    )
    ballot_ref = serializers.SerializerMethodField()

    class Meta:
        model = models.Vote
        fields = [
            'id',
            'voter',
            'ballot_ref',
            'candidate',
            'election',
            'vote_txid',
            'date_voted',
        ]
        # The txid is whatever the chain returned. A client must never be able
        # to supply or overwrite its own proof of voting.
        read_only_fields = ['vote_txid', 'date_voted']

    def get_ballot_ref(self, vote):
        """Opaque, stable handle for one voter's ballot in one election.

        Turnout has to count distinct voters (a voter casts one row per
        position), which needs *something* stable per voter. Keying the digest
        to SECRET_KEY prevents recovering the voter: an electorate is small
        enough that an unsalted hash of every voter id could just be
        enumerated.
        """
        message = f'{vote.election_id}:{vote.voter_id}'.encode()
        digest = hmac.new(settings.SECRET_KEY.encode(), message, sha256)
        return digest.hexdigest()[:16]


class NFTSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.NFT
        fields = '__all__'