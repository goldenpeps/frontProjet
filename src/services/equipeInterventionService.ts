import apiClient from './apiClient';
import { AxiosError } from 'axios';

export interface EquipeIntervention {
  id: number;
  commentaire: string;
  utilisateur_ids: number[];
}

export interface CreateEquipeInterventionData {
  commentaire: string;
  utilisateur_ids: number[];
}

export interface UpdateEquipeInterventionData {
  commentaire?: string;
  utilisateur_ids?: number[];
}

interface ApiError {
  error: boolean;
  message: string;
}

const LIST_ENDPOINTS = [
  '/admin/equipe-intervention/search',
  '/admin/equipe-intervention',
];

const CREATE_ENDPOINTS = [
  '/admin/equipe-intervention',
];

const UPDATE_ENDPOINTS = [
  '/admin/equipe-intervention',
];

const DELETE_ENDPOINTS = [
  '/admin/equipe-intervention',
];

function getApiErrorMessage(error: unknown, fallback: string): string {
  const axiosError = error as AxiosError<ApiError>;
  return axiosError.response?.data?.message || fallback;
}

function normalizeEquipe(item: unknown): EquipeIntervention {
  const obj = (item ?? {}) as Record<string, unknown>;
  const usersRaw = obj.utilisateurs ?? obj.users ?? obj.user ?? obj.utilisateur_ids ?? [];

  const utilisateur_ids = Array.isArray(usersRaw)
    ? usersRaw
        .map((entry) => {
          if (typeof entry === 'number') return entry;
          if (typeof entry === 'string') return Number(entry);
          if (entry && typeof entry === 'object') {
            const userObj = entry as Record<string, unknown>;
            return Number(userObj.id ?? userObj.utilisateur_id ?? userObj.user_id ?? NaN);
          }
          return NaN;
        })
        .filter((id) => !Number.isNaN(id))
    : [];

  return {
    id: Number(obj.id ?? 0),
    commentaire: typeof obj.commentaire === 'string' ? obj.commentaire : '',
    utilisateur_ids,
  };
}

function extractEquipeArray(payload: unknown): EquipeIntervention[] {
  if (Array.isArray(payload)) return payload.map(normalizeEquipe);
  if (!payload || typeof payload !== 'object') return [];

  const obj = payload as Record<string, unknown>;
  const directKeys = ['equipes', 'equipesIntervention', 'equipe_interventions', 'items', 'data'];

  for (const key of directKeys) {
    const value = obj[key];
    if (Array.isArray(value)) return value.map(normalizeEquipe);
  }

  const data = obj.data;
  if (data && typeof data === 'object') {
    const nested = data as Record<string, unknown>;
    if (Array.isArray(nested.equipes)) return nested.equipes.map(normalizeEquipe);
    if (Array.isArray(nested.equipe_interventions)) return nested.equipe_interventions.map(normalizeEquipe);
    if (Array.isArray(nested.items)) return nested.items.map(normalizeEquipe);
  }

  return [];
}

function extractEquipe(payload: unknown): EquipeIntervention {
  if (payload && typeof payload === 'object') {
    const obj = payload as Record<string, unknown>;
    if (obj.equipeIntervention && typeof obj.equipeIntervention === 'object') return normalizeEquipe(obj.equipeIntervention);
    if (obj.equipe && typeof obj.equipe === 'object') return normalizeEquipe(obj.equipe);
    if (obj.equipe_intervention && typeof obj.equipe_intervention === 'object') return normalizeEquipe(obj.equipe_intervention);
    if (obj.data && typeof obj.data === 'object') {
      const data = obj.data as Record<string, unknown>;
      if (data.equipeIntervention && typeof data.equipeIntervention === 'object') return normalizeEquipe(data.equipeIntervention);
      if (data.equipe && typeof data.equipe === 'object') return normalizeEquipe(data.equipe);
      if (data.equipe_intervention && typeof data.equipe_intervention === 'object') return normalizeEquipe(data.equipe_intervention);
    }
  }

  return normalizeEquipe(payload);
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

export const equipeInterventionService = {
  async getAll(): Promise<EquipeIntervention[]> {
    try {
      return await getWithFallback(LIST_ENDPOINTS, extractEquipeArray);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Erreur lors de la récupération des équipes d\'intervention'));
    }
  },

  async create(data: CreateEquipeInterventionData): Promise<EquipeIntervention> {
    try {
      const payload = {
        commentaire: data.commentaire,
        utilisateurs: data.utilisateur_ids,
      };
      return await postWithFallback(CREATE_ENDPOINTS, payload, extractEquipe);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Erreur lors de la création de l\'équipe d\'intervention'));
    }
  },

  async update(id: number, data: UpdateEquipeInterventionData): Promise<EquipeIntervention> {
    try {
      const payload = {
        ...(data.commentaire == null ? {} : { commentaire: data.commentaire }),
        ...(data.utilisateur_ids == null ? {} : { utilisateurs: data.utilisateur_ids }),
      };
      return await putWithFallback(UPDATE_ENDPOINTS, id, payload, extractEquipe);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Erreur lors de la mise à jour de l\'équipe d\'intervention'));
    }
  },

  async remove(id: number): Promise<void> {
    try {
      await deleteWithFallback(DELETE_ENDPOINTS, id);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Erreur lors de la suppression de l\'équipe d\'intervention'));
    }
  },
};
