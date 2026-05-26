import { Devis } from '@/services';
import styles from '../admin.module.css';
import { formatAmount, formatDate } from './devisUtils';

interface DevisDisplayProps {
  devis: Devis[];
  onEdit: (item: Devis) => void;
  onCancelRequest: (item: Devis) => void;
}

export function DevisTable({ devis, onEdit, onCancelRequest }: DevisDisplayProps) {
  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Date</th>
            <th>Client ID</th>
            <th>Intervention ID</th>
            <th>Montant</th>
            <th>Statut</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {devis.map((item) => (
            <tr key={item.id} className={item.status === 'annule' ? styles.rowInactive : ''}>
              <td>{item.id}</td>
              <td>{formatDate(item.date_creation)}</td>
              <td>{item.client_id}</td>
              <td>{item.intervention_id ?? '—'}</td>
              <td>{formatAmount(item.montant_total)}</td>
              <td>
                <span className={`${styles.statusBadge} ${item.status === 'annule' ? styles.statusInactive : styles.statusActive}`}>
                  {item.status}
                </span>
              </td>
              <td>
                <div className={styles.actions}>
                  <button className={styles.btnEdit} onClick={() => onEdit(item)}>
                    Modifier
                  </button>
                  {item.status !== 'annule' && (
                    <button className={styles.btnDeactivate} onClick={() => onCancelRequest(item)}>
                      Annuler
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function DevisCards({ devis, onEdit, onCancelRequest }: DevisDisplayProps) {
  return (
    <div className={styles.cardList}>
      {devis.map((item) => (
        <div key={item.id} className={`${styles.userCard} ${item.status === 'annule' ? styles.userCardInactive : ''}`}>
          <div className={styles.userCardHeader}>
            <span className={styles.userName}>Devis #{item.id}</span>
            <span className={`${styles.statusBadge} ${item.status === 'annule' ? styles.statusInactive : styles.statusActive}`}>
              {item.status}
            </span>
          </div>
          <p className={styles.userCardEmail}>Date: {formatDate(item.date_creation)}</p>
          <p className={styles.userCardPhone}>Client: #{item.client_id}</p>
          <p className={styles.userCardPhone}>Intervention: {item.intervention_id ?? '—'}</p>
          <p className={styles.userCardPhone}>Montant: {formatAmount(item.montant_total)}</p>
          <div className={styles.userCardActions}>
            <button className={styles.btnEdit} onClick={() => onEdit(item)}>
              Modifier
            </button>
            {item.status !== 'annule' && (
              <button className={styles.btnDeactivate} onClick={() => onCancelRequest(item)}>
                Annuler
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
