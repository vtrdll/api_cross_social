
from rest_framework import serializers
from .models  import Team
from django.contrib.auth.models import User


class CreateTeamSerializer(serializers.ModelSerializer):
    members = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=User.objects.all(),
        required=False  # ← ISSO resolve
    )
    class Meta:
        model = Team
        fields = ['name','description', 'box','category', 'members','creator' ]
        read_only_fields = ["creator"]


class ListTeamSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = Team
        fields = '__all__'