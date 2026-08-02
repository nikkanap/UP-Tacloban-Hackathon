from django.urls import path
from . import views

urlpatterns = [
  # Voters
  path('login-voter/', views.LoginVoter.as_view()),
  path('login-admin/', views.LoginAdmin.as_view()),
  
  path('voters/', views.VotersViewSet.as_view({'get': 'list', 'post': 'create'})),
  path('voters/<str:pk>/', views.VotersViewSet.as_view({'get': 'retrieve'})),
  path('voters/<str:pk>/update/', views.VotersViewSet.as_view({'put': 'update', 'patch': 'partial_update'})),
  path('voters/<str:pk>/delete/', views.VotersViewSet.as_view({'delete': 'destroy'})),

  # Elections
  path('elections/', views.ElectionsViewSet.as_view({'get': 'list', 'post': 'create'})),
  path('elections/<str:pk>/', views.ElectionsViewSet.as_view({'get': 'retrieve'})),
  path('elections/<str:election_id>/turnout/', views.ElectionTurnoutView.as_view()),
  path('elections/<str:pk>/update/', views.ElectionsViewSet.as_view({'put': 'update', 'patch': 'partial_update'})),
  path('elections/<str:pk>/delete/', views.ElectionsViewSet.as_view({'delete': 'destroy'})),

  # Contracts
  path('contracts/', views.ContractsViewSet.as_view({'get': 'list', 'post': 'create'})),
  path('contracts/<int:pk>/', views.ContractsViewSet.as_view({'get': 'retrieve'})),
  path('contracts/<int:pk>/update/', views.ContractsViewSet.as_view({'put': 'update', 'patch': 'partial_update'})),
  path('contracts/<int:pk>/delete/', views.ContractsViewSet.as_view({'delete': 'destroy'})),

  # Candidates
  path('candidates/', views.CandidatesViewSet.as_view({'get': 'list', 'post': 'create'})),
  path('candidates/<str:pk>/', views.CandidatesViewSet.as_view({'get': 'retrieve'})),
  path('candidates/<str:pk>/update/', views.CandidatesViewSet.as_view({'put': 'update', 'patch': 'partial_update'})),
  path('candidates/<str:pk>/delete/', views.CandidatesViewSet.as_view({'delete': 'destroy'})),

  # Positions
  path('positions/', views.PositionsViewSet.as_view({'get': 'list', 'post': 'create'})),
  path('positions/<int:pk>/', views.PositionsViewSet.as_view({'get': 'retrieve'})),
  path('positions/<int:pk>/update/', views.PositionsViewSet.as_view({'put': 'update', 'patch': 'partial_update'})),
  path('positions/<int:pk>/delete/', views.PositionsViewSet.as_view({'delete': 'destroy'})),

  # Votes
  path('votes/', views.VotesViewSet.as_view({'get': 'list', 'post': 'create'})),
  path('votes/<int:pk>/', views.VotesViewSet.as_view({'get': 'retrieve'})),
  path('votes/<int:pk>/update/', views.VotesViewSet.as_view({'put': 'update', 'patch': 'partial_update'})),
  path('votes/<int:pk>/delete/', views.VotesViewSet.as_view({'delete': 'destroy'})),


  # NFTs
  path('nfts/', views.NFTsViewSet.as_view({'get': 'list', 'post': 'create'})),
  path('nfts/<int:pk>/', views.NFTsViewSet.as_view({'get': 'retrieve'})),
  path('nfts/<int:pk>/update/', views.NFTsViewSet.as_view({'put': 'update', 'patch': 'partial_update'})),
  path('nfts/<int:pk>/delete/', views.NFTsViewSet.as_view({'delete': 'destroy'})),
  
  path('nfts/create-voter-nfts/', views.CreateVoterNFTsView.as_view()),
]
