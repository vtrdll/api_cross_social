import { Dumbbell, Clock, Heart } from 'lucide-react';
import type { Wod } from '@/types';

interface WodCardProps {
  wod: Wod;
  onLike?: (wodId: number) => void;
}
  
const WodCard: React.FC<WodCardProps> = ({ wod, onLike }) => {
  
  return (
    <div className="mx-4 my-3 rounded-xl border border-primary/30 bg-card p-4 glow-primary animate-fade-in">
      <div className="flex items-center gap-2 mb-3">
        <div className="h-8 w-8 rounded-lg gradient-fire flex items-center justify-center">
          <Dumbbell className="h-4 w-4 text-primary-foreground" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-primary">WOD DO DIA</h3>
          <p className="text-[11px] text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" /> {wod.date}
          </p>
        </div>
        {wod.pinned && (
          <span className="ml-auto rounded-md bg-primary/15 px-2 py-0.5 text-xs font-semibold text-primary">
            FIXADO
          </span>
        )}
      </div>
      <h4 className="text-lg font-bold text-foreground mb-2">{wod.title}</h4>
      <pre className="text-sm text-muted-foreground whitespace-pre-wrap font-sans leading-relaxed">
        {wod.description_wod}
      </pre>
      <div className="mt-3 flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          Coach: <span className="text-foreground font-medium">{wod.coach_user}</span>
        </p>
        <button
          onClick={() => onLike?.(wod.id)}
          className="flex items-center gap-1 text-sm transition-colors"
        >
          <Heart className={`h-4 w-4 ${wod.is_liked ? 'fill-destructive text-destructive' : 'text-muted-foreground'}`} />
          <span className="text-muted-foreground">{wod.likes_count}</span>
        </button>
      </div>
    </div>
  );
};

export default WodCard;
