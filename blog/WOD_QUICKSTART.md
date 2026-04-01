# 🚀 WOD API - Quick Start Guide

## 5 Minutos para Ativar a API

### 1️⃣ Adicione ao `urls.py`

Editar `/app/app/urls.py`:

```python
from django.urls import path, include
from WOD.api_urls import router as wod_router  # ←← ADICIONE

urlpatterns = [
    # ... suas URLs existentes
    path('api/v1/', include(wod_router.urls)),  # ←← ADICIONE
]
```

### 2️⃣ Execute Migrações

```bash
python manage.py migrate
```

### 3️⃣ Teste a API

```bash
# Terminal 1: Inicie o servidor
python manage.py runserver

# Terminal 2: Teste um endpoint
curl http://localhost:8000/api/v1/wods/

# Se tiver dados, verá:
{
  "count": 0,
  "next": null,
  "previous": null,
  "results": []
}
```

✅ **Pronto! A API está ativa!**

---

## 📱 Endpoints Essenciais

### Para Coach (Criar WODs)

```bash
# 1. Criar WOD
POST /api/v1/wods/
{
  "title": "Segunda - Perna",
  "description_wod": "Força e volume",
  "type": "FOR_TIME",
  "duration": 20,
  "date": "2024-01-15"
}

# 2. Adicionar movimento
POST /api/v1/wod-movements/
{
  "wod": 1,
  "movement": 1,
  "reps": 20,
  "load": 50,
  "order": 1
}

# 3. Fixar WOD
POST /api/v1/wods/1/pin/
```

### Para Atleta (Fazer WODs)

```bash
# 1. Ver WOD de hoje
GET /api/v1/wods/today/

# 2. Registrar resultado
POST /api/v1/wod-results/
{
  "wod": 1,
  "completed": true,
  "notes": "Bom treino"
}

# 3. Registrar tempo
POST /api/v1/for-time-results/
{
  "wod_result": 1,
  "time_seconds": 1205
}

# 4. Ver ranking
GET /api/v1/wod-results/leaderboard/?wod_id=1
```

### Para Todos

```bash
# Ver WODs
GET /api/v1/wods/

# Curtir WOD
POST /api/v1/wods/1/like/

# Meus resultados
GET /api/v1/wod-results/my_results/

# Últimos WODs
GET /api/v1/wods/latest/?limit=7
```

---

## 🔑 Obter Token de Autenticação

### Opção 1: Django Shell

```bash
python manage.py shell
```

```python
from rest_framework.authtoken.models import Token
from django.contrib.auth.models import User

user = User.objects.get(username='seu_usuario')
token, created = Token.objects.get_or_create(user=user)
print(token.key)
# Copie este token!
```

### Opção 2: Via POST (se tiver endpoint de login)

```bash
POST /api/token/
{
  "username": "seu_usuario",
  "password": "sua_senha"
}

# Resposta:
{
  "token": "abc123def456..."
}
```

---

## 🧪 Testando com cURL

### Setup (Copie para seu terminal)

```bash
# Substitua com seu token real
TOKEN="seu_token_aqui"
BASE_URL="http://localhost:8000/api/v1"
```

### Exemplos

```bash
# Listar WODs
curl $BASE_URL/wods/

# WOD de hoje
curl $BASE_URL/wods/today/

# Criar WOD (precisa token + ser coach)
curl -X POST $BASE_URL/wods/ \
  -H "Authorization: Token $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "WOD",
    "description_wod": "Treino",
    "type": "FOR_TIME",
    "duration": 15,
    "date": "2024-01-15"
  }'

# Curtir WOD
curl -X POST $BASE_URL/wods/1/like/ \
  -H "Authorization: Token $TOKEN"

# Meus resultados
curl $BASE_URL/wod-results/my_results/ \
  -H "Authorization: Token $TOKEN"

# Ranking do WOD
curl "$BASE_URL/wod-results/leaderboard/?wod_id=1&limit=10"
```

---

## 🌐 Testando com Frontend JS

### Setup React/Vue

```javascript
const API_URL = "http://localhost:8000/api/v1";
const TOKEN = localStorage.getItem('token');

const headers = {
  'Content-Type': 'application/json',
  ...(TOKEN && { 'Authorization': `Token ${TOKEN}` })
};
```

### Listar WODs

```javascript
fetch(`${API_URL}/wods/`)
  .then(r => r.json())
  .then(data => console.log(data.results))
  .catch(e => console.error(e));
```

### Criar WOD

```javascript
fetch(`${API_URL}/wods/`, {
  method: 'POST',
  headers,
  body: JSON.stringify({
    title: 'WOD de Segunda',
    description_wod: 'Força',
    type: 'FOR_TIME',
    duration: 20,
    date: '2024-01-15',
    pinned: false
  })
})
  .then(r => r.json())
  .then(data => console.log('WOD criado:', data.id))
  .catch(e => console.error(e));
```

### Registrar Resultado

```javascript
fetch(`${API_URL}/wod-results/`, {
  method: 'POST',
  headers,
  body: JSON.stringify({
    wod: 1,
    completed: true,
    notes: 'Bom treino'
  })
})
  .then(r => r.json())
  .then(data => {
    console.log('Resultado registrado:', data.id);
    // Agora registre o tempo
  })
  .catch(e => console.error(e));
```

### Enviar Tempo (FOR_TIME)

```javascript
fetch(`${API_URL}/for-time-results/`, {
  method: 'POST',
  headers,
  body: JSON.stringify({
    wod_result: 1,
    time_seconds: 1205  // 20:05
  })
})
  .then(r => r.json())
  .then(data => console.log('Tempo registrado:', data))
  .catch(e => console.error(e));
```

### Ver Ranking

```javascript
fetch(`${API_URL}/wod-results/leaderboard/?wod_id=1&limit=10`)
  .then(r => r.json())
  .then(data => {
    console.log('Ranking:');
    data.leaderboard.forEach(entry => {
      console.log(`${entry.position}. ${entry.username}: ${entry.time_formatted}`);
    });
  })
  .catch(e => console.error(e));
```

---

## ⚙️ Configuração (settings.py)

Se ainda não configurou DRF:

```python
# settings.py

INSTALLED_APPS = [
    # ... suas apps
    'rest_framework',
    'rest_framework.authtoken',  # Para tokens
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
        'rest_framework.authentication.SessionAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticatedOrReadOnly',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
}

CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",  # React/Vue dev
    "http://localhost:8000",  # Django dev
]
```

---

## 🐛 Troubleshooting

### Erro: ImportError - WOD.api_urls

```
❌ No module named 'WOD.api_urls'
```

**Solução:**
- Certifique-se que `/app/WOD/api_urls.py` existe
- Reinicie o servidor

### Erro: 404 em `/api/v1/wods/`

```
❌ Not Found
```

**Solução:**
- Verifique se adicionou o router ao urls.py
- Verifique o path (pode ser `/api/` ou outra)

### Erro: 403 Forbidden ao criar WOD

```
❌ Apenas coaches podem criar WODs
```

**Solução:**
- Certifique-se que o usuário tem `profile.is_coach=True`
- Ou use outro usuário coach

### Erro: 401 Unauthorized

```
❌ Autenticação necessária
```

**Solução:**
- Adicione o header: `Authorization: Token seu_token`
- Verifique se o token é válido

---

## 📊 Estrutura de Dados

### WOD
```json
{
  "id": 1,
  "title": "Segunda - Perna",
  "type": "FOR_TIME",
  "date": "2024-01-15",
  "coach": 1,
  "pinned": false,
  "likes_count": 5
}
```

### Resultado
```json
{
  "id": 1,
  "user": 1,
  "wod": 1,
  "completed": true,
  "for_time": {
    "time_seconds": 1205,
    "time_formatted": "20:05"
  }
}
```

### Ranking
```json
{
  "position": 1,
  "username": "athlete1",
  "time_formatted": "20:05"
}
```

---

## 🎯 Casos de Uso

### 1. Coach Quer Criar WOD

```bash
# 1. Cria WOD
curl -X POST .../wods/ -H "Authorization: Token $TOKEN" ...

# 2. Adiciona movimentos
curl -X POST .../wod-movements/ -H "Authorization: Token $TOKEN" ...

# 3. Fixa WOD
curl -X POST .../wods/1/pin/ -H "Authorization: Token $TOKEN" ...
```

### 2. Atleta Quer Fazer WOD

```bash
# 1. Consulta WOD de hoje
curl .../wods/today/

# 2. Faz o treino

# 3. Registra resultado
curl -X POST .../wod-results/ -H "Authorization: Token $TOKEN" ...

# 4. Registra tempo
curl -X POST .../for-time-results/ -H "Authorization: Token $TOKEN" ...
```

### 3. Todos Querem Ver Ranking

```bash
curl .../wod-results/leaderboard/?wod_id=1&limit=10
```

---

## 📚 Documentação Completa

Para mais detalhes, consulte:
- `WOD_API_DOCUMENTATION.md` - Todos os endpoints
- `WOD_API_SUMMARY.md` - Resumo técnico
- `WOD/viewsets.py` - Código-fonte

---

## ✅ Checklist de Implementação

- [ ] Adicionei `include(wod_router.urls)` ao URLs
- [ ] Executei `python manage.py migrate`
- [ ] Testei `curl http://localhost:8000/api/v1/wods/`
- [ ] Obtive um token de autenticação
- [ ] Criei um WOD de teste
- [ ] Registrei um resultado de teste
- [ ] Vi o ranking funcionando

**Todos os ✅? Parabéns, a API está pronta!** 🎉

---

**Dúvidas? Consulte a documentação completa em `WOD_API_DOCUMENTATION.md`**
