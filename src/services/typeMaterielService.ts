import apiClient from './apiClient';
import { AxiosError } from 'axios';

export interface TypeMateriel {
  id: number;
  libelle: string;
  transportable: boolean;
}

export interface CreateTypeMaterielData {
  libelle: string;
  transportable: boolean;
}

export type UpdateTypeMaterielData = Partial<CreateTypeMaterielData>;

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

function normalizeTypeMateriel(item: unknown): TypeMateriel {
  const obj = (item ?? {}) as Record<string, unknown>;
  return {
    id: Number(obj.id ?? 0),
    libelle: typeof obj.libelle === 'string' ? obj.libelle : '',
    transportable: toBoolean(obj.transportable),
  };
}

function extractTypeMaterielArray(payload: unknown): TypeMateriel[] {
  if (Array.isArray(payload)) return payload.map(normalizeTypeMateriel);
  if (!payload || typeof payload !== 'object') return [];

  const obj = payload as Record<string, unknown>;
  const directKeys = ['typeMateriels', 'type_materiels', 'types_materiels', 'data', 'items'];

  for (const key of directKeys) {
    const value = obj[key];
    if (Array.isArray(value)) return value.map(normalizeTypeMateriel);
  }

  const data = obj.data;
  if (data && typeof data === 'object') {
    const nested = data as Record<string, unknown>;
    if (Array.isArray(nested.typeMateriels)) return nested.typeMateriels.map(normalizeTypeMateriel);
    if (Array.isArray(nested.type_materiels)) return nested.type_materiels.map(normalizeTypeMateriel);
    if (Array.isArray(nested.items)) return nested.items.map(normalizeTypeMateriel);
  }

  return [];
}

export const typeMaterielService = {
  async getAll(): Promise<TypeMateriel[]> {
    try {
      const response = await apiClient.get<unknown>('/admin/type-materriel');
      return extractTypeMaterielArray(response.data);
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      throw new Error(axiosError.response?.data?.message || 'Erreur lors de la récupération des types de matériel');
    }
  },

  async create(data: CreateTypeMaterielData): Promise<TypeMateriel> {
    try {
      const response = await apiClient.post<unknown>('/admin/type-materriel', data);
      return normalizeTypeMateriel((response.data as Record<string, unknown>).typeMateriel ?? response.data);
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      throw new Error(axiosError.response?.data?.message || 'Erreur lors de la création du type de matériel');
    }
  },

  async update(id: number, data: UpdateTypeMaterielData): Promise<TypeMateriel> {
    try {
      const response = await apiClient.put<unknown>(`/admin/type-materriel/${id}`, data);
      return normalizeTypeMateriel((response.data as Record<string, unknown>).typeMateriel ?? response.data);
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      throw new Error(axiosError.response?.data?.message || 'Erreur lors de la mise à jour du type de matériel');
    }
  },

  async remove(id: number): Promise<void> {
    try {
      await apiClient.delete(`/admin/type-materriel/${id}`);
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      throw new Error(axiosError.response?.data?.message || 'Erreur lors de la suppression du type de matériel');
    }
  },
};
