import apiClient from './apiClient';
import { AxiosError } from 'axios';

export interface Terrain {
  id: number;
  superficie: number;
  commentaire: string;
  client_id: number;
  type_terrain_id: number | null;
  intervention_id: number | null;
  adresse: unknown;
  coordonnees_gps: unknown;
}

export interface CreateTerrainData {
  superficie: number;
  commentaire: string;
  client_id: number;
  type_terrain_id: number;
  intervention_id: number | null;
  adresse: { nom: string; cp: string; adresse: string } | null;
  coordonnees_gps: unknown;
}

export type UpdateTerrainData = Partial<CreateTerrainData>;

interface ApiError {
  error: boolean;
  message: string;
}

function normalizeTerrain(item: unknown): Terrain {
  const obj = (item ?? {}) as Record<string, unknown>;

  const typeTerrainRaw = (obj.typeTerrain ?? obj.type_terrain ?? null) as Record<string, unknown> | null;
  const typeTerrainIdRaw = obj.type_terrain_id ?? obj.typeTerrainId ?? obj.typeTerrain_id ?? typeTerrainRaw?.id ?? null;
  const clientIdRaw = obj.client_id ?? obj.client ?? null;
  const interventionIdRaw = obj.intervention_id ?? obj.intervention ?? null;

  return {
    id: Number(obj.id ?? 0),
    superficie: Number(obj.superficie ?? 0),
    commentaire: typeof obj.commentaire === 'string' ? obj.commentaire : '',
    client_id: Number(clientIdRaw ?? 0),
    type_terrain_id: typeTerrainIdRaw == null ? null : Number(typeTerrainIdRaw),
    intervention_id: interventionIdRaw == null ? null : Number(interventionIdRaw),
    adresse: obj.adresse ?? null,
    coordonnees_gps: obj.coordonnees_gps ?? null,
  };
}

function extractTerrainArray(payload: unknown): Terrain[] {
  if (Array.isArray(payload)) return payload.map(normalizeTerrain);
  if (!payload || typeof payload !== 'object') return [];

  const obj = payload as Record<string, unknown>;
  const directKeys = ['terrains', 'terrain', 'data', 'items'];

  for (const key of directKeys) {
    const value = obj[key];
    if (Array.isArray(value)) return value.map(normalizeTerrain);
  }

  const data = obj.data;
  if (data && typeof data === 'object') {
    const nested = data as Record<string, unknown>;
    if (Array.isArray(nested.terrains)) return nested.terrains.map(normalizeTerrain);
    if (Array.isArray(nested.terrain)) return nested.terrain.map(normalizeTerrain);
    if (Array.isArray(nested.items)) return nested.items.map(normalizeTerrain);
  }

  return [];
}

function extractTerrain(payload: unknown): Terrain {
  if (payload && typeof payload === 'object') {
    const obj = payload as Record<string, unknown>;
    if (obj.terrain && typeof obj.terrain === 'object') return normalizeTerrain(obj.terrain);
    if (obj.data && typeof obj.data === 'object') {
      const data = obj.data as Record<string, unknown>;
      if (data.terrain && typeof data.terrain === 'object') return normalizeTerrain(data.terrain);
    }
  }

  return normalizeTerrain(payload);
}

const TERRAIN_LIST_ENDPOINTS = [
  '/admin/terrain/',
  '/admin/terrain',
  '/admin/terrains',
  '/admin/terrains/',
];

const TERRAIN_ITEM_ENDPOINTS = ['/admin/terrain', '/admin/terrains'];

async function getWithFallback<T>(endpoints: string[], parse: (payload: unknown) => T): Promise<T> {
  let lastError: unknown;

  for (const endpoint of endpoints) {
    try {
      const response = await apiClient.get<unknown>(endpoint);
      return parse(response.data);
    } catch (error) {
      lastError = error;
    }
  }

  const axiosError = lastError as AxiosError<ApiError>;
  throw new Error(axiosError.response?.data?.message || 'Erreur API');
}

async function postWithFallback<T>(endpoints: string[], data: unknown, parse: (payload: unknown) => T): Promise<T> {
  let lastError: unknown;

  for (const endpoint of endpoints) {
    try {
      const response = await apiClient.post<unknown>(endpoint, data);
      return parse(response.data);
    } catch (error) {
      lastError = error;
    }
  }

  const axiosError = lastError as AxiosError<ApiError>;
  throw new Error(axiosError.response?.data?.message || 'Erreur API');
}

async function putWithFallback<T>(baseEndpoints: string[], id: number, data: unknown, parse: (payload: unknown) => T): Promise<T> {
  let lastError: unknown;

  for (const baseEndpoint of baseEndpoints) {
    try {
      const response = await apiClient.put<unknown>(`${baseEndpoint}/${id}`, data);
      return parse(response.data);
    } catch (error) {
      lastError = error;
    }
  }

  const axiosError = lastError as AxiosError<ApiError>;
  throw new Error(axiosError.response?.data?.message || 'Erreur API');
}

async function deleteWithFallback(baseEndpoints: string[], id: number): Promise<void> {
  let lastError: unknown;

  for (const baseEndpoint of baseEndpoints) {
    try {
      await apiClient.delete(`${baseEndpoint}/${id}`);
      return;
    } catch (error) {
      lastError = error;
    }
  }

  const axiosError = lastError as AxiosError<ApiError>;
  throw new Error(axiosError.response?.data?.message || 'Erreur API');
}

export const terrainService = {
  async getAll(): Promise<Terrain[]> {
    try {
      return await getWithFallback(TERRAIN_LIST_ENDPOINTS, extractTerrainArray);
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      throw new Error(axiosError.response?.data?.message || 'Erreur lors de la récupération des terrains');
    }
  },

  async create(data: CreateTerrainData): Promise<Terrain> {
    try {
      return await postWithFallback(TERRAIN_ITEM_ENDPOINTS, data, extractTerrain);
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      throw new Error(axiosError.response?.data?.message || 'Erreur lors de la création du terrain');
    }
  },

  async update(id: number, data: UpdateTerrainData): Promise<Terrain> {
    try {
      return await putWithFallback(TERRAIN_ITEM_ENDPOINTS, id, data, extractTerrain);
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      throw new Error(axiosError.response?.data?.message || 'Erreur lors de la mise à jour du terrain');
    }
  },

  async remove(id: number): Promise<void> {
    try {
      await deleteWithFallback(TERRAIN_ITEM_ENDPOINTS, id);
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      throw new Error(axiosError.response?.data?.message || 'Erreur lors de la suppression du terrain');
    }
  },
};
