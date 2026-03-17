from rest_framework import serializers
import datetime
from account.models import User,  Profile, Box, ProfilePersonalRecord
from WOD.models import Movement
from django.core.validators import MaxValueValidator, MinValueValidator


class CreateUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User 
        fields = ['username','first_name','last_name', 'email', 'password1', 'password2']


    def clean_username(self):
        username = self.cleaned_data['username']
        if User.objects.filter(username=username).exists():
            raise serializers.ValidationError('Usuário já existe')
        return username
    
    def clean_email (self):
        email = self.cleaned_data['email']
        
        if User.objects.filter(email=email).exists():
            raise serializers.ValidationError('Email já existe')
        return email
    

class CreateProfileSerializer(serializers.ModelSerializer):

    birthday = data = serializers.DateField(
    format="%d/%m/%Y",              # como será exibido na resposta
    input_formats=["%d/%m/%Y"]      # como será aceito na requisição
)
    class Meta:
        model = Profile
        fields = ['photo','birthday', 'category', 'box', 'genre', 'weight', 'height', ]


    def clean_birthday (self):
        value = self.cleaned_data.get('birthday')
    

        if  value.year <  1925 or value.year > datetime.datetime.now().year:
            raise serializers.ValidationError( 'DATA INVALIDA')
        return value
        
    class Meta:
        model = User
        fields = ['username', 'email', 'password']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user
 
 
class UserUpdateSerializer(serializers.ModelSerializer):
    box = serializers.PrimaryKeyRelatedField(
        queryset=Box.objects.all(),
        required=False
    )
    category = serializers.ChoiceField(
        choices=Profile.CATEGORY_CHOICES,
        required=False
    )
    genre = serializers.ChoiceField(
        choices=Profile.GENRE_CHOICES,
        required=False
    )
    weight = serializers.DecimalField(
        max_digits=5,
        decimal_places=2,
        required=False
    )
    height = serializers.DecimalField(
        max_digits=5,
        decimal_places=2,
        required=False
    )

    class Meta:
        model = User
        fields = [
            'username',
            'first_name',
            'last_name',
            'box',
            'category',
            'genre',
            'weight',
            'height'
        ]

    def update(self, instance, validated_data):
        # Dados do profile
        box = validated_data.pop('box', None)
        category = validated_data.pop('category', None)
        genre = validated_data.pop('genre', None)
        weight = validated_data.pop('weight', None)
        height = validated_data.pop('height', None)

        # Atualiza campos do User
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()

        # Atualiza Profile
        profile, created = Profile.objects.get_or_create(user=instance)

        if box is not None:
            profile.box = box
        if category is not None:
            profile.category = category
        if genre is not None:
            profile.genre = genre
        if weight is not None:
            profile.weight = weight
        if height is not None:
            profile.height = height

        profile.save()

        return instance


class UserUpdatePhotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ['photo']


class UserUpdatePasswordSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['password']
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def update(self, instance, validated_data):
        password = validated_data.get('password')
        instance.set_password(password)
        instance.save()
        return instance





class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = '__all__'

    def get_photo(self, obj):
        request = self.context.get("request")
        if obj.photo:
            return request.build_absolute_uri(obj.photo.url)
        return None
    

class PrivacySerializer(serializers.ModelSerializer):

    class Meta:
        model = Profile
        fields = ['view_weight', 'view_height', 'view_category', 'view_box','view_personal_record']
        read_only_fields = ["id"]  #impede  que a  view  valide o id. Ele não será atualizado, apenas retornado.

    


class PersonalRecordSerializer(serializers.ModelSerializer):
    name_moviment = serializers.CharField(source = 'moviment.name', read_only = True)
    class Meta:
        model = ProfilePersonalRecord
        fields = ['id','moviment','date','personal_record','name_moviment' ]
        read_only_fields = ["athlete", 'id', 'name_moviment']


class UserNestedSerializer(serializers.ModelSerializer):
    photo = serializers.SerializerMethodField()

    class Meta:
        model = Profile
        fields = ["photo","box"]

    def get_photo(self, obj):
        request = self.context.get("request")
        if obj.photo:
            return request.build_absolute_uri(obj.photo.url)
        return None


class UserSerializer(serializers.ModelSerializer):

    view_weight  = serializers.BooleanField(source = 'profile.view_weight',read_only=True)
    view_height = serializers.BooleanField(source = 'profile.view_height',read_only=True)
    view_category = serializers.BooleanField(source = 'profile.view_category',read_only=True)
    view_box  = serializers.BooleanField(source = 'profile.view_box',read_only=True)
    view_personal_record = serializers.BooleanField(source = 'profile.view_personal_record',read_only=True)
    
    photo = serializers.ImageField(source = 'profile.photo', read_only=True)
    box = serializers.PrimaryKeyRelatedField(source='profile.box', read_only=True)
    box_name = serializers.CharField(source='profile.box.box_name', read_only=True)
    weight = serializers.DecimalField(max_digits= 5, decimal_places = 2,source = 'profile.weight', read_only=True)
    height = serializers.DecimalField(max_digits= 5, decimal_places = 2, source = 'profile.height', read_only=True)
    category = serializers.CharField(source = 'profile.category', read_only=True)
    is_coach = serializers.BooleanField(source='profile.is_coach', read_only=True)
    
    genre = serializers.CharField(source = 'profile.genre', read_only=True)
    class Meta:
        model = User
        fields = ["id", "username","photo", "box", "box_name" , "email", "first_name", "last_name", 'is_coach', 'weight', 'height', 'category', 'genre','view_weight','view_height','view_category','view_box','view_personal_record']
        
class ListBoxSerializer(serializers.ModelSerializer):

    class Meta:
        model = Box
        fields=  ['id','box_name'] 
