import apiClient from './apiClient';
import { AxiosError } from 'axios';

export interface Devis {
  id: number;
  date_creation: string;
  montant_total: number;
  status: string;
  client_id: number;
  intervention_id: number | null;
}

export interface CreateDevisData {
  date_creation: string;
  montant_total: number;
  status: string;
  client_id: number;
  intervention_id: number | null;
}

export type UpdateDevisData = Partial<CreateDevisData>;

interface ApiError {
  error: boolean;
  message: string;
}

function extractDevisArray(payload: unknown): Devis[] {
  if (Array.isArray(payload)) return payload as Devis[];
  if (!payload || typeof payload !== 'object') return [];

  const obj = payload as Record<string, unknown>;
  const directKeys = ['devis', 'data', 'items'];

  for (const key of directKeys) {
    const value = obj[key];
    if (Array.isArray(value)) return value as Devis[];
  }

  const data = obj.data;
  if (data && typeof data === 'object') {
    const nested = data as Record<string, unknown>;
    if (Array.isArray(nested.devis)) return nested.devis as Devis[];
    if (Array.isArray(nested.items)) return nested.items as Devis[];
  }

  return [];
}

function extractDevis(payload: unknown): Devis {
  if (payload && typeof payload === 'object') {
    const obj = payload as Record<string, unknown>;
    if (obj.devis && typeof obj.devis === 'object') return obj.devis as Devis;
    if (obj.data && typeof obj.data === 'object') {
      const data = obj.data as Record<string, unknown>;
      if (data.devis && typeof data.devis === 'object') return data.devis as Devis;
    }
  }

  return payload as Devis;
}

export const devisService = {
  async getAll(): Promise<Devis[]> {
    try {
      const response = await apiClient.get<unknown>('/admin/devis');
      return extractDevisArray(response.data);
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      throw new Error(axiosError.response?.data?.message || 'Erreur lors de la récupération des devis');
    }
  },

  async getById(id: number): Promise<Devis> {
    try {
      const response = await apiClient.get<unknown>(`/admin/devis/${id}`);
      return extractDevis(response.data);
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      throw new Error(axiosError.response?.data?.message || 'Erreur lors de la récupération du devis');
    }
  },

  async create(data: CreateDevisData): Promise<Devis> {
    try {
      const response = await apiClient.post<unknown>('/admin/devis', data);
      return extractDevis(response.data);
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      throw new Error(axiosError.response?.data?.message || 'Erreur lors de la création du devis');
    }
  },

  async update(id: number, data: UpdateDevisData): Promise<Devis> {
    try {
      const response = await apiClient.put<unknown>(`/admin/devis/${id}`, data);
      return extractDevis(response.data);
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      throw new Error(axiosError.response?.data?.message || 'Erreur lors de la mise à jour du devis');
    }
  },

  async cancel(id: number): Promise<void> {
    try {
      await apiClient.put(`/admin/devis/annuler/${id}`);
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      throw new Error(axiosError.response?.data?.message || 'Erreur lors de l\'annulation du devis');
    }
  },
};
