import { useState, useCallback, useEffect } from 'react';
import type { Story } from '@/types';
import api from '@/services/api';

export const useStories = () => {
  const [stories, setStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStories = useCallback(async () => {
    try {
      const { data } = await api.get('/story_list/');
      const list: Story[] = data.results || data;
      // Filter expired stories (24h)
      const now = Date.now();
      setStories(list.filter(s => now - new Date(s.created_at).getTime() < 24 * 60 * 60 * 1000));
    } catch (err) {
      console.error('Failed to fetch stories', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchStories(); }, [fetchStories]);

  const createStory = useCallback(async (formData: FormData) => {
    const { data } = await api.post('/story/create/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  }, []);

  return { stories, isLoading, createStory, refetch: fetchStories };
};
