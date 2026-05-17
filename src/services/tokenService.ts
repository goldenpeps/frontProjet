/**
 * Service de gestion sécurisée des tokens JWT
 * Utilise localStorage avec des mesures de sécurité
 */

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';
const TOKEN_EXPIRY_KEY = 'auth_token_expiry';

export interface User {
  id: number;
  email: string;
  nom: string;
  prenom: string;
  roles: string[];
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: User;
}

/**
 * Stocke le token de manière sécurisée
 */
export const setToken = (token: string): void => {
  if (typeof window === 'undefined') return;
  
  try {
    // Décode le payload du JWT pour obtenir l'expiration
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expiry = payload.exp ? payload.exp * 1000 : Date.now() + 24 * 60 * 60 * 1000; // 24h par défaut
    
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(TOKEN_EXPIRY_KEY, expiry.toString());
  } catch (error) {
    console.error('Erreur lors du stockage du token:', error);
  }
};

/**
 * Récupère le token s'il est valide
 */
export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
    
    if (!token || !expiry) return null;
    
    // Vérifie si le token n'est pas expiré
    if (Date.now() > parseInt(expiry)) {
      removeToken();
      return null;
    }
    
    return token;
  } catch (error) {
    console.error('Erreur lors de la récupération du token:', error);
    return null;
  }
};

/**
 * Supprime le token et les données utilisateur
 */
export const removeToken = (): void => {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(TOKEN_EXPIRY_KEY);
};

/**
 * Stocke les informations utilisateur
 */
export const setUser = (user: User): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch (error) {
    console.error('Erreur lors du stockage de l\'utilisateur:', error);
  }
};

/**
 * Récupère les informations utilisateur
 */
export const getUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    const userStr = localStorage.getItem(USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', error);
    return null;
  }
};

/**
 * Vérifie si l'utilisateur est authentifié
 */
export const isAuthenticated = (): boolean => {
  return getToken() !== null;
};

/**
 * Vérifie si l'utilisateur a un rôle spécifique
 */
export const hasRole = (role: string): boolean => {
  const user = getUser();
  return user?.roles?.includes(role) ?? false;
};

/**
 * Déconnexion complète
 */
export const logout = (): void => {
  removeToken();
  // Redirection vers la page de connexion
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
};
