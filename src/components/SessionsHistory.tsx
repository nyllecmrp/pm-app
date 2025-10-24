import React, { useEffect, useState } from 'react';
import { dbService } from '../services/database';
import { ProductionSession } from '../types';
import { useProductionStore } from '../store/productionStore';

export const SessionsHistory: React.FC = () => {
  const [sessions, setSessions] = useState<ProductionSession[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<ProductionSession[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [lineFilter, setLineFilter] = useState('');

  const {
    setFormField,
    calculateMetrics,
    generateTimeTable,
  } = useProductionStore();

  const loadSessions = async () => {
    setLoading(true);
    try {
      const data = await dbService.getSessions(100);
      setSessions(data);
      setFilteredSessions(data);
    } catch (error) {
      console.error('Failed to load sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadSessions();
    }
  }, [isOpen]);

  // Filter sessions based on search and filters
  useEffect(() => {
    let filtered = [...sessions];

    // Search by line name
    if (searchTerm) {
      filtered = filtered.filter(session =>
        session.line.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by date
    if (dateFilter) {
      filtered = filtered.filter(session => session.date === dateFilter);
    }

    // Filter by line
    if (lineFilter) {
      filtered = filtered.filter(session => session.line === lineFilter);
    }

    setFilteredSessions(filtered);
  }, [searchTerm, dateFilter, lineFilter, sessions]);

  // Get unique production lines for filter dropdown
  const uniqueLines = Array.from(new Set(sessions.map(s => s.line).filter(Boolean)));

  const loadSession = (session: ProductionSession) => {
    // Set the current session ID for update tracking
    const { setCurrentSessionId } = useProductionStore.getState();
    setCurrentSessionId(session.id || null);

    // Load form data
    setFormField('line', session.line);
    setFormField('date', session.date);
    setFormField('planTarget', session.planTarget);
    setFormField('achievementFactor', session.achievementFactor);
    setFormField('requiredManpower', session.requiredManpower);
    setFormField('actualManpower', session.actualManpower);
    setFormField('startTime', session.startTime);
    setFormField('endTime', session.endTime);
    setFormField('breakTime', session.breakTime);

    // Calculate metrics
    setTimeout(() => {
      calculateMetrics();
    }, 0);

    // Generate time table and load time slots
    setTimeout(() => {
      generateTimeTable();

      // Load time slots
      const store = useProductionStore.getState();
      store.timeSlots = session.timeSlots;
      store.updateCalculations();
    }, 100);

    setIsOpen(false);
    alert('Session loaded successfully!');
  };

  const deleteSession = async (id: number) => {
    if (confirm('Are you sure you want to delete this session?')) {
      const success = await dbService.deleteSession(id);
      if (success) {
        alert('Session deleted successfully!');
        loadSessions();
      } else {
        alert('Failed to delete session.');
      }
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <>
      <button className="btn btn-secondary" onClick={() => setIsOpen(true)}>
        📋 View History
      </button>

      {isOpen && (
        <div className="modal-overlay" onClick={() => setIsOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Production Sessions History</h2>
              <button className="modal-close" onClick={() => setIsOpen(false)}>
                ✕
              </button>
            </div>

            <div className="modal-body">
              {/* Search and Filter Controls */}
              {sessions.length > 0 && !loading && (
                <div className="search-filter-container">
                  <input
                    type="text"
                    placeholder="🔍 Search by line name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                  />
                  <div className="filter-row">
                    <select
                      value={lineFilter}
                      onChange={(e) => setLineFilter(e.target.value)}
                      className="filter-select"
                    >
                      <option value="">All Lines</option>
                      {uniqueLines.map((line) => (
                        <option key={line} value={line}>
                          {line}
                        </option>
                      ))}
                    </select>
                    <input
                      type="date"
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                      className="filter-date"
                      placeholder="Filter by date"
                    />
                    {(searchTerm || dateFilter || lineFilter) && (
                      <button
                        className="btn-small btn-secondary"
                        onClick={() => {
                          setSearchTerm('');
                          setDateFilter('');
                          setLineFilter('');
                        }}
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <p className="filter-results">
                    Showing {filteredSessions.length} of {sessions.length} sessions
                  </p>
                </div>
              )}

              {loading ? (
                <div className="loading">Loading sessions...</div>
              ) : sessions.length === 0 ? (
                <div className="empty-state">
                  <p>No saved sessions yet. Save your first session to see it here.</p>
                </div>
              ) : filteredSessions.length === 0 ? (
                <div className="empty-state">
                  <p>No sessions match your search criteria.</p>
                </div>
              ) : (
                <div className="sessions-list">
                  {filteredSessions.map((session) => (
                    <div key={session.id} className="session-card">
                      <div className="session-header">
                        <div>
                          <h3>{session.line || 'Unnamed Line'}</h3>
                          <p className="session-date">{formatDate(session.date)}</p>
                        </div>
                        <div className="session-actions">
                          <button
                            className="btn-small btn-primary"
                            onClick={() => loadSession(session)}
                          >
                            Load
                          </button>
                          <button
                            className="btn-small btn-danger-small"
                            onClick={() => session.id && deleteSession(session.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>

                      <div className="session-details">
                        <div className="detail-row">
                          <span className="detail-label">Time:</span>
                          <span>{session.startTime} - {session.endTime}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Plan Target:</span>
                          <span>{session.planTarget}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Manpower:</span>
                          <span>{session.actualManpower}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Time Slots:</span>
                          <span>{session.timeSlots.length}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Saved:</span>
                          <span className="detail-date">{formatDateTime(session.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setIsOpen(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
