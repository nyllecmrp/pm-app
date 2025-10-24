import React, { useState, useEffect } from 'react';
import { Template } from '../types';
import { useProductionStore } from '../store/productionStore';

export const Templates: React.FC = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [templateName, setTemplateName] = useState('');

  const {
    line,
    planTarget,
    achievementFactor,
    requiredManpower,
    actualManpower,
    startTime,
    endTime,
    breakTime,
    setFormField,
  } = useProductionStore();

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = () => {
    try {
      const saved = localStorage.getItem('production_templates');
      if (saved) {
        setTemplates(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Failed to load templates:', error);
    }
  };

  const saveTemplate = () => {
    if (!templateName.trim()) {
      alert('Please enter a template name');
      return;
    }

    const newTemplate: Template = {
      id: Date.now(),
      name: templateName,
      line,
      planTarget,
      achievementFactor,
      requiredManpower,
      actualManpower,
      startTime,
      endTime,
      breakTime,
      createdAt: new Date().toISOString(),
    };

    const updatedTemplates = [...templates, newTemplate];
    setTemplates(updatedTemplates);
    localStorage.setItem('production_templates', JSON.stringify(updatedTemplates));

    setTemplateName('');
    setShowSaveDialog(false);
    alert('Template saved successfully!');
  };

  const loadTemplate = (template: Template) => {
    setFormField('line', template.line);
    setFormField('planTarget', template.planTarget);
    setFormField('achievementFactor', template.achievementFactor);
    setFormField('requiredManpower', template.requiredManpower);
    setFormField('actualManpower', template.actualManpower);
    setFormField('startTime', template.startTime);
    setFormField('endTime', template.endTime);
    setFormField('breakTime', template.breakTime);

    setIsOpen(false);
    alert('Template loaded successfully!');
  };

  const deleteTemplate = (id: number) => {
    if (confirm('Are you sure you want to delete this template?')) {
      const updatedTemplates = templates.filter(t => t.id !== id);
      setTemplates(updatedTemplates);
      localStorage.setItem('production_templates', JSON.stringify(updatedTemplates));
      alert('Template deleted successfully!');
    }
  };

  return (
    <>
      <button className="btn btn-secondary" onClick={() => setIsOpen(true)}>
        📝 Templates
      </button>

      {/* Templates Modal */}
      {isOpen && (
        <div className="modal-overlay" onClick={() => setIsOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Production Templates</h2>
              <button className="modal-close" onClick={() => setIsOpen(false)}>
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div style={{ marginBottom: '20px' }}>
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowSaveDialog(true)}
                  style={{ width: '100%' }}
                >
                  💾 Save Current as Template
                </button>
              </div>

              {showSaveDialog && (
                <div className="template-save-dialog">
                  <input
                    type="text"
                    placeholder="Enter template name (e.g., Morning Shift)"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    className="template-name-input"
                    onKeyPress={(e) => e.key === 'Enter' && saveTemplate()}
                  />
                  <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    <button className="btn" onClick={saveTemplate}>
                      Save
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => {
                        setShowSaveDialog(false);
                        setTemplateName('');
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {templates.length === 0 ? (
                <div className="empty-state">
                  <p>No templates saved yet. Save your current settings as a template!</p>
                </div>
              ) : (
                <div className="templates-list">
                  {templates.map((template) => (
                    <div key={template.id} className="template-card">
                      <div className="template-header">
                        <div>
                          <h3>{template.name}</h3>
                          <p className="template-line">{template.line || 'No line specified'}</p>
                        </div>
                        <div className="template-actions">
                          <button
                            className="btn-small btn-primary"
                            onClick={() => loadTemplate(template)}
                          >
                            Load
                          </button>
                          <button
                            className="btn-small btn-danger-small"
                            onClick={() => template.id && deleteTemplate(template.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>

                      <div className="template-details">
                        <div className="detail-row">
                          <span className="detail-label">Plan Target:</span>
                          <span>{template.planTarget}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Achievement:</span>
                          <span>{template.achievementFactor}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Manpower:</span>
                          <span>{template.actualManpower}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Time:</span>
                          <span>{template.startTime} - {template.endTime}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Break:</span>
                          <span>{template.breakTime}h</span>
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
