import { TypeMateriel } from '@/services';
import styles from '../admin.module.css';

interface TypesMaterielsDisplayProps {
  typesMateriels: TypeMateriel[];
  onEdit: (typeMateriel: TypeMateriel) => void;
  onDeleteRequest: (typeMateriel: TypeMateriel) => void;
}

export function TypesMaterielsTable({
  typesMateriels,
  onEdit,
  onDeleteRequest,
}: TypesMaterielsDisplayProps) {
  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Libellé</th>
            <th>Transportable</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {typesMateriels.map((typeMateriel) => (
            <tr key={typeMateriel.id}>
              <td>{typeMateriel.id}</td>
              <td><span className={styles.userName}>{typeMateriel.libelle}</span></td>
              <td>{typeMateriel.transportable ? 'Oui' : 'Non'}</td>
              <td>
                <div className={styles.actions}>
                  <button className={styles.btnEdit} onClick={() => onEdit(typeMateriel)}>
                    Modifier
                  </button>
                  <button className={styles.btnDeactivate} onClick={() => onDeleteRequest(typeMateriel)}>
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

export function TypesMaterielsCards({
  typesMateriels,
  onEdit,
  onDeleteRequest,
}: TypesMaterielsDisplayProps) {
  return (
    <div className={styles.cardList}>
      {typesMateriels.map((typeMateriel) => (
        <div key={typeMateriel.id} className={styles.userCard}>
          <div className={styles.userCardHeader}>
            <span className={styles.userName}>{typeMateriel.libelle}</span>
          </div>
          <p className={styles.userCardEmail}>ID: {typeMateriel.id}</p>
          <p className={styles.userCardPhone}>Transportable: {typeMateriel.transportable ? 'Oui' : 'Non'}</p>
          <div className={styles.userCardActions}>
            <button className={styles.btnEdit} onClick={() => onEdit(typeMateriel)}>
              Modifier
            </button>
            <button className={styles.btnDeactivate} onClick={() => onDeleteRequest(typeMateriel)}>
              Supprimer
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
