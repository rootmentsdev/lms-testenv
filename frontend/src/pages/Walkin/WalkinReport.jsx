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

const WalkinReport = () => {
    const user = useSelector((state) => state.auth.user);
    const token = localStorage.getItem('token');

    // Dependencies
    const [branches, setBranches] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);

    // Form inputs matching second mockup image exactly
    const [formData, setFormData] = useState({
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        store: 'All', // Default to All to prevent blank UI on slow network load
        employee: ''
    });

    // Custom multi-select dropdown state matching screenshot exactly
    const [selectedStatuses, setSelectedStatuses] = useState([]);
    const [showStatusDropdown, setShowStatusDropdown] = useState(false);

    // Generated report state
    const [reportGenerated, setReportGenerated] = useState(false);
    const [reportData, setReportData] = useState([]);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Fetch branches and employees to match admin roles
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
                        const myStore = branchList[0]?.workingBranch || '';
                        setFormData(prev => ({ ...prev, store: myStore }));
                    } else {
                        // Ensure it stays 'All' for cluster/super admins instead of forcing first store
                        setFormData(prev => ({ ...prev, store: 'All' }));
                    }
                }
            } catch (err) {
                console.error("Error loading Walk-in dependencies in Report:", err);
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            fetchData();
        }
    }, [token, user?.role]);

    // Close status dropdown when clicking outside matching premium standards
    useEffect(() => {
        const handleClickOutside = (event) => {
            const container = document.getElementById('status-dropdown-container');
            if (container && !container.contains(event.target)) {
                setShowStatusDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Handle input change
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        if (name === 'store') {
            setFormData(prev => ({
                ...prev,
                store: value,
                employee: ''
            }));
        }
    };

    // Multi-select status handlers matching mockup layout
    const handleStatusToggle = (status) => {
        if (selectedStatuses.includes(status)) {
            setSelectedStatuses(selectedStatuses.filter(s => s !== status));
        } else {
            setSelectedStatuses([...selectedStatuses, status]);
        }
    };

    const handleSelectAllStatusToggle = () => {
        if (selectedStatuses.length === STATUS_OPTIONS.length) {
            setSelectedStatuses([]);
        } else {
            setSelectedStatuses([...STATUS_OPTIONS]);
        }
    };

    const getStatusDisplayText = () => {
        if (selectedStatuses.length === 0) return 'Select Options';
        if (selectedStatuses.length === STATUS_OPTIONS.length) return 'Select All Status';
        if (selectedStatuses.length <= 2) return selectedStatuses.join(', ');
        return `${selectedStatuses.length} Statuses Selected`;
    };

    // Filter employees dropdown list based on current Store selection to enforce dynamic role rules
    const getEmployeesForSelectedStore = (storeName) => {
        if (!storeName) return [];
        if (storeName === 'All') return employees;
        const normSelectedStore = locationKey(storeName);
        
        return employees.filter(emp => {
            const empStore = emp.store_name || emp.workingBranch || '';
            return locationKey(empStore) === normSelectedStore;
        });
    };

    const currentStoreEmployees = getEmployeesForSelectedStore(formData.store);

    // Save/Submit Form to generate report from database API
    const handleGenerateReport = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch(`${baseUrl.baseUrl}api/walkin/list?startDate=${formData.startDate}&endDate=${formData.endDate}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            const json = await res.json();
            if (json.success) {
                let filtered = json.data || [];

                // Filter by Store
                if (formData.store && formData.store !== 'All') {
                    filtered = filtered.filter(w => locationKey(w.store) === locationKey(formData.store));
                }

                // Filter by Employee (Optional)
                if (formData.employee) {
                    filtered = filtered.filter(w => w.staff === formData.employee);
                }

                // Filter by custom Multi-Selected Statuses
                if (selectedStatuses.length > 0) {
                    filtered = filtered.filter(w => selectedStatuses.includes(w.status));
                }

                setReportData(filtered);
                setReportGenerated(true);
                setCurrentPage(1); // Reset page to 1 on search
            }
        } catch (err) {
            console.error("Error generating Walk-in report:", err);
        } finally {
            setLoading(false);
        }
    };

    // Pagination calculations
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = reportData.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(reportData.length / itemsPerPage);

    const handlePageChange = (pageNumber) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };

    // Sort Arrows double-indicator icon matching mockup image exactly
    const SortArrow = () => (
        <span className="inline-flex flex-col ml-1.5 align-middle text-[8px] text-gray-300">
            <span>▲</span>
            <span className="-mt-1">▼</span>
        </span>
    );

    return (
        <div className="mb-[70px] text-[14px] bg-white min-h-screen">
            <Header name="Walk-In Report" />
            <SideNav />
            <div className="md:hidden sm:block">
                <ModileNav />
            </div>

            {/* Layout Container matching standard dashboard spacing perfectly */}
            <div className="md:ml-[120px] mt-[160px] sm:mt-[140px] px-4 sm:px-6 lg:px-12 transition-all duration-300 print:mx-0 print:mt-0 print:p-0">
                
                {/* Header Row matching second mockup image exactly */}
                <div className="mt-8 mb-6 print:hidden">
                    <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Walk-In Report</h1>
                </div>

                {/* Main Content White Container Card matching mockup exactly */}
                <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8 border border-gray-150 mb-6 print:hidden">
                    <form onSubmit={handleGenerateReport} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            
                            {/* Start Date */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Start Date <span className="text-red-500">*</span>
                                </label>
                                <input 
                                    type="date"
                                    name="startDate"
                                    required
                                    value={formData.startDate}
                                    onChange={handleInputChange}
                                    className="w-full border border-gray-300 bg-white rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 text-gray-700 cursor-pointer"
                                />
                            </div>

                            {/* End Date */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    End Date <span className="text-red-500">*</span>
                                </label>
                                <input 
                                    type="date"
                                    name="endDate"
                                    required
                                    value={formData.endDate}
                                    onChange={handleInputChange}
                                    className="w-full border border-gray-300 bg-white rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 text-gray-700 cursor-pointer"
                                />
                            </div>

                            {/* Store */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Store <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="store"
                                    required
                                    disabled={user?.role === 'store_admin'}
                                    value={formData.store}
                                    onChange={handleInputChange}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 text-gray-700 bg-white disabled:bg-gray-50 cursor-pointer font-medium"
                                >
                                    {user?.role !== 'store_admin' && (
                                        <option value="All">All Stores</option>
                                    )}
                                    {branches.map((b, idx) => (
                                        <option key={idx} value={b.workingBranch}>{b.workingBranch}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Employees (Optional) */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Employees (Optional)
                                </label>
                                <select
                                    name="employee"
                                    value={formData.employee}
                                    onChange={handleInputChange}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 text-gray-700 bg-white cursor-pointer font-medium"
                                >
                                    <option value="">Select Employees</option>
                                    {currentStoreEmployees.map((emp, idx) => (
                                        <option key={idx} value={emp.username}>{emp.username}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Custom Checkbox Multi-Select Status Dropdown matching screenshot exactly */}
                            <div className="relative" id="status-dropdown-container">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Status <span className="text-red-500">*</span>
                                </label>
                                
                                {/* Status select display header box */}
                                <div 
                                    onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                                    className={`w-full border rounded-md px-3 py-2 text-sm text-gray-700 bg-white cursor-pointer font-semibold flex justify-between items-center transition-all ${
                                        showStatusDropdown ? 'border-blue-400 ring-2 ring-blue-100' : 'border-gray-300'
                                    }`}
                                >
                                    <span className="truncate">{getStatusDisplayText()}</span>
                                    <span className="text-gray-500 text-xs transition-transform duration-200">
                                        ▼
                                    </span>
                                </div>

                                {/* Custom dropdown popup matching screenshot exactly */}
                                {showStatusDropdown && (
                                    <div className="absolute left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl py-2 max-h-[280px] overflow-y-auto transition-all transform origin-top scale-100">
                                        
                                        {/* Select All Status option */}
                                        <div 
                                            onClick={handleSelectAllStatusToggle}
                                            className="px-4 py-2 hover:bg-gray-50 cursor-pointer flex items-center gap-3 transition-colors"
                                        >
                                            <input 
                                                type="checkbox"
                                                checked={selectedStatuses.length === STATUS_OPTIONS.length}
                                                onChange={() => {}} // handled by click on container
                                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                            />
                                            <span className="font-bold text-gray-700 text-xs tracking-wide">Select All Status</span>
                                        </div>

                                        {/* Divider line matching screenshot exactly */}
                                        <div className="border-t border-gray-100 my-1"></div>

                                        {/* Rest of the checkbox options */}
                                        {STATUS_OPTIONS.map((status) => (
                                            <div 
                                                key={status}
                                                onClick={() => handleStatusToggle(status)}
                                                className="px-4 py-2.5 hover:bg-gray-50 cursor-pointer flex items-center gap-3 transition-colors"
                                            >
                                                <input 
                                                    type="checkbox"
                                                    checked={selectedStatuses.includes(status)}
                                                    onChange={() => {}} // handled by click on container
                                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                                />
                                                <span className="font-bold text-gray-600 text-xs tracking-wide">{status}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Note text matching mockup screenshot exactly */}
                        <p className="text-xs text-gray-500">
                            <span className="text-red-500 font-semibold">Note:</span> To view all employee data, do not select any employee from the dropdown.
                        </p>

                        {/* Save Button centered, matches layout and styling exactly */}
                        <div className="flex justify-center pt-2">
                            <button 
                                type="submit"
                                className="bg-[#2A2A2A] hover:bg-black text-white px-10 py-2.5 rounded-md transition-all duration-200 font-bold shadow-md hover:shadow-lg transform active:scale-95 text-center min-w-[120px] cursor-pointer"
                            >
                                Save
                            </button>
                        </div>
                    </form>
                </div>

                {/* Generated Paginated Table matching the layout rules exactly */}
                {reportGenerated && (
                    <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-150 transition-all duration-500">
                        <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-3 print:hidden">
                            <h3 className="text-gray-800 font-bold text-base">Report Results</h3>
                            <button 
                                onClick={() => window.print()}
                                className="text-xs bg-gray-100 text-gray-600 border border-gray-300 px-3 py-1.5 rounded hover:bg-gray-200 transition-all font-semibold"
                            >
                                Print Report
                            </button>
                        </div>

                        {loading ? (
                            <div className="flex justify-center items-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800"></div>
                            </div>
                        ) : reportData.length === 0 ? (
                            <div className="text-center py-12 text-gray-400">
                                No walk-in records found matching your active filter criteria.
                            </div>
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm text-gray-600 border-collapse">
                                        <thead className="text-xs text-gray-500 uppercase bg-gray-50/50 border-b border-gray-100 font-bold">
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
                                                    className={`border-b border-gray-100 hover:bg-gray-50/30 ${
                                                        index % 2 === 1 ? 'bg-gray-50/50' : 'bg-white'
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
                                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 pt-4 border-t border-gray-100 text-xs text-gray-500 print:hidden">
                                    <div>
                                        Showing <span className="font-semibold text-gray-700">{indexOfFirstItem + 1}</span> to{' '}
                                        <span className="font-semibold text-gray-700">
                                            {Math.min(indexOfLastItem, reportData.length)}
                                        </span>{' '}
                                        of <span className="font-semibold text-gray-700">{reportData.length}</span> entries
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
                                                className={`px-3 py-1.5 border rounded-md font-semibold transition-colors ${
                                                    currentPage === page
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
                )}
            </div>
        </div>
    );
};

export default WalkinReport;
