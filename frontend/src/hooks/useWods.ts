import { useState, useCallback, useEffect } from 'react';
import type { Wod } from '@/types';
import api from '@/services/api';

export const useWods = () => {
  const [wods, setWods] = useState<Wod[]>([]);
  const [pinnedWod, setPinnedWod] = useState<Wod | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const fetchWods = useCallback(async () => {
    try {
      const { data } = await api.get('/wod_list/');
      const list: Wod[] = data.results || data;
      setWods(list);
      setPinnedWod(list.find(w => w.pinned) || null);
    } catch (err) {
      console.error('Failed to fetch WODs', err);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  useEffect(() => { fetchWods(); }, [fetchWods]);
  
  const toggleLike = useCallback(async (wodId: number) => {
    const updateList = (items: Wod[]) =>
  items.map(w => {
    if (w.id !== wodId) return w;

    const isLiked = w.is_liked ?? false;
    const likesCount = w.likes_count ?? 0;

    return {
      ...w,
      is_liked: !isLiked,
      likes_count: isLiked ? likesCount - 1 : likesCount + 1,
    };
  });
    setWods(updateList);
    setPinnedWod(prev => prev?.id === wodId ? { ...prev, is_liked: !prev.is_liked, likes_count: prev.is_liked ? prev.likes_count - 1 : prev.likes_count + 1 } : prev);
    try {
      await api.post(`/wods/${wodId}/like/`);
    } catch {
      setWods(updateList);
    }
  }, []);
  
  const createWod = useCallback(async (data: { title: string; description_wod: string; pinned?: boolean }) => {
    const res = await api.post('/create_wod/', data);
    
    await fetchWods();
    return res.data;
  }, [fetchWods]);
  
  return { wods, pinnedWod, isLoading, toggleLike, createWod, refetch: fetchWods };
};
