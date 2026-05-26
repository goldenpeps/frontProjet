import { AdminUser, EquipeIntervention } from '@/services';

export interface EquipeFormData {
  commentaire: string;
  utilisateur_ids: number[];
}

export const emptyEquipeForm: EquipeFormData = {
  commentaire: '',
  utilisateur_ids: [],
};

export function formatUserLabel(user: AdminUser): string {
  const fullName = `${user.prenom || ''} ${user.nom || ''}`.trim();
  return fullName || `Utilisateur #${user.id}`;
}

export function toEquipeFormData(equipe: EquipeIntervention): EquipeFormData {
  return {
    commentaire: equipe.commentaire || '',
    utilisateur_ids: equipe.utilisateur_ids,
  };
}

export function toggleUserSelection(current: number[], userId: number): number[] {
  const hasUser = current.includes(userId);
  return hasUser ? current.filter((id) => id !== userId) : [...current, userId];
}
