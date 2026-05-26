import { useCallback, useEffect, useState } from 'react';
import { Materiel, TypeMateriel, materielService, typeMaterielService } from '@/services';

export function useMaterielData() {
  const [materiels, setMateriels] = useState<Materiel[]>([]);
  const [typeMateriels, setTypeMateriels] = useState<TypeMateriel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchMateriel = useCallback(async () => {
    try {
      setLoading(true);
      const [materielData, typeData] = await Promise.all([
        materielService.getAll(),
        typeMaterielService.getAll(),
      ]);
      setMateriels(materielData);
      setTypeMateriels(typeData);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMateriel();
  }, [fetchMateriel]);

  const clearMessages = useCallback(() => {
    setError('');
    setSuccessMsg('');
  }, []);

  return {
    materiels,
    typeMateriels,
    loading,
    error,
    successMsg,
    setError,
    setSuccessMsg,
    fetchMateriel,
    clearMessages,
  };
}
