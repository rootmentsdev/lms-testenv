import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import SideNav from "../../components/SideNav/SideNav";
import ModileNav from "../../components/SideNav/ModileNav";
import baseUrl from "../../api/api";
import { FaSave, FaCheckCircle, FaUndo, FaTrashAlt, FaPlusCircle, FaVideo, FaEdit, FaClock } from 'react-icons/fa';

const CATEGORIES = [
    { key: 'total_walkin', label: 'TOTAL WALKIN' },
    { key: 'walkin', label: 'WALKIN' },
    { key: 'new_loss', label: 'NEW LOSS' },
    { key: 'repeat_loss', label: 'REPEAT LOSS' },
    { key: 'repeat_rentout', label: 'REPEAT RENTOUT' },
    { key: 'repeat_return', label: 'REPEAT RETURN' },
    { key: 'revisit_repeat_trial', label: 'REVISIT REPEAT TRIAL' },
    { key: 'repeat_booking', label: 'REPEAT BOOKING' },
    { key: 'new_walkin_booking', label: 'NEW WALKIN BOOKING' },
    { key: 'new_walkin_rentout', label: 'NEW WALKIN RENTOUT' },
    { key: 'revisit_reissue', label: 'REVISIT REISSUE' },
    { key: 'revisit_loss', label: 'REVISIT LOSS' },
    { key: 'others', label: 'OTHERS' }
];

const HARDCODED_STORES = [
    'Z-Edapally1', 'G-Edappally', 'Z- Edappal', 'Z.Perinthalmanna',
    'Z.Kottakkal', 'G.Kottayam', 'G.Perumbavoor', 'G.Thrissur', 'G.Chavakkad',
    'G.Calicut', 'G.Vadakara', 'G.Edappal', 'G.Perinthalmanna', 'G.Kottakkal',
    'G.Manjeri', 'G.Palakkad', 'G.Kalpetta', 'G.Kannur', 'G.MG Road',
    'Dappr Squad', 'office', 'production', 'WAREHOUSE'
];

const TIME_SLOTS = [
    "10:00 AM to 10:30 AM",
    "10:30 AM to 11:00 AM",
    "11:00 AM to 11:30 AM",
    "11:30 AM to 12:00 PM",
    "12:00 PM to 12:30 PM",
    "12:30 PM to 01:00 PM",
    "01:00 PM to 01:30 PM",
    "01:30 PM to 02:00 PM",
    "02:00 PM to 02:30 PM",
    "02:30 PM to 03:00 PM",
    "03:00 PM to 03:30 PM",
    "03:30 PM to 04:00 PM",
    "04:00 PM to 04:30 PM",
    "04:30 PM to 05:00 PM",
    "05:00 PM to 05:30 PM",
    "05:30 PM to 06:00 PM",
    "06:00 PM to 06:30 PM",
    "06:30 PM to 07:00 PM",
    "07:00 PM to 07:30 PM",
    "07:30 PM to 08:00 PM",
    "08:00 PM to 08:30 PM",
    "08:30 PM to 09:00 PM",
    "09:00 PM to 09:30 PM",
    "09:30 PM to 10:00 PM",
    "10:00 PM to 10:30 PM",
    "10:30 PM to 11:00 PM",
    "11:00 PM to 11:30 PM",
    "11:30 PM to 12:00 AM"
];

const ClockPicker = ({ label, hour, min, period, onChange }) => {
    const [activeMode, setActiveMode] = useState('hour'); // 'hour' or 'minute'
    
    const hours = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    const minutes = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'];

    // Calculate angle for the clock pointer hand
    const selectedHourNum = Number(hour);
    const hourIndex = hours.indexOf(selectedHourNum);
    const hourAngle = hourIndex >= 0 ? hourIndex * 30 : 0;

    const minuteAngle = Number(min) * 6; // 6 degrees per minute

    const angle = activeMode === 'hour' ? hourAngle : minuteAngle;
    const handColor = activeMode === 'hour' ? '#ef4444' : '#2563eb';

    const handleClockClick = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left - 80;
        const y = e.clientY - rect.top - 80;
        
        let clickAngle = Math.atan2(y, x) * 180 / Math.PI + 90;
        if (clickAngle < 0) clickAngle += 360;

        if (activeMode === 'hour') {
            let h = Math.round(clickAngle / 30);
            if (h === 0) h = 12;
            onChange('hour', String(h).padStart(2, '0'));
            // Auto-switch to minutes mode
            setTimeout(() => setActiveMode('minute'), 250);
        } else {
            let m = Math.round(clickAngle / 6) % 60;
            onChange('min', String(m).padStart(2, '0'));
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#f9fafb', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '12px', width: '220px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#4b5563', marginBottom: '8px', textTransform: 'uppercase' }}>{label}</span>
            
            {/* Mode Switcher Display */}
            <div style={{ display: 'flex', gap: '4px', alignItems: 'center', marginBottom: '12px' }}>
                <button
                    type="button"
                    onClick={() => setActiveMode('hour')}
                    style={{
                        background: activeMode === 'hour' ? '#fee2e2' : 'transparent',
                        color: activeMode === 'hour' ? '#ef4444' : '#4b5563',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '4px 8px',
                        fontSize: '18px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        outline: 'none'
                    }}
                >
                    {String(hour).padStart(2, '0')}
                </button>
                <span style={{ fontSize: '18px', fontWeight: '700', color: '#9ca3af' }}>:</span>
                <button
                    type="button"
                    onClick={() => setActiveMode('minute')}
                    style={{
                        background: activeMode === 'minute' ? '#dbeafe' : 'transparent',
                        color: activeMode === 'minute' ? '#2563eb' : '#4b5563',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '4px 8px',
                        fontSize: '18px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        outline: 'none'
                    }}
                >
                    {String(min).padStart(2, '0')}
                </button>
            </div>

            {/* Clock Face */}
            <div 
                onClick={handleClockClick}
                style={{ position: 'relative', width: '160px', height: '160px', background: '#fff', borderRadius: '50%', border: '1px solid #e5e7eb', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.03)', cursor: 'pointer' }}
            >
                {/* Center Pivot */}
                <div style={{ position: 'absolute', top: 'calc(50% - 4px)', left: 'calc(50% - 4px)', width: '8px', height: '8px', background: handColor, borderRadius: '50%', zIndex: 10 }} />
                
                {/* Clock Pointer Hand */}
                <div style={{ 
                    position: 'absolute', 
                    top: '50%', 
                    left: '50%', 
                    width: '2px', 
                    height: '52px', 
                    background: handColor, 
                    transformOrigin: 'bottom center',
                    transform: `translate(-50%, -100%) rotate(${angle}deg)`,
                    transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                    zIndex: 5
                }}>
                    {/* Hand Tip dot */}
                    <div style={{ 
                        position: 'absolute', 
                        top: 0, 
                        left: '-4px', 
                        width: '10px', 
                        height: '10px', 
                        background: handColor, 
                        borderRadius: '50%' 
                    }} />
                </div>

                {/* Clock Numbers Overlay */}
                <div style={{ pointerEvents: 'none', position: 'absolute', width: '100%', height: '100%', top: 0, left: 0 }}>
                    {activeMode === 'hour' ? (
                        hours.map((h, i) => {
                            const hAngle = (i * 30 - 90) * Math.PI / 180;
                            const radius = 55; // pixels from center
                            const left = 80 + Math.cos(hAngle) * radius;
                            const top = 80 + Math.sin(hAngle) * radius;
                            const isSelected = Number(hour) === h;

                            return (
                                <div
                                    key={h}
                                    style={{
                                        position: 'absolute',
                                        left: `${left}px`,
                                        top: `${top}px`,
                                        transform: 'translate(-50%, -50%)',
                                        width: '24px',
                                        height: '24px',
                                        borderRadius: '50%',
                                        background: isSelected ? '#ef4444' : 'transparent',
                                        color: isSelected ? '#fff' : '#374151',
                                        fontSize: '11px',
                                        fontWeight: isSelected ? '700' : '500',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    {h}
                                </div>
                            );
                        })
                    ) : (
                        minutes.map((m, i) => {
                            const mAngle = (i * 30 - 90) * Math.PI / 180;
                            const radius = 55; // pixels from center
                            const left = 80 + Math.cos(mAngle) * radius;
                            const top = 80 + Math.sin(mAngle) * radius;
                            const isSelected = Number(min) === Number(m);

                            return (
                                <div
                                    key={m}
                                    style={{
                                        position: 'absolute',
                                        left: `${left}px`,
                                        top: `${top}px`,
                                        transform: 'translate(-50%, -50%)',
                                        width: '24px',
                                        height: '24px',
                                        borderRadius: '50%',
                                        background: isSelected ? '#2563eb' : 'transparent',
                                        color: isSelected ? '#fff' : '#374151',
                                        fontSize: '11px',
                                        fontWeight: isSelected ? '700' : '500',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    {m}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Period Selector (AM/PM only) */}
            <div style={{ display: 'flex', gap: '8px', width: '100%', marginTop: '12px' }}>
                <div style={{ display: 'flex', flex: 1, background: '#e5e7eb', borderRadius: '8px', padding: '2px' }}>
                    {['AM', 'PM'].map(p => (
                        <button
                            key={p}
                            type="button"
                            onClick={() => onChange('period', p)}
                            style={{
                                flex: 1,
                                border: 'none',
                                background: period === p ? '#111827' : 'transparent',
                                color: period === p ? '#fff' : '#4b5563',
                                borderRadius: '6px',
                                padding: '4px 0',
                                fontSize: '11px',
                                fontWeight: period === p ? '700' : '500',
                                cursor: 'pointer',
                                transition: 'all 0.15s',
                                outline: 'none'
                            }}
                        >
                            {p}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

const WalkinCount = () => {
    const user = useSelector((state) => state.auth.user);
    const token = localStorage.getItem('token');

    // Font alignment with DM Sans
    useEffect(() => {
        if (!document.getElementById('dm-sans-font')) {
            const link = document.createElement('link');
            link.id = 'dm-sans-font';
            link.rel = 'stylesheet';
            link.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap';
            document.head.appendChild(link);
        }
    }, []);

    // Selection States
    const [selectedDate, setSelectedDate] = useState(() => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    });
    const [storeFilter, setStoreFilter] = useState('All');
    const [branches, setBranches] = useState([]);
    
    // Data States
    const [inAppCounts, setInAppCounts] = useState({});
    const [rowValues, setRowValues] = useState(() => {
        const initial = {};
        CATEGORIES.forEach(cat => {
            initial[cat.key] = { inCam: '', salesReport: '', timeSeen: '', remarks: '' };
        });
        return initial;
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    // Camera Checker States
    const [cameraForm, setCameraForm] = useState({
        statusKey: 'total_walkin',
        store: '',
        timeDuration: TIME_SLOTS[0],
        inCamCount: '',
        remarks: '',
        date: new Date().toISOString().split('T')[0],
        editingId: null
    });
    const [cameraChecks, setCameraChecks] = useState([]);
    const [savingCameraCheck, setSavingCameraCheck] = useState(false);

    // Clock Picker Local State & Handlers
    const [showClockPicker, setShowClockPicker] = useState(false);

    const parseTimeRange = (rangeStr) => {
        const defaultVal = {
            startHour: '10', startMin: '00', startPeriod: 'AM',
            endHour: '10', endMin: '30', endPeriod: 'AM'
        };
        if (!rangeStr) return defaultVal;
        const parts = rangeStr.split(' to ');
        if (parts.length !== 2) return defaultVal;
        
        const parseSingle = (timeStr) => {
            const [time, period] = timeStr.split(' ');
            const [hour, min] = time.split(':');
            return { hour: Number(hour).toString(), min, period };
        };

        try {
            const start = parseSingle(parts[0]);
            const end = parseSingle(parts[1]);
            return {
                startHour: start.hour,
                startMin: start.min,
                startPeriod: start.period,
                endHour: end.hour,
                endMin: end.min,
                endPeriod: end.period
            };
        } catch (e) {
            return defaultVal;
        }
    };

    const timeState = parseTimeRange(cameraForm.timeDuration);

    const handleTimeChange = (type, field, val) => {
        const current = { ...timeState };
        if (type === 'start') {
            current[field === 'hour' ? 'startHour' : field === 'min' ? 'startMin' : 'startPeriod'] = val;
        } else {
            current[field === 'hour' ? 'endHour' : field === 'min' ? 'endMin' : 'endPeriod'] = val;
        }

        const startH = String(current.startHour).padStart(2, '0');
        const endH = String(current.endHour).padStart(2, '0');
        const formatted = `${startH}:${current.startMin} ${current.startPeriod} to ${endH}:${current.endMin} ${current.endPeriod}`;

        setCameraForm(prev => ({
            ...prev,
            timeDuration: formatted
        }));
    };

    // Autofill form if a camera check log already exists for the selected date, store, category, and time slot
    useEffect(() => {
        if (!cameraForm.date || !cameraForm.store || !cameraForm.statusKey || !cameraForm.timeDuration) {
            setCameraForm(prev => {
                if (prev.editingId) {
                    return { ...prev, inCamCount: '', remarks: '', editingId: null };
                }
                return prev;
            });
            return;
        }
        
        const existingLog = cameraChecks.find(log => 
            log.date === cameraForm.date &&
            log.store === cameraForm.store &&
            log.statusKey === cameraForm.statusKey &&
            log.timeDuration === cameraForm.timeDuration
        );

        if (existingLog) {
            setCameraForm(prev => ({
                ...prev,
                inCamCount: String(existingLog.inCamCount),
                remarks: existingLog.remarks || '',
                editingId: existingLog._id
            }));
        } else {
            setCameraForm(prev => ({
                ...prev,
                inCamCount: '',
                remarks: '',
                editingId: null
            }));
        }
    }, [cameraForm.date, cameraForm.store, cameraForm.statusKey, cameraForm.timeDuration, cameraChecks]);

    // Sync entry form store with global filter selection
    useEffect(() => {
        if (storeFilter && storeFilter !== 'All') {
            setCameraForm(prev => ({ ...prev, store: storeFilter }));
        }
    }, [storeFilter]);

    // Fetch branches on mount
    useEffect(() => {
        const fetchBranches = async () => {
            try {
                const branchRes = await fetch(`${baseUrl.baseUrl}api/admin/accessible-stores`, {
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
                });
                const branchJson = await branchRes.json();
                let branchList = Array.isArray(branchJson?.stores) ? branchJson.stores : (Array.isArray(branchJson?.data) ? branchJson.data : []);

                if (user?.role === 'super_admin' || user?.role === 'admin' || user?.role === 'hr_admin' || user?.role === 'telecaller') {
                    const existing = new Set(branchList.map(b => b.workingBranch));
                    const missing = HARDCODED_STORES.filter(s => !existing.has(s));
                    branchList = [...missing.map(name => ({ workingBranch: name })), ...branchList];
                }

                setBranches(branchList);
                // Keep storeFilter empty as default ("Select Store")
            } catch (err) {
                console.error("Error fetching branches:", err);
            }
        };

        if (token) fetchBranches();
    }, [token, user?.role]);

    // Fetch Count Data
    const loadCountData = async () => {
        if (!selectedDate || storeFilter === '') return;
        try {
            setLoading(true);
            setMessage({ text: '', type: '' });
            const url = `${baseUrl.baseUrl}api/walkin/walkin-count?date=${selectedDate}&store=${encodeURIComponent(storeFilter)}`;
            const res = await fetch(url, {
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
            });
            const json = await res.json();
            if (json.success) {
                setInAppCounts(json.inApp || {});
                setCameraChecks(json.cameraChecks || []);
                
                // Map saved values from backend or reset
                const savedCounts = json.saved?.counts || [];
                const updatedRowValues = {};
                
                CATEGORIES.forEach(cat => {
                    const savedItem = savedCounts.find(s => s.statusKey === cat.key);
                    if (savedItem) {
                        updatedRowValues[cat.key] = {
                            inCam: savedItem.inCam === '-' ? '' : savedItem.inCam,
                            salesReport: savedItem.salesReport === '-' ? '' : savedItem.salesReport,
                            timeSeen: savedItem.timeSeen || '',
                            remarks: savedItem.remarks || ''
                        };
                    } else {
                        updatedRowValues[cat.key] = { inCam: '', salesReport: '', timeSeen: '', remarks: '' };
                    }
                });
                setRowValues(updatedRowValues);
            } else {
                setInAppCounts({});
                setCameraChecks([]);
                const resetRowValues = {};
                CATEGORIES.forEach(cat => {
                    resetRowValues[cat.key] = { inCam: '', salesReport: '', timeSeen: '', remarks: '' };
                });
                setRowValues(resetRowValues);
            }
        } catch (err) {
            console.error("Error loading count data:", err);
            setMessage({ text: 'Failed to load count data.', type: 'error' });
            setInAppCounts({});
            setCameraChecks([]);
            const resetRowValues = {};
            CATEGORIES.forEach(cat => {
                resetRowValues[cat.key] = { inCam: '', salesReport: '', timeSeen: '', remarks: '' };
            });
            setRowValues(resetRowValues);
        } finally {
            setLoading(false);
        }
    };

    // Load data when filters change
    useEffect(() => {
        loadCountData();
    }, [selectedDate, storeFilter]);

    // Handle Input Changes
    const handleInputChange = (categoryKey, field, val) => {
        setRowValues(prev => ({
            ...prev,
            [categoryKey]: {
                ...prev[categoryKey],
                [field]: val
            }
        }));
    };

    // Save Data
    const handleSave = async () => {
        if (storeFilter === 'All' || storeFilter === '') {
            setMessage({ text: 'Please select a valid store first.', type: 'error' });
            return;
        }

        try {
            setSaving(true);
            setMessage({ text: '', type: '' });

            const payloadCounts = CATEGORIES.map(cat => {
                const vals = rowValues[cat.key];
                return {
                    statusKey: cat.key,
                    inCam: vals.inCam === '' ? '-' : vals.inCam,
                    salesReport: vals.salesReport === '' ? '-' : vals.salesReport,
                    timeSeen: vals.timeSeen || '',
                    remarks: vals.remarks || ''
                };
            });

            const res = await fetch(`${baseUrl.baseUrl}api/walkin/walkin-count/save`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    date: selectedDate,
                    store: storeFilter,
                    counts: payloadCounts
                })
            });

            const json = await res.json();
            if (json.success) {
                setMessage({ text: 'Data saved successfully!', type: 'success' });
                loadCountData();
            } else {
                setMessage({ text: json.message || 'Failed to save data.', type: 'error' });
            }
        } catch (err) {
            console.error("Error saving count data:", err);
            setMessage({ text: 'Failed to save count data due to a server error.', type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    // Save Camera Check Log Entry
    const handleSaveCameraCheck = async (e) => {
        e.preventDefault();
        if (!cameraForm.store || cameraForm.store === 'All') {
            setMessage({ text: 'Please select a valid store for the camera check entry.', type: 'error' });
            return;
        }
        if (!cameraForm.inCamCount || isNaN(cameraForm.inCamCount) || Number(cameraForm.inCamCount) < 0) {
            setMessage({ text: 'Please enter a valid in-cam count.', type: 'error' });
            return;
        }

        try {
            setSavingCameraCheck(true);
            setMessage({ text: '', type: '' });

            const res = await fetch(`${baseUrl.baseUrl}api/walkin/camera-check`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    id: cameraForm.editingId || undefined,
                    date: cameraForm.date,
                    store: cameraForm.store,
                    statusKey: cameraForm.statusKey,
                    timeDuration: cameraForm.timeDuration,
                    inCamCount: Number(cameraForm.inCamCount),
                    remarks: cameraForm.remarks
                })
            });

            const json = await res.json();
            if (json.success) {
                setMessage({ text: 'Camera check log saved successfully!', type: 'success' });
                // Reset form inputs except store, slot, and date
                setCameraForm(prev => ({
                    ...prev,
                    inCamCount: '',
                    remarks: '',
                    editingId: null
                }));
                // Switch comparison dashboard view to the logged store and date
                setSelectedDate(cameraForm.date);
                setStoreFilter(cameraForm.store);
                loadCountData();
            } else {
                setMessage({ text: json.message || 'Failed to save camera check log.', type: 'error' });
            }
        } catch (err) {
            console.error("Error saving camera check log:", err);
            setMessage({ text: 'Failed to save camera check log due to a server error.', type: 'error' });
        } finally {
            setSavingCameraCheck(false);
        }
    };

    // Delete Camera Check Log Entry
    const handleDeleteCameraCheck = async (id) => {
        if (!window.confirm("Are you sure you want to delete this camera check log?")) return;

        try {
            setMessage({ text: '', type: '' });
            const res = await fetch(`${baseUrl.baseUrl}api/walkin/camera-check/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            const json = await res.json();
            if (json.success) {
                setMessage({ text: 'Camera check log deleted successfully!', type: 'success' });
                loadCountData();
            } else {
                setMessage({ text: json.message || 'Failed to delete camera check log.', type: 'error' });
            }
        } catch (err) {
            console.error("Error deleting camera check log:", err);
            setMessage({ text: 'Failed to delete camera check log due to a server error.', type: 'error' });
        }
    };

    return (
        <div className="mb-[70px] text-[14px] min-h-screen" style={{ fontFamily: "DM Sans, sans-serif", background: '#f9fafb' }}>
            <SideNav />
            <div className="md:hidden sm:block">
                <ModileNav />
            </div>

            {/* Main Content Area */}
            <div className="md:ml-[120px] transition-all duration-300" style={{ paddingTop: '24px', paddingLeft: '24px', paddingRight: '24px', paddingBottom: '40px' }}>

                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <div>
                        <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#111827', margin: 0 }}>Walk In Count</h1>
                        <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>Compare in-camera check counts with automatic app-registered statistics</p>
                    </div>
                </div>

                {/* Notifications */}
                {message.text && (
                    <div style={{
                        padding: '12px 16px',
                        borderRadius: '8px',
                        marginBottom: '20px',
                        fontSize: '13px',
                        fontWeight: 500,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        background: message.type === 'success' ? '#def7ec' : '#fde8e8',
                        color: message.type === 'success' ? '#03543f' : '#9b1c1c',
                        border: `1px solid ${message.type === 'success' ? '#bcf0da' : '#fabdbd'}`
                    }}>
                        <FaCheckCircle /> {message.text}
                    </div>
                )}

                {/* Camera Checker Entry Portal Card */}
                <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', padding: '20px', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                        <FaVideo style={{ color: '#ef4444', fontSize: '18px' }} />
                        <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', margin: 0 }}>Camera Checker Entry Portal</h2>
                    </div>

                    <form onSubmit={handleSaveCameraCheck} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', alignItems: 'flex-end' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <span style={{ fontSize: '12px', fontWeight: 600, color: '#4b5563' }}>Store Branch</span>
                            <select
                                value={cameraForm.store}
                                onChange={e => setCameraForm(prev => ({ ...prev, store: e.target.value }))}
                                style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '8px 12px', fontSize: '13px', color: '#374151', outline: 'none', background: '#fff', cursor: 'pointer' }}
                            >
                                <option value="" disabled>Select Store</option>
                                {branches.map((b, i) => <option key={i} value={b.workingBranch}>{b.workingBranch}</option>)}
                            </select>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <span style={{ fontSize: '12px', fontWeight: 600, color: '#4b5563' }}>Select Date</span>
                            <input
                                type="date"
                                value={cameraForm.date}
                                onChange={e => setCameraForm(prev => ({ ...prev, date: e.target.value }))}
                                style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '8px 12px', fontSize: '13px', color: '#374151', outline: 'none', background: '#fff', cursor: 'pointer' }}
                            />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <span style={{ fontSize: '12px', fontWeight: 600, color: '#4b5563' }}>Status Category</span>
                            <select
                                value={cameraForm.statusKey}
                                onChange={e => setCameraForm(prev => ({ ...prev, statusKey: e.target.value }))}
                                style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '8px 12px', fontSize: '13px', color: '#374151', outline: 'none', background: '#fff', cursor: 'pointer' }}
                            >
                                {CATEGORIES.map(cat => <option key={cat.key} value={cat.key}>{cat.label}</option>)}
                            </select>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', position: 'relative' }}>
                            <span style={{ fontSize: '12px', fontWeight: 600, color: '#4b5563' }}>Time Duration</span>
                            <button
                                type="button"
                                onClick={() => setShowClockPicker(!showClockPicker)}
                                style={{ display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '8px 12px', fontSize: '13px', color: '#374151', background: '#fff', cursor: 'pointer', outline: 'none', textAlign: 'left', minWidth: '180px', fontWeight: 500 }}
                            >
                                <FaClock style={{ color: '#ef4444' }} /> {cameraForm.timeDuration}
                            </button>
                            
                            {showClockPicker && (
                                <div style={{
                                    position: 'absolute',
                                    top: 'calc(100% + 8px)',
                                    left: 0,
                                    background: '#fff',
                                    borderRadius: '16px',
                                    border: '1px solid #e5e7eb',
                                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
                                    padding: '16px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '12px',
                                    zIndex: 100,
                                }}>
                                    <div style={{ display: 'flex', gap: '16px' }}>
                                        <ClockPicker
                                            label="Start Time"
                                            hour={timeState.startHour}
                                            min={timeState.startMin}
                                            period={timeState.startPeriod}
                                            onChange={(field, val) => handleTimeChange('start', field, val)}
                                        />
                                        <ClockPicker
                                            label="End Time"
                                            hour={timeState.endHour}
                                            min={timeState.endMin}
                                            period={timeState.endPeriod}
                                            onChange={(field, val) => handleTimeChange('end', field, val)}
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setShowClockPicker(false)}
                                        style={{ alignSelf: 'flex-end', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', padding: '6px 12px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', outline: 'none' }}
                                    >
                                        Done
                                    </button>
                                </div>
                            )}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <span style={{ fontSize: '12px', fontWeight: 600, color: '#4b5563' }}>In Cam Count</span>
                            <input
                                type="number"
                                placeholder="Enter count..."
                                min="0"
                                value={cameraForm.inCamCount}
                                onChange={e => setCameraForm(prev => ({ ...prev, inCamCount: e.target.value }))}
                                style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '8px 12px', fontSize: '13px', color: '#374151', outline: 'none' }}
                            />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <span style={{ fontSize: '12px', fontWeight: 600, color: '#4b5563' }}>Remarks</span>
                            <input
                                type="text"
                                placeholder="Enter remarks..."
                                value={cameraForm.remarks}
                                onChange={e => setCameraForm(prev => ({ ...prev, remarks: e.target.value }))}
                                style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '8px 12px', fontSize: '13px', color: '#374151', outline: 'none' }}
                            />
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={savingCameraCheck}
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', width: '100%', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 16px', fontSize: '13px', cursor: 'pointer', fontWeight: 600, transition: 'background-color 0.2s' }}
                            >
                                <FaPlusCircle /> {savingCameraCheck ? 'Saving...' : 'Add Camera Log'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Camera Checker Log List Card */}
                <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', padding: '20px', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', borderBottom: '1px solid #f3f4f6', paddingBottom: '16px', marginBottom: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#111827', margin: 0 }}>
                                Logged Camera Checks {storeFilter ? `for ${storeFilter} (${selectedDate})` : ''}
                            </h2>
                            {storeFilter && (
                                <span style={{ background: '#f3f4f6', color: '#374151', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 600 }}>
                                    {cameraChecks.length} entries
                                </span>
                            )}
                        </div>
                        
                        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <span style={{ fontSize: '11px', fontWeight: 600, color: '#4b5563' }}>Store Branch</span>
                                <select
                                    value={storeFilter}
                                    onChange={e => setStoreFilter(e.target.value)}
                                    style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '6px 12px', fontSize: '13px', color: '#374151', outline: 'none', background: '#fff', cursor: 'pointer', minWidth: '180px' }}
                                >
                                    <option value="All">All</option>
                                    {branches.map((b, i) => <option key={i} value={b.workingBranch}>{b.workingBranch}</option>)}
                                </select>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <span style={{ fontSize: '11px', fontWeight: 600, color: '#4b5563' }}>Selected Date</span>
                                <input
                                    type="date"
                                    value={selectedDate}
                                    onChange={e => setSelectedDate(e.target.value)}
                                    style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '6px 12px', fontSize: '13px', color: '#374151', outline: 'none', background: '#fff', cursor: 'pointer' }}
                                />
                            </div>
                        </div>
                    </div>

                    {!storeFilter ? (
                        <div style={{ textAlign: 'center', padding: '30px 0', color: '#6b7280', fontSize: '13px' }}>
                            Please select a store branch in the filters above to load camera checks.
                        </div>
                    ) : cameraChecks.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '24px 0', color: '#6b7280', fontSize: '13px' }}>
                            No camera check logs recorded for this store and date yet. Use the form above to add one.
                        </div>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid #e5e7eb', background: '#f9fafb' }}>
                                        <th style={{ padding: '10px 14px', fontWeight: 600, color: '#4b5563' }}>TIME SLOT</th>
                                        <th style={{ padding: '10px 14px', fontWeight: 600, color: '#4b5563' }}>STATUS CATEGORY</th>
                                        <th style={{ padding: '10px 14px', fontWeight: 600, color: '#4b5563', width: '100px' }}>IN CAM</th>
                                        <th style={{ padding: '10px 14px', fontWeight: 600, color: '#4b5563' }}>REMARKS</th>
                                        <th style={{ padding: '10px 14px', fontWeight: 600, color: '#4b5563' }}>LOGGED BY</th>
                                        <th style={{ padding: '10px 14px', fontWeight: 600, color: '#4b5563', textAlign: 'center', width: '60px' }}>ACTION</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {cameraChecks.map((log) => {
                                        const categoryLabel = CATEGORIES.find(cat => cat.key === log.statusKey)?.label || log.statusKey;
                                        return (
                                            <tr key={log._id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                                <td style={{ padding: '10px 14px', fontWeight: 600, color: '#111827' }}>{log.timeDuration}</td>
                                                <td style={{ padding: '10px 14px', color: '#4b5563' }}>
                                                    <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 600 }}>
                                                        {categoryLabel}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '10px 14px', fontWeight: 700, color: '#dc2626' }}>{log.inCamCount}</td>
                                                <td style={{ padding: '10px 14px', color: '#6b7280', fontStyle: log.remarks ? 'normal' : 'italic' }}>
                                                    {log.remarks || 'No remarks'}
                                                </td>
                                                <td style={{ padding: '10px 14px', color: '#4b5563' }}>
                                                    {log.createdBy?.name || 'Unknown'} <span style={{ color: '#9ca3af', fontSize: '10px' }}>({log.createdBy?.role || 'user'})</span>
                                                </td>
                                                <td style={{ padding: '10px 14px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                                                    <button
                                                        onClick={() => {
                                                            setCameraForm({
                                                                store: log.store,
                                                                date: log.date,
                                                                statusKey: log.statusKey,
                                                                timeDuration: log.timeDuration,
                                                                inCamCount: String(log.inCamCount),
                                                                remarks: log.remarks || '',
                                                                editingId: log._id
                                                            });
                                                        }}
                                                        style={{ border: 'none', background: 'transparent', color: '#2563eb', cursor: 'pointer', padding: '4px', fontSize: '14px', marginRight: '8px' }}
                                                        title="Edit Entry"
                                                    >
                                                        <FaEdit />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteCameraCheck(log._id)}
                                                        style={{ border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer', padding: '4px', fontSize: '14px' }}
                                                        title="Delete Entry"
                                                    >
                                                        <FaTrashAlt />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Main Table Card */}
                {storeFilter ? (
                    <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e5e7eb', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                        {loading ? (
                            <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}>
                                <div style={{ width: '32px', height: '32px', border: '3px solid #e5e7eb', borderTopColor: '#111827', borderRadius: '50%', animation: 'walkincount-spin 0.8s linear infinite' }} />
                            </div>
                        ) : (
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid #e5e7eb', background: '#f9fafb' }}>
                                            <th style={{ padding: '14px 20px', fontWeight: 600, color: '#374151', width: '220px' }}>STATUS CATEGORY</th>
                                            <th style={{ padding: '14px 20px', fontWeight: 600, color: '#374151', width: '150px' }}>IN CAM</th>
                                            <th style={{ padding: '14px 20px', fontWeight: 600, color: '#374151', width: '180px' }}>SALES REPORT</th>
                                            <th style={{ padding: '14px 20px', fontWeight: 600, color: '#374151', width: '150px' }}>IN APP</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {CATEGORIES.map((cat, idx) => {
                                            const inAppVal = inAppCounts[cat.key] ?? 0;
                                            const isEven = idx % 2 === 0;
                                            
                                            return (
                                                <tr key={cat.key} style={{ borderBottom: '1px solid #f3f4f6', background: isEven ? '#fff' : '#fcfcfc', transition: 'background 0.15s' }}>
                                                    <td style={{ padding: '12px 20px', fontWeight: 600, color: '#111827' }}>
                                                        {cat.label}
                                                    </td>
                                                    <td style={{ padding: '12px 20px', fontWeight: 700, color: '#dc2626' }}>
                                                        {rowValues[cat.key].inCam || '-'}
                                                    </td>
                                                    <td style={{ padding: '12px 20px', color: '#374151' }}>
                                                        {rowValues[cat.key].salesReport || '-'}
                                                    </td>
                                                    <td style={{ padding: '12px 20px', fontWeight: 700, color: inAppVal > 0 ? '#2563eb' : '#6b7280', fontSize: '14px' }}>
                                                        {inAppVal}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                ) : (
                    <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e5e7eb', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', padding: '40px', textAlign: 'center', color: '#6b7280', fontSize: '13px' }}>
                        Please select a store branch in the card above to view comparison statistics.
                    </div>
                )}
            </div>

            {/* Spinner keyframe styles */}
            <style>{`
                @keyframes walkincount-spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default WalkinCount;
