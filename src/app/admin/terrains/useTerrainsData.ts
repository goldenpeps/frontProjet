import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Client,
  Intervention,
  Terrain,
  TerrainType,
  clientService,
  interventionService,
  terrainService,
  terrainTypeService,
} from '@/services';

export function useTerrainsData() {
  const [terrains, setTerrains] = useState<Terrain[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [terrainTypes, setTerrainTypes] = useState<TerrainType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refError, setRefError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const clientById = useMemo(() => new Map(clients.map((client) => [client.id, client])), [clients]);
  const terrainTypeById = useMemo(
    () => new Map(terrainTypes.map((terrainType) => [terrainType.id, terrainType])),
    [terrainTypes]
  );

  const fetchTerrains = useCallback(async () => {
    try {
      setLoading(true);
      const data = await terrainService.getAll();
      setTerrains(data);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchReferenceData = useCallback(async () => {
    try {
      const [clientData, interventionData, terrainTypeData] = await Promise.all([
        clientService.getAll(),
        interventionService.getAll(),
        terrainTypeService.getAll(),
      ]);

      setClients(clientData);
      setInterventions(interventionData);
      setTerrainTypes(terrainTypeData);
      setRefError('');
    } catch (err) {
      setRefError(err instanceof Error ? err.message : 'Erreur de chargement des references');
    }
  }, []);

  useEffect(() => {
    fetchTerrains();
    fetchReferenceData();
  }, [fetchTerrains, fetchReferenceData]);

  const clearMessages = useCallback(() => {
    setError('');
    setRefError('');
    setSuccessMsg('');
  }, []);

  return {
    terrains,
    clients,
    interventions,
    terrainTypes,
    loading,
    error,
    refError,
    successMsg,
    clientById,
    terrainTypeById,
    setError,
    setSuccessMsg,
    fetchTerrains,
    clearMessages,
  };
}
