import apiClient from './apiClient';
import { AxiosError } from 'axios';

export interface MaterielUtiliseItem {
  id: number;
  disponible: boolean;
}

export interface MaterielUtilise {
  id: number;
  durree: string;
  materiels: MaterielUtiliseItem[];
}

export interface CreateMaterielUtiliseData {
  durree: string;
  materielIds: number[];
}

interface ApiError {
  error: boolean;
  message: string;
}

function toBoolean(value: unknown): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value === 1;
  if (typeof value === 'string') return value === '1' || value.toLowerCase() === 'true';
  return false;
}

function normalizeMaterielUtilise(item: unknown): MaterielUtilise {
  const obj = (item ?? {}) as Record<string, unknown>;
  const materielsRaw = Array.isArray(obj.materiels) ? obj.materiels : [];

  return {
    id: Number(obj.id ?? 0),
    durree: typeof obj.durree === 'string' ? obj.durree : '',
    materiels: materielsRaw.map((entry) => {
      const mat = (entry ?? {}) as Record<string, unknown>;
      return {
        id: Number(mat.id ?? 0),
        disponible: toBoolean(mat.disponible),
      };
    }),
  };
}

function extractMaterielUtiliseArray(payload: unknown): MaterielUtilise[] {
  if (Array.isArray(payload)) return payload.map(normalizeMaterielUtilise);
  if (!payload || typeof payload !== 'object') return [];

  const obj = payload as Record<string, unknown>;
  const directKeys = ['materiels_utilises', 'materiel_utilise', 'data', 'items'];

  for (const key of directKeys) {
    const value = obj[key];
    if (Array.isArray(value)) return value.map(normalizeMaterielUtilise);
  }

  const data = obj.data;
  if (data && typeof data === 'object') {
    const nested = data as Record<string, unknown>;
    if (Array.isArray(nested.materiels_utilises)) return nested.materiels_utilises.map(normalizeMaterielUtilise);
    if (Array.isArray(nested.items)) return nested.items.map(normalizeMaterielUtilise);
  }

  return [];
}

function extractMaterielUtilise(payload: unknown): MaterielUtilise {
  if (payload && typeof payload === 'object') {
    const obj = payload as Record<string, unknown>;
    if (obj.materielUtilise && typeof obj.materielUtilise === 'object') return normalizeMaterielUtilise(obj.materielUtilise);
    if (obj.materiel_utilise && typeof obj.materiel_utilise === 'object') return normalizeMaterielUtilise(obj.materiel_utilise);
    if (obj.data && typeof obj.data === 'object') {
      const data = obj.data as Record<string, unknown>;
      if (data.materielUtilise && typeof data.materielUtilise === 'object') return normalizeMaterielUtilise(data.materielUtilise);
    }
  }

  return normalizeMaterielUtilise(payload);
}

export const materielUtiliseService = {
  async getAll(): Promise<MaterielUtilise[]> {
    try {
      const response = await apiClient.get<unknown>('/admin/materiels-utilises');
      return extractMaterielUtiliseArray(response.data);
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      throw new Error(axiosError.response?.data?.message || 'Erreur lors de la récupération des matériels utilisés');
    }
  },

  async create(data: CreateMaterielUtiliseData): Promise<MaterielUtilise> {
    try {
      const response = await apiClient.post<unknown>('/admin/materiels-utilises', data);
      return extractMaterielUtilise(response.data);
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      throw new Error(axiosError.response?.data?.message || 'Erreur lors de la création des matériels utilisés');
    }
  },
};
