from django.db import models
from django.utils import timezone   
from datetime import timedelta


from django.contrib.auth.models import User


# Create your models here.
def default_story_expiration():
    return timezone.now() + timedelta(hours=24)


class Post(models.Model):
    author= models.ForeignKey(User, on_delete=models.CASCADE, )
    created_at = models.DateTimeField(auto_now=True, auto_created=True)
    text = models.TextField(max_length=3000)
    like = models.ManyToManyField(User,  related_name= 'liked_post')
    

    def __str__(self):
        return f'{self.author.username} - {self.text}'
    
    
class PostImage(models.Model):
    post = models.ForeignKey(Post, related_name='images', on_delete=models.CASCADE, null=True, blank=True)
    
    photo = models.ImageField(upload_to='media_post',null = True, blank=True)


class PostVideo(models.Model): 
    post = models.ForeignKey(Post, related_name='videos', on_delete=models.CASCADE, null=True, blank=True)
    
    video = models.FileField(upload_to='media_post', null = True, blank=True)
    
class Story(models.Model):
    user =  models.ForeignKey(User, on_delete=models.CASCADE, related_name='stories')
    created_at =  models.DateTimeField(auto_now_add= True)
    expires_at = models.DateTimeField(
        default=default_story_expiration
    )


    def is_expired(self):
        return timezone.now()  >  self.expires_at
    
class StoryImage(models.Model):
    post = models.ForeignKey(Story, related_name='story_images', on_delete=models.CASCADE, null=True, blank=True)
    
    story_image = models.ImageField(upload_to='media_post',  null = True, blank=True)


class StoryVideo(models.Model): 
    post = models.ForeignKey(Story, related_name='story_videos', on_delete=models.CASCADE, null=True, blank=True)
    
    story_video = models.FileField(upload_to='media_post', null = True, blank=True)


class Comment(models.Model):
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    comments = models.TextField(max_length=1000)
    like_comment = models.ManyToManyField(User, related_name='liked_comment')
    created_at = models.DateTimeField(auto_now=True, auto_created=True)
    post  = models.ForeignKey(Post, on_delete=models.CASCADE,  related_name="comments")

    def __str__(self):
        return f'{self.author.username} - {self.comments}'


class PostCommentInventory(models.Model):
    author = models.OneToOneField(User, on_delete=models.CASCADE, related_name='author_inventory')
    post_count = models.IntegerField(default=0)
    comment_count = models.IntegerField(default=0)

    def __str__(self):
        return f'{self.author} - {self.post_count} - {self.comment_count}'
 
