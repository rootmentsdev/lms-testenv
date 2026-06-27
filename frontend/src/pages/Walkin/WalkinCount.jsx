import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import SideNav from "../../components/SideNav/SideNav";
import ModileNav from "../../components/SideNav/ModileNav";
import baseUrl from "../../api/api";
import { FaSave, FaCheckCircle, FaUndo } from 'react-icons/fa';

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
    { key: 'revisit_loss', label: 'REVISIT LOSS' }
];

const HARDCODED_STORES = [
    'Z-Edapally1', 'G-Edappally', 'Z- Edappal', 'Z.Perinthalmanna',
    'Z.Kottakkal', 'G.Kottayam', 'G.Perumbavoor', 'G.Thrissur', 'G.Chavakkad',
    'G.Calicut', 'G.Vadakara', 'G.Edappal', 'G.Perinthalmanna', 'G.Kottakkal',
    'G.Manjeri', 'G.Palakkad', 'G.Kalpetta', 'G.Kannur', 'G.MG Road',
    'Dappr Squad', 'office', 'production', 'WAREHOUSE'
];

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
                if (branchList.length > 0) {
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
        if (!selectedDate || storeFilter === 'All' || storeFilter === '') return;
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
            }
        } catch (err) {
            console.error("Error loading count data:", err);
            setMessage({ text: 'Failed to load count data.', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    // Load data when filters change
    useEffect(() => {
        if (storeFilter !== 'All') {
            loadCountData();
        }
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

                {/* Filter Card */}
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center', padding: '16px', background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#4b5563' }}>Store Branch</span>
                        <select
                            value={storeFilter}
                            onChange={e => setStoreFilter(e.target.value)}
                            style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '8px 14px', fontSize: '13px', color: '#374151', outline: 'none', background: '#fff', cursor: 'pointer', minWidth: '200px' }}
                        >
                            {branches.map((b, i) => <option key={i} value={b.workingBranch}>{b.workingBranch}</option>)}
                        </select>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#4b5563' }}>Selected Date</span>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={e => setSelectedDate(e.target.value)}
                            style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '8px 14px', fontSize: '13px', color: '#374151', outline: 'none', background: '#fff', cursor: 'pointer' }}
                        />
                    </div>

                    <div style={{ marginLeft: 'auto', display: 'flex', gap: '10px', alignSelf: 'flex-end' }}>
                        <button
                            onClick={loadCountData}
                            disabled={loading}
                            style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '8px 14px', fontSize: '13px', color: '#374151', cursor: 'pointer', fontWeight: 600 }}
                        >
                            <FaUndo /> Reload
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={loading || saving}
                            style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#111827', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 16px', fontSize: '13px', cursor: 'pointer', fontWeight: 600 }}
                        >
                            <FaSave /> {saving ? 'Saving...' : 'Save Comparison'}
                        </button>
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

                {/* Main Table Card */}
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
                                        <th style={{ padding: '14px 20px', fontWeight: 600, color: '#374151', width: '120px' }}>IN CAM</th>
                                        <th style={{ padding: '14px 20px', fontWeight: 600, color: '#374151', width: '150px' }}>SALES REPORT</th>
                                        <th style={{ padding: '14px 20px', fontWeight: 600, color: '#374151', width: '120px' }}>IN APP</th>
                                        <th style={{ padding: '14px 20px', fontWeight: 600, color: '#374151', width: '140px' }}>TIME SEEN</th>
                                        <th style={{ padding: '14px 20px', fontWeight: 600, color: '#374151' }}>REMARKS</th>
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
                                                <td style={{ padding: '8px 20px' }}>
                                                    <input
                                                        type="number"
                                                        value={rowValues[cat.key].inCam}
                                                        placeholder="-"
                                                        onChange={e => handleInputChange(cat.key, 'inCam', e.target.value)}
                                                        style={{ width: '80px', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '6px 10px', fontSize: '13px', outline: 'none' }}
                                                    />
                                                </td>
                                                <td style={{ padding: '8px 20px' }}>
                                                    <input
                                                        type="text"
                                                        value={rowValues[cat.key].salesReport}
                                                        placeholder="-"
                                                        onChange={e => handleInputChange(cat.key, 'salesReport', e.target.value)}
                                                        style={{ width: '110px', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '6px 10px', fontSize: '13px', outline: 'none' }}
                                                    />
                                                </td>
                                                <td style={{ padding: '12px 20px', fontWeight: 700, color: inAppVal > 0 ? '#2563eb' : '#6b7280', fontSize: '14px' }}>
                                                    {inAppVal}
                                                </td>
                                                <td style={{ padding: '8px 20px' }}>
                                                    <input
                                                        type="text"
                                                        placeholder="e.g. 14:30"
                                                        value={rowValues[cat.key].timeSeen}
                                                        onChange={e => handleInputChange(cat.key, 'timeSeen', e.target.value)}
                                                        style={{ width: '110px', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '6px 10px', fontSize: '13px', outline: 'none' }}
                                                    />
                                                </td>
                                                <td style={{ padding: '8px 20px' }}>
                                                    <input
                                                        type="text"
                                                        placeholder="Enter remarks..."
                                                        value={rowValues[cat.key].remarks}
                                                        onChange={e => handleInputChange(cat.key, 'remarks', e.target.value)}
                                                        style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '6px 10px', fontSize: '13px', outline: 'none' }}
                                                    />
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
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
