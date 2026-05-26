import { AdminUser } from '@/services';

export const AVAILABLE_ROLES = ['ROLE_USER', 'ROLE_ADMIN'];

export interface UserFormData {
  email: string;
  nom: string;
  prenom: string;
  telephone: string;
  password: string;
  roles: string[];
}

export const emptyUserForm: UserFormData = {
  email: '',
  nom: '',
  prenom: '',
  telephone: '',
  password: '',
  roles: ['ROLE_USER'],
};

export function ensureBaseRole(roles: string[]): string[] {
  if (roles.includes('ROLE_USER')) {
    return roles;
  }

  return [...roles, 'ROLE_USER'];
}

export function toggleRole(currentRoles: string[], role: string): string[] {
  const hasRole = currentRoles.includes(role);
  const updatedRoles = hasRole ? currentRoles.filter((r) => r !== role) : [...currentRoles, role];

  return ensureBaseRole(updatedRoles);
}

export function toFormData(user: AdminUser): UserFormData {
  return {
    email: user.email,
    nom: user.nom,
    prenom: user.prenom,
    telephone: user.telephone,
    password: '',
    roles: [...user.roles],
  };
}
