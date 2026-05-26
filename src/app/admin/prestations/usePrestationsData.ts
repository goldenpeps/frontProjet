import { useCallback, useEffect, useState } from 'react';
import { Prestation, prestationService } from '@/services';

export function usePrestationsData() {
  const [prestations, setPrestations] = useState<Prestation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchPrestations = useCallback(async () => {
    try {
      setLoading(true);
      const data = await prestationService.getAll();
      setPrestations(data);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrestations();
  }, [fetchPrestations]);

  const clearMessages = useCallback(() => {
    setError('');
    setSuccessMsg('');
  }, []);

  return {
    prestations,
    loading,
    error,
    successMsg,
    setError,
    setSuccessMsg,
    fetchPrestations,
    clearMessages,
  };
}
