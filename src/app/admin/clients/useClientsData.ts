import { useCallback, useEffect, useState } from 'react';
import { Client, clientService } from '@/services';

export function useClientsData() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchClients = useCallback(async () => {
    try {
      setLoading(true);
      const data = await clientService.getAll();
      setClients(data);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const clearMessages = useCallback(() => {
    setError('');
    setSuccessMsg('');
  }, []);

  return {
    clients,
    loading,
    error,
    successMsg,
    setError,
    setSuccessMsg,
    fetchClients,
    clearMessages,
  };
}
