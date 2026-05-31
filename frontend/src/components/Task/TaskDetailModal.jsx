import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import baseUrl from '../../api/api';
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
  'ON HOLD': 'task-detail-status--on-hold',
  'UNDER REVIEW': 'task-detail-status--under-review',
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

const TaskDetailModal = ({ task, onClose, onRefresh }) => {
  const user = useSelector((state) => state.auth.user);
  const isAssignedToMe = task && task.assignedTo === user?.userId;

  const [selectedFile, setSelectedFile] = useState(null);
  const [assigneesList, setAssigneesList] = useState([]);
  const [selectedAssignee, setSelectedAssignee] = useState('');
  const [loadingAssignees, setLoadingAssignees] = useState(false);
  const [updating, setUpdating] = useState(false);

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

  useEffect(() => {
    if (isAssignedToMe && task && task.status !== 'COMPLETED' && task.status !== 'UNDER REVIEW') {
      const fetchAssignees = async () => {
        setLoadingAssignees(true);
        try {
          const token = localStorage.getItem('token');
          const res = await fetch(`${baseUrl.baseUrl}api/task/assignees`, {
            headers: {
              ...(token && { Authorization: `Bearer ${token}` }),
            },
          });
          const json = await res.json();
          if (json.success) {
            setAssigneesList(json.data || []);
          }
        } catch (err) {
          console.error('Error fetching assignees:', err);
        } finally {
          setLoadingAssignees(false);
        }
      };
      fetchAssignees();
    }
  }, [isAssignedToMe, task]);

  if (!task) return null;

  const categoryLine = task.categoryDetail
    ? `${task.category} | ${task.categoryDetail}`
    : task.category;

  const desc = task.description && task.description !== '—' ? task.description : '—';

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const getBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmitForReview = async () => {
    if (!selectedFile) {
      toast.error('Proof file is required to submit for review');
      return;
    }
    setUpdating(true);
    try {
      const base64 = await getBase64(selectedFile);
      const token = localStorage.getItem('token');
      const res = await fetch(`${baseUrl.baseUrl}api/task/${task.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          status: 'UNDER REVIEW',
          fileAttachment: {
            name: selectedFile.name,
            base64: base64,
          },
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || 'Failed to submit review');
      }
      toast.success('Task submitted for review successfully!');
      if (onRefresh) onRefresh();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to submit review');
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    setUpdating(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${baseUrl.baseUrl}api/task/${task.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || 'Failed to update status');
      }
      toast.success(`Task status updated to ${newStatus}`);
      if (onRefresh) onRefresh();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const handleReassign = async () => {
    if (!selectedAssignee) {
      toast.error('Please select an assignee');
      return;
    }
    const option = assigneesList.find((opt) => opt.value === selectedAssignee);
    if (!option) return;
    setUpdating(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${baseUrl.baseUrl}api/task/${task.id}/reassign`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          assignedTo: selectedAssignee,
          assignedToLabel: option.label,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || 'Failed to reassign task');
      }
      toast.success('Task reassigned successfully!');
      if (onRefresh) onRefresh();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to reassign task');
    } finally {
      setUpdating(false);
    }
  };

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

        {task.attachment ? (
          <>
            <div className="task-detail-divider" />
            <div className="task-detail-row">
              <DetailField label="ATTACHMENT">
                <a
                  href={`${baseUrl.baseUrl.replace(/\/$/, '')}${task.attachment}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#3b82f6', textDecoration: 'underline', fontWeight: 500 }}
                >
                  {task.attachmentName || 'View Attachment'}
                </a>
              </DetailField>
            </div>
          </>
        ) : null}

        {task.reviewAttachment ? (
          <>
            <div className="task-detail-divider" />
            <div className="task-detail-row">
              <DetailField label="REVIEW PROOF">
                <a
                  href={`${baseUrl.baseUrl.replace(/\/$/, '')}${task.reviewAttachment}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#7e22ce', textDecoration: 'underline', fontWeight: 500 }}
                >
                  {task.reviewAttachmentName || 'View Review Proof'}
                </a>
              </DetailField>
            </div>
          </>
        ) : null}

        {isAssignedToMe && task.status !== 'COMPLETED' && task.status !== 'UNDER REVIEW' ? (
          <>
            <div className="task-detail-divider" />
            <div className="task-detail-actions-panel">
              <h3 className="task-detail-actions-title">Task Action Control Panel</h3>
              
              <div className="task-detail-actions-row">
                <div className="task-detail-action-group">
                  <div className="task-detail-field__label">Update Status</div>
                  <div className="task-detail-status-buttons">
                    <button
                      type="button"
                      className="task-detail-action-btn task-detail-btn-inprogress"
                      onClick={() => handleUpdateStatus('IN PROGRESS')}
                      disabled={updating}
                    >
                      In Progress
                    </button>
                    <button
                      type="button"
                      className="task-detail-action-btn task-detail-btn-onhold"
                      onClick={() => handleUpdateStatus('ON HOLD')}
                      disabled={updating}
                    >
                      On Hold
                    </button>
                  </div>
                </div>

                <div className="task-detail-action-group">
                  <div className="task-detail-field__label">Submit for Review</div>
                  <div className="task-detail-review-form">
                    <input
                      type="file"
                      id="review-attachment-file"
                      onChange={handleFileChange}
                      style={{ display: 'none' }}
                    />
                    <label htmlFor="review-attachment-file" className="task-detail-file-label">
                      {selectedFile ? selectedFile.name : 'Choose Proof File...'}
                    </label>
                    <button
                      type="button"
                      className="task-detail-action-btn task-detail-btn-submit-review"
                      onClick={handleSubmitForReview}
                      disabled={updating || !selectedFile}
                    >
                      Submit
                    </button>
                  </div>
                </div>
              </div>

              <div className="task-detail-actions-row mt-4">
                <div className="task-detail-action-group" style={{ width: '100%' }}>
                  <div className="task-detail-field__label">Reassign Task</div>
                  <div className="task-detail-reassign-form">
                    <select
                      value={selectedAssignee}
                      onChange={(e) => setSelectedAssignee(e.target.value)}
                      className="task-detail-select"
                      disabled={loadingAssignees || updating}
                    >
                      <option value="">Select Assignee...</option>
                      {assigneesList.map((opt) => (
                        <option key={opt.value} value={opt.value} disabled={opt.type === 'group'}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className="task-detail-action-btn task-detail-btn-reassign"
                      onClick={handleReassign}
                      disabled={updating || !selectedAssignee}
                    >
                      Reassign
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default TaskDetailModal;
