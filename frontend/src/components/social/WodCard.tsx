import { Dumbbell, Clock, Heart, Pin, Pencil, Trash2, Trophy } from 'lucide-react';
import type { Wod } from '@/types';

interface WodCardProps {
  wod: Wod;
  isCoach?: boolean;
  onLike?: (wodId: number) => void;
  onPin?: (wodId: number) => void;
  onEdit?: (wod: Wod) => void;
  onDelete?: (wodId: number) => void;
  onViewLeaderboard?: (wod: Wod) => void;
  onSubmitResult?: (wod: Wod) => void;
}

const typeLabel: Record<string, string> = {
  FOR_TIME: 'For Time',
  AMRAP: 'AMRAP',
  EMOM: 'EMOM',
};

const typeBadgeClass: Record<string, string> = {
  FOR_TIME: 'bg-primary/15 text-primary',
  AMRAP: 'bg-emerald-500/15 text-emerald-400',
  EMOM: 'bg-sky-500/15 text-sky-400',
};

const WodCard: React.FC<WodCardProps> = ({ wod, isCoach, onLike, onPin, onEdit, onDelete, onViewLeaderboard, onSubmitResult }) => {
  return (
    <div className="mx-4 my-3 rounded-xl border border-border bg-card p-4 animate-fade-in">
      <div className="flex items-center gap-2 mb-3">
        <div className="h-8 w-8 rounded-lg gradient-fire flex items-center justify-center">
          <Dumbbell className="h-4 w-4 text-primary-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-primary truncate">{wod.title}</h3>
            <span className={`shrink-0 rounded-md px-2 py-0.5 text-[10px] font-bold ${typeBadgeClass[wod.type] || 'bg-muted text-muted-foreground'}`}>
              {typeLabel[wod.type] || wod.type}
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" /> {wod.date}
            {wod.coach && <> · @{wod.coach.username}</>}
          </p>
        </div>
        {wod.pinned && (
          <span className="shrink-0 rounded-md bg-primary/15 px-2 py-0.5 text-xs font-semibold text-primary flex items-center gap-1">
            <Pin className="h-3 w-3" /> FIXADO
          </span>
        )}
      </div>

      <pre className="text-sm text-muted-foreground whitespace-pre-wrap font-sans leading-relaxed mb-3">
        {wod.description_wod}
      </pre>

      {wod.time_cap && (
        <p className="text-xs text-muted-foreground mb-2">⏱ Time Cap: {wod.time_cap} min</p>
      )}
      {wod.rounds && wod.type !== 'FOR_TIME' && (
        <p className="text-xs text-muted-foreground mb-2">🔄 Rounds: {wod.rounds}</p>
      )}

      <div className="flex items-center justify-between border-t border-border pt-3">
        <div className="flex items-center gap-3">
          <button onClick={() => onLike?.(wod.id)} className="flex items-center gap-1 text-sm transition-colors">
            <Heart className={`h-4 w-4 ${wod.is_liked ? 'fill-destructive text-destructive' : 'text-muted-foreground'}`} />
            <span className="text-muted-foreground">{wod.likes_count}</span>
          </button>
          <button onClick={() => onViewLeaderboard?.(wod)} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <Trophy className="h-3.5 w-3.5" /> Ranking
          </button>
          <button onClick={() => onSubmitResult?.(wod)} className="text-xs text-primary font-semibold hover:underline">
            Registrar resultado
          </button>
        </div>
        {isCoach && (
          <div className="flex items-center gap-2">
            {!wod.pinned && <button onClick={() => onPin?.(wod.id)} className="text-muted-foreground hover:text-primary transition-colors"><Pin className="h-4 w-4" /></button>}
            <button onClick={() => onEdit?.(wod)} className="text-muted-foreground hover:text-foreground transition-colors"><Pencil className="h-4 w-4" /></button>
            <button onClick={() => onDelete?.(wod.id)} className="text-muted-foreground hover:text-destructive transition-colors"><Trash2 className="h-4 w-4" /></button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WodCard;
