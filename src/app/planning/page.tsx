'use client';

import { useCallback } from 'react';
import { ProtectedRoute } from '@/components';
import { Navbar } from '@/components/Navbar';
import {
  PlanningDetailsModal,
  PlanningGrid,
  PlanningHeader,
} from './PlanningDisplay';
import styles from './planning.module.css';
import { usePlanningData } from './usePlanningData';

function PlanningContent() {
  const {
    weekOffset,
    setWeekOffset,
    interventionsByDay,
    weekDates,
    weekSubtitle,
    loading,
    error,
    selectedIntervention,
    setSelectedIntervention,
  } = usePlanningData();

  const showPreviousWeek = useCallback(() => setWeekOffset((prev) => prev - 1), [setWeekOffset]);
  const showCurrentWeek = useCallback(() => setWeekOffset(0), [setWeekOffset]);
  const showNextWeek = useCallback(() => setWeekOffset((prev) => prev + 1), [setWeekOffset]);

  return (
    <>
      <Navbar />
      <div className={styles.container}>
        <PlanningHeader
          weekSubtitle={weekSubtitle}
          weekOffset={weekOffset}
          onPreviousWeek={showPreviousWeek}
          onCurrentWeek={showCurrentWeek}
          onNextWeek={showNextWeek}
        />

        <PlanningGrid
          weekDates={weekDates}
          interventionsByDay={interventionsByDay}
          loading={loading}
          error={error}
          onSelectIntervention={setSelectedIntervention}
        />
      </div>

      <PlanningDetailsModal
        intervention={selectedIntervention}
        onClose={() => setSelectedIntervention(null)}
      />
    </>
  );
}

export default function PlanningPage() {
  return (
    <ProtectedRoute>
      <PlanningContent />
    </ProtectedRoute>
  );
}
