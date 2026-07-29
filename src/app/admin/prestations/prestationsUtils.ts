import { Prestation } from '@/services';

export interface PrestationsFormData {
  nom: string;
  description: string;
  prix_unitaire: string;
}

export const emptyPrestationForm: PrestationsFormData = {
  nom: '',
  description: '',
  prix_unitaire: '',
};

export function toFormData(prestation: Prestation): PrestationsFormData {
  return {
    nom: prestation.nom,
    description: prestation.description || '',
    prix_unitaire: String(prestation.prix_unitaire ?? ''),
  };
}

export function formatPrice(value: number | string | null | undefined): string {
  return `${Number(value ?? 0).toFixed(2)} €`;
}

export function filterPrestations(prestations: Prestation[], searchTerm: string): Prestation[] {
  const query = searchTerm.trim().toLowerCase();
  if (!query) return prestations;

  return prestations.filter((prestation) => {
    return (
      String(prestation.id).includes(query)
      || prestation.nom.toLowerCase().includes(query)
      || (prestation.description || '').toLowerCase().includes(query)
      || formatPrice(prestation.prix_unitaire).toLowerCase().includes(query)
    );
  });
}
