
from rest_framework.response import Response
from .form import WodForm
from  .models import WOD, Movement
from .serializers import WodSerializer, MovementSerializer, WodListSerializer
from rest_framework import status
from rest_framework.generics import RetrieveAPIView, ListAPIView
from django.http import HttpResponseNotAllowed
from django.urls import reverse_lazy
from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
# Create your views here.




class CreateWodAPIVIEW(APIView):
   

    def post(self, request):
        serializer = WodSerializer(data=request.data, context={'request': request})
        
        if serializer.is_valid():
            # Salva o WOD com o coach sendo o usuário logado
            serializer.save(coach=request.user.profile.is_coach)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ListWodAPIView(ListAPIView):
    
    serializer_class = WodListSerializer
    def get_queryset(self):
        # Retorna um queryset com apenas o último WOD
        return WOD.objects.filter(date__isnull=False).order_by('-date')[:1]
    
class LikeCommentViewAPI(APIView):
  
    def post(self, request, pk):
        wod = get_object_or_404(WOD, pk=pk)
        user = request.user
        if user in wod.like.all():
            wod.like.remove(user)
            liked= False
        else:
            wod.like.add(user)
            liked= True

        return Response({"liked": liked})
    


class MovementViewSet(ListAPIView):
    queryset = Movement.objects.all()
    serializer_class = MovementSerializer




