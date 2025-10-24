import React from 'react';
import { useProductionStore } from '../store/productionStore';

export const TimeTable: React.FC = () => {
  const { timeSlots, showTimeTable, updateTimeSlot, addTimeSlot, removeLastTimeSlot } = useProductionStore();

  if (!showTimeTable) return null;

  return (
    <div className="time-table">
      <h3 className="section-title">Hourly Production Tracking</h3>
      <div className="button-group">
        <button className="btn" onClick={addTimeSlot}>
          ➕ Add Time Slot
        </button>
        <button className="btn btn-danger" onClick={removeLastTimeSlot}>
          ➖ Remove Last Row
        </button>
      </div>
      <div style={{ overflowX: 'auto', marginTop: '20px' }}>
        <table>
          <thead>
            <tr>
              <th>Start Time</th>
              <th>End Time</th>
              <th>Working Time (hrs)</th>
              <th>Plan</th>
              <th>Plan Cumulative</th>
              <th>Actual</th>
              <th>Variance (+/-)</th>
              <th>Productivity Rate (%)</th>
            </tr>
          </thead>
          <tbody>
            {timeSlots.map((slot) => {
              // Parse the time slot to get start and end times
              const [startTime = '', endTime = ''] = slot.timeSlot.split('~').map(t => t.trim());

              return (
                <tr key={slot.id}>
                  <td>
                    <input
                      type="time"
                      className="time-input"
                      value={startTime}
                      onChange={(e) => {
                        const newTimeSlot = `${e.target.value} ~ ${endTime}`;
                        updateTimeSlot(slot.id, 'timeSlot', newTimeSlot);
                      }}
                    />
                  </td>
                  <td>
                    <input
                      type="time"
                      className="time-input"
                      value={endTime}
                      onChange={(e) => {
                        const newTimeSlot = `${startTime} ~ ${e.target.value}`;
                        updateTimeSlot(slot.id, 'timeSlot', newTimeSlot);
                      }}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      className="number-input"
                      step="0.01"
                      value={slot.workingTime === 0 ? '' : slot.workingTime}
                      placeholder="0"
                      onChange={(e) => updateTimeSlot(slot.id, 'workingTime', parseFloat(e.target.value) || 0)}
                      onFocus={(e) => e.target.select()}
                    />
                  </td>
                  <td className="calculated">{slot.plan.toFixed(2)}</td>
                  <td className="calculated">{slot.planCumulative.toFixed(2)}</td>
                  <td>
                    <input
                      type="number"
                      className="number-input"
                      value={slot.actual === 0 ? '' : slot.actual}
                      placeholder="0"
                      onChange={(e) => updateTimeSlot(slot.id, 'actual', parseFloat(e.target.value) || 0)}
                      onFocus={(e) => e.target.select()}
                    />
                  </td>
                  <td className={`calculated ${slot.variance >= 0 ? 'variance-positive' : 'variance-negative'}`}>
                    {slot.variance.toFixed(2)}
                  </td>
                  <td className="calculated">{slot.productivityRate.toFixed(2)}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {timeSlots.length === 0 && (
        <div className="empty-state">
          <p>No time slots yet. Click "Add Time Slot" to get started.</p>
        </div>
      )}
    </div>
  );
};
