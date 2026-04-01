from django.db import models
from account.models import Profile, User
from account.models import User
# Create your models here.



class MovementType(models.Model):
    name = models.CharField(max_length=100)
    requires_load = models.BooleanField(default=False)
    requires_reps = models.BooleanField(default=True)

    def __str__(self):
        return self.name
    

class Movement(models.Model):
    name = models.CharField(max_length=100)
    type = models.ForeignKey(MovementType, on_delete=models.CASCADE)
    description = models.TextField(max_length=2000)

    def __str__(self):
        return self.name
    
class WOD(models.Model):
    WOD_TYPE_CHOICES = [
        ("FOR_TIME", "FOR TIME"),
        ("AMRAP", "AMRAP"),
        ("EMOM", "EMOM"),
    ]

    title = models.CharField(max_length=200)
    description_wod = models.TextField(max_length=10000)

    type = models.CharField(
        max_length=100,
        choices=WOD_TYPE_CHOICES
    )

    duration = models.IntegerField(
        null=True,
        blank=True,
        help_text="Duração em minutos (AMRAP/EMOM)"
    )

    pinned = models.BooleanField(default=False)

    coach = models.ForeignKey(
        Profile,
        on_delete=models.CASCADE,
        related_name="wods_created"
    )

    date = models.DateField(unique=True)

    like = models.ManyToManyField(
        User,
        related_name='liked_wods',
        blank=True
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date']

    def __str__(self):
        return f"{self.title} - {self.date}"

class WodMovement(models.Model):
    wod = models.ForeignKey(
        WOD,
        on_delete=models.CASCADE,
        related_name="movements"
    )

    movement = models.ForeignKey(
        Movement,
        on_delete=models.CASCADE
    )

    reps = models.IntegerField()

    load = models.DecimalField(
        max_digits=6,
        decimal_places=2,
        null=True,
        blank=True
    )

    order = models.PositiveIntegerField()

    notes = models.CharField(
        max_length=255,
        blank=True,
        help_text="Ex: RX / Scaled / Observações"
    )

    class Meta:
        ordering = ['order']
        unique_together = ('wod', 'order')

    def __str__(self):
        return f"{self.wod.title} - {self.movement.name}"



class WodResult(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="wod_results"
    )

    wod = models.ForeignKey(
        WOD,
        on_delete=models.CASCADE,
        related_name="results"
    )

    completed = models.BooleanField(default=True)

    notes = models.TextField(blank=True)

    date = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'wod')
        ordering = ['-date']

    def __str__(self):
        return f"{self.user.username} - {self.wod.title}"


class ResultMovement(models.Model):
    wod_result = models.ForeignKey(
        WodResult,
        on_delete=models.CASCADE,
        related_name="movements"
    )

    movement = models.ForeignKey(
        Movement,
        on_delete=models.CASCADE
    )

    # 🔹 Prescrição (snapshot do WOD)
    reps_expected = models.IntegerField()

    load_expected = models.DecimalField(
        max_digits=6,
        decimal_places=2,
        null=True,
        blank=True
    )

    # 🔹 Execução do usuário
    reps_done = models.IntegerField(
        null=True,
        blank=True
    )

    load_used = models.DecimalField(
        max_digits=6,
        decimal_places=2,
        null=True,
        blank=True
    )

    order = models.PositiveIntegerField()

    notes = models.CharField(
        max_length=255,
        blank=True
    )

    class Meta:
        ordering = ['order']
        unique_together = ('wod_result', 'order')

    def __str__(self):
        return f"{self.wod_result} - {self.movement.name}"

class ForTimeResult(models.Model):
    wod_result = models.OneToOneField(
        WodResult,
        on_delete=models.CASCADE,
        related_name="for_time"
    )

    time_seconds = models.PositiveIntegerField()

    def __str__(self):
        return f"{self.wod_result} - {self.time_seconds}s"

class AmrapResult(models.Model):
    wod_result = models.OneToOneField(
        WodResult,
        on_delete=models.CASCADE,
        related_name="amrap"
    )

    rounds = models.PositiveIntegerField()
    reps = models.PositiveIntegerField()

    def __str__(self):
        return f"{self.wod_result} - {self.rounds}r + {self.reps}"


class EmomResult(models.Model):
    wod_result = models.OneToOneField(
        WodResult,
        on_delete=models.CASCADE,
        related_name="emom"
    )

    rounds_completed = models.PositiveIntegerField()

    failed_minute = models.PositiveIntegerField(
        null=True,
        blank=True
    )

    def __str__(self):
        return f"{self.wod_result} - {self.rounds_completed}"
