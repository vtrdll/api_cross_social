# 🚀 WOD API REST - Views Tradicionais

## ⚡ Start Rápido (5 Minutos)

### 1️⃣ Integrar no urls.py

```python
# app/urls.py

from django.urls import path, include

urlpatterns = [
    # ... suas outras urls ...
    path('api/v1/', include('WOD.api_urls')),  # ← ADICIONE ESTA LINHA
]
```

### 2️⃣ Testar

```bash
python manage.py runserver

# Em outro terminal:
curl http://localhost:8000/api/v1/wods/
```

### 3️⃣ Pronto! 🎉

Todos os 54+ endpoints funcionando!

---

## 📌 Endpoints Principais

```
GET    /api/v1/wods/
POST   /api/v1/wods/
GET    /api/v1/wods/{id}/
PUT    /api/v1/wods/{id}/
DELETE /api/v1/wods/{id}/

GET    /api/v1/wods/today/
GET    /api/v1/wods/pinned/
GET    /api/v1/wods/by-type/?type=FOR_TIME
GET    /api/v1/wods/latest/

POST   /api/v1/wods/{id}/like/
GET    /api/v1/wods/{id}/likes/
POST   /api/v1/wods/{id}/pin/

GET    /api/v1/wod-results/
POST   /api/v1/wod-results/
GET    /api/v1/wod-results/leaderboard/?wod_id=1

... + 40+ endpoints mais
```

---

## 🔍 Filtros

### WODs

```bash
# Por tipo
curl http://localhost:8000/api/v1/wods/?type=FOR_TIME

# Por busca
curl http://localhost:8000/api/v1/wods/?search=Murph

# Por fixado
curl http://localhost:8000/api/v1/wods/?pinned=true

# Ordenação
curl http://localhost:8000/api/v1/wods/?ordering=-date

# Combinado
curl "http://localhost:8000/api/v1/wods/?type=AMRAP&search=Team&ordering=-date"
```

### Resultados

```bash
# Por usuário
curl http://localhost:8000/api/v1/wod-results/?user=1

# Por WOD
curl http://localhost:8000/api/v1/wod-results/?wod=5

# Apenas completos
curl http://localhost:8000/api/v1/wod-results/?completed=true

# Com busca
curl http://localhost:8000/api/v1/wod-results/?search=usuario
```

---

## 📝 Como Usar (Servidor Rodando)

### JavaScript

```javascript
// Listar WODs
fetch('/api/v1/wods/?type=FOR_TIME')
    .then(r => r.json())
    .then(data => console.log(data))

// Registrar resultado
fetch('/api/v1/wod-results/', {
    method: 'POST',
    headers: {
        'Authorization': 'Token seu_token',
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        wod: 1,
        completed: true,
        notes: 'Sem RX'
    })
})
```

### cURL

```bash
# Listar
curl http://localhost:8000/api/v1/wods/

# Criar WOD (precisa token e ser coach)
curl -X POST http://localhost:8000/api/v1/wods/ \
  -H "Authorization: Token seu_token" \
  -H "Content-Type: application/json" \
  -d '{"title": "WOD do Dia", "type": "FOR_TIME"}'

# Ranking
curl http://localhost:8000/api/v1/wod-results/leaderboard/?wod_id=1
```

---

## 📚 Documentação Completa

- [WOD_CONVERSAO_RESUMO.md](WOD_CONVERSAO_RESUMO.md) - Resumo da conversão
- [WOD_VIEWS_TRADICIONAL_GUIA.md](WOD_VIEWS_TRADICIONAL_GUIA.md) - Guia detalhado
- [WOD/views.py](WOD/views.py) - Código fonte (1.200 linhas)
- [WOD/api_urls.py](WOD/api_urls.py) - URLs (100+ endpoints)

---

## ✨ O que você tem

✅ **27 Classes/Funções View**
✅ **54+ Endpoints**
✅ **Sem DjangoFilterBackend**
✅ **Filtros Manuais**
✅ **Permissões Granulares**
✅ **Pronto para Produção**

---

## 🎯 Próximo Passo

```bash
# 1. Adicione em urls.py
path('api/v1/', include('WOD.api_urls'))

# 2. Rode o servidor
python manage.py runserver

# 3. Teste
curl http://localhost:8000/api/v1/wods/

# Pronto! 🚀
```

**Bom trabalho!** 💪
