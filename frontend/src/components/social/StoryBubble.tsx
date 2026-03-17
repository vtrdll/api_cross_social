import type { Story } from '@/types';

interface StoryBubbleProps {
  story: Story;
  onClick?: () => void;
}

const StoryBubble: React.FC<StoryBubbleProps> = ({ story, onClick }) => {
  
  const initials = `${(story.user.first_name || 'U')[0]}${(story.user.last_name || '')[0] || ''}`.toUpperCase();
  const photo = story.user.profile.photo;
  const thumbnail = story.images?.[0]?.story_image || story.videos?.[0]?.story_video;

  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1 flex-shrink-0"
    >
      <div className={`rounded-full p-[2px] ${story.is_viewed ? 'bg-muted' : 'gradient-story'}`}>
        <div className="rounded-full bg-background p-[2px]">
          {photo ? (
            <img src={photo} alt={story.user.username} className="h-14 w-14 rounded-full object-cover" />
          ) : (
            <div className="h-14 w-14 rounded-full gradient-fire flex items-center justify-center text-sm font-bold text-primary-foreground">
              {initials}
            </div>
          )}
        </div>
      </div>
      <span className="text-[11px] text-muted-foreground max-w-[64px] truncate">
        {story.user.username}
      </span>
    </button>
  );
};


export default StoryBubble;
