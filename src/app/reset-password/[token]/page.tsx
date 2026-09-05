'use client';

import { useState, FormEvent } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { authService } from '@/services';
import styles from '../reset-password.module.css';

export default function ResetPasswordPage() {
  const router = useRouter();
  const params = useParams();
  const token = params.token as string;

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    setIsLoading(true);

    try {
      const data = await authService.resetPassword(token, password, confirmPassword);

      if (data.success) {
        setMessage('Mot de passe réinitialisé avec succès ! Redirection...');
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else {
        setError(data.message || 'Une erreur est survenue');
      }
    } catch {
      setError('Erreur de connexion au serveur');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.formContainer}>
          <h1 className={styles.title}>Nouveau mot de passe</h1>
          
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
              <label htmlFor="password" className={styles.label}>
                Nouveau mot de passe :
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={styles.input}
                required
                disabled={isLoading}
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="confirmPassword" className={styles.label}>
                Confirmer le mot de passe :
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={styles.input}
                required
                disabled={isLoading}
              />
            </div>

            {error && <div className={styles.error}>{error}</div>}
            {message && <div className={styles.success}>{message}</div>}

            <div className={styles.buttonGroup}>
              <button
                type="submit"
                className={styles.btnSubmit}
                disabled={isLoading}
              >
                {isLoading ? 'Mise à jour...' : 'Réinitialiser'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}