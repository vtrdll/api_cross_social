"""
API Views para WOD App usando Django Rest Framework.
Converte ViewSets para Views tradicionais sem DjangoFilterBackend.
Inclui WODs, Movimentos, Resultados de Treinos (FOR_TIME, AMRAP, EMOM).
"""

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.views import APIView
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView, ListAPIView
from django.utils import timezone
from django.db.models import Q
from datetime import datetime

from .models import (
    MovementType, Movement, WOD, WodMovement, WodResult,
    ResultMovement, ForTimeResult, AmrapResult, EmomResult
)
from .serializers import (
    MovementTypeSerializer, MovementDetailSerializer, MovementSimpleSerializer,
    WodMovementSerializer, WodDetailSerializer, WodCreateUpdateSerializer,
    ResultMovementSerializer, ForTimeResultSerializer, AmrapResultSerializer,
    EmomResultSerializer, WodResultDetailSerializer, WodResultCreateSerializer
)


# ==================== MOVEMENT TYPES ====================

class MovementTypeListCreate(ListCreateAPIView):
    """
    GET: Listar tipos de movimento
    POST: Criar tipo de movimento (admin)
    """
    queryset = MovementType.objects.all()
    serializer_class = MovementTypeSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        queryset = MovementType.objects.all()
        
        # Filtrar por nome se fornecido
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(name__icontains=search)
        
        return queryset


class MovementTypeDetail(RetrieveUpdateDestroyAPIView):
    """
    GET: Detalhes do tipo de movimento
    PUT: Atualizar tipo de movimento (admin)
    DELETE: Deletar tipo de movimento (admin)
    """
    queryset = MovementType.objects.all()
    serializer_class = MovementTypeSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]


# ==================== MOVEMENTS ====================

class MovementListCreate(ListCreateAPIView):
    """
    GET: Listar movimentos
    POST: Criar movimento (admin)
    
    Query params:
    - type: Filtrar por ID do tipo
    - search: Buscar por nome ou descrição
    - ordering: ordenar por nome (use -name para reverso)
    """
    serializer_class = MovementSimpleSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        queryset = Movement.objects.select_related('type')
        
        # Filtrar por tipo
        type_id = self.request.query_params.get('type')
        if type_id:
            queryset = queryset.filter(type_id=type_id)
        
        # Buscar por nome ou descrição
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) | Q(description__icontains=search)
            )
        
        # Ordenação
        ordering = self.request.query_params.get('ordering', 'name')
        queryset = queryset.order_by(ordering)
        
        return queryset

    def get_serializer_class(self):
        # Usar serializer detalhado se for GET (list)
        if self.request.method == 'GET':
            return MovementDetailSerializer
        return MovementSimpleSerializer


class MovementDetail(RetrieveUpdateDestroyAPIView):
    """
    GET: Detalhes do movimento
    PUT: Atualizar movimento (admin)
    DELETE: Deletar movimento (admin)
    """
    queryset = Movement.objects.select_related('type')
    serializer_class = MovementDetailSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]


@api_view(['GET'])
def movement_by_type(request):
    """
    Obter movimentos por tipo.
    Query params:
    - type_id: ID do tipo (obrigatório)
    """
    type_id = request.query_params.get('type_id')
    if not type_id:
        return Response(
            {'detail': "Parâmetro 'type_id' é obrigatório"},
            status=status.HTTP_400_BAD_REQUEST
        )

    movements = Movement.objects.filter(type_id=type_id).select_related('type')
    serializer = MovementDetailSerializer(movements, many=True)
    
    return Response({
        'type_id': type_id,
        'total': movements.count(),
        'movements': serializer.data
    })


# ==================== WODS ====================

class WODListCreate(ListCreateAPIView):
    """
    GET: Listar WODs
    POST: Criar WOD (apenas coaches)
    
    Query params:
    - coach: Filtrar por ID do coach
    - type: Filtrar por tipo (FOR_TIME, AMRAP, EMOM)
    - pinned: Filtrar por fixado (true/false)
    - search: Buscar por título, descrição ou coach
    - ordering: ordenar por date ou created_at (use -date para reverso)
    """
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        queryset = WOD.objects.prefetch_related(
            'movements', 'like', 'results'
        ).select_related('coach__user')
        
        # Filtrar por coach
        coach_id = self.request.query_params.get('coach')
        if coach_id:
            queryset = queryset.filter(coach_id=coach_id)
        
        # Filtrar por tipo
        wod_type = self.request.query_params.get('type')
        if wod_type and wod_type in ['FOR_TIME', 'AMRAP', 'EMOM']:
            queryset = queryset.filter(type=wod_type)
        
        # Filtrar por fixado
        pinned = self.request.query_params.get('pinned')
        if pinned is not None:
            pinned_bool = pinned.lower() == 'true'
            queryset = queryset.filter(pinned=pinned_bool)
        
        # Buscar
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(description_wod__icontains=search) |
                Q(coach__user__username__icontains=search)
            )
        
        # Ordenação
        ordering = self.request.query_params.get('ordering', '-date')
        queryset = queryset.order_by(ordering)
        
        return queryset

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return WodCreateUpdateSerializer
        return WodDetailSerializer

    def perform_create(self, serializer):
        """Criar WOD - apenas coaches podem"""
        if not hasattr(self.request.user, 'profile') or not self.request.user.profile.is_coach:
            raise PermissionError("Apenas coaches podem criar WODs")
        serializer.save(coach=self.request.user.profile)


class WODDetail(RetrieveUpdateDestroyAPIView):
    """
    GET: Detalhes do WOD
    PUT: Atualizar WOD (apenas o coach que criou)
    DELETE: Deletar WOD (apenas o coach que criou)
    """
    queryset = WOD.objects.prefetch_related('movements', 'like', 'results').select_related('coach__user')
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return WodCreateUpdateSerializer
        return WodDetailSerializer

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


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def wod_like(request, pk):
    """
    Curtir/descurtir um WOD (toggle)
    POST /api/v1/wods/{id}/like/
    """
    try:
        wod = WOD.objects.get(pk=pk)
    except WOD.DoesNotExist:
        return Response({'detail': 'WOD não encontrado'}, status=status.HTTP_404_NOT_FOUND)

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


@api_view(['GET'])
def wod_likes(request, pk):
    """
    Listar quem curtiu o WOD
    GET /api/v1/wods/{id}/likes/
    """
    try:
        wod = WOD.objects.get(pk=pk)
    except WOD.DoesNotExist:
        return Response({'detail': 'WOD não encontrado'}, status=status.HTTP_404_NOT_FOUND)

    users = wod.like.all().values_list('username', flat=True)

    return Response({
        'wod_id': wod.id,
        'wod_title': wod.title,
        'likes_count': len(users),
        'users': list(users)
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def wod_pin(request, pk):
    """
    Fixar WOD (apenas coach pode)
    POST /api/v1/wods/{id}/pin/
    """
    try:
        wod = WOD.objects.get(pk=pk)
    except WOD.DoesNotExist:
        return Response({'detail': 'WOD não encontrado'}, status=status.HTTP_404_NOT_FOUND)

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


@api_view(['GET'])
def wod_today(request):
    """
    Obter WOD de hoje
    GET /api/v1/wods/today/
    """
    today = timezone.now().date()
    wod = WOD.objects.filter(date=today).prefetch_related('movements').first()

    if not wod:
        return Response(
            {'detail': 'Nenhum WOD para hoje'},
            status=status.HTTP_404_NOT_FOUND
        )

    serializer = WodDetailSerializer(wod, context={'request': request})
    return Response(serializer.data)


@api_view(['GET'])
def wod_pinned(request):
    """
    Obter WOD fixado na tela inicial
    GET /api/v1/wods/pinned/
    """
    wod = WOD.objects.filter(pinned=True).prefetch_related('movements').first()

    if not wod:
        return Response(
            {'detail': 'Nenhum WOD fixado'},
            status=status.HTTP_404_NOT_FOUND
        )

    serializer = WodDetailSerializer(wod, context={'request': request})
    return Response(serializer.data)


@api_view(['GET'])
def wod_by_date(request):
    """
    Obter WOD de uma data específica
    GET /api/v1/wods/by_date/?date=YYYY-MM-DD
    """
    date_str = request.query_params.get('date')
    if not date_str:
        return Response(
            {'detail': "Parâmetro 'date' (YYYY-MM-DD) é obrigatório"},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
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


@api_view(['GET'])
def wod_by_type(request):
    """
    Listar WODs por tipo
    GET /api/v1/wods/by_type/?type=FOR_TIME|AMRAP|EMOM
    """
    wod_type = request.query_params.get('type')
    if not wod_type or wod_type not in ['FOR_TIME', 'AMRAP', 'EMOM']:
        return Response(
            {'detail': "Tipo inválido. Tipos disponíveis: FOR_TIME, AMRAP, EMOM"},
            status=status.HTTP_400_BAD_REQUEST
        )

    wods = WOD.objects.filter(type=wod_type).prefetch_related('movements').order_by('-date')
    serializer = WodDetailSerializer(wods, many=True, context={'request': request})
    
    return Response({
        'type': wod_type,
        'total': wods.count(),
        'wods': serializer.data
    })


@api_view(['GET'])
def wod_latest(request):
    """
    Obter os últimos N WODs
    GET /api/v1/wods/latest/?limit=7
    """
    limit = int(request.query_params.get('limit', 7))
    wods = WOD.objects.all().prefetch_related('movements').order_by('-date')[:limit]

    serializer = WodDetailSerializer(wods, many=True, context={'request': request})
    return Response({
        'total': len(wods),
        'wods': serializer.data
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def wod_my_wods(request):
    """
    Obter WODs criados pelo coach autenticado
    GET /api/v1/wods/my_wods/
    """
    if not hasattr(request.user, 'profile') or not request.user.profile.is_coach:
        return Response(
            {'detail': 'Apenas coaches têm WODs criados'},
            status=status.HTTP_403_FORBIDDEN
        )

    wods = WOD.objects.filter(coach=request.user.profile).prefetch_related('movements').order_by('-date')
    serializer = WodDetailSerializer(wods, many=True, context={'request': request})
    
    return Response({
        'total': wods.count(),
        'wods': serializer.data
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def wod_my_done(request):
    """
    Obter WODs realizados pelo usuário autenticado
    GET /api/v1/wods/my_done/
    """
    user_results = WodResult.objects.filter(
        user=request.user
    ).values_list('wod_id', flat=True)

    wods = WOD.objects.filter(id__in=user_results).prefetch_related('movements').order_by('-date')
    serializer = WodDetailSerializer(wods, many=True, context={'request': request})
    
    return Response({
        'total': wods.count(),
        'wods': serializer.data
    })


# ==================== WOD MOVEMENTS ====================

class WodMovementListCreate(ListCreateAPIView):
    """
    GET: Listar movimentos de WODs
    POST: Adicionar movimento a WOD (apenas o coach que criou o WOD)
    
    Query params:
    - wod: Filtrar por ID do WOD
    - movement: Filtrar por ID do movimento
    - ordering: ordenar por order
    """
    serializer_class = WodMovementSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        queryset = WodMovement.objects.select_related('wod', 'movement')
        
        # Filtrar por WOD
        wod_id = self.request.query_params.get('wod')
        if wod_id:
            queryset = queryset.filter(wod_id=wod_id)
        
        # Filtrar por movimento
        movement_id = self.request.query_params.get('movement')
        if movement_id:
            queryset = queryset.filter(movement_id=movement_id)
        
        # Ordenação
        ordering = self.request.query_params.get('ordering', 'order')
        queryset = queryset.order_by(ordering)
        
        return queryset

    def perform_create(self, serializer):
        """Apenas o coach que criou o WOD pode adicionar movimentos"""
        wod = serializer.validated_data.get('wod')
        if wod.coach.user != self.request.user:
            raise PermissionError("Apenas o coach que criou o WOD pode adicionar movimentos")
        serializer.save()


class WodMovementDetail(RetrieveUpdateDestroyAPIView):
    """
    GET: Detalhes do movimento do WOD
    PUT: Atualizar movimento (apenas o coach que criou o WOD)
    DELETE: Remover movimento (apenas o coach que criou o WOD)
    """
    queryset = WodMovement.objects.select_related('wod', 'movement')
    serializer_class = WodMovementSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

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


# ==================== WOD RESULTS ====================

class WodResultListCreate(ListCreateAPIView):
    """
    GET: Listar resultados de WODs
    POST: Registrar resultado de WOD (apenas o usuário autenticado)
    
    Query params:
    - user: Filtrar por ID do usuário
    - wod: Filtrar por ID do WOD
    - completed: Filtrar por completo (true/false)
    - search: Buscar por nome do usuário ou título do WOD
    - ordering: ordenar por date
    """
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        queryset = WodResult.objects.prefetch_related(
            'movements', 'for_time', 'amrap', 'emom'
        ).select_related('user', 'wod')
        
        # Filtrar por usuário
        user_id = self.request.query_params.get('user')
        if user_id:
            queryset = queryset.filter(user_id=user_id)
        
        # Filtrar por WOD
        wod_id = self.request.query_params.get('wod')
        if wod_id:
            queryset = queryset.filter(wod_id=wod_id)
        
        # Filtrar por completo
        completed = self.request.query_params.get('completed')
        if completed is not None:
            completed_bool = completed.lower() == 'true'
            queryset = queryset.filter(completed=completed_bool)
        
        # Buscar
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(user__username__icontains=search) |
                Q(wod__title__icontains=search)
            )
        
        # Ordenação
        ordering = self.request.query_params.get('ordering', '-date')
        queryset = queryset.order_by(ordering)
        
        return queryset

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return WodResultCreateSerializer
        return WodResultDetailSerializer

    def perform_create(self, serializer):
        """Registrar resultado - o usuário é sempre o autenticado"""
        serializer.save(user=self.request.user)


class WodResultDetail(RetrieveUpdateDestroyAPIView):
    """
    GET: Detalhes do resultado
    PUT: Atualizar resultado (apenas o dono)
    DELETE: Deletar resultado (apenas o dono)
    """
    queryset = WodResult.objects.prefetch_related(
        'movements', 'for_time', 'amrap', 'emom'
    ).select_related('user', 'wod')
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return WodResultCreateSerializer
        return WodResultDetailSerializer

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


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def wod_result_my_results(request):
    """
    Obter resultados do usuário autenticado
    GET /api/v1/wod-results/my_results/
    """
    results = WodResult.objects.filter(user=request.user).prefetch_related(
        'movements', 'for_time', 'amrap', 'emom'
    ).select_related('wod').order_by('-date')

    serializer = WodResultDetailSerializer(results, many=True)
    return Response({
        'total': results.count(),
        'results': serializer.data
    })


@api_view(['GET'])
def wod_result_by_wod(request):
    """
    Obter todos os resultados de um WOD específico
    GET /api/v1/wod-results/by_wod/?wod_id=1
    """
    wod_id = request.query_params.get('wod_id')
    if not wod_id:
        return Response(
            {'detail': "Parâmetro 'wod_id' é obrigatório"},
            status=status.HTTP_400_BAD_REQUEST
        )

    results = WodResult.objects.filter(wod_id=wod_id).prefetch_related(
        'movements', 'for_time', 'amrap', 'emom'
    ).select_related('user', 'wod').order_by('-date')

    serializer = WodResultDetailSerializer(results, many=True)
    return Response({
        'wod_id': wod_id,
        'total': results.count(),
        'results': serializer.data
    })


@api_view(['GET'])
def wod_result_leaderboard(request):
    """
    Ranking de um WOD específico
    GET /api/v1/wod-results/leaderboard/?wod_id=1&limit=10
    """
    wod_id = request.query_params.get('wod_id')
    if not wod_id:
        return Response(
            {'detail': "Parâmetro 'wod_id' é obrigatório"},
            status=status.HTTP_400_BAD_REQUEST
        )

    limit = int(request.query_params.get('limit', 10))

    try:
        wod = WOD.objects.get(id=wod_id)
    except WOD.DoesNotExist:
        return Response(
            {'detail': 'WOD não encontrado'},
            status=status.HTTP_404_NOT_FOUND
        )

    results = WodResult.objects.filter(
        wod_id=wod_id,
        completed=True
    ).prefetch_related(
        'for_time', 'amrap', 'emom'
    ).select_related('user').order_by('date')[:limit]

    leaderboard_data = []
    for idx, result in enumerate(results, 1):
        entry = {
            'position': idx,
            'username': result.user.username,
            'completed': result.completed,
            'date': result.date
        }

        # Adicionar resultado específico baseado no tipo do WOD
        if wod.type == 'FOR_TIME' and hasattr(result, 'for_time') and result.for_time:
            entry['time'] = result.for_time.time_seconds
            entry['time_formatted'] = f"{result.for_time.time_seconds // 60:02d}:{result.for_time.time_seconds % 60:02d}"
        elif wod.type == 'AMRAP' and hasattr(result, 'amrap') and result.amrap:
            entry['rounds'] = result.amrap.rounds
            entry['reps'] = result.amrap.reps
            entry['result_formatted'] = f"{result.amrap.rounds}r + {result.amrap.reps}rep"
        elif wod.type == 'EMOM' and hasattr(result, 'emom') and result.emom:
            entry['rounds_completed'] = result.emom.rounds_completed
            entry['failed_minute'] = result.emom.failed_minute

        leaderboard_data.append(entry)

    return Response({
        'wod_id': wod_id,
        'wod_title': wod.title,
        'wod_type': wod.type,
        'leaderboard': leaderboard_data
    })


# ==================== RESULT MOVEMENTS ====================

class ResultMovementListCreate(ListCreateAPIView):
    """
    GET: Listar movimentos dentro de resultados
    POST: Adicionar movimento a resultado (apenas o dono do resultado)
    
    Query params:
    - wod_result: Filtrar por ID do resultado
    - movement: Filtrar por ID do movimento
    - ordering: ordenar por order
    """
    serializer_class = ResultMovementSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = ResultMovement.objects.select_related('wod_result', 'movement')
        
        # Filtrar por resultado
        wod_result_id = self.request.query_params.get('wod_result')
        if wod_result_id:
            queryset = queryset.filter(wod_result_id=wod_result_id)
        
        # Filtrar por movimento
        movement_id = self.request.query_params.get('movement')
        if movement_id:
            queryset = queryset.filter(movement_id=movement_id)
        
        # Ordenação
        ordering = self.request.query_params.get('ordering', 'order')
        queryset = queryset.order_by(ordering)
        
        return queryset

    def perform_create(self, serializer):
        """Apenas o dono do resultado pode adicionar movimentos"""
        wod_result = serializer.validated_data.get('wod_result')
        if wod_result.user != self.request.user:
            raise PermissionError("Você não pode adicionar movimentos a resultado de outro usuário")
        serializer.save()


class ResultMovementDetail(RetrieveUpdateDestroyAPIView):
    """
    GET: Detalhes do movimento do resultado
    PUT: Atualizar movimento (apenas o dono)
    DELETE: Deletar movimento (apenas o dono)
    """
    queryset = ResultMovement.objects.select_related('wod_result', 'movement')
    serializer_class = ResultMovementSerializer
    permission_classes = [IsAuthenticated]

    def perform_destroy(self, instance):
        """Apenas o dono pode deletar"""
        if instance.wod_result.user != self.request.user:
            raise PermissionError("Você não pode deletar movimento de resultado de outro usuário")
        instance.delete()


# ==================== FOR TIME RESULTS ====================

class ForTimeResultListCreate(ListCreateAPIView):
    """
    GET: Listar resultados FOR_TIME
    POST: Criar resultado FOR_TIME (apenas o dono do WODResult)
    
    Query params:
    - wod_result: Filtrar por ID do resultado
    """
    serializer_class = ForTimeResultSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = ForTimeResult.objects.select_related('wod_result')
        
        # Filtrar por resultado
        wod_result_id = self.request.query_params.get('wod_result')
        if wod_result_id:
            queryset = queryset.filter(wod_result_id=wod_result_id)
        
        return queryset

    def perform_create(self, serializer):
        """Apenas o dono do resultado pode criar"""
        wod_result = serializer.validated_data.get('wod_result')
        if wod_result.user != self.request.user:
            raise PermissionError("Você não pode criar resultado para outro usuário")
        serializer.save()


class ForTimeResultDetail(RetrieveUpdateDestroyAPIView):
    """
    GET: Detalhes do resultado FOR_TIME
    PUT: Atualizar (apenas o dono)
    DELETE: Deletar (apenas o dono)
    """
    queryset = ForTimeResult.objects.select_related('wod_result')
    serializer_class = ForTimeResultSerializer
    permission_classes = [IsAuthenticated]

    def perform_update(self, serializer):
        """Apenas o dono pode atualizar"""
        if self.get_object().wod_result.user != self.request.user:
            raise PermissionError("Você não pode atualizar resultado de outro usuário")
        serializer.save()


# ==================== AMRAP RESULTS ====================

class AmrapResultListCreate(ListCreateAPIView):
    """
    GET: Listar resultados AMRAP
    POST: Criar resultado AMRAP (apenas o dono do WODResult)
    
    Query params:
    - wod_result: Filtrar por ID do resultado
    """
    serializer_class = AmrapResultSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = AmrapResult.objects.select_related('wod_result')
        
        # Filtrar por resultado
        wod_result_id = self.request.query_params.get('wod_result')
        if wod_result_id:
            queryset = queryset.filter(wod_result_id=wod_result_id)
        
        return queryset

    def perform_create(self, serializer):
        """Apenas o dono do resultado pode criar"""
        wod_result = serializer.validated_data.get('wod_result')
        if wod_result.user != self.request.user:
            raise PermissionError("Você não pode criar resultado para outro usuário")
        serializer.save()


class AmrapResultDetail(RetrieveUpdateDestroyAPIView):
    """
    GET: Detalhes do resultado AMRAP
    PUT: Atualizar (apenas o dono)
    DELETE: Deletar (apenas o dono)
    """
    queryset = AmrapResult.objects.select_related('wod_result')
    serializer_class = AmrapResultSerializer
    permission_classes = [IsAuthenticated]

    def perform_update(self, serializer):
        """Apenas o dono pode atualizar"""
        if self.get_object().wod_result.user != self.request.user:
            raise PermissionError("Você não pode atualizar resultado de outro usuário")
        serializer.save()


# ==================== EMOM RESULTS ====================

class EmomResultListCreate(ListCreateAPIView):
    """
    GET: Listar resultados EMOM
    POST: Criar resultado EMOM (apenas o dono do WODResult)
    
    Query params:
    - wod_result: Filtrar por ID do resultado
    """
    serializer_class = EmomResultSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = EmomResult.objects.select_related('wod_result')
        
        # Filtrar por resultado
        wod_result_id = self.request.query_params.get('wod_result')
        if wod_result_id:
            queryset = queryset.filter(wod_result_id=wod_result_id)
        
        return queryset

    def perform_create(self, serializer):
        """Apenas o dono do resultado pode criar"""
        wod_result = serializer.validated_data.get('wod_result')
        if wod_result.user != self.request.user:
            raise PermissionError("Você não pode criar resultado para outro usuário")
        serializer.save()


class EmomResultDetail(RetrieveUpdateDestroyAPIView):
    """
    GET: Detalhes do resultado EMOM
    PUT: Atualizar (apenas o dono)
    DELETE: Deletar (apenas o dono)
    """
    queryset = EmomResult.objects.select_related('wod_result')
    serializer_class = EmomResultSerializer
    permission_classes = [IsAuthenticated]

    def perform_update(self, serializer):
        """Apenas o dono pode atualizar"""
        if self.get_object().wod_result.user != self.request.user:
            raise PermissionError("Você não pode atualizar resultado de outro usuário")
        serializer.save()
