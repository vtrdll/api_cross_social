
from webbrowser import get 
from django.utils import timezone

from WOD.models import  WOD

from django.urls import reverse
from account.models import User
from account.serializers import UserSerializer
from .models import Post, Comment
from django.shortcuts import redirect
from rest_framework.views import APIView
from rest_framework.generics import RetrieveUpdateDestroyAPIView, RetrieveAPIView,  DestroyAPIView, ListAPIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated
from Social.serializers import PostSerializer, StorySerializer, CommentSerializer, PostCreateSerializer, StorySerializerList
from django.utils import timezone
from .models import PostCommentInventory, Story



from django.shortcuts import get_object_or_404, render
from rest_framework.parsers import MultiPartParser, FormParser
from django.contrib.auth.decorators import login_required

from rest_framework import status
from django.utils import timezone
from django.views.generic import TemplateView

ACCEPTED_VIDEO_EXTENSIONS = [
    ".mp4", ".mkv", ".avi", ".mov", ".wmv", ".flv",
    ".webm", ".mpeg", ".mpg", ".3gp", ".mts", ".m2ts",
    ".vob", ".ts"
]

ACCEPTED_IMAGE_EXTENSIONS = [
    ".jpg", ".jpeg", ".png", ".gif", ".bmp", ".tiff", ".webp", ".heic"
]


class PostCreateViewAPI(APIView):
    permission_classes = [IsAuthenticatedOrReadOnly]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        serializer = PostCreateSerializer(
            data=request.data,
            context={"request": request}
        )

        serializer.is_valid(raise_exception=True)
        post = serializer.save(author=request.user)

        return Response(
            {"detail": "Post created successfully."},
            status=status.HTTP_201_CREATED
        )
 

class PostListViewAPI(ListAPIView):
    queryset = Post.objects.all()
    serializer_class  = PostSerializer


class PostDeteailViewAPI(RetrieveAPIView):  
    queryset = Post.objects.prefetch_related("images", "videos")
  
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]


class  PostUpdateDeleteViewAPI(RetrieveUpdateDestroyAPIView):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]


class HomeAPIView(APIView):
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get(self, request):
        posts = Post.objects.all().order_by('-created_at')
        posts_serializer = PostSerializer(
            posts, many=True, context={'request': request}
        )

        stories = Story.objects.filter(
            expires_at__gt=timezone.now()
        ).order_by('-created_at')
        stories_serializer = StorySerializer(stories, many=True)

        pinned = WOD.objects.filter(pinned=True).last()

        response = {
            "posts": posts_serializer.data,
            "stories": stories_serializer.data,
            #"pinned": WODSerializer(pinned).data if pinned else None,
        }

        if request.user.is_authenticated:
            inventory, _ = PostCommentInventory.objects.get_or_create(
                author=request.user
            )
            response["inventory"] = inventory.id

        return Response(response)

    def post(self, request):
        serializer = CommentSerializer(
            data=request.data,
            context={'request': request}
        )
        if serializer.is_valid():
            serializer.save(author=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
   
  
class StoryCreateViewAPI(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        serializer = StorySerializer(
            data=request.data,
            context={"request": request}
        )

        serializer.is_valid(raise_exception=True)
        story = serializer.save()

        return Response(
            {"detail": "Story created successfully."},
            status=status.HTTP_201_CREATED
        )
 

class StoryListViewAPI(ListAPIView):

    #permission_classes = [IsAuthenticated]
    serializer_class = StorySerializerList
    def get_queryset(self):
        return (
            Story.objects
            .select_related("user__profile")  # otimiza user + profile
            .prefetch_related("story_images", "story_videos")  # otimiza mídias
            .order_by("-created_at")
        )

    def get_serializer_context(self):
        return {"request": self.request}

class StoryViewAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        story = get_object_or_404(Story, pk=pk)

        if story.is_expired():
            return Response(
                {"detail": "This story has expired."},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = StorySerializer(
            story, context={"request": request}
        )
        return Response(serializer.data)


class StoryDeleteViewAPI(DestroyAPIView):
    queryset = Story.objects.all()
    serializer_class = StorySerializer
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk, *args, **kwargs):
        story = self.get_object()
        if story.user != request.user:
            return Response(
                {"detail": "Você não tem permissão para deletar essa história."},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().delete(request, *args, **kwargs)


class CommentCreateViewAPI(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):

        post = get_object_or_404(Post, pk=pk) 

        serializer = CommentSerializer(
            data=request.data,
            context={'request': request}
        )
        if serializer.is_valid():
            serializer.save(author=request.user, post = post)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CommentListUserView(APIView):
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get(self, request, pk):
        user = get_object_or_404(User, pk=pk)
        comments = Comment.objects.filter(author=user).order_by('-created_at')
        serializer = CommentSerializer(
            comments, many=True, context={'request': request}
        )
        return Response(serializer.data)


class CommentListUserDeleteOrUpdateViewAPI(RetrieveUpdateDestroyAPIView):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]


    def delete(self, request, pk, *args, **kwargs):
        comment = self.get_object()
        if comment.author != request.user:
            return Response(
                {"detail": "Você nao tem permissao para deletar esse comentário."},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().delete(request, *args, **kwargs)
    
    def put(self, request, pk, *args, **kwargs):
        comment = self.get_object()
        if comment.author != request.user:
            return Response(
                {"detail": "Você não tem permissao para editar esse comentário."},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().put(request, *args, **kwargs)


class LikePostViewAPI(APIView): 
    permission_classes = [IsAuthenticated]


    def post(self, request, pk):
        post = get_object_or_404(Post, pk=pk)
        user = request.user
        if user in post.like.all():
            post.like.remove(user)
            liked = False
        else:
            post.like.add(user)
            liked = True

        return Response({"liked": liked})


class LikeCommentViewAPI(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        comment = get_object_or_404(Comment, pk=pk)
        user = request.user
        if user in comment.like_comment.all():
            comment.like_comment.remove(user)
            liked = False
        else:
            comment.like_comment.add(user)
            liked = True

        return Response({"liked": liked})


class PostCreateViewAPITemplate(TemplateView):
    template_name = 'post-create.html'
class HomeTemplateView(TemplateView):
    template_name = "home.html"
class PostDeleteAPITTemplate(TemplateView):
    template_name = '_post_card.html'  
class StoryCreateViewTeamplate(TemplateView):
    template_name = 'story_create.html'


def my_profile(request):
    user = request.user
    posts = user.post_set.all().order_by('-created_at')
    
    comments = request.user.comment_set.all().order_by('-created_at')
    
    pr = user.profilepersonalrecord_set.all()
   
    for post in posts:
            imagens = [img.photo.url for img in post.images.all() if img.photo]
            videos = [vid.video.url for vid in post.videos.all() if vid.video]
            post.media_dict = {
                'imagens': imagens,
                'videos': videos,
            }


    inventory_post = PostCommentInventory.objects.filter(author=user).first()
    return render(request, 'my_perfil.html', {'user': request.user, 'posts': posts, 'comments':comments, 'inventory_post': inventory_post, 'mostrar_inventory':True, 'pr':pr})


class MyProfileAPI(APIView):
    
    def get(self, request):
        user = request.user
        posts = user.post_set.all().order_by('-created_at')
        comments = user.comment_set.all().order_by('-created_at')
        pr = user.profilepersonalrecord_set.all()
        serialized_user = UserSerializer(user, context={'request': request}).data
        for post in posts:
            imagens = [img.photo.url for img in post.images.all() if img.photo]
            videos = [vid.video.url for vid in post.videos.all() if vid.video]
            post.media_dict = {
                'imagens': imagens,
                'videos': videos,
            }

        inventory_post = PostCommentInventory.objects.filter(author=user).first()
        data = {
            "user": serialized_user,
            'posts': PostSerializer(posts, many=True, context={'request': request}).data,
            'comments': CommentSerializer(comments, many=True, context={'request': request}).data,
            'inventory_post_id': inventory_post.id if inventory_post else None,
            'pr': pr.values()  # ou use um serializer específico para PR
        }
        return Response(data)
    
