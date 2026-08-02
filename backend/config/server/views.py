from django.shortcuts import render
from django.contrib.auth import authenticate
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
MAX_UINT64 = (2 ** 64) - 1

def validate_uint64_id(value, label):
    value = str(value).strip()

    if not value.isdigit():
        raise ValueError(f"{label} must be a numeric ID for blockchain NFT commitments")

    if int(value) > MAX_UINT64:
        raise ValueError(f"{label} must fit inside uint64")

    return value

def parse_blockchain_response(response):
    try:
        data = response.json()
    except ValueError:
        data = response.text

    if response.status_code >= 400:
        if isinstance(data, dict):
            message = data.get("error") or data.get("detail") or data
            details = data.get("details")
            if details:
                message = f"{message}: {'; '.join(details)}"
        else:
            message = data

        raise RuntimeError(f"Blockchain request failed ({response.status_code}): {message}")

    return data

def extract_txid(value):
    if isinstance(value, dict):
        value = value.get("txid") or value.get("txId")

    value = str(value or "").strip()

    if len(value) != 64:
        raise RuntimeError(f"Blockchain response did not include a valid txid: {value}")

    return value

def create_voter_nfts_for_position(election, position):
    return create_voter_nfts_for_voters(election, position, models.Voter.objects.all())

def create_voter_nfts_for_voters(election, position, voters):
    if not BLOCKCHAIN_API:
        raise RuntimeError("BLOCKCHAIN_API is not configured")

    if not election.nft_category:
        raise RuntimeError("Election NFT category is not generated")

    validate_uint64_id(position.id, "position_id")

    created = []

    for voter in voters:
        validate_uint64_id(voter.id, "voter_id")
        response = requests.post(
            f"{BLOCKCHAIN_API}/nft/generate-voter-nft",
            json={
                "nft_category": election.nft_category,
                "voter_id": voter.id,
                "position_id": position.id,
            },
            timeout=60
        )

        created.append({
            "voter_id": voter.id,
            "position_id": position.id,
            "response": parse_blockchain_response(response),
        })

    return created

class VotersViewSet(viewsets.ModelViewSet):
    queryset = models.Voter.objects.all()
    serializer_class = serializers.VoterSerializer
    #permission_classes = [ IsVoter ]

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        voter = models.Voter.objects.get(id=response.data["id"])
        positions = (
            models.Position.objects
            .select_related("election")
            .filter(election__nft_category__isnull=False)
            .exclude(election__nft_category="")
        )
        created_nfts = []

        try:
            for position in positions:
                created_nfts.extend(
                    create_voter_nfts_for_voters(
                        position.election,
                        position,
                        [voter]
                    )
                )
        except Exception as e:
            return Response(
                {
                    "error": f"Voter created but failed to create voter NFTs: {e}",
                    "voter": response.data,
                    "voter_nfts_created": len(created_nfts),
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        response.data["voter_nfts_created"] = len(created_nfts)
        return response

class LoginVoter(views.APIView):
    def post(self, request):
        voter_id = request.data.get("voterId")
        voter_key = request.data.get("voterKey")

        if not voter_id or not voter_key:
            return Response(
                {"error": "voterId and voterKey are required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            voter = models.Voter.objects.get(id=voter_id)
        except models.Voter.DoesNotExist:
            return Response(
                {"error": "Invalid voter ID or password"},
                status=status.HTTP_401_UNAUTHORIZED
            )

        # Replace voter.voter_key with your actual password field
        if voter.voter_key != voter_key:
            return Response(
                {"error": "Invalid voter ID or password"},
                status=status.HTTP_401_UNAUTHORIZED
            )

        return Response({
            "success": True,
            "voter": {
                "id": voter.id,
                "full_name": voter.full_name,
            }
        })

class LoginAdmin(views.APIView):
    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")

        if not username or not password:
            return Response(
                {"error": "username and password are required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = authenticate(username=username, password=password)

        if not user or not user.is_staff:
            return Response(
                {"error": "Invalid admin username or password"},
                status=status.HTTP_401_UNAUTHORIZED
            )

        return Response({
            "success": True,
            "admin": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "is_superuser": user.is_superuser,
            }
        })



class ElectionsViewSet(viewsets.ModelViewSet):
  queryset = models.Election.objects.all()
  serializer_class = serializers.ElectionSerializer
  #permission_classes = [ IsAdmin ]
  
  # we create the election NFT + the voter NFTs
  def create(self, request, *args, **kwargs):
    response = super().create(request, *args, **kwargs)
    election_id = response.data["id"]
    election = models.Election.objects.get(id=election_id)

    try:
      election_cat = self.create_election_nft(election)
      election.refresh_from_db()
    except Exception as e:
      return Response(
          {
              "error": f"Election created but NFT category was not generated: {e}",
              "election": response.data,
          },
          status=status.HTTP_500_INTERNAL_SERVER_ERROR
      )

    response.data["nft_category"] = election_cat
    return response

  def create_election_nft(self, election):
    if not BLOCKCHAIN_API:
      raise RuntimeError("BLOCKCHAIN_API is not configured")

    validate_uint64_id(election.id, "election_id")

    response = requests.post(
        f"{BLOCKCHAIN_API}/nft/generate-election-nft",
        json={
            "election_id": election.id
        },
        timeout=60
    )
    data = parse_blockchain_response(response)
    nft_category = data.get("result")

    if not nft_category:
      raise RuntimeError(f"Blockchain response did not include result: {data}")

    election.nft_category = nft_category
    election.save()
    return election.nft_category

class ContractsViewSet(viewsets.ModelViewSet):
    queryset = models.Contract.objects.all()
    serializer_class = serializers.ContractSerializer
    #permission_classes = [ IsVoter ]


class CandidatesViewSet(viewsets.ModelViewSet):
    queryset = models.Candidate.objects.all()
    serializer_class = serializers.CandidateSerializer
    #permission_classes = [ IsAdmin ]
    
    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        candidate_id = response.data["id"]
        candidate = models.Candidate.objects.select_related(
            "election",
            "position"
        ).get(id=candidate_id)
        election = candidate.election

        try:
            nft_response = self.create_candidate_nft(election, candidate)
            contract_response = self.send_candidate_nft_to_contract(election, candidate)
        except Exception as e:
            return Response(
                {
                    "error": f"Candidate created but blockchain setup failed: {e}",
                    "candidate": response.data,
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        response.data["candidate_nft"] = nft_response
        response.data["contract_tx"] = contract_response

        return response
    
    def create_candidate_nft(self, election, candidate):
        if not BLOCKCHAIN_API:
            raise RuntimeError("BLOCKCHAIN_API is not configured")

        if not election or not election.nft_category:
            raise RuntimeError("Election NFT category is not generated")

        if not candidate.position:
            raise RuntimeError("Candidate position is required")

        validate_uint64_id(candidate.id, "candidate_id")
        validate_uint64_id(candidate.position.id, "position_id")

        response = requests.post(
            f"{BLOCKCHAIN_API}/nft/generate-candidate-nft",
            json={
                "nft_category": election.nft_category,
                "candidate_id": candidate.id,
                "position_id": candidate.position.id
            },
            timeout=60
        )
        return parse_blockchain_response(response)
    
    
    def send_candidate_nft_to_contract(self, election, candidate):
      if not BLOCKCHAIN_API:
        raise RuntimeError("BLOCKCHAIN_API is not configured")

      if not election or not election.nft_category:
        raise RuntimeError("Election NFT category is not generated")

      if not election.date_start or not election.date_end:
        raise RuntimeError("Election start and end dates are required")

      validate_uint64_id(candidate.id, "candidate_id")
      validate_uint64_id(candidate.position.id, "position_id")

      response = requests.post(
          f"{BLOCKCHAIN_API}/nft/send-nft-to-contract",
          json={
            "nft_category": election.nft_category,
            "candidate_id": candidate.id,
            "position_id": candidate.position.id,
            "open_time": int(election.date_start.timestamp()),
            "close_time": int(election.date_end.timestamp())
          },
          timeout=60
      )
      return parse_blockchain_response(response)
                  
class PositionsViewSet(viewsets.ModelViewSet):
    queryset = models.Position.objects.all()
    serializer_class = serializers.PositionSerializer

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        position = models.Position.objects.select_related("election").get(
            id=response.data["id"]
        )

        try:
            created_nfts = create_voter_nfts_for_position(
                position.election,
                position
            )
        except Exception as e:
            return Response(
                {
                    "error": f"Position created but failed to create voter NFTs: {e}",
                    "position": response.data,
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        response.data["voter_nfts_created"] = len(created_nfts)
        return response
  
class NFTsViewSet(viewsets.ModelViewSet):
    queryset = models.NFT.objects.all()
    serializer_class = serializers.NFTSerializer
    
class VotesViewSet(viewsets.ModelViewSet):
    queryset = models.Vote.objects.all()
    serializer_class = serializers.VoteSerializer

    def create(self, request, *args, **kwargs):
        election_id = request.data.get("election") or request.data.get("election_id")
        voter_id = request.data.get("voter") or request.data.get("voter_id")
        candidate_ids = self.get_candidate_ids(request.data)

        if not election_id:
            return Response(
                {"error": "election is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not voter_id:
            return Response(
                {"error": "voter is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not candidate_ids:
            return Response(
                {"error": "At least one candidate is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not BLOCKCHAIN_API:
            return Response(
                {"error": "BLOCKCHAIN_API is not configured"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        try:
            election = models.Election.objects.get(id=election_id)
        except models.Election.DoesNotExist:
            return Response(
                {"error": "Election not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        try:
            voter = models.Voter.objects.get(id=voter_id)
        except models.Voter.DoesNotExist:
            return Response(
                {"error": "Voter not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        if not election.nft_category:
            return Response(
                {"error": "Election NFT category is not generated"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not election.date_start or not election.date_end:
            return Response(
                {"error": "Election start and end dates are required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            validate_uint64_id(election.id, "election_id")
            validate_uint64_id(voter.id, "voter_id")
            for candidate_id in candidate_ids:
                validate_uint64_id(candidate_id, "candidate_id")
        except ValueError as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

        candidates = list(
            models.Candidate.objects
            .select_related("election")
            .filter(id__in=candidate_ids)
        )
        found_candidate_ids = {candidate.id for candidate in candidates}
        missing_candidate_ids = [
            candidate_id
            for candidate_id in candidate_ids
            if candidate_id not in found_candidate_ids
        ]

        if missing_candidate_ids:
            return Response(
                {
                    "error": "Candidate not found",
                    "candidate_ids": missing_candidate_ids,
                },
                status=status.HTTP_404_NOT_FOUND
            )

        wrong_election_ids = [
            candidate.id
            for candidate in candidates
            if candidate.election_id != election.id
        ]

        if wrong_election_ids:
            return Response(
                {
                    "error": "All candidates must belong to the selected election",
                    "candidate_ids": wrong_election_ids,
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        created_votes = []
        txids = []

        for candidate_id in candidate_ids:
            candidate = next(
                candidate
                for candidate in candidates
                if candidate.id == candidate_id
            )

            try:
                blockchain_response = requests.post(
                    f"{BLOCKCHAIN_API}/vote",
                    json={
                        "nft_category": election.nft_category,
                        "candidate_id": candidate.id,
                        "voter_id": voter.id,
                        "open_time": int(election.date_start.timestamp()),
                        "close_time": int(election.date_end.timestamp()),
                    },
                    timeout=60
                )
                blockchain_data = parse_blockchain_response(blockchain_response)
            except (requests.RequestException, RuntimeError) as e:
                return Response(
                    {
                        "error": f"Blockchain vote failed for candidate {candidate.id}: {e}",
                        "created_votes": created_votes,
                        "txids": txids,
                    },
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

            try:
                txid = extract_txid(blockchain_data.get("txid"))
            except RuntimeError as e:
                return Response(
                    {
                        "error": str(e),
                        "blockchain_response": blockchain_data,
                        "created_votes": created_votes,
                        "txids": txids,
                    },
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

            if not txid:
                return Response(
                    {
                        "error": f"Blockchain vote did not return txid for candidate {candidate.id}",
                        "blockchain_response": blockchain_data,
                        "created_votes": created_votes,
                        "txids": txids,
                    },
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

            vote = models.Vote.objects.create(
                voter=voter,
                candidate=candidate,
                election=election,
                vote_txid=txid,
            )
            created_votes.append(serializers.VoteSerializer(vote).data)
            txids.append(txid)

        return Response(
            {
                "success": True,
                "votes": created_votes,
                "txids": txids,
            },
            status=status.HTTP_201_CREATED
        )

    def get_candidate_ids(self, data):
        candidate_ids = []

        def add_candidate_id(value):
            if value is None or value == "":
                return

            if isinstance(value, dict):
                value = (
                    value.get("candidate")
                    or value.get("candidate_id")
                    or value.get("id")
                )

            if value is not None and value != "":
                candidate_ids.append(str(value))

        add_candidate_id(data.get("candidate") or data.get("candidate_id"))

        for key in ("candidates", "candidate_ids"):
            values = data.get(key)

            if not values:
                continue

            if not isinstance(values, list):
                values = [values]

            for value in values:
                add_candidate_id(value)

        selections = data.get("selections")

        if isinstance(selections, dict):
            selection_values = selections.values()
        elif isinstance(selections, list):
            selection_values = selections
        else:
            selection_values = []

        for selection in selection_values:
            if isinstance(selection, list):
                for value in selection:
                    add_candidate_id(value)
            else:
                add_candidate_id(selection)

        return list(dict.fromkeys(candidate_ids))


class ElectionTurnoutView(views.APIView):
    def get(self, request, election_id):
        try:
            election = models.Election.objects.get(id=election_id)
        except models.Election.DoesNotExist:
            return Response(
                {"error": "Election not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        voters = models.Voter.objects.all()
        voted_voter_ids = set(
            models.Vote.objects
            .filter(election=election, voter__isnull=False)
            .values_list("voter_id", flat=True)
            .distinct()
        )

        total_voters = voters.count()
        voted_count = len(voted_voter_ids)
        not_voted_count = max(total_voters - voted_count, 0)
        turnout_percentage = (
            round((voted_count / total_voters) * 100, 2)
            if total_voters else 0
        )

        gender_labels = dict(models.Voter.Gender.choices)
        gender_turnout = []
        gender_values = list(models.Voter.Gender.values) + [None, ""]

        for gender in gender_values:
            gender_voters = voters.filter(gender=gender)
            gender_total = gender_voters.count()
            gender_voted = gender_voters.filter(id__in=voted_voter_ids).count()

            if gender_total == 0:
                continue

            gender_turnout.append({
                "gender": gender or "UNKNOWN",
                "label": gender_labels.get(gender, "Unknown"),
                "total_voters": gender_total,
                "voted": gender_voted,
                "not_voted": gender_total - gender_voted,
                "turnout_percentage": round((gender_voted / gender_total) * 100, 2),
            })

        return Response({
            "election": {
                "id": election.id,
                "name": election.name,
            },
            "total_voters": total_voters,
            "voted": voted_count,
            "not_voted": not_voted_count,
            "turnout_percentage": turnout_percentage,
            "gender_turnout": gender_turnout,
        })
    
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
            
            positions = models.Position.objects.filter(election=election)

            for position in positions:
                create_voter_nfts_for_position(election, position)

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
