import { useState } from 'react';
import { usePosts } from '@/hooks/usePosts';
import { useStories } from '@/hooks/useStories';
import { useWods } from '@/hooks/useWods';
import { useAuth } from '@/context/AuthContext';
import AppLayout from '@/components/layout/AppLayout';
import StoryBubble from '@/components/social/StoryBubble';
import StoryViewer from '@/components/social/StoryViewer';
import WodCard from '@/components/social/WodCard';
import PostCard from '@/components/social/PostCard';
import PostSkeleton from '@/components/social/PostSkeleton';


const Home = () => {
  const { profile } = useAuth();
  const { posts, isLoading, toggleLike, addComment, deletePost } = usePosts();
  const { stories } = useStories();
  const { pinnedWod, toggleLike: toggleWodLike } = useWods();
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  
  if (!profile) return null;


  return (
    
      
    <AppLayout>
      
      {/* Stories */}
      {stories.length > 0 && (
        <div className="border-b border-border">
          <div className="flex gap-4 overflow-x-auto px-4 py-4 scrollbar-hide"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            
            <button className="flex flex-col items-center gap-1 flex-shrink-0">
              <div className="relative h-[62px] w-[62px] rounded-full border-2 border-dashed border-primary/50 flex items-center justify-center">
                <span className="text-2xl text-primary">+</span>
              </div>
              <span className="text-[11px] text-muted-foreground">Seu story</span>
            </button>
            {stories.map((story, idx) => (
              <StoryBubble key={story.id} story={story} onClick={() => setViewerIndex(idx)} />
            ))}
          </div>
        </div>
      )}

      {/* WOD fixado */}
      {pinnedWod && <WodCard wod={pinnedWod} onLike={toggleWodLike} />}
      
      {/* Feed */}
      <div className="divide-y divide-border">
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            currentUserProfile={profile}
            onLike={toggleLike}
            onComment={addComment}
            onDelete={deletePost}
          />
        ))}
      </div>

      {/* Loading */}
      {isLoading && (
        <div>
          <PostSkeleton />
          <PostSkeleton />
        </div>
      )}

      {/* Empty state */}
      {!isLoading && posts.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-lg font-semibold text-foreground">Nenhum post ainda</p>
          <p className="text-sm text-muted-foreground mt-1">Seja o primeiro a compartilhar seu treino!</p>
        </div>
      )}

      {/* Story Viewer */}
      {viewerIndex !== null && (
        <StoryViewer
          stories={stories}
          initialIndex={viewerIndex}
          onClose={() => setViewerIndex(null)}
        />
      )}
    </AppLayout>
    
  );
};

export default Home;
