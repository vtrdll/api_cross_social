import AppLayout from '@/components/layout/AppLayout';
import EventCard from '@/components/social/EventCard';
import { useEvents } from '@/hooks/useEvents';

const Events = () => {
  const { events, isLoading, joinEvent } = useEvents();

  return (
    <AppLayout>
      <div className="p-4 animate-fade-in">
        <h1 className="text-lg font-bold text-foreground mb-4">Eventos</h1>
        {isLoading ? (
          <div className="text-center py-20 text-muted-foreground">Carregando eventos...</div>
        ) : events.length > 0 ? (
          <div className="space-y-3">
            {events.map((event) => (
              <EventCard key={event.id} event={event} onParticipate={joinEvent} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-lg font-semibold text-foreground">Nenhum evento</p>
            <p className="text-sm text-muted-foreground mt-1">Volte em breve!</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Events;
