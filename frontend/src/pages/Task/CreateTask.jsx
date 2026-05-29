import { useState, useRef, useLayoutEffect, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Select, { components } from 'react-select';
import SideNav from '../../components/SideNav/SideNav';
import { createTask } from '../../features/task/taskApi';
import baseUrl from '../../api/api';
import './CreateTask.css';

const CATEGORIES = [
  'REPORTS&PERFORMANCE',
  'STORE HYGIENE&CLEANING',
  'INVENTORY AUDIT&MANAGEMENT',
  'EMPLOYEE MANAGEMENT&DEVELOPMENT',
  'MAINTENANCE'
];
const SUB_CATEGORIES = {
  'REPORTS&PERFORMANCE': [
    'POS REPORTS',
    'PERFORMANCE REPORTS',
    'RECORDS&DOCUMENTS'
  ],
  'STORE HYGIENE&CLEANING': [
    'DEEP CLEANING',
    'VISUAL MERCHANDISING',
    'PRODUCT CLEANING'
  ],
  'INVENTORY AUDIT&MANAGEMENT': [
    'STOCK VALUATION&VERIFICATION',
    'INTER STORE STOCK TRANSFER'
  ],
  'EMPLOYEE MANAGEMENT&DEVELOPMENT': [
    'EMPLOYEE TRAININGS',
    'EMPLOYEE PERFORMANCE REVIEW',
    'EMPLOYEE SPECIFIC TASK'
  ],
  'MAINTENANCE': [
    'ELECTRICAL',
    'PLUMBING',
    'CLEANING'
  ]
};
const TIMES = ['12:00am','12:30am','1:00am','1:30am','2:00am','2:30am','3:00am','3:30am','4:00am','4:30am','5:00am','5:30am','6:00am','6:30am','7:00am','7:30am','8:00am','8:30am','9:00am','9:30am','10:00am','10:30am','11:00am','11:30am','12:00pm','12:30pm','1:00pm','1:30pm','2:00pm','2:30pm','3:00pm','3:30pm','4:00pm','4:30pm','5:00pm','5:30pm','6:00pm','6:30pm','7:00pm','7:30pm','8:00pm','8:30pm','9:00pm','9:30pm','10:00pm','10:30pm','11:00pm','11:30pm'];
const PRIORITIES = [
  { label: 'Urgent', color: '#ef4444' },
  { label: 'High',   color: '#f59e0b' },
  { label: 'Normal', color: '#3b82f6' },
  { label: 'Low',    color: '#9ca3af' },
];

const CheckboxOption = (props) => {
  return (
    <components.Option {...props}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
        <input
          type="checkbox"
          checked={props.isSelected}
          onChange={() => null}
          style={{
            cursor: 'pointer',
            width: '14px',
            height: '14px',
            accentColor: '#111827',
          }}
        />
        <span style={{ fontSize: '13px', color: '#374151', fontFamily: "'DM Sans', sans-serif" }}>{props.label}</span>
      </div>
    </components.Option>
  );
};

const selectStyles = {
  control: (base, state) => ({
    ...base,
    border: '1px solid #e5e7eb',
    borderRadius: '10px',
    minHeight: '40px',
    boxShadow: 'none',
    borderColor: state.isFocused ? '#111827' : '#e5e7eb',
    '&:hover': {
      borderColor: state.isFocused ? '#111827' : '#e5e7eb',
    },
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '13px',
    color: '#374151',
  }),
  valueContainer: (base) => ({
    ...base,
    padding: '0 8px',
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected ? '#f3f4f6' : state.isFocused ? '#f9fafb' : '#fff',
    color: '#374151',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '13px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    padding: '8px 12px',
    '&:active': {
      backgroundColor: '#f3f4f6',
    },
  }),
  multiValue: (base) => ({
    ...base,
    backgroundColor: '#f3f4f6',
    borderRadius: '6px',
  }),
  multiValueLabel: (base) => ({
    ...base,
    color: '#374151',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '12px',
  }),
  multiValueRemove: (base) => ({
    ...base,
    color: '#9ca3af',
    '&:hover': {
      backgroundColor: '#e5e7eb',
      color: '#374151',
    },
  }),
};

const inp = {
  border: '1px solid #e5e7eb',
  borderRadius: '10px',
  padding: '9px 12px',
  fontSize: '13px',
  color: '#374151',
  outline: 'none',
  background: '#fff',
  width: '100%',
  boxSizing: 'border-box',
  fontFamily: "'DM Sans', sans-serif",
};
const lbl = { fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '5px', display: 'block' };
const req = { color: '#ef4444' };
const FIELD_H = '40px';
const compactField = { ...inp, height: FIELD_H, minHeight: FIELD_H, lineHeight: '20px' };

const SWITCH_MS = 280;

const PriorityPicker = ({ value, onChange, compact, grid }) => (
  <div style={{
    display: grid ? 'grid' : 'flex',
    gridTemplateColumns: grid ? '1fr 1fr' : undefined,
    flexWrap: grid ? undefined : 'wrap',
    gap: compact ? '8px' : '10px',
    marginTop: compact ? '2px' : '4px',
  }}>
    {PRIORITIES.map((p) => {
      const selected = value === p.label;
      return (
        <button
          key={p.label}
          type="button"
          onClick={() => onChange(p.label)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: compact ? '6px 12px' : '7px 14px',
            borderRadius: '999px',
            border: selected ? '1.5px solid #111827' : '1px solid #e5e7eb',
            background: selected ? '#f9fafb' : '#fff',
            fontSize: '13px',
            fontWeight: 500,
            color: '#374151',
            cursor: 'pointer',
            fontFamily: "'DM Sans', sans-serif",
            transition: 'border-color 0.2s ease, background 0.2s ease, transform 0.15s ease',
          }}
        >
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: p.color, flexShrink: 0 }} />
          {p.label}
        </button>
      );
    })}
  </div>
);

const FileField = ({ file, onChange, compact }) => (
  <label
    className={compact ? 'create-task-file-field' : undefined}
    style={{
      ...inp,
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '9px 12px',
      cursor: 'pointer',
      color: '#6b7280',
      ...(compact ? { height: FIELD_H, minHeight: FIELD_H } : {}),
    }}
  >
    <span style={{ color: '#111827', fontWeight: 500 }}>Choose File</span>
    <span style={{ color: '#d1d5db' }}>|</span>
    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
      {file ? file.name : 'No file chosen'}
    </span>
    <input type="file" onChange={(e) => onChange(e.target.files?.[0] ?? null)} style={{ display: 'none' }} />
  </label>
);

const ModeToggle = ({ mode, onChange, disabled }) => {
  const wrapRef = useRef(null);
  const btnRefs = useRef([]);
  const [pill, setPill] = useState({ width: 0, left: 0 });

  const updatePill = useCallback(() => {
    const idx = mode === 'task' ? 0 : 1;
    const btn = btnRefs.current[idx];
    const wrap = wrapRef.current;
    if (!btn || !wrap) return;
    const wrapRect = wrap.getBoundingClientRect();
    const btnRect = btn.getBoundingClientRect();
    setPill({
      width: btnRect.width,
      left: btnRect.left - wrapRect.left,
    });
  }, [mode]);

  useLayoutEffect(() => {
    updatePill();
    const raf = requestAnimationFrame(updatePill);
    window.addEventListener('resize', updatePill);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', updatePill);
    };
  }, [updatePill]);

  const options = [
    { id: 'task', label: 'Task' },
    { id: 'auto', label: 'Auto Task' },
  ];

  return (
    <div ref={wrapRef} className="create-task-toggle" style={{ opacity: disabled ? 0.7 : 1 }}>
      <div
        className="create-task-toggle__pill"
        style={{ width: pill.width, transform: `translateX(${pill.left}px)` }}
      />
      {options.map((opt, i) => (
        <button
          key={opt.id}
          ref={(el) => { btnRefs.current[i] = el; }}
          type="button"
          disabled={disabled}
          onClick={() => onChange(opt.id)}
          className={`create-task-toggle__btn${mode === opt.id ? ' create-task-toggle__btn--active' : ''}`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
};

const AutoTaskFields = ({ form, set }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.25fr 1fr', gap: '16px', alignItems: 'start' }}>
    <div>
      <label style={lbl}>Start Date & Time <span style={req}>*</span></label>
      <input
        type="date"
        value={form.startDate}
        onChange={(e) => set('startDate', e.target.value)}
        required
        style={{ ...compactField, color: form.startDate ? '#374151' : '#9ca3af' }}
      />
    </div>
    <div>
      <label style={lbl}>Task Description <span style={req}>*</span></label>
      <textarea
        placeholder="Enter task description"
        value={form.description}
        onChange={(e) => set('description', e.target.value)}
        required
        rows={1}
        style={{
          ...compactField,
          resize: 'none',
          overflowY: 'auto',
          paddingTop: '9px',
          paddingBottom: '9px',
        }}
      />
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <label style={lbl}>Attach File</label>
        <FileField compact file={form.file} onChange={(f) => set('file', f)} />
      </div>
      <div>
        <label style={lbl}>Select Priority <span style={req}>*</span></label>
        <PriorityPicker compact grid value={form.priority} onChange={(v) => set('priority', v)} />
      </div>
    </div>
  </div>
);

const RegularTaskFields = ({ form, set }) => (
  <>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '20px' }}>
      <div>
        <label style={lbl}>Start Date & Time <span style={req}>*</span></label>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input type="date" value={form.startDate} onChange={(e) => set('startDate', e.target.value)} required style={{ ...inp, flex: 1 }} />
          <select value={form.startTime} onChange={(e) => set('startTime', e.target.value)} style={{ ...inp, width: '110px', cursor: 'pointer' }}>
            {TIMES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label style={lbl}>End Date & Time <span style={req}>*</span></label>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input type="date" value={form.endDate} onChange={(e) => set('endDate', e.target.value)} required style={{ ...inp, flex: 1 }} />
          <select value={form.endTime} onChange={(e) => set('endTime', e.target.value)} style={{ ...inp, width: '110px', cursor: 'pointer' }}>
            {TIMES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label style={lbl}>Attach File</label>
        <FileField file={form.file} onChange={(f) => set('file', f)} />
      </div>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
      <div>
        <label style={lbl}>Task Description <span style={req}>*</span></label>
        <textarea placeholder="Enter task description" value={form.description} onChange={(e) => set('description', e.target.value)} required rows={4} style={{ ...inp, resize: 'none' }} />
      </div>
      <div>
        <label style={lbl}>Additional Information</label>
        <textarea placeholder="Enter additional information" value={form.additionalInfo} onChange={(e) => set('additionalInfo', e.target.value)} rows={4} style={{ ...inp, resize: 'none' }} />
      </div>
      <div>
        <label style={lbl}>Select Priority <span style={req}>*</span></label>
        <PriorityPicker value={form.priority} onChange={(v) => set('priority', v)} />
      </div>
    </div>
  </>
);

const CreateTask = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState('task');
  const [panelVisible, setPanelVisible] = useState(true);
  const [btnVisible, setBtnVisible] = useState(true);
  const [isSwitching, setIsSwitching] = useState(false);
  const bodyRef = useRef(null);
  const [bodyHeight, setBodyHeight] = useState(undefined);
  const switchTimer = useRef(null);

  const [assigneeOptions, setAssigneeOptions] = useState([]);
  const [loadingAssignees, setLoadingAssignees] = useState(false);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchAssignees = async () => {
      setLoadingAssignees(true);
      try {
        const response = await fetch(`${baseUrl.baseUrl}api/task/assignees`, {
          headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        });
        if (response.ok) {
          const json = await response.json();
          setAssigneeOptions(json.data || []);
        }
      } catch (err) {
        console.error('Error fetching assignees:', err);
      } finally {
        setLoadingAssignees(false);
      }
    };
    fetchAssignees();
  }, [token]);

  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    title: '',
    category: '',
    subCategory: '',
    assignedTo: [],
    startDate: '',
    startTime: '11:20am',
    endDate: '',
    endTime: '11:20am',
    description: '',
    additionalInfo: '',
    priority: 'Normal',
    file: null,
  });

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const isAuto = mode === 'auto';

  const measureBody = useCallback(() => {
    if (bodyRef.current) {
      setBodyHeight(bodyRef.current.scrollHeight);
    }
  }, []);

  useLayoutEffect(() => {
    measureBody();
  }, [mode, panelVisible, measureBody]);

  useEffect(() => () => {
    if (switchTimer.current) clearTimeout(switchTimer.current);
  }, []);

  const switchMode = (next) => {
    if (next === mode || isSwitching) return;
    setIsSwitching(true);
    setPanelVisible(false);
    setBtnVisible(false);
    if (switchTimer.current) clearTimeout(switchTimer.current);
    switchTimer.current = window.setTimeout(() => {
      setMode(next);
      setPanelVisible(true);
      setBtnVisible(true);
      requestAnimationFrame(() => {
        measureBody();
        setIsSwitching(false);
      });
    }, SWITCH_MS);
  };

  const handleAssigneeChange = (selected, actionMeta) => {
    const nextSelected = [...(selected || [])];
    const { action, option } = actionMeta;

    if (action === 'select-option' && option) {
      if (option.type === 'group') {
        if (option.value === 'all_employees') {
          assigneeOptions.forEach(opt => {
            if (opt.type === 'employee' && !nextSelected.some(s => s.value === opt.value)) {
              nextSelected.push(opt);
            }
          });
        } else if (option.value === 'all_hr_admins') {
          assigneeOptions.forEach(opt => {
            if (opt.type === 'admin' && opt.role === 'hr_admin' && !nextSelected.some(s => s.value === opt.value)) {
              nextSelected.push(opt);
            }
          });
        } else if (option.value === 'all_cluster_admins') {
          assigneeOptions.forEach(opt => {
            if (opt.type === 'admin' && opt.role === 'cluster_admin' && !nextSelected.some(s => s.value === opt.value)) {
              nextSelected.push(opt);
            }
          });
        } else if (option.value === 'all_store_admins') {
          assigneeOptions.forEach(opt => {
            if (opt.type === 'admin' && opt.role === 'store_admin' && !nextSelected.some(s => s.value === opt.value)) {
              nextSelected.push(opt);
            }
          });
        }
      }
    } else if ((action === 'deselect-option' || action === 'remove-value') && option) {
      if (option.type === 'group') {
        if (option.value === 'all_employees') {
          return set('assignedTo', nextSelected.filter(s => s.type !== 'employee' && s.value !== 'all_employees'));
        } else if (option.value === 'all_hr_admins') {
          return set('assignedTo', nextSelected.filter(s => !(s.type === 'admin' && s.role === 'hr_admin') && s.value !== 'all_hr_admins'));
        } else if (option.value === 'all_cluster_admins') {
          return set('assignedTo', nextSelected.filter(s => !(s.type === 'admin' && s.role === 'cluster_admin') && s.value !== 'all_cluster_admins'));
        } else if (option.value === 'all_store_admins') {
          return set('assignedTo', nextSelected.filter(s => !(s.type === 'admin' && s.role === 'store_admin') && s.value !== 'all_store_admins'));
        }
      } else {
        if (option.type === 'employee') {
          const idx = nextSelected.findIndex(s => s.value === 'all_employees');
          if (idx !== -1) nextSelected.splice(idx, 1);
        } else if (option.type === 'admin') {
          if (option.role === 'hr_admin') {
            const idx = nextSelected.findIndex(s => s.value === 'all_hr_admins');
            if (idx !== -1) nextSelected.splice(idx, 1);
          } else if (option.role === 'cluster_admin') {
            const idx = nextSelected.findIndex(s => s.value === 'all_cluster_admins');
            if (idx !== -1) nextSelected.splice(idx, 1);
          } else if (option.role === 'store_admin') {
            const idx = nextSelected.findIndex(s => s.value === 'all_store_admins');
            if (idx !== -1) nextSelected.splice(idx, 1);
          }
        }
      }
    } else if (action === 'clear') {
      return set('assignedTo', []);
    }

    const employees = assigneeOptions.filter(opt => opt.type === 'employee');
    const hrAdmins = assigneeOptions.filter(opt => opt.type === 'admin' && opt.role === 'hr_admin');
    const clusterAdmins = assigneeOptions.filter(opt => opt.type === 'admin' && opt.role === 'cluster_admin');
    const storeAdmins = assigneeOptions.filter(opt => opt.type === 'admin' && opt.role === 'store_admin');

    const hasAllEmployees = employees.length > 0 && employees.every(emp => nextSelected.some(s => s.value === emp.value));
    const hasAllHrAdmins = hrAdmins.length > 0 && hrAdmins.every(admin => nextSelected.some(s => s.value === admin.value));
    const hasAllClusterAdmins = clusterAdmins.length > 0 && clusterAdmins.every(admin => nextSelected.some(s => s.value === admin.value));
    const hasAllStoreAdmins = storeAdmins.length > 0 && storeAdmins.every(admin => nextSelected.some(s => s.value === admin.value));

    const groupAllEmployeesOpt = assigneeOptions.find(opt => opt.value === 'all_employees');
    const groupAllHrAdminsOpt = assigneeOptions.find(opt => opt.value === 'all_hr_admins');
    const groupAllClusterAdminsOpt = assigneeOptions.find(opt => opt.value === 'all_cluster_admins');
    const groupAllStoreAdminsOpt = assigneeOptions.find(opt => opt.value === 'all_store_admins');

    if (hasAllEmployees && groupAllEmployeesOpt && !nextSelected.some(s => s.value === 'all_employees')) {
      nextSelected.push(groupAllEmployeesOpt);
    }
    if (hasAllHrAdmins && groupAllHrAdminsOpt && !nextSelected.some(s => s.value === 'all_hr_admins')) {
      nextSelected.push(groupAllHrAdminsOpt);
    }
    if (hasAllClusterAdmins && groupAllClusterAdminsOpt && !nextSelected.some(s => s.value === 'all_cluster_admins')) {
      nextSelected.push(groupAllClusterAdminsOpt);
    }
    if (hasAllStoreAdmins && groupAllStoreAdminsOpt && !nextSelected.some(s => s.value === 'all_store_admins')) {
      nextSelected.push(groupAllStoreAdminsOpt);
    }

    set('assignedTo', nextSelected);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const individualAssignees = (form.assignedTo || []).filter(assignee => assignee.type !== 'group');
    if (individualAssignees.length === 0) {
      toast.error('Please select at least one assignee.');
      return;
    }
    setSubmitting(true);
    try {
      let fileAttachment = null;
      if (form.file) {
        fileAttachment = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(form.file);
          reader.onload = () => resolve({ name: form.file.name, base64: reader.result });
          reader.onerror = (err) => reject(err);
        });
      }

      for (const assignee of individualAssignees) {
        await createTask({
          mode: isAuto ? 'auto' : 'task',
          title: form.title,
          category: form.category,
          subCategory: form.subCategory,
          assignedTo: assignee.value,
          assignedToLabel: assignee.label,
          startDate: form.startDate,
          startTime: form.startTime,
          endDate: isAuto ? form.startDate : form.endDate,
          endTime: isAuto ? form.startTime : form.endTime,
          description: form.description,
          additionalInfo: form.additionalInfo,
          priority: form.priority,
          fileAttachment,
        });
      }
      toast.success(isAuto ? 'Auto task saved successfully!' : 'Task saved successfully!');
      navigate('/task');
    } catch (err) {
      toast.error(err.message || 'Failed to save task');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', fontFamily: "'DM Sans', sans-serif" }}>
      <SideNav />

      <div style={{ marginLeft: '120px', paddingTop: '24px', paddingLeft: '24px', paddingRight: '24px', paddingBottom: '40px' }}>
        <button
          type="button"
          onClick={() => navigate('/task')}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none',
            fontSize: '13px', color: '#6b7280', cursor: 'pointer', marginBottom: '16px', padding: 0,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back
        </button>

        <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #f0f0f0', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', padding: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#111827', margin: 0 }}>Create & Assign New Task</h2>
              <p style={{ fontSize: '12px', color: '#9ca3af', margin: '4px 0 0' }}>Track and manage all operational tasks across stores</p>
            </div>
            <ModeToggle mode={mode} onChange={switchMode} disabled={isSwitching} />
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '20px' }}>
              <div>
                <label style={lbl}>Task Title <span style={req}>*</span></label>
                <input type="text" placeholder="Enter task title" value={form.title} onChange={(e) => set('title', e.target.value)} required style={inp} />
              </div>
              <div>
                <label style={lbl}>Category <span style={req}>*</span></label>
                <select value={form.category} onChange={(e) => set('category', e.target.value)} required style={{ ...inp, cursor: 'pointer' }}>
                  <option value="">Select Options</option>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={lbl}>Sub Category <span style={req}>*</span></label>
                <select value={form.subCategory} onChange={(e) => set('subCategory', e.target.value)} required style={{ ...inp, cursor: 'pointer' }}>
                  <option value="">Select Options</option>
                  {(SUB_CATEGORIES[form.category] || []).map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label style={lbl}>Assigned To <span style={req}>*</span></label>
                <Select
                  isMulti
                  closeMenuOnSelect={false}
                  hideSelectedOptions={false}
                  components={{ Option: CheckboxOption }}
                  options={assigneeOptions}
                  value={form.assignedTo}
                  onChange={handleAssigneeChange}
                  placeholder={loadingAssignees ? "Loading options..." : "Select Options"}
                  styles={selectStyles}
                />
              </div>
            </div>

            <div
              className="create-task-form-body"
              style={{ height: bodyHeight !== undefined ? bodyHeight : 'auto', marginBottom: '28px' }}
            >
              <div
                ref={bodyRef}
                className={`create-task-form-panel${panelVisible ? ' create-task-form-panel--enter' : ' create-task-form-panel--exit'}`}
              >
                {isAuto ? (
                  <AutoTaskFields form={form} set={set} />
                ) : (
                  <RegularTaskFields form={form} set={set} />
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className={`create-task-save-btn${btnVisible ? '' : ' create-task-save-btn--exit'}`}
              style={{
                background: '#111827',
                color: '#fff',
                border: 'none',
                borderRadius: '10px',
                padding: '10px 24px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: submitting ? 'not-allowed' : 'pointer',
                opacity: submitting ? 0.7 : 1,
              }}
            >
              {submitting ? 'Saving…' : isAuto ? 'Save Auto Task' : 'Save Task'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateTask;
