import { useCallback, useEffect, useState } from 'react';
import { AdminUser, userService } from '@/services';

export function useUsersData() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await userService.getAll();
      setUsers(data);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const clearMessages = useCallback(() => {
    setError('');
    setSuccessMsg('');
  }, []);

  return {
    users,
    loading,
    error,
    successMsg,
    setError,
    setSuccessMsg,
    fetchUsers,
    clearMessages,
  };
}
