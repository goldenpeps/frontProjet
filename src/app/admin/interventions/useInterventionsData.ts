import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Client,
  EquipeIntervention,
  Intervention,
  Materiel,
  MaterielUtilise,
  Prestation,
  Terrain,
  clientService,
  equipeInterventionService,
  interventionService,
  materielService,
  materielUtiliseService,
  prestationService,
  terrainService,
} from '@/services';

export function useInterventionsData(selectedClientId: string) {
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [prestations, setPrestations] = useState<Prestation[]>([]);
  const [terrains, setTerrains] = useState<Terrain[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [equipes, setEquipes] = useState<EquipeIntervention[]>([]);
  const [materiels, setMateriels] = useState<Materiel[]>([]);
  const [materielsUtilises, setMaterielsUtilises] = useState<MaterielUtilise[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const clientById = useMemo(() => new Map(clients.map((client) => [client.id, client])), [clients]);
  const equipeById = useMemo(() => new Map(equipes.map((equipe) => [equipe.id, equipe])), [equipes]);
  const materielById = useMemo(() => new Map(materiels.map((materiel) => [materiel.id, materiel])), [materiels]);
  const materielUtiliseById = useMemo(
    () => new Map(materielsUtilises.map((materielUtilise) => [materielUtilise.id, materielUtilise])),
    [materielsUtilises]
  );

  const filteredTerrains = useMemo(() => {
    const clientId = Number(selectedClientId);
    if (Number.isNaN(clientId) || clientId <= 0) return terrains;
    return terrains.filter((terrain) => terrain.client_id === clientId);
  }, [selectedClientId, terrains]);

  const fetchInterventions = useCallback(async () => {
    try {
      setLoading(true);
      const [
        interventionsData,
        prestationsData,
        terrainsData,
        clientsData,
        equipesData,
        materielsData,
        materielsUtilisesData,
      ] = await Promise.all([
        interventionService.getAll(),
        prestationService.getAll(),
        terrainService.getAll(),
        clientService.getAll(),
        equipeInterventionService.getAll(),
        materielService.getAll(),
        materielUtiliseService.getAll(),
      ]);

      setInterventions(interventionsData);
      setPrestations(prestationsData);
      setTerrains(terrainsData);
      setClients(clientsData);
      setEquipes(equipesData);
      setMateriels(materielsData);
      setMaterielsUtilises(materielsUtilisesData);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInterventions();
  }, [fetchInterventions]);

  const clearMessages = useCallback(() => {
    setError('');
    setSuccessMsg('');
  }, []);

  return {
    interventions,
    prestations,
    terrains,
    clients,
    equipes,
    materiels,
    materielsUtilises,
    loading,
    error,
    successMsg,
    setError,
    setSuccessMsg,
    clientById,
    equipeById,
    materielById,
    materielUtiliseById,
    filteredTerrains,
    fetchInterventions,
    clearMessages,
  };
}
