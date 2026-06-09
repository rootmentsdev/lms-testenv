import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import SideNav from "../../components/SideNav/SideNav";
import ModileNav from "../../components/SideNav/ModileNav";
import baseUrl from "../../api/api";
import { FaChevronLeft, FaChevronRight, FaPen } from 'react-icons/fa';

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
    'Loss',
    'Revisit',
    'New Walkin'
];

const UPDATE_STATUS_OPTIONS = [
    'Loss',
    'Revisit',
    'New Walkin'
];

const HARDCODED_STORES = [
    'Z-Edapally1', 'G-Edappally', 'SG-Trivandrum', 'Z- Edappal', 'Z.Perinthalmanna',
    'Z.Kottakkal', 'G.Kottayam', 'G.Perumbavoor', 'G.Thrissur', 'G.Chavakkad',
    'G.Calicut', 'G.Vadakara', 'G.Edappal', 'G.Perinthalmanna', 'G.Kottakkal',
    'G.Manjeri', 'G.Palakkad', 'G.Kalpetta', 'G.Kannur', 'G.MG Road',
    'Dappr Squad', 'office', 'production', 'WAREHOUSE'
];

const WalkinList = () => {
    const user = useSelector((state) => state.auth.user);
    const token = localStorage.getItem('token');

    // Keep the font aligned with the global DM Sans stack.
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
    const [totalWalkins, setTotalWalkins] = useState(0);

    // API Data
    const [branches, setBranches] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [walkinsLoading, setWalkinsLoading] = useState(true);

    // Filters and UI State
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [storeFilter, setStoreFilter] = useState('All');

    // Toggle state between Walkin List View and dynamic Add Walkin Form Page View matching screenshot
    const [showAddView, setShowAddView] = useState(false);

    // Customer Exists detection
    const [customerExistsNotification, setCustomerExistsNotification] = useState(false);
    const [customerData, setCustomerData] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(50);

    // Form state for adding Walk-in
    const [formData, setFormData] = useState({
        _id: '',
        date: new Date().toISOString().split('T')[0],
        customerName: '',
        contact: '',
        functionDate: new Date().toISOString().split('T')[0],
        store: '',
        storeId: '',
        staff: '',
        employeeId: '',
        category: '-',
        subCategory: '-',
        remarks: '',
        status: 'New Walkin',
        repeatCount: 1
    });

    const [currentAdmin, setCurrentAdmin] = useState(null);

    const safeDateOnly = (dateStr) => {
        if (!dateStr || dateStr === '-') return new Date().toISOString().split('T')[0];
        return dateStr.split(' ')[0].split('T')[0];
    };

    const getResetFormData = (admin = currentAdmin, branchList = branches) => {
        let defStore = '';
        let defStoreId = '';

        if (admin) {
            if (admin.branches && admin.branches.length > 0) {
                const adminBranchId = admin.branches[0]?._id || admin.branches[0];
                const matchedBranch = branchList.find(b =>
                    b._id === adminBranchId ||
                    b.workingBranch === admin.branches[0].workingBranch
                );
                if (matchedBranch) {
                    defStore = matchedBranch.workingBranch;
                    defStoreId = matchedBranch._id;
                }
            }
        }

        if (!defStore && branchList.length > 0) {
            defStore = branchList[0].workingBranch;
            defStoreId = branchList[0]._id;
        }

        return {
            _id: '',
            date: new Date().toISOString().split('T')[0],
            customerName: '',
            contact: '',
            functionDate: new Date().toISOString().split('T')[0],
            store: defStore,
            storeId: defStoreId,
            staff: admin?.name || '',
            employeeId: admin?._id || '',
            category: '-',
            subCategory: '-',
            remarks: '',
            status: 'New Walkin',
            repeatCount: 1
        };
    };

    // Fetch walkins dynamically from live API
    const loadWalkinsList = async (pageToLoad = 1) => {
        try {
            setWalkinsLoading(true);
            const params = new URLSearchParams({
                search: searchQuery.trim(),
                status: statusFilter,
                store: storeFilter,
                page: pageToLoad,
                limit: itemsPerPage === 'All' ? 0 : itemsPerPage
            });
            const walkinRes = await fetch(`${baseUrl.baseUrl}api/walkin/list?${params.toString()}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            const walkinJson = await walkinRes.json();
            if (walkinJson?.success) {
                setWalkins(walkinJson.data || []);
                setTotalWalkins(Number(walkinJson.count || 0));
            }
        } catch (err) {
        } finally {
            setWalkinsLoading(false);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch branches and walkins in parallel — employees stay lazy
                const [branchRes, adminRes] = await Promise.all([
                    fetch(`${baseUrl.baseUrl}api/admin/accessible-stores`, {
                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
                    }),
                    fetch(`${baseUrl.baseUrl}api/admin/get/current/admin`, {
                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
                    })
                ]);

                const branchJson = await branchRes.json();
                let branchList = Array.isArray(branchJson?.stores) ? branchJson.stores : (Array.isArray(branchJson?.data) ? branchJson.data : []);

                if (user?.role === 'super_admin' || user?.role === 'admin' || user?.role === 'hr_admin') {
                    // Force the dropdown to show the hardcoded stores to ensure it's not empty,
                    // and merge any DB ones to prevent duplicates.
                    const existing = new Set(branchList.map(b => b.workingBranch));
                    const missing = HARDCODED_STORES.filter(s => !existing.has(s));
                    branchList = [...missing.map(name => ({ workingBranch: name })), ...branchList];
                }

                setBranches(branchList);

                let adminData = null;
                const adminJson = await adminRes.json();
                if (adminJson?.message === 'OK' && adminJson?.data) {
                    adminData = adminJson.data;
                    setCurrentAdmin(adminData);
                }

                const initialForm = getResetFormData(adminData, branchList);
                setFormData(initialForm);
            } catch (err) {
                console.error("Error fetching initial walkin data:", err);
            } finally {
                setLoading(false);
            }
        };

        if (token) fetchData();
    }, [token, user?.role]);

    // Load employees dynamically based on storeId
    const loadEmployees = async (storeId) => {
        try {
            const url = storeId
                ? `${baseUrl.baseUrl}api/admin/accessible-employees?storeId=${storeId}`
                : `${baseUrl.baseUrl}api/admin/accessible-employees`;
            const empRes = await fetch(url, {
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
            });
            const empJson = await empRes.json();
            const empList = Array.isArray(empJson?.employees) ? empJson.employees : [];
            setEmployees(empList);
        } catch (err) {
        }
    };

    // Reset page to 1 when filters or page limit changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, statusFilter, storeFilter, itemsPerPage]);

    // Fetch walkins whenever page, limit, filters, or loading state changes
    // Debounce search-triggered fetches so we don't fire on every keystroke
    useEffect(() => {
        if (!token || loading) return;
        if (searchQuery.trim().length > 0) {
            // Debounce search input — wait 350ms before calling API
            const timer = setTimeout(() => loadWalkinsList(1), 350);
            return () => clearTimeout(timer);
        } else {
            loadWalkinsList(currentPage);
        }
    }, [currentPage, itemsPerPage, searchQuery, statusFilter, storeFilter, loading]);

    // Auto-refresh the list page data every 5 minutes
    useEffect(() => {
        const intervalId = setInterval(() => {
            if (token && !loading && !showAddView) {
                loadWalkinsList(currentPage);
            }
        }, 5 * 60 * 1000);

        return () => clearInterval(intervalId);
    }, [currentPage, itemsPerPage, searchQuery, statusFilter, storeFilter, token, loading, showAddView]);

    const totalPages = itemsPerPage === 'All' ? 1 : Math.ceil(totalWalkins / itemsPerPage);
    const indexFirst = itemsPerPage === 'All' ? 0 : (currentPage - 1) * itemsPerPage;
    const currentItems = walkins;

    const handlePageChange = (pageNumber) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };

    const getBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
        });
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        if (name === 'category') {
            setFormData(prev => ({
                ...prev,
                category: value,
                subCategory: prev.status === 'Loss' ? 'Select sub category' : '-'
            }));
            return;
        }

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
                setFormData(prev => ({ ...prev, status: 'New Walkin', repeatCount: 1 }));
            }
            return;
        }

        if (name === 'status') {
            let finalCategory = formData.category;
            let finalSubCategory = formData.subCategory;

            if (value === 'Loss') {
                finalCategory = 'Product';
                finalSubCategory = 'Select sub category';
            } else if (value === 'Revisit') {
                if (!['Trial', 'Reissue', 'Loss'].includes(formData.category)) {
                    finalCategory = 'Trial';
                }
                finalSubCategory = '-';
            } else {
                finalCategory = '-';
                finalSubCategory = '-';
            }

            setFormData(prev => ({
                ...prev,
                status: value,
                category: finalCategory,
                subCategory: finalSubCategory
            }));
            return;
        }

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        if (name === 'store') {
            const selectedBranch = branches.find(b => b.workingBranch === value);
            const branchId = selectedBranch ? selectedBranch._id : '';
            setFormData(prev => ({
                ...prev,
                store: value,
                storeId: branchId,
                staff: '',
                employeeId: ''
            }));
            if (branchId) {
                loadEmployees(branchId);
            } else {
                setEmployees([]);
            }
        } else if (name === 'staff') {
            const selectedEmp = employees.find(e => e.username === value);
            setFormData(prev => ({
                ...prev,
                staff: value,
                employeeId: selectedEmp ? selectedEmp._id : ''
            }));
        }
    };

    // Check if customer phone number already exists in the database
    const checkCustomer = async (contactVal) => {
        if (formData._id) return; // Do not auto-check if we are in Edit mode
        if (!contactVal || contactVal.trim().length < 5) return;
        try {
            const res = await fetch(`${baseUrl.baseUrl}api/walkin/check/${contactVal.trim()}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            const json = await res.json();
            if (json.success && json.exists) {
                setCustomerExistsNotification(true);
                setCustomerData(json.data);

                // Pre-populate fields automatically (Do not override store & staff with historical ones)
                setFormData(prev => ({
                    ...prev,
                    customerName: json.data.customerName || prev.customerName,
                    functionDate: safeDateOnly(json.data.functionDate) || prev.functionDate,
                    category: json.data.category || prev.category,
                    subCategory: json.data.subCategory || prev.subCategory,
                    remarks: json.data.remarks || prev.remarks,
                    status: json.data.status || prev.status,
                    repeatCount: json.data.repeatCount || 1,
                    date: safeDateOnly(json.data.date) || prev.date
                }));
            } else {
                setCustomerExistsNotification(false);
                setCustomerData(null);
                setFormData(prev => ({
                    ...prev,
                    status: 'New Walkin',
                    repeatCount: 1
                }));
            }
        } catch (err) {
        }
    };

    const handleEditClick = (w) => {
        const foundBranch = branches.find(b => b.workingBranch === w.store);
        const storeIdToLoad = w.storeId || (foundBranch ? foundBranch._id : '');

        setFormData({
            _id: w._id,
            date: safeDateOnly(w.date),
            customerName: w.customerName || '',
            contact: w.contact || '',
            functionDate: safeDateOnly(w.functionDate),
            store: w.store || '',
            storeId: storeIdToLoad,
            staff: w.staff || '',
            employeeId: w.employeeId || '',
            category: w.category || '-',
            subCategory: w.subCategory || '-',
            remarks: w.remarks || '',
            status: w.status || 'New Walkin',
            repeatCount: w.repeatCount || 1
        });

        if (storeIdToLoad) {
            loadEmployees(storeIdToLoad);
        } else {
            setEmployees([]);
        }

        setShowAddView(true);
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
        if (formData.status === 'Loss') {
            if (!formData.category || formData.category === '-' || formData.category === '') {
                alert('Please select a Category.');
                return;
            }
            if (!formData.subCategory || formData.subCategory === 'Select sub category' || formData.subCategory === '-' || formData.subCategory === '') {
                alert('Please select a Sub Category.');
                return;
            }
        } else if (formData.status === 'Revisit') {
            if (!formData.category || formData.category === '-' || formData.category === '') {
                alert('Please select a Category.');
                return;
            }
        }

        setLoading(true);
        try {
            let fileAttachment = undefined;
            if (selectedFile) {
                const base64Str = await getBase64(selectedFile);
                fileAttachment = {
                    name: selectedFile.name,
                    base64: base64Str
                };
            }

            const res = await fetch(`${baseUrl.baseUrl}api/walkin/save`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    _id: formData._id || undefined,
                    customerName: formData.customerName,
                    contact: formData.contact,
                    functionDate: formData.functionDate,
                    store: formData.store,
                    storeId: formData.storeId || undefined,
                    staff: formData.staff || 'None',
                    employeeId: formData.employeeId || undefined,
                    category: formData.category,
                    subCategory: formData.subCategory,
                    fileAttachment,
                    remarks: formData.remarks || '-',
                    status: formData.status,
                    date: formData.date
                })
            });

            const json = await res.json();
            if (json.success) {
                // Reset form to defaults and hide form view immediately for instant redirect
                setFormData(getResetFormData());
                setCustomerExistsNotification(false);
                setCustomerData(null);
                setSelectedFile(null);
                setShowAddView(false);

                // Reload walkins list and refresh dashboard in the background
                loadWalkinsList(currentPage);
                window.dispatchEvent(new Event('dashboard:refresh'));
            } else {
                alert(`Error: ${json.message}`);
            }
        } catch (err) {
            alert("Connection error while attempting to save walk-in.");
        } finally {
            setLoading(false);
        }
    };

    const currentStoreEmployees = employees; // Already filtered by loadEmployees API

    const showCategory = formData.status === 'Loss' || formData.status === 'Revisit';
    const showSubCategory = formData.status === 'Loss';
    const showAttachmentInput = formData.status === 'Loss' && formData.subCategory === 'Model, Design and Colour Not Available';

    const getCategoryOptions = () => {
        if (formData.status === 'Loss') {
            return ['Product', 'Enquiry', 'Dapper Squad'];
        }
        if (formData.status === 'Revisit') {
            return ['Trial', 'Reissue', 'Loss'];
        }
        return [];
    };

    const getSubCategoryOptions = () => {
        if (formData.status === 'Loss') {
            if (formData.category === 'Product') {
                return [
                    'Select sub category',
                    'Product Already Booked',
                    'Model, Design and Colour Not Available',
                    'Size',
                    'Price',
                    'Budget Restriction'
                ];
            }
            if (formData.category === 'Enquiry') {
                return [
                    'Select sub category',
                    'Enquiry Without Groom/Bride',
                    'Enquiry Without Trail',
                    'Confirm Later',
                    'Shoe and Shirt'
                ];
            }
            if (formData.category === 'Dapper Squad') {
                return [
                    'Select sub category',
                    'Product Already Booked',
                    'Model, Design and Colour Not Available',
                    'Size',
                    'Price'
                ];
            }
        }
        return ['Select sub category'];
    };

    let remarksColSpan = "col-span-12 md:col-span-3";
    if (!showCategory && !showSubCategory) {
        remarksColSpan = "col-span-12 md:col-span-9";
    } else if (showCategory && !showSubCategory) {
        remarksColSpan = "col-span-12 md:col-span-6";
    } else if (showAttachmentInput) {
        remarksColSpan = "col-span-12";
    }

    // Sort Arrows double-indicator icon matching mockup image exactly
    const SortArrow = () => (
        <span className="inline-flex flex-col ml-1.5 align-middle text-[8px] text-gray-300">
            <span>▲</span>
            <span className="-mt-1">▼</span>
        </span>
    );

    return (
        <div className="mb-[70px] text-[14px] min-h-screen" style={{ fontFamily: "DM Sans, sans-serif", background: '#f9fafb' }}>
            <SideNav />
            <div className="md:hidden sm:block">
                <ModileNav />
            </div>

            {/* Layout Grid Container matching standard dashboard spacing perfectly */}
            <div className="md:ml-[120px] transition-all duration-300" style={{ paddingTop: '24px', paddingLeft: '24px', paddingRight: '24px', paddingBottom: '40px' }}>
                {showAddView ? (
                    /* ADD WALKIN FORM VIEW MATCHING SCREENSHOT EXACTLY */
                    <div className="mt-6 mb-6 max-w-6xl mx-auto px-4" style={{ fontFamily: "DM Sans, sans-serif" }}>

                        {/* Title with Back Arrow exactly matching mockup */}
                        <div className="flex items-center gap-3 mb-6">
                            <button
                                onClick={() => {
                                    setCustomerExistsNotification(false);
                                    setCustomerData(null);
                                    setSelectedFile(null);
                                    setShowAddView(false);
                                }}
                                className="flex items-center justify-center text-gray-800 hover:text-black transition-colors bg-transparent border-0 cursor-pointer p-1"
                                style={{ fontSize: '24px' }}
                            >
                                ←
                            </button>
                            <h2 className="text-xl font-bold text-gray-900 leading-none">Create New Walk In</h2>
                        </div>

                        {/* Premium White form card matching mockup exactly */}
                        <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-xs">
                            <form onSubmit={handleFormSubmit} className="space-y-6">

                                {(formData._id || customerExistsNotification) && (
                                    <div className="mb-6 p-4 bg-amber-50 border-l-4 border-amber-500 rounded-r-md flex items-start gap-3 animate-fade-in">
                                        <span className="text-amber-600 text-lg">⚠️</span>
                                        <div>
                                            <h4 className="text-sm font-bold text-amber-800">
                                                {formData._id
                                                    ? `Editing Walk-in Record (Repeat Count: ${formData.repeatCount || 1})`
                                                    : `Existing Customer Found (Walk-in Count: ${formData.repeatCount || 1})`
                                                }
                                            </h4>
                                            <p className="text-xs text-amber-700 mt-1">
                                                {formData._id
                                                    ? 'You are editing the details of this specific walk-in record. Saving will update the details of this record directly.'
                                                    : 'The customer details have been pre-filled. You can update them. Saving with any status other than "New Walkin" will update the existing record. Setting status to "New Walkin" will log a new visit.'
                                                }
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Row 1: Mobile, Name, Function Date, Repeat Count */}
                                <div className="grid grid-cols-12 gap-5">
                                    <div className="col-span-12 md:col-span-3">
                                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                            Customer Mobile Number<span className="text-red-500">*</span>
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
                                            className="w-full h-11 border border-gray-200 rounded-lg px-3.5 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 text-gray-800 bg-white placeholder-gray-400 font-semibold"
                                        />
                                    </div>
                                    <div className="col-span-12 md:col-span-3">
                                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                            Customer Name<span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="customerName"
                                            required
                                            placeholder="Enter Customer Name"
                                            value={formData.customerName}
                                            onChange={handleInputChange}
                                            className="w-full h-11 border border-gray-200 rounded-lg px-3.5 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 text-gray-800 bg-white placeholder-gray-400 font-semibold"
                                        />
                                    </div>
                                    <div className="col-span-12 md:col-span-4">
                                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                            Function Date <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="date"
                                            name="functionDate"
                                            required
                                            value={formData.functionDate}
                                            onChange={handleInputChange}
                                            className="w-full h-11 border border-gray-200 rounded-lg px-3.5 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 text-gray-800 bg-white cursor-pointer placeholder-gray-400 font-semibold"
                                        />
                                    </div>
                                    <div className="col-span-12 md:col-span-2">
                                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                            Repeat Count
                                        </label>
                                        <input
                                            type="number"
                                            name="repeatCount"
                                            readOnly
                                            value={formData.repeatCount || 1}
                                            className="w-full h-11 border border-gray-200 bg-gray-50 rounded-lg text-center text-sm focus:outline-none text-gray-500 cursor-not-allowed font-semibold"
                                        />
                                    </div>
                                </div>

                                {/* Row 2: Status, Category, Sub Category, Remarks */}
                                <div className="grid grid-cols-12 gap-5 pt-1">
                                    <div className="col-span-12 md:col-span-3">
                                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                            Status<span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <select
                                                name="status"
                                                required
                                                value={formData.status}
                                                onChange={handleInputChange}
                                                className="w-full h-11 border border-gray-200 rounded-lg px-3.5 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 text-gray-800 bg-white cursor-pointer appearance-none pr-8 font-semibold"
                                            >
                                                {STATUS_OPTIONS.map((opt) => (<option key={opt} value={opt}>{opt}</option>))}
                                            </select>
                                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Category Select (Visible only for Loss/Revisit) */}
                                    {showCategory && (
                                        <div className="col-span-12 md:col-span-3">
                                            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                                Category<span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <select
                                                    name="category"
                                                    required
                                                    value={formData.category}
                                                    onChange={handleInputChange}
                                                    className="w-full h-11 border border-gray-200 rounded-lg px-3.5 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 text-gray-800 bg-white cursor-pointer appearance-none pr-8 font-semibold"
                                                >
                                                    <option value="">Select Category</option>
                                                    {getCategoryOptions().map((opt) => (<option key={opt} value={opt}>{opt}</option>))}
                                                </select>
                                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                                                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Sub Category Select (Visible only for Revisit) */}
                                    {showSubCategory && (
                                        <div className="col-span-12 md:col-span-3">
                                            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                                Sub Category<span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <select
                                                    name="subCategory"
                                                    value={formData.subCategory}
                                                    onChange={handleInputChange}
                                                    className="w-full h-11 border border-gray-200 rounded-lg px-3.5 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 text-gray-800 bg-white cursor-pointer appearance-none pr-8 font-semibold"
                                                >
                                                    {getSubCategoryOptions().map((opt) => (<option key={opt} value={opt}>{opt}</option>))}
                                                </select>
                                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                                                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Optional Attachment Input */}
                                    {showAttachmentInput && (
                                        <div className="col-span-12 md:col-span-3">
                                            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                                Attachment <span className="text-gray-400 font-normal">(Optional)</span>
                                            </label>
                                            <div className="relative">
                                                <input 
                                                    type="file" 
                                                    id="walkin-attachment-file"
                                                    onChange={handleFileChange} 
                                                    className="hidden"
                                                />
                                                <label 
                                                    htmlFor="walkin-attachment-file" 
                                                    className="w-full h-11 border border-gray-200 rounded-lg px-3.5 flex items-center justify-between text-sm focus:outline-none text-gray-600 bg-white cursor-pointer hover:border-gray-400 transition-all font-semibold overflow-hidden"
                                                >
                                                    <span className="truncate">
                                                        {selectedFile ? selectedFile.name : (formData.attachmentName || 'Choose File...')}
                                                    </span>
                                                    <svg className="w-4 h-4 text-gray-400 shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                                    </svg>
                                                </label>
                                            </div>
                                        </div>
                                    )}

                                    {/* Remarks Field stretching dynamically to fill remaining grid columns */}
                                    <div className={remarksColSpan}>
                                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                            Remarks <span className="text-gray-400 font-normal">(Optional)</span>
                                        </label>
                                        <textarea
                                            name="remarks"
                                            rows={1}
                                            placeholder="Enter your remarks..."
                                            value={formData.remarks}
                                            onChange={handleInputChange}
                                            className="w-full h-11 border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 text-gray-800 bg-white placeholder-gray-400 resize-none"
                                        />
                                    </div>
                                </div>

                                {/* Admin metadata fields auto-populated in background */}

                                {/* Save Button under Status exactly like screenshot */}
                                <div className="pt-4 flex justify-start">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="bg-[#111827] hover:bg-black text-white px-6 py-2.5 rounded-lg transition-all duration-200 font-semibold shadow-xs transform active:scale-95 text-center cursor-pointer text-sm"
                                    >
                                        {loading ? 'Saving...' : 'Save Walk In'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                ) : (
                    /* ── WALK-IN LIST VIEW ── */
                    <>
                        {/* Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px', marginBottom: '16px' }}>
                            <h1 style={{ fontSize: '22px', fontWeight: 700, lineHeight: 1.2, color: '#111827', margin: 0 }}>Walk In List</h1>
                            <button
                                onClick={() => {
                                    setFormData(getResetFormData());
                                    setSelectedFile(null);
                                    setShowAddView(true);
                                }}
                                style={{ background: '#111827', color: '#fff', border: 'none', borderRadius: '10px', padding: '9px 18px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                            >
                                + New Walk In
                            </button>
                        </div>

                        {/* Filters */}
                        <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                            <input
                                type="text"
                                placeholder="Search customer, contact, store..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '7px 12px', fontSize: '13px', color: '#374151', outline: 'none', width: '260px', background: '#fff' }}
                            />
                            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '7px 12px', fontSize: '13px', color: '#374151', outline: 'none', background: '#fff', cursor: 'pointer' }}>
                                <option value="All">All Status</option>
                                {STATUS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                            {(user?.role === 'super_admin' || user?.role === 'admin' || user?.role === 'hr_admin' || user?.role === 'cluster_admin') && (
                                <select value={storeFilter} onChange={e => setStoreFilter(e.target.value)} style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '7px 12px', fontSize: '13px', color: '#374151', outline: 'none', background: '#fff', cursor: 'pointer' }}>
                                    <option value="All">All Stores</option>
                                    {branches.map((b, i) => <option key={i} value={b.workingBranch}>{b.workingBranch}</option>)}
                                </select>
                            )}
                        </div>

                        {/* Table card */}
                        <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #f0f0f0', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', overflow: 'hidden', marginBottom: '32px' }}>
                            {walkinsLoading ? (
                                <div style={{ display: 'flex', justifyContent: 'center', padding: '48px' }}>
                                    <div style={{ width: '28px', height: '28px', border: '2px solid #e5e7eb', borderTopColor: '#111827', borderRadius: '50%', animation: 'walkin-spin 0.7s linear infinite' }} />
                                </div>
                            ) : walkins.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '48px', color: '#9ca3af', fontSize: '13px' }}>No walk-in records found.</div>
                            ) : (
                                <>
                                    <div style={{ overflowX: 'auto' }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', fontFamily: "DM Sans, sans-serif" }}>
                                            <thead>
                                                <tr style={{ borderBottom: '1px solid #f3f4f6', background: '#fafafa' }}>
                                                    {['#', 'DATE', 'CUSTOMER', 'CONTACT', 'FUNCTION DATE', 'STORE', 'STAFF', 'CATEGORY', 'SUB CATEGORY', 'REMARKS', 'REPEAT COUNT', 'STATUS', ''].map((h, i) => (
                                                        <th key={i} style={{ padding: '8px 12px', textAlign: (h === '#' || h === 'REPEAT COUNT' || h === 'STATUS') ? 'center' : 'left', fontSize: '10px', fontWeight: 600, color: '#9ca3af', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {currentItems.map((w, index) => {
                                                    const statusColors = {
                                                        'Booked': { bg: '#dcfce7', color: '#16a34a' },
                                                        'New Booking': { bg: '#dcfce7', color: '#16a34a' },
                                                        'Revisit Booking': { bg: '#dcfce7', color: '#16a34a' },
                                                        'Rentout': { bg: '#fce7f3', color: '#be185d' },
                                                        'Rent Out': { bg: '#fce7f3', color: '#be185d' },
                                                        'Booking & Rentout': { bg: '#fce7f3', color: '#be185d' },
                                                        'Return': { bg: '#fef3c7', color: '#d97706' },
                                                        'Trial': { bg: '#e0e7ff', color: '#4338ca' },
                                                        'Loss': { bg: '#fee2e2', color: '#dc2626' },
                                                        'Revisit Loss': { bg: '#fee2e2', color: '#dc2626' },
                                                        'Enquiry': { bg: '#f3f4f6', color: '#6b7280' },
                                                        'New Walkin': { bg: '#dbeafe', color: '#2563eb' },
                                                        'Reissue': { bg: '#ede9fe', color: '#7c3aed' },
                                                    };
                                                    const sc = statusColors[w.status] || { bg: '#f3f4f6', color: '#6b7280' };
                                                    return (
                                                        <tr key={w._id || index}
                                                            style={{ borderBottom: '1px solid #f9fafb', background: '#fff', transition: 'background 0.1s' }}
                                                            onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                                                            onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                                                        >
                                                            <td style={{ padding: '11px 12px', textAlign: 'center', color: '#9ca3af' }}>{indexFirst + index + 1}</td>
                                                            <td style={{ padding: '11px 12px', whiteSpace: 'nowrap', color: '#374151' }}>{w.date}</td>
                                                            <td style={{ padding: '11px 12px', color: '#111827', fontWeight: 500, whiteSpace: 'nowrap' }}>{w.customerName}</td>
                                                            <td style={{ padding: '11px 12px', whiteSpace: 'nowrap', color: '#374151' }}>+91 {w.contact}</td>
                                                            <td style={{ padding: '11px 12px', whiteSpace: 'nowrap', color: '#374151' }}>{w.functionDate}</td>
                                                            <td style={{ padding: '11px 12px', whiteSpace: 'nowrap', color: '#374151' }}>{w.store}</td>
                                                            <td style={{ padding: '11px 12px', whiteSpace: 'nowrap', color: '#374151' }}>{w.staff}</td>
                                                            <td style={{ padding: '11px 12px', whiteSpace: 'nowrap', color: '#374151' }}>{w.category}</td>
                                                            <td style={{ padding: '11px 12px', whiteSpace: 'nowrap', color: '#374151' }}>
                                                                {w.subCategory}
                                                                {w.attachment && (
                                                                    <a 
                                                                        href={w.attachment} 
                                                                        target="_blank" 
                                                                        rel="noopener noreferrer" 
                                                                        style={{ marginLeft: '6px', color: '#2563eb', textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
                                                                        title={`View attachment: ${w.attachmentName || 'Attachment'}`}
                                                                    >
                                                                        📎
                                                                    </a>
                                                                )}
                                                            </td>
                                                            <td style={{ padding: '11px 12px', color: '#6b7280', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={w.remarks}>{w.remarks || '–'}</td>
                                                            <td style={{ padding: '11px 12px', textAlign: 'center', color: '#374151' }}>{w.repeatCount}</td>
                                                            <td style={{ padding: '11px 12px', textAlign: 'center' }}>
                                                                <span style={{ background: sc.bg, color: sc.color, borderRadius: '20px', padding: '2px 8px', fontSize: '10px', fontWeight: 600, whiteSpace: 'nowrap', display: 'inline-block' }}>
                                                                    {w.status?.toUpperCase()}
                                                                </span>
                                                            </td>
                                                            <td style={{ padding: '11px 12px', textAlign: 'center' }}>
                                                                <button
                                                                    onClick={() => handleEditClick(w)}
                                                                    style={{ background: 'none', border: 'none', color: '#4b5563', cursor: 'pointer', padding: '4px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', transition: 'color 0.1s' }}
                                                                    onMouseEnter={e => e.currentTarget.style.color = '#111827'}
                                                                    onMouseLeave={e => e.currentTarget.style.color = '#4b5563'}
                                                                    title="Edit Walk-in"
                                                                >
                                                                    <FaPen size={12} />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Pagination */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', borderTop: '1px solid #f3f4f6', fontSize: '13px', color: '#6b7280' }}>
                                        <span>Showing {String(Math.min(indexFirst + currentItems.length, totalWalkins)).padStart(2, '0')} of {totalWalkins}</span>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <span>Show:</span>
                                                <select
                                                    value={itemsPerPage}
                                                    onChange={e => {
                                                        const val = e.target.value;
                                                        setItemsPerPage(val === 'All' ? 'All' : Number(val));
                                                    }}
                                                    style={{ border: '1px solid #e5e7eb', borderRadius: '6px', padding: '3px 6px', fontSize: '12px', color: '#374151', background: '#fff', outline: 'none', cursor: 'pointer' }}
                                                >
                                                    {[50, 100, 200, 'All'].map(val => <option key={val} value={val}>{val}</option>)}
                                                </select>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} style={{ width: '30px', height: '30px', border: '1px solid #e5e7eb', borderRadius: '6px', background: '#fff', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.4 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#374151' }}>
                                                    <FaChevronLeft size={10} />
                                                </button>
                                                <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages || totalPages === 0} style={{ width: '30px', height: '30px', border: '1px solid #e5e7eb', borderRadius: '6px', background: '#fff', cursor: (currentPage === totalPages || totalPages === 0) ? 'not-allowed' : 'pointer', opacity: (currentPage === totalPages || totalPages === 0) ? 0.4 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#374151' }}>
                                                    <FaChevronRight size={10} />
                                                </button>
                                            </div>
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
