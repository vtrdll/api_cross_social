from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User
from django.core.validators import MaxValueValidator, MinValueValidator
# Create your models here.


class  Box(models.Model):
    author = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name= "Criador")
    box_name = models.CharField(max_length=20, null=False,  blank= False, verbose_name= "Nome da BOX")

    def __str__(self):
        return f'Box {self.box_name} -'


class Profile (models.Model):
    
    CATEGORY_CHOICES = (('FITNESS', 'FITNESS'), ('SCALED','SCALED'),('AMADOR', 'AMADOR'), ('RX','RX',), ('MASTER', 'MASTER'))
    GENRE_CHOICES =(('MASCULINO', 'MASCULINO'),  ('FEMININO','FEMININO'), ('NÃO-ESPECIFICAR','NÃO-ESPECIFICAR'))

    genre = models.CharField(choices=GENRE_CHOICES, default = 'NÃO-ESPECIFICAR', verbose_name="Genero")
    view_weight  = models.BooleanField(default=True)
    view_height = models.BooleanField(default=True)
    view_category = models.BooleanField(default=True)
    view_box  = models.BooleanField(default=True)
    view_personal_record = models.BooleanField(default=True)

    
    user = models.OneToOneField(User, on_delete=models.CASCADE, verbose_name="Usuário", related_name="profile")
    photo = models.ImageField(upload_to='media_profile', null=True, blank=True,verbose_name="Foto Perfil")
    created_at_profile =  models.DateField(auto_now=True, verbose_name="Data Adessão")
    birthday = models.DateField(max_length=50, default=timezone.now, verbose_name="Aniversário")
    weight = models.DecimalField(max_digits= 5, decimal_places = 2, validators=[MaxValueValidator (300), MinValueValidator(0)], default=0, verbose_name="Peso")
    height = models.DecimalField(max_digits= 5, decimal_places = 2,  default=0, verbose_name="Altura")
    category = models.CharField(choices= CATEGORY_CHOICES, default= 'EXPERIMENTAL', verbose_name="Categoria")
    box = models.ForeignKey(Box, default = 'DEFAULT', on_delete=models.CASCADE, blank=True, null= True, related_name="box")
    is_coach = models.BooleanField(default=False, verbose_name= "Coach ? ")
    
    def __str__(self):
        return f'Perfil de {self.user.username}'
    

class ProfilePersonalRecord(models.Model):
    
    athlete =  models.ForeignKey(User, on_delete=models.CASCADE)
    moviment = models.ForeignKey('WOD.Movement', default='NONE', on_delete=models.CASCADE)
    created_at  =models.DateField(auto_now=True)
    date = models.DateField(max_length=50, default=timezone.now)
    personal_record = models.DecimalField (max_digits=5, decimal_places=1, validators=[MaxValueValidator(500),  MinValueValidator(5)], default=0)
    
    

    def  __str__(self):
        return f'Personal Record de {self.athlete} - movimento -{self.moviment} -   {self.personal_record} kg'
    
