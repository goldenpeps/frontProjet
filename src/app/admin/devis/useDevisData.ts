import { useCallback, useEffect, useState } from 'react';
import { Devis, devisService } from '@/services';

export function useDevisData() {
  const [devis, setDevis] = useState<Devis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchDevis = useCallback(async () => {
    try {
      setLoading(true);
      const data = await devisService.getAll();
      setDevis(data);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDevis();
  }, [fetchDevis]);

  const clearMessages = useCallback(() => {
    setError('');
    setSuccessMsg('');
  }, []);

  return {
    devis,
    loading,
    error,
    successMsg,
    setError,
    setSuccessMsg,
    fetchDevis,
    clearMessages,
  };
}
