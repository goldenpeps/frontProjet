'use client';

import { LoginDisplay, LoginLoadingScreen } from './LoginDisplay';
import { useLoginForm } from './useLoginForm';

export default function LoginPage() {
  const {
    email,
    setEmail,
    password,
    setPassword,
    error,
    isLoading,
    checkingAuth,
    handleSubmit,
    handleForgotPassword,
  } = useLoginForm();

  if (checkingAuth) {
    return <LoginLoadingScreen />;
  }

  return (
    <LoginDisplay
      email={email}
      password={password}
      error={error}
      isLoading={isLoading}
      onEmailChange={setEmail}
      onPasswordChange={setPassword}
      onSubmit={handleSubmit}
      onForgotPassword={handleForgotPassword}
    />
  );
}
