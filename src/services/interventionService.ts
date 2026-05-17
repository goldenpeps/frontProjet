import apiClient from './apiClient';
import { AxiosError } from 'axios';

export interface Intervention {
  id: number;
  date_prevue: string;
  date_realisation: string | null;
  commentaire: string;
  materiel_utilise_id: number | null;
  equipe_intervention_id: number | null;
}

export interface PlanningSlot {
  debut: string | null;
  fin: string | null;
}

export interface PlanningClientSummary {
  id: number;
  nom: string;
  prenom: string;
}

export interface PlanningTerrainSummary {
  id: number;
  nom: string | null;
  superficie: number | null;
  adresse?: {
    nom?: string;
    cp?: string;
    adresse?: string;
  } | string[] | null;
}

export interface PlanningMaterielSummary {
  id: number;
  libelle: string | null;
}

export interface UserPlanningIntervention extends Intervention {
  planning: PlanningSlot;
  client: PlanningClientSummary | null;
  terrain: PlanningTerrainSummary[];
  materiels: PlanningMaterielSummary[];
}

export interface CreateInterventionData {
  date_prevue: string;
  date_realisation: string;
  commentaire: string;
  materiel_utilise_id: number | null;
  equipe_intervention_id: number | null;
}

export type UpdateInterventionData = Partial<CreateInterventionData>;

interface ApiError {
  error: boolean;
  message: string;
}

function toApiDateTime(value: string | null): string | null {
  if (!value) return null;

  const trimmed = value.trim();
  if (!trimmed) return null;

  // Converts HTML datetime-local (2026-04-02T09:00) to backend format (2026-04-02 09:00:00)
  if (trimmed.includes('T')) {
    const [datePart, timePartRaw] = trimmed.split('T');
    const timePart = (timePartRaw || '').slice(0, 8);
    if (!datePart || !timePart) return trimmed;

    const timeSegments = timePart.split(':');
    const hh = timeSegments[0] ?? '00';
    const mm = timeSegments[1] ?? '00';
    const ss = timeSegments[2] ?? '00';
    return `${datePart} ${hh}:${mm}:${ss}`;
  }

  return trimmed;
}

export function toPlanningQueryDateTime(value: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())} ${pad(value.getHours())}:${pad(value.getMinutes())}:${pad(value.getSeconds())}`;
}

function normalizeIntervention(item: unknown): Intervention {
  const obj = (item ?? {}) as Record<string, unknown>;

  return {
    id: Number(obj.id ?? 0),
    date_prevue: typeof obj.date_prevue === 'string'
      ? obj.date_prevue
      : typeof obj.datePrevue === 'string'
        ? obj.datePrevue
        : '',
    date_realisation: typeof obj.date_realisation === 'string'
      ? obj.date_realisation
      : typeof obj.dateRealisation === 'string'
        ? obj.dateRealisation
        : null,
    commentaire: typeof obj.commentaire === 'string' ? obj.commentaire : '',
    materiel_utilise_id:
      obj.materiel_utilise_id == null && obj.materielUtiliseId == null
        ? null
        : Number(obj.materiel_utilise_id ?? obj.materielUtiliseId),
    equipe_intervention_id:
      obj.equipe_intervention_id == null && obj.equipeInterventionId == null
        ? null
        : Number(obj.equipe_intervention_id ?? obj.equipeInterventionId),
  };
}

function extractInterventionArray(payload: unknown): Intervention[] {
  if (Array.isArray(payload)) return payload.map(normalizeIntervention);
  if (!payload || typeof payload !== 'object') return [];

  const obj = payload as Record<string, unknown>;
  const directKeys = ['interventions', 'intervention', 'data', 'items'];

  for (const key of directKeys) {
    const value = obj[key];
    if (Array.isArray(value)) return value.map(normalizeIntervention);
  }

  const data = obj.data;
  if (data && typeof data === 'object') {
    const nested = data as Record<string, unknown>;
    if (Array.isArray(nested.interventions)) return nested.interventions.map(normalizeIntervention);
    if (Array.isArray(nested.intervention)) return nested.intervention.map(normalizeIntervention);
    if (Array.isArray(nested.items)) return nested.items.map(normalizeIntervention);
  }

  return [];
}

function extractIntervention(payload: unknown): Intervention {
  if (payload && typeof payload === 'object') {
    const obj = payload as Record<string, unknown>;
    if (obj.intervention && typeof obj.intervention === 'object') return normalizeIntervention(obj.intervention);
    if (obj.data && typeof obj.data === 'object') {
      const data = obj.data as Record<string, unknown>;
      if (data.intervention && typeof data.intervention === 'object') return normalizeIntervention(data.intervention);
    }
  }

  return normalizeIntervention(payload);
}

function normalizeUserPlanningIntervention(item: unknown): UserPlanningIntervention {
  const base = normalizeIntervention(item);
  const obj = (item ?? {}) as Record<string, unknown>;
  const planningObj = (obj.planning ?? {}) as Record<string, unknown>;
  const commentaire = typeof obj.commentaire === 'string' ? obj.commentaire : '';

  console.log('Raw item terrain:', obj.terrain);

  const clientObj = obj.client && typeof obj.client === 'object'
    ? (obj.client as Record<string, unknown>)
    : null;

  const terrains = Array.isArray(obj.terrain)
    ? obj.terrain.map((entry) => {
      const terrainObj = (entry ?? {}) as Record<string, unknown>;
      const rawAdresse = terrainObj.adresse;
      let adresse: { rue?: string; cp?: string; adresse?: string } | string[] | null = null;
     
      if (rawAdresse) {
        if (typeof rawAdresse === 'object' && !Array.isArray(rawAdresse)) {
          // C'est un objet
          const adresseObj = rawAdresse as Record<string, unknown>;
          adresse = {
            cp: typeof adresseObj.codePostal === 'string' ? adresseObj.codePostal : undefined,
            rue: typeof adresseObj.rue === 'string' ? adresseObj.rue : undefined,
            adresse: typeof adresseObj.rue === 'string' ? adresseObj.rue : undefined,
          };
        } else if (Array.isArray(rawAdresse)) {
          // C'est un array
          adresse = rawAdresse;
        }
      }
    
      return {
        id: Number(terrainObj.id ?? 0),
        nom: typeof terrainObj.nom === 'string' ? terrainObj.nom : null,
        superficie:
          terrainObj.superficie == null
            ? null
            : Number.isNaN(Number(terrainObj.superficie))
              ? null
              : Number(terrainObj.superficie),
        adresse,
      };
    }).filter((terrain) => terrain.id > 0)
    : [];

  const materiels = Array.isArray(obj.materiels)
    ? obj.materiels.map((entry) => {
      const materielObj = (entry ?? {}) as Record<string, unknown>;
      return {
        id: Number(materielObj.id ?? 0),
        libelle: typeof materielObj.libelle === 'string' ? materielObj.libelle : null,
      };
    }).filter((materiel) => materiel.id > 0)
    : [];

  const clientIdFromComment = (() => {
    const match = commentaire.match(/\[CLIENT:(\d+)\]/);
    if (!match) return null;
    const id = Number(match[1]);
    return Number.isNaN(id) || id <= 0 ? null : id;
  })();

  const terrainIdFromComment = (() => {
    const match = commentaire.match(/\[TERRAIN:(\d+)\]/);
    if (!match) return null;
    const id = Number(match[1]);
    return Number.isNaN(id) || id <= 0 ? null : id;
  })();

  const normalizedClient = (() => {
    if (!clientObj) {
      if (clientIdFromComment == null) return null;
      return { id: clientIdFromComment, nom: '', prenom: '' };
    }

    const id = Number(clientObj.id ?? 0);
    const nom = typeof clientObj.nom === 'string' ? clientObj.nom : '';
    const prenom = typeof clientObj.prenom === 'string' ? clientObj.prenom : '';

    if (id <= 0 && !nom && !prenom) {
      if (clientIdFromComment == null) return null;
      return { id: clientIdFromComment, nom: '', prenom: '' };
    }

    return { id, nom, prenom };
  })();

  const normalizedTerrains = terrains.length > 0
    ? terrains
    : terrainIdFromComment == null
      ? []
      : [{ id: terrainIdFromComment, nom: `Terrain #${terrainIdFromComment}`, superficie: null }];

  return {
    ...base,
    planning: {
      debut: typeof planningObj.debut === 'string' ? planningObj.debut : null,
      fin: typeof planningObj.fin === 'string' ? planningObj.fin : null,
    },
    client: normalizedClient,
    terrain: normalizedTerrains,
    materiels,
  };
}

function extractUserPlanningArray(payload: unknown): UserPlanningIntervention[] {
  if (Array.isArray(payload)) return payload.map(normalizeUserPlanningIntervention);
  if (!payload || typeof payload !== 'object') return [];

  const obj = payload as Record<string, unknown>;
  if (Array.isArray(obj.items)) return obj.items.map(normalizeUserPlanningIntervention);

  return [];
}

export const interventionService = {
  async getAll(): Promise<Intervention[]> {
    try {
      const response = await apiClient.get<unknown>('/admin/interventions');
      return extractInterventionArray(response.data);
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      throw new Error(axiosError.response?.data?.message || 'Erreur lors de la récupération des interventions');
    }
  },

  async create(data: CreateInterventionData): Promise<Intervention> {
    try {
      const payload = {
        datePrevue: toApiDateTime(data.date_prevue),
        dateRealisation: toApiDateTime(data.date_realisation),
        commentaire: data.commentaire,
        materielUtiliseId: data.materiel_utilise_id,
        equipeInterventionId: data.equipe_intervention_id,
      };
      const response = await apiClient.post<unknown>('/admin/interventions', payload);
      return extractIntervention(response.data);
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      throw new Error(axiosError.response?.data?.message || 'Erreur lors de la création de l\'intervention');
    }
  },

  async update(id: number, data: UpdateInterventionData): Promise<Intervention> {
    try {
      const payload = {
        ...(data.date_prevue == null ? {} : { datePrevue: toApiDateTime(data.date_prevue) }),
        ...(data.date_realisation == null ? {} : { dateRealisation: toApiDateTime(data.date_realisation) }),
        ...(data.commentaire == null ? {} : { commentaire: data.commentaire }),
        ...(data.materiel_utilise_id == null ? {} : { materielUtiliseId: data.materiel_utilise_id }),
        ...(data.equipe_intervention_id == null ? {} : { equipeInterventionId: data.equipe_intervention_id }),
      };
      const response = await apiClient.put<unknown>(`/admin/intervention/${id}`, payload);
      return extractIntervention(response.data);
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      throw new Error(axiosError.response?.data?.message || 'Erreur lors de la mise à jour de l\'intervention');
    }
  },

  async remove(id: number): Promise<void> {
    try {
      await apiClient.delete(`/admin/intervention/${id}`);
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      throw new Error(axiosError.response?.data?.message || 'Erreur lors de la suppression de l\'intervention');
    }
  },

  async getMyPlanning(params?: { from?: string; to?: string }): Promise<UserPlanningIntervention[]> {
    try {
      const response = await apiClient.get<unknown>('/planning/me', {
        params: {
          ...(params?.from ? { from: params.from } : {}),
          ...(params?.to ? { to: params.to } : {}),
        },
      });

      return extractUserPlanningArray(response.data);
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      throw new Error(axiosError.response?.data?.message || 'Erreur lors de la récupération du planning utilisateur');
    }
  },
};
