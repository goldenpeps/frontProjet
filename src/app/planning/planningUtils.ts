import { UserPlanningIntervention, toPlanningQueryDateTime } from '@/services/interventionService';

const JOURS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

export interface PlanningWeekDateItem {
  jour: string;
  date: string;
}

export function getWeekStart(weekOffset: number): Date {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  monday.setDate(monday.getDate() + weekOffset * 7);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

export function getWeekDates(weekOffset: number): PlanningWeekDateItem[] {
  const monday = getWeekStart(weekOffset);

  return JOURS.map((jour, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    return {
      jour,
      date: date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
    };
  });
}

export function getWeekRangeIso(weekOffset: number): { from: string; to: string } {
  const monday = getWeekStart(weekOffset);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  return { from: toPlanningQueryDateTime(monday), to: toPlanningQueryDateTime(sunday) };
}

export function parseInterventionDate(value: string | null): Date | null {
  if (!value) return null;
  const normalized = value.includes('T') ? value : value.replace(' ', 'T');
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

export function formatHour(value: string | null): string {
  const date = parseInterventionDate(value);
  if (!date) return '--:--';
  return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

export function formatClientLabel(intervention: UserPlanningIntervention): string {
  if (!intervention.client) return 'Non renseigné';
  const fullName = `${intervention.client.prenom} ${intervention.client.nom}`.trim();
  return fullName || `Client #${intervention.client.id}`;
}

export function formatTerrainLabel(intervention: UserPlanningIntervention): string {
  if (!intervention.terrain.length) return 'Non renseigné';
  return intervention.terrain
    .map((terrain) => {
      if (terrain.nom) return terrain.nom;
      return `Terrain #${terrain.id}`;
    })
    .join(', ');
}

export function formatMaterielLabel(intervention: UserPlanningIntervention): string {
  if (!intervention.materiels.length) return 'Non renseigné';

  return intervention.materiels
    .map((materiel) => {
      if (materiel.libelle) return materiel.libelle;
      return `Matériel #${materiel.id}`;
    })
    .join(', ');
}

export function sortInterventionsByStart(interventions: UserPlanningIntervention[]): UserPlanningIntervention[] {
  return [...interventions].sort((a, b) => {
    const startA = parseInterventionDate(a.planning.debut ?? a.date_prevue)?.getTime() ?? 0;
    const startB = parseInterventionDate(b.planning.debut ?? b.date_prevue)?.getTime() ?? 0;
    return startA - startB;
  });
}

export function buildWeekSubtitle(weekDates: PlanningWeekDateItem[]): string {
  if (weekDates.length === 0) return 'Semaine';
  return `Semaine du ${weekDates[0].date} au ${weekDates[weekDates.length - 1].date}`;
}

export function filterInterventionsByWeekDay(
  interventions: UserPlanningIntervention[],
  dayDate: string
): UserPlanningIntervention[] {
  const [day, month] = dayDate.split('/');

  return interventions.filter((intervention) => {
    const start = parseInterventionDate(intervention.planning.debut ?? intervention.date_prevue);
    if (!start) return false;

    const startDay = String(start.getDate()).padStart(2, '0');
    const startMonth = String(start.getMonth() + 1).padStart(2, '0');
    return startDay === day && startMonth === month;
  });
}
