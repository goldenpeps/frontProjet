import { TypeMateriel } from '@/services';

export interface TypeMaterielFormData {
  libelle: string;
  transportable: boolean;
}

export const emptyTypeMaterielForm: TypeMaterielFormData = {
  libelle: '',
  transportable: true,
};

export function filterTypeMateriels(typesMateriels: TypeMateriel[], searchTerm: string): TypeMateriel[] {
  const query = searchTerm.trim().toLowerCase();
  if (!query) return typesMateriels;

  return typesMateriels.filter((typeMateriel) => {
    return (
      (typeMateriel.libelle || '').toLowerCase().includes(query)
      || String(typeMateriel.id).includes(query)
      || (typeMateriel.transportable ? 'oui' : 'non').includes(query)
    );
  });
}

export function toTypeMaterielFormData(typeMateriel: TypeMateriel): TypeMaterielFormData {
  return {
    libelle: typeMateriel.libelle,
    transportable: typeMateriel.transportable,
  };
}
