from django.shortcuts import render
from .serializers import EventSerializer,EventSerializerList
from django.views.generic import CreateView, ListView, UpdateView, DeleteView, DetailView
from .models import Event
from rest_framework.views import APIView
from rest_framework.generics import  ListAPIView
from django.urls import reverse_lazy
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated
from django.shortcuts import get_object_or_404
from django.db.models import Count
from rest_framework.response import Response
from rest_framework.decorators import api_view
# Create your views here.



    


class EventList(ListAPIView):
    permission_classes = [IsAuthenticated]
    queryset = Event.objects.annotate(
    participants_count=Count("participants")
)
    serializer_class = EventSerializerList
    

    

    
  
    
        

@api_view(["POST"])
def subscribe_event(request, pk):
    event = get_object_or_404(Event, pk=pk)
    user = request.user

    if user in event.participants.all():
        event.participants.remove(user)
        subscriber = False
    else:
        event.participants.add(user)
        subscriber = True

    return Response({"subscriber": subscriber})

