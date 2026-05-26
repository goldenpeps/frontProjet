'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services';
import styles from './forgot-password.module.css';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);

    if (!email) {
      setError('Veuillez entrer votre adresse email');
      setIsLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Adresse email invalide');
      setIsLoading(false);
      return;
    }

    try {
      const response = await authService.forgotPassword(email);
      if (response.success) {
        setMessage('Un email de réinitialisation a été envoyé si cette adresse existe.');
      }
    } catch (err) {
      // On affiche toujours un message de succès pour éviter l'énumération d'emails
      setMessage('Un email de réinitialisation a été envoyé si cette adresse existe.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.formContainer}>
          <h1 className={styles.title}>Mot de passe oublié</h1>
          
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
              <label htmlFor="email" className={styles.label}>
                Votre adresse mail :
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={styles.input}
                autoComplete="email"
                disabled={isLoading}
              />
            </div>

            {error && (
              <div className={styles.error} role="alert">
                {error}
              </div>
            )}

            {message && (
              <div className={styles.success} role="status">
                {message}
              </div>
            )}

            <div className={styles.buttonGroup}>
              <button
                type="submit"
                className={styles.btnSubmit}
                disabled={isLoading}
              >
                {isLoading ? 'Envoi...' : 'Envoyer'}
              </button>

              <button
                type="button"
                className={styles.btnBack}
                onClick={() => router.push('/login')}
                disabled={isLoading}
              >
                Retour
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
