import apiClient from './apiClient';
import { AxiosError } from 'axios';

export interface Prestation {
  id: number;
  nom: string;
  description: string;
  prix_unitaire: number;
}

interface ApiPrestation {
  id?: number;
  nom?: string;
  description?: string;
  prix_unitaire?: number;
  prixUnitaire?: number;
}

export interface CreatePrestationData {
  nom: string;
  description: string;
  prix_unitaire: number;
}

export type UpdatePrestationData = Partial<CreatePrestationData>;

interface ApiError {
  error: boolean;
  message: string;
}

function normalizePrestation(item: ApiPrestation): Prestation {
  return {
    id: Number(item.id ?? 0),
    nom: item.nom ?? '',
    description: item.description ?? '',
    prix_unitaire: Number(item.prix_unitaire ?? item.prixUnitaire ?? 0),
  };
}

function toApiPayload(data: CreatePrestationData | UpdatePrestationData): Record<string, unknown> {
  const payload: Record<string, unknown> = {};

  if (typeof data.nom !== 'undefined') payload.nom = data.nom;
  if (typeof data.description !== 'undefined') payload.description = data.description;
  if (typeof data.prix_unitaire !== 'undefined') payload.prixUnitaire = data.prix_unitaire;

  return payload;
}

function extractPrestationArray(payload: unknown): Prestation[] {
  if (Array.isArray(payload)) return payload.map((item) => normalizePrestation(item as ApiPrestation));
  if (!payload || typeof payload !== 'object') return [];

  const obj = payload as Record<string, unknown>;
  const directKeys = ['type_prestations', 'prestations', 'data', 'items'];

  for (const key of directKeys) {
    const value = obj[key];
    if (Array.isArray(value)) return value.map((item) => normalizePrestation(item as ApiPrestation));
  }

  const data = obj.data;
  if (data && typeof data === 'object') {
    const nested = data as Record<string, unknown>;
    if (Array.isArray(nested.type_prestations)) {
      return nested.type_prestations.map((item) => normalizePrestation(item as ApiPrestation));
    }
    if (Array.isArray(nested.prestations)) {
      return nested.prestations.map((item) => normalizePrestation(item as ApiPrestation));
    }
    if (Array.isArray(nested.items)) return nested.items.map((item) => normalizePrestation(item as ApiPrestation));
  }

  return [];
}

function extractPrestation(payload: unknown): Prestation {
  if (payload && typeof payload === 'object') {
    const obj = payload as Record<string, unknown>;
    if (obj.type_prestation && typeof obj.type_prestation === 'object') {
      return normalizePrestation(obj.type_prestation as ApiPrestation);
    }
    if (obj.prestation && typeof obj.prestation === 'object') return normalizePrestation(obj.prestation as ApiPrestation);
    if (obj.data && typeof obj.data === 'object') {
      const data = obj.data as Record<string, unknown>;
      if (data.type_prestation && typeof data.type_prestation === 'object') {
        return normalizePrestation(data.type_prestation as ApiPrestation);
      }
      if (data.prestation && typeof data.prestation === 'object') return normalizePrestation(data.prestation as ApiPrestation);
    }

    return normalizePrestation(obj as ApiPrestation);
  }

  return normalizePrestation({});
}

export const prestationService = {
  async getAll(): Promise<Prestation[]> {
    try {
      const response = await apiClient.get<unknown>('/admin/type-prestations');
      return extractPrestationArray(response.data);
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      throw new Error(axiosError.response?.data?.message || 'Erreur lors de la récupération des prestations');
    }
  },

  async create(data: CreatePrestationData): Promise<Prestation> {
    try {
      const response = await apiClient.post<unknown>('/admin/type-prestations', toApiPayload(data));
      return extractPrestation(response.data);
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      throw new Error(axiosError.response?.data?.message || 'Erreur lors de la création de la prestation');
    }
  },

  async update(id: number, data: UpdatePrestationData): Promise<Prestation> {
    try {
      const response = await apiClient.put<unknown>(`/admin/type-prestations/${id}`, toApiPayload(data));
      return extractPrestation(response.data);
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      throw new Error(axiosError.response?.data?.message || 'Erreur lors de la mise à jour de la prestation');
    }
  },

  async remove(id: number): Promise<void> {
    try {
      await apiClient.delete(`/admin/type-prestations/${id}`);
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      throw new Error(axiosError.response?.data?.message || 'Erreur lors de la suppression de la prestation');
    }
  },
};
