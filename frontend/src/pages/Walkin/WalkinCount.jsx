import React, { useState, useEffect, useRef } from 'react';

import { useSelector } from 'react-redux';
import SideNav from "../../components/SideNav/SideNav";
import ModileNav from "../../components/SideNav/ModileNav";
import baseUrl from "../../api/api";
import { FaSave, FaCheckCircle, FaUndo, FaTrashAlt, FaPlusCircle, FaVideo, FaEdit, FaClock, FaDownload } from 'react-icons/fa';

const CATEGORIES = [
    { key: 'total_walkin', label: 'TOTAL WALKIN', tooltip: "New walk-ins + revisit walk-ins for the selected date." },
    { key: 'walkin', label: 'WALKIN', tooltip: "Customers newly created on the selected date." },
    { key: 'new_loss', label: 'NEW LOSS', tooltip: "New walk-ins that became Loss on the selected date." },
    { key: 'new_walkin_booking', label: 'NEW WALKIN BOOKING', tooltip: "New walk-ins booked or shoe billed on the selected date." },
    { key: 'new_walkin_rentout', label: 'NEW WALKIN RENTOUT', tooltip: "New walk-ins rented out on the selected date." },
    { key: 'new_cancelled', label: 'NEW CANCELLED', tooltip: "New walk-ins cancelled on the selected date." },
    { key: 'new_others', label: 'NEW OTHERS', tooltip: "New walk-ins not fitting the above categories." },
    { key: 'revisit_loss', label: 'REVISIT LOSS', tooltip: "Revisit walk-ins that became Loss on the selected date." },
    { key: 'revisit_rentout', label: 'REVISIT RENTOUT', tooltip: "Revisit walk-ins rented out on the selected date." },
    { key: 'revisit_return', label: 'REVISIT RETURN', tooltip: "Revisit walk-ins returned or bill returned on the selected date." },
    { key: 'revisit_trial', label: 'REVISIT TRIAL', tooltip: "Revisit walk-ins revisited for Trial on the selected date." },
    { key: 'revisit_booking', label: 'REVISIT BOOKING', tooltip: "Revisit walk-ins booked or shoe billed on the selected date." },
    { key: 'revisit_reissue', label: 'REVISIT REISSUE', tooltip: "Revisit walk-ins revisited for Reissue on the selected date." },
    { key: 'revisit_cancelled', label: 'REVISIT CANCELLED', tooltip: "Revisit walk-ins cancelled on the selected date." },
    { key: 'revisit_others', label: 'REVISIT OTHERS', tooltip: "Revisit walk-ins updated but not fitting the above categories." }
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

const TimeRangeSlider = ({ value, onChange }) => {
    const RANGE_TIMES = [
        '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
        '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM',
        '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM',
        '06:00 PM', '06:30 PM', '07:00 PM', '07:30 PM', '08:00 PM', '08:30 PM',
        '09:00 PM', '09:30 PM', '10:00 PM', '10:30 PM', '11:00 PM', '11:30 PM',
        '12:00 AM'
    ];

    // Parse value (e.g. "10:00 AM to 10:30 AM") to get indices
    const parseIndices = (val) => {
        const defaultIndices = [0, 1]; // "09:00 AM to 09:30 AM"
        if (!val) return defaultIndices;
        const parts = val.split(' to ');
        if (parts.length !== 2) return defaultIndices;
        
        let startIdx = RANGE_TIMES.indexOf(parts[0]);
        let endIdx = RANGE_TIMES.indexOf(parts[1]);
        
        if (startIdx === -1) startIdx = 0;
        if (endIdx === -1) endIdx = 1;
        
        return [startIdx, endIdx];
    };

    const [startIdx, endIdx] = parseIndices(value);

    const handleTrackClickOrDrag = (clientX, trackElement) => {
        const rect = trackElement.getBoundingClientRect();
        const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
        const clickedIdx = Math.round(pct * (RANGE_TIMES.length - 1));

        // Determine which handle is closer
        const distStart = Math.abs(clickedIdx - startIdx);
        const distEnd = Math.abs(clickedIdx - endIdx);

        let newStart = startIdx;
        let newEnd = endIdx;

        if (distStart < distEnd) {
            newStart = Math.min(clickedIdx, endIdx - 1);
        } else {
            newEnd = Math.max(clickedIdx, startIdx + 1);
        }

        const formatted = `${RANGE_TIMES[newStart]} to ${RANGE_TIMES[newEnd]}`;
        onChange(formatted);
    };

    const handleMouseDown = (e) => {
        const trackElement = e.currentTarget;
        handleTrackClickOrDrag(e.clientX, trackElement);

        const handleMouseMove = (moveEvent) => {
            handleTrackClickOrDrag(moveEvent.clientX, trackElement);
        };

        const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    const handleTouchStart = (e) => {
        const trackElement = e.currentTarget;
        if (e.touches.length > 0) {
            handleTrackClickOrDrag(e.touches[0].clientX, trackElement);
        }

        const handleTouchMove = (moveEvent) => {
            if (moveEvent.touches.length > 0) {
                handleTrackClickOrDrag(moveEvent.touches[0].clientX, trackElement);
            }
        };

        const handleTouchEnd = () => {
            document.removeEventListener('touchmove', handleTouchMove);
            document.removeEventListener('touchend', handleTouchEnd);
        };

        document.addEventListener('touchmove', handleTouchMove);
        document.addEventListener('touchend', handleTouchEnd);
    };

    const startPct = (startIdx / (RANGE_TIMES.length - 1)) * 100;
    const endPct = (endIdx / (RANGE_TIMES.length - 1)) * 100;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', width: '280px', padding: '12px 8px 8px 8px', background: '#f9fafb', borderRadius: '12px', userSelect: 'none' }}>
            {/* Range Text Display */}
            <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '12px' }}>
                <span style={{ fontSize: '11px', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase' }}>Selected Duration</span>
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#111827', marginTop: '2px' }}>
                    {RANGE_TIMES[startIdx]} to {RANGE_TIMES[endIdx]}
                </span>
            </div>

            {/* Track Slider */}
            <div 
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
                style={{ position: 'relative', width: '100%', height: '32px', display: 'flex', alignItems: 'center', cursor: 'pointer' }}
            >
                {/* Gray Background Bar */}
                <div style={{ width: '100%', height: '6px', background: '#e5e7eb', borderRadius: '3px', position: 'absolute' }} />

                {/* Highlight Segment */}
                <div style={{ 
                    height: '6px', 
                    background: '#111827', 
                    position: 'absolute', 
                    left: `${startPct}%`, 
                    width: `${endPct - startPct}%`,
                    borderRadius: '3px'
                }} />

                {/* Left Bubble Handle */}
                <div style={{ 
                    position: 'absolute', 
                    left: `calc(${startPct}% - 10px)`, 
                    width: '20px', 
                    height: '20px', 
                    borderRadius: '50%', 
                    background: '#fff', 
                    border: '2.5px solid #111827', 
                    boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
                    pointerEvents: 'none'
                }} />

                {/* Right Bubble Handle */}
                <div style={{ 
                    position: 'absolute', 
                    left: `calc(${endPct}% - 10px)`, 
                    width: '20px', 
                    height: '20px', 
                    borderRadius: '50%', 
                    background: '#fff', 
                    border: '2.5px solid #111827', 
                    boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
                    pointerEvents: 'none'
                }} />
            </div>

            {/* Slider Marks */}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 2px', marginTop: '2px' }}>
                <span style={{ fontSize: '9px', color: '#9ca3af', fontWeight: 600 }}>9 AM</span>
                <span style={{ fontSize: '9px', color: '#9ca3af', fontWeight: 600 }}>12 PM</span>
                <span style={{ fontSize: '9px', color: '#9ca3af', fontWeight: 600 }}>6 PM</span>
                <span style={{ fontSize: '9px', color: '#9ca3af', fontWeight: 600 }}>12 AM</span>
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
    const [cameraRows, setCameraRows] = useState(() => Array.from({ length: 10 }, () => ({ inTime: '', outTime: '', identification: '', statusKey: '' })));
    const [cameraChecks, setCameraChecks] = useState([]);
    const [savingCameraChecks, setSavingCameraChecks] = useState(false);
    const [telecallerTab, setTelecallerTab] = useState('entry'); // 'entry' or 'report'
    
    // Request synchronization refs
    const abortControllerRef = useRef(null);
    const activeRequestRef = useRef(0);

    // Date range selection for log viewer (synced with selectedDate)
    const [logStartDate, setLogStartDate] = useState(selectedDate);
    const [logEndDate, setLogEndDate] = useState(selectedDate);

    // Sync log date range with selectedDate
    useEffect(() => {
        setLogStartDate(selectedDate);
        setLogEndDate(selectedDate);
    }, [selectedDate]);

    // Fetch existing camera checker logs for the selected store and date, and populate the grid
    useEffect(() => {
        if (!selectedDate || !storeFilter || storeFilter === 'All') {
            setCameraRows(Array.from({ length: 10 }, () => ({ inTime: '', outTime: '', identification: '', statusKey: '' })));
            return;
        }

        const draftKey = `walkin_draft_${storeFilter}_${selectedDate}`;
        const savedDraft = localStorage.getItem(draftKey);
        
        if (savedDraft) {
            try {
                const parsed = JSON.parse(savedDraft);
                if (Array.isArray(parsed)) {
                    setCameraRows(parsed);
                    setCameraChecks([]);
                    
                    // Fetch database checks in background to sync setCameraChecks
                    const fetchDB = async () => {
                        try {
                            const url = `${baseUrl.baseUrl}api/walkin/camera-check?date=${selectedDate}&store=${encodeURIComponent(storeFilter)}`;
                            const res = await fetch(url, {
                                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
                            });
                            const json = await res.json();
                            if (json.success && Array.isArray(json.cameraChecks)) {
                                setCameraChecks(json.cameraChecks);
                            }
                        } catch (e) {
                            console.error(e);
                        }
                    };
                    fetchDB();
                    return;
                }
            } catch (e) {
                console.error("Error parsing saved draft:", e);
            }
        }

        // If no draft exists, reset to empty rows and fetch from database
        setCameraRows(Array.from({ length: 10 }, () => ({ inTime: '', outTime: '', identification: '', statusKey: '' })));
        setCameraChecks([]);

        const fetchLoggedEntries = async () => {
            try {
                const url = `${baseUrl.baseUrl}api/walkin/camera-check?date=${selectedDate}&store=${encodeURIComponent(storeFilter)}`;
                const res = await fetch(url, {
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
                });
                const json = await res.json();
                if (json.success && Array.isArray(json.cameraChecks)) {
                    const loaded = json.cameraChecks.map(cc => ({
                        _id: cc._id,
                        inTime: cc.inTime || '',
                        outTime: cc.outTime || '',
                        identification: cc.identification || cc.remarks || '',
                        statusKey: cc.statusKey || ''
                    }));
                    const padded = [...loaded];
                    if (padded.length < 10) {
                        const needed = 10 - padded.length;
                        padded.push(...Array.from({ length: needed }, () => ({ inTime: '', outTime: '', identification: '', statusKey: '' })));
                    }
                    setCameraRows(padded);
                    setCameraChecks(json.cameraChecks);
                } else {
                    setCameraRows(Array.from({ length: 10 }, () => ({ inTime: '', outTime: '', identification: '', statusKey: '' })));
                    setCameraChecks([]);
                }
            } catch (err) {
                console.error("Error fetching camera check logs:", err);
                setCameraRows(Array.from({ length: 10 }, () => ({ inTime: '', outTime: '', identification: '', statusKey: '' })));
                setCameraChecks([]);
            }
        };

        fetchLoggedEntries();
    }, [selectedDate, storeFilter, token]);

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
                if (['cluster_admin', 'store_admin'].includes(user?.role) && branchList.length > 0) {
                    setStoreFilter(branchList[0].workingBranch);
                }
            } catch (err) {
                console.error("Error fetching branches:", err);
            }
        };

        if (token) fetchBranches();
    }, [token, user?.role]);

    // Fetch Count Data
    const loadCountData = async () => {
        if (!selectedDate || storeFilter === '') {
            setLoading(false);
            return;
        }
        if (['cluster_admin', 'store_admin'].includes(user?.role) && storeFilter === 'All') {
            setLoading(false);
            return;
        }

        // Abort previous in-flight request if any
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        const controller = new AbortController();
        abortControllerRef.current = controller;

        const requestId = ++activeRequestRef.current;
        console.log(`[Frontend Count Fetch #${requestId}] Started. logStartDate: "${logStartDate}", logEndDate: "${logEndDate}", storeFilter: "${storeFilter}"`);

        // Reset counts immediately before starting fetch
        setInAppCounts({});
        setCameraChecks([]);

        try {
            setLoading(true);
            setMessage({ text: '', type: '' });
            
            const url = `${baseUrl.baseUrl}api/walkin/walkin-count?date=${selectedDate}&store=${encodeURIComponent(storeFilter)}&startDate=${logStartDate}&endDate=${logEndDate}`;
            console.log(`[Frontend Count Fetch #${requestId}] URL: "${url}"`);

            const res = await fetch(url, {
                signal: controller.signal,
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
            });
            const json = await res.json();

            // Validate that this response belongs to the latest request
            if (requestId !== activeRequestRef.current) {
                console.warn(`[Frontend Count Fetch #${requestId}] Ignored. Stale response received. Latest request is #${activeRequestRef.current}.`);
                return;
            }

            console.log(`[Frontend Count Fetch #${requestId}] Applied. Response received counts:`, json.inApp);

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
            if (err.name === 'AbortError') {
                console.log(`[Frontend Count Fetch #${requestId}] Request was aborted.`);
                return;
            }
            console.error(`[Frontend Count Fetch #${requestId}] Error loading count data:`, err);
            setMessage({ text: 'Failed to load count data.', type: 'error' });
            setInAppCounts({});
            setCameraChecks([]);
            const resetRowValues = {};
            CATEGORIES.forEach(cat => {
                resetRowValues[cat.key] = { inCam: '', salesReport: '', timeSeen: '', remarks: '' };
            });
            setRowValues(resetRowValues);
        } finally {
            // Only set loading to false if this is still the active request
            if (requestId === activeRequestRef.current) {
                setLoading(false);
            }
        }
    };


    // Load data when filters change
    useEffect(() => {
        loadCountData();
    }, [selectedDate, storeFilter, logStartDate, logEndDate]);

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

    // Row change handler
    const handleRowChange = (index, field, value) => {
        setCameraRows(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };
            
            // Save draft directly
            if (selectedDate && storeFilter && storeFilter !== 'All') {
                const draftKey = `walkin_draft_${storeFilter}_${selectedDate}`;
                const hasData = updated.some(row => 
                    (row.inTime && row.inTime.trim() !== '') ||
                    (row.outTime && row.outTime.trim() !== '') ||
                    (row.identification && row.identification.trim() !== '') ||
                    (row.statusKey && row.statusKey.trim() !== '')
                );
                if (hasData) {
                    localStorage.setItem(draftKey, JSON.stringify(updated));
                } else {
                    localStorage.removeItem(draftKey);
                }
            }
            return updated;
        });
    };


    // Add 10 more empty rows handler
    const handleAddMoreRows = () => {
        setCameraRows(prev => {
            const updated = [
                ...prev,
                ...Array.from({ length: 10 }, () => ({ inTime: '', outTime: '', identification: '', statusKey: '' }))
            ];
            
            // Save draft directly
            if (selectedDate && storeFilter && storeFilter !== 'All') {
                const draftKey = `walkin_draft_${storeFilter}_${selectedDate}`;
                localStorage.setItem(draftKey, JSON.stringify(updated));
            }
            return updated;
        });
    };

    // Save Camera Check Log Entries (Batch)
    const handleSaveCameraCheck = async (e) => {
        if (e) e.preventDefault();
        if (!storeFilter || storeFilter === 'All') {
            setMessage({ text: 'Please select a valid store branch first.', type: 'error' });
            return;
        }
        if (!selectedDate) {
            setMessage({ text: 'Please select a valid date.', type: 'error' });
            return;
        }

        // Filter out empty entries (where statusKey is empty)
        const validEntries = cameraRows.filter(row => row.statusKey && row.statusKey.trim() !== '');

        try {
            setSavingCameraChecks(true);
            setMessage({ text: '', type: '' });

            const res = await fetch(`${baseUrl.baseUrl}api/walkin/camera-check`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    date: selectedDate,
                    store: storeFilter,
                    entries: validEntries
                })
            });

            const json = await res.json();
            if (json.success) {
                setMessage({ text: 'Camera check logs saved successfully!', type: 'success' });
                
                // Clear draft
                const draftKey = `walkin_draft_${storeFilter}_${selectedDate}`;
                localStorage.removeItem(draftKey);
                
                // Reset table grid to 10 empty rows on successful submission
                setCameraRows(Array.from({ length: 10 }, () => ({ inTime: '', outTime: '', identification: '', statusKey: '' })));
                setCameraChecks([]);
                
                loadCountData();
            } else {
                setMessage({ text: json.message || 'Failed to save camera check logs.', type: 'error' });
            }
        } catch (err) {
            console.error("Error saving camera check logs:", err);
            setMessage({ text: 'Failed to save camera check logs due to a server error.', type: 'error' });
        } finally {
            setSavingCameraChecks(false);
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

    const handleDownloadReport = () => {
        let csvContent = "";
        
        // Add title and info header
        csvContent += `Walk In Count Comparison Report\r\n`;
        csvContent += `Store Branch: ${storeFilter}\r\n`;
        if (logStartDate && logEndDate && logStartDate !== logEndDate) {
            csvContent += `Date Range: ${logStartDate} to ${logEndDate}\r\n\r\n`;
        } else {
            csvContent += `Selected Date: ${selectedDate}\r\n\r\n`;
        }
        
        // Add table headers
        csvContent += `STATUS CATEGORY,IN APP,IN CAM\r\n`;
        
        // Add rows
        CATEGORIES.forEach(cat => {
            const inCam = rowValues[cat.key]?.inCam || '-';
            const inAppVal = inAppCounts[cat.key] ?? 0;
            
            const escapedLabel = `"${cat.label.replace(/"/g, '""')}"`;
            const escapedInApp = `"${String(inAppVal).replace(/"/g, '""')}"`;
            const escapedInCam = `"${String(inCam).replace(/"/g, '""')}"`;
            
            csvContent += `${escapedLabel},${escapedInApp},${escapedInCam}\r\n`;
        });

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        
        let downloadName = `WalkinCount_Report_${storeFilter}_${selectedDate}.csv`;
        if (logStartDate && logEndDate && logStartDate !== logEndDate) {
            downloadName = `WalkinCount_Report_${storeFilter}_${logStartDate}_to_${logEndDate}.csv`;
        }
        link.setAttribute("download", downloadName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleDownloadCameraChecksReport = () => {
        let csvContent = "";
        csvContent += `Logged Camera Checks Report\r\n`;
        csvContent += `Store Branch: ${storeFilter}\r\n`;
        csvContent += `Date Range: ${logStartDate} to ${logEndDate}\r\n\r\n`;
        csvContent += `DATE,TIME SLOT,STATUS CATEGORY,IN CAM,REMARKS,LOGGED BY\r\n`;
        
        cameraChecks.forEach(log => {
            const categoryLabel = CATEGORIES.find(cat => cat.key === log.statusKey)?.label || log.statusKey;
            const dateVal = log.date || '-';
            const timeSlot = log.timeDuration || '-';
            const inCam = log.inCamCount || 0;
            const remarks = log.remarks || '-';
            const loggedBy = `${log.createdBy?.name || 'Unknown'} (${log.createdBy?.role || 'user'})`;
            
            const escapedDate = `"${String(dateVal).replace(/"/g, '""')}"`;
            const escapedTime = `"${String(timeSlot).replace(/"/g, '""')}"`;
            const escapedCat = `"${String(categoryLabel).replace(/"/g, '""')}"`;
            const escapedInCam = `"${String(inCam).replace(/"/g, '""')}"`;
            const escapedRemarks = `"${String(remarks).replace(/"/g, '""')}"`;
            const escapedLoggedBy = `"${String(loggedBy).replace(/"/g, '""')}"`;
            
            csvContent += `${escapedDate},${escapedTime},${escapedCat},${escapedInCam},${escapedRemarks},${escapedLoggedBy}\r\n`;
        });

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `CameraChecks_Report_${storeFilter}_${logStartDate}_to_${logEndDate}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
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

                {/* Toggle on top for telecaller roles */}
                {user?.role === 'telecaller' && (
                    <div style={{ display: 'inline-flex', background: '#f3f4f6', padding: '4px', borderRadius: '8px', marginBottom: '20px' }}>
                        <button
                            type="button"
                            onClick={() => setTelecallerTab('entry')}
                            style={{
                                padding: '6px 16px',
                                borderRadius: '6px',
                                fontSize: '13px',
                                fontWeight: 600,
                                border: 'none',
                                background: telecallerTab === 'entry' ? '#fff' : 'transparent',
                                color: telecallerTab === 'entry' ? '#111827' : '#4b5563',
                                boxShadow: telecallerTab === 'entry' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                                cursor: 'pointer',
                                transition: 'all 0.15s',
                                outline: 'none'
                            }}
                        >
                            Count Entry
                        </button>
                        <button
                            type="button"
                            onClick={() => setTelecallerTab('report')}
                            style={{
                                padding: '6px 16px',
                                borderRadius: '6px',
                                fontSize: '13px',
                                fontWeight: 600,
                                border: 'none',
                                background: telecallerTab === 'report' ? '#fff' : 'transparent',
                                color: telecallerTab === 'report' ? '#111827' : '#4b5563',
                                boxShadow: telecallerTab === 'report' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                                cursor: 'pointer',
                                transition: 'all 0.15s',
                                outline: 'none'
                            }}
                        >
                            Count Report
                        </button>
                    </div>
                )}

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


                {/* Unified Camera Checker Log Portal Card */}
                {user?.role === 'telecaller' && telecallerTab === 'entry' && (
                    <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', padding: '20px', marginBottom: '25px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                            <FaVideo style={{ color: '#111827', fontSize: '18px' }} />
                            <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', margin: 0 }}>Camera Checker Log Portal</h2>
                        </div>

                        {/* Selection Inputs */}
                        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '20px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '240px' }}>
                                <span style={{ fontSize: '12px', fontWeight: 600, color: '#4b5563' }}>Store Branch</span>
                                <select
                                    value={storeFilter === 'All' ? '' : storeFilter}
                                    onChange={e => setStoreFilter(e.target.value)}
                                    style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '8px 12px', fontSize: '13px', color: '#374151', outline: 'none', background: '#fff', cursor: 'pointer' }}
                                >
                                    <option value="">Select Store</option>
                                    {branches.map((b, i) => <option key={i} value={b.workingBranch}>{b.workingBranch}</option>)}
                                </select>
                            </div>

                            {storeFilter && storeFilter !== 'All' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '240px' }}>
                                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#4b5563' }}>Select Date</span>
                                    <input
                                        type="date"
                                        value={selectedDate}
                                        onChange={e => setSelectedDate(e.target.value)}
                                        style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '8px 12px', fontSize: '13px', color: '#374151', outline: 'none', background: '#fff', cursor: 'pointer' }}
                                    />
                                </div>
                            )}
                        </div>

                        {/* 10-Row Grid (Visible only when store is selected) */}
                        {storeFilter && storeFilter !== 'All' && selectedDate ? (
                            <div>
                                <div style={{ overflowX: 'auto', marginBottom: '16px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                                        <thead>
                                            <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                                                <th style={{ padding: '10px 14px', fontWeight: 600, color: '#4b5563', width: '50px', textAlign: 'center' }}>#</th>
                                                <th style={{ padding: '10px 14px', fontWeight: 600, color: '#4b5563' }}>IN TIME</th>
                                                <th style={{ padding: '10px 14px', fontWeight: 600, color: '#4b5563' }}>OUT TIME</th>
                                                <th style={{ padding: '10px 14px', fontWeight: 600, color: '#4b5563' }}>IDENTIFICATION (MAX 20 CHARS)</th>
                                                <th style={{ padding: '10px 14px', fontWeight: 600, color: '#4b5563' }}>STATUS CATEGORY</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {cameraRows.map((row, index) => (
                                                <tr key={index} style={{ borderBottom: index < cameraRows.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                                                    <td style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 600, color: '#9ca3af' }}>{index + 1}</td>
                                                    <td style={{ padding: '10px 14px' }}>
                                                        <input
                                                            type="text"
                                                            value={row.inTime}
                                                            onChange={e => handleRowChange(index, 'inTime', e.target.value)}
                                                            placeholder="e.g. 10:00 AM"
                                                            style={{ border: '1px solid #e5e7eb', borderRadius: '6px', padding: '6px 10px', fontSize: '13px', color: '#374151', outline: 'none', width: '100%', boxSizing: 'border-box' }}
                                                        />
                                                    </td>
                                                    <td style={{ padding: '10px 14px' }}>
                                                        <input
                                                            type="text"
                                                            value={row.outTime}
                                                            onChange={e => handleRowChange(index, 'outTime', e.target.value)}
                                                            placeholder="e.g. 10:15 AM"
                                                            style={{ border: '1px solid #e5e7eb', borderRadius: '6px', padding: '6px 10px', fontSize: '13px', color: '#374151', outline: 'none', width: '100%', boxSizing: 'border-box' }}
                                                        />
                                                    </td>
                                                    <td style={{ padding: '10px 14px' }}>
                                                        <input
                                                            type="text"
                                                            value={row.identification}
                                                            maxLength={20}
                                                            onChange={e => handleRowChange(index, 'identification', e.target.value)}
                                                            placeholder="Identification"
                                                            style={{ border: '1px solid #e5e7eb', borderRadius: '6px', padding: '6px 10px', fontSize: '13px', color: '#374151', outline: 'none', width: '100%', boxSizing: 'border-box' }}
                                                        />
                                                    </td>
                                                    <td style={{ padding: '10px 14px' }}>
                                                        <select
                                                            value={row.statusKey}
                                                            onChange={e => handleRowChange(index, 'statusKey', e.target.value)}
                                                            style={{ border: '1px solid #e5e7eb', borderRadius: '6px', padding: '6px 10px', fontSize: '13px', color: '#374151', outline: 'none', background: '#fff', cursor: 'pointer', width: '100%', boxSizing: 'border-box' }}
                                                        >
                                                            <option value="">Select Category</option>
                                                            {CATEGORIES.filter(cat => cat.key !== 'total_walkin' && cat.key !== 'walkin').map(cat => (
                                                                <option key={cat.key} value={cat.key}>{cat.label}</option>
                                                            ))}
                                                        </select>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <button
                                        type="button"
                                        onClick={handleAddMoreRows}
                                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'transparent', border: 'none', color: '#2563eb', cursor: 'pointer', fontSize: '13px', fontWeight: 600, outline: 'none' }}
                                    >
                                        <FaPlusCircle /> Add 10 More Rows
                                    </button>
                                    
                                    <button
                                        type="button"
                                        onClick={handleSaveCameraCheck}
                                        disabled={savingCameraChecks}
                                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#111827', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 20px', fontSize: '13px', cursor: 'pointer', fontWeight: 600, transition: 'background-color 0.2s', outline: 'none' }}
                                    >
                                        <FaSave /> {savingCameraChecks ? 'Saving...' : 'Save Camera Logs'}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '40px 0', color: '#6b7280', border: '1px dashed #e5e7eb', borderRadius: '8px', fontSize: '13px' }}>
                                Please select a Store Branch from the dropdown above to start entering camera checks.
                            </div>
                        )}
                    </div>
                )}




                {/* Main Table Card */}
                {(user?.role !== 'telecaller' || telecallerTab === 'report') && (
                    <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e5e7eb', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                    {/* Table Header area with Title, Filters, and Export Button */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', padding: '16px 20px', borderBottom: '1px solid #e5e7eb', background: '#fff' }}>
                        <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#111827', margin: 0 }}>
                            Comparison Statistics
                        </h2>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '12px', fontWeight: 600, color: '#4b5563' }}>Store Branch:</span>
                                {user?.role === 'store_admin' ? (
                                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#111827' }}>{storeFilter}</span>
                                ) : (
                                    <select
                                        value={storeFilter}
                                        onChange={e => setStoreFilter(e.target.value)}
                                        style={{ border: '1px solid #e5e7eb', borderRadius: '6px', padding: '4px 10px', fontSize: '12px', color: '#374151', outline: 'none', background: '#fff', cursor: 'pointer', minWidth: '150px' }}
                                    >
                                        {['super_admin', 'admin', 'hr_admin', 'telecaller'].includes(user?.role) && <option value="All">All</option>}
                                        <option value="">Select Store</option>
                                        {branches.map((b, i) => <option key={i} value={b.workingBranch}>{b.workingBranch}</option>)}
                                    </select>
                                )}
                            </div>
                            
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '12px', fontWeight: 600, color: '#4b5563' }}>Date Range:</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '3px 8px', background: '#fff' }}>
                                    <input
                                        type="date"
                                        value={logStartDate}
                                        onChange={e => setLogStartDate(e.target.value)}
                                        style={{ border: 'none', fontSize: '12px', color: '#374151', outline: 'none', background: 'transparent', cursor: 'pointer', padding: 0 }}
                                    />
                                    <span style={{ fontSize: '12px', color: '#9ca3af', fontWeight: 500 }}>to</span>
                                    <input
                                        type="date"
                                        value={logEndDate}
                                        onChange={e => setLogEndDate(e.target.value)}
                                        style={{ border: 'none', fontSize: '12px', color: '#374151', outline: 'none', background: 'transparent', cursor: 'pointer', padding: 0 }}
                                    />
                                </div>
                            </div>

                            {storeFilter && (
                                <button
                                    type="button"
                                    onClick={handleDownloadReport}
                                    style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#111827', color: '#fff', border: 'none', borderRadius: '8px', padding: '6px 12px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s', outline: 'none' }}
                                >
                                    <FaDownload /> Export Report
                                </button>
                            )}
                        </div>
                    </div>

                    {!storeFilter ? (
                        <div style={{ textAlign: 'center', padding: '40px 0', color: '#6b7280', fontSize: '13px' }}>
                            Please select a Store Branch from the dropdown above to view comparison statistics.
                        </div>
                    ) : loading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}>
                            <div style={{ width: '32px', height: '32px', border: '3px solid #e5e7eb', borderTopColor: '#111827', borderRadius: '50%', animation: 'walkincount-spin 0.8s linear infinite' }} />
                        </div>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid #e5e7eb', background: '#f9fafb' }}>
                                        <th style={{ padding: '14px 20px', fontWeight: 600, color: '#374151', width: '34%' }}>STATUS CATEGORY</th>
                                        <th style={{ padding: '14px 20px', fontWeight: 600, color: '#374151', width: '33%' }}>IN APP</th>
                                        <th style={{ padding: '14px 20px', fontWeight: 600, color: '#374151', width: '33%' }}>IN CAM</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {CATEGORIES.map((cat, idx) => {
                                        const inAppVal = inAppCounts[cat.key] ?? 0;
                                        const isEven = idx % 2 === 0;
                                        
                                        return (
                                            <tr key={cat.key} style={{ borderBottom: '1px solid #f3f4f6', background: isEven ? '#fff' : '#fcfcfc', transition: 'background 0.15s' }}>
                                                <td style={{ padding: '12px 20px', fontWeight: 600, color: '#111827' }}>
                                                    <span className="tooltip-container" tabIndex="0">
                                                        {cat.label}
                                                        <span className="tooltip-text">{cat.tooltip}</span>
                                                    </span>
                                                </td>
                                                <td style={{ padding: '12px 20px', fontWeight: 700, color: inAppVal > 0 ? '#2563eb' : '#6b7280', fontSize: '14px' }}>
                                                    {inAppVal}
                                                </td>
                                                <td style={{ padding: '12px 20px', fontWeight: 700, color: '#111827' }}>
                                                    {rowValues[cat.key].inCam || '-'}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
                )}
            </div>

            {/* Spinner and Tooltip styles */}
            <style>{`
                @keyframes walkincount-spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                .tooltip-container {
                    position: relative;
                    display: inline-flex;
                    align-items: center;
                    cursor: help;
                }
                .tooltip-text {
                    visibility: hidden;
                    width: 240px;
                    background-color: #1f2937;
                    color: #fff;
                    text-align: center;
                    border-radius: 8px;
                    padding: 8px 12px;
                    position: absolute;
                    z-index: 100;
                    bottom: 125%;
                    left: 0;
                    opacity: 0;
                    transition: opacity 0.2s, visibility 0.2s;
                    font-size: 11px;
                    font-weight: 500;
                    line-height: 1.4;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                    pointer-events: none;
                    white-space: normal;
                }
                .tooltip-text::after {
                    content: "";
                    position: absolute;
                    top: 100%;
                    left: 20px;
                    border-width: 5px;
                    border-style: solid;
                    border-color: #1f2937 transparent transparent transparent;
                }
                .tooltip-container:hover .tooltip-text,
                .tooltip-container:focus-within .tooltip-text {
                    visibility: visible;
                    opacity: 1;
                }
            `}</style>
        </div>
    );
};

export default WalkinCount;
