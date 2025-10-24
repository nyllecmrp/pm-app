export interface ProductionMetrics {
  totalTimeHours: number;
  workingTimeHours: number;
  hourlyTarget: number;
  tactTime: number;
  planTarget: number;
  achievementFactor: number;
  requiredManpower: number;
  actualManpower: number;
}

export interface TimeSlot {
  id: string;
  timeSlot: string;
  workingTime: number;
  plan: number;
  planCumulative: number;
  actual: number;
  variance: number;
  productivityRate: number;
}

export interface ProductionSession {
  id?: number | null;
  line: string;
  date: string;
  planTarget: number;
  achievementFactor: number;
  requiredManpower: number;
  actualManpower: number;
  startTime: string;
  endTime: string;
  breakTime: number;
  metrics: ProductionMetrics;
  timeSlots: TimeSlot[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Summary {
  totalPlan: number;
  totalActual: number;
  totalVariance: number;
  avgProductivity: number;
}

export interface Template {
  id?: number;
  name: string;
  line: string;
  planTarget: number;
  achievementFactor: number;
  requiredManpower: number;
  actualManpower: number;
  startTime: string;
  endTime: string;
  breakTime: number;
  isDefault?: boolean;
  createdAt?: string;
}
