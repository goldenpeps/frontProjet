import { useCallback, useEffect, useState } from 'react';
import { TypeMateriel, typeMaterielService } from '@/services';

export function useTypesMaterielsData() {
  const [typesMateriels, setTypesMateriels] = useState<TypeMateriel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchTypesMateriels = useCallback(async () => {
    try {
      setLoading(true);
      const data = await typeMaterielService.getAll();
      setTypesMateriels(data);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTypesMateriels();
  }, [fetchTypesMateriels]);

  const clearMessages = useCallback(() => {
    setError('');
    setSuccessMsg('');
  }, []);

  return {
    typesMateriels,
    loading,
    error,
    successMsg,
    setError,
    setSuccessMsg,
    fetchTypesMateriels,
    clearMessages,
  };
}
