import { Client, Intervention, Terrain, TerrainType } from '@/services';

export interface TerrainFormData {
  superficie: string;
  commentaire: string;
  client_id: string;
  type_terrain_id: string;
  intervention_id: string;
  adresse: {
    nom: string;
    cp: string;
    adresse: string;
  };
  coordonnees_gps: string;
}

export interface GpsCoordinates {
  latitude: number;
  longitude: number;
}

export const emptyTerrainForm: TerrainFormData = {
  superficie: '',
  commentaire: '',
  client_id: '',
  type_terrain_id: '',
  intervention_id: '',
  adresse: {
    nom: '',
    cp: '',
    adresse: '',
  },
  coordonnees_gps: '',
};

export function parseGpsInput(value: string): unknown {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const csvMatch = trimmed.match(/^\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*$/);
  if (csvMatch) {
    return {
      latitude: Number(csvMatch[1]),
      longitude: Number(csvMatch[2]),
    };
  }

  try {
    return JSON.parse(trimmed);
  } catch {
    return trimmed;
  }
}

export function gpsToString(value: unknown): string {
  if (value == null) return '';
  if (typeof value === 'string') return value;

  try {
    return JSON.stringify(value);
  } catch {
    return '';
  }
}

export function extractGpsCoordinates(value: unknown): GpsCoordinates | null {
  if (value == null) return null;

  if (Array.isArray(value) && value.length >= 2) {
    const latitude = Number(value[0]);
    const longitude = Number(value[1]);
    if (!Number.isNaN(latitude) && !Number.isNaN(longitude)) {
      return { latitude, longitude };
    }
  }

  if (typeof value === 'string') {
    const raw = value.trim();
    if (!raw) return null;

    const csvMatch = raw.match(/^\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*$/);
    if (csvMatch) {
      return {
        latitude: Number(csvMatch[1]),
        longitude: Number(csvMatch[2]),
      };
    }

    try {
      return extractGpsCoordinates(JSON.parse(raw));
    } catch {
      return null;
    }
  }

  if (typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    const latRaw = obj.latitude ?? obj.lat;
    const lonRaw = obj.longitude ?? obj.lng ?? obj.lon;

    const latitude = Number(latRaw);
    const longitude = Number(lonRaw);
    if (!Number.isNaN(latitude) && !Number.isNaN(longitude)) {
      return { latitude, longitude };
    }
  }

  return null;
}

export function formatClientLabel(client: Client): string {
  const fullName = `${client.prenom || ''} ${client.nom || ''}`.trim();
  return fullName || `Client #${client.id}`;
}

export function formatInterventionLabel(intervention: Intervention): string {
  const datePreview = intervention.date_prevue ? intervention.date_prevue.slice(0, 10) : 'sans date';
  const comment = intervention.commentaire?.trim();

  if (comment) {
    return `#${intervention.id} - ${comment.slice(0, 40)} (${datePreview})`;
  }

  return `Intervention #${intervention.id} (${datePreview})`;
}

export function formatTerrainTypeLabel(typeTerrain: TerrainType): string {
  if (typeTerrain.description) {
    return `${typeTerrain.nom} - ${typeTerrain.description}`;
  }

  return typeTerrain.nom;
}

export function toNullableNumber(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  return Number.isNaN(parsed) ? null : parsed;
}

export function filterTerrains(
  terrains: Terrain[],
  searchTerm: string,
  clientById: Map<number, Client>,
  terrainTypeById: Map<number, TerrainType>
): Terrain[] {
  const query = searchTerm.trim().toLowerCase();
  if (!query) return terrains;

  return terrains.filter((terrain) => {
    const client = terrain.client_id == null ? undefined : clientById.get(terrain.client_id);
    const terrainType = terrain.type_terrain_id == null ? undefined : terrainTypeById.get(terrain.type_terrain_id);

    return (
      String(terrain.id).includes(query)
      || formatAdresseDisplay(terrain.adresse).toLowerCase().includes(query)
      || (terrain.commentaire || '').toLowerCase().includes(query)
      || (client ? formatClientLabel(client).toLowerCase().includes(query) : false)
      || (terrainType ? formatTerrainTypeLabel(terrainType).toLowerCase().includes(query) : false)
    );
  });
}

export function formatAdresseDisplay(adresse: unknown): string {
  if (!adresse) return '—';
  if (typeof adresse === 'object') {
    const obj = adresse as Record<string, unknown>;
    const nom = obj.nom ? `${obj.nom}` : '';
    const cp = obj.cp ? `${obj.cp}` : '';
    const rue = obj.adresse ? `${obj.adresse}` : '';
    const parts = [nom, cp, rue].filter(Boolean);
    return parts.length ? parts.join(', ') : '—';
  }
  return String(adresse);
}
