from rest_framework import serializers
from account.models import User
from .models import WOD, Movement


class  WodSerializer(serializers.ModelSerializer):
   
    coach = serializers.PrimaryKeyRelatedField(read_only=True)
    coach_user = serializers.CharField(source='coach.user.username', read_only=True)
    like = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=User.objects.all(),
        required=False  # <- deixa opcional
    )
    class Meta:
        model = WOD
        fields = ['id', 'title', 'description_wod', 'coach', 'coach_user', 'like', 'pinned']

    def create(self, validated_data):
        user = self.context['request'].user
        profile = user.profile
        validated_data['coach'] = profile
        # Remove like do validated_data, se quiser criar sem likes iniciais
        validated_data.pop('like', None)
        return super().create(validated_data)
    
    
class MovementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Movement
        fields = ['id', 'name']


class WodListSerializer(serializers.ModelSerializer):

    class Meta:
        model = WOD
        fields = '__all__'