import { TerrainType } from '@/services';
import styles from '../admin.module.css';

interface TypesTerrainsDisplayProps {
  typesTerrains: TerrainType[];
  onEdit: (typeTerrain: TerrainType) => void;
  onDeleteRequest: (typeTerrain: TerrainType) => void;
}

export function TypesTerrainsTable({
  typesTerrains,
  onEdit,
  onDeleteRequest,
}: TypesTerrainsDisplayProps) {
  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nom</th>
            <th>Description</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {typesTerrains.map((typeTerrain) => (
            <tr key={typeTerrain.id}>
              <td>{typeTerrain.id}</td>
              <td><span className={styles.userName}>{typeTerrain.nom}</span></td>
              <td>{typeTerrain.description || '—'}</td>
              <td>
                <div className={styles.actions}>
                  <button className={styles.btnEdit} onClick={() => onEdit(typeTerrain)}>
                    Modifier
                  </button>
                  <button className={styles.btnDeactivate} onClick={() => onDeleteRequest(typeTerrain)}>
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

export function TypesTerrainsCards({
  typesTerrains,
  onEdit,
  onDeleteRequest,
}: TypesTerrainsDisplayProps) {
  return (
    <div className={styles.cardList}>
      {typesTerrains.map((typeTerrain) => (
        <div key={typeTerrain.id} className={styles.userCard}>
          <div className={styles.userCardHeader}>
            <span className={styles.userName}>{typeTerrain.nom}</span>
          </div>
          <p className={styles.userCardEmail}>ID: {typeTerrain.id}</p>
          <p className={styles.userCardPhone}>{typeTerrain.description || 'Aucune description'}</p>
          <div className={styles.userCardActions}>
            <button className={styles.btnEdit} onClick={() => onEdit(typeTerrain)}>
              Modifier
            </button>
            <button className={styles.btnDeactivate} onClick={() => onDeleteRequest(typeTerrain)}>
              Supprimer
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
