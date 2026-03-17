from django.contrib import admin

# Register your models here.
from django.contrib import admin
from .models import Event
from django.db import models
from django.forms import Textarea


# Register your models here.

class EventAdmin(admin.ModelAdmin):
    list_display = ('location',  'author' , 'title', 'date_initial', 'date_end', )
    search_fields = ('author', 'local','title', 'date_end')
    formfield_overrides = {
        models.TextField: {'widget': Textarea(attrs={'rows': 100, 'cols': 800})},
    }


admin.site.site_header = "Event "
admin.site.register(Event, EventAdmin)