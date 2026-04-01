"""
Configuração de URLs para WOD API REST usando Django Rest Framework.
Views tradicionais (sem ViewSets, sem DjangoFilterBackend).

Para usar, adicione ao seu urls.py principal:
    from WOD.api_urls import urlpatterns as wod_urls
    
    urlpatterns = [
        path('api/v1/', include(wod_urls)),
    ]
"""

from django.urls import path
from .views import (
    # Movement Types
    MovementTypeListCreate,
    MovementTypeDetail,
    
    # Movements
    MovementListCreate,
    MovementDetail,
    movement_by_type,
    
    # WODs
    WODListCreate,
    WODDetail,
    wod_like,
    wod_likes,
    wod_pin,
    wod_today,
    wod_pinned,
    wod_by_date,
    wod_by_type,
    wod_latest,
    wod_my_wods,
    wod_my_done,
    
    # WOD Movements
    WodMovementListCreate,
    WodMovementDetail,
    
    # WOD Results
    WodResultListCreate,
    WodResultDetail,
    wod_result_my_results,
    wod_result_by_wod,
    wod_result_leaderboard,
    
    # Result Movements
    ResultMovementListCreate,
    ResultMovementDetail,
    
    # FOR TIME Results
    ForTimeResultListCreate,
    ForTimeResultDetail,
    
    # AMRAP Results
    AmrapResultListCreate,
    AmrapResultDetail,
    
    # EMOM Results
    EmomResultListCreate,
    EmomResultDetail,
)

urlpatterns = [
    # ==================== MOVEMENT TYPES ====================
    path('movement-types/', MovementTypeListCreate.as_view(), name='movement-type-list-create'),
    path('movement-types/<int:pk>/', MovementTypeDetail.as_view(), name='movement-type-detail'),
    
    # ==================== MOVEMENTS ====================
    path('movements/', MovementListCreate.as_view(), name='movement-list-create'),
    path('movements/<int:pk>/', MovementDetail.as_view(), name='movement-detail'),
    path('movements/by-type/', movement_by_type, name='movement-by-type'),
    
    # ==================== WODS ====================
    path('wods/', WODListCreate.as_view(), name='wod-list-create'),
    path('wods/<int:pk>/', WODDetail.as_view(), name='wod-detail'),
    path('wods/<int:pk>/like/', wod_like, name='wod-like'),
    path('wods/<int:pk>/likes/', wod_likes, name='wod-likes'),
    path('wods/<int:pk>/pin/', wod_pin, name='wod-pin'),
    path('wods/today/', wod_today, name='wod-today'),
    path('wods/pinned/', wod_pinned, name='wod-pinned'),
    path('wods/by-date/', wod_by_date, name='wod-by-date'),
    path('wods/by-type/', wod_by_type, name='wod-by-type'),
    path('wods/latest/', wod_latest, name='wod-latest'),
    path('wods/my-wods/', wod_my_wods, name='wod-my-wods'),
    path('wods/my-done/', wod_my_done, name='wod-my-done'),
    
    # ==================== WOD MOVEMENTS ====================
    path('wod-movements/', WodMovementListCreate.as_view(), name='wod-movement-list-create'),
    path('wod-movements/<int:pk>/', WodMovementDetail.as_view(), name='wod-movement-detail'),
    
    # ==================== WOD RESULTS ====================
    path('wod-results/', WodResultListCreate.as_view(), name='wod-result-list-create'),
    path('wod-results/<int:pk>/', WodResultDetail.as_view(), name='wod-result-detail'),
    path('wod-results/my-results/', wod_result_my_results, name='wod-result-my-results'),
    path('wod-results/by-wod/', wod_result_by_wod, name='wod-result-by-wod'),
    path('wod-results/leaderboard/', wod_result_leaderboard, name='wod-result-leaderboard'),
    
    # ==================== RESULT MOVEMENTS ====================
    path('result-movements/', ResultMovementListCreate.as_view(), name='result-movement-list-create'),
    path('result-movements/<int:pk>/', ResultMovementDetail.as_view(), name='result-movement-detail'),
    
    # ==================== FOR TIME RESULTS ====================
    path('for-time-results/', ForTimeResultListCreate.as_view(), name='for-time-result-list-create'),
    path('for-time-results/<int:pk>/', ForTimeResultDetail.as_view(), name='for-time-result-detail'),
    
    # ==================== AMRAP RESULTS ====================
    path('amrap-results/', AmrapResultListCreate.as_view(), name='amrap-result-list-create'),
    path('amrap-results/<int:pk>/', AmrapResultDetail.as_view(), name='amrap-result-detail'),
    
    # ==================== EMOM RESULTS ====================
    path('emom-results/', EmomResultListCreate.as_view(), name='emom-result-list-create'),
    path('emom-results/<int:pk>/', EmomResultDetail.as_view(), name='emom-result-detail'),
]

# Documentação dos endpoints
WOD_API_ENDPOINTS = {
    'MOVEMENT_TYPES': [
        'GET /api/v1/movement-types/ - Listar tipos de movimento',
        'GET /api/v1/movement-types/{id}/ - Detalhes do tipo',
        'POST /api/v1/movement-types/ - Criar tipo (admin)',
        'PUT /api/v1/movement-types/{id}/ - Atualizar tipo (admin)',
        'DELETE /api/v1/movement-types/{id}/ - Deletar tipo (admin)',
    ],
    'MOVEMENTS': [
        'GET /api/v1/movements/ - Listar movimentos (com filtro por type)',
        'GET /api/v1/movements/{id}/ - Detalhes do movimento',
        'GET /api/v1/movements/by-type/?type_id=1 - Movimentos por tipo',
        'POST /api/v1/movements/ - Criar movimento (admin)',
        'PUT /api/v1/movements/{id}/ - Atualizar movimento (admin)',
        'DELETE /api/v1/movements/{id}/ - Deletar movimento (admin)',
    ],
    'WODS': [
        'GET /api/v1/wods/ - Listar WODs (com filtros)',
        'GET /api/v1/wods/{id}/ - Detalhes do WOD',
        'GET /api/v1/wods/today/ - WOD de hoje',
        'GET /api/v1/wods/pinned/ - WOD fixado',
        'GET /api/v1/wods/by-date/?date=YYYY-MM-DD - WOD por data',
        'GET /api/v1/wods/by-type/?type=FOR_TIME - WODs por tipo',
        'GET /api/v1/wods/latest/?limit=7 - Últimos WODs',
        'GET /api/v1/wods/my-wods/ - Meus WODs (coach)',
        'GET /api/v1/wods/my-done/ - WODs que fiz',
        'POST /api/v1/wods/ - Criar WOD (coach apenas)',
        'POST /api/v1/wods/{id}/like/ - Curtir/descurtir',
        'GET /api/v1/wods/{id}/likes/ - Listar likes',
        'POST /api/v1/wods/{id}/pin/ - Fixar WOD (coach)',
        'PUT /api/v1/wods/{id}/ - Atualizar WOD (coach)',
        'DELETE /api/v1/wods/{id}/ - Deletar WOD (coach)',
    ],
    'WOD_MOVEMENTS': [
        'GET /api/v1/wod-movements/ - Listar movimentos do WOD',
        'GET /api/v1/wod-movements/{id}/ - Detalhes',
        'POST /api/v1/wod-movements/ - Adicionar movimento (coach)',
        'PUT /api/v1/wod-movements/{id}/ - Atualizar (coach)',
        'DELETE /api/v1/wod-movements/{id}/ - Remover (coach)',
    ],
    'WOD_RESULTS': [
        'GET /api/v1/wod-results/ - Listar resultados (com filtros)',
        'GET /api/v1/wod-results/{id}/ - Detalhes do resultado',
        'GET /api/v1/wod-results/my-results/ - Meus resultados',
        'GET /api/v1/wod-results/by-wod/?wod_id=1 - Resultados do WOD',
        'GET /api/v1/wod-results/leaderboard/?wod_id=1 - Ranking',
        'POST /api/v1/wod-results/ - Registrar resultado',
        'PUT /api/v1/wod-results/{id}/ - Atualizar resultado',
        'DELETE /api/v1/wod-results/{id}/ - Deletar resultado',
    ],
    'RESULT_MOVEMENTS': [
        'GET /api/v1/result-movements/ - Listar movimentos do resultado',
        'GET /api/v1/result-movements/{id}/ - Detalhes',
        'POST /api/v1/result-movements/ - Adicionar movimento',
        'PUT /api/v1/result-movements/{id}/ - Atualizar',
        'DELETE /api/v1/result-movements/{id}/ - Remover',
    ],
    'FOR_TIME_RESULTS': [
        'GET /api/v1/for-time-results/ - Listar resultados FOR_TIME',
        'GET /api/v1/for-time-results/{id}/ - Detalhes',
        'POST /api/v1/for-time-results/ - Registrar tempo',
        'PUT /api/v1/for-time-results/{id}/ - Atualizar tempo',
    ],
    'AMRAP_RESULTS': [
        'GET /api/v1/amrap-results/ - Listar resultados AMRAP',
        'GET /api/v1/amrap-results/{id}/ - Detalhes',
        'POST /api/v1/amrap-results/ - Registrar rounds',
        'PUT /api/v1/amrap-results/{id}/ - Atualizar rounds',
    ],
    'EMOM_RESULTS': [
        'GET /api/v1/emom-results/ - Listar resultados EMOM',
        'GET /api/v1/emom-results/{id}/ - Detalhes',
        'POST /api/v1/emom-results/ - Registrar rounds completos',
        'PUT /api/v1/emom-results/{id}/ - Atualizar rounds',
    ],
}
