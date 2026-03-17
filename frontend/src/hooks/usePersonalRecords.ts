import { useState, useCallback, useEffect } from 'react';
import type { ProfilePersonalRecord } from '@/types';
import api from '@/services/api';

export const usePersonalRecords = () => {
  const [records, setRecords] = useState<ProfilePersonalRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRecords = useCallback(async () => {
    try {
      const { data } = await api.get('/list_pr/');
      
      setRecords(data.results || data);
    } catch (err) {
      console.error('Failed to fetch PRs', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  const createRecord = useCallback(
  async (record: { moviment: number; personal_record: string; date: string }) => {
    const { data } = await api.post('/create_pr/', record);
    setRecords(prev => [...prev, data]);
    return data;
  },
  []
);

  const updateRecord =  useCallback(
  async (id: number, record: { moviment: number; personal_record: string; date: string }) => {
    const { data } = await api.patch(`/update_pr/${id}/`, record);
    setRecords(prev => prev.map(r => r.id === id ? data : r));
    return data;
  },
  []
);

  const deleteRecord = useCallback(async (id: number) => {
    await api.delete(`/update_pr/${id}/`);
    setRecords(prev => prev.filter(r => r.id !== id));
  }, []);

  return { records, isLoading, createRecord, updateRecord, deleteRecord, refetch: fetchRecords };
};
