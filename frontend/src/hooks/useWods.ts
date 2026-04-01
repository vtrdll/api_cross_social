import { useState, useCallback, useEffect } from 'react';
import type { Wod, WodResult, LeaderboardEntry } from '@/types';
import api from '@/services/api';

export const useWods = () => {
  const [wods, setWods] = useState<Wod[]>([]);
  const [pinnedWod, setPinnedWod] = useState<Wod | null>(null);
  const [todayWod, setTodayWod] = useState<Wod | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchWods = useCallback(async (params?: { type?: string; date?: string }) => {
    try {
      let url = '/wods/';
      const qp = new URLSearchParams();
      if (params?.type) qp.set('type', params.type);
      if (params?.date) qp.set('date', params.date);
      if (qp.toString()) url += `?${qp}`;
      const { data } = await api.get(url);
      const list: Wod[] = data.results || data;
      setWods(list);
    } catch (err) {
      console.error('Failed to fetch WODs', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchPinned = useCallback(async () => {
    try {
      const { data } = await api.get('/wods/pinned/');
      setPinnedWod(data);
    } catch {
      setPinnedWod(null);
    }
  }, []);

  const fetchToday = useCallback(async () => {
    try {
      const { data } = await api.get('/wods/today/');
      setTodayWod(data);
    } catch {
      setTodayWod(null);
    }
  }, []);

  useEffect(() => {
    fetchWods();
    fetchPinned();
    fetchToday();
  }, [fetchWods, fetchPinned, fetchToday]);

  const toggleLike = useCallback(async (wodId: number) => {
    setWods(prev => prev.map(w =>
      w.id === wodId
        ? { ...w, is_liked: !w.is_liked, likes_count: w.is_liked ? w.likes_count - 1 : w.likes_count + 1 }
        : w
    ));
    try {
      await api.post(`/wods/${wodId}/like/`);
    } catch {
      fetchWods();
    }
  }, [fetchWods]);

  const createWod = useCallback(async (data: { title: string; description_wod: string; type: string; pinned?: boolean; time_cap?: number; rounds?: number }) => {
    const res = await api.post('/wods/', data);
    await fetchWods();
    return res.data;
  }, [fetchWods]);

  const updateWod = useCallback(async (id: number, data: Partial<Wod>) => {
    const res = await api.patch(`/wods/${id}/`, data);
    await fetchWods();
    return res.data;
  }, [fetchWods]);

  const deleteWod = useCallback(async (id: number) => {
    await api.delete(`/wods/${id}/`);
    await fetchWods();
  }, [fetchWods]);

  const pinWod = useCallback(async (id: number) => {
    await api.post(`/wods/${id}/pin/`);
    await fetchPinned();
    await fetchWods();
  }, [fetchPinned, fetchWods]);

  // Results
  const submitResult = useCallback(async (payload: { wod: number; completed: boolean; notes?: string }) => {
    const res = await api.post('/wod-results/', payload);
    return res.data;
  }, []);

  const submitForTime = useCallback(async (wodResultId: number, timeSeconds: number) => {
    return (await api.post('/for-time-results/', { wod_result: wodResultId, time_seconds: timeSeconds })).data;
  }, []);

  const submitAmrap = useCallback(async (wodResultId: number, rounds: number, reps: number) => {
    return (await api.post('/amrap-results/', { wod_result: wodResultId, rounds, reps })).data;
  }, []);

  const submitEmom = useCallback(async (wodResultId: number, roundsCompleted: number, failedMinute?: number) => {
    return (await api.post('/emom-results/', { wod_result: wodResultId, rounds_completed: roundsCompleted, failed_minute: failedMinute })).data;
  }, []);

  const fetchLeaderboard = useCallback(async (wodId: number): Promise<LeaderboardEntry[]> => {
    const { data } = await api.get(`/wod-results/leaderboard/?wod_id=${wodId}`);
    return data.leaderboard || [];
  }, []);

  const fetchMyResults = useCallback(async (): Promise<WodResult[]> => {
    const { data } = await api.get('/wod-results/my-results/');
    return data.results || data;
  }, []);

  return {
    wods, pinnedWod, todayWod, isLoading,
    toggleLike, createWod, updateWod, deleteWod, pinWod,
    submitResult, submitForTime, submitAmrap, submitEmom,
    fetchLeaderboard, fetchMyResults,
    refetch: fetchWods, refetchPinned: fetchPinned,
  };
};
