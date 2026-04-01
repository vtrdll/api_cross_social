from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import WodResult, ResultMovement

@receiver(post_save, sender=WodResult)
def create_result_movements(sender, instance, created, **kwargs):
    if created:
        wod_movements = instance.wod.movements.all()

        ResultMovement.objects.bulk_create([
            ResultMovement(
                wod_result=instance,
                movement=wm.movement,
                reps_expected=wm.reps,
                load_expected=wm.load,
                order=wm.order
            )
            for wm in wod_movements
        ])