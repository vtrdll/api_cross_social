from django.db import models
from django.contrib.auth.models import User
from account.models import Box, Profile
from django.core.validators import MaxValueValidator, MinValueValidator

# Create your models here.
class Team(models.Model):
    creator = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name='Creator Team', related_name= 'creator_team')
    name = models.CharField(max_length=50, verbose_name= 'name_team', blank=False,  null= False, )
    description = models.CharField(max_length=500, verbose_name="Descripion")
    box = models.ForeignKey(Box, on_delete=models.CASCADE, null=True, blank=True)
    category = models.CharField(choices= Profile.CATEGORY_CHOICES, default= 'EXPERIMENTAL', verbose_name="category_team")
    members = models.ManyToManyField(User, related_name='team_members', verbose_name='members')

    ['creator','name','description', 'box','category', 'members' ]
 

    def __str__(self):
        return f'Nome do time {self.name} - Criador {self.creator} '
    

    def adicionar_membro(self, usuario):
        if usuario not in self.members.all():
            self.members.add(usuario)

    def remover_membro(self, usuario):
        if usuario in self.members.all():
            self.members.remove(usuario)


class Team_Achievements(models.Model):
    current_team = models.ForeignKey(Team, on_delete=models.CASCADE, verbose_name='team_achievements')
    achievement = models.CharField(max_length=200, verbose_name='achievement')
    placement= models.IntegerField(default=0, verbose_name="placement", validators=[MinValueValidator(0)])


    def __str__(self):
        return f'Conquista: {self.achievement} do Time: {self.current_team} colocação: {self.placement}'