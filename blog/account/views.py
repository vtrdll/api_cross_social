from .models import Profile, Box
from .models  import ProfilePersonalRecord
from django.urls import reverse_lazy
from Social.models import Comment, Post
from django.contrib.auth.models import User
from django.http import HttpResponseForbidden

from django.utils.decorators import method_decorator
from django.contrib.auth.decorators import login_required
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.auth import authenticate, login, logout
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.forms import AuthenticationForm, SetPasswordForm
from django.views.generic import CreateView, UpdateView, FormView, DeleteView, DetailView, ListView


from .serializers import CreateUserSerializer, CreateProfileSerializer, UserUpdatePasswordSerializer, UserUpdateSerializer, UserUpdatePasswordSerializer, PrivacySerializer, UserSerializer, UserUpdatePhotoSerializer, ProfileSerializer, PersonalRecordSerializer, ListBoxSerializer
from rest_framework.views import APIView
from rest_framework.generics import RetrieveUpdateDestroyAPIView, RetrieveAPIView,  DestroyAPIView, RetrieveUpdateAPIView
from rest_framework.response import Response
from django.views.generic import TemplateView
from rest_framework.generics import UpdateAPIView, ListAPIView
from rest_framework import status
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated





class RegisterAPIView(APIView):
    def post(self, request):
        print("Request data:", request.data)
        user_serializer = CreateUserSerializer(data=request.data)
        profile_serializer = CreateProfileSerializer(data=request.data)


        # Chama is_valid separadamente
        user_valid = user_serializer.is_valid()
        profile_valid = profile_serializer.is_valid()
        print("User valid?", user_serializer.is_valid())
        print("User errors:", user_serializer.errors)
        
        print("Profile valid?", profile_serializer.is_valid())
        print("Profile errors:", profile_serializer.errors)
        if user_valid and profile_valid:
            user = user_serializer.save()
            profile = profile_serializer.save(user=user)
            return Response({"message": "User registered successfully"}, status=201)
        
        errors = {
            "user_errors": user_serializer.errors,
            "profile_errors": profile_serializer.errors
        }
        return Response(errors, status=400)


class RegisterAPIViewTemplate(TemplateView):
    template_name = 'register.html'

    def post(self, request, *args, **kwargs):
        user_serializer = CreateUserSerializer(request.data)
        profile_serializer = CreateProfileSerializer(request.data)

        if user_serializer.is_valid() and profile_serializer.is_valid():
            user = user_serializer.save()
            profile = profile_serializer.save(commit=False)
            profile.user = user
            profile.save()
            return redirect('login')
        
        errors = {
            "user_errors": user_serializer.errors,
            "profile_errors": profile_serializer.errors
        }
        return render(request, self.template_name, {"errors": errors})


class UserUpdateAPIView(UpdateAPIView):
    queryset = User.objects.all()
    serializer_class = UserUpdateSerializer
    

    def get_object(self):
        return self.request.user


class UserUpdatePhotoAPIView(UpdateAPIView):
    queryset = Profile.objects.all()
    serializer_class = UserUpdatePhotoSerializer

    def get_object(self):
        return self.request.user.profile


class UserUpdatePasswordAPIView(UpdateAPIView):
    queryset = User.objects.all()
    serializer_class = UserUpdatePasswordSerializer

    def get_object(self):
        return self.request.user


class UserDeleteAPIView(DestroyAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user


class LoginAPIView(APIView):
    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return Response({"message": "Login successful"}, status=200)
        return Response({"error": "Invalid credentials"}, status=400)
    

class LogoutAPIView(APIView):
    def post(self, request):
        logout(request)
        return Response({"message": "Logout successful"}, status=200)
    

class UserListAPIView(ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def get_queryset(self):
        search = self.request.GET.get('search')
        queryset = super().get_queryset()

        if search:
            queryset = queryset.filter(username__icontains=search)

        return queryset

        
class UserPhotoDeleteAPIView(DestroyAPIView):
    queryset = Profile.objects.all()
    serializer_class = UserUpdatePhotoSerializer

    def get_object(self):
        return self.request.user.profile
    
    
class ProfileDetailAPIView(RetrieveAPIView):
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer

    def get_object(self):
        return self.request.user.profile
    

class RegisterPersonalRecordAPIView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        data = request.data.copy()
        serializer  = PersonalRecordSerializer(data = data)

        if  serializer.is_valid():
            serializer.save(athlete = request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
    
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
class PersonalRecordListAPIView(ListAPIView):
    serializer_class = PersonalRecordSerializer
    

    def get_queryset(self):
        return ProfilePersonalRecord.objects.filter(
    athlete=self.request.user
)


class UpdatePergonalRecordAPIView(RetrieveUpdateDestroyAPIView):
    serializer_class = PersonalRecordSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        print(self.request.user)
        
        print(self.request.user.is_authenticated)
        return ProfilePersonalRecord.objects.filter(
            athlete=self.request.user
        )


class PrivacyConfigAPIView(APIView):

    def patch(self, request):
        profile = request.user.profile
        privacy_serializer = PrivacySerializer(profile, data = request.data)

        
        if privacy_serializer.is_valid():
            data = privacy_serializer.validated_data
            privacy_serializer.save()
            return Response({"message": "Privacy configuration updated successfully"}, status=201)
         

        return Response(privacy_serializer.errors, status=400)  
    
class PrivacyListAPIView(RetrieveUpdateAPIView):
    serializer_class = PrivacySerializer

    def get_object(self):
        return self.request.user.profile
    


    
class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user, context={"request": request})
        return Response(serializer.data)
    

class ListBoxAPIView(ListAPIView):
    queryset = Box.objects.all()
    serializer_class = ListBoxSerializer