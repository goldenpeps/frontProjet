import { Materiel } from '@/services';
import styles from '../admin.module.css';
import { formatTransportable } from './materielUtils';

interface MaterielDisplayProps {
  materiels: Materiel[];
  onEdit: (materiel: Materiel) => void;
  onDeleteRequest: (materiel: Materiel) => void;
}

export function MaterielTable({ materiels, onEdit, onDeleteRequest }: MaterielDisplayProps) {
  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Disponibilité</th>
            <th>Type matériel</th>
            <th>Transportable</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {materiels.map((materiel) => (
            <tr key={materiel.id} className={!materiel.disponible ? styles.rowInactive : ''}>
              <td>{materiel.id}</td>
              <td>
                <span className={`${styles.statusBadge} ${materiel.disponible ? styles.statusActive : styles.statusInactive}`}>
                  {materiel.disponible ? 'Disponible' : 'Indisponible'}
                </span>
              </td>
              <td>{materiel.type_materiel_libelle || `Type #${materiel.type_materiel_id ?? '—'}`}</td>
              <td>{formatTransportable(materiel.type_materiel_transportable)}</td>
              <td>
                <div className={styles.actions}>
                  <button className={styles.btnEdit} onClick={() => onEdit(materiel)}>
                    Modifier
                  </button>
                  <button className={styles.btnDeactivate} onClick={() => onDeleteRequest(materiel)}>
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

export function MaterielCards({ materiels, onEdit, onDeleteRequest }: MaterielDisplayProps) {
  return (
    <div className={styles.cardList}>
      {materiels.map((materiel) => (
        <div key={materiel.id} className={`${styles.userCard} ${!materiel.disponible ? styles.userCardInactive : ''}`}>
          <div className={styles.userCardHeader}>
            <span className={styles.userName}>Matériel #{materiel.id}</span>
            <span className={`${styles.statusBadge} ${materiel.disponible ? styles.statusActive : styles.statusInactive}`}>
              {materiel.disponible ? 'Disponible' : 'Indisponible'}
            </span>
          </div>
          <p className={styles.userCardPhone}>
            Type matériel: {materiel.type_materiel_libelle || `Type #${materiel.type_materiel_id ?? '—'}`}
          </p>
          <p className={styles.userCardPhone}>Transportable: {formatTransportable(materiel.type_materiel_transportable)}</p>
          <div className={styles.userCardActions}>
            <button className={styles.btnEdit} onClick={() => onEdit(materiel)}>
              Modifier
            </button>
            <button className={styles.btnDeactivate} onClick={() => onDeleteRequest(materiel)}>
              Supprimer
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
