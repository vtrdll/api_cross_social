import { useState } from 'react';
import { Heart, MessageCircle, Share2, MoreHorizontal, Trash2, Edit, Send, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Post, Profile } from '@/types';

interface PostCardProps {
  post: Post;
  currentUserProfile: Profile;
  onLike: (postId: number) => void;
  onComment: (postId: number, text: string) => void;
  onDelete?: (postId: number) => void;
  onEdit?: (postId: number) => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, currentUserProfile, onLike, onComment, onDelete, onEdit }) => {
  const [commentText, setCommentText] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [likeAnimating, setLikeAnimating] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);

  const authorName = post.author_username || post.author_username;
  const initials = `${(post.author_username || 'U')[0]}${ ''}`.toUpperCase();
  const timeAgo = getTimeAgo(post.created_at);
  const profilePhoto = post.author_photo;
  const allMedia = [
            ...(post.imagens || []).map(url => ({
              type: 'image' as const,
              url: `http://localhost:8000${url}`,
            })),
            ...(post.videos || []).map(url => ({
              type: 'video' as const,
              url: `http://localhost:8000${url}`,
            })),
          ];

  const handleLike = () => {
    setLikeAnimating(true);
    onLike(post.id);
    setTimeout(() => setLikeAnimating(false), 300);
  };

  const handleComment = () => {
    if (!commentText.trim()) return;
    onComment(post.id, commentText.trim());
    setCommentText('');
  };
  
  return (
    <article className="border-b border-border animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3">
        {profilePhoto ? (
          <img src={profilePhoto} alt={authorName} className="h-9 w-9 rounded-full object-cover flex-shrink-0" />
        ) : (
          <div className="h-9 w-9 rounded-full gradient-fire flex items-center justify-center text-xs font-bold text-primary-foreground flex-shrink-0">
            {initials}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">{post.author_username}</p>
          <p className="text-[11px] text-muted-foreground">{timeAgo}</p>
        </div>
        {post.is_owner && (
          <div className="relative">
            <button onClick={() => setShowMenu(!showMenu)} className="p-1 hover:bg-secondary rounded-lg transition-colors">
              <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
            </button>
            {showMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 top-8 z-50 w-36 rounded-lg border border-border bg-card p-1 shadow-card animate-scale-in">
                  <button
                    onClick={() => { onEdit?.(post.id); setShowMenu(false); }}
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-secondary transition-colors"
                  >
                    <Edit className="h-4 w-4" /> Editar
                  </button>
                  <button
                    onClick={() => { onDelete?.(post.id); setShowMenu(false); }}
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-destructive hover:bg-secondary transition-colors"
                  >
                    <Trash2 className="h-4 w-4" /> Deletar
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Media carousel */}
      {allMedia.length > 0 && (
        <div className="relative aspect-square w-full bg-secondary">
          {allMedia[imageIndex]?.type === 'image' ? (
            <img src={allMedia[imageIndex].url} alt="Post" className="h-full w-full object-cover" />
          ) : allMedia[imageIndex]?.type === 'video' ? (
            <video
  src={allMedia[imageIndex].url}
  controls
  className="h-full w-full object-contain"
/>
          ) : null}
          {allMedia.length > 1 && (
            <>
              {imageIndex > 0 && (
                <button onClick={() => setImageIndex(i => i - 1)} className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-background/70 p-1">
                  <ChevronLeft className="h-5 w-5 text-foreground" />
                </button>
              )}
              {imageIndex < allMedia.length - 1 && (
                <button onClick={() => setImageIndex(i => i + 1)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-background/70 p-1">
                  <ChevronRight className="h-5 w-5 text-foreground" />
                </button>
              )}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                {allMedia.map((_, i) => (
                  <div key={i} className={`h-1.5 w-1.5 rounded-full ${i === imageIndex ? 'bg-primary' : 'bg-foreground/40'}`} />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* No media placeholder */}
      {allMedia.length === 0 && (
        <div className="aspect-square w-full bg-secondary flex items-center justify-center">
          <p className="text-sm text-muted-foreground">📝 Post de texto</p>
        </div>
      )}

      {/* Actions */}
      <div className="px-4 pt-3">
        <div className="flex items-center gap-4">
          <button onClick={handleLike} className="transition-transform active:scale-90">
            <Heart
              className={`h-6 w-6 transition-colors ${
                post.is_liked ? 'fill-destructive text-destructive' : 'text-foreground hover:text-muted-foreground'
              } ${likeAnimating ? 'animate-heart' : ''}`}
            />
          </button>
          <button onClick={() => setShowComments(!showComments)} className="transition-transform active:scale-90">
            <MessageCircle className="h-6 w-6 text-foreground hover:text-muted-foreground transition-colors" />
          </button>
          <button className="transition-transform active:scale-90">
            <Share2 className="h-6 w-6 text-foreground hover:text-muted-foreground transition-colors" />
          </button>
        </div>

        <p className="mt-2 text-sm font-semibold text-foreground">
          {post.likes_count} curtida{post.likes_count !== 1 ? 's' : ''}
        </p>

        <p className="mt-1 text-sm text-foreground">
          <span className="font-semibold">{post.author_username}</span>{' '}
          <span className="text-secondary-foreground">{post.text}</span>
        </p>

        {post.comments_count > 0 && !showComments && (
          <button
            onClick={() => setShowComments(true)}
            className="mt-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Ver {post.comments_count > 2 ? `todos os ${post.comments_count} comentários` : 'comentários'}
          </button>
        )}
        <button onClick={() => setShowComments(prev => !prev)}>
            Ver comentários ({post.comments.length})
        </button>
        
        {showComments && (
        <div className="mt-2 space-y-2 animate-slide-up">
          {post.comments.map((comments) => (
            <p key={comments.id} className="text-sm">
              <span className="font-semibold text-foreground">
                {comments.author_username}
              </span>{' '}
              <span className="text-secondary-foreground">
                {comments.comments}
              </span>
            </p>
          ))}
        </div>
      )}
      
        <div className="flex items-center gap-2 py-3">
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleComment()}
            placeholder="Adicione um comentário..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
          />
          {commentText.trim() && (
            <button onClick={handleComment} className="text-primary font-semibold text-sm hover:text-primary/80 transition-colors">
              <Send className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </article>
  );
};

function getTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'agora';
  if (mins < 60) return `${mins}min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

export default PostCard;
