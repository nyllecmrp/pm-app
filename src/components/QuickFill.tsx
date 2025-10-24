import React from 'react';
import { dbService } from '../services/database';
import { useProductionStore } from '../store/productionStore';

export const QuickFill: React.FC = () => {
  const { setFormField, calculateMetrics, generateTimeTable } = useProductionStore();

  const fillFromYesterday = async () => {
    try {
      const sessions = await dbService.getSessions(30);

      if (sessions.length === 0) {
        alert('No previous sessions found!');
        return;
      }

      // Get yesterday's date
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      // Find yesterday's session, or get the most recent one
      let sessionToLoad = sessions.find(s => s.date === yesterdayStr);

      if (!sessionToLoad) {
        sessionToLoad = sessions[0]; // Most recent session
        alert(`No session from yesterday found. Loading most recent session from ${sessionToLoad.date}`);
      }

      // Load form data (but use today's date)
      setFormField('line', sessionToLoad.line);
      setFormField('date', new Date().toISOString().split('T')[0]); // Today
      setFormField('planTarget', sessionToLoad.planTarget);
      setFormField('achievementFactor', sessionToLoad.achievementFactor);
      setFormField('requiredManpower', sessionToLoad.requiredManpower);
      setFormField('actualManpower', sessionToLoad.actualManpower);
      setFormField('startTime', sessionToLoad.startTime);
      setFormField('endTime', sessionToLoad.endTime);
      setFormField('breakTime', sessionToLoad.breakTime);

      // Calculate metrics
      setTimeout(() => {
        calculateMetrics();
      }, 0);

      // Generate time table with same structure (but zero actual values)
      setTimeout(() => {
        generateTimeTable();

        const store = useProductionStore.getState();
        store.timeSlots = sessionToLoad!.timeSlots.map((slot, index) => ({
          ...slot,
          id: `slot-${Date.now()}-${index}`,
          actual: 0, // Reset actual values for new day
          variance: 0,
          productivityRate: 0,
        }));
        store.updateCalculations();
      }, 100);

      alert('✅ Quick filled from previous session! Time slots ready for today\'s data.');
    } catch (error) {
      console.error('Failed to quick fill:', error);
      alert('Failed to load previous session');
    }
  };

  return (
    <button className="btn btn-secondary" onClick={fillFromYesterday} title="Load yesterday's settings">
      ⚡ Quick Fill
    </button>
  );
};
