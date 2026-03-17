from rest_framework import serializers
from .models import Post, PostImage, PostVideo,Story, StoryImage, StoryVideo, Comment
from account.models import User
from account.serializers import UserSerializer


class MyUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'email']


class ImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = PostImage
        fields = ['post',  'photo']


class VideoSerializer(serializers.ModelSerializer):
    class Meta:
        model = PostVideo
        fields = ['post', 'video']


class PostSerializer(serializers.ModelSerializer):
    author_username = serializers.CharField(source="author.username")
    author_photo = serializers.SerializerMethodField()
    imagens = serializers.SerializerMethodField()
    videos = serializers.SerializerMethodField()
    comments = serializers.SerializerMethodField()
    like = serializers.SerializerMethodField()
    likes_count = serializers.IntegerField(source="like.count", read_only=True)
    is_liked = serializers.SerializerMethodField()
    
    class Meta:
        model = Post
        fields = [
            "id",
            "author_username",
            "author_photo",
            "text",
            "imagens",
            "videos",
            "likes_count",
            "created_at",
            "comments",
            "like",
            "is_liked",
        ]

    def get_author_photo(self, obj):
        request = self.context.get("request")

        if obj.author.profile.photo:
            return request.build_absolute_uri(obj.author.profile.photo.url)

        return None

    def get_imagens(self, obj):
        return [img.photo.url for img in obj.images.all() if img.photo]

    def get_videos(self, obj):
        return [vid.video.url for vid in obj.videos.all() if vid.video]
    
    def get_comments(self, obj):
        return [
            {
                "id": c.id,
                "author_username": c.author.username,
                "comments": c.comments,
                "created_at": c.created_at,
            }
            for c in obj.comments.all()  # ou related_name correto
        ]
    def get_like(self, obj):
        return [user.username for user in obj.like.all()]
    
    def get_is_liked(self, obj):
        user = self.context.get("request").user
        if user.is_anonymous:
            return False
        return obj.like.filter(id=user.id).exists()
    
class PostCreateSerializer(serializers.ModelSerializer):
    media = serializers.ListField(
        child=serializers.FileField(),
        write_only=True,
        required=False
    )

    class Meta:
        model = Post
        fields = ["text", "media"]

    def validate_media(self, files):
        image_errors = []
        video_errors = []

        for f in files:
            if f.content_type.startswith("image/"):
                pass  # valida imagem
            elif f.content_type.startswith("video/"):
                pass  # valida vídeo
            else:
                raise serializers.ValidationError(
                    f"Arquivo inválido: {f.name}"
                )

        if image_errors or video_errors:
            raise serializers.ValidationError(
                image_errors + video_errors
            )

        return files

    def create(self, validated_data):
        media_files = validated_data.pop("media", [])
        post = Post.objects.create(**validated_data)

        for f in media_files:
            if f.content_type.startswith("image/"):
                PostImage.objects.create(post=post, photo=f)
            elif f.content_type.startswith("video/"):
                PostVideo.objects.create(post=post, video=f)

        return post

class StoryImageSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = StoryImage
        fields = ['id','story_image']

class StoryVideoSerializer(serializers.ModelSerializer):

    class Meta:
        model = StoryVideo
        fields = ['id','story_video']


class StorySerializer(serializers.ModelSerializer):
    

    imagens = StoryImageSerializer(
        source='story_images', many=True, required=False
    )
    videos = StoryVideoSerializer(
        source='story_videos', many=True, required=False
    )

    class Meta:
        model = Story
        fields = ["imagens", "videos",]

    def create(self, validated_data):
        request = self.context.get('request')
        media_files = request.FILES.getlist('media')

        story = Story.objects.create(user=request.user)

        for f in media_files:
            if f.content_type.startswith('image'):
                StoryImage.objects.create(post=story, story_image=f)
            elif f.content_type.startswith('video'):
                StoryVideo.objects.create(post=story, story_video=f)

        return story
    
        
class StorySerializerList(serializers.ModelSerializer):
    story_images = StoryImageSerializer(many=True, read_only=True)
    story_videos = StoryVideoSerializer(many=True, read_only=True)
    user = UserSerializer(read_only=True)
    class Meta:
        model = Story
        fields = [
            "id",
            "user",
            "created_at",
            "expires_at",
            "story_images",
            "story_videos",
        ]

class CommentSerializer(serializers.ModelSerializer):
    author = serializers.ReadOnlyField(source='author.username')
   

    class Meta:
        model = Comment
        fields = ['id', 'comments', 'author', 'created_at']
        read_only_fields = ['id', 'author', 'created_at' ]