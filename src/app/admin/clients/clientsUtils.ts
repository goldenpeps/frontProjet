import { Client } from '@/services';

export interface ClientFormData {
  nom: string;
  prenom: string;
  telephone: string;
  email: string;
}

export const emptyClientForm: ClientFormData = {
  nom: '',
  prenom: '',
  telephone: '',
  email: '',
};

export function toClientFormData(client: Client): ClientFormData {
  return {
    nom: client.nom,
    prenom: client.prenom,
    telephone: client.telephone || '',
    email: client.email || '',
  };
}

export function formatClientFullName(client: Client): string {
  return `${client.prenom} ${client.nom}`;
}
