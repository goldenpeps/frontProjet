import { AdminUser } from '@/services';
import styles from '../admin.module.css';

interface UsersDisplayProps {
  users: AdminUser[];
  currentUserId?: number;
  onEdit: (user: AdminUser) => void;
  onToggleRequest: (user: AdminUser) => void;
}

export function UsersTable({ users, currentUserId, onEdit, onToggleRequest }: UsersDisplayProps) {
  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Nom</th>
            <th>Email</th>
            <th>Téléphone</th>
            <th>Rôles</th>
            <th>Statut</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className={!u.is_active ? styles.rowInactive : ''}>
              <td>
                <span className={styles.userName}>
                  {u.prenom} {u.nom}
                </span>
                {currentUserId === u.id && <span className={styles.badgeSelf}>vous</span>}
              </td>
              <td>{u.email}</td>
              <td>{u.telephone || '—'}</td>
              <td>
                <div className={styles.rolesCell}>
                  {u.roles.map((r) => (
                    <span key={r} className={`${styles.roleBadge} ${r === 'ROLE_ADMIN' ? styles.roleAdmin : ''}`}>
                      {r.replace('ROLE_', '')}
                    </span>
                  ))}
                </div>
              </td>
              <td>
                <span className={`${styles.statusBadge} ${u.is_active ? styles.statusActive : styles.statusInactive}`}>
                  {u.is_active ? 'Actif' : 'Inactif'}
                </span>
              </td>
              <td>
                <div className={styles.actions}>
                  <button className={styles.btnEdit} onClick={() => onEdit(u)}>
                    Modifier
                  </button>
                  {currentUserId !== u.id && (
                    <button
                      className={u.is_active ? styles.btnDeactivate : styles.btnActivate}
                      onClick={() => onToggleRequest(u)}
                    >
                      {u.is_active ? 'Désactiver' : 'Réactiver'}
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

export function UsersCards({ users, currentUserId, onEdit, onToggleRequest }: UsersDisplayProps) {
  return (
    <div className={styles.cardList}>
      {users.map((u) => (
        <div key={u.id} className={`${styles.userCard} ${!u.is_active ? styles.userCardInactive : ''}`}>
          <div className={styles.userCardHeader}>
            <div>
              <span className={styles.userName}>
                {u.prenom} {u.nom}
              </span>
              {currentUserId === u.id && <span className={styles.badgeSelf}>vous</span>}
            </div>
            <span className={`${styles.statusBadge} ${u.is_active ? styles.statusActive : styles.statusInactive}`}>
              {u.is_active ? 'Actif' : 'Inactif'}
            </span>
          </div>
          <p className={styles.userCardEmail}>{u.email}</p>
          {u.telephone && <p className={styles.userCardPhone}>{u.telephone}</p>}
          <div className={styles.rolesCell}>
            {u.roles.map((r) => (
              <span key={r} className={`${styles.roleBadge} ${r === 'ROLE_ADMIN' ? styles.roleAdmin : ''}`}>
                {r.replace('ROLE_', '')}
              </span>
            ))}
          </div>
          <div className={styles.userCardActions}>
            <button className={styles.btnEdit} onClick={() => onEdit(u)}>
              Modifier
            </button>
            {currentUserId !== u.id && (
              <button
                className={u.is_active ? styles.btnDeactivate : styles.btnActivate}
                onClick={() => onToggleRequest(u)}
              >
                {u.is_active ? 'Désactiver' : 'Réactiver'}
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
