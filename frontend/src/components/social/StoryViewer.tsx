import { useState, useEffect, useCallback, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, Volume2, VolumeX } from 'lucide-react';
import type { Story } from '@/types';
import { createPortal } from 'react-dom';
interface StoryViewerProps {
  stories: Story[];
  initialIndex: number;
  onClose: () => void;
}
const STORY_DURATION = 5000; // 5s per slide
const StoryViewer: React.FC<StoryViewerProps> = ({ stories, initialIndex, onClose }) => {
    
  const [storyIdx, setStoryIdx] = useState(initialIndex);
  const [slideIdx, setSlideIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<number | null>(null);
  const startRef = useRef<number>(0);
  const elapsedRef = useRef<number>(0);
  const story = stories[storyIdx];
  const slides = [
  ...(story?.story_images?.map(i => ({ type: 'image' as const, src: i.story_image })) || []),
  ...(story?.story_videos?.map(v => ({ type: 'video' as const, src: v.story_video })) || []),
];
  const currentSlide = slides[slideIdx];
  const totalSlides = slides.length || 1;
  const goNextSlide = useCallback(() => {
    if (slideIdx < slides.length - 1) {
      setSlideIdx(s => s + 1);
    } else if (storyIdx < stories.length - 1) {
      setStoryIdx(s => s + 1);
      setSlideIdx(0);
    } else {
      onClose();
    }
    setProgress(0);
    elapsedRef.current = 0;
  }, [slideIdx, slides.length, storyIdx, stories.length, onClose]);
  const goPrevSlide = useCallback(() => {
    if (slideIdx > 0) {
      setSlideIdx(s => s - 1);
    } else if (storyIdx > 0) {
      setStoryIdx(s => s - 1);
      setSlideIdx(0);
    }
    setProgress(0);
    elapsedRef.current = 0;
  }, [slideIdx, storyIdx]);
  // Auto-advance timer
  useEffect(() => {
    if (paused || currentSlide?.type === 'video') return;
    const tick = () => {
      const now = performance.now();
      const elapsed = elapsedRef.current + (now - startRef.current);
      const pct = Math.min(elapsed / STORY_DURATION, 1);
      setProgress(pct);
      if (pct >= 1) {
        goNextSlide();
      } else {
        timerRef.current = requestAnimationFrame(tick);
      }
    };
    startRef.current = performance.now();
    timerRef.current = requestAnimationFrame(tick);
    return () => {
      if (timerRef.current) cancelAnimationFrame(timerRef.current);
      elapsedRef.current += performance.now() - startRef.current;
    };
  }, [paused, slideIdx, storyIdx, currentSlide?.type, goNextSlide]);
  // Video: advance on end
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid || currentSlide?.type !== 'video') return;
    const onTime = () => {
      if (vid.duration) setProgress(vid.currentTime / vid.duration);
    };
    const onEnd = () => goNextSlide();
    vid.addEventListener('timeupdate', onTime);
    vid.addEventListener('ended', onEnd);
    return () => {
      vid.removeEventListener('timeupdate', onTime);
      vid.removeEventListener('ended', onEnd);
    };
  }, [currentSlide, goNextSlide]);
  // Keyboard
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') goNextSlide();
      if (e.key === 'ArrowLeft') goPrevSlide();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose, goNextSlide, goPrevSlide]);
  // Touch
  const touchX = useRef(0);
  const handleTouchStart = (e: React.TouchEvent) => { touchX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = e.changedTouches[0].clientX - touchX.current;
    if (diff > 60) goPrevSlide();
    else if (diff < -60) goNextSlide();
  };
  // Tap zones
  const handleTap = (e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    if (x < rect.width * 0.3) goPrevSlide();
    else if (x > rect.width * 0.7) goNextSlide();
    else setPaused(p => !p);
  };
  if (!story || !currentSlide) return null;
  const user = story.user;
  const photo = story.user_profile?.photo;
  const initials = `${(user.first_name || 'U')[0]}${(user.last_name || '')[0] || ''}`.toUpperCase();
  const timeAgo = getTimeAgo(story.created_at);
  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
      {/* Container */}
      <div
        className="relative w-full h-full max-w-[480px] max-h-[900px] bg-black overflow-hidden"
        onClick={handleTap}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Progress bars */}
        <div className="absolute top-0 left-0 right-0 z-20 flex gap-1 px-2 pt-2">
          {Array.from({ length: totalSlides }).map((_, i) => (
            <div key={i} className="flex-1 h-[3px] rounded-full bg-white/30 overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-none"
                style={{
                  width: `${i < slideIdx ? 100 : i === slideIdx ? progress * 100 : 0}%`,
                }}
              />
            </div>
          ))}
        </div>
        {/* Header */}
        <div className="absolute top-4 left-0 right-0 z-20 flex items-center justify-between px-3 pt-2">
          <div className="flex items-center gap-2">
            {photo ? (
              <img src={photo} alt="" className="h-8 w-8 rounded-full object-cover border border-white/20" />
            ) : (
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground">
                {initials}
              </div>
            )}
            <span className="text-white text-sm font-medium">{user.username}</span>
            <span className="text-white/50 text-xs">{timeAgo}</span>
          </div>
          <div className="flex items-center gap-2">
            {currentSlide.type === 'video' && (
              <button onClick={(e) => { e.stopPropagation(); setMuted(m => !m); }} className="text-white/80 hover:text-white">
                {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
              </button>
            )}
            <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="text-white/80 hover:text-white">
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>
        {/* Media */}
        {currentSlide.type === 'image' ? (
          <img
            src={currentSlide.src}
            alt=""
            className="absolute inset-0 w-full h-full object-contain"
          />
        ) : (
          <video
            ref={videoRef}
            src={currentSlide.src}
            autoPlay
            muted={muted}
            playsInline
            className="absolute inset-0 w-full h-full object-contain"
          />
        )}
        {/* Nav arrows (desktop) */}
        {storyIdx > 0 && (
          <button
            onClick={(e) => { e.stopPropagation(); goPrevSlide(); }}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 hidden md:flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}
        {storyIdx < stories.length - 1 && (
          <button
            onClick={(e) => { e.stopPropagation(); goNextSlide(); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 hidden md:flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
};
function getTimeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h`;
}
export default StoryViewer;