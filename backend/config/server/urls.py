from django.urls import path
from . import views

urlpatterns = [
  # Voters
  path('voters/', views.VotersViewSet.as_view({'get': 'list', 'post': 'create'})),
  path('voters/<int:pk>/', views.VotersViewSet.as_view({'get': 'retrieve'})),
  path('voters/<int:pk>/update/', views.VotersViewSet.as_view({'put': 'update', 'patch': 'partial_update'})),
  path('voters/<int:pk>/delete/', views.VotersViewSet.as_view({'delete': 'destroy'})),

  # Elections
  path('elections/', views.ElectionsViewSet.as_view({'get': 'list', 'post': 'create'})),
  path('elections/<int:pk>/', views.ElectionsViewSet.as_view({'get': 'retrieve'})),
  path('elections/<int:pk>/update/', views.ElectionsViewSet.as_view({'put': 'update', 'patch': 'partial_update'})),
  path('elections/<int:pk>/delete/', views.ElectionsViewSet.as_view({'delete': 'destroy'})),

  # Contracts
  path('contracts/', views.ContractsViewSet.as_view({'get': 'list', 'post': 'create'})),
  path('contracts/<int:pk>/', views.ContractsViewSet.as_view({'get': 'retrieve'})),
  path('contracts/<int:pk>/update/', views.ContractsViewSet.as_view({'put': 'update', 'patch': 'partial_update'})),
  path('contracts/<int:pk>/delete/', views.ContractsViewSet.as_view({'delete': 'destroy'})),

  # Candidates
  path('candidates/', views.CandidatesViewSet.as_view({'get': 'list', 'post': 'create'})),
  path('candidates/<int:pk>/', views.CandidatesViewSet.as_view({'get': 'retrieve'})),
  path('candidates/<int:pk>/update/', views.CandidatesViewSet.as_view({'put': 'update', 'patch': 'partial_update'})),
  path('candidates/<int:pk>/delete/', views.CandidatesViewSet.as_view({'delete': 'destroy'})),
]