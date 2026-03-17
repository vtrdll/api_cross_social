import { useState, useEffect, useCallback } from 'react';
import api from '@/services/api';

export interface Moviment {
  id: number;
  name: string;
}

export const useMoviments = () => {
  const [moviments, setMoviments] = useState<Moviment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMoviments = useCallback(async () => {
    try {
      const { data } = await api.get('/list_moviment/');
      setMoviments(data.results || data);
    } catch (error) {
      console.error('Erro ao buscar movimentos', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMoviments();
  }, [fetchMoviments]);

  return { moviments, isLoading };
};
