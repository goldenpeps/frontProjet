import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  HistoriqueTerrain,
  Terrain,
  historiqueTerrainService,
  terrainService,
} from '@/services';

export function useHistoriqueTerrainsData() {
  const [historiques, setHistoriques] = useState<HistoriqueTerrain[]>([]);
  const [terrains, setTerrains] = useState<Terrain[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [refError, setRefError] = useState('');

  const terrainById = useMemo(() => new Map(terrains.map((terrain) => [terrain.id, terrain])), [terrains]);

  const fetchHistoriques = useCallback(async () => {
    try {
      setLoading(true);
      const data = await historiqueTerrainService.getAll();
      setHistoriques(data);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTerrains = useCallback(async () => {
    try {
      const data = await terrainService.getAll();
      setTerrains(data);
      setRefError('');
    } catch (err) {
      setRefError(err instanceof Error ? err.message : 'Erreur de chargement des terrains');
    }
  }, []);

  useEffect(() => {
    fetchHistoriques();
    fetchTerrains();
  }, [fetchHistoriques, fetchTerrains]);

  const clearMessages = useCallback(() => {
    setError('');
    setSuccessMsg('');
    setRefError('');
  }, []);

  return {
    historiques,
    terrains,
    loading,
    error,
    successMsg,
    refError,
    terrainById,
    setError,
    setSuccessMsg,
    fetchHistoriques,
    clearMessages,
  };
}
