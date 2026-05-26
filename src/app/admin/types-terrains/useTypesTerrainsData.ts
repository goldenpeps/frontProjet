import { useCallback, useEffect, useState } from 'react';
import { TerrainType, terrainTypeService } from '@/services';

export function useTypesTerrainsData() {
  const [typesTerrains, setTypesTerrains] = useState<TerrainType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchTypesTerrains = useCallback(async () => {
    try {
      setLoading(true);
      const data = await terrainTypeService.getAll();
      setTypesTerrains(data);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTypesTerrains();
  }, [fetchTypesTerrains]);

  const clearMessages = useCallback(() => {
    setError('');
    setSuccessMsg('');
  }, []);

  return {
    typesTerrains,
    loading,
    error,
    successMsg,
    setError,
    setSuccessMsg,
    fetchTypesTerrains,
    clearMessages,
  };
}
