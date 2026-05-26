'use client';

import { useEffect, ReactNode, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRoles?: string[];
}

/**
 * Composant de protection des routes
 * Redirige vers /login si l'utilisateur n'est pas authentifié
 */
export function ProtectedRoute({ children, requiredRoles = [] }: ProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuth();
  const hasRedirected = useRef(false);

  useEffect(() => {
    // Éviter les redirections multiples
    if (hasRedirected.current) return;
    
    if (!isLoading && !isAuthenticated) {
      hasRedirected.current = true;
      router.replace('/login');
    }
  }, [isLoading, isAuthenticated]);

  // Vérification des rôles si requis
  useEffect(() => {
    if (hasRedirected.current) return;
    
    if (!isLoading && isAuthenticated && requiredRoles.length > 0) {
      const hasRequiredRole = requiredRoles.some(role => 
        user?.roles?.includes(role)
      );
      
      if (!hasRequiredRole) {
        hasRedirected.current = true;
        router.replace('/dashboard');
      }
    }
  }, [isLoading, isAuthenticated, user?.roles]);

  // Affichage du loader pendant le chargement
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#1a1a1a',
        color: 'white',
      }}>
        <div className="loader">Chargement...</div>
      </div>
    );
  }

  // Ne rien afficher si non authentifié (redirection en cours)
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

export default ProtectedRoute;
