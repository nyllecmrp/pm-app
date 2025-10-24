import React from 'react';
import { useProductionStore } from '../store/productionStore';

export const MetricsDisplay: React.FC = () => {
  const { metrics } = useProductionStore();

  if (!metrics) return null;

  return (
    <div className="results-section">
      <h3 className="section-title">Calculated Metrics</h3>
      <div className="results-grid">
        <div className="result-card">
          <h3>Total Time (hours)</h3>
          <div className="value">{metrics.totalTimeHours.toFixed(2)}</div>
        </div>
        <div className="result-card">
          <h3>Working Time (hours)</h3>
          <div className="value">{metrics.workingTimeHours.toFixed(2)}</div>
        </div>
        <div className="result-card">
          <h3>Hourly Target</h3>
          <div className="value">{metrics.hourlyTarget.toFixed(2)}</div>
        </div>
        <div className="result-card">
          <h3>Tact Time (seconds)</h3>
          <div className="value">{metrics.tactTime.toFixed(2)}</div>
        </div>
      </div>
    </div>
  );
};
