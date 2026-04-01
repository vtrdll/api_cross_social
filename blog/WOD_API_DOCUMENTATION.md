# 🏋️ API REST WOD - Documentação Completa

## Introdução

Esta documentação descreve todos os endpoints da API REST para o WOD App (Workout of the Day), incluindo criação de WODs, registro de resultados e ranking de atletas.

---

## 📋 Índice

1. [Setup](#setup)
2. [Autenticação](#autenticação)
3. [Tipos de Movimento](#tipos-de-movimento)
4. [Movimentos](#movimentos)
5. [WODs](#wods)
6. [Movimentos do WOD](#movimentos-do-wod)
7. [Resultados de WOD](#resultados-de-wod)
8. [Ranking](#ranking)
9. [Exemplos com cURL](#exemplos-com-curl)

---

## Setup

### 1. Instale as dependências

```bash
pip install djangorestframework
pip install django-filter
```

### 2. Adicione ao `urls.py` principal

```python
from django.urls import path, include
from WOD.api_urls import router as wod_router

urlpatterns = [
    path('api/v1/', include(wod_router.urls)),
]
```

### 3. Configure `settings.py`

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

---

## Autenticação

A maioria dos endpoints requer autenticação com Token:

```bash
curl -H "Authorization: Token seu_token_aqui" http://localhost:8000/api/v1/wods/
```

### Obter Token

```bash
# Criar token para usuário
python manage.py shell
>>> from rest_framework.authtoken.models import Token
>>> user = User.objects.get(username='seu_usuario')
>>> token, created = Token.objects.get_or_create(user=user)
>>> print(token.key)
```

---

## 📁 Tipos de Movimento

### Listar Tipos

```bash
GET /api/v1/movement-types/

Query Params:
- search=termo (buscar por nome)
```

**Resposta:**
```json
[
  {
    "id": 1,
    "name": "Agachamento",
    "requires_load": true,
    "requires_reps": true
  },
  {
    "id": 2,
    "name": "Corrida",
    "requires_load": false,
    "requires_reps": false
  }
]
```

### Criar Tipo (Admin)

```bash
POST /api/v1/movement-types/
Content-Type: application/json
Authorization: Token <TOKEN>

{
  "name": "Levantamento Terra",
  "requires_load": true,
  "requires_reps": true
}
```

---

## ⚙️ Movimentos

### Listar Movimentos

```bash
GET /api/v1/movements/

Query Params:
- type=1 (filtrar por tipo)
- search=agachamento (buscar)
```

**Resposta:**
```json
[
  {
    "id": 1,
    "name": "Agachamento Frontal",
    "type": 1,
    "type_name": "Agachamento",
    "description": "Agachamento frontal com barra"
  }
]
```

### Movimentos por Tipo

```bash
GET /api/v1/movements/by_type/?type_id=1

Resposta:
{
  "type_id": 1,
  "total": 3,
  "movements": [...]
}
```

### Criar Movimento

```bash
POST /api/v1/movements/
Content-Type: application/json
Authorization: Token <TOKEN>

{
  "name": "Leg Press",
  "type": 1,
  "description": "Leg Press no aparelho"
}
```

---

## 💪 WODs (Workout of the Day)

### Listar WODs

```bash
GET /api/v1/wods/

Query Params:
- type=FOR_TIME (filtrar por tipo)
- coach=1 (filtrar por coach)
- search=treino (buscar)
- ordering=-date (ordenar por data desc)
- pinned=true (apenas fixados)
```

**Resposta:**
```json
{
  "count": 50,
  "next": "http://localhost:8000/api/v1/wods/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "title": "Treino de Força",
      "description_wod": "Descrição completa...",
      "type": "FOR_TIME",
      "duration": 20,
      "coach": 1,
      "coach_name": "coach_username",
      "coach_id": 1,
      "date": "2024-01-15",
      "pinned": false,
      "likes_count": 5,
      "is_liked": false,
      "created_at": "2024-01-15T10:00:00Z",
      "movements": [...],
      "results_count": 10
    }
  ]
}
```

### WOD de Hoje

```bash
GET /api/v1/wods/today/

Retorna o WOD agendado para hoje (se houver)
```

### WOD Fixado

```bash
GET /api/v1/wods/pinned/

Retorna o WOD fixado na tela inicial
```

### WOD por Data Específica

```bash
GET /api/v1/wods/by_date/?date=2024-01-15

Retorna o WOD de uma data específica
```

### WODs por Tipo

```bash
GET /api/v1/wods/by_type/?type=AMRAP

Tipos disponíveis:
- FOR_TIME (Fazer o máximo de reps em tempo limitado)
- AMRAP (As Many Rounds As Possible em tempo limitado)
- EMOM (Every Minute on the Minute - fazer em cada minuto)

Retorna:
{
  "type": "AMRAP",
  "total": 5,
  "wods": [...]
}
```

### Últimos WODs

```bash
GET /api/v1/wods/latest/?limit=7

Retorna os últimos 7 WODs (padrão)
```

### Meus WODs (Coach)

```bash
GET /api/v1/wods/my_wods/
Authorization: Token <TOKEN>

Retorna WODs criados pelo coach autenticado
```

### WODs Realizados

```bash
GET /api/v1/wods/my_done/
Authorization: Token <TOKEN>

Retorna WODs que o usuário realizou (tem resultado registrado)
```

### Criar WOD (Apenas Coach)

```bash
POST /api/v1/wods/
Content-Type: application/json
Authorization: Token <TOKEN>

{
  "title": "WOD de Terça",
  "description_wod": "Descrição completa do treino...",
  "type": "FOR_TIME",  // FOR_TIME, AMRAP ou EMOM
  "duration": 20,      // em minutos (para AMRAP e EMOM)
  "date": "2024-01-15",
  "pinned": false
}

Resposta 201 Created:
{
  "id": 1,
  "title": "WOD de Terça",
  ...
}
```

### Atualizar WOD (Coach)

```bash
PUT /api/v1/wods/{id}/
Content-Type: application/json
Authorization: Token <TOKEN>

{
  "title": "WOD atualizado",
  "description_wod": "Nova descrição..."
}
```

### Deletar WOD (Coach)

```bash
DELETE /api/v1/wods/{id}/
Authorization: Token <TOKEN>
```

### Curtir WOD

```bash
POST /api/v1/wods/{id}/like/
Authorization: Token <TOKEN>

Resposta (primeira vez - gosta):
{
  "detail": "WOD foi curtido",
  "liked": true
}

Resposta (segunda vez - remove like):
{
  "detail": "Like removido",
  "liked": false
}
```

### Ver Likes do WOD

```bash
GET /api/v1/wods/{id}/likes/

Resposta:
{
  "wod_id": 1,
  "wod_title": "WOD de Terça",
  "likes_count": 5,
  "users": ["user1", "user2", "user3", ...]
}
```

### Fixar WOD (Coach)

```bash
POST /api/v1/wods/{id}/pin/
Authorization: Token <TOKEN>

Resposta:
{
  "detail": "WOD fixado na tela inicial",
  "wod_id": 1,
  "pinned": true
}

Nota: Ao fixar um WOD, todos os outros são automaticamente desfixados
```

---

## 🏃 Movimentos do WOD

### Listar Movimentos do WOD

```bash
GET /api/v1/wod-movements/

Query Params:
- wod=1 (filtrar por WOD)
- movement=2 (filtrar por movimento)
```

**Resposta:**
```json
[
  {
    "id": 1,
    "wod": 1,
    "wod_title": "WOD de Terça",
    "movement": 2,
    "movement_name": "Agachamento",
    "reps": 20,
    "load": 50.0,
    "order": 1,
    "notes": "RX"
  }
]
```

### Adicionar Movimento ao WOD (Coach)

```bash
POST /api/v1/wod-movements/
Content-Type: application/json
Authorization: Token <TOKEN>

{
  "wod": 1,
  "movement": 2,
  "reps": 20,
  "load": 50.0,
  "order": 1,
  "notes": "RX"
}
```

### Atualizar Movimento

```bash
PUT /api/v1/wod-movements/{id}/
Content-Type: application/json
Authorization: Token <TOKEN>

{
  "reps": 15,
  "load": 60.0,
  "notes": "RX puxar da caixa"
}
```

### Remover Movimento

```bash
DELETE /api/v1/wod-movements/{id}/
Authorization: Token <TOKEN>
```

---

## 📊 Resultados de WOD

### Listar Resultados

```bash
GET /api/v1/wod-results/

Query Params:
- user=1 (filtrar por usuário)
- wod=1 (filtrar por WOD)
- completed=true (apenas completos)
```

### Meus Resultados

```bash
GET /api/v1/wod-results/my_results/
Authorization: Token <TOKEN>

Resposta:
{
  "total": 10,
  "results": [
    {
      "id": 1,
      "user": 1,
      "username": "athlete1",
      "wod": 1,
      "wod_title": "WOD de Terça",
      "wod_type": "FOR_TIME",
      "completed": true,
      "notes": "Senti leve",
      "date": "2024-01-15T10:00:00Z",
      "movements": [...],
      "for_time": {
        "id": 1,
        "wod_result": 1,
        "time_seconds": 1205,
        "time_formatted": "20:05"
      }
    }
  ]
}
```

### Resultados de um WOD

```bash
GET /api/v1/wod-results/by_wod/?wod_id=1

Retorna todos os resultados de um WOD específico
```

### Registrar Resultado

```bash
POST /api/v1/wod-results/
Content-Type: application/json
Authorization: Token <TOKEN>

{
  "wod": 1,
  "completed": true,
  "notes": "Treino bom"
}

Resposta 201:
{
  "id": 1,
  "user": 1,
  "username": "seu_username",
  "wod": 1,
  ...
}
```

### Atualizar Resultado

```bash
PUT /api/v1/wod-results/{id}/
Content-Type: application/json
Authorization: Token <TOKEN>

{
  "completed": true,
  "notes": "Novas notas"
}
```

### Deletar Resultado

```bash
DELETE /api/v1/wod-results/{id}/
Authorization: Token <TOKEN>
```

---

## 🥇 Ranking dos WODs

### Ranking FOR_TIME

```bash
GET /api/v1/wod-results/leaderboard/?wod_id=1&limit=10

Resposta:
{
  "wod_id": 1,
  "wod_title": "Treino de Terça",
  "wod_type": "FOR_TIME",
  "leaderboard": [
    {
      "position": 1,
      "username": "athlete1",
      "completed": true,
      "date": "2024-01-15T10:00:00Z",
      "time": 1205,
      "time_formatted": "20:05"
    },
    {
      "position": 2,
      "username": "athlete2",
      "completed": true,
      "date": "2024-01-15T10:15:00Z",
      "time": 1215,
      "time_formatted": "20:15"
    }
  ]
}
```

### Ranking AMRAP

```bash
GET /api/v1/wod-results/leaderboard/?wod_id=2&limit=10

Resposta para AMRAP:
{
  "leaderboard": [
    {
      "position": 1,
      "username": "athlete1",
      "completed": true,
      "date": "2024-01-15T10:00:00Z",
      "rounds": 15,
      "reps": 7,
      "result_formatted": "15r + 7rep"
    }
  ]
}
```

### Ranking EMOM

```bash
GET /api/v1/wod-results/leaderboard/?wod_id=3

Resposta para EMOM:
{
  "leaderboard": [
    {
      "position": 1,
      "username": "athlete1",
      "completed": true,
      "date": "2024-01-15T10:00:00Z",
      "rounds_completed": 20,
      "failed_minute": null
    }
  ]
}
```

---

## 📝 Resultados Específicos por Tipo

### FOR_TIME Results

```bash
# Registrar tempo
POST /api/v1/for-time-results/
Content-Type: application/json
Authorization: Token <TOKEN>

{
  "wod_result": 1,
  "time_seconds": 1205  // 20:05
}

# Atualizar tempo
PUT /api/v1/for-time-results/{id}/
{
  "time_seconds": 1210  // 20:10
}
```

### AMRAP Results

```bash
# Registrar rounds + reps
POST /api/v1/amrap-results/
Content-Type: application/json
Authorization: Token <TOKEN>

{
  "wod_result": 1,
  "rounds": 15,
  "reps": 7
}
```

### EMOM Results

```bash
# Registrar rounds completados
POST /api/v1/emom-results/
Content-Type: application/json
Authorization: Token <TOKEN>

{
  "wod_result": 1,
  "rounds_completed": 20,
  "failed_minute": null  // minuto que falhou (opcional)
}
```

---

## 📍 Movimentos no Resultado

### Registrar Movimentos do Resultado

```bash
POST /api/v1/result-movements/
Content-Type: application/json
Authorization: Token <TOKEN>

{
  "wod_result": 1,
  "movement": 2,
  "reps_expected": 20,
  "load_expected": 50.0,
  "reps_done": 20,
  "load_used": 50.0,
  "order": 1,
  "notes": "Com facilidade"
}
```

---

## 🔄 Fluxo Completo - Exemplo Prático

### 1. Coach Cria um WOD

```bash
POST /api/v1/wods/
{
  "title": "Força de Terça",
  "description_wod": "3 x 5 Agachamento + 400m Corrida",
  "type": "FOR_TIME",
  "duration": 20,
  "date": "2024-01-15"
}

Resposta: { "id": 1, ... }
```

### 2. Coach Adiciona Movimentos

```bash
POST /api/v1/wod-movements/
{
  "wod": 1,
  "movement": 1,  // Agachamento
  "reps": 5,
  "load": 100.0,
  "order": 1,
  "notes": "3 séries"
}

POST /api/v1/wod-movements/
{
  "wod": 1,
  "movement": 3,  // Corrida
  "reps": 1,
  "load": null,
  "order": 2,
  "notes": "400m"
}
```

### 3. Atleta Registra Resultado

```bash
POST /api/v1/wod-results/
{
  "wod": 1,
  "completed": true,
  "notes": "Bom treino!"
}

Resposta: { "id": 1, ... }
```

### 4. Atleta Registra Tempo (FOR_TIME)

```bash
POST /api/v1/for-time-results/
{
  "wod_result": 1,
  "time_seconds": 1205  // 20:05
}
```

### 5. Atleta Registra Desempenho Individual

```bash
POST /api/v1/result-movements/
{
  "wod_result": 1,
  "movement": 1,
  "reps_expected": 5,
  "load_expected": 100.0,
  "reps_done": 5,
  "load_used": 100.0,
  "order": 1,
  "notes": "RX"
}
```

### 6. Ver Ranking

```bash
GET /api/v1/wod-results/leaderboard/?wod_id=1&limit=10
```

---

## 📝 Exemplos com cURL

### Listar WODs de Hoje

```bash
curl http://localhost:8000/api/v1/wods/today/
```

### Criar WOD (Coach)

```bash
curl -X POST http://localhost:8000/api/v1/wods/ \
  -H "Authorization: Token abc123def456" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "WOD de Segunda",
    "description_wod": "Força pura",
    "type": "FOR_TIME",
    "duration": 15,
    "date": "2024-01-15",
    "pinned": false
  }'
```

### Curtir WOD

```bash
curl -X POST http://localhost:8000/api/v1/wods/1/like/ \
  -H "Authorization: Token abc123def456"
```

### Fixar WOD

```bash
curl -X POST http://localhost:8000/api/v1/wods/1/pin/ \
  -H "Authorization: Token abc123def456"
```

### Registrar Resultado

```bash
curl -X POST http://localhost:8000/api/v1/wod-results/ \
  -H "Authorization: Token abc123def456" \
  -H "Content-Type: application/json" \
  -d '{
    "wod": 1,
    "completed": true,
    "notes": "Treino intenso!"
  }'
```

### Registrar Tempo FOR_TIME

```bash
curl -X POST http://localhost:8000/api/v1/for-time-results/ \
  -H "Authorization: Token abc123def456" \
  -H "Content-Type: application/json" \
  -d '{
    "wod_result": 1,
    "time_seconds": 1205
  }'
```

### Ver Ranking do WOD

```bash
curl http://localhost:8000/api/v1/wod-results/leaderboard/?wod_id=1&limit=10
```

---

## 🔐 Permissões

| Ação | Requer Auth | Requer Coach | Requer Dono |
|------|-------------|--------------|-------------|
| Listar | Não | Não | Não |
| Ver Detalhes | Não | Não | Não |
| Criar WOD | Sim | ✓ | ✓ |
| Atualizar WOD | Sim | ✓ | ✓ |
| Deletar WOD | Sim | ✓ | ✓ |
| Curtir | Sim | Não | Não |
| Fixar | Sim | ✓ | ✓ |
| Registrar Resultado | Sim | Não | ✓ |
| Atualizar Resultado | Sim | Não | ✓ |
| Deletar Resultado | Sim | Não | ✓ |

---

## 📊 Códigos de Status HTTP

- `200 OK` - Sucesso
- `201 Created` - Recurso criado
- `400 Bad Request` - Dados inválidos
- `401 Unauthorized` - Autenticação necessária
- `403 Forbidden` - Acesso negado
- `404 Not Found` - Recurso não encontrado
- `500 Server Error` - Erro do servidor

---

## 🎯 Filtros Globais

### Search
```bash
?search=terça  # Busca em 'title' e 'description_wod'
```

### Ordering
```bash
?ordering=-date      # Ordenar por data descendente
?ordering=created_at # Ordenar por data de criação
```

### Paginação
```bash
?limit=20&offset=0   # 20 por página, começando no 0
?page=2              # Segunda página
```

---

## 💡 Dicas e Boas Práticas

1. **Sempre registre movimentos** - Permite análise detalhada de performance
2. **Use notas** - Anotações de "Scaled" ou observações são úteis
3. **Atualize regularmente** - Mantenha histórico de treinos
4. **Faça cache** - Use `Cache-Control: max-age=300` em GETs
5. **Use filtros** - Evite carregar dados desnecessários

---

**Documentação Completa! 🚀**
