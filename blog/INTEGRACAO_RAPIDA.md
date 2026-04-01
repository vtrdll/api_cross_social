# 🎯 INTEGRAÇÃO - 30 SEGUNDOS

## Copiar/Colar - Uma Linha

### Seu arquivo: `app/urls.py`

```python
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # ... outras urls que você já tem ...
    
    # ↓↓↓ ADICIONE ESTA LINHA ↓↓↓
    path('api/v1/', include('WOD.api_urls')),
    # ↑↑↑ PRONTO! ↑↑↑
]
```

---

## ✅ Pronto!

```bash
python manage.py runserver

# Abra o terminal
curl http://localhost:8000/api/v1/wods/

# Você verá:
{
  "count": 0,
  "next": null,
  "previous": null,
  "results": []
}
```

---

## 🚀 Próximo: Testar os Endpoints

### Listar WODs
```bash
curl http://localhost:8000/api/v1/wods/
```

### Listar Movimentos
```bash
curl http://localhost:8000/api/v1/movements/
```

### Listar Tipos
```bash
curl http://localhost:8000/api/v1/movement-types/
```

---

## 🎉 Feito!

Todos os 58+ endpoints estão funcionando!

Leia a documentação se quiser saber mais:
- [WOD_README.md](WOD_README.md) - Overview rápido
- [WOD_CONVERSAO_RESUMO.md](WOD_CONVERSAO_RESUMO.md) - Detalhes da conversão
- [WOD_VIEWS_TRADICIONAL_GUIA.md](WOD_VIEWS_TRADICIONAL_GUIA.md) - Guia completo
