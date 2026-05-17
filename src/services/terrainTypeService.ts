import apiClient from './apiClient';
import { AxiosError } from 'axios';

export interface TerrainType {
  id: number;
  nom: string;
  description: string;
}

export interface CreateTerrainTypeData {
  nom: string;
  description: string;
}

export type UpdateTerrainTypeData = Partial<CreateTerrainTypeData>;

interface ApiError {
  error: boolean;
  message: string;
}

const LIST_ENDPOINTS = [
  '/admin/type-terrain',
  '/admin/types-terrains',
  '/admin/type-terrain',
];

const CREATE_ENDPOINTS = [
  '/admin/type-terrain',
  '/admin/type-terrain',
];

const UPDATE_ENDPOINTS = [
  '/admin/type-terrain',
  '/admin/type-terrain',
];

const DELETE_ENDPOINTS = [
  '/admin/type-terrain',
  '/admin/type-terrain',
];

function normalizeTerrainType(item: unknown): TerrainType {
  const obj = (item ?? {}) as Record<string, unknown>;

  return {
    id: Number(obj.id ?? 0),
    nom: typeof obj.nom === 'string'
      ? obj.nom
      : typeof obj.Nom === 'string'
        ? obj.Nom
        : '',
    description: typeof obj.description === 'string' ? obj.description : '',
  };
}

function extractTerrainTypeArray(payload: unknown): TerrainType[] {
  if (Array.isArray(payload)) return payload.map(normalizeTerrainType);
  if (!payload || typeof payload !== 'object') return [];

  const obj = payload as Record<string, unknown>;
  const directKeys = ['type_terrains', 'types_terrains', 'typeTerrains', 'items', 'data'];

  for (const key of directKeys) {
    const value = obj[key];
    if (Array.isArray(value)) return value.map(normalizeTerrainType);
  }

  const data = obj.data;
  if (data && typeof data === 'object') {
    const nested = data as Record<string, unknown>;
    if (Array.isArray(nested.type_terrains)) return nested.type_terrains.map(normalizeTerrainType);
    if (Array.isArray(nested.types_terrains)) return nested.types_terrains.map(normalizeTerrainType);
    if (Array.isArray(nested.typeTerrains)) return nested.typeTerrains.map(normalizeTerrainType);
    if (Array.isArray(nested.items)) return nested.items.map(normalizeTerrainType);
  }

  return [];
}

function extractTerrainType(payload: unknown): TerrainType {
  if (payload && typeof payload === 'object') {
    const obj = payload as Record<string, unknown>;
    if (obj.type_terrain && typeof obj.type_terrain === 'object') return normalizeTerrainType(obj.type_terrain);
    if (obj.typeTerrain && typeof obj.typeTerrain === 'object') return normalizeTerrainType(obj.typeTerrain);
    if (obj.data && typeof obj.data === 'object') {
      const data = obj.data as Record<string, unknown>;
      if (data.type_terrain && typeof data.type_terrain === 'object') return normalizeTerrainType(data.type_terrain);
      if (data.typeTerrain && typeof data.typeTerrain === 'object') return normalizeTerrainType(data.typeTerrain);
    }
  }

  return normalizeTerrainType(payload);
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

export const terrainTypeService = {
  async getAll(): Promise<TerrainType[]> {
    try {
      return await getWithFallback(LIST_ENDPOINTS, extractTerrainTypeArray);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Erreur lors de la récupération des types de terrain'));
    }
  },

  async create(data: CreateTerrainTypeData): Promise<TerrainType> {
    try {
      return await postWithFallback(CREATE_ENDPOINTS, data, extractTerrainType);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Erreur lors de la création du type de terrain'));
    }
  },

  async update(id: number, data: UpdateTerrainTypeData): Promise<TerrainType> {
    try {
      return await putWithFallback(UPDATE_ENDPOINTS, id, data, extractTerrainType);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Erreur lors de la mise à jour du type de terrain'));
    }
  },

  async remove(id: number): Promise<void> {
    try {
      await deleteWithFallback(DELETE_ENDPOINTS, id);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Erreur lors de la suppression du type de terrain'));
    }
  },
};
