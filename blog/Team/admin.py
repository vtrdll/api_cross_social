from django.contrib import admin
from .models  import Team,  Team_Achievements

# Register your models here.
class TimeAdmin(admin.ModelAdmin):
    list_display = ('name', 'creator', 'box', 'category', 'placement', 'achievements')
    list_filter = ('name',)
    search_fields = ('name' , 'creator')


admin.site.register(Team)


class Time_AchievementsAdmin(admin.ModelAdmin):
    list_display = ('time', 'achievement', 'placement')
    list_filter = ('time',)
    search_fields = ('time__name' , 'achievement')

admin.site.register(Team_Achievements)