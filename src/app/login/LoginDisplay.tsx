import { FormEventHandler } from 'react';
import styles from './login.module.css';

interface LoginPageDisplayProps {
  email: string;
  password: string;
  error: string;
  isLoading: boolean;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: FormEventHandler<HTMLFormElement>;
  onForgotPassword: () => void;
}

export function LoginLoadingScreen() {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#2a2a2a',
        color: 'white',
      }}
    >
      <p>Chargement...</p>
    </div>
  );
}

export function LoginDisplay({
  email,
  password,
  error,
  isLoading,
  onEmailChange,
  onPasswordChange,
  onSubmit,
  onForgotPassword,
}: LoginPageDisplayProps) {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.formContainer}>
          <form onSubmit={onSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
              <label htmlFor="email" className={styles.label}>
                Votre adresse mail :
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(event) => onEmailChange(event.target.value)}
                className={styles.input}
                autoComplete="email"
                disabled={isLoading}
                aria-describedby={error ? 'error-message' : undefined}
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="password" className={styles.label}>
                Votre Mots de passe
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={(event) => onPasswordChange(event.target.value)}
                className={styles.input}
                autoComplete="current-password"
                disabled={isLoading}
              />
            </div>

            {error && (
              <div id="error-message" className={styles.error} role="alert">
                {error}
              </div>
            )}

            <div className={styles.buttonGroup}>
              <button type="submit" className={styles.btnLogin} disabled={isLoading}>
                {isLoading ? 'Connexion...' : 'Connection'}
              </button>

              <button
                type="button"
                className={styles.btnForgot}
                onClick={onForgotPassword}
                disabled={isLoading}
              >
                Mot de passe
                <br />
                Oublié
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
