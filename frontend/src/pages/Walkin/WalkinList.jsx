import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import Header from "../../components/Header/Header";
import SideNav from "../../components/SideNav/SideNav";
import ModileNav from "../../components/SideNav/ModileNav";
import baseUrl from "../../api/api";
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

/* ---------- Normalization and Spelling fixes helpers ---------- */
const BRAND_TOKENS = new Set(["zorucci", "grooms", "suitor", "guy", "sg"]);

function canonFixes(s) {
    return s
        .replace(/\bedap{1,2}a?l{1,3}y\b/g, "edappally")
        .replace(/\bedap{1,2}a?l{1,3}i\b/g, "edappally")
        .replace(/\bmanjeri\b/g, "manjery")
        .replace(/\bperinthalmana\b/g, "perinthalmanna")
        .replace(/\bkottakal\b/g, "kottakkal")
        .replace(/\bkalpeta\b/g, "kalpetta")
        .replace(/\bzoruc+i\b/g, "zorucci");
}

function norm(s) {
    const x = String(s || "")
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, " ")
        .trim();
    return canonFixes(x);
}

function locationKey(name) {
    const tokens = norm(name)
        .split(" ")
        .filter((t) => t && !BRAND_TOKENS.has(t));
    return tokens.join(" ");
}

const STATUS_OPTIONS = [
    'Booked',
    'Rentout',
    'Return',
    'Trial',
    'Loss',
    'Enquiry',
    'Booking & Rentout',
    'Reissue',
    'New Booking',
    'Revisit Booking',
    'Revisit Loss',
    'New Walkin'
];

const UPDATE_STATUS_OPTIONS = [
    'Rentout',
    'Return',
    'Trial',
    'Reissue',
    'Revisit Booking',
    'New Walkin'
];

const WalkinList = () => {
    const user = useSelector((state) => state.auth.user);
    const token = localStorage.getItem('token');

    // Inject DM Sans font from Google Fonts
    useEffect(() => {
        if (!document.getElementById('dm-sans-font')) {
            const link = document.createElement('link');
            link.id = 'dm-sans-font';
            link.rel = 'stylesheet';
            link.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap';
            document.head.appendChild(link);
        }
    }, []);

    // State for walkins list
    const [walkins, setWalkins] = useState([]);
    const [filteredWalkins, setFilteredWalkins] = useState([]);

    // API Data
    const [branches, setBranches] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters and UI State
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [storeFilter, setStoreFilter] = useState('All');

    // Toggle state between Walkin List View and dynamic Add Walkin Form Page View matching screenshot
    const [showAddView, setShowAddView] = useState(false);

    // Customer Exists detection
    const [customerExistsNotification, setCustomerExistsNotification] = useState(false);
    const [customerData, setCustomerData] = useState(null);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Form state for adding Walk-in
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        customerName: '',
        contact: '',
        functionDate: new Date().toISOString().split('T')[0],
        store: '',
        staff: '',
        category: '-',
        subCategory: '-',
        remarks: '',
        status: 'New Walkin'
    });

    // Fetch walkins dynamically from live API
    const loadWalkinsList = async () => {
        try {
            const walkinRes = await fetch(`${baseUrl.baseUrl}api/walkin/list`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            const walkinJson = await walkinRes.json();
            if (walkinJson?.success) {
                setWalkins(walkinJson.data || []);
            }
        } catch (err) {
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch branches and walkins in parallel — skip employees until form is opened
                const [branchRes] = await Promise.all([
                    fetch(`${baseUrl.baseUrl}api/admin/accessible-stores`, {
                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
                    }),
                ]);

                const branchJson = await branchRes.json();
                const branchList = Array.isArray(branchJson?.stores) ? branchJson.stores : (Array.isArray(branchJson?.data) ? branchJson.data : []);
                setBranches(branchList);

                if (branchList.length > 0) {
                    setFormData(prev => ({ ...prev, store: branchList[0]?.workingBranch || '' }));
                }

                // Fetch walkins immediately
                await loadWalkinsList();

            } catch (err) {
            } finally {
                setLoading(false);
            }
        };

        if (token) fetchData();
    }, [token, user?.role]);

    // Load employees lazily only when the add form is opened
    const loadEmployees = async () => {
        if (employees.length > 0) return; // already loaded
        try {
            const empRes = await fetch(`${baseUrl.baseUrl}api/employee/management/with-training-details`, {
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
            });
            const empJson = await empRes.json();
            const empList = Array.isArray(empJson) ? empJson : (Array.isArray(empJson?.data) ? empJson.data : []);
            setEmployees(empList);
        } catch (err) {
        }
    };

    // Handle dynamically filtering walk-in list and binding to dynamic dropdown rules
    useEffect(() => {
        let result = [...walkins];

        // Search Query
        if (searchQuery.trim() !== '') {
            const query = searchQuery.toLowerCase();
            result = result.filter(w =>
                w.customerName.toLowerCase().includes(query) ||
                w.contact.includes(query) ||
                w.staff.toLowerCase().includes(query) ||
                w.store.toLowerCase().includes(query) ||
                w.remarks.toLowerCase().includes(query)
            );
        }

        // Status Filter
        if (statusFilter !== 'All') {
            result = result.filter(w => w.status === statusFilter);
        }

        // Store Filter (For Cluster Manager and Super Admin)
        if (storeFilter !== 'All') {
            result = result.filter(w => {
                const storeNorm = locationKey(w.store);
                const filterNorm = locationKey(storeFilter);
                return storeNorm === filterNorm;
            });
        }

        // Role-Based constraint
        if (user?.role === 'store_admin' && branches.length > 0) {
            const myStoreName = branches[0]?.workingBranch;
            if (myStoreName) {
                result = result.filter(w => {
                    return locationKey(w.store) === locationKey(myStoreName);
                });
            }
        } else if (user?.role === 'cluster_admin' && branches.length > 0) {
            const allowedStoresKeys = branches.map(b => locationKey(b.workingBranch));
            result = result.filter(w => {
                return allowedStoresKeys.includes(locationKey(w.store));
            });
        }

        setFilteredWalkins(result);
        setCurrentPage(1); // Reset page on filter change
    }, [walkins, searchQuery, statusFilter, storeFilter, user?.role, branches]);

    // Pagination calculations
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredWalkins.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredWalkins.length / itemsPerPage);

    const handlePageChange = (pageNumber) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };

    // Form inputs change handler
    const handleInputChange = (e) => {
        const { name, value } = e.target;

        if (name === 'contact') {
            const cleanVal = value.replace(/[^0-9]/g, '');
            setFormData(prev => ({
                ...prev,
                contact: cleanVal
            }));
            if (cleanVal.length === 10) {
                checkCustomer(cleanVal);
            } else {
                setCustomerExistsNotification(false);
                setCustomerData(null);
                setFormData(prev => ({ ...prev, status: 'New Walkin' }));
            }
            return;
        }

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        if (name === 'store') {
            setFormData(prev => ({
                ...prev,
                store: value,
                staff: ''
            }));
        }
    };

    // Check if customer phone number already exists in the database
    const checkCustomer = async (contactVal) => {
        if (!contactVal || contactVal.trim().length < 5) return;
        try {
            const res = await fetch(`${baseUrl.baseUrl}api/walkin/check/${contactVal.trim()}`);
            const json = await res.json();
            if (json.success && json.exists) {
                setCustomerExistsNotification(true);
                setCustomerData(json.data);
                // Pre-populate fields automatically
                setFormData(prev => ({
                    ...prev,
                    customerName: json.data.customerName || prev.customerName,
                    functionDate: json.data.functionDate || prev.functionDate,
                    status: '' // Prompt selection of status
                }));
            } else {
                setCustomerExistsNotification(false);
                setCustomerData(null);
                setFormData(prev => ({
                    ...prev,
                    status: 'New Walkin'
                }));
            }
        } catch (err) {
        }
    };

    // Save Walkin Form directly to live MongoDB database
    const handleFormSubmit = async (e) => {
        e.preventDefault();
        if (!formData.customerName || !formData.contact || !formData.store) {
            alert('Please fill out all required fields.');
            return;
        }
        if (customerExistsNotification && (!formData.status || formData.status === '')) {
            alert('Please select a Walk-in Status.');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`${baseUrl.baseUrl}api/walkin/save`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    customerName: formData.customerName,
                    contact: formData.contact,
                    functionDate: formData.functionDate,
                    store: formData.store,
                    staff: formData.staff || 'None',
                    category: formData.category,
                    subCategory: formData.subCategory,
                    remarks: formData.remarks || '-',
                    status: formData.status,
                    date: formData.date
                })
            });

            const json = await res.json();
            if (json.success) {
                // Refresh data from DB
                await loadWalkinsList();

                // Reset form to defaults
                setFormData({
                    date: new Date().toISOString().split('T')[0],
                    customerName: '',
                    contact: '',
                    functionDate: new Date().toISOString().split('T')[0],
                    store: branches[0]?.workingBranch || '',
                    staff: '',
                    category: '-',
                    subCategory: '-',
                    remarks: '',
                    status: 'New Walkin'
                });
                setCustomerExistsNotification(false);
                setCustomerData(null);
                setShowAddView(false);
            } else {
                alert(`Error: ${json.message}`);
            }
        } catch (err) {
            alert("Connection error while attempting to save walk-in.");
        } finally {
            setLoading(false);
        }
    };

    // Dynamic employee listing based on selected store to enforce role mapping rules
    const getEmployeesForSelectedStore = (storeName) => {
        if (!storeName) return [];
        const normSelectedStore = locationKey(storeName);

        return employees.filter(emp => {
            const empStore = emp.store_name || emp.workingBranch || '';
            return locationKey(empStore) === normSelectedStore;
        });
    };

    const currentStoreEmployees = getEmployeesForSelectedStore(formData.store);

    // Sort Arrows double-indicator icon matching mockup image exactly
    const SortArrow = () => (
        <span className="inline-flex flex-col ml-1.5 align-middle text-[8px] text-gray-300">
            <span>▲</span>
            <span className="-mt-1">▼</span>
        </span>
    );

    return (
        <div className="mb-[70px] text-[14px] bg-white min-h-screen" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            <Header name={showAddView ? "Add Walk-In" : "Walk-In List"} />
            <SideNav />
            <div className="md:hidden sm:block">
                <ModileNav />
            </div>

            {/* Layout Grid Container matching standard dashboard spacing perfectly */}
            <div className="md:ml-[120px] mt-[68px] sm:mt-[68px] px-4 sm:px-6 lg:px-12 transition-all duration-300">
                {showAddView ? (
                    /* ADD WALKIN FORM VIEW MATCHING SECOND SCREENSHOT */
                    <div className="mt-8 mb-6 max-w-5xl mx-auto">

                        {/* Back navigation option matching mockup arrow */}
                        <button
                            onClick={() => {
                                setCustomerExistsNotification(false);
                                setCustomerData(null);
                                setShowAddView(false);
                            }}
                            className="flex items-center gap-2 text-gray-500 hover:text-gray-800 font-bold text-sm mb-4 transition-colors bg-transparent border-0 cursor-pointer"
                        >
                            <span>←</span> Add Walkin Form
                        </button>

                        <h2 className="text-xl font-bold text-gray-800 mb-6">Walkin Details</h2>

                        {/* Premium White form card matching mockup exactly */}
                        <div className="bg-white rounded-lg border border-gray-150 p-6 sm:p-8 shadow-xs">
                            <form onSubmit={handleFormSubmit} className="space-y-6">

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">Customer Mobile Number <span className="text-red-500">*</span></label>
                                        <input type="tel" name="contact" required maxLength={10} placeholder="Enter Mobile Number" value={formData.contact} onChange={handleInputChange} onBlur={(e) => checkCustomer(e.target.value)} className="w-full border border-gray-300 bg-white rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 text-gray-700 font-semibold" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">Customer Name <span className="text-red-500">*</span></label>
                                        <input type="text" name="customerName" required placeholder="Enter Customer Name" value={formData.customerName} onChange={handleInputChange} className="w-full border border-gray-300 bg-white rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 text-gray-700 font-semibold" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">Function Date <span className="text-red-500">*</span></label>
                                        <input type="date" name="functionDate" required value={formData.functionDate} onChange={handleInputChange} className="w-full border border-gray-300 bg-white rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 text-gray-700 font-semibold cursor-pointer" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                                    {(user?.role === 'super_admin' || user?.role === 'cluster_admin') && (
                                        <div>
                                            <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">Store <span className="text-red-500">*</span></label>
                                            <select name="store" required value={formData.store} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 text-gray-700 bg-white cursor-pointer font-semibold">
                                                {branches.map((b, idx) => (<option key={idx} value={b.workingBranch}>{b.workingBranch}</option>))}
                                            </select>
                                        </div>
                                    )}
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">Creating as <span className="text-red-500">*</span></label>
                                        <select name="staff" required value={formData.staff} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 text-gray-700 bg-white cursor-pointer font-semibold">
                                            <option value="">Select</option>
                                            {currentStoreEmployees.map((emp, idx) => (<option key={idx} value={emp.username}>{emp.username}</option>))}
                                        </select>
                                    </div>
                                </div>

                                <div className="border-t border-gray-100 pt-6 mt-4">
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Fitting Details (Optional)</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">Visit Date</label>
                                            <input type="date" name="date" value={formData.date} onChange={handleInputChange} className="w-full border border-gray-300 bg-white rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 text-gray-700 font-semibold cursor-pointer" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">Category</label>
                                            <input type="text" name="category" placeholder="e.g. Groom" value={formData.category} onChange={handleInputChange} className="w-full border border-gray-300 bg-white rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 text-gray-700" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">Sub Category</label>
                                            <input type="text" name="subCategory" placeholder="e.g. 2PCS Suit" value={formData.subCategory} onChange={handleInputChange} className="w-full border border-gray-300 bg-white rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 text-gray-700" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">Status</label>
                                            <select name="status" value={formData.status} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 text-gray-700 bg-white cursor-pointer font-semibold">
                                                {STATUS_OPTIONS.map((opt) => (<option key={opt} value={opt}>{opt}</option>))}
                                            </select>
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">Remarks</label>
                                            <textarea name="remarks" rows={1} placeholder="Enter fit remarks, style details..." value={formData.remarks} onChange={handleInputChange} className="w-full border border-gray-300 bg-white rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 text-gray-700" />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-center pt-8 border-t border-gray-100">
                                    <button type="submit" disabled={loading} className="bg-[#2A2A2A] hover:bg-black text-white px-16 py-3 rounded-md transition-all duration-200 font-bold shadow-md hover:shadow-lg transform active:scale-95 text-center min-w-[180px] cursor-pointer text-sm">
                                        {loading ? 'Saving...' : 'Save'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                ) : (
                    /* ── WALK-IN LIST VIEW ── */
                    <>
                        {/* Header */}
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:'24px', marginBottom:'16px' }}>
                            <h1 style={{ fontSize:'22px', fontWeight:700, color:'#111827', margin:0 }}>Walk In List</h1>
                            <button
                                onClick={() => { if(branches.length>0){setFormData(prev=>({...prev,store:branches[0]?.workingBranch||''}))} loadEmployees(); setShowAddView(true); }}
                                style={{ background:'#111827', color:'#fff', border:'none', borderRadius:'10px', padding:'9px 18px', fontSize:'13px', fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', gap:'6px' }}
                            >
                                + New Walk In
                            </button>
                        </div>

                        {/* Filters */}
                        <div style={{ display:'flex', gap:'10px', marginBottom:'16px', alignItems:'center', flexWrap:'wrap' }}>
                            <input
                                type="text"
                                placeholder="Search customer, contact, store..."
                                value={searchQuery}
                                onChange={e=>setSearchQuery(e.target.value)}
                                style={{ border:'1px solid #e5e7eb', borderRadius:'8px', padding:'7px 12px', fontSize:'13px', color:'#374151', outline:'none', width:'260px', background:'#fff' }}
                            />
                            <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} style={{ border:'1px solid #e5e7eb', borderRadius:'8px', padding:'7px 12px', fontSize:'13px', color:'#374151', outline:'none', background:'#fff', cursor:'pointer' }}>
                                <option value="All">All Status</option>
                                {STATUS_OPTIONS.map(opt=><option key={opt} value={opt}>{opt}</option>)}
                            </select>
                            {(user?.role==='super_admin'||user?.role==='cluster_admin') && (
                                <select value={storeFilter} onChange={e=>setStoreFilter(e.target.value)} style={{ border:'1px solid #e5e7eb', borderRadius:'8px', padding:'7px 12px', fontSize:'13px', color:'#374151', outline:'none', background:'#fff', cursor:'pointer' }}>
                                    <option value="All">All Stores</option>
                                    {branches.map((b,i)=><option key={i} value={b.workingBranch}>{b.workingBranch}</option>)}
                                </select>
                            )}
                        </div>

                        {/* Table card */}
                        <div style={{ background:'#fff', borderRadius:'14px', border:'1px solid #f0f0f0', boxShadow:'0 1px 4px rgba(0,0,0,0.05)', overflow:'hidden', marginBottom:'32px' }}>
                            {loading ? (
                                <div style={{ display:'flex', justifyContent:'center', padding:'48px' }}>
                                    <div style={{ width:'28px', height:'28px', border:'2px solid #e5e7eb', borderTopColor:'#111827', borderRadius:'50%', animation:'walkin-spin 0.7s linear infinite' }} />
                                </div>
                            ) : filteredWalkins.length===0 ? (
                                <div style={{ textAlign:'center', padding:'48px', color:'#9ca3af', fontSize:'13px' }}>No walk-in records found.</div>
                            ) : (
                                <>
                                    <div style={{ overflowX:'auto' }}>
                                        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'12px', fontFamily:"'DM Sans', sans-serif" }}>
                                            <thead>
                                                <tr style={{ borderBottom:'1px solid #f3f4f6', background:'#fafafa' }}>
                                                    {['#','DATE','CUSTOMER','CONTACT','FUNCTION DATE','STORE','STAFF','CATEGORY','SUB CATEGORY','REMARKS','REPEAT COUNT','STATUS'].map(h=>(
                                                        <th key={h} style={{ padding:'8px 12px', textAlign:(h==='#'||h==='REPEAT COUNT'||h==='STATUS')?'center':'left', fontSize:'10px', fontWeight:600, color:'#9ca3af', letterSpacing:'0.06em', whiteSpace:'nowrap' }}>{h}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {currentItems.map((w,index)=>{
                                                    const statusColors = {
                                                        'Booked':            { bg:'#dcfce7', color:'#16a34a' },
                                                        'New Booking':       { bg:'#dcfce7', color:'#16a34a' },
                                                        'Revisit Booking':   { bg:'#dcfce7', color:'#16a34a' },
                                                        'Rentout':           { bg:'#fce7f3', color:'#be185d' },
                                                        'Rent Out':          { bg:'#fce7f3', color:'#be185d' },
                                                        'Booking & Rentout': { bg:'#fce7f3', color:'#be185d' },
                                                        'Return':            { bg:'#fef3c7', color:'#d97706' },
                                                        'Trial':             { bg:'#e0e7ff', color:'#4338ca' },
                                                        'Loss':              { bg:'#fee2e2', color:'#dc2626' },
                                                        'Revisit Loss':      { bg:'#fee2e2', color:'#dc2626' },
                                                        'Enquiry':           { bg:'#f3f4f6', color:'#6b7280' },
                                                        'New Walkin':        { bg:'#dbeafe', color:'#2563eb' },
                                                        'Reissue':           { bg:'#ede9fe', color:'#7c3aed' },
                                                    };
                                                    const sc = statusColors[w.status] || { bg:'#f3f4f6', color:'#6b7280' };
                                                    return (
                                                        <tr key={w._id||index}
                                                            style={{ borderBottom:'1px solid #f9fafb', background:'#fff', transition:'background 0.1s' }}
                                                            onMouseEnter={e=>e.currentTarget.style.background='#fafafa'}
                                                            onMouseLeave={e=>e.currentTarget.style.background='#fff'}
                                                        >
                                                            <td style={{ padding:'11px 12px', textAlign:'center', color:'#9ca3af' }}>{indexOfFirstItem+index+1}</td>
                                                            <td style={{ padding:'11px 12px', whiteSpace:'nowrap', color:'#374151' }}>{w.date}</td>
                                                            <td style={{ padding:'11px 12px', color:'#111827', fontWeight:500, whiteSpace:'nowrap' }}>{w.customerName}</td>
                                                            <td style={{ padding:'11px 12px', whiteSpace:'nowrap', color:'#374151' }}>+91 {w.contact}</td>
                                                            <td style={{ padding:'11px 12px', whiteSpace:'nowrap', color:'#374151' }}>{w.functionDate}</td>
                                                            <td style={{ padding:'11px 12px', whiteSpace:'nowrap', color:'#374151' }}>{w.store}</td>
                                                            <td style={{ padding:'11px 12px', whiteSpace:'nowrap', color:'#374151' }}>{w.staff}</td>
                                                            <td style={{ padding:'11px 12px', whiteSpace:'nowrap', color:'#374151' }}>{w.category}</td>
                                                            <td style={{ padding:'11px 12px', whiteSpace:'nowrap', color:'#374151' }}>{w.subCategory}</td>
                                                            <td style={{ padding:'11px 12px', color:'#6b7280', maxWidth:'120px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }} title={w.remarks}>{w.remarks||'–'}</td>
                                                            <td style={{ padding:'11px 12px', textAlign:'center', color:'#374151' }}>{w.repeatCount}</td>
                                                            <td style={{ padding:'11px 12px', textAlign:'center' }}>
                                                                <span style={{ background:sc.bg, color:sc.color, borderRadius:'20px', padding:'2px 8px', fontSize:'10px', fontWeight:600, whiteSpace:'nowrap', display:'inline-block' }}>
                                                                    {w.status?.toUpperCase()}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Pagination */}
                                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'14px 20px', borderTop:'1px solid #f3f4f6', fontSize:'13px', color:'#6b7280' }}>
                                        <span>Showing {String(Math.min(indexOfLastItem, filteredWalkins.length)).padStart(2,'0')} of {filteredWalkins.length}</span>
                                        <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
                                            <button onClick={()=>handlePageChange(currentPage-1)} disabled={currentPage===1} style={{ width:'30px', height:'30px', border:'1px solid #e5e7eb', borderRadius:'6px', background:'#fff', cursor:currentPage===1?'not-allowed':'pointer', opacity:currentPage===1?0.4:1, display:'flex', alignItems:'center', justifyContent:'center', color:'#374151' }}>
                                                <FaChevronLeft size={10} />
                                            </button>
                                            <button onClick={()=>handlePageChange(currentPage+1)} disabled={currentPage===totalPages||totalPages===0} style={{ width:'30px', height:'30px', border:'1px solid #e5e7eb', borderRadius:'6px', background:'#fff', cursor:(currentPage===totalPages||totalPages===0)?'not-allowed':'pointer', opacity:(currentPage===totalPages||totalPages===0)?0.4:1, display:'flex', alignItems:'center', justifyContent:'center', color:'#374151' }}>
                                                <FaChevronRight size={10} />
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                        <style>{`@keyframes walkin-spin{to{transform:rotate(360deg)}}`}</style>
                    </>
                )}
            </div>
        </div>
    );
};

export default WalkinList;
