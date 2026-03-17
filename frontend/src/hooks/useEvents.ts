import { useState, useCallback, useEffect } from 'react';
import type { Event } from '@/types';
import api from '@/services/api';

export const useEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchEvents = useCallback(async () => {
    try {
      const { data } = await api.get('/event_list/');
      setEvents(data.results || data);
    } catch (err) {
      console.error('Failed to fetch events', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

 const joinEvent = useCallback(async (eventId: number) => {

  let previousEvents: Event[] = [];

  setEvents(prev => {
    previousEvents = prev;

    return prev.map(e =>
      e.id === eventId
        ? {
            ...e,
            is_participating: !e.is_participating,
            participants: e.is_participating
              ? e.participants - 1
              : e.participants + 1
          }
        : e
    );
  });

  try {
    await api.post(`/event/${eventId}/subscriber/`);
  } catch {
    setEvents(previousEvents);
  }

}, []);

  const createEvent = useCallback(async (formData: FormData) => {
    const { data } = await api.post('/events/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    await fetchEvents();
    return data;
  }, [fetchEvents]);

  return { events, isLoading, joinEvent, createEvent, refetch: fetchEvents };
};
