import { Client, EquipeIntervention, Intervention, Terrain } from '@/services';

export interface InterventionFormData {
  date_prevue: string;
  heure_prevue: string;
  date_realisation: string;
  commentaire: string;
  materiel_utilise_id: string;
  materiel_ids: string[];
  equipe_intervention_id: string;
  client_id: string;
  terrain_id: string;
  type_prestation_id: string; // Changé en string pour le formulaire
  type_intervention: 'tonte' | 'ramassage' | 'autre';
}

export const emptyInterventionForm: InterventionFormData = {
  date_prevue: '',
  heure_prevue: '',
  date_realisation: '',
  commentaire: '',
  materiel_utilise_id: '',
  materiel_ids: [],
  equipe_intervention_id: '',
  client_id: '',
  terrain_id: '',
   type_prestation_id: '', // Initialisé à vide
  type_intervention: 'autre',
};

const META_REGEX = /\[TYPE:([a-z_]+)\]\[CLIENT:(\d+)\]\[TERRAIN:(\d+)\](?:\[HEURE:([0-2]\d:[0-5]\d)\])?/i;

export const MIN_DAYS_BETWEEN_MOWING = 21;

export interface GpsCoordinates {
  latitude: number;
  longitude: number;
}

export interface WeatherErrorContext {
  message: string;
  terrainId: number;
  clientId: number;
  date: string;
  gps: GpsCoordinates | null;
}

export function logWeatherError(context: WeatherErrorContext): void {
  console.error('[WEATHER_API_ERROR]', {
    timestamp: new Date().toISOString(),
    ...context,
  });
}

export interface PlanningMeta {
  type: 'tonte' | 'ramassage' | 'autre';
  clientId: number;
  terrainId: number;
  heurePrevue: string | null;
}

export function toDateTimeLocalInput(value: string | null): string {
  if (!value) return '';
  const normalized = value.replace(' ', 'T');
  if (normalized.length >= 16) return normalized.slice(0, 16);
  return normalized;
}

export function extractDatePart(value: string): string {
  if (!value) return '';
  return value.slice(0, 10);
}

export function extractTimePart(value: string): string {
  if (!value) return '';
  const normalized = value.replace(' ', 'T');
  const time = normalized.split('T')[1] ?? '';
  return time.slice(0, 5);
}

export function toNullableNumber(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  return Number.isNaN(parsed) ? null : parsed;
}

export function formatClientLabel(client: Client): string {
  const fullName = `${client.prenom || ''} ${client.nom || ''}`.trim();
  return fullName || `Client #${client.id}`;
}

export function formatEquipeLabel(equipe: EquipeIntervention): string {
  const comment = (equipe.commentaire || '').trim();
  return comment ? `#${equipe.id} - ${comment.slice(0, 40)}` : `Equipe #${equipe.id}`;
}

export function formatTerrainLabel(terrain: Terrain, client?: Client): string {
  const adresseObj = (terrain.adresse ?? {}) as Record<string, unknown>;
  const terrainName =
    typeof adresseObj.nom === 'string' && adresseObj.nom.trim()
      ? adresseObj.nom.trim()
      : `Terrain #${terrain.id}`;
  const clientName = client ? formatClientLabel(client) : `Client #${terrain.client_id}`;
  return `${terrainName} - ${clientName}`;
}

export function formatDate(value: string | null): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('fr-FR');
}

export function formatHourFromDateTime(value: string | null): string {
  if (!value) return '';
  const normalized = value.replace(' ', 'T');
  const date = new Date(normalized);
  if (!Number.isNaN(date.getTime())) {
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }

  const timePart = normalized.split('T')[1] ?? '';
  return timePart.slice(0, 5);
}

export function parsePlanningMeta(comment: string): PlanningMeta | null {
  const match = comment.match(META_REGEX);
  if (!match) return null;

  const clientId = Number(match[2]);
  const terrainId = Number(match[3]);
  if (Number.isNaN(clientId) || Number.isNaN(terrainId)) return null;

  return {
    type:
      match[1]?.toLowerCase() === 'tonte'
        ? 'tonte'
        : match[1]?.toLowerCase() === 'ramassage'
          ? 'ramassage'
          : 'autre',
    clientId,
    terrainId,
    heurePrevue: match[4] ?? null,
  };
}

export function stripPlanningMeta(comment: string): string {
  return comment.replace(META_REGEX, '').trim();
}

export function buildCommentWithMeta(
  comment: string,
  type: 'tonte' | 'ramassage' | 'autre',
  clientId: number,
  terrainId: number,
  heurePrevue: string
): string {
  const cleanComment = stripPlanningMeta(comment);
  const hourToken = heurePrevue ? `[HEURE:${heurePrevue}]` : '';
  const meta = `[TYPE:${type}][CLIENT:${clientId}][TERRAIN:${terrainId}]${hourToken}`;
  return cleanComment ? `${meta} ${cleanComment}` : meta;
}

export function extractGpsCoordinates(value: unknown): GpsCoordinates | null {
  if (value == null) return null;

  if (Array.isArray(value) && value.length >= 2) {
    const lat = Number(value[0]);
    const lon = Number(value[1]);
    if (!Number.isNaN(lat) && !Number.isNaN(lon)) {
      return { latitude: lat, longitude: lon };
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
      const parsed = JSON.parse(raw);
      return extractGpsCoordinates(parsed);
    } catch {
      return null;
    }
  }

  if (typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    const lat = Number(obj.latitude ?? obj.lat);
    const lon = Number(obj.longitude ?? obj.lng ?? obj.lon);
    if (!Number.isNaN(lat) && !Number.isNaN(lon)) {
      return { latitude: lat, longitude: lon };
    }
  }

  return null;
}

export function extractLastMowingDate(
  interventions: Intervention[],
  terrainId: number,
  selectedDate: string,
  currentInterventionId: number | null
): Date | null {
  const selected = new Date(selectedDate);
  if (Number.isNaN(selected.getTime())) return null;

  let latest: Date | null = null;

  for (const intervention of interventions) {
    if (currentInterventionId != null && intervention.id === currentInterventionId) {
      continue;
    }

    const meta = parsePlanningMeta(intervention.commentaire || '');
    if (!meta || meta.type !== 'tonte' || meta.terrainId !== terrainId) {
      continue;
    }

    const interventionDate = new Date(intervention.date_prevue);
    if (Number.isNaN(interventionDate.getTime()) || interventionDate >= selected) {
      continue;
    }

    if (!latest || interventionDate > latest) {
      latest = interventionDate;
    }
  }

  return latest;
}

export function daysBetween(older: Date, newer: Date): number {
  const diff = newer.getTime() - older.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export function filterInterventions(
  interventions: Intervention[],
  searchTerm: string,
  clientById: Map<number, Client>,
  terrains: Terrain[]
): Intervention[] {
  const query = searchTerm.trim().toLowerCase();
  if (!query) return interventions;

  const terrainById = new Map(terrains.map((terrain) => [terrain.id, terrain]));

  return interventions.filter((intervention) => {
    const meta = parsePlanningMeta(intervention.commentaire || '');
    const client = meta ? clientById.get(meta.clientId) : undefined;
    const terrain = meta ? terrainById.get(meta.terrainId) : undefined;

    return (
      String(intervention.id).includes(query)
      || (intervention.commentaire || '').toLowerCase().includes(query)
      || (client ? formatClientLabel(client).toLowerCase().includes(query) : false)
      || (terrain ? formatTerrainLabel(terrain, client).toLowerCase().includes(query) : false)
      || (meta?.type ?? '').toLowerCase().includes(query)
      || formatDate(intervention.date_prevue).toLowerCase().includes(query)
    );
  });
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function getWeatherEmoji(code: number): string {
  if ([0, 1].includes(code)) return '☀️';
  if ([2, 3, 45, 48].includes(code)) return '⛅';
  if ([95, 96, 99].includes(code)) return '⛈️';
  if ([71, 73, 75, 77, 85, 86].includes(code)) return '❄️';
  return '🌧️';
}

function buildWeatherImageUrl(emoji: string): string {
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="720" height="220" viewBox="0 0 720 220">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#1d4ed8"/>
    </linearGradient>
  </defs>
  <rect width="720" height="220" fill="url(#g)" rx="16"/>
  <circle cx="620" cy="40" r="100" fill="rgba(255,255,255,0.12)"/>
  <text x="36" y="138" font-family="Segoe UI, Arial, sans-serif" font-size="68" fill="#fff">${emoji}</text>
  <text x="126" y="120" font-family="Segoe UI, Arial, sans-serif" font-size="36" fill="#fff">Alerte intervention</text>
  <text x="126" y="156" font-family="Segoe UI, Arial, sans-serif" font-size="20" fill="#c7d2fe">Verification meteo avant validation</text>
</svg>`;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export function getTerrainNameAndAddress(terrain: Terrain): { name: string; address: string } {
  const adresseObj = (terrain.adresse ?? {}) as Record<string, unknown>;
  const name =
    typeof adresseObj.nom === 'string' && adresseObj.nom.trim()
      ? adresseObj.nom.trim()
      : `Terrain #${terrain.id}`;
  const street =
    typeof adresseObj.adresse === 'string' && adresseObj.adresse.trim()
      ? adresseObj.adresse.trim()
      : '';
  const cp = typeof adresseObj.cp === 'string' && adresseObj.cp.trim() ? adresseObj.cp.trim() : '';
  const address = [street, cp].filter(Boolean).join(' - ') || 'Adresse non renseignee';

  return { name, address };
}

function formatGps(gps: GpsCoordinates): string {
  return `${gps.latitude.toFixed(6)}, ${gps.longitude.toFixed(6)}`;
}

export interface AlertifyConfirmationOptions {
  title: string;
  weatherDescription: string;
  dateLabel: string;
  terrainName: string;
  terrainAddress: string;
  gps: GpsCoordinates;
  emoji: string;
  okLabel: string;
}

export function showAlertifyConfirmation(options: AlertifyConfirmationOptions): Promise<boolean> {
  const imageSrc = buildWeatherImageUrl(options.emoji);
  const messageHtml = `
    <div style="text-align:left;line-height:1.45;max-width:560px;">
      <img src="${imageSrc}" alt="Apercu meteo" style="width:100%;height:140px;object-fit:cover;border-radius:10px;margin-bottom:12px;display:block;" />
      <p style="margin:0 0 8px;"><strong>${options.emoji} Meteo</strong> ${escapeHtml(options.weatherDescription)}</p>
      <p style="margin:0 0 6px;"><strong>📅 Date</strong> ${escapeHtml(options.dateLabel)}</p>
      <p style="margin:0 0 6px;"><strong>📍 Lieu</strong> ${escapeHtml(options.terrainName)}</p>
      <p style="margin:0 0 6px;"><strong>🏠 Adresse</strong> ${escapeHtml(options.terrainAddress)}</p>
      <p style="margin:0 0 10px;"><strong>🧭 Coordonnees</strong> ${escapeHtml(formatGps(options.gps))}</p>
      <p style="margin:0;color:#b91c1c;"><strong>Confirmer la creation de l'intervention ?</strong></p>
    </div>
  `;

  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(false);
      return;
    }

    void import('alertifyjs')
      .then((module) => {
        const alertify = module.default;
        const dialog = alertify.confirm(
          options.title,
          messageHtml,
          () => resolve(true),
          () => resolve(false)
        );

        dialog.set('labels', { ok: options.okLabel, cancel: 'Annuler' });
        dialog.set('defaultFocus', 'cancel');
        dialog.set('closable', false);
        dialog.set('movable', false);
        dialog.set('padding', true);
      })
      .catch(() => {
        resolve(window.confirm('Confirmation requise pour continuer.'));
      });
  });
}
