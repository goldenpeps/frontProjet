import apiClient from './apiClient';
import { AxiosError } from 'axios';

export interface HistoriqueTerrain {
  id: number;
  ramassage: boolean;
  tonte: boolean;
  dateRamassage: string | null;
  dateTonte: string | null;
  terrainId: number | null;
}

export interface CreateHistoriqueTerrainData {
  ramassage: boolean;
  tonte: boolean;
  dateRamassage: string | null;
  dateTonte: string | null;
  terrainId: number;
}

export type UpdateHistoriqueTerrainData = Partial<CreateHistoriqueTerrainData>;

interface ApiError {
  error: boolean;
  message: string;
}

const LIST_ENDPOINTS = [
  '/admin/historique-terrains',
];

const ITEM_ENDPOINTS = [
  '/admin/historique-terrain',
];

function toIsoDate(value: unknown): string | null {
  if (typeof value === 'string' && value.trim()) {
    return value.slice(0, 10);
  }

  if (value && typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    if (typeof obj.date === 'string' && obj.date.trim()) {
      return obj.date.slice(0, 10);
    }
  }

  return null;
}

function normalizeHistoriqueTerrain(item: unknown): HistoriqueTerrain {
  const obj = (item ?? {}) as Record<string, unknown>;
  const terrainRaw = (obj.terrain ?? null) as Record<string, unknown> | null;
  const terrainIdRaw = obj.terrainId ?? obj.terrain_id ?? terrainRaw?.id ?? null;

  return {
    id: Number(obj.id ?? 0),
    ramassage: Boolean(obj.ramassage ?? obj.isramassage),
    tonte: Boolean(obj.tonte ?? obj.istonte),
    dateRamassage: toIsoDate(obj.dateRamassage ?? obj.dateramage),
    dateTonte: toIsoDate(obj.dateTonte),
    terrainId: terrainIdRaw == null ? null : Number(terrainIdRaw),
  };
}

function toApiPayload(data: CreateHistoriqueTerrainData | UpdateHistoriqueTerrainData): Record<string, unknown> {
  const payload: Record<string, unknown> = {};

  if (typeof data.terrainId !== 'undefined') payload.terrain_id = data.terrainId;
  if (typeof data.ramassage !== 'undefined') payload.isramassage = data.ramassage;
  if (typeof data.tonte !== 'undefined') payload.istonte = data.tonte;
  if (typeof data.dateRamassage !== 'undefined') payload.dateramage = data.dateRamassage;
  if (typeof data.dateTonte !== 'undefined') payload.dateTonte = data.dateTonte;

  return payload;
}

function extractHistoriqueTerrainArray(payload: unknown): HistoriqueTerrain[] {
  if (Array.isArray(payload)) return payload.map(normalizeHistoriqueTerrain);
  if (!payload || typeof payload !== 'object') return [];

  const obj = payload as Record<string, unknown>;
  const directKeys = ['historique_terrains', 'historiqueTerrains', 'items', 'data'];

  for (const key of directKeys) {
    const value = obj[key];
    if (Array.isArray(value)) return value.map(normalizeHistoriqueTerrain);
  }

  const data = obj.data;
  if (data && typeof data === 'object') {
    const nested = data as Record<string, unknown>;
    if (Array.isArray(nested.historique_terrains)) return nested.historique_terrains.map(normalizeHistoriqueTerrain);
    if (Array.isArray(nested.historiqueTerrains)) return nested.historiqueTerrains.map(normalizeHistoriqueTerrain);
    if (Array.isArray(nested.items)) return nested.items.map(normalizeHistoriqueTerrain);
  }

  return [];
}

function extractHistoriqueTerrain(payload: unknown): HistoriqueTerrain {
  if (payload && typeof payload === 'object') {
    const obj = payload as Record<string, unknown>;
    if (obj.historiqueTerrain && typeof obj.historiqueTerrain === 'object') {
      return normalizeHistoriqueTerrain(obj.historiqueTerrain);
    }
    if (obj.data && typeof obj.data === 'object') {
      const data = obj.data as Record<string, unknown>;
      if (data.historiqueTerrain && typeof data.historiqueTerrain === 'object') {
        return normalizeHistoriqueTerrain(data.historiqueTerrain);
      }
    }
  }

  return normalizeHistoriqueTerrain(payload);
}

function getApiErrorMessage(error: unknown, fallback: string): string {
  const axiosError = error as AxiosError<ApiError>;
  return axiosError.response?.data?.message || fallback;
}

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

  throw new Error(getApiErrorMessage(lastError, 'Erreur API'));
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

  throw new Error(getApiErrorMessage(lastError, 'Erreur API'));
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

  throw new Error(getApiErrorMessage(lastError, 'Erreur API'));
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

  throw new Error(getApiErrorMessage(lastError, 'Erreur API'));
}

export const historiqueTerrainService = {
  async getAll(): Promise<HistoriqueTerrain[]> {
    try {
      return await getWithFallback(LIST_ENDPOINTS, extractHistoriqueTerrainArray);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Erreur lors de la récupération des historiques de terrain'));
    }
  },

  async create(data: CreateHistoriqueTerrainData): Promise<HistoriqueTerrain> {
    try {
      return await postWithFallback(ITEM_ENDPOINTS, toApiPayload(data), extractHistoriqueTerrain);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Erreur lors de la création de l\'historique de terrain'));
    }
  },

  async update(id: number, data: UpdateHistoriqueTerrainData): Promise<HistoriqueTerrain> {
    try {
      return await putWithFallback(ITEM_ENDPOINTS, id, toApiPayload(data), extractHistoriqueTerrain);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Erreur lors de la mise à jour de l\'historique de terrain'));
    }
  },

  async remove(id: number): Promise<void> {
    try {
      await deleteWithFallback(ITEM_ENDPOINTS, id);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Erreur lors de la suppression de l\'historique de terrain'));
    }
  },
};
