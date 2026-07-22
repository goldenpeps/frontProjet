import { UserPlanningIntervention } from "@/services/interventionService";
import styles from "./planning.module.css";
import {
  PlanningWeekDateItem,
  formatClientLabel,
  formatHour,
  formatMaterielLabel,
  formatTerrainLabel,
} from "./planningUtils";

interface PlanningHeaderProps {
  weekSubtitle: string;
  weekOffset: number;
  onPreviousWeek: () => void;
  onCurrentWeek: () => void;
  onNextWeek: () => void;
}

interface PlanningGridProps {
  weekDates: PlanningWeekDateItem[];
  interventionsByDay: UserPlanningIntervention[][];
  loading: boolean;
  error: string;
  onSelectIntervention: (intervention: UserPlanningIntervention) => void;
}

interface PlanningDetailsModalProps {
  intervention: UserPlanningIntervention | null;
  onClose: () => void;
}

export function PlanningHeader({
  weekSubtitle,
  weekOffset,
  onPreviousWeek,
  onCurrentWeek,
  onNextWeek,
}: PlanningHeaderProps) {
  return (
    <div className={styles.header}>
      <h1 className={styles.title}>Planning d&apos;interventions</h1>
      <p className={styles.subtitle}>{weekSubtitle}</p>
      <div className={styles.weekNavigation}>
        <button
          type="button"
          className={styles.weekButton}
          onClick={onPreviousWeek}
        >
          Semaine précédente
        </button>
        <button
          type="button"
          className={styles.weekButton}
          onClick={onCurrentWeek}
          disabled={weekOffset === 0}
        >
          Semaine en cours
        </button>
        <button
          type="button"
          className={styles.weekButton}
          onClick={onNextWeek}
        >
          Semaine suivante
        </button>
      </div>
    </div>
  );
}

export function PlanningGrid({
  weekDates,
  interventionsByDay,
  loading,
  error,
  onSelectIntervention,
}: PlanningGridProps) {
  return (
    <div className={styles.planning}>
      {weekDates.map(({ jour, date }, index) => (
        <div key={jour} className={styles.dayColumn}>
          <div className={styles.dayHeader}>
            <span className={styles.dayName}>{jour}</span>
            <span className={styles.dayDate}>{date}</span>
          </div>
          <div className={styles.dayBody}>
            {loading ? (
              <p className={styles.emptyText}>Chargement...</p>
            ) : error ? (
              <p className={styles.errorText}>Erreur de planning</p>
            ) : interventionsByDay[index]?.length ? (
              <div className={styles.interventionList}>
                {interventionsByDay[index].map((intervention) => (
                  <div
                    key={intervention.id}
                    className={styles.interventionItem}
                  >
                    <p className={styles.interventionTitle}>
                      {/* #{intervention.id} */}
                      {/* client */}
                      {formatClientLabel(intervention)}
                      {/* terrain */}
                      
                    </p>
                    <p className={styles.interventionTime}>
                      {formatHour(
                        intervention.planning.debut ?? intervention.date_prevue,
                      )}{" "}
                      -{" "}
                      {formatHour(
                        intervention.planning.fin ??
                          intervention.date_realisation,
                      )}
                    </p>
                    <button
                      type="button"
                      className={styles.detailButton}
                      onClick={() => onSelectIntervention(intervention)}
                    >
                      Voir détails
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className={styles.emptyText}>Aucune intervention</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export function PlanningDetailsModal({
  intervention,
  onClose,
}: PlanningDetailsModalProps) {
  if (!intervention) {
    return null;
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose} role="presentation">
      <div
        className={styles.modal}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="planning-detail-title"
      >
        <h2 id="planning-detail-title" className={styles.modalTitle}>
          {/* Intervention #{intervention.id} */}
        </h2>
        <p className={styles.modalText}>
          <strong>Client:</strong> {formatClientLabel(intervention)}
        </p>
        <strong>Terrain:</strong>
        <div style={{ whiteSpace: "pre-line" }}>
          {intervention.terrain.length
            ? intervention.terrain.map((terrain) => {
                let adresseText = "";
                if (terrain.adresse) {
                  if (Array.isArray(terrain.adresse)) {
                    adresseText = terrain.adresse.join(" ");
                  } else {
                    adresseText = [terrain.adresse.adresse, terrain.adresse.cp]
                      .filter(Boolean)
                      .join(" ");
                  }
                }

                return (
                  <div key={terrain.id} style={{ marginBottom: "8px" }}>
                    <div>
                      <strong>{terrain.nom || `Terrain #${terrain.id}`}</strong>
                    </div>

                    {adresseText && (
                      <div style={{ fontSize: "0.9em", color: "#555" }}>
                        {adresseText}
                      </div>
                    )}
                  </div>
                );
              })
            : "Non renseigné"}
        </div>
        <p className={styles.modalText}>
          <strong>Matériel:</strong> {formatMaterielLabel(intervention)}
        </p>
        <p className={styles.modalText}>
          <strong>Créneau:</strong>{" "}
          {formatHour(intervention.planning.debut ?? intervention.date_prevue)}{" "}
          -{" "}
          {formatHour(
            intervention.planning.fin ?? intervention.date_realisation,
          )}
        </p>
        <button
          type="button"
          className={styles.modalCloseButton}
          onClick={onClose}
        >
          Fermer
        </button>
      </div>
    </div>
  );
}
