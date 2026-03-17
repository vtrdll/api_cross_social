from django.shortcuts import render
from rest_framework.generics import UpdateAPIView, ListAPIView, RetrieveAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.views import APIView
from .serializers import CreateTeamSerializer, ListTeamSerializer
from rest_framework.response import Response
from rest_framework import status
from .models import Team
from django.shortcuts import get_object_or_404

# Create your views here.
class  CreateTeamAPIView(APIView):


    def post(self, request):
     
        create_team_serializer = CreateTeamSerializer( data = request.data)
      
        if create_team_serializer.is_valid():
            data = create_team_serializer.validated_data
            create_team_serializer.save(creator=request.user)
            return Response({"message": "Create Team successfully"}, status=201)
        
        return Response(create_team_serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TeamListAPIView(ListAPIView):
    queryset = Team.objects.all()
    serializer_class = ListTeamSerializer


class DetailTeamAPIView(RetrieveAPIView):
    serializer_class = ListTeamSerializer
   

    def get_object(self):
        pk = self.kwargs.get('pk')
        obj = get_object_or_404(Team, pk=pk)
        return obj
    
class TeamUpdateDeleteAPIView(RetrieveUpdateDestroyAPIView):
    serializer_class = CreateTeamSerializer

    def get_queryset(self):
        return Team.objects.filter(
            creator=self.request.user
        )
