import { Prestation } from '@/services';
import styles from '../admin.module.css';
import { formatPrice } from './prestationsUtils';

interface PrestationsDisplayProps {
  prestations: Prestation[];
  onEdit: (prestation: Prestation) => void;
  onDeleteRequest: (prestation: Prestation) => void;
}

export function PrestationsTable({ prestations, onEdit, onDeleteRequest }: PrestationsDisplayProps) {
  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nom</th>
            <th>Prix unitaire</th>
            <th>Description</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {prestations.map((prestation) => (
            <tr key={prestation.id}>
              <td>{prestation.id}</td>
              <td>
                <span className={styles.userName}>{prestation.nom}</span>
              </td>
              <td>{formatPrice(prestation.prix_unitaire)}</td>
              <td>{prestation.description || '—'}</td>
              <td>
                <div className={styles.actions}>
                  <button className={styles.btnEdit} onClick={() => onEdit(prestation)}>
                    Modifier
                  </button>
                  <button className={styles.btnDeactivate} onClick={() => onDeleteRequest(prestation)}>
                    Supprimer
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

export function PrestationsCards({ prestations, onEdit, onDeleteRequest }: PrestationsDisplayProps) {
  return (
    <div className={styles.cardList}>
      {prestations.map((prestation) => (
        <div key={prestation.id} className={styles.userCard}>
          <div className={styles.userCardHeader}>
            <span className={styles.userName}>{prestation.nom}</span>
          </div>
          <p className={styles.userCardEmail}>{formatPrice(prestation.prix_unitaire)}</p>
          <p className={styles.userCardPhone}>{prestation.description || 'Aucune description'}</p>
          <div className={styles.userCardActions}>
            <button className={styles.btnEdit} onClick={() => onEdit(prestation)}>
              Modifier
            </button>
            <button className={styles.btnDeactivate} onClick={() => onDeleteRequest(prestation)}>
              Supprimer
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
