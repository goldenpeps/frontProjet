import { useCallback, useEffect, useMemo, useState } from 'react';
import { AdminUser, EquipeIntervention, equipeInterventionService, userService } from '@/services';

export function useEquipesInterventionsData() {
  const [equipes, setEquipes] = useState<EquipeIntervention[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const usersById = useMemo(() => new Map(users.map((user) => [user.id, user])), [users]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [equipesData, usersData] = await Promise.all([
        equipeInterventionService.getAll(),
        userService.getAll(),
      ]);
      setEquipes(equipesData);
      setUsers(usersData);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const clearMessages = useCallback(() => {
    setError('');
    setSuccessMsg('');
  }, []);

  return {
    equipes,
    users,
    usersById,
    loading,
    error,
    successMsg,
    setError,
    setSuccessMsg,
    fetchData,
    clearMessages,
  };
}
