import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header/Header';
import SideNav from '../../components/SideNav/SideNav';

const CATEGORIES = ['Store Operations', 'Training', 'Compliance', 'Maintenance', 'HR', 'Other'];
const SUB_CATEGORIES = {
  'Store Operations': ['Opening', 'Closing', 'Stock Check', 'Display'],
  'Training':         ['Onboarding', 'Product Knowledge', 'Soft Skills'],
  'Compliance':       ['Audit', 'Documentation', 'Safety'],
  'Maintenance':      ['Electrical', 'Plumbing', 'Cleaning'],
  'HR':               ['Attendance', 'Leave', 'Appraisal'],
  'Other':            ['General', 'Miscellaneous'],
};
const TIMES = ['12:00am','12:30am','1:00am','1:30am','2:00am','2:30am','3:00am','3:30am','4:00am','4:30am','5:00am','5:30am','6:00am','6:30am','7:00am','7:30am','8:00am','8:30am','9:00am','9:30am','10:00am','10:30am','11:00am','11:30am','12:00pm','12:30pm','1:00pm','1:30pm','2:00pm','2:30pm','3:00pm','3:30pm','4:00pm','4:30pm','5:00pm','5:30pm','6:00pm','6:30pm','7:00pm','7:30pm','8:00pm','8:30pm','9:00pm','9:30pm','10:00pm','10:30pm','11:00pm','11:30pm'];
const PRIORITIES = [
  { label: 'Urgent', color: '#ef4444' },
  { label: 'High',   color: '#f59e0b' },
  { label: 'Normal', color: '#3b82f6' },
  { label: 'Low',    color: '#9ca3af' },
];

const inp = {
  border: '1px solid #e5e7eb', borderRadius: '10px', padding: '9px 12px',
  fontSize: '13px', color: '#374151', outline: 'none', background: '#fff',
  width: '100%', boxSizing: 'border-box', fontFamily: "'DM Sans', sans-serif",
};
const lbl = { fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '5px', display: 'block' };
const req = { color: '#ef4444' };

const CreateTask = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState('task'); // 'task' | 'auto'

  const [form, setForm] = useState({
    title: '', category: '', subCategory: '', assignedTo: '',
    startDate: '', startTime: '11:20am',
    endDate:   '', endTime:   '11:20am',
    description: '', additionalInfo: '',
    priority: 'Normal', file: null,
  });

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: wire up to backend API
    alert('Task saved successfully!');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', fontFamily: "'DM Sans', sans-serif" }}>
      <Header />
      <SideNav />

      <div style={{ marginLeft: '120px', paddingTop: '80px', paddingLeft: '24px', paddingRight: '24px', paddingBottom: '40px' }}>

        {/* Back */}
        <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', fontSize: '13px', color: '#6b7280', cursor: 'pointer', marginBottom: '16px', padding: 0 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          Back
        </button>

        {/* Card */}
        <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #f0f0f0', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', padding: '28px' }}>

          {/* Header row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', margin: 0 }}>Create & Assign New Task</h2>
              <p style={{ fontSize: '12px', color: '#9ca3af', margin: '4px 0 0' }}>Track and manage all operational tasks across stores</p>
            </div>
            {/* Task / Auto Task toggle */}
            <div style={{ display: 'flex', background: '#f3f4f6', borderRadius: '10px', padding: '3px' }}>
              {['task', 'auto'].map(m => (
                <button key={m} onClick={() => setMode(m)} style={{
                  padding: '6px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 600,
                  border: 'none', cursor: 'pointer',
                  background: mode === m ? '#111827' : 'transparent',
                  color: mode === m ? '#fff' : '#6b7280',
                  transition: 'all 0.15s',
                }}>
                  {m === 'task' ? 'Task' : 'Auto Task'}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit}>

            {/* Row 1: Title, Category, Sub Category, Assigned To */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div>
                <label style={lbl}>Task Title <span style={req}>*</span></label>
                <input type="text" placeholder="Enter task title" value={form.title} onChange={e => set('title', e.target.value)} required style={inp} />
              </div>
              <div>
                <label style={lbl}>Category <span style={req}>*</span></label>
                <select value={form.category} onChange={e => set('category', e.target.value)} required style={{ ...inp, cursor: 'pointer' }}>
                  <option value="">Select Options</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={lbl}>Sub Category <span style={req}>*</span></label>
                <select value={form.subCategory} onChange={e => set('subCategory', e.target.value)} required style={{ ...inp, cursor: 'pointer' }}>
                  <option value="">Select Options</option>
                  {(SUB_CATEGORIES[form.category] || []).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label style={lbl}>Assigned To <span style={req}>*</span></label>
                <select value={form.assignedTo} onChange={e => set('assignedTo', e.target.value)} required style={{ ...inp, cursor: 'pointer' }}>
                  <option value="">Select Options</option>
                  <option value="store_admin">Store Admin</option>
                  <option value="cluster_admin">Cluster Admin</option>
                  <option value="all_stores">All Stores</option>
                </select>
              </div>
            </div>

            {/* Row 2: Start Date & Time, End Date & Time, Attach File */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div>
                <label style={lbl}>Start Date & Time <span style={req}>*</span></label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)} required style={{ ...inp, flex: 1 }} />
                  <select value={form.startTime} onChange={e => set('startTime', e.target.value)} style={{ ...inp, width: '110px', cursor: 'pointer' }}>
                    {TIMES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label style={lbl}>End Date & Time <span style={req}>*</span></label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input type="date" value={form.endDate} onChange={e => set('endDate', e.target.value)} required style={{ ...inp, flex: 1 }} />
                  <select value={form.endTime} onChange={e => set('endTime', e.target.value)} style={{ ...inp, width: '110px', cursor: 'pointer' }}>
                    {TIMES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label style={lbl}>Attach File</label>
                <input type="file" onChange={e => set('file', e.target.files[0])} style={{ ...inp, padding: '6px 10px', cursor: 'pointer' }} />
              </div>
            </div>

            {/* Row 3: Description, Additional Info, Priority */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '28px' }}>
              <div>
                <label style={lbl}>Task Description <span style={req}>*</span></label>
                <textarea placeholder="Enter task description" value={form.description} onChange={e => set('description', e.target.value)} required rows={4} style={{ ...inp, resize: 'none' }} />
              </div>
              <div>
                <label style={lbl}>Additional Information</label>
                <textarea placeholder="Enter additional information" value={form.additionalInfo} onChange={e => set('additionalInfo', e.target.value)} rows={4} style={{ ...inp, resize: 'none' }} />
              </div>
              <div>
                <label style={lbl}>Select Priority <span style={req}>*</span></label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '4px' }}>
                  {PRIORITIES.map(p => (
                    <label key={p.label} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px', color: '#374151' }}>
                      <input
                        type="radio" name="priority" value={p.label}
                        checked={form.priority === p.label}
                        onChange={() => set('priority', p.label)}
                        style={{ display: 'none' }}
                      />
                      <span style={{
                        width: '12px', height: '12px', borderRadius: '50%',
                        background: p.color,
                        boxShadow: form.priority === p.label ? `0 0 0 3px ${p.color}40` : 'none',
                        flexShrink: 0, display: 'inline-block',
                        border: form.priority === p.label ? `2px solid ${p.color}` : '2px solid transparent',
                        outline: form.priority === p.label ? `2px solid ${p.color}` : 'none',
                        outlineOffset: '2px',
                      }} />
                      {p.label}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Save button */}
            <button type="submit" style={{
              background: '#111827', color: '#fff', border: 'none',
              borderRadius: '10px', padding: '10px 24px',
              fontSize: '13px', fontWeight: 600, cursor: 'pointer',
            }}>
              Save Task
            </button>

          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateTask;
