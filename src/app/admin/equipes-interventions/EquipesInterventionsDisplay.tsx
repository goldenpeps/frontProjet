import { AdminUser, EquipeIntervention } from '@/services';
import styles from '../admin.module.css';
import { formatUserLabel } from './equipesInterventionsUtils';

interface EquipesInterventionsDisplayProps {
  equipes: EquipeIntervention[];
  usersById: Map<number, AdminUser>;
  onEdit: (equipe: EquipeIntervention) => void;
  onDeleteRequest: (equipe: EquipeIntervention) => void;
}

function getMembersLabel(equipe: EquipeIntervention, usersById: Map<number, AdminUser>): string {
  const members = equipe.utilisateur_ids
    .map((id) => usersById.get(id))
    .filter((user): user is AdminUser => !!user);

  return members.length > 0 ? members.map((user) => formatUserLabel(user)).join(', ') : 'Aucun membre';
}

export function EquipesTable({ equipes, usersById, onEdit, onDeleteRequest }: EquipesInterventionsDisplayProps) {
  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Commentaire</th>
            <th>Membres</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {equipes.map((equipe) => (
            <tr key={equipe.id}>
              <td>{equipe.id}</td>
              <td>{equipe.commentaire || '—'}</td>
              <td>{getMembersLabel(equipe, usersById)}</td>
              <td>
                <div className={styles.actions}>
                  <button className={styles.btnEdit} onClick={() => onEdit(equipe)}>
                    Modifier
                  </button>
                  <button className={styles.btnDeactivate} onClick={() => onDeleteRequest(equipe)}>
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

export function EquipesCards({ equipes, usersById, onEdit, onDeleteRequest }: EquipesInterventionsDisplayProps) {
  return (
    <div className={styles.cardList}>
      {equipes.map((equipe) => (
        <div key={equipe.id} className={styles.userCard}>
          <div className={styles.userCardHeader}>
            <span className={styles.userName}>Équipe #{equipe.id}</span>
          </div>
          <p className={styles.userCardPhone}>{equipe.commentaire || 'Sans commentaire'}</p>
          <p className={styles.userCardPhone}>Membres: {getMembersLabel(equipe, usersById)}</p>
          <div className={styles.userCardActions}>
            <button className={styles.btnEdit} onClick={() => onEdit(equipe)}>
              Modifier
            </button>
            <button className={styles.btnDeactivate} onClick={() => onDeleteRequest(equipe)}>
              Supprimer
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
