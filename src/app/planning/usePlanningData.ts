import { useEffect, useMemo, useState } from 'react';
import { UserPlanningIntervention, interventionService } from '@/services/interventionService';
import {
  buildWeekSubtitle,
  filterInterventionsByWeekDay,
  getWeekDates,
  getWeekRangeIso,
  sortInterventionsByStart,
} from './planningUtils';

export function usePlanningData() {
  const [weekOffset, setWeekOffset] = useState(0);
  const [interventions, setInterventions] = useState<UserPlanningIntervention[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedIntervention, setSelectedIntervention] = useState<UserPlanningIntervention | null>(null);

  const weekDates = useMemo(() => getWeekDates(weekOffset), [weekOffset]);
  const weekSubtitle = useMemo(() => buildWeekSubtitle(weekDates), [weekDates]);

  useEffect(() => {
    let active = true;

    const loadPlanning = async () => {
      try {
        setLoading(true);
        const { from, to } = getWeekRangeIso(weekOffset);
        const data = await interventionService.getMyPlanning({ from, to });

        if (!active) return;

        setInterventions(sortInterventionsByStart(data));
        setSelectedIntervention(null);
        setError('');
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'Erreur de chargement du planning');
      } finally {
        if (active) setLoading(false);
      }
    };

    loadPlanning();

    return () => {
      active = false;
    };
  }, [weekOffset]);

  const interventionsByDay = useMemo(
    () => weekDates.map(({ date }) => filterInterventionsByWeekDay(interventions, date)),
    [interventions, weekDates]
  );

  return {
    weekOffset,
    setWeekOffset,
    interventionsByDay,
    weekDates,
    weekSubtitle,
    loading,
    error,
    selectedIntervention,
    setSelectedIntervention,
  };
}
