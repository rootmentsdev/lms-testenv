import React, { useState, useEffect, useRef } from 'react';

import { useSelector } from 'react-redux';
import SideNav from "../../components/SideNav/SideNav";
import ModileNav from "../../components/SideNav/ModileNav";
import baseUrl from "../../api/api";
import { FaSave, FaCheckCircle, FaUndo, FaTrashAlt, FaPlusCircle, FaVideo, FaEdit, FaClock, FaDownload } from 'react-icons/fa';

const CATEGORIES = [
    { key: 'total_walkin', label: 'TOTAL WALKIN', tooltip: "New walk-ins + repeat walk-ins for the selected date." },
    { key: 'walkin', label: 'WALKIN', tooltip: "Customers newly created on the selected date." },
    { key: 'new_loss', label: 'NEW LOSS', tooltip: "New walk-ins that became Loss on the selected date." },
    { key: 'new_walkin_booking', label: 'NEW WALKIN BOOKING', tooltip: "New walk-ins booked or shoe billed on the selected date." },
    { key: 'new_walkin_rentout', label: 'NEW WALKIN RENTOUT', tooltip: "New walk-ins rented out on the selected date." },
    { key: 'new_cancelled', label: 'NEW CANCELLED', tooltip: "New walk-ins cancelled on the selected date." },
    { key: 'new_others', label: 'NEW OTHERS', tooltip: "New walk-ins not fitting the above categories." },
    { key: 'repeat_loss', label: 'REPEAT LOSS', tooltip: "Old walk-ins that became Loss again on the selected date." },
    { key: 'repeat_rentout', label: 'REPEAT RENTOUT', tooltip: "Old walk-ins rented out on the selected date." },
    { key: 'repeat_return', label: 'REPEAT RETURN', tooltip: "Old walk-ins returned or bill returned on the selected date." },
    { key: 'revisit_repeat_trial', label: 'REVISIT REPEAT TRIAL', tooltip: "Old walk-ins revisited for Trial on the selected date." },
    { key: 'repeat_booking', label: 'REPEAT BOOKING', tooltip: "Old walk-ins booked or shoe billed on the selected date." },
    { key: 'revisit_reissue', label: 'REVISIT REISSUE', tooltip: "Old walk-ins revisited for Reissue on the selected date." },
    { key: 'revisit_loss', label: 'REVISIT LOSS', tooltip: "Old revisited walk-ins marked Loss on the selected date." },
    { key: 'repeat_cancelled', label: 'REPEAT CANCELLED', tooltip: "Old walk-ins cancelled on the selected date." },
    { key: 'repeat_others', label: 'REPEAT OTHERS', tooltip: "Old walk-ins updated but not fitting the above categories." }
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
    const [cameraForm, setCameraForm] = useState({
        statusKey: '',
        store: '',
        timeDuration: '09:00 AM to 09:30 AM',
        inCamCount: '',
        remarks: '',
        date: new Date().toISOString().split('T')[0],
        editingId: null
    });
    const [cameraChecks, setCameraChecks] = useState([]);
    const [savingCameraCheck, setSavingCameraCheck] = useState(false);

    // Date range selection for log viewer
    const [logStartDate, setLogStartDate] = useState(selectedDate);
    const [logEndDate, setLogEndDate] = useState(selectedDate);

    // Sync log date range with selectedDate by default
    useEffect(() => {
        setLogStartDate(selectedDate);
        setLogEndDate(selectedDate);
    }, [selectedDate]);

    // Time Slider Local Toggle State
    const [showClockPicker, setShowClockPicker] = useState(false);

    // Request tracking refs for race-condition prevention
    const activeRequestRef = useRef(0);
    const abortControllerRef = useRef(null);


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

    // Save Camera Check Log Entry
    const handleSaveCameraCheck = async (e) => {
        e.preventDefault();
        if (!cameraForm.store || cameraForm.store === 'All') {
            setMessage({ text: 'Please select a valid store for the camera check entry.', type: 'error' });
            return;
        }
        if (!cameraForm.statusKey) {
            setMessage({ text: 'Please select a status category.', type: 'error' });
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
                    statusKey: '',
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
        csvContent += `STATUS CATEGORY,IN CAM,SALES REPORT,IN APP,REMARKS\r\n`;
        
        // Add rows
        CATEGORIES.forEach(cat => {
            const inCam = rowValues[cat.key]?.inCam || '-';
            const salesReport = rowValues[cat.key]?.salesReport || '-';
            const inAppVal = inAppCounts[cat.key] ?? 0;
            const remarks = rowValues[cat.key]?.remarks || '-';
            
            const escapedLabel = `"${cat.label.replace(/"/g, '""')}"`;
            const escapedInCam = `"${String(inCam).replace(/"/g, '""')}"`;
            const escapedSalesReport = `"${String(salesReport).replace(/"/g, '""')}"`;
            const escapedInApp = `"${String(inAppVal).replace(/"/g, '""')}"`;
            const escapedRemarks = `"${String(remarks).replace(/"/g, '""')}"`;
            
            csvContent += `${escapedLabel},${escapedInCam},${escapedSalesReport},${escapedInApp},${escapedRemarks}\r\n`;
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
                        <FaVideo style={{ color: '#111827', fontSize: '18px' }} />
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
                                <option value="">Select Category</option>
                                {CATEGORIES.filter(cat => cat.key !== 'total_walkin' && cat.key !== 'walkin').map(cat => (
                                    <option key={cat.key} value={cat.key}>{cat.label}</option>
                                ))}
                            </select>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', position: 'relative' }}>
                            <span style={{ fontSize: '12px', fontWeight: 600, color: '#4b5563' }}>Time Duration</span>
                            <button
                                type="button"
                                onClick={() => setShowClockPicker(!showClockPicker)}
                                style={{ display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '8px 12px', fontSize: '13px', color: '#374151', background: '#fff', cursor: 'pointer', outline: 'none', textAlign: 'left', minWidth: '180px', fontWeight: 500 }}
                            >
                                <FaClock style={{ color: '#111827' }} /> {cameraForm.timeDuration}
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
                                    zIndex: 100,
                                }}>
                                    <TimeRangeSlider
                                        value={cameraForm.timeDuration}
                                        onChange={(newVal) => setCameraForm(prev => ({ ...prev, timeDuration: newVal }))}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowClockPicker(false)}
                                        style={{ alignSelf: 'flex-end', background: '#111827', color: '#fff', border: 'none', borderRadius: '6px', padding: '6px 12px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', outline: 'none', marginTop: '12px' }}
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
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', width: '100%', background: '#111827', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 16px', fontSize: '13px', cursor: 'pointer', fontWeight: 600, transition: 'background-color 0.2s' }}
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
                                Logged Camera Checks {storeFilter ? `for ${storeFilter} (${logStartDate} to ${logEndDate})` : ''}
                            </h2>
                            {storeFilter && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ background: '#f3f4f6', color: '#374151', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 600 }}>
                                        {cameraChecks.length} entries
                                    </span>
                                    <button
                                        type="button"
                                        onClick={handleDownloadCameraChecksReport}
                                        style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#111827', color: '#fff', border: 'none', borderRadius: '6px', padding: '4px 10px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s', outline: 'none' }}
                                    >
                                        <FaDownload /> Export Logs
                                    </button>
                                </div>
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
                                <span style={{ fontSize: '11px', fontWeight: 600, color: '#4b5563' }}>Date Range</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '5px 12px', background: '#fff' }}>
                                    <input
                                        type="date"
                                        value={logStartDate}
                                        onChange={e => setLogStartDate(e.target.value)}
                                        style={{ border: 'none', fontSize: '13px', color: '#374151', outline: 'none', background: 'transparent', cursor: 'pointer', padding: 0 }}
                                    />
                                    <span style={{ fontSize: '13px', color: '#9ca3af', fontWeight: 500 }}>to</span>
                                    <input
                                        type="date"
                                        value={logEndDate}
                                        onChange={e => setLogEndDate(e.target.value)}
                                        style={{ border: 'none', fontSize: '13px', color: '#374151', outline: 'none', background: 'transparent', cursor: 'pointer', padding: 0 }}
                                    />
                                </div>
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
                                        <th style={{ padding: '10px 14px', fontWeight: 600, color: '#4b5563' }}>DATE</th>
                                        <th style={{ padding: '10px 14px', fontWeight: 600, color: '#4b5563' }}>STORE</th>
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
                                                <td style={{ padding: '10px 14px', fontWeight: 600, color: '#4b5563' }}>{log.date}</td>
                                                <td style={{ padding: '10px 14px', fontWeight: 600, color: '#111827' }}>{log.store || '-'}</td>
                                                <td style={{ padding: '10px 14px', fontWeight: 600, color: '#111827' }}>{log.timeDuration}</td>
                                                <td style={{ padding: '10px 14px', color: '#4b5563' }}>
                                                    <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 600 }}>
                                                        {categoryLabel}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '10px 14px', fontWeight: 700, color: '#111827' }}>{log.inCamCount}</td>
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
                                                    {['super_admin', 'admin', 'hr_admin'].includes(user?.role) && (
                                                        <button
                                                            onClick={() => handleDeleteCameraCheck(log._id)}
                                                            style={{ border: 'none', background: 'transparent', color: '#111827', cursor: 'pointer', padding: '4px', fontSize: '14px' }}
                                                            title="Delete Entry"
                                                        >
                                                            <FaTrashAlt />
                                                        </button>
                                                    )}
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
                        {/* Table Header area with Title and Export Button */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #e5e7eb', background: '#fff' }}>
                            <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#111827', margin: 0 }}>
                                Comparison Statistics
                            </h2>
                            <button
                                type="button"
                                onClick={handleDownloadReport}
                                style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#111827', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 14px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s', outline: 'none' }}
                            >
                                <FaDownload /> Export Report
                            </button>
                        </div>
                        {loading ? (
                            <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}>
                                <div style={{ width: '32px', height: '32px', border: '3px solid #e5e7eb', borderTopColor: '#111827', borderRadius: '50%', animation: 'walkincount-spin 0.8s linear infinite' }} />
                            </div>
                        ) : (
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid #e5e7eb', background: '#f9fafb' }}>
                                            <th style={{ padding: '14px 20px', fontWeight: 600, color: '#374151', width: '20%' }}>STATUS CATEGORY</th>
                                            <th style={{ padding: '14px 20px', fontWeight: 600, color: '#374151', width: '20%' }}>IN CAM</th>
                                            <th style={{ padding: '14px 20px', fontWeight: 600, color: '#374151', width: '20%' }}>SALES REPORT</th>
                                            <th style={{ padding: '14px 20px', fontWeight: 600, color: '#374151', width: '20%' }}>IN APP</th>
                                            <th style={{ padding: '14px 20px', fontWeight: 600, color: '#374151', width: '20%' }}>REMARKS</th>
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
                                                    <td style={{ padding: '12px 20px', fontWeight: 700, color: '#111827' }}>
                                                        {rowValues[cat.key].inCam || '-'}
                                                    </td>
                                                    <td style={{ padding: '12px 20px', color: '#374151' }}>
                                                        {rowValues[cat.key].salesReport || '-'}
                                                    </td>
                                                    <td style={{ padding: '12px 20px', fontWeight: 700, color: inAppVal > 0 ? '#2563eb' : '#6b7280', fontSize: '14px' }}>
                                                        {inAppVal}
                                                    </td>
                                                    <td style={{ padding: '12px 20px', color: '#6b7280', fontStyle: rowValues[cat.key].remarks ? 'normal' : 'italic' }}>
                                                        {rowValues[cat.key].remarks || '-'}
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
