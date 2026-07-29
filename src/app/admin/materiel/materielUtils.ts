import { Materiel } from '@/services';

export interface MaterielFormData {
  disponible: boolean;
  type_materiel_id: string;
}

export const emptyMaterielForm: MaterielFormData = {
  disponible: true,
  type_materiel_id: '',
};

export function toNullableNumber(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  return Number.isNaN(parsed) ? null : parsed;
}

export function toMaterielFormData(materiel: Materiel): MaterielFormData {
  return {
    disponible: materiel.disponible,
    type_materiel_id: materiel.type_materiel_id == null ? '' : String(materiel.type_materiel_id),
  };
}

export function formatTransportable(value: boolean | null | undefined): string {
  if (value == null) return '—';
  return value ? 'Oui' : 'Non';
}

export function filterMateriel(materiels: Materiel[], searchTerm: string): Materiel[] {
  const query = searchTerm.trim().toLowerCase();
  if (!query) return materiels;

  return materiels.filter((materiel) => {
    return (
      String(materiel.id).includes(query)
      || (materiel.type_materiel_libelle || '').toLowerCase().includes(query)
      || (materiel.disponible ? 'disponible' : 'indisponible').includes(query)
      || formatTransportable(materiel.type_materiel_transportable).toLowerCase().includes(query)
    );
  });
}
