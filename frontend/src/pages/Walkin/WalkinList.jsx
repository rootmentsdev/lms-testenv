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

const WalkinList = () => {
    const user = useSelector((state) => state.auth.user);
    const token = localStorage.getItem('token');

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
        status: 'Booked'
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
            console.error("Error loading Walk-in logs:", err);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch branches (GET)
                const branchRes = await fetch(`${baseUrl.baseUrl}api/usercreate/getBranch`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });

                // Fetch employees (GET)
                const empRes = await fetch(`${baseUrl.baseUrl}api/employee/management/with-training-details`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });

                const branchJson = await branchRes.json();
                const empJson = await empRes.json();

                const branchList = Array.isArray(branchJson?.data) ? branchJson.data : [];
                const empList = Array.isArray(empJson) ? empJson : (Array.isArray(empJson?.data) ? empJson.data : []);

                setBranches(branchList);
                setEmployees(empList);

                // Set default store based on role constraints
                if (branchList.length > 0) {
                    if (user?.role === 'store_admin') {
                        const defaultStore = branchList[0]?.workingBranch || '';
                        setFormData(prev => ({ ...prev, store: defaultStore }));
                    } else {
                        setFormData(prev => ({ ...prev, store: branchList[0]?.workingBranch || '' }));
                    }
                }

                // Fetch live walk-in logs
                await loadWalkinsList();

            } catch (err) {
                console.error("Error loading Walk-in dependencies:", err);
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            fetchData();
        }
    }, [token, user?.role]);

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
                // Pre-populate fields automatically
                setFormData(prev => ({
                    ...prev,
                    customerName: json.data.customerName || prev.customerName,
                    functionDate: json.data.functionDate || prev.functionDate
                }));
            } else {
                setCustomerExistsNotification(false);
            }
        } catch (err) {
            console.error("Error checking customer existence:", err);
        }
    };

    // Save Walkin Form directly to live MongoDB database
    const handleFormSubmit = async (e) => {
        e.preventDefault();
        if (!formData.customerName || !formData.contact || !formData.store) {
            alert('Please fill out all required fields.');
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
                    status: 'Booked'
                });
                setCustomerExistsNotification(false);
                setShowAddView(false);
            } else {
                alert(`Error: ${json.message}`);
            }
        } catch (err) {
            console.error("Error saving walk-in to DB:", err);
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
        <div className="mb-[70px] text-[14px] bg-white min-h-screen">
            <Header name={showAddView ? "Add Walk-In" : "Walk-In List"} />
            <SideNav />
            <div className="md:hidden sm:block">
                <ModileNav />
            </div>

            {/* Layout Grid Container matching standard dashboard spacing perfectly */}
            <div className="md:ml-[90px] mt-[160px] sm:mt-[140px] px-4 sm:px-6 lg:px-12 transition-all duration-300">
                {showAddView ? (
                    /* ADD WALKIN FORM VIEW MATCHING SECOND SCREENSHOT */
                    <div className="mt-8 mb-6 max-w-5xl mx-auto">

                        {/* Back navigation option matching mockup arrow */}
                        <button
                            onClick={() => {
                                setCustomerExistsNotification(false);
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
                                {customerExistsNotification && (
                                    <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg p-3 text-xs font-semibold flex items-center gap-2 animate-pulse mb-4">
                                        ⚠️ Customer already exists in database! Name and Function Date pre-loaded.
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                                    {/* Customer mobile number */}
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">
                                            Customer mobile number <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="tel"
                                            name="contact"
                                            required
                                            maxLength={10}
                                            placeholder="Enter Mobile Number"
                                            value={formData.contact}
                                            onChange={handleInputChange}
                                            onBlur={(e) => checkCustomer(e.target.value)}
                                            className="w-full border border-gray-300 bg-white rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 text-gray-700 font-semibold"
                                        />
                                    </div>

                                    {/* Customer Name */}
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">
                                            Customer Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="customerName"
                                            required
                                            placeholder="Enter Customer Name"
                                            value={formData.customerName}
                                            onChange={handleInputChange}
                                            className="w-full border border-gray-300 bg-white rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 text-gray-700 font-semibold"
                                        />
                                    </div>

                                    {/* Function Date */}
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">
                                            Function Date <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="date"
                                            name="functionDate"
                                            required
                                            value={formData.functionDate}
                                            onChange={handleInputChange}
                                            className="w-full border border-gray-300 bg-white rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 text-gray-700 font-semibold cursor-pointer"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">

                                    {/* Store select (shown only for Super Admin and Cluster Manager to define the store map) */}
                                    {(user?.role === 'super_admin' || user?.role === 'cluster_admin') ? (
                                        <div>
                                            <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">
                                                Store <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                name="store"
                                                required
                                                value={formData.store}
                                                onChange={handleInputChange}
                                                className="w-full border border-gray-300 rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 text-gray-700 bg-white cursor-pointer font-semibold"
                                            >
                                                {branches.map((b, idx) => (
                                                    <option key={idx} value={b.workingBranch}>{b.workingBranch}</option>
                                                ))}
                                            </select>
                                        </div>
                                    ) : null}

                                    {/* Creating as * (Employee Dropdown selector) */}
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">
                                            Creating as <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            name="staff"
                                            required
                                            value={formData.staff}
                                            onChange={handleInputChange}
                                            className="w-full border border-gray-300 rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 text-gray-700 bg-white cursor-pointer font-semibold"
                                        >
                                            <option value="">Select</option>
                                            {currentStoreEmployees.map((emp, idx) => (
                                                <option key={idx} value={emp.username}>{emp.username}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Secondary collapse/section for optional fields to preserve database completeness */}
                                <div className="border-t border-gray-100 pt-6 mt-4">
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Fitting Details (Optional)</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                                        {/* Date of Visit */}
                                        <div>
                                            <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">
                                                Visit Date
                                            </label>
                                            <input
                                                type="date"
                                                name="date"
                                                value={formData.date}
                                                onChange={handleInputChange}
                                                className="w-full border border-gray-300 bg-white rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 text-gray-700 font-semibold cursor-pointer"
                                            />
                                        </div>

                                        {/* Category */}
                                        <div>
                                            <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">
                                                Category
                                            </label>
                                            <input
                                                type="text"
                                                name="category"
                                                placeholder="e.g. Groom"
                                                value={formData.category}
                                                onChange={handleInputChange}
                                                className="w-full border border-gray-300 bg-white rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 text-gray-700"
                                            />
                                        </div>

                                        {/* Sub Category */}
                                        <div>
                                            <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">
                                                Sub Category
                                            </label>
                                            <input
                                                type="text"
                                                name="subCategory"
                                                placeholder="e.g. 2PCS Suit"
                                                value={formData.subCategory}
                                                onChange={handleInputChange}
                                                className="w-full border border-gray-300 bg-white rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 text-gray-700"
                                            />
                                        </div>

                                        {/* Status */}
                                        <div>
                                            <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">
                                                Status
                                            </label>
                                            <select
                                                name="status"
                                                value={formData.status}
                                                onChange={handleInputChange}
                                                className="w-full border border-gray-300 rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 text-gray-700 bg-white cursor-pointer font-semibold"
                                            >
                                                {STATUS_OPTIONS.map((opt) => (
                                                    <option key={opt} value={opt}>{opt}</option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Remarks */}
                                        <div className="md:col-span-2">
                                            <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">
                                                Remarks
                                            </label>
                                            <textarea
                                                name="remarks"
                                                rows={1}
                                                placeholder="Enter fit remarks, style details..."
                                                value={formData.remarks}
                                                onChange={handleInputChange}
                                                className="w-full border border-gray-300 bg-white rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 text-gray-700"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Save Button centered matching mockup screenshot exactly */}
                                <div className="flex justify-center pt-8 border-t border-gray-100">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="bg-[#2A2A2A] hover:bg-black text-white px-16 py-3 rounded-md transition-all duration-200 font-bold shadow-md hover:shadow-lg transform active:scale-95 text-center min-w-[180px] cursor-pointer text-sm"
                                    >
                                        {loading ? 'Saving...' : 'Save'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                ) : (
                    /* WALK-IN LIST VIEW PAGE */
                    <>
                        {/* Header Row matching first mockup image exactly */}
                        <div className="flex justify-between items-center mt-8 mb-6">
                            <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Walk-In List</h1>
                            <button
                                onClick={() => {
                                    // Seed default store to avoid blank selector on init
                                    if (branches.length > 0) {
                                        setFormData(prev => ({
                                            ...prev,
                                            store: branches[0]?.workingBranch || ''
                                        }));
                                    }
                                    setShowAddView(true);
                                }}
                                className="bg-white border border-gray-300 px-5 py-1.5 rounded-full text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-1 shadow-sm transition-colors cursor-pointer"
                            >
                                + Add Walkin
                            </button>
                        </div>

                        {/* Main Content White Container Card matching first mockup exactly */}
                        <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-150">

                            {/* Filters Toolbar matching mockup exactly */}
                            <div className="flex gap-0 mb-4 max-w-lg border border-gray-300 rounded-md overflow-hidden bg-white">
                                <select
                                    className="bg-white px-3 py-2 text-sm text-gray-600 focus:outline-none border-r border-gray-300 cursor-pointer"
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                >
                                    <option value="All">All</option>
                                    {STATUS_OPTIONS.map((opt) => (
                                        <option key={opt} value={opt}>{opt}</option>
                                    ))}
                                </select>
                                <input
                                    type="text"
                                    placeholder="Search"
                                    className="px-3 py-2 text-sm flex-1 focus:outline-none text-gray-700"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>

                            {/* Filter by Stores (Only visible for Super Admin and Cluster Managers) */}
                            {(user?.role === 'super_admin' || user?.role === 'cluster_admin') && (
                                <div className="flex items-center gap-2 mb-4 bg-gray-50/50 p-2.5 rounded-lg max-w-md border border-gray-100">
                                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Filtered Store:</span>
                                    <select
                                        value={storeFilter}
                                        onChange={(e) => setStoreFilter(e.target.value)}
                                        className="bg-white border border-gray-200 rounded px-2 py-1 text-xs text-gray-700 focus:outline-none font-medium cursor-pointer"
                                    >
                                        <option value="All">All Stores</option>
                                        {branches.map((b, idx) => (
                                            <option key={idx} value={b.workingBranch}>{b.workingBranch}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {loading ? (
                                <div className="flex justify-center items-center py-12">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800"></div>
                                </div>
                            ) : filteredWalkins.length === 0 ? (
                                <div className="text-center py-12 text-gray-400">
                                    No walk-in logs found matching your active filter criteria.
                                </div>
                            ) : (
                                <>
                                    {/* Scrollable Table matching mockup exactly */}
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-sm text-gray-600 border-collapse">
                                            <thead className="text-xs text-gray-500 uppercase bg-gray-50/30 border-b border-gray-150 font-bold">
                                                <tr>
                                                    <th className="px-4 py-4 text-center border-b border-gray-150">#</th>
                                                    <th className="px-4 py-4 border-b border-gray-150 whitespace-nowrap">DATE<SortArrow /></th>
                                                    <th className="px-4 py-4 border-b border-gray-150 whitespace-nowrap">CUSTOMER NAME<SortArrow /></th>
                                                    <th className="px-4 py-4 border-b border-gray-150 whitespace-nowrap">CONTACT<SortArrow /></th>
                                                    <th className="px-4 py-4 border-b border-gray-150 whitespace-nowrap">FUNCTION DATE<SortArrow /></th>
                                                    <th className="px-4 py-4 border-b border-gray-150 whitespace-nowrap">STORE<SortArrow /></th>
                                                    <th className="px-4 py-4 border-b border-gray-150 whitespace-nowrap">STAFF<SortArrow /></th>
                                                    <th className="px-4 py-4 border-b border-gray-150 whitespace-nowrap">CATEGORY<SortArrow /></th>
                                                    <th className="px-4 py-4 border-b border-gray-150 whitespace-nowrap">SUB CATEGORY<SortArrow /></th>
                                                    <th className="px-4 py-4 border-b border-gray-150 whitespace-nowrap">REMARKS<SortArrow /></th>
                                                    <th className="px-4 py-4 text-center border-b border-gray-150 whitespace-nowrap">REPEAT COUNT<SortArrow /></th>
                                                    <th className="px-4 py-4 text-center border-b border-gray-150 whitespace-nowrap">STATUS<SortArrow /></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {currentItems.map((w, index) => (
                                                    <tr
                                                        key={w._id || w.id}
                                                        className={`border-b border-gray-100 hover:bg-gray-50/30 transition-colors ${index % 2 === 1 ? 'bg-gray-50/50' : 'bg-white'
                                                            }`}
                                                    >
                                                        <td className="px-4 py-3.5 text-center text-gray-400 font-semibold">{indexOfFirstItem + index + 1}</td>
                                                        <td className="px-4 py-3.5 whitespace-nowrap text-gray-700 font-medium">{w.date}</td>
                                                        <td className="px-4 py-3.5 text-gray-900 font-semibold">{w.customerName}</td>
                                                        <td className="px-4 py-3.5 whitespace-nowrap text-gray-600 font-semibold">{w.contact}</td>
                                                        <td className="px-4 py-3.5 whitespace-nowrap text-gray-500">{w.functionDate}</td>
                                                        <td className="px-4 py-3.5 text-gray-700 font-medium">{w.store}</td>
                                                        <td className="px-4 py-3.5 whitespace-nowrap text-gray-700 font-medium">{w.staff}</td>
                                                        <td className="px-4 py-3.5 whitespace-nowrap text-gray-600">{w.category}</td>
                                                        <td className="px-4 py-3.5 whitespace-nowrap text-gray-600">{w.subCategory}</td>
                                                        <td className="px-4 py-3.5 text-gray-500 max-w-[150px] truncate" title={w.remarks}>{w.remarks}</td>
                                                        <td className="px-4 py-3.5 text-center text-gray-400 font-semibold">{w.repeatCount}</td>
                                                        <td className="px-4 py-3.5 text-center whitespace-nowrap text-gray-800 font-medium">{w.status}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Pagination Controls */}
                                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 pt-4 border-t border-gray-100 text-xs text-gray-500">
                                        <div>
                                            Showing <span className="font-semibold text-gray-700">{indexOfFirstItem + 1}</span> to{' '}
                                            <span className="font-semibold text-gray-700">
                                                {Math.min(indexOfLastItem, filteredWalkins.length)}
                                            </span>{' '}
                                            of <span className="font-semibold text-gray-700">{filteredWalkins.length}</span> entries
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => handlePageChange(currentPage - 1)}
                                                disabled={currentPage === 1}
                                                className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-gray-600 transition-colors"
                                            >
                                                <FaChevronLeft size={10} />
                                            </button>
                                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                                <button
                                                    key={page}
                                                    onClick={() => handlePageChange(page)}
                                                    className={`px-3 py-1.5 border rounded-md font-semibold transition-colors ${currentPage === page
                                                            ? 'bg-[#2A2A2A] text-white border-[#2A2A2A]'
                                                            : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    {page}
                                                </button>
                                            ))}
                                            <button
                                                onClick={() => handlePageChange(currentPage + 1)}
                                                disabled={currentPage === totalPages}
                                                className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-gray-600 transition-colors"
                                            >
                                                <FaChevronRight size={10} />
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default WalkinList;
