import { TerrainType } from '@/services';

export interface TypeTerrainFormData {
  nom: string;
  description: string;
}

export const emptyTypeTerrainForm: TypeTerrainFormData = {
  nom: '',
  description: '',
};

export function filterTypesTerrains(typesTerrains: TerrainType[], searchTerm: string): TerrainType[] {
  const query = searchTerm.trim().toLowerCase();
  if (!query) return typesTerrains;

  return typesTerrains.filter((typeTerrain) => {
    return (
      typeTerrain.nom.toLowerCase().includes(query)
      || typeTerrain.description.toLowerCase().includes(query)
      || String(typeTerrain.id).includes(query)
    );
  });
}

export function toTypeTerrainFormData(typeTerrain: TerrainType): TypeTerrainFormData {
  return {
    nom: typeTerrain.nom,
    description: typeTerrain.description,
  };
}
