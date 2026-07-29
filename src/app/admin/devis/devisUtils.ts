import { Devis } from '@/services';

export interface DevisFormData {
  date_creation: string;
  montant_total: string;
  status: string;
  client_id: string;
  intervention_id: string;
}

export const emptyDevisForm: DevisFormData = {
  date_creation: '',
  montant_total: '',
  status: 'en_attente',
  client_id: '',
  intervention_id: '',
};

export const STATUS_OPTIONS = ['en_attente', 'valide', 'refuse', 'annule'];

export function toNullableNumber(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  return Number.isNaN(parsed) ? null : parsed;
}

export function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('fr-FR');
}

export function formatAmount(value: number | string | null | undefined): string {
  return `${Number(value ?? 0).toFixed(2)} €`;
}

export function filterDevis(devis: Devis[], searchTerm: string): Devis[] {
  const query = searchTerm.trim().toLowerCase();
  if (!query) return devis;

  return devis.filter((item) => {
    return (
      String(item.id).includes(query)
      || String(item.client_id ?? '').includes(query)
      || String(item.intervention_id ?? '').includes(query)
      || (item.status || '').toLowerCase().includes(query)
      || formatAmount(item.montant_total).toLowerCase().includes(query)
      || formatDate(item.date_creation).toLowerCase().includes(query)
    );
  });
}

export function toDevisFormData(item: Devis): DevisFormData {
  return {
    date_creation: item.date_creation || '',
    montant_total: String(item.montant_total ?? ''),
    status: item.status || 'en_attente',
    client_id: String(item.client_id ?? ''),
    intervention_id: item.intervention_id == null ? '' : String(item.intervention_id),
  };
}
