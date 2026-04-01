"""
API ViewSets para WOD App usando Django Rest Framework.
Inclui WODs, Movimentos, ResultadosI de Treinos (FOR_TIME, AMRAP, EMOM).
"""

from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from django.db.models import Q
from .models import (
    MovementType, Movement, WOD, WodMovement, WodResult,
    ResultMovement, ForTimeResult, AmrapResult, EmomResult
)
from rest_framework import serializers


# ==================== SERIALIZERS ====================

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


# ==================== VIEWSETS ====================

class MovementTypeViewSet(viewsets.ModelViewSet):
    """
    API ViewSet para Tipos de Movimento.
    
    Endpoints:
    - GET /api/v1/movement-types/ - Listar tipos
    - GET /api/v1/movement-types/{id}/ - Detalhes
    - POST /api/v1/movement-types/ - Criar (admin)
    - PUT /api/v1/movement-types/{id}/ - Atualizar (admin)
    - DELETE /api/v1/movement-types/{id}/ - Deletar (admin)
    """
    queryset = MovementType.objects.all()
    serializer_class = MovementTypeSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name']


class MovementViewSet(viewsets.ModelViewSet):
    """
    API ViewSet para Movimentos.
    
    Endpoints:
    - GET /api/v1/movements/ - Listar movimentos
    - GET /api/v1/movements/{id}/ - Detalhes
    - POST /api/v1/movements/ - Criar (admin)
    - PUT /api/v1/movements/{id}/ - Atualizar (admin)
    - DELETE /api/v1/movements/{id}/ - Deletar (admin)
    - GET /api/v1/movements/by_type/ - Filtrar por tipo
    """
    queryset = Movement.objects.select_related('type')
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['type']
    search_fields = ['name', 'description']
    ordering_fields = ['name']

    def get_serializer_class(self):
        if self.action in ['list']:
            return MovementSimpleSerializer
        return MovementDetailSerializer

    @action(detail=False, methods=['get'])
    def by_type(self, request):
        """Obter movimentos por tipo"""
        type_id = request.query_params.get('type_id')
        if not type_id:
            return Response(
                {'detail': "Parâmetro 'type_id' é obrigatório"},
                status=status.HTTP_400_BAD_REQUEST
            )

        movements = self.get_queryset().filter(type_id=type_id)
        serializer = MovementDetailSerializer(movements, many=True)
        return Response({
            'type_id': type_id,
            'total': movements.count(),
            'movements': serializer.data
        })


class WODViewSet(viewsets.ModelViewSet):
    """
    API ViewSet para WODs (Workout of the Day).
    
    Endpoints:
    - GET /api/v1/wods/ - Listar WODs
    - GET /api/v1/wods/{id}/ - Detalhes
    - POST /api/v1/wods/ - Criar (apenas coach)
    - PUT /api/v1/wods/{id}/ - Atualizar (apenas creator)
    - DELETE /api/v1/wods/{id}/ - Deletar (apenas creator)
    - POST /api/v1/wods/{id}/like/ - Curtir/descurtir
    - GET /api/v1/wods/{id}/likes/ - Lista de likes
    - POST /api/v1/wods/{id}/pin/ - Fixar WOD
    - GET /api/v1/wods/today/ - WOD de hoje
    - GET /api/v1/wods/pinned/ - WOD fixado
    - GET /api/v1/wods/by_date/ - WOD por data
    - GET /api/v1/wods/by_type/ - WODs por tipo
    - GET /api/v1/wods/latest/ - Últimos WODs
    - GET /api/v1/wods/my_wods/ - WODs criados pelo coach
    - GET /api/v1/wods/my_done/ - WODs feitos pelo usuário
    """
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['coach', 'type', 'pinned']
    search_fields = ['title', 'description_wod', 'coach__user__username']
    ordering_fields = ['date', 'created_at']
    ordering = ['-date']

    def get_queryset(self):
        return WOD.objects.prefetch_related(
            'movements', 'like', 'results'
        ).select_related('coach__user').order_by('-date')

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return WodCreateUpdateSerializer
        return WodDetailSerializer

    def perform_create(self, serializer):
        """Criar WOD - apenas coaches podem"""
        if not hasattr(self.request.user, 'profile') or not self.request.user.profile.is_coach:
            raise PermissionError("Apenas coaches podem criar WODs")
        serializer.save(coach=self.request.user.profile)

    def perform_update(self, serializer):
        """Atualizar WOD - apenas o coach que criou pode"""
        wod = self.get_object()
        if wod.coach.user != self.request.user:
            raise PermissionError("Apenas o coach que criou pode atualizar")
        serializer.save()

    def perform_destroy(self, instance):
        """Deletar WOD - apenas o coach que criou pode"""
        if instance.coach.user != self.request.user:
            raise PermissionError("Apenas o coach que criou pode deletar")
        instance.delete()

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def like(self, request, pk=None):
        """Curtir/descurtir um WOD (toggle)"""
        wod = self.get_object()
        user = request.user

        if wod.like.filter(id=user.id).exists():
            wod.like.remove(user)
            return Response(
                {'detail': 'Like removido', 'liked': False},
                status=status.HTTP_200_OK
            )
        else:
            wod.like.add(user)
            return Response(
                {'detail': 'WOD foi curtido', 'liked': True},
                status=status.HTTP_201_CREATED
            )

    @action(detail=True, methods=['get'])
    def likes(self, request, pk=None):
        """Listar quem curtiu o WOD"""
        wod = self.get_object()
        users = wod.like.all().values_list('username', flat=True)

        return Response({
            'wod_id': wod.id,
            'wod_title': wod.title,
            'likes_count': len(users),
            'users': list(users)
        })

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def pin(self, request, pk=None):
        """Fixar WOD (apenas coach pode)"""
        wod = self.get_object()

        if wod.coach.user != request.user:
            return Response(
                {'detail': 'Apenas o coach pode fixar'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Desfixar todos os outros WODs
        WOD.objects.exclude(id=wod.id).update(pinned=False)
        wod.pinned = True
        wod.save()

        return Response({
            'detail': 'WOD fixado na tela inicial',
            'wod_id': wod.id,
            'pinned': True
        })

    @action(detail=False, methods=['get'])
    def today(self, request):
        """Obter WOD de hoje"""
        today = timezone.now().date()
        wod = WOD.objects.filter(date=today).prefetch_related('movements').first()

        if not wod:
            return Response(
                {'detail': 'Nenhum WOD para hoje'},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = WodDetailSerializer(wod, context={'request': request})
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def pinned(self, request):
        """Obter WOD fixado na tela inicial"""
        wod = WOD.objects.filter(pinned=True).prefetch_related('movements').first()

        if not wod:
            return Response(
                {'detail': 'Nenhum WOD fixado'},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = WodDetailSerializer(wod, context={'request': request})
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def by_date(self, request):
        """
        Obter WOD de uma data específica.
        Query params:
        - date: YYYY-MM-DD (obrigatório)
        """
        date_str = request.query_params.get('date')
        if not date_str:
            return Response(
                {'detail': "Parâmetro 'date' (YYYY-MM-DD) é obrigatório"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            from datetime import datetime
            date_obj = datetime.strptime(date_str, '%Y-%m-%d').date()
        except ValueError:
            return Response(
                {'detail': 'Formato de data inválido. Use YYYY-MM-DD'},
                status=status.HTTP_400_BAD_REQUEST
            )

        wod = WOD.objects.filter(date=date_obj).prefetch_related('movements').first()
        if not wod:
            return Response(
                {'detail': f'Nenhum WOD para {date_str}'},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = WodDetailSerializer(wod, context={'request': request})
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def by_type(self, request):
        """
        Listar WODs por tipo.
        Query params:
        - type: 'FOR_TIME', 'AMRAP', ou 'EMOM'
        """
        wod_type = request.query_params.get('type')
        if not wod_type or wod_type not in ['FOR_TIME', 'AMRAP', 'EMOM']:
            return Response(
                {'detail': "Tipo inválido. Tipos disponíveis: FOR_TIME, AMRAP, EMOM"},
                status=status.HTTP_400_BAD_REQUEST
            )

        wods = self.get_queryset().filter(type=wod_type)

        page = self.paginate_queryset(wods)
        if page is not None:
            serializer = WodDetailSerializer(page, many=True, context={'request': request})
            return self.get_paginated_response(serializer.data)

        serializer = WodDetailSerializer(wods, many=True, context={'request': request})
        return Response({
            'type': wod_type,
            'total': wods.count(),
            'wods': serializer.data
        })

    @action(detail=False, methods=['get'])
    def latest(self, request):
        """Obter os últimos N WODs"""
        limit = int(request.query_params.get('limit', 7))
        wods = self.get_queryset()[:limit]

        serializer = WodDetailSerializer(wods, many=True, context={'request': request})
        return Response({
            'total': len(wods),
            'wods': serializer.data
        })

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_wods(self, request):
        """Obter WODs criados pelo coach autenticado"""
        if not hasattr(request.user, 'profile') or not request.user.profile.is_coach:
            return Response(
                {'detail': 'Apenas coaches têm WODs criados'},
                status=status.HTTP_403_FORBIDDEN
            )

        wods = self.get_queryset().filter(coach=request.user.profile)

        page = self.paginate_queryset(wods)
        if page is not None:
            serializer = WodDetailSerializer(page, many=True, context={'request': request})
            return self.get_paginated_response(serializer.data)

        serializer = WodDetailSerializer(wods, many=True, context={'request': request})
        return Response({
            'total': wods.count(),
            'wods': serializer.data
        })

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_done(self, request):
        """Obter WODs realizados pelo usuário autenticado"""
        user_results = WodResult.objects.filter(
            user=request.user
        ).values_list('wod_id', flat=True)

        wods = self.get_queryset().filter(id__in=user_results)

        page = self.paginate_queryset(wods)
        if page is not None:
            serializer = WodDetailSerializer(page, many=True, context={'request': request})
            return self.get_paginated_response(serializer.data)

        serializer = WodDetailSerializer(wods, many=True, context={'request': request})
        return Response({
            'total': wods.count(),
            'wods': serializer.data
        })


class WodMovementViewSet(viewsets.ModelViewSet):
    """
    API ViewSet para Movimentos dentro de WODs.
    
    Endpoints:
    - GET /api/v1/wod-movements/ - Listar movimentos de WODs
    - GET /api/v1/wod-movements/{id}/ - Detalhes
    - POST /api/v1/wod-movements/ - Adicionar movimento (apenas coach)
    - PUT /api/v1/wod-movements/{id}/ - Atualizar (apenas coach)
    - DELETE /api/v1/wod-movements/{id}/ - Remover (apenas coach)
    """
    queryset = WodMovement.objects.select_related('wod', 'movement')
    serializer_class = WodMovementSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['wod', 'movement']
    ordering_fields = ['order']
    ordering = ['order']

    def perform_create(self, serializer):
        """Apenas o coach que criou o WOD pode adicionar movimentos"""
        wod = serializer.validated_data.get('wod')
        if wod.coach.user != self.request.user:
            raise PermissionError("Apenas o coach que criou o WOD pode adicionar movimentos")
        serializer.save()

    def perform_update(self, serializer):
        """Apenas o coach que criou o WOD pode atualizar"""
        wod = self.get_object().wod
        if wod.coach.user != self.request.user:
            raise PermissionError("Apenas o coach que criou o WOD pode atualizar")
        serializer.save()

    def perform_destroy(self, instance):
        """Apenas o coach que criou o WOD pode remover"""
        if instance.wod.coach.user != self.request.user:
            raise PermissionError("Apenas o coach que criou o WOD pode remover movimentos")
        instance.delete()


class WodResultViewSet(viewsets.ModelViewSet):
    """
    API ViewSet para Resultados de WODs.
    
    Endpoints:
    - GET /api/v1/wod-results/ - Listar resultados
    - GET /api/v1/wod-results/{id}/ - Detalhes
    - POST /api/v1/wod-results/ - Registrar resultado (apenas dono)
    - PUT /api/v1/wod-results/{id}/ - Atualizar resultado (apenas dono)
    - DELETE /api/v1/wod-results/{id}/ - Deletar resultado (apenas dono)
    - GET /api/v1/wod-results/my_results/ - Meus resultados
    - GET /api/v1/wod-results/by_wod/ - Resultados de um WOD específico
    """
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['user', 'wod', 'completed']
    search_fields = ['user__username', 'wod__title']
    ordering_fields = ['date']
    ordering = ['-date']

    def get_queryset(self):
        return WodResult.objects.prefetch_related(
            'movements', 'for_time', 'amrap', 'emom'
        ).select_related('user', 'wod')

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return WodResultCreateSerializer
        return WodResultDetailSerializer

    def perform_create(self, serializer):
        """Registrar resultado - o usuário é sempre o autenticado"""
        serializer.save(user=self.request.user)

    def perform_update(self, serializer):
        """Apenas o dono pode atualizar seu resultado"""
        if self.get_object().user != self.request.user:
            raise PermissionError("Você não pode editar resultado de outro usuário")
        serializer.save()

    def perform_destroy(self, instance):
        """Apenas o dono pode deletar seu resultado"""
        if instance.user != self.request.user:
            raise PermissionError("Você não pode deletar resultado de outro usuário")
        instance.delete()

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_results(self, request):
        """Obter resultados do usuário autenticado"""
        results = self.get_queryset().filter(user=request.user)

        page = self.paginate_queryset(results)
        if page is not None:
            serializer = WodResultDetailSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = WodResultDetailSerializer(results, many=True)
        return Response({
            'total': results.count(),
            'results': serializer.data
        })

    @action(detail=False, methods=['get'])
    def by_wod(self, request):
        """Obter todos os resultados de um WOD específico"""
        wod_id = request.query_params.get('wod_id')
        if not wod_id:
            return Response(
                {'detail': "Parâmetro 'wod_id' é obrigatório"},
                status=status.HTTP_400_BAD_REQUEST
            )

        results = self.get_queryset().filter(wod_id=wod_id)

        page = self.paginate_queryset(results)
        if page is not None:
            serializer = WodResultDetailSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = WodResultDetailSerializer(results, many=True)
        return Response({
            'wod_id': wod_id,
            'total': results.count(),
            'results': serializer.data
        })

    @action(detail=False, methods=['get'])
    def leaderboard(self, request):
        """
        Ranking de apenas WOD específico.
        Query params:
        - wod_id: ID do WOD (obrigatório)
        - limit: número de posições (padrão 10)
        """
        wod_id = request.query_params.get('wod_id')
        if not wod_id:
            return Response(
                {'detail': "Parâmetro 'wod_id' é obrigatório"},
                status=status.HTTP_400_BAD_REQUEST
            )

        limit = int(request.query_params.get('limit', 10))

        wod = WOD.objects.filter(id=wod_id).first()
        if not wod:
            return Response(
                {'detail': 'WOD não encontrado'},
                status=status.HTTP_404_NOT_FOUND
            )

        results = self.get_queryset().filter(
            wod_id=wod_id,
            completed=True
        )[:limit]

        leaderboard_data = []
        for idx, result in enumerate(results, 1):
            entry = {
                'position': idx,
                'username': result.user.username,
                'completed': result.completed,
                'date': result.date
            }

            # Adicionar resultado específico baseado no tipo do WOD
            if wod.type == 'FOR_TIME' and hasattr(result, 'for_time'):
                entry['time'] = result.for_time.time_seconds
                entry['time_formatted'] = f"{result.for_time.time_seconds // 60:02d}:{result.for_time.time_seconds % 60:02d}"
            elif wod.type == 'AMRAP' and hasattr(result, 'amrap'):
                entry['rounds'] = result.amrap.rounds
                entry['reps'] = result.amrap.reps
                entry['result_formatted'] = f"{result.amrap.rounds}r + {result.amrap.reps}rep"
            elif wod.type == 'EMOM' and hasattr(result, 'emom'):
                entry['rounds_completed'] = result.emom.rounds_completed
                entry['failed_minute'] = result.emom.failed_minute

            leaderboard_data.append(entry)

        return Response({
            'wod_id': wod_id,
            'wod_title': wod.title,
            'wod_type': wod.type,
            'leaderboard': leaderboard_data
        })


class ResultMovementViewSet(viewsets.ModelViewSet):
    """
    API ViewSet para Movimentos dentro de Resultados.
    
    Endpoints:
    - GET /api/v1/result-movements/ - Listar
    - GET /api/v1/result-movements/{id}/ - Detalhes
    - POST /api/v1/result-movements/ - Criar
    - PUT /api/v1/result-movements/{id}/ - Atualizar
    - DELETE /api/v1/result-movements/{id}/ - Deletar
    """
    queryset = ResultMovement.objects.select_related('wod_result', 'movement')
    serializer_class = ResultMovementSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['wod_result', 'movement']
    ordering_fields = ['order']
    ordering = ['order']

    def perform_create(self, serializer):
        """Apenas o dono do resultado pode adicionar movimentos"""
        wod_result = serializer.validated_data.get('wod_result')
        if wod_result.user != self.request.user:
            raise PermissionError("Você não pode adicionar movimentos a resultado de outro usuário")
        serializer.save()

    def perform_destroy(self, instance):
        """Apenas o dono pode deletar"""
        if instance.wod_result.user != self.request.user:
            raise PermissionError("Você não pode deletar movimento de resultado de outro usuário")
        instance.delete()


class ForTimeResultViewSet(viewsets.ModelViewSet):
    """
    API ViewSet para Resultados FOR_TIME.
    
    Endpoints:
    - GET /api/v1/for-time-results/ - Listar
    - GET /api/v1/for-time-results/{id}/ - Detalhes
    - POST /api/v1/for-time-results/ - Criar
    - PUT /api/v1/for-time-results/{id}/ - Atualizar
    """
    queryset = ForTimeResult.objects.select_related('wod_result')
    serializer_class = ForTimeResultSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['wod_result']

    def perform_create(self, serializer):
        """Apenas o dono do resultado pode criar"""
        wod_result = serializer.validated_data.get('wod_result')
        if wod_result.user != self.request.user:
            raise PermissionError("Você não pode criar resultado para outro usuário")
        serializer.save()

    def perform_update(self, serializer):
        """Apenas o dono pode atualizar"""
        if self.get_object().wod_result.user != self.request.user:
            raise PermissionError("Você não pode atualizar resultado de outro usuário")
        serializer.save()


class AmrapResultViewSet(viewsets.ModelViewSet):
    """
    API ViewSet para Resultados AMRAP.
    
    Endpoints:
    - GET /api/v1/amrap-results/ - Listar
    - GET /api/v1/amrap-results/{id}/ - Detalhes
    - POST /api/v1/amrap-results/ - Criar
    - PUT /api/v1/amrap-results/{id}/ - Atualizar
    """
    queryset = AmrapResult.objects.select_related('wod_result')
    serializer_class = AmrapResultSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['wod_result']

    def perform_create(self, serializer):
        """Apenas o dono do resultado pode criar"""
        wod_result = serializer.validated_data.get('wod_result')
        if wod_result.user != self.request.user:
            raise PermissionError("Você não pode criar resultado para outro usuário")
        serializer.save()

    def perform_update(self, serializer):
        """Apenas o dono pode atualizar"""
        if self.get_object().wod_result.user != self.request.user:
            raise PermissionError("Você não pode atualizar resultado de outro usuário")
        serializer.save()


class EmomResultViewSet(viewsets.ModelViewSet):
    """
    API ViewSet para Resultados EMOM.
    
    Endpoints:
    - GET /api/v1/emom-results/ - Listar
    - GET /api/v1/emom-results/{id}/ - Detalhes
    - POST /api/v1/emom-results/ - Criar
    - PUT /api/v1/emom-results/{id}/ - Atualizar
    """
    queryset = EmomResult.objects.select_related('wod_result')
    serializer_class = EmomResultSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['wod_result']

    def perform_create(self, serializer):
        """Apenas o dono do resultado pode criar"""
        wod_result = serializer.validated_data.get('wod_result')
        if wod_result.user != self.request.user:
            raise PermissionError("Você não pode criar resultado para outro usuário")
        serializer.save()

    def perform_update(self, serializer):
        """Apenas o dono pode atualizar"""
        if self.get_object().wod_result.user != self.request.user:
            raise PermissionError("Você não pode atualizar resultado de outro usuário")
        serializer.save()
