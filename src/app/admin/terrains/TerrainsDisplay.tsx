import { Client, Terrain, TerrainType } from '@/services';
import styles from '../admin.module.css';
import {
  formatAdresseDisplay,
  formatClientLabel,
  formatTerrainTypeLabel,
  gpsToString,
} from './terrainsUtils';

interface TerrainsDisplayProps {
  terrains: Terrain[];
  clientById: Map<number, Client>;
  terrainTypeById: Map<number, TerrainType>;
  onEdit: (terrain: Terrain) => void;
  onDelete: (terrain: Terrain) => void;
}

export function TerrainsTable({
  terrains,
  clientById,
  terrainTypeById,
  onEdit,
  onDelete,
}: TerrainsDisplayProps) {
  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Client</th>
            <th>Superficie</th>
            <th>Type de terrain</th>
            <th>Adresse</th>
            <th>Coordonnées GPS</th>
            <th>Commentaire</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {terrains.map((terrain) => {
            const client = clientById.get(terrain.client_id);
            const terrainType =
              terrain.type_terrain_id == null ? undefined : terrainTypeById.get(terrain.type_terrain_id);

            return (
              <tr key={terrain.id}>
                <td>{terrain.id}</td>
                <td>{client ? formatClientLabel(client) : `Client #${terrain.client_id}`}</td>
                <td>{terrain.superficie}</td>
                <td>
                  {terrain.type_terrain_id == null
                    ? '—'
                    : terrainType
                      ? formatTerrainTypeLabel(terrainType)
                      : `Type #${terrain.type_terrain_id}`}
                </td>
                <td>{formatAdresseDisplay(terrain.adresse)}</td>
                <td>{gpsToString(terrain.coordonnees_gps) || '—'}</td>
                <td>{terrain.commentaire || '—'}</td>
                <td>
                  <div className={styles.actions}>
                    <button className={styles.btnEdit} onClick={() => onEdit(terrain)}>
                      Modifier
                    </button>
                    <button className={styles.btnDeactivate} onClick={() => onDelete(terrain)}>
                      Supprimer
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function TerrainsCards({
  terrains,
  clientById,
  terrainTypeById,
  onEdit,
  onDelete,
}: TerrainsDisplayProps) {
  return (
    <div className={styles.cardList}>
      {terrains.map((terrain) => {
        const client = clientById.get(terrain.client_id);
        const terrainType =
          terrain.type_terrain_id == null ? undefined : terrainTypeById.get(terrain.type_terrain_id);

        return (
          <div key={terrain.id} className={styles.userCard}>
            <div className={styles.userCardHeader}>
              <span className={styles.userName}>Terrain #{terrain.id}</span>
            </div>
            <p className={styles.userCardEmail}>{client ? formatClientLabel(client) : `Client #${terrain.client_id}`}</p>
            <p className={styles.userCardPhone}>Superficie: {terrain.superficie}</p>
            <p className={styles.userCardPhone}>
              Type de terrain:{' '}
              {terrain.type_terrain_id == null
                ? '—'
                : terrainType
                  ? formatTerrainTypeLabel(terrainType)
                  : `Type #${terrain.type_terrain_id}`}
            </p>
            <p className={styles.userCardPhone}>Adresse: {formatAdresseDisplay(terrain.adresse)}</p>
            <p className={styles.userCardPhone}>GPS: {gpsToString(terrain.coordonnees_gps) || '—'}</p>
            <p className={styles.userCardPhone}>{terrain.commentaire || 'Aucun commentaire'}</p>
            <div className={styles.userCardActions}>
              <button className={styles.btnEdit} onClick={() => onEdit(terrain)}>
                Modifier
              </button>
              <button className={styles.btnDeactivate} onClick={() => onDelete(terrain)}>
                Supprimer
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
