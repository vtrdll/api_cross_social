from django.contrib import admin
from .models import WOD, Movement, MovementType, WodMovement, WodResult, ForTimeResult, AmrapResult, EmomResult





#admin.site.register(PostWod)
class WodMovementInline(admin.TabularInline):
    model = WodMovement
    extra = 1
    ordering = ['order']


@admin.register(WOD)
class WODAdmin(admin.ModelAdmin):
    list_display = ('title', 'type', 'coach', 'date', 'pinned')
    list_filter = ('type', 'pinned', 'date')
    search_fields = ('title', 'description_wod')

    inlines = [WodMovementInline]


@admin.register(Movement)
class MovementAdmin(admin.ModelAdmin):
    list_display = ('name', 'type')
    list_filter = ('type',)
    search_fields = ('name',)


@admin.register(MovementType)
class MovementTypeAdmin(admin.ModelAdmin):
    list_display = ('name', 'requires_load', 'requires_reps')


@admin.register(WodMovement)
class WodMovementAdmin(admin.ModelAdmin):
    list_display = ('wod', 'movement', 'reps', 'load', 'order')
    list_filter = ('wod',)

class WodMovementInline(admin.TabularInline):
    model = WodMovement
    extra = 1
    ordering = ['order']

class ForTimeInline(admin.StackedInline):
    model = ForTimeResult
    extra = 0

class AmrapInline(admin.StackedInline):
    model = AmrapResult
    extra = 0   

class EmomInline(admin.StackedInline):
    model = EmomResult
    extra = 0


    
@admin.register(ForTimeResult)
class ForTimeResultAdmin(admin.ModelAdmin):
    list_display = ('wod_result', 'time_seconds')

@admin.register(AmrapResult)
class AmrapResultAdmin(admin.ModelAdmin):
    list_display = ('wod_result', 'rounds', 'reps')


@admin.register(EmomResult)
class EmomResultAdmin(admin.ModelAdmin):
    list_display = ('wod_result', 'rounds_completed', 'failed_minute')


@admin.register(WodResult)
class WodResultAdmin(admin.ModelAdmin):
    list_display = ('user', 'wod', 'completed', 'date')

    def get_inline_instances(self, request, obj=None):
        if not obj:
            return []

        if obj.wod.type == "FOR_TIME":
            return [ForTimeInline(self.model, self.admin_site)]

        elif obj.wod.type == "AMRAP":
            return [AmrapInline(self.model, self.admin_site)]

        elif obj.wod.type == "EMOM":
            return [EmomInline(self.model, self.admin_site)]

        return []