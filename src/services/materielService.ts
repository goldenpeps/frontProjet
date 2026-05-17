import apiClient from './apiClient';
import { AxiosError } from 'axios';

export interface Materiel {
  id: number;
  disponible: boolean;
  type_materiel_id: number | null;
  type_materiel_libelle: string;
  type_materiel_transportable: boolean | null;
}

export interface CreateMaterielData {
  disponible: boolean;
  type_materiel_id: number;
}

export type UpdateMaterielData = Partial<CreateMaterielData>;

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

function normalizeMateriel(item: unknown): Materiel {
  const obj = (item ?? {}) as Record<string, unknown>;
  const typeMaterielRaw = (obj.typeMateriel ?? obj.type_materiel ?? null) as Record<string, unknown> | null;
  const typeMaterielIdRaw = obj.type_materiel_id ?? obj.typeMaterielId ?? typeMaterielRaw?.id ?? null;

  const transportableRaw = typeMaterielRaw?.transportable;
  const transportable =
    transportableRaw == null
      ? null
      : transportableRaw === true
        ? true
        : transportableRaw === false
          ? false
          : toBoolean(transportableRaw);

  return {
    id: Number(obj.id ?? 0),
    disponible: toBoolean(obj.disponible),
    type_materiel_id: typeMaterielIdRaw == null ? null : Number(typeMaterielIdRaw),
    type_materiel_libelle: typeof typeMaterielRaw?.libelle === 'string' ? typeMaterielRaw.libelle : '',
    type_materiel_transportable: transportable,
  };
}

function extractMaterielArray(payload: unknown): Materiel[] {
  const fromList = (value: unknown): Materiel[] => {
    if (!Array.isArray(value)) return [];
    return value.map(normalizeMateriel);
  };

  if (Array.isArray(payload)) return fromList(payload);
  if (!payload || typeof payload !== 'object') return [];

  const obj = payload as Record<string, unknown>;
  const directKeys = ['materiel', 'materiels', 'data', 'items'];

  for (const key of directKeys) {
    const parsed = fromList(obj[key]);
    if (parsed.length > 0) return parsed;
  }

  const data = obj.data;
  if (data && typeof data === 'object') {
    const nested = data as Record<string, unknown>;
    const parsedMateriel = fromList(nested.materiel);
    if (parsedMateriel.length > 0) return parsedMateriel;

    const parsedMateriels = fromList(nested.materiels);
    if (parsedMateriels.length > 0) return parsedMateriels;
  }

  return [];
}

function extractMateriel(payload: unknown): Materiel {
  if (payload && typeof payload === 'object') {
    const obj = payload as Record<string, unknown>;
    if (obj.materiel && typeof obj.materiel === 'object') return normalizeMateriel(obj.materiel);
    if (obj.data && typeof obj.data === 'object') {
      const data = obj.data as Record<string, unknown>;
      if (data.materiel && typeof data.materiel === 'object') return normalizeMateriel(data.materiel);
    }
  }

  return normalizeMateriel(payload);
}

export const materielService = {
  async getAll(): Promise<Materiel[]> {
    try {
      const response = await apiClient.get<unknown>('/admin/materiel');
      return extractMaterielArray(response.data);
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      throw new Error(axiosError.response?.data?.message || 'Erreur lors de la récupération du matériel');
    }
  },

  async create(data: CreateMaterielData): Promise<Materiel> {
    try {
      const response = await apiClient.post<unknown>('/admin/materiel', {
        disponible: data.disponible ? 1 : 0,
        typeMaterielId: data.type_materiel_id,
      });
      return extractMateriel(response.data);
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      throw new Error(axiosError.response?.data?.message || 'Erreur lors de la création du matériel');
    }
  },

  async update(id: number, data: UpdateMaterielData): Promise<Materiel> {
    try {
      const payload = {
        ...(data.disponible == null ? {} : { disponible: data.disponible ? 1 : 0 }),
        ...(data.type_materiel_id == null ? {} : { typeMaterielId: data.type_materiel_id }),
      };

      const response = await apiClient.put<unknown>(`/admin/materiel/${id}`, payload);
      return extractMateriel(response.data);
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      throw new Error(axiosError.response?.data?.message || 'Erreur lors de la mise à jour du matériel');
    }
  },

  async remove(id: number): Promise<void> {
    try {
      await apiClient.delete(`/admin/materiel/${id}`);
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      throw new Error(axiosError.response?.data?.message || 'Erreur lors de la suppression du matériel');
    }
  },
};
