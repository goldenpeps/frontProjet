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

export function filterClients(clients: Client[], searchTerm: string): Client[] {
  const query = searchTerm.trim().toLowerCase();
  if (!query) return clients;

  return clients.filter((client) => {
    return (
      formatClientFullName(client).toLowerCase().includes(query)
      || (client.email || '').toLowerCase().includes(query)
      || (client.telephone || '').toLowerCase().includes(query)
      || String(client.id).includes(query)
    );
  });
}
