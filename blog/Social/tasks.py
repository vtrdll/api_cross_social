from celery import shared_task
from django.utils import timezone
from django.core.files.storage import default_storage
from Social.models import Story, StoryImage, StoryVideo
import logging

logger = logging.getLogger(__name__)

@shared_task
def delete_old_media():
    """
    Task que deleta stories expiradas em lotes, removendo tanto
    os registros do banco quanto os arquivos de mídia do storage.
    """
    BATCH_SIZE = 10  # Ajuste conforme memória e volume de stories

    # Seleciona stories expiradas
    expired_stories = Story.objects.filter(expires_at__lt=timezone.now())[:BATCH_SIZE]

    if not expired_stories.exists():
        logger.info("Nenhuma story expirada encontrada.")
        return

    story_ids = []
    image_paths = []
    video_paths = []

    for story in expired_stories:
        story_ids.append(story.id)
        # Coleta imagens
        for image in story.story_images.all():
            if image.story_image:
                image_paths.append(image.story_image.name)
        # Coleta vídeos
        for video in story.story_videos.all():
            if video.story_video:
                video_paths.append(video.story_video.name)

    # Deleta arquivos do storage com logging detalhado
    for path in image_paths + video_paths:
        abs_path = default_storage.path(path)
        exists = default_storage.exists(path)
        logger.info(f"Tentando deletar: {path} -> {abs_path}, existe? {exists}")
        try:
            if exists:
                default_storage.delete(path)
                logger.info(f"Arquivo deletado: {abs_path}")
            else:
                logger.warning(f"Arquivo não encontrado para deletar: {abs_path}")
        except Exception as e:
            logger.error(f"Erro ao deletar arquivo {abs_path}: {e}")

    # Deleta registros no banco de dados
    try:
        StoryImage.objects.filter(post_id__in=story_ids).delete()
        StoryVideo.objects.filter(post_id__in=story_ids).delete()
        Story.objects.filter(id__in=story_ids).delete()
        logger.info(f"Deletado lote de {len(story_ids)} stories expiradas e suas mídias.")
    except Exception as e:
        logger.error(f"Erro ao deletar lote de stories {story_ids}: {e}")

    # Reagendar próximo lote em 2 segundos
    delete_old_media.apply_async(countdown=2)
