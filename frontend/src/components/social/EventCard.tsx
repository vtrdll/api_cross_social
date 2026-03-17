import { Calendar, MapPin, Users, ChevronRight } from 'lucide-react';
import type { Event } from '@/types';

interface EventCardProps {
  event: Event;
  onParticipate?: (eventId: number) => void;
}

const EventCard: React.FC<EventCardProps> = ({ event, onParticipate }) => {
  return (
    <div className="rounded-xl border border-border bg-card p-4 animate-fade-in hover:border-primary/30 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <h3 className="text-base font-bold text-foreground">{event.name}</h3>
          <div className="mt-2 space-y-1">
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 text-primary" />
              {new Date(event.date_initial).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
            </p>
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 text-primary" />
              {event.location}
            </p>
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4 text-primary" />
              {event.participants} inscritos
            </p>
          </div>
          <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{event.description}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="text-center rounded-lg bg-secondary p-2 min-w-[48px]">
            <p className="text-lg font-bold text-primary">{new Date(event.date_initial).getDate()}</p>
            <p className="text-[10px] uppercase text-muted-foreground font-medium">
              {new Date(event.date_initial).toLocaleDateString('pt-BR', { month: 'short' })}
            </p>
          </div>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <button
          onClick={() => onParticipate?.(event.id)}
          className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-colors ${
            event.is_participating
              ? 'bg-secondary text-muted-foreground'
              : 'gradient-fire text-primary-foreground hover:opacity-90'
          }`}
        >
          {event.is_participating ? 'Inscrito ✓' : 'Increver-se'}
        </button>
        <button className="rounded-lg border border-border p-2 hover:bg-secondary transition-colors">
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
};

export default EventCard;
