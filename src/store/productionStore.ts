import { create } from 'zustand';
import { ProductionMetrics, TimeSlot, Summary } from '../types';

interface ProductionState {
  // Form data
  line: string;
  date: string;
  planTarget: number;
  achievementFactor: number;
  requiredManpower: number;
  actualManpower: number;
  startTime: string;
  endTime: string;
  breakTime: number;

  // Calculated metrics
  metrics: ProductionMetrics | null;
  timeSlots: TimeSlot[];
  summary: Summary;

  // UI state
  showTimeTable: boolean;
  showSummary: boolean;

  // Session tracking
  currentSessionId: number | null;

  // Actions
  setFormField: (field: string, value: any) => void;
  calculateMetrics: () => void;
  generateTimeTable: () => void;
  addTimeSlot: () => void;
  removeLastTimeSlot: () => void;
  updateTimeSlot: (id: string, field: keyof TimeSlot, value: any) => void;
  updateCalculations: () => void;
  resetForm: () => void;
  setCurrentSessionId: (id: number | null) => void;
}

// const defaultTimeSlots = [
//   { time: '6:00 ~ 7:00', workingTime: 1 },
//   { time: '7:00 ~ 8:00', workingTime: 1 },
//   { time: '8:00 ~ 9:00', workingTime: 1 },
//   { time: '9:00 ~ 9:30', workingTime: 0.5 },
//   { time: '9:30 ~ 10:30', workingTime: 1 },
//   { time: '10:30 ~ 11:30', workingTime: 1 },
//   { time: '11:30 ~ 12:30', workingTime: 1 },
//   { time: '12:30 ~ 1:10', workingTime: 0.67 },
//   { time: '1:10 ~ 2:10', workingTime: 1 },
//   { time: '2:10 ~ 3:10', workingTime: 1 },
//   { time: '3:10 ~ 4:10', workingTime: 1 },
//   { time: '4:10 ~ 5:10', workingTime: 1 },
// ];

export const useProductionStore = create<ProductionState>((set, get) => ({
  // Initial form data
  line: '',
  date: new Date().toISOString().split('T')[0],
  planTarget: 0,
  achievementFactor: 0,
  requiredManpower: 0,
  actualManpower: 0,
  startTime: '',
  endTime: '',
  breakTime: 0,

  // Initial state
  metrics: null,
  timeSlots: [],
  summary: {
    totalPlan: 0,
    totalActual: 0,
    totalVariance: 0,
    avgProductivity: 0,
  },
  showTimeTable: false,
  showSummary: false,
  currentSessionId: null,

  setFormField: (field, value) => {
    set({ [field]: value });
    // Auto-calculate metrics when relevant fields change
    if (['planTarget', 'achievementFactor', 'requiredManpower', 'actualManpower',
         'startTime', 'endTime', 'breakTime'].includes(field)) {
      setTimeout(() => get().calculateMetrics(), 0);
    }
  },

  calculateMetrics: () => {
    const state = get();
    const { planTarget, startTime, endTime, breakTime, achievementFactor, requiredManpower, actualManpower } = state;

    console.log('Calculating metrics...', { planTarget, startTime, endTime, breakTime });

    if (!startTime || !endTime) {
      console.warn('Missing start or end time');
      return;
    }

    const start = new Date(`2000-01-01T${startTime}:00`);
    const end = new Date(`2000-01-01T${endTime}:00`);

    // Handle overnight shift
    if (end < start) {
      end.setDate(end.getDate() + 1);
    }

    const totalTimeHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    const workingTimeHours = totalTimeHours - breakTime;
    const hourlyTarget = planTarget / workingTimeHours;
    const tactTime = 3600 / hourlyTarget;

    console.log('Metrics calculated:', { totalTimeHours, workingTimeHours, hourlyTarget, tactTime });

    set({
      metrics: {
        totalTimeHours,
        workingTimeHours,
        hourlyTarget,
        tactTime,
        planTarget,
        achievementFactor,
        requiredManpower,
        actualManpower,
      },
    });
  },

  generateTimeTable: () => {
    const state = get();
    if (!state.metrics) {
      alert('Please calculate metrics first!');
      return;
    }

    set({
      showTimeTable: true,
      showSummary: true,
    });
  },

  addTimeSlot: () => {
    const state = get();
    const newSlot: TimeSlot = {
      id: `slot-${Date.now()}`,
      timeSlot: '',
      workingTime: 0,
      plan: 0,
      planCumulative: 0,
      actual: 0,
      variance: 0,
      productivityRate: 0,
    };
    set({ timeSlots: [...state.timeSlots, newSlot] });
    setTimeout(() => get().updateCalculations(), 0);
  },

  removeLastTimeSlot: () => {
    const state = get();
    if (state.timeSlots.length > 0) {
      set({ timeSlots: state.timeSlots.slice(0, -1) });
      setTimeout(() => get().updateCalculations(), 0);
    }
  },

  updateTimeSlot: (id, field, value) => {
    const state = get();
    const updatedSlots = state.timeSlots.map((slot) =>
      slot.id === id ? { ...slot, [field]: value } : slot
    );
    set({ timeSlots: updatedSlots });
    setTimeout(() => get().updateCalculations(), 0);
  },

  updateCalculations: () => {
    const state = get();
    if (!state.metrics) return;

    const { hourlyTarget, requiredManpower, actualManpower, achievementFactor } = state.metrics;
    let cumulativePlan = 0;
    let totalActual = 0;
    let productivitySum = 0;
    let validProductivityCount = 0;

    const updatedSlots = state.timeSlots.map((slot) => {
      const plan = hourlyTarget * slot.workingTime;
      cumulativePlan += plan;
      const actual = slot.actual;
      const variance = actual - cumulativePlan;

      let productivityRate = 0;
      if (cumulativePlan > 0 && actual > 0) {
        const productivity = (actual / cumulativePlan) * (requiredManpower / actualManpower) * achievementFactor;
        productivityRate = productivity * 100;
        productivitySum += productivity;
        validProductivityCount++;
      }

      totalActual += actual;

      return {
        ...slot,
        plan,
        planCumulative: cumulativePlan,
        variance,
        productivityRate,
      };
    });

    const avgProductivity = validProductivityCount > 0 ? (productivitySum / validProductivityCount) * 100 : 0;

    set({
      timeSlots: updatedSlots,
      summary: {
        totalPlan: cumulativePlan,
        totalActual,
        totalVariance: totalActual - cumulativePlan,
        avgProductivity,
      },
    });
  },

  resetForm: () => {
    set({
      line: '',
      date: new Date().toISOString().split('T')[0],
      planTarget: 103,
      achievementFactor: 1.35,
      requiredManpower: 16.33,
      actualManpower: 16.33,
      startTime: '06:00',
      endTime: '18:00',
      breakTime: 1.42,
      metrics: null,
      timeSlots: [],
      summary: {
        totalPlan: 0,
        totalActual: 0,
        totalVariance: 0,
        avgProductivity: 0,
      },
      showTimeTable: false,
      showSummary: false,
      currentSessionId: null,
    });
  },

  setCurrentSessionId: (id) => {
    set({ currentSessionId: id });
  },
}));
