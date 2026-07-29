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

export function filterUsers(users: AdminUser[], searchTerm: string): AdminUser[] {
  const query = searchTerm.trim().toLowerCase();
  if (!query) return users;

  return users.filter((user) => {
    return (
      String(user.id).includes(query)
      || `${user.prenom || ''} ${user.nom || ''}`.trim().toLowerCase().includes(query)
      || (user.email || '').toLowerCase().includes(query)
      || (user.telephone || '').toLowerCase().includes(query)
      || user.roles.some((role) => role.toLowerCase().includes(query))
      || (user.is_active ? 'actif' : 'inactif').includes(query)
    );
  });
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
