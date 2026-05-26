import styles from './profile.module.css';
import { formatRoleLabel, getUserInitials, type ProfileDisplayUser } from './profileUtils';

interface ProfileDisplayProps {
  user: ProfileDisplayUser | null | undefined;
}

export function ProfileDisplay({ user }: ProfileDisplayProps) {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Mon Profil</h1>

        <div className={styles.avatar}>
          <span className={styles.avatarInitials}>{getUserInitials(user)}</span>
        </div>

        <div className={styles.infoSection}>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Prénom</span>
            <span className={styles.infoValue}>{user?.prenom}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Nom</span>
            <span className={styles.infoValue}>{user?.nom}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Email</span>
            <span className={styles.infoValue}>{user?.email}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Rôles</span>
            <span className={styles.infoValue}>
              {user?.roles?.map((role) => (
                <span key={role} className={styles.roleBadge}>
                  {formatRoleLabel(role)}
                </span>
              ))}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
