import React from 'react';
import { useProductionStore } from '../store/productionStore';

export const Summary: React.FC = () => {
  const { summary, showSummary } = useProductionStore();

  if (!showSummary) return null;

  return (
    <div className="summary-section">
      <h3 className="section-title">Production Summary</h3>
      <div className="summary-grid">
        <div className="summary-card">
          <h4>Total Plan</h4>
          <div className="big-value">{summary.totalPlan.toFixed(0)}</div>
        </div>
        <div className="summary-card">
          <h4>Total Actual</h4>
          <div className="big-value">{summary.totalActual.toFixed(0)}</div>
        </div>
        <div className="summary-card">
          <h4>Overall Variance</h4>
          <div className="big-value">{summary.totalVariance.toFixed(0)}</div>
        </div>
        <div className="summary-card">
          <h4>Avg Productivity</h4>
          <div className="big-value">{summary.avgProductivity.toFixed(1)}%</div>
        </div>
      </div>
    </div>
  );
};
