from django.shortcuts import render
from rest_framework import views, generics, viewsets, status
from rest_framework.response import Response
import json
import requests 
from os import getenv
from dotenv import load_dotenv

from . import models
from . import serializers


load_dotenv()
# Create your views here.

BLOCKCHAIN_API = getenv('BLOCKCHAIN_API')

class VotersViewSet(viewsets.ModelViewSet):
    queryset = models.Voter.objects.all()
    serializer_class = serializers.VoterSerializer
    #permission_classes = [ IsVoter ]


class ElectionsViewSet(viewsets.ModelViewSet):
  queryset = models.Election.objects.all()
  serializer_class = serializers.ElectionSerializer
  #permission_classes = [ IsAdmin ]
  
  # we create the election NFT + the voter NFTs
  def create(self, request, *args, **kwargs):
    # Create election first
    print("request.data =", request.data, flush=True)
    print("content_type =", request.content_type, flush=True)
    response = super().create(request, *args, **kwargs)

    # Get the created election object
    election_id = response.data["id"]
    election = models.Election.objects.get(id=election_id)

    election_cat =  self.create_election_nft(election)
    election.refresh_from_db()
    
    if not election_cat:
      return Response(
          {"error": "NFT category not generated"},
          status=status.HTTP_500_INTERNAL_SERVER_ERROR
      )

    return response

  def create_election_nft(self, election):
    try:
      print(1, flush=True)
      response = requests.post(
          f"{BLOCKCHAIN_API}/nft/generate-election-nft",
          json={
              "election_id": election.id
          },
          timeout=60
      )
      print(2, flush=True)
      
      response.raise_for_status()
      
      print(3, flush=True)
      data = response.json()

      print(
          f"Election NFT created for {election.id}",
          data
      )
      election.nft_category = data["result"]
      print(data['result'], flush=True)
      election.save()
      return election.nft_category

    except Exception as e:
      print(f"Failed to create election NFT: {e}")

class ContractsViewSet(viewsets.ModelViewSet):
    queryset = models.Contract.objects.all()
    serializer_class = serializers.ContractSerializer
    #permission_classes = [ IsVoter ]


class CandidatesViewSet(viewsets.ModelViewSet):
    queryset = models.Candidate.objects.all()
    serializer_class = serializers.CandidateSerializer
    #permission_classes = [ IsAdmin ]
    
    def create(self, request, *args, **kwargs):
        # Create election first
        response = super().create(request, *args, **kwargs)
    
        # Get the created election object
        candidate_id = response.data["id"]
        candidate = models.Candidate.objects.get(id=candidate_id)
        election = candidate.election
    
        self.create_candidate_nft(election, candidate)
        self.send_candidate_nft_to_contract(election, candidate)

        return response
    
    def create_candidate_nft(self, election, candidate):
        try:
            response = requests.post(
                f"{BLOCKCHAIN_API}/nft/generate-candidate-nft",
                json={
                    "nft_category": election.nft_category,
                    "candidate_id": candidate.id,
                    "position_id": candidate.position.id
                },
                timeout=60
            )

            response.raise_for_status()

            data = response.json()
            
            print(
                f"Created candidate NFT for {candidate.id}",
                data
            )

        except Exception as e:
            print(f"Failed creating candidate NFT for {candidate.id}: {e}")
    
    
    def send_candidate_nft_to_contract(self, election, candidate):
      try:
        response = requests.post(
            f"{BLOCKCHAIN_API}/nft/send-nft-to-contract",
            json={
              "nft_category": election.nft_category,
              "candidate_id": candidate.id,
              "open_time": int(election.date_start.timestamp()),
              "close_time": int(election.date_end.timestamp())
            },
            timeout=60
        )

        response.raise_for_status()

        data = response.json()
        
        print(
            f"Sent candidate NFT {candidate.id} to contract",
            data
        )

      except Exception as e:
        print(f"Failed creating candidate NFT for {candidate.id}: {e}")
                  
class PositionsViewSet(viewsets.ModelViewSet):
    queryset = models.Position.objects.all()
    serializer_class = serializers.PositionSerializer
  
class NFTsViewSet(viewsets.ModelViewSet):
    queryset = models.NFT.objects.all()
    serializer_class = serializers.NFTSerializer
    
class VotesViewSet(viewsets.ModelViewSet):
    queryset = models.Vote.objects.all()
    serializer_class = serializers.VoteSerializer
    
class CreateVoterNFTsView(views.APIView):
  
    def post(self, request):
        election_id = request.data.get("election_id")

        if not election_id:
            return Response(
                {"error": "election_id is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            election = models.Election.objects.get(id=election_id)
            print(election.nft_category, flush=True)
            
            voters = models.Voter.objects.all()
            positions = models.Position.objects.filter(election=election)

            for position in positions:
                for voter in voters:
                    response = requests.post(
                        f"{BLOCKCHAIN_API}/nft/generate-voter-nft",
                        json={
                            "nft_category": election.nft_category,
                            "voter_id": voter.id,
                            "position_id": position.id,
                        },
                        timeout=60
                    )

                    response.raise_for_status()

            return Response(
                {"success": True},
                status=status.HTTP_200_OK
            )

        except models.Election.DoesNotExist:
            return Response(
                {"error": "Election not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )