# 🏋️ WOD API REST - Resumo de Implementação

## ✅ O Que Foi Criado

### 1. **ViewSets Completos** (`/app/WOD/viewsets.py`)

#### 9 ViewSets Implementados:

1. **MovementTypeViewSet**
   - CRUD de tipos de movimento
   - Filtros: search por nome
   - Essencial para caracterizar movimentos

2. **MovementViewSet**
   - CRUD de movimentos
   - Filtros: por tipo, busca
   - Ação especial: `by_type()` para filtrar por tipo

3. **WODViewSet** ⭐ Principal
   - CRUD de WODs
   - Ações especiais:
     - `like()` - Curtir/descurtir WOD
     - `pin()` - Fixar WOD na tela inicial
     - `today()` - WOD de hoje
     - `pinned()` - WOD fixado
     - `by_date()` - WOD de data específica
     - `by_type()` - Filtrar por tipo (FOR_TIME, AMRAP, EMOM)
     - `latest()` - Últimos N WODs
     - `my_wods()` - WODs criados pelo coach (requer auth)
     - `my_done()` - WODs realizados pelo usuário (requer auth)

4. **WodMovementViewSet**
   - Gerencia movimentos dentro de WODs
   - Relaciona movimento + reps + carga + ordem
   - Apenas coach pode adicionar/editar/deletar

5. **WodResultViewSet** ⭐ Principal
   - CRUD de resultados de treino
   - Ações especiais:
     - `my_results()` - Meus resultados
     - `by_wod()` - Resultados de um WOD
     - `leaderboard()` - Ranking do WOD
   - Suporta todos os tipos de WOD

6. **ResultMovementViewSet**
   - Registra desempenho individual por movimento
   - Snapshot do esperado vs realizado
   - Otimiza análise de performance

7. **ForTimeResultViewSet**
   - Específico para WODs FOR_TIME
   - Registra tempo em segundos
   - Formato: HH:MM:SS

8. **AmrapResultViewSet**
   - Específico para WODs AMRAP
   - Registra rounds + reps
   - Formato: NrM + Nrep

9. **EmomResultViewSet**
   - Específico para WODs EMOM
   - Registra rounds completados
   - Minuto em que falhou (opcional)

---

## 📊 Serializers Criados

| Serializer | Propósito |
|-----------|-----------|
| `MovementTypeSerializer` | Serialização básica de tipos |
| `MovementSimpleSerializer` | Listagem simplificada |
| `MovementDetailSerializer` | Detalhes completos |
| `WodDetailSerializer` | WOD com movimentos e status |
| `WodCreateUpdateSerializer` | Criação/atualização de WOD |
| `WodMovementSerializer` | Movimento dentro de WOD |
| `WodResultDetailSerializer` | Resultado com todos os dados |
| `WodResultCreateSerializer` | Criação simplificada |
| `ResultMovementSerializer` | Movimentos do resultado |
| `ForTimeResultSerializer` | Resultado FOR_TIME com formatação |
| `AmrapResultSerializer` | Resultado AMRAP com formatação |
| `EmomResultSerializer` | Resultado EMOM |

---

## 🔗 URLs Disponíveis

```
# Tipos de Movimento
GET    /api/v1/movement-types/
POST   /api/v1/movement-types/
GET    /api/v1/movement-types/{id}/
PUT    /api/v1/movement-types/{id}/
DELETE /api/v1/movement-types/{id}/

# Movimentos
GET    /api/v1/movements/
GET    /api/v1/movements/by_type/?type_id=1
POST   /api/v1/movements/
GET    /api/v1/movements/{id}/
PUT    /api/v1/movements/{id}/
DELETE /api/v1/movements/{id}/

# WODs ⭐
GET    /api/v1/wods/
GET    /api/v1/wods/today/
GET    /api/v1/wods/pinned/
GET    /api/v1/wods/by_date/?date=2024-01-15
GET    /api/v1/wods/by_type/?type=FOR_TIME
GET    /api/v1/wods/latest/?limit=7
GET    /api/v1/wods/my_wods/
GET    /api/v1/wods/my_done/
POST   /api/v1/wods/
GET    /api/v1/wods/{id}/
PUT    /api/v1/wods/{id}/
DELETE /api/v1/wods/{id}/
POST   /api/v1/wods/{id}/like/
GET    /api/v1/wods/{id}/likes/
POST   /api/v1/wods/{id}/pin/

# Movimentos do WOD
GET    /api/v1/wod-movements/
POST   /api/v1/wod-movements/
PUT    /api/v1/wod-movements/{id}/
DELETE /api/v1/wod-movements/{id}/

# Resultados de WOD ⭐
GET    /api/v1/wod-results/
GET    /api/v1/wod-results/my_results/
GET    /api/v1/wod-results/by_wod/?wod_id=1
GET    /api/v1/wod-results/leaderboard/?wod_id=1&limit=10
POST   /api/v1/wod-results/
GET    /api/v1/wod-results/{id}/
PUT    /api/v1/wod-results/{id}/
DELETE /api/v1/wod-results/{id}/

# Movimentos do Resultado
GET    /api/v1/result-movements/
POST   /api/v1/result-movements/
PUT    /api/v1/result-movements/{id}/
DELETE /api/v1/result-movements/{id}/

# Resultados Específicos por Tipo
GET    /api/v1/for-time-results/
POST   /api/v1/for-time-results/
PUT    /api/v1/for-time-results/{id}/

GET    /api/v1/amrap-results/
POST   /api/v1/amrap-results/
PUT    /api/v1/amrap-results/{id}/

GET    /api/v1/emom-results/
POST   /api/v1/emom-results/
PUT    /api/v1/emom-results/{id}/
```

---

## 🚀 Como Integrar

### Passo 1: Adicione o Router ao urls.py

```python
# app/urls.py
from django.urls import path, include
from WOD.api_urls import router as wod_router

urlpatterns = [
    # ... suas URLs
    path('api/v1/', include(wod_router.urls)),
]
```

### Passo 2: Instale Dependências (se não tiver)

```bash
pip install djangorestframework django-filter
```

### Passo 3: Configure settings.py

```python
INSTALLED_APPS = [
    'rest_framework',
    'django_filters',
]

REST_FRAMEWORK = {
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',
    ],
}
```

### Passo 4: Migre

```bash
python manage.py migrate
```

### Passo 5: Teste

```bash
curl http://localhost:8000/api/v1/wods/today/
```

---

## 📋 Fluxo de Dados

### Criar e Executar um WOD - Fluxo Completo

```
1. COACH cria WOD
   POST /api/v1/wods/
   ↓
2. COACH adiciona movimentos
   POST /api/v1/wod-movements/
   ↓
3. COACH fixa o WOD (opcional)
   POST /api/v1/wods/{id}/pin/
   ↓
4. ATLETA consulta WOD de hoje
   GET /api/v1/wods/today/
   ↓
5. ATLETA registra resultado
   POST /api/v1/wod-results/
   ↓
6. ATLETA registra tempo/rounds/reps
   POST /api/v1/for-time-results/
   (ou AMRAP/EMOM conforme tipo)
   ↓
7. ATLETA registra movimentos individuais (opcional)
   POST /api/v1/result-movements/
   ↓
8. TODOS consultam ranking
   GET /api/v1/wod-results/leaderboard/?wod_id={id}
```

---

## 🔐 Permissões Implementadas

### Criação/Atualização de WOD
- ✅ Apenas usuários com `is_coach=True` podem criar
- ✅ Apenas o coach que criou pode atualizar/deletar

### Registro de Resultados
- ✅ Apenas o próprio usuário pode registrar resultado
- ✅ Apenas o dono pode atualizar/deletar seu resultado

### Likes e Fixação
- ✅ Qualquer usuário autenticado pode curtir
- ✅ Apenas coach que criou pode fixar

### Leitura
- ✅ Todos podem listar e ver detalhes (sem auth necessária)

---

## 📊 Tipos de WOD Suportados

### 1. FOR_TIME (Fazer máximo de reps em tempo limitado)
```json
{
  "type": "FOR_TIME",
  "duration": 20,
  "result": { "time_seconds": 1205 }
}
// Resultado: 20:05 minutos
```

### 2. AMRAP (As Many Rounds As Possible em tempo limitado)
```json
{
  "type": "AMRAP",
  "duration": 15,
  "result": { "rounds": 15, "reps": 7 }
}
// Resultado: 15 rounds + 7 reps
```

### 3. EMOM (Every Minute on the Minute - tarefa a cada minuto)
```json
{
  "type": "EMOM",
  "duration": 20,
  "result": { "rounds_completed": 20, "failed_minute": null }
}
// Resultado: Completou 20 minutos sem falhar
```

---

## 🏆 Ranking e Leaderboard

### Automático por Tipo

**FOR_TIME:**
- Ranking por tempo (menor é melhor)
- Formatado como MM:SS

**AMRAP:**
- Ranking por rounds (maior é melhor)
- Desempate por reps

**EMOM:**
- Ranking por rounds completados (maior é melhor)
- Desempate por minuto falho

### Acesso

```bash
GET /api/v1/wod-results/leaderboard/?wod_id=1&limit=10

Retorna:
{
  "position": 1,
  "username": "athlete1",
  "completed": true,
  "date": "2024-01-15T10:00:00Z",
  "time_formatted": "20:05",  // FOR_TIME
  "result_formatted": "15r + 7rep"  // AMRAP
}
```

---

## 🎯 Filtros e Buscas Disponíveis

### WODs
```
search=    // título ou descrição
type=      // FOR_TIME, AMRAP, EMOM
coach=     // ID do coach
pinned=    // true/false
ordering=  // -date, -created_at, date, created_at
```

### Movimentos
```
search=    // nome ou descrição
type=      // ID do tipo
ordering=  // name
```

### Resultados
```
user=      // ID do usuário
wod=       // ID do WOD
completed= // true/false
ordering=  // -date
```

---

## 📝 Exemplos Práticos

### Criar um WOD FOR_TIME

```bash
curl -X POST http://localhost:8000/api/v1/wods/ \
  -H "Authorization: Token token123" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Hero WOD - Filthy Fifty",
    "description_wod": "50 reps de 10 movimentos diferentes",
    "type": "FOR_TIME",
    "duration": 50,
    "date": "2024-01-15",
    "pinned": true
  }'
```

### Adicionar Movimento ao WOD

```bash
curl -X POST http://localhost:8000/api/v1/wod-movements/ \
  -H "Authorization: Token token123" \
  -H "Content-Type: application/json" \
  -d '{
    "wod": 1,
    "movement": 5,
    "reps": 50,
    "load": null,
    "order": 1,
    "notes": "Box jumps 20\""
  }'
```

### Registrar Resultado

```bash
curl -X POST http://localhost:8000/api/v1/wod-results/ \
  -H "Authorization: Token token123" \
  -H "Content-Type: application/json" \
  -d '{
    "wod": 1,
    "completed": true,
    "notes": "Muito puxado!"
  }'
```

### Registrar Tempo

```bash
curl -X POST http://localhost:8000/api/v1/for-time-results/ \
  -H "Authorization: Token token123" \
  -H "Content-Type: application/json" \
  -d '{
    "wod_result": 1,
    "time_seconds": 3215  // 53:35
  }'
```

### Ver Ranking do WOD

```bash
curl http://localhost:8000/api/v1/wod-results/leaderboard/?wod_id=1&limit=10
```

---

## 🔍 Performance

### Otimizações Implementadas

- ✅ `select_related()` para ForeignKeys
- ✅ `prefetch_related()` para ManyToMany e Reverse ForeignKeys
- ✅ Filtros com índices de banco de dados
- ✅ Paginação para grandes conjuntos
- ✅ Serializers aninhados para dados relacionados

---

## 📚 Arquivos Fornecidos

| Arquivo | Propósito |
|---------|----------|
| `WOD/viewsets.py` | 9 ViewSets com lógica completa |
| `WOD/api_urls.py` | Configuração do router |
| `WOD_API_DOCUMENTATION.md` | Documentação completa com exemplos |
| `WOD_API_SUMMARY.md` | Este arquivo |

---

## 🎓 Próximos Passos

1. ✅ Integre o router ao urls.py
2. ✅ Configure settings.py
3. ✅ Execute migrações
4. ✅ Teste endpoints com cURL
5. ✅ Implemente no frontend
6. ✅ Configure cache (opcional)
7. ✅ Adicione rate limiting (opcional)

---

## 📞 Documentação

Consulte `WOD_API_DOCUMENTATION.md` para:
- Todos os endpoints
- Query parameters
- Exemplos de requisições
- Estrutura de respostas
- Códigos de status HTTP

---

**API WOD Totalmente Implementada! 🚀**

Todos os 50+ endpoints estão prontos para uso com validações, permissões e performance otimizada.
