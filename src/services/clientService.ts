import apiClient from './apiClient';
import { AxiosError } from 'axios';

export interface Client {
  id: number;
  nom: string;
  prenom: string;
  telephone: string;
  email: string;
}

export interface CreateClientData {
  nom: string;
  prenom: string;
  telephone: string;
  email: string;
}

export type UpdateClientData = Partial<CreateClientData>;

interface ApiError {
  error: boolean;
  message: string;
}

function extractClientArray(payload: unknown): Client[] {
  if (Array.isArray(payload)) return payload as Client[];
  if (!payload || typeof payload !== 'object') return [];

  const obj = payload as Record<string, unknown>;
  const directKeys = ['clients', 'client', 'data', 'items'];

  for (const key of directKeys) {
    const value = obj[key];
    if (Array.isArray(value)) return value as Client[];
  }

  const data = obj.data;
  if (data && typeof data === 'object') {
    const nested = data as Record<string, unknown>;
    if (Array.isArray(nested.clients)) return nested.clients as Client[];
    if (Array.isArray(nested.client)) return nested.client as Client[];
    if (Array.isArray(nested.items)) return nested.items as Client[];
  }

  return [];
}

function extractClient(payload: unknown): Client {
  if (payload && typeof payload === 'object') {
    const obj = payload as Record<string, unknown>;
    if (obj.client && typeof obj.client === 'object') return obj.client as Client;
    if (obj.data && typeof obj.data === 'object') {
      const data = obj.data as Record<string, unknown>;
      if (data.client && typeof data.client === 'object') return data.client as Client;
    }
  }

  return payload as Client;
}

export const clientService = {
  async getAll(): Promise<Client[]> {
    try {
      const response = await apiClient.get<unknown>('/admin/clients');
      return extractClientArray(response.data);
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      throw new Error(axiosError.response?.data?.message || 'Erreur lors de la récupération des clients');
    }
  },

  async getById(id: number): Promise<Client> {
    try {
      const response = await apiClient.get<unknown>(`/admin/client/${id}`);
      return extractClient(response.data);
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      throw new Error(axiosError.response?.data?.message || 'Erreur lors de la récupération du client');
    }
  },

  async create(data: CreateClientData): Promise<Client> {
    try {
      const response = await apiClient.post<unknown>('/admin/client', data);
      return extractClient(response.data);
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      throw new Error(axiosError.response?.data?.message || 'Erreur lors de la création du client');
    }
  },

  async update(id: number, data: UpdateClientData): Promise<Client> {
    try {
      const response = await apiClient.put<unknown>(`/admin/client/${id}`, data);
      return extractClient(response.data);
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      throw new Error(axiosError.response?.data?.message || 'Erreur lors de la mise à jour du client');
    }
  },
};
