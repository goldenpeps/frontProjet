import { FormEvent, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService, isAuthenticated } from '@/services';
import { validateLoginForm } from './loginUtils';

interface UseLoginFormResult {
  email: string;
  setEmail: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  error: string;
  isLoading: boolean;
  checkingAuth: boolean;
  handleSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  handleForgotPassword: () => void;
}

export function useLoginForm(): UseLoginFormResult {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const hasRedirected = useRef(false);

  useEffect(() => {
    const checkAuth = () => {
      if (isAuthenticated() && !hasRedirected.current) {
        hasRedirected.current = true;
        router.replace('/dashboard');
        return;
      }

      setCheckingAuth(false);
    };

    checkAuth();
  }, [router]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    const validationError = validateLoginForm(email, password);
    if (validationError) {
      setError(validationError);
      setIsLoading(false);
      return;
    }

    try {
      const response = await authService.login({ email, password });

      if (response.success) {
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 100);
        return;
      }

      setError(response.message || 'Erreur de connexion');
      setIsLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de connexion');
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    router.push('/forgot-password');
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    error,
    isLoading,
    checkingAuth,
    handleSubmit,
    handleForgotPassword,
  };
}
