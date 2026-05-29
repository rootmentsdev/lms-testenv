import { useMemo, useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import SideNav from '../../components/SideNav/SideNav';
import TaskDetailModal from '../../components/Task/TaskDetailModal';
import { fetchTasks } from '../../features/task/taskApi';
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

const TaskManagement = () => {
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [selectedTask, setSelectedTask] = useState(null);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const json = await fetchTasks({
        search: search.trim(),
        category: categoryFilter,
        priority: priorityFilter,
        status: statusFilter,
      });
      setTasks(json.data || []);
    } catch (err) {
      setError(err.message);
      setTasks([]);
      toast.error(err.message || 'Could not load tasks');
    } finally {
      setLoading(false);
    }
  }, [search, categoryFilter, priorityFilter, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(loadTasks, 300);
    return () => clearTimeout(timer);
  }, [loadTasks]);

  const categories = useMemo(() => {
    const set = new Set(tasks.map((t) => t.category?.split(' / ')[0]?.trim() || t.category).filter(Boolean));
    return ['All', ...Array.from(set).sort()];
  }, [tasks]);

  const totalCount = tasks.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = tasks.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const showingCount = String(pageItems.length).padStart(2, '0');

  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [page, totalPages]);

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

          <div className="task-mgmt-filter">
            <label>Status :</label>
            <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
              {['All', 'COMPLETED', 'IN PROGRESS', 'PENDING', 'OVERDUE'].map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="task-mgmt-card">
          <div className="task-mgmt-table-wrap">
            <table className="task-mgmt-table">
              <thead>
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
                ) : pageItems.length === 0 ? (
                  <tr>
                    <td colSpan={9} style={{ textAlign: 'center', color: '#9ca3af', padding: '32px' }}>
                      No tasks found. Create one with + New Task.
                    </td>
                  </tr>
                ) : (
                  pageItems.map((task) => (
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
        <TaskDetailModal task={selectedTask} onClose={() => setSelectedTask(null)} />
      )}
    </div>
  );
};

export default TaskManagement;
