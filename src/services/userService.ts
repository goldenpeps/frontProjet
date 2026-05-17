import apiClient from './apiClient';
import { AxiosError } from 'axios';

export interface AdminUser {
  id: number;
  email: string;
  nom: string;
  prenom: string;
  telephone: string;
  roles: string[];
  is_active: boolean;
  equipe_intervention_id: number | null;
}

export interface CreateUserData {
  email: string;
  nom: string;
  prenom: string;
  telephone: string;
  password: string;
  roles: string[];
}

export interface UpdateUserData {
  email?: string;
  nom?: string;
  prenom?: string;
  telephone?: string;
  password?: string;
  roles?: string[];
  equipe_intervention_id?: number | null;
}

interface ApiError {
  error: boolean;
  message: string;
}

interface RegisterResponse {
  success?: boolean;
  message?: string;
  user?: Partial<AdminUser>;
}

export const userService = {
  async getAll(): Promise<AdminUser[]> {
    try {
      const response = await apiClient.get<
        | AdminUser[]
        | {
            success?: boolean;
            users?: AdminUser[];
            user?: AdminUser[];
            data?: {
              users?: AdminUser[];
              user?: AdminUser[];
            };
          }
      >('/admin/utilisateurs');

      const payload = response.data;


      const users = Array.isArray(payload)
        ? payload
        : payload.users ?? payload.user ?? payload.data?.users ?? payload.data?.user;
  
      return Array.isArray(users) ? users : [];
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      throw new Error(axiosError.response?.data?.message || 'Erreur lors de la récupération des utilisateurs');
    }
  },

  async getById(id: number): Promise<AdminUser> {
    try {
      const response = await apiClient.get<{ success: boolean; user: AdminUser }>(`/admin/utilisateurs/${id}`);
      return response.data.user;
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      throw new Error(axiosError.response?.data?.message || 'Erreur lors de la récupération de l\'utilisateur');
    }
  },

  async create(data: CreateUserData): Promise<AdminUser> {
    try {
      // Le backend expose la creation utilisateur via /register.
      const registerPayload = {
        email: data.email,
        nom: data.nom,
        prenom: data.prenom,
        telephone: data.telephone,
        password: data.password,
      };

      const response = await apiClient.post<RegisterResponse>('/register', registerPayload);
      const createdUser = response.data.user;

      return {
        id: Number(createdUser?.id ?? 0),
        email: typeof createdUser?.email === 'string' ? createdUser.email : data.email,
        nom: typeof createdUser?.nom === 'string' ? createdUser.nom : data.nom,
        prenom: typeof createdUser?.prenom === 'string' ? createdUser.prenom : data.prenom,
        telephone: typeof createdUser?.telephone === 'string' ? createdUser.telephone : data.telephone,
        roles: Array.isArray(createdUser?.roles) ? createdUser.roles : data.roles,
        is_active: typeof createdUser?.is_active === 'boolean' ? createdUser.is_active : true,
        equipe_intervention_id:
          typeof createdUser?.equipe_intervention_id === 'number' ? createdUser.equipe_intervention_id : null,
      };
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      throw new Error(axiosError.response?.data?.message || 'Erreur lors de la création de l\'utilisateur');
    }
  },

  async update(id: number, data: UpdateUserData): Promise<AdminUser> {
    try {
      const response = await apiClient.put<{ success: boolean; user: AdminUser }>(`/admin/utilisateurs/${id}`, data);
      return response.data.user;
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      throw new Error(axiosError.response?.data?.message || 'Erreur lors de la mise à jour de l\'utilisateur');
    }
  },

  async deactivate(id: number): Promise<void> {
    try {
      await apiClient.patch(`/admin/utilisateurs/${id}/deactivate`);
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      throw new Error(axiosError.response?.data?.message || 'Erreur lors de la désactivation de l\'utilisateur');
    }
  },

  async activate(id: number): Promise<void> {
    try {
      await apiClient.patch(`/admin/utilisateurs/${id}/activate`);
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      throw new Error(axiosError.response?.data?.message || 'Erreur lors de l\'activation de l\'utilisateur');
    }
  },
};
