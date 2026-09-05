import apiClient from './apiClient';
import { setToken, setUser, removeToken, AuthResponse, User } from './tokenService';
import { AxiosError } from 'axios';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  nom: string;
  prenom: string;
  telephone: string;
}

export interface ApiError {
  error: boolean;
  message: string;
}

/**
 * Service d'authentification
 */
export const authService = {
  /**
   * Connexion utilisateur
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/login', credentials);
      
      if (response.data.success && response.data.token && response.data.user) {
        // Stockage sécurisé du token et des infos utilisateur
        setToken(response.data.token);
        setUser(response.data.user);
      }
      
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      throw new Error(
        axiosError.response?.data?.message || 'Erreur lors de la connexion'
      );
    }
  },

  /**
   * Inscription utilisateur
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/register', data);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      throw new Error(
        axiosError.response?.data?.message || 'Erreur lors de l\'inscription'
      );
    }
  },

  /**
   * Récupération des informations de l'utilisateur connecté
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await apiClient.get<{ success: boolean; user: User }>('/me');
      if (response.data.success) {
        setUser(response.data.user);
        return response.data.user;
      }
      return null;
    } catch {
      return null;
    }
  },

  /**
   * Déconnexion
   */
  logout(): void {
    removeToken();
  },

  /**
   * Demande de réinitialisation de mot de passe
   */
  async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.post('/forgot-password', { email });
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      throw new Error(
        axiosError.response?.data?.message || 'Erreur lors de la demande'
      );
    }
  },
  async resetPassword(token: string, password: string, confirm: string) {

    const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/reset-password`;

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password, confirmPassword: confirm }),
    });
    return response.json();
}
};

export default authService;
