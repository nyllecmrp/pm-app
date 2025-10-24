import { useEffect } from 'react';
import { Header } from './components/Header';
import { SetupForm } from './components/SetupForm';
import { MetricsDisplay } from './components/MetricsDisplay';
import { TimeTable } from './components/TimeTable';
import { Summary } from './components/Summary';
import { SessionsHistory } from './components/SessionsHistory';
import { Templates } from './components/Templates';
import { QuickFill } from './components/QuickFill';
import { useProductionStore } from './store/productionStore';
import { dbService } from './services/database';
import './App.css';

function App() {
  const store = useProductionStore();
  const { calculateMetrics, generateTimeTable, resetForm, line, date, metrics, timeSlots, currentSessionId } = store;

  useEffect(() => {
    // Initialize database connection
    dbService.connect();

    // Load auto-saved draft if exists
    const loadDraft = () => {
      try {
        const draft = localStorage.getItem('production_draft');
        if (draft) {
          const parsed = JSON.parse(draft);
          // Only load if draft is from today
          const draftDate = new Date(parsed.timestamp);
          const today = new Date();
          if (draftDate.toDateString() === today.toDateString()) {
            if (confirm('Found an auto-saved draft from today. Would you like to restore it?')) {
              Object.keys(parsed.data).forEach(key => {
                store.setFormField(key, parsed.data[key]);
              });
            }
          }
        }
      } catch (error) {
        console.error('Failed to load draft:', error);
      }
    };

    loadDraft();
  }, []);

  // Auto-save draft every 2 minutes
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      const state = useProductionStore.getState();
      if (state.line || state.planTarget > 0 || state.timeSlots.length > 0) {
        const draft = {
          timestamp: new Date().toISOString(),
          data: {
            line: state.line,
            date: state.date,
            planTarget: state.planTarget,
            achievementFactor: state.achievementFactor,
            requiredManpower: state.requiredManpower,
            actualManpower: state.actualManpower,
            startTime: state.startTime,
            endTime: state.endTime,
            breakTime: state.breakTime,
          }
        };
        localStorage.setItem('production_draft', JSON.stringify(draft));
        console.log('✅ Auto-saved draft');
      }
    }, 120000); // 2 minutes

    return () => clearInterval(autoSaveInterval);
  }, []);

  const handleCalculateMetrics = () => {
    console.log('Calculate Metrics button clicked');
    calculateMetrics();
  };

  const handleGenerateTimeTable = () => {
    console.log('Generate Time Table button clicked');
    generateTimeTable();
  };

  const handleSaveSession = async () => {
    if (!line || !date || !metrics || timeSlots.length === 0) {
      alert('Please fill in all required fields and generate the time table first.');
      return;
    }

    const session = {
      id: currentSessionId,
      line,
      date,
      planTarget: useProductionStore.getState().planTarget,
      achievementFactor: useProductionStore.getState().achievementFactor,
      requiredManpower: useProductionStore.getState().requiredManpower,
      actualManpower: useProductionStore.getState().actualManpower,
      startTime: useProductionStore.getState().startTime,
      endTime: useProductionStore.getState().endTime,
      breakTime: useProductionStore.getState().breakTime,
      metrics,
      timeSlots,
    };

    const sessionId = await dbService.saveSession(session);
    if (sessionId !== null) {
      if (currentSessionId) {
        alert(`Session updated successfully!`);
      } else {
        alert(`Session saved successfully with ID: ${sessionId}`);
        store.setCurrentSessionId(sessionId);
      }
    } else {
      alert('Session saved to local storage (database not configured)');
    }
  };

  return (
    <div className="container">
      <Header />
      <div className="form-section">
        <SetupForm />
        <MetricsDisplay />

        <div className="button-group">
          <button className="btn" onClick={handleCalculateMetrics}>
            Calculate Metrics
          </button>
          <button className="btn btn-secondary" onClick={handleGenerateTimeTable}>
            Generate Time Table
          </button>
          <button className="btn btn-secondary" onClick={handleSaveSession}>
            💾 Save Session
          </button>
          <SessionsHistory />
          <Templates />
          <QuickFill />
          <button className="btn btn-danger" onClick={resetForm}>
            🔄 Reset Form
          </button>
        </div>

        <TimeTable />
        <Summary />
      </div>
    </div>
  );
}

export default App;
