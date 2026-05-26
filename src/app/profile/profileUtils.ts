export interface ProfileDisplayUser {
  prenom?: string;
  nom?: string;
  email?: string;
  roles?: string[];
}

export function getUserInitials(user: ProfileDisplayUser | null | undefined): string {
  const firstNameInitial = user?.prenom?.charAt(0) ?? '';
  const lastNameInitial = user?.nom?.charAt(0) ?? '';
  return `${firstNameInitial}${lastNameInitial}`;
}

export function formatRoleLabel(role: string): string {
  return role.replace('ROLE_', '');
}
