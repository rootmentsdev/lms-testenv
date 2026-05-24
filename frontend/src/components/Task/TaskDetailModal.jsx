import { useEffect } from 'react';
import './TaskDetailModal.css';

const PRIORITY_COLOR = {
  High: '#f59e0b',
  Medium: '#3b82f6',
  Low: '#22c55e',
  Not: '#9ca3af',
};

const STATUS_CLASS = {
  COMPLETED: 'task-detail-status--completed',
  'IN PROGRESS': 'task-detail-status--in-progress',
  PENDING: 'task-detail-status--pending',
  OVERDUE: 'task-detail-status--overdue',
};

const DetailField = ({ label, primary, secondary, children }) => (
  <div className="task-detail-field">
    <div className="task-detail-field__label">{label}</div>
    {children || (
      <>
        <div className="task-detail-field__primary">{primary}</div>
        {secondary ? <div className="task-detail-field__secondary">{secondary}</div> : null}
      </>
    )}
  </div>
);

const TaskDetailModal = ({ task, onClose }) => {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  if (!task) return null;

  const categoryLine = task.categoryDetail
    ? `${task.category} | ${task.categoryDetail}`
    : task.category;

  const desc = task.description && task.description !== '—' ? task.description : '—';

  return (
    <div className="task-detail-overlay" onClick={onClose} role="presentation">
      <div
        className="task-detail-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-detail-title"
      >
        <button type="button" className="task-detail-back" onClick={onClose}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back
        </button>

        <h2 id="task-detail-title" className="task-detail-title">{task.title}</h2>
        <p className="task-detail-category">{categoryLine}</p>

        <div className="task-detail-divider" />

        <div className="task-detail-row task-detail-row--2">
          <DetailField
            label="ASSIGNED BY :"
            primary={task.assignedBy}
            secondary={task.assignedByRole}
          />
          <DetailField
            label="ASSIGNED DATE :"
            primary={task.assignedDate}
            secondary={task.assignedTime}
          />
        </div>

        <div className="task-detail-divider" />

        <div className="task-detail-row task-detail-row--3">
          <DetailField
            label="ASSIGNED TO"
            primary={task.assignee}
            secondary={task.assigneeRole}
          />
          <DetailField
            label="START DATE :"
            primary={task.startDateDetail || task.startDate}
            secondary={task.startTime}
          />
          <DetailField
            label="END DATE :"
            primary={task.endDateDetail || task.endDate}
            secondary={task.endTime}
          />
        </div>

        <div className="task-detail-divider" />

        <div className="task-detail-row task-detail-row--3">
          <DetailField label="DESCRIPTION" primary={desc} />
          <DetailField label="PRIORITY">
            <div className="task-detail-priority">
              <span
                className="task-detail-priority-dot"
                style={{ background: PRIORITY_COLOR[task.priority] || '#9ca3af' }}
              />
              {task.priority}
            </div>
          </DetailField>
          <DetailField label="STATUS">
            <span className={`task-detail-status ${STATUS_CLASS[task.status] || ''}`}>
              {task.status}
            </span>
          </DetailField>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailModal;
