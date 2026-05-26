import { Client } from '@/services';
import styles from '../admin.module.css';
import { formatClientFullName } from './clientsUtils';

interface ClientsDisplayProps {
  clients: Client[];
  onEdit: (client: Client) => void;
}

export function ClientsTable({ clients, onEdit }: ClientsDisplayProps) {
  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Nom</th>
            <th>Email</th>
            <th>Téléphone</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((client) => (
            <tr key={client.id}>
              <td>
                <span className={styles.userName}>{formatClientFullName(client)}</span>
              </td>
              <td>{client.email || '—'}</td>
              <td>{client.telephone || '—'}</td>
              <td>
                <div className={styles.actions}>
                  <button className={styles.btnEdit} onClick={() => onEdit(client)}>
                    Modifier
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ClientsCards({ clients, onEdit }: ClientsDisplayProps) {
  return (
    <div className={styles.cardList}>
      {clients.map((client) => (
        <div key={client.id} className={styles.userCard}>
          <div className={styles.userCardHeader}>
            <span className={styles.userName}>{formatClientFullName(client)}</span>
          </div>
          <p className={styles.userCardEmail}>{client.email || 'Aucun email'}</p>
          <p className={styles.userCardPhone}>{client.telephone || 'Aucun téléphone'}</p>
          <div className={styles.userCardActions}>
            <button className={styles.btnEdit} onClick={() => onEdit(client)}>
              Modifier
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
