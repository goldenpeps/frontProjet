'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { ProtectedRoute } from '@/components';
import { Navbar } from '@/components/Navbar';
import { UserPlanningIntervention, interventionService, toPlanningQueryDateTime } from '@/services/interventionService';
import Link from 'next/link';
import styles from './dashboard.module.css';

function formatDateTime(value: string | null): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatClientLabel(intervention: UserPlanningIntervention): string {
  if (!intervention.client) return 'Non renseigné';
  const fullName = `${intervention.client.prenom} ${intervention.client.nom}`.trim();
  return fullName || `Client #${intervention.client.id}`;
}

function formatTerrainLabel(intervention: UserPlanningIntervention): string {
  if (!intervention.terrain.length) return 'Non renseigné';

  return intervention.terrain
    .map((terrain) => {
      if (terrain.nom) return terrain.nom;
      return `Terrain #${terrain.id}`;
    })
    .join(', ');
}

function formatMaterielLabel(intervention: UserPlanningIntervention): string {
  if (!intervention.materiels.length) return 'Non renseigné';

  return intervention.materiels
    .map((materiel) => {
      if (materiel.libelle) return materiel.libelle;
      return `Matériel #${materiel.id}`;
    })
    .join(', ');
}

function DashboardContent() {
  const PLANNING_ITEMS_PER_PAGE = 5;
  const { user } = useAuth();
  const isAdmin = user?.roles?.includes('ROLE_ADMIN') ?? false;
  const [planning, setPlanning] = useState<UserPlanningIntervention[]>([]);
  const [planningPage, setPlanningPage] = useState(1);
  const [selectedIntervention, setSelectedIntervention] = useState<UserPlanningIntervention | null>(null);
  const [planningLoading, setPlanningLoading] = useState(true);
  const [planningError, setPlanningError] = useState('');

  useEffect(() => {
    let active = true;

    const loadPlanning = async () => {
      try {
        setPlanningLoading(true);
        const from = new Date();
        from.setHours(0, 0, 0, 0);

        const to = new Date(from);
        to.setDate(to.getDate() + 14);

        const data = await interventionService.getMyPlanning({
          from: toPlanningQueryDateTime(from),
          to: toPlanningQueryDateTime(to),
        });

        if (!active) return;
        setPlanning(
          [...data].sort((a, b) => {
            const dateA = a.planning.debut ?? a.date_prevue;
            const dateB = b.planning.debut ?? b.date_prevue;
            return new Date(dateA).getTime() - new Date(dateB).getTime();
          })
        );
        setSelectedIntervention(null);
        setPlanningError('');
      } catch (error) {
        if (!active) return;
        setPlanningError(error instanceof Error ? error.message : 'Erreur de chargement du planning');
      } finally {
        if (active) setPlanningLoading(false);
      }
    };

    loadPlanning();

    return () => {
      active = false;
    };
  }, []);

  const totalPlanningPages = useMemo(
    () => Math.ceil(planning.length / PLANNING_ITEMS_PER_PAGE),
    [planning.length, PLANNING_ITEMS_PER_PAGE]
  );

  useEffect(() => {
    if (totalPlanningPages === 0) {
      setPlanningPage(1);
      return;
    }

    if (planningPage > totalPlanningPages) {
      setPlanningPage(totalPlanningPages);
    }
  }, [planningPage, totalPlanningPages]);

  const paginatedPlanning = useMemo(() => {
    const start = (planningPage - 1) * PLANNING_ITEMS_PER_PAGE;
    return planning.slice(start, start + PLANNING_ITEMS_PER_PAGE);
  }, [planning, planningPage, PLANNING_ITEMS_PER_PAGE]);

  return (
    <>
      <Navbar />
      <div className={styles.container}>
        <div className={styles.welcomeSection}>
          <h1 className={styles.title}>Bienvenue, {user?.prenom} {user?.nom} !</h1>
          <p className={styles.subtitle}>Que souhaitez-vous faire aujourd&apos;hui ?</p>
        </div>

        <div className={styles.grid}>
          <Link href="/planning" className={styles.card}>
            <div className={styles.cardIcon}>📅</div>
            <h2 className={styles.cardTitle}>Planning</h2>
            <p className={styles.cardDesc}>Consulter le planning d&apos;interventions</p>
          </Link>

          <Link href="/profile" className={styles.card}>
            <div className={styles.cardIcon}>👤</div>
            <h2 className={styles.cardTitle}>Mon Profil</h2>
            <p className={styles.cardDesc}>Voir et modifier mes informations</p>
          </Link>

          {isAdmin && (
            <Link href="/admin" className={styles.card}>
              <div className={styles.cardIcon}>🛠️</div>
              <h2 className={styles.cardTitle}>Administration</h2>
              <p className={styles.cardDesc}>Gérer l&apos;application</p>
            </Link>
          )}
        </div>

        <div className={styles.planningSection}>
          <div className={styles.planningHeader}>
            <h2 className={styles.planningTitle}>Mes prochains créneaux</h2>
            <Link href="/planning" className={styles.planningLink}>Voir tout</Link>
          </div>

          {planningLoading ? (
            <p className={styles.planningState}>Chargement du planning...</p>
          ) : planningError ? (
            <p className={styles.planningError}>{planningError}</p>
          ) : paginatedPlanning.length === 0 ? (
            <p className={styles.planningState}>Aucun créneau planifié sur les 14 prochains jours.</p>
          ) : (
            <>
              <div className={styles.planningList}>
                {paginatedPlanning.map((item) => (
                  <article key={item.id} className={styles.planningItem}>
                    <p className={styles.planningItemTitle}>Intervention #{item.id}</p>
                    <p className={styles.planningItemTime}>
                      Début: {formatDateTime(item.planning.debut ?? item.date_prevue)}
                    </p>
                    <p className={styles.planningItemTime}>
                      Fin: {formatDateTime(item.planning.fin ?? item.date_realisation)}
                    </p>
                    <button
                      type="button"
                      className={styles.detailButton}
                      onClick={() => setSelectedIntervention(item)}
                    >
                      Voir détails
                    </button>
                  </article>
                ))}
              </div>

              {totalPlanningPages > 1 && (
                <div className={styles.pagination}>
                  <button
                    type="button"
                    className={styles.paginationButton}
                    onClick={() => setPlanningPage((prev) => Math.max(prev - 1, 1))}
                    disabled={planningPage === 1}
                  >
                    Précédent
                  </button>
                  <p className={styles.paginationInfo}>
                    Page {planningPage} / {totalPlanningPages}
                  </p>
                  <button
                    type="button"
                    className={styles.paginationButton}
                    onClick={() => setPlanningPage((prev) => Math.min(prev + 1, totalPlanningPages))}
                    disabled={planningPage === totalPlanningPages}
                  >
                    Suivant
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {selectedIntervention && (
        <div
          className={styles.modalOverlay}
          onClick={() => setSelectedIntervention(null)}
          role="presentation"
        >
          <div
            className={styles.modal}
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="dashboard-detail-title"
          >
            <h2 id="dashboard-detail-title" className={styles.modalTitle}>
              Intervention #{selectedIntervention.id}
            </h2>
            <p className={styles.modalText}><strong>Client:</strong> {formatClientLabel(selectedIntervention)}</p>
            <p className={styles.modalText}><strong>Terrain:</strong> {formatTerrainLabel(selectedIntervention)}</p>
            <p className={styles.modalText}><strong>Matériel:</strong> {formatMaterielLabel(selectedIntervention)}</p>
            <p className={styles.modalText}>
              <strong>Début:</strong> {formatDateTime(selectedIntervention.planning.debut ?? selectedIntervention.date_prevue)}
            </p>
            <p className={styles.modalText}>
              <strong>Fin:</strong> {formatDateTime(selectedIntervention.planning.fin ?? selectedIntervention.date_realisation)}
            </p>
            <button
              type="button"
              className={styles.modalCloseButton}
              onClick={() => setSelectedIntervention(null)}
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
