import { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import SideNav from '../../components/SideNav/SideNav';
import TaskDetailModal from '../../components/Task/TaskDetailModal';
import { fetchTasks } from '../../features/task/taskApi';
import baseUrl from '../../api/api';
import './TaskManagement.css';

const PAGE_SIZE = 10;

const PRIORITY_COLOR = {
  High: '#ef4444',
  Medium: '#3b82f6',
  Low: '#22c55e',
  Not: '#9ca3af',
};

const STATUS_CLASS = {
  COMPLETED: 'task-mgmt-status--completed',
  'IN PROGRESS': 'task-mgmt-status--in-progress',
  PENDING: 'task-mgmt-status--pending',
  OVERDUE: 'task-mgmt-status--overdue',
  'ON HOLD': 'task-mgmt-status--on-hold',
  'UNDER REVIEW': 'task-mgmt-status--under-review',
};

const StackCell = ({ primary, secondary }) => (
  <div className="task-mgmt-cell-stack">
    <div className="primary" title={primary}>{primary}</div>
    <div className="secondary">{secondary}</div>
  </div>
);

const DateCell = ({ date, time }) => (
  <div className="task-mgmt-cell-stack">
    <div className="primary">{date}</div>
    <div className="secondary">{time}</div>
  </div>
);

const SlideToComplete = ({ onComplete }) => {
  const [position, setPosition] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [completed, setCompleted] = useState(false);
  const trackRef = useRef(null);
  const startXRef = useRef(0);

  const handleStart = (clientX) => {
    if (completed) return;
    setIsDragging(true);
    startXRef.current = clientX - position;
  };

  const handleMove = (clientX) => {
    if (!isDragging) return;
    const track = trackRef.current;
    if (!track) return;
    const maxDelta = 146; // 180 (track width) - 32 (handle width) - 2 (borders)
    let newX = clientX - startXRef.current;
    if (newX < 0) newX = 0;
    if (newX > maxDelta) newX = maxDelta;
    setPosition(newX);
  };

  const handleEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    const maxDelta = 146;
    if (position >= maxDelta * 0.9) {
      setPosition(maxDelta);
      setCompleted(true);
      onComplete();
    } else {
      setPosition(0);
    }
  };

  useEffect(() => {
    const handleTouchMove = (e) => {
      if (isDragging) {
        handleMove(e.touches[0].clientX);
      }
    };
    const handleTouchEnd = () => {
      if (isDragging) {
        handleEnd();
      }
    };
    const handleMouseMove = (e) => {
      if (isDragging) {
        handleMove(e.clientX);
      }
    };
    const handleMouseUp = () => {
      if (isDragging) {
        handleEnd();
      }
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleTouchEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, position]);

  return (
    <div
      ref={trackRef}
      className={`slide-to-complete-track ${completed ? 'completed' : ''}`}
    >
      <div
        className="slide-to-complete-fill"
        style={{
          width: completed ? '100%' : `${position + 16}px`,
          transition: isDragging ? 'none' : 'width 0.2s ease',
        }}
      />
      <div
        className="slide-to-complete-handle"
        onMouseDown={(e) => handleStart(e.clientX)}
        onTouchStart={(e) => handleStart(e.touches[0].clientX)}
        style={{
          left: `${position + 1}px`,
          transition: isDragging ? 'none' : 'left 0.2s ease',
        }}
      >
        {completed ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="13 17 18 12 13 7" />
            <polyline points="6 17 11 12 6 7" />
          </svg>
        )}
      </div>
      <span className="slide-to-complete-text">
        {completed ? 'Completed' : 'Slide to Complete'}
      </span>
    </div>
  );
};

const TaskManagement = () => {
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    if (!document.getElementById('dm-sans-font')) {
      const link = document.createElement('link');
      link.id = 'dm-sans-font';
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap';
      document.head.appendChild(link);
    }
  }, []);

  const [tasks, setTasks] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [selectedTask, setSelectedTask] = useState(null);
  const [activeTab, setActiveTab] = useState('tasks');

  const loadTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [tasksRes, requestsRes] = await Promise.all([
        fetchTasks({
          search: search.trim(),
          category: categoryFilter,
          priority: priorityFilter,
          status: statusFilter,
        }),
        fetchTasks({
          status: 'UNDER REVIEW',
        })
      ]);

      setTasks(tasksRes.data || []);
      const userRequests = (requestsRes.data || []).filter(
        (t) => t.createdBy === user?.userId
      );
      setRequests(userRequests);
    } catch (err) {
      setError(err.message);
      setTasks([]);
      setRequests([]);
      toast.error(err.message || 'Could not load tasks');
    } finally {
      setLoading(false);
    }
  }, [search, categoryFilter, priorityFilter, statusFilter, user?.userId]);

  useEffect(() => {
    const timer = setTimeout(loadTasks, 300);
    return () => clearTimeout(timer);
  }, [loadTasks]);

  const categories = useMemo(() => {
    const set = new Set(tasks.map((t) => t.category?.split(' / ')[0]?.trim() || t.category).filter(Boolean));
    return ['All', ...Array.from(set).sort()];
  }, [tasks]);

  const filteredRequests = useMemo(() => {
    return requests.filter((task) => {
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesSearch = [
          task.title, task.id, task.assignee, task.categorySub, task.category, task.description,
        ].some((v) => String(v).toLowerCase().includes(q));
        if (!matchesSearch) return false;
      }
      if (categoryFilter && categoryFilter !== 'All') {
        if (!task.category.toLowerCase().includes(categoryFilter.toLowerCase())) return false;
      }
      if (priorityFilter && priorityFilter !== 'All') {
        if (task.priority !== priorityFilter) return false;
      }
      return true;
    });
  }, [requests, search, categoryFilter, priorityFilter]);

  useEffect(() => {
    setPage(1);
  }, [activeTab]);

  const totalCount = activeTab === 'tasks' ? tasks.length : filteredRequests.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = tasks.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const pageItemsRequests = filteredRequests.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const showingCount = String(
    activeTab === 'tasks' ? pageItems.length : pageItemsRequests.length
  ).padStart(2, '0');

  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [page, totalPages]);

  const handleCompleteTask = async (taskId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${baseUrl.baseUrl}api/task/${taskId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ status: 'COMPLETED' }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || 'Failed to complete task');
      }
      toast.success('Task marked as COMPLETED!');
      loadTasks();
    } catch (err) {
      toast.error(err.message || 'Failed to update task status');
      loadTasks();
    }
  };

  return (
    <div className="task-mgmt-page">
      <SideNav />

      <div className="task-mgmt-content">
        <div className="task-mgmt-header">
          <div>
            <h1 className="task-mgmt-title task-mgmt-title--heavy">Task Management</h1>
            <p className="task-mgmt-subtitle">Track and manage all operational tasks across stores</p>
          </div>
          <Link to="/task/create" className="task-mgmt-new-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New Task
          </Link>
        </div>

        <div className="task-mgmt-tabs">
          <button
            type="button"
            className={`task-mgmt-tab-btn ${activeTab === 'tasks' ? 'active' : ''}`}
            onClick={() => setActiveTab('tasks')}
          >
            Tasks
            <span className="task-mgmt-tab-count">{tasks.length}</span>
          </button>
          <button
            type="button"
            className={`task-mgmt-tab-btn ${activeTab === 'requests' ? 'active' : ''}`}
            onClick={() => setActiveTab('requests')}
          >
            Requests
            <span className="task-mgmt-tab-count">{requests.length}</span>
          </button>
        </div>

        <div className="task-mgmt-toolbar">
          <div className="task-mgmt-search">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search by task, ID, assignee, store"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>

          <div className="task-mgmt-filter">
            <label>Categories :</label>
            <select value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="task-mgmt-filter">
            <label>Priority :</label>
            <select value={priorityFilter} onChange={(e) => { setPriorityFilter(e.target.value); setPage(1); }}>
              {['All', 'High', 'Medium', 'Low', 'Not'].map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          {activeTab === 'tasks' && (
            <div className="task-mgmt-filter">
              <label>Status :</label>
              <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
                {['All', 'COMPLETED', 'IN PROGRESS', 'PENDING', 'OVERDUE', 'ON HOLD', 'UNDER REVIEW'].map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          )}
        </div>

        <div className="task-mgmt-card">
          <div className="task-mgmt-table-wrap">
            <table className="task-mgmt-table">
              <thead>
                {activeTab === 'tasks' ? (
                  <tr>
                    <th>Task Title</th>
                    <th>Category</th>
                    <th>Assigned To</th>
                    <th>Priority</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>View</th>
                  </tr>
                ) : (
                  <tr>
                    <th>Task Title</th>
                    <th>Category</th>
                    <th>Assigned To</th>
                    <th>Priority</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Description</th>
                    <th>Proof</th>
                    <th>Action</th>
                  </tr>
                )}
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={9} style={{ textAlign: 'center', color: '#9ca3af', padding: '32px' }}>
                      Loading tasks…
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={9} style={{ textAlign: 'center', color: '#ef4444', padding: '32px' }}>
                      {error}
                      <button type="button" onClick={loadTasks} style={{ marginLeft: 12, textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', color: '#111827' }}>
                        Retry
                      </button>
                    </td>
                  </tr>
                ) : (activeTab === 'tasks' ? pageItems : pageItemsRequests).length === 0 ? (
                  <tr>
                    <td colSpan={9} style={{ textAlign: 'center', color: '#9ca3af', padding: '32px' }}>
                      {activeTab === 'tasks'
                        ? 'No tasks found. Create one with + New Task.'
                        : 'No pending review requests.'}
                    </td>
                  </tr>
                ) : (
                  (activeTab === 'tasks' ? pageItems : pageItemsRequests).map((task) => (
                    <tr key={task.id}>
                      <td className="task-mgmt-cell-title">{task.title}</td>
                      <td><StackCell primary={task.category} secondary={task.categorySub} /></td>
                      <td><StackCell primary={task.assignee} secondary={task.assigneeSub} /></td>
                      <td>
                        <span className="task-mgmt-priority">
                          <span
                            className="task-mgmt-priority-dot"
                            style={{ background: PRIORITY_COLOR[task.priority] || '#9ca3af' }}
                          />
                          {task.priority}
                        </span>
                      </td>
                      <td><DateCell date={task.startDate} time={task.startTime} /></td>
                      <td><DateCell date={task.endDate} time={task.endTime} /></td>
                      <td className="task-mgmt-desc">{task.description}</td>
                      {activeTab === 'tasks' ? (
                        <>
                          <td>
                            <span className={`task-mgmt-status ${STATUS_CLASS[task.status] || ''}`}>
                              {task.status}
                            </span>
                          </td>
                          <td>
                            <button
                              type="button"
                              className="task-mgmt-view"
                              aria-label={`View ${task.title}`}
                              onClick={() => setSelectedTask(task)}
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                <circle cx="12" cy="12" r="3" />
                              </svg>
                              View
                            </button>
                          </td>
                        </>
                      ) : (
                        <>
                          <td>
                            {task.reviewAttachment ? (
                              <a
                                href={`${baseUrl.baseUrl.replace(/\/$/, '')}${task.reviewAttachment}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="task-mgmt-proof-link"
                              >
                                {task.reviewAttachmentName || 'View Proof'}
                              </a>
                            ) : (
                              <span style={{ color: '#9ca3af' }}>No proof</span>
                            )}
                          </td>
                          <td>
                            <div className="slide-to-complete-wrapper">
                              <SlideToComplete
                                onComplete={() => handleCompleteTask(task.id)}
                              />
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="task-mgmt-footer">
            <p className="task-mgmt-count">
              Showing <strong>{showingCount}</strong> of <strong>{totalCount}</strong>
            </p>
            <div className="task-mgmt-pagination">
              <button
                type="button"
                className="task-mgmt-page-btn"
                disabled={safePage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                aria-label="Previous page"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <button
                type="button"
                className="task-mgmt-page-btn"
                disabled={safePage >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                aria-label="Next page"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {selectedTask && (
        <TaskDetailModal task={selectedTask} onClose={() => setSelectedTask(null)} onRefresh={loadTasks} />
      )}
    </div>
  );
};

export default TaskManagement;
