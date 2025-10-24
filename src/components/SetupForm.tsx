import React from 'react';
import { useProductionStore } from '../store/productionStore';

export const SetupForm: React.FC = () => {
  const {
    line,
    date,
    planTarget,
    achievementFactor,
    requiredManpower,
    actualManpower,
    startTime,
    endTime,
    breakTime,
    setFormField,
  } = useProductionStore();

  return (
    <>
      <h2 className="section-title">Setup Information</h2>
      <div className="input-grid">
        <div className="input-group">
          <label>Production Line</label>
          <input
            type="text"
            className="yellow-input"
            placeholder="Enter line name"
            value={line}
            onChange={(e) => setFormField('line', e.target.value)}
          />
        </div>

        <div className="input-group">
          <label>Date</label>
          <input
            type="date"
            className="yellow-input"
            value={date}
            onChange={(e) => setFormField('date', e.target.value)}
          />
        </div>

        <div className="input-group">
          <label>Daily Plan Target</label>
          <input
            type="number"
            placeholder="e.g., 103"
            value={planTarget === 0 ? '' : planTarget}
            onChange={(e) => setFormField('planTarget', parseFloat(e.target.value) || 0)}
            onFocus={(e) => e.target.select()}
          />
        </div>

        <div className="input-group">
          <label>Achievement Factor</label>
          <input
            type="number"
            step="0.01"
            placeholder="e.g., 1.35"
            value={achievementFactor === 0 ? '' : achievementFactor}
            onChange={(e) => setFormField('achievementFactor', parseFloat(e.target.value) || 0)}
            onFocus={(e) => e.target.select()}
          />
        </div>
      </div>

      <h2 className="section-title">Time & Manpower Settings</h2>
      <div className="input-grid">
        <div className="input-group">
          <label>Required Manpower</label>
          <input
            type="number"
            step="0.01"
            placeholder="e.g., 16.33"
            value={requiredManpower === 0 ? '' : requiredManpower}
            onChange={(e) => setFormField('requiredManpower', parseFloat(e.target.value) || 0)}
            onFocus={(e) => e.target.select()}
          />
        </div>

        <div className="input-group">
          <label>Actual Manpower</label>
          <input
            type="number"
            step="0.01"
            placeholder="e.g., 16.33"
            value={actualManpower === 0 ? '' : actualManpower}
            onChange={(e) => setFormField('actualManpower', parseFloat(e.target.value) || 0)}
            onFocus={(e) => e.target.select()}
          />
        </div>

        <div className="input-group">
          <label>Start Time</label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setFormField('startTime', e.target.value)}
          />
        </div>

        <div className="input-group">
          <label>End Time</label>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setFormField('endTime', e.target.value)}
          />
        </div>

        <div className="input-group">
          <label>Break Time (hours)</label>
          <input
            type="number"
            step="0.01"
            placeholder="e.g., 1.42"
            value={breakTime === 0 ? '' : breakTime}
            onChange={(e) => setFormField('breakTime', parseFloat(e.target.value) || 0)}
            onFocus={(e) => e.target.select()}
          />
        </div>
      </div>
    </>
  );
};
