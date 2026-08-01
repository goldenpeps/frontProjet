import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { getToken, removeToken } from './tokenService';

// Création de l'instance Axios avec configuration de base
const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Intercepteur de requête pour ajouter le token JWT
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Intercepteur de réponse pour gérer les erreurs d'authentification et de connexion
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token invalide ou expiré - déconnexion
      removeToken();
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }

    // Pas de réponse reçue: backend injoignable (réseau coupé, serveur arrêté) ou timeout
    if (!error.response) {
      const isTimeout = error.code === 'ECONNABORTED';

      console.error('[BACKEND_UNREACHABLE]', {
        timestamp: new Date().toISOString(),
        url: error.config?.url,
        method: error.config?.method,
        reason: isTimeout ? 'timeout' : 'network_error',
        message: error.message,
      });

      error.message = isTimeout
        ? 'Le serveur met trop de temps à répondre, réessayez plus tard.'
        : 'Le serveur est actuellement injoignable, vérifiez votre connexion ou réessayez plus tard.';
    }

    return Promise.reject(error);
  }
);

export default apiClient;
