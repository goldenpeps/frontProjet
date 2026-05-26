export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateLoginForm(email: string, password: string): string {
  if (!email || !password) {
    return 'Veuillez remplir tous les champs';
  }

  if (!isValidEmail(email)) {
    return 'Adresse email invalide';
  }

  return '';
}
