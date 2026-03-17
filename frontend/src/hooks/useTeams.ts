import { useState, useCallback, useEffect } from 'react';
import type { Team,TeamForm } from '@/types';
import api from '@/services/api';

export const useTeams = (memberFilter?: string) => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTeams = useCallback(async () => {
    try {
      const params = memberFilter ? { member: memberFilter } : {};
      const { data } = await api.get('/list_team/', { params });
      setTeams(data.results || data);
    } catch (err) {
      console.error('Failed to fetch teams', err);
    } finally {
      setIsLoading(false);
    }
  }, [memberFilter]);
  
  useEffect(() => { fetchTeams(); }, [fetchTeams]);

  const createTeam = useCallback(async (team: TeamForm) => {
  const { data } = await api.post('/create_team/', team);
  setTeams(prev => [...prev, data]);
}, []);

  const updateTeam = useCallback(async (id: number, team: Partial<Team>) => {
    const { data } = await api.patch(`/times/${id}/`, team);
    setTeams(prev => prev.map(t => t.id === id ? data : t));
    return data;
  }, []);

  const addMember = useCallback(async (teamId: number, userId: number) => {
    await api.post(`/times/${teamId}/add-member/`, { user_id: userId });
    await fetchTeams();
  }, [fetchTeams]);

  const removeMember = useCallback(async (teamId: number, userId: number) => {
    await api.post(`/times/${teamId}/remove-member/`, { user_id: userId });
    await fetchTeams();
  }, [fetchTeams]);

  return { teams, isLoading, createTeam, updateTeam, addMember, removeMember, refetch: fetchTeams };
};
