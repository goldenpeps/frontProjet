import { HistoriqueTerrain, Terrain } from '@/services';
import styles from '../admin.module.css';
import { formatTerrainLabel } from './historiqueTerrainsUtils';

interface HistoriqueTerrainsDisplayProps {
  historiques: HistoriqueTerrain[];
  terrainById: Map<number, Terrain>;
  onEdit: (historique: HistoriqueTerrain) => void;
  onDeleteRequest: (historique: HistoriqueTerrain) => void;
}

export function HistoriqueTerrainsTable({
  historiques,
  terrainById,
  onEdit,
  onDeleteRequest,
}: HistoriqueTerrainsDisplayProps) {
  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Terrain</th>
            <th>Date ramassage</th>
            <th>Ramassage</th>
            <th>Date tonte</th>
            <th>Tonte</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {historiques.map((historique) => {
            const terrain = historique.terrainId == null ? undefined : terrainById.get(historique.terrainId);
            return (
              <tr key={historique.id}>
                <td>{historique.id}</td>
                <td>{terrain ? formatTerrainLabel(terrain) : `Terrain #${historique.terrainId ?? '—'}`}</td>
                <td>{historique.dateRamassage || '—'}</td>
                <td>{historique.ramassage ? 'Oui' : 'Non'}</td>
                <td>{historique.dateTonte || '—'}</td>
                <td>{historique.tonte ? 'Oui' : 'Non'}</td>
                <td>
                  <div className={styles.actions}>
                    <button className={styles.btnEdit} onClick={() => onEdit(historique)}>
                      Modifier
                    </button>
                    <button className={styles.btnDeactivate} onClick={() => onDeleteRequest(historique)}>
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
