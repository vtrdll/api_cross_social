from rest_framework import serializers
from account.models import User
from .models import MovementType, Movement, WodMovement, WOD, ResultMovement, ForTimeResult, EmomResult, WodResult,AmrapResult


class MovementTypeSerializer(serializers.ModelSerializer):
    """Serializer para Tipos de Movimento"""
    class Meta:
        model = MovementType
        fields = ['id', 'name', 'requires_load', 'requires_reps']


class MovementDetailSerializer(serializers.ModelSerializer):
    """Serializer detalhado para Movimentos"""
    type_name = serializers.CharField(source='type.name', read_only=True)

    class Meta:
        model = Movement
        fields = ['id', 'name', 'type', 'type_name', 'description']


class MovementSimpleSerializer(serializers.ModelSerializer):
    """Serializer simplificado para Movimentos"""
    class Meta:
        model = Movement
        fields = ['id', 'name', 'type']


class WodMovementSerializer(serializers.ModelSerializer):
    """Serializer para Movimentos dentro de WODs"""
    movement_name = serializers.CharField(source='movement.name', read_only=True)
    wod_title = serializers.CharField(source='wod.title', read_only=True)

    class Meta:
        model = WodMovement
        fields = ['id', 'wod', 'wod_title', 'movement', 'movement_name', 'reps', 'load', 'order', 'notes']


class WodDetailSerializer(serializers.ModelSerializer):
    """Serializer detalhado para WODs"""
    coach_name = serializers.CharField(source='coach.user.username', read_only=True)
    coach_id = serializers.IntegerField(source='coach.id', read_only=True)
    likes_count = serializers.IntegerField(source='like.count', read_only=True)
    is_liked = serializers.SerializerMethodField()
    movements = WodMovementSerializer(many=True, read_only=True)
    results_count = serializers.IntegerField(source='results.count', read_only=True)

    class Meta:
        model = WOD
        fields = [
            'id', 'title', 'description_wod', 'type', 'duration',
            'coach', 'coach_name', 'coach_id', 'date', 'pinned',
            'likes_count', 'is_liked', 'created_at', 'movements',
            'results_count'
        ]

    def get_is_liked(self, obj):
        user = self.context.get('request').user
        if user.is_anonymous:
            return False
        return obj.like.filter(id=user.id).exists()


class WodCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer para criar/atualizar WODs"""
    class Meta:
        model = WOD
        fields = ['title', 'description_wod', 'type', 'duration', 'date', 'pinned']


class ResultMovementSerializer(serializers.ModelSerializer):
    """Serializer para Movimentos dentro de Resultados"""
    movement_name = serializers.CharField(source='movement.name', read_only=True)

    class Meta:
        model = ResultMovement
        fields = [
            'id', 'movement', 'movement_name', 'reps_expected',
            'load_expected', 'reps_done', 'load_used', 'order', 'notes'
        ]


class ForTimeResultSerializer(serializers.ModelSerializer):
    """Serializer para Resultados FOR_TIME"""
    class Meta:
        model = ForTimeResult
        fields = ['id', 'wod_result', 'time_seconds']

    def to_representation(self, instance):
        data = super().to_representation(instance)
        # Converter segundos para formato MM:SS
        total_seconds = instance.time_seconds
        minutes = total_seconds // 60
        seconds = total_seconds % 60
        data['time_formatted'] = f"{minutes:02d}:{seconds:02d}"
        return data


class AmrapResultSerializer(serializers.ModelSerializer):
    """Serializer para Resultados AMRAP"""
    class Meta:
        model = AmrapResult
        fields = ['id', 'wod_result', 'rounds', 'reps']

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['result_formatted'] = f"{instance.rounds}r + {instance.reps}rep"
        return data


class EmomResultSerializer(serializers.ModelSerializer):
    """Serializer para Resultados EMOM"""
    class Meta:
        model = EmomResult
        fields = ['id', 'wod_result', 'rounds_completed', 'failed_minute']


class WodResultDetailSerializer(serializers.ModelSerializer):
    """Serializer detalhado para Resultados de WOD"""
    username = serializers.CharField(source='user.username', read_only=True)
    wod_title = serializers.CharField(source='wod.title', read_only=True)
    wod_type = serializers.CharField(source='wod.type', read_only=True)
    movements = ResultMovementSerializer(many=True, read_only=True)
    for_time = ForTimeResultSerializer(read_only=True)
    amrap = AmrapResultSerializer(read_only=True)
    emom = EmomResultSerializer(read_only=True)

    class Meta:
        model = WodResult
        fields = [
            'id', 'user', 'username', 'wod', 'wod_title', 'wod_type',
            'completed', 'notes', 'date', 'movements',
            'for_time', 'amrap', 'emom'
        ]


class WodResultCreateSerializer(serializers.ModelSerializer):
    """Serializer para criar Resultados de WOD"""
    class Meta:
        model = WodResult
        fields = ['wod', 'completed', 'notes']