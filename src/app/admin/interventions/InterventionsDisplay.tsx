import {
  Client,
  EquipeIntervention,
  Intervention,
  Materiel,
  MaterielUtilise,
  Terrain,
} from '@/services';
import styles from '../admin.module.css';
import {
  formatClientLabel,
  formatDate,
  formatEquipeLabel,
  formatHourFromDateTime,
  formatTerrainLabel,
  parsePlanningMeta,
  stripPlanningMeta,
} from './interventionsUtils';

interface InterventionsDisplayProps {
  intervention: Intervention;
  terrains: Terrain[];
  clientById: Map<number, Client>;
  equipeById: Map<number, EquipeIntervention>;
  materielById: Map<number, Materiel>;
  materielUtiliseById: Map<number, MaterielUtilise>;
}

interface InterventionsActionProps {
  onEdit: (intervention: Intervention) => void;
  onDelete: (intervention: Intervention) => void;
}

function getInterventionViewModel(props: InterventionsDisplayProps) {
  const { intervention, terrains, clientById, equipeById, materielById, materielUtiliseById } = props;

  const planningMeta = parsePlanningMeta(intervention.commentaire || '');
  const terrain =
    planningMeta?.terrainId == null ? undefined : terrains.find((item) => item.id === planningMeta.terrainId);
  const client = terrain ? clientById.get(terrain.client_id) : undefined;
  const equipe =
    intervention.equipe_intervention_id == null
      ? undefined
      : equipeById.get(intervention.equipe_intervention_id);
  const materielUtilise =
    intervention.materiel_utilise_id == null
      ? undefined
      : materielUtiliseById.get(intervention.materiel_utilise_id);

  const materielLabels =
    materielUtilise?.materiels.map((entry) => {
      const materiel = materielById.get(entry.id);
      if (!materiel) return `Materiel #${entry.id}`;
      const libelle = materiel.type_materiel_libelle || `Type #${materiel.type_materiel_id ?? '—'}`;
      return `#${materiel.id} (${libelle})`;
    }) ?? [];

  return {
    planningMeta,
    terrain,
    client,
    equipe,
    materielLabels,
    cleanComment: stripPlanningMeta(intervention.commentaire || ''),
  };
}

export function InterventionTableRowCells(props: InterventionsDisplayProps & InterventionsActionProps) {
  const { intervention, onEdit, onDelete } = props;
  const model = getInterventionViewModel(props);

  return (
    <>
      <td>{intervention.id}</td>
      <td>{formatDate(intervention.date_prevue)}</td>
      <td>{model.planningMeta?.heurePrevue || formatHourFromDateTime(intervention.date_prevue) || '—'}</td>
      <td>
        {model.planningMeta?.clientId == null
          ? '—'
          : model.client
            ? formatClientLabel(model.client)
            : `Client #${model.planningMeta.clientId}`}
      </td>
      <td>{model.planningMeta?.type ?? 'autre'}</td>
      <td>{model.terrain ? formatTerrainLabel(model.terrain, model.client) : model.planningMeta?.terrainId ?? '—'}</td>
      <td>{formatDate(intervention.date_realisation)}</td>
      <td>
        {intervention.equipe_intervention_id == null
          ? '—'
          : model.equipe
            ? formatEquipeLabel(model.equipe)
            : `Equipe #${intervention.equipe_intervention_id}`}
      </td>
      <td>{model.materielLabels.length > 0 ? model.materielLabels.join(', ') : '—'}</td>
      <td>{model.cleanComment || '—'}</td>
      <td>
        <div className={styles.actions}>
          <button className={styles.btnEdit} onClick={() => onEdit(intervention)}>
            Modifier
          </button>
          <button className={styles.btnDeactivate} onClick={() => onDelete(intervention)}>
            Supprimer
          </button>
        </div>
      </td>
    </>
  );
}

export function InterventionCard(props: InterventionsDisplayProps & InterventionsActionProps) {
  const { intervention, onEdit, onDelete } = props;
  const model = getInterventionViewModel(props);

  return (
    <div className={styles.userCard}>
      <div className={styles.userCardHeader}>
        <span className={styles.userName}>Intervention #{intervention.id}</span>
      </div>

      <p className={styles.userCardEmail}>Type: {model.planningMeta?.type ?? 'autre'}</p>
      <p className={styles.userCardPhone}>
        Heure: {model.planningMeta?.heurePrevue || formatHourFromDateTime(intervention.date_prevue) || '—'}
      </p>
      <p className={styles.userCardPhone}>
        Client:{' '}
        {model.planningMeta?.clientId == null
          ? '—'
          : model.client
            ? formatClientLabel(model.client)
            : `Client #${model.planningMeta.clientId}`}
      </p>
      <p className={styles.userCardPhone}>
        Terrain: {model.terrain ? formatTerrainLabel(model.terrain, model.client) : model.planningMeta?.terrainId ?? '—'}
      </p>
      <p className={styles.userCardEmail}>Prévue: {formatDate(intervention.date_prevue)}</p>
      <p className={styles.userCardPhone}>Réalisée: {formatDate(intervention.date_realisation)}</p>
      <p className={styles.userCardPhone}>
        Équipe:{' '}
        {intervention.equipe_intervention_id == null
          ? '—'
          : model.equipe
            ? formatEquipeLabel(model.equipe)
            : `Equipe #${intervention.equipe_intervention_id}`}
      </p>
      <p className={styles.userCardPhone}>
        Matériels: {model.materielLabels.length > 0 ? model.materielLabels.join(', ') : '—'}
      </p>
      <p className={styles.userCardPhone}>{model.cleanComment || 'Aucun commentaire'}</p>

      <div className={styles.userCardActions}>
        <button className={styles.btnEdit} onClick={() => onEdit(intervention)}>
          Modifier
        </button>
        <button className={styles.btnDeactivate} onClick={() => onDelete(intervention)}>
          Supprimer
        </button>
      </div>
    </div>
  );
}
