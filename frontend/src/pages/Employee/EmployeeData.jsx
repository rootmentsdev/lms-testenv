/**
 * Employee Data Component
 * 
 * Displays employee list with filtering by role and branch
 * Supports CSV export, auto-sync, refresh, and detailed employee views
 * Includes responsive design for mobile and desktop views
 * 
 * @returns {JSX.Element} - Employee data component
 */
import { useEffect, useState, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { HiDownload, HiRefresh } from "react-icons/hi";
import { BiChevronDown } from "react-icons/bi";

import Header from "../../components/Header/Header";
import SideNav from "../../components/SideNav/SideNav";
import API_CONFIG from "../../api/api";

/**
 * API endpoints
 */
const API_ENDPOINTS = {
    GET_EMPLOYEES_WITH_TRAINING: 'api/employee/management/with-training-details',
    AUTO_SYNC: 'api/employee/auto-sync',
};

/**
 * Route paths
 */
const ROUTE_PATHS = {
    EMPLOYEE_DETAILS: (empID) => `/detailed/${empID}`,
};

/**
 * CSV export headers
 */
const CSV_HEADERS = [
    "Emp ID",
    "Name",
    "Role",
    "Branch",
    "Training",
    "Trng. Comp",
    "Trng. Overdue",
    "Assessments",
    "Assmt. Comp",
    "Assmt. Overdue",
];

/**
 * Mobile viewport breakpoint
 */
const MOBILE_BREAKPOINT = 768;

/**
 * Normalizes location names to handle spelling variations
 * 
 * @param {string} s - String to normalize
 * @returns {string} - Normalized string
 */
const canonFixes = (s) => {
    return s
        .replace(/\bedap{1,2}a?l{1,3}y\b/g, "edappally")
        .replace(/\bedap{1,2}a?l{1,3}i\b/g, "edappally")
        .replace(/\bmanjeri\b/g, "manjery")
        .replace(/\bperinthalmana\b/g, "perinthalmanna")
        .replace(/\bkottakal\b/g, "kottakkal")
        .replace(/\bkalpeta\b/g, "kalpetta");
};

/**
 * Normalizes string for comparison
 * 
 * @param {string} s - String to normalize
 * @returns {string} - Normalized lowercase string
 */
const norm = (s) => {
    return canonFixes(
        String(s || "")
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, " ")
            .trim()
    );
};

/**
 * Converts string to title case
 * 
 * @param {string} s - String to convert
 * @returns {string} - Title case string
 */
const titleCase = (s) => {
    return String(s || "")
        .toLowerCase()
        .replace(/\b\w/g, (m) => m.toUpperCase());
};

/**
 * Retrieves authentication token from localStorage safely
 * 
 * @returns {string|null} - Authentication token or null
 */
const getAuthToken = () => {
    try {
        return localStorage.getItem('token');
    } catch (error) {
        console.error('Failed to retrieve auth token:', error);
        return null;
    }
};

/**
 * Builds authorization headers for API requests
 * 
 * @returns {Object} - Headers object
 */
const buildAuthHeaders = () => {
    const token = getAuthToken();
    return {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
    };
};

/**
 * Employee Data Component
 */
const EmployeeData = () => {
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [filterRole, setFilterRole] = useState("");
    const [filterBranch, setFilterBranch] = useState("");
    const [isRoleOpen, setIsRoleOpen] = useState(false);
    const [isBranchOpen, setIsBranchOpen] = useState(false);
    const [error, setError] = useState("");
    const [isMobile, setIsMobile] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    /**
     * Checks if viewport is mobile
     */
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    /**
     * Normalizes employee data from API response
     * 
     * @param {Array} employees - Raw employee data from API
     * @returns {Array} - Normalized employee data
     */
    const normalizeEmployeeData = useCallback((employees) => {
        return employees.map((employee) => {
            const branchRaw = employee.workingBranch || "";
            return {
                empID: employee.empID || "",
                username: employee.username || "",
                designation: employee.designation || "",
                workingBranch: branchRaw,
                workingBranchLabel: titleCase(branchRaw),
                trainingCount: employee.trainingCount || 0,
                passCountTraining: employee.passCountTraining || 0,
                Trainingdue: employee.trainingDue || 0,
                trainingCompletionPercentage: employee.trainingCompletionPercentage || 0,
                assignedAssessmentsCount: employee.assignedAssessmentsCount || 0,
                passCountAssessment: employee.passCountAssessment || 0,
                AssessmentDue: employee.assessmentDue || 0,
                assessmentCompletionPercentage: employee.assessmentCompletionPercentage || 0,
                isLocalUser: employee.isLocalUser || false,
                hasTrainingData: employee.hasTrainingData || false,
            };
        });
    }, []);

    /**
     * Fetches employee data from API
     */
    const fetchEmployees = useCallback(async () => {
        try {
            setIsRefreshing(true);
            const token = getAuthToken();
            
            if (!token) {
                setError("Authentication required. Please login again.");
                return;
            }

            const cacheBuster = `?t=${Date.now()}`;
            const response = await fetch(
                `${API_CONFIG.baseUrl}${API_ENDPOINTS.GET_EMPLOYEES_WITH_TRAINING}${cacheBuster}`,
                {
                    method: "GET",
                    headers: buildAuthHeaders(),
                    credentials: "include",
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP ${response.status} ${response.statusText}`);
            }

            const json = await response.json();

            if (json.success && json.data) {
                const normalized = normalizeEmployeeData(json.data || []);
                setData(normalized);
                setFilteredData(normalized);
                setError("");
            } else {
                throw new Error(json.message || "Invalid response format");
            }
        } catch (error) {
            console.error("Failed to fetch employees:", error.message);
            setError("Failed to fetch employee data. Please try again later.");
            setData([]);
            setFilteredData([]);
        } finally {
            setIsRefreshing(false);
        }
    }, [normalizeEmployeeData]);

    useEffect(() => {
        fetchEmployees();
    }, [fetchEmployees]);

    /**
     * Extracts unique roles from employee data
     */
    const roles = useMemo(
        () => [...new Set(data.map((emp) => emp.designation).filter(Boolean))],
        [data]
    );

    /**
     * Extracts unique branches from employee data
     */
    const branches = useMemo(() => {
        const branchMap = new Map();
        data.forEach((emp) => {
            if (emp.workingBranch) {
                branchMap.set(emp.workingBranchLabel, emp.workingBranch);
            }
        });
        return Array.from(branchMap.entries()).map(([label, raw]) => ({ label, raw }));
    }, [data]);

    /**
     * Filters employee data by role and branch
     * 
     * @param {string} role - Role filter
     * @param {string} branchRaw - Branch filter (raw value)
     */
    const filterData = useCallback((role, branchRaw) => {
        const normalizedRole = norm(role);
        const normalizedBranch = norm(branchRaw);
        
        const filtered = data.filter((employee) => {
            const roleMatch = !normalizedRole || norm(employee.designation) === normalizedRole;
            const branchMatch = !normalizedBranch || norm(employee.workingBranch) === normalizedBranch;
            return roleMatch && branchMatch;
        });
        
        setFilteredData(filtered);
    }, [data]);

    /**
     * Handles role filter change
     * 
     * @param {string} role - Selected role
     */
    const handleRoleChange = useCallback((role) => {
        setFilterRole(role);
        filterData(role, filterBranch);
        setIsRoleOpen(false);
    }, [filterBranch, filterData]);

    /**
     * Handles branch filter change
     * 
     * @param {string} branchRaw - Selected branch (raw value)
     */
    const handleBranchChange = useCallback((branchRaw) => {
        setFilterBranch(branchRaw);
        filterData(filterRole, branchRaw);
        setIsBranchOpen(false);
    }, [filterRole, filterData]);

    /**
     * Closes dropdowns when clicking outside
     */
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest(".dropdown-container")) {
                setIsRoleOpen(false);
                setIsBranchOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    /**
     * Handles refresh action
     */
    const handleRefresh = useCallback(async () => {
        await fetchEmployees();
    }, [fetchEmployees]);

    /**
     * Handles auto-sync action
     */
    const handleAutoSync = useCallback(async () => {
        try {
            setIsRefreshing(true);
            const token = getAuthToken();
            
            if (!token) {
                setError("Authentication required. Please login again.");
                return;
            }

            const response = await fetch(`${API_CONFIG.baseUrl}${API_ENDPOINTS.AUTO_SYNC}`, {
                method: "POST",
                headers: buildAuthHeaders(),
                credentials: "include",
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status} ${response.statusText}`);
            }

            const result = await response.json();

            if (result.success) {
                await fetchEmployees();
                setError("");
            } else {
                throw new Error(result.message || "Auto-sync failed");
            }
        } catch (error) {
            console.error("Auto-sync failed:", error.message);
            setError(`Auto-sync failed: ${error.message}`);
        } finally {
            setIsRefreshing(false);
        }
    }, [fetchEmployees]);

    /**
     * Exports filtered data to CSV
     */
    const exportToCSV = useCallback(() => {
        const rows = filteredData.map((emp) => [
            emp.empID,
            emp.username,
            emp.designation,
            emp.workingBranch,
            emp.trainingCount,
            `${emp.trainingCompletionPercentage}%`,
            emp.Trainingdue,
            emp.assignedAssessmentsCount,
            `${emp.assessmentCompletionPercentage}%`,
            emp.AssessmentDue,
        ]);

        const csvContent =
            "data:text/csv;charset=utf-8," +
            [CSV_HEADERS.join(","), ...rows.map((row) => row.join(","))].join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "employee_data.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }, [filteredData]);

    /**
     * Clears all filters
     */
    const handleClearFilters = useCallback(() => {
        setFilterRole("");
        setFilterBranch("");
        setFilteredData(data);
    }, [data]);

    /**
     * Mobile Employee Card Component
     * 
     * @param {Object} props - Component props
     * @param {Object} props.employee - Employee data object
     * @param {number} props.index - Card index for styling
     * @returns {JSX.Element} - Mobile employee card
     */
    const MobileEmployeeCard = ({ employee, index }) => (
        <div className={`p-4 rounded-lg border ${index % 2 === 0 ? "bg-gray-50" : "bg-white"} mb-4 shadow-sm`}>
            <div className="flex justify-between items-start mb-3">
                <div>
                    <h3 className="font-semibold text-[#016E5B] text-lg">#{employee.empID}</h3>
                    <p className="font-medium text-gray-800">{employee.username}</p>
                </div>
                <Link
                    to={ROUTE_PATHS.EMPLOYEE_DETAILS(employee.empID)}
                    className="bg-[#016E5B] text-white px-3 py-1 rounded text-sm hover:bg-[#014C3F] transition-colors"
                >
                    View
                </Link>
            </div>

            <div className="grid grid-cols-1 gap-2 text-sm">
                <div className="flex justify-between">
                    <span className="text-gray-600">Role:</span>
                    <span className="font-medium text-right flex-1 ml-2" title={employee.designation}>
                        {employee.designation}
                    </span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-600">Branch:</span>
                    <span className="font-medium text-right flex-1 ml-2" title={employee.workingBranch}>
                        {employee.workingBranchLabel}
                    </span>
                </div>

                <div className="mt-2 pt-2 border-t border-gray-200">
                    <p className="font-medium text-gray-700 mb-1">Training:</p>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="text-center">
                            <div className="font-semibold text-[#016E5B]">{employee.trainingCount}</div>
                            <div className="text-gray-500">Total</div>
                        </div>
                        <div className="text-center">
                            <div className="font-semibold text-green-600">{employee.passCountTraining}%</div>
                            <div className="text-gray-500">Completed</div>
                        </div>
                        <div className="text-center">
                            <div className="font-semibold text-red-600">{employee.Trainingdue}</div>
                            <div className="text-gray-500">Overdue</div>
                        </div>
                    </div>
                </div>

                <div className="mt-2 pt-2 border-t border-gray-200">
                    <p className="font-medium text-gray-700 mb-1">Assessments:</p>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="text-center">
                            <div className="font-semibold text-[#016E5B]">{employee.assignedAssessmentsCount}</div>
                            <div className="text-gray-500">Total</div>
                        </div>
                        <div className="text-center">
                            <div className="font-semibold text-green-600">{employee.passCountAssessment}%</div>
                            <div className="text-gray-500">Completed</div>
                        </div>
                        <div className="text-center">
                            <div className="font-semibold text-red-600">{employee.AssessmentDue}</div>
                            <div className="text-gray-500">Overdue</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="mb-[70px] text-[14px]">
            <Header name="Employee" />
            <SideNav />

            <div className="md:ml-[90px] mt-[160px] sm:mt-[140px]">
                <div className="px-4 sm:px-6 lg:px-12">
                    <div className="flex flex-col gap-4 mt-8 sm:mt-12 lg:mt-16 mb-6">
                        <h1 className="text-[#212121] text-xl sm:text-2xl font-semibold">Employee Management</h1>

                        {/* Filter and Action Buttons */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                            <div className="flex flex-col sm:flex-row gap-3 flex-1">
                                {/* Role Filter Dropdown */}
                                <div className="relative dropdown-container flex-1 sm:flex-none sm:min-w-[140px] sm:max-w-[180px]">
                                    <button
                                        type="button"
                                        className="flex justify-between items-center w-full border-2 py-2.5 px-3 bg-white text-black rounded-md hover:bg-gray-200 transition-all duration-150"
                                        onClick={() => {
                                            setIsRoleOpen((prev) => !prev);
                                            setIsBranchOpen(false);
                                        }}
                                    >
                                        <span className="truncate text-sm font-medium">
                                            {filterRole || "All Roles"}
                                        </span>
                                        <BiChevronDown
                                            className={`text-[#016E5B] ml-2 flex-shrink-0 transition-transform ${
                                                isRoleOpen ? "rotate-180" : ""
                                            }`}
                                            size={18}
                                        />
                                    </button>
                                    {isRoleOpen && (
                                        <div className="absolute left-0 right-0 mt-2 bg-white rounded-md shadow-lg z-30 max-h-60 overflow-y-auto border border-gray-200">
                                            <button
                                                type="button"
                                                onClick={() => handleRoleChange("")}
                                                className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-100 border-b border-gray-100 font-medium"
                                            >
                                                All Roles
                                            </button>
                                            {roles.map((role, index) => (
                                                <button
                                                    key={index}
                                                    type="button"
                                                    onClick={() => handleRoleChange(role)}
                                                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-100 border-b border-gray-100 last:border-b-0"
                                                    title={role}
                                                >
                                                    {role}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Branch Filter Dropdown */}
                                <div className="relative dropdown-container flex-1 sm:flex-none sm:min-w-[160px] sm:max-w-[220px]">
                                    <button
                                        type="button"
                                        className="flex justify-between items-center w-full border-2 py-2.5 px-3 bg-white text-black rounded-md hover:bg-gray-200 transition-all duration-150"
                                        onClick={() => {
                                            setIsBranchOpen((prev) => !prev);
                                            setIsRoleOpen(false);
                                        }}
                                    >
                                        <span className="truncate text-sm font-medium">
                                            {filterBranch ? titleCase(filterBranch) : "All Branches"}
                                        </span>
                                        <BiChevronDown
                                            className={`text-[#016E5B] ml-2 flex-shrink-0 transition-transform ${
                                                isBranchOpen ? "rotate-180" : ""
                                            }`}
                                            size={18}
                                        />
                                    </button>
                                    {isBranchOpen && (
                                        <div className="absolute left-0 right-0 mt-2 bg-white rounded-md shadow-lg z-30 max-h-60 overflow-y-auto border border-gray-200">
                                            <button
                                                type="button"
                                                onClick={() => handleBranchChange("")}
                                                className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-100 border-b border-gray-100 font-medium"
                                            >
                                                All Branches
                                            </button>
                                            {branches.map(({ label, raw }) => (
                                                <button
                                                    key={raw}
                                                    type="button"
                                                    onClick={() => handleBranchChange(raw)}
                                                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-100 border-b border-gray-100 last:border-b-0"
                                                    title={label}
                                                >
                                                    {label}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <button
                                type="button"
                                className="bg-green-600 text-white px-4 py-2.5 rounded-md hover:bg-green-700 transition-all duration-150 text-sm font-medium flex items-center justify-center gap-2 sm:whitespace-nowrap disabled:opacity-50"
                                onClick={handleAutoSync}
                                disabled={isRefreshing}
                                title="Sync all employees from external API to database"
                            >
                                <HiRefresh size={16} className={isRefreshing ? 'animate-spin' : ''} />
                                <span className="hidden sm:inline">{isRefreshing ? 'Syncing...' : 'Auto-Sync'}</span>
                                <span className="sm:hidden">{isRefreshing ? '...' : '⟳'}</span>
                            </button>

                            <button
                                type="button"
                                className="bg-blue-600 text-white px-4 py-2.5 rounded-md hover:bg-blue-700 transition-all duration-150 text-sm font-medium flex items-center justify-center gap-2 sm:whitespace-nowrap disabled:opacity-50"
                                onClick={handleRefresh}
                                disabled={isRefreshing}
                            >
                                <HiRefresh size={16} className={isRefreshing ? 'animate-spin' : ''} />
                                <span className="hidden sm:inline">{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
                                <span className="sm:hidden">{isRefreshing ? '...' : '↻'}</span>
                            </button>

                            <button
                                type="button"
                                className="bg-[#016E5B] text-white px-4 py-2.5 rounded-md hover:bg-[#014C3F] transition-all duration-150 text-sm font-medium flex items-center justify-center gap-2 sm:whitespace-nowrap"
                                onClick={exportToCSV}
                            >
                                <HiDownload size={16} />
                                <span className="hidden sm:inline">Download CSV</span>
                                <span className="sm:hidden">CSV</span>
                            </button>
                        </div>

                        {/* Results Count */}
                        <div className="text-sm text-gray-600">
                            Showing {filteredData.length} of {data.length} employees
                            {(filterRole || filterBranch) && (
                                <button
                                    type="button"
                                    onClick={handleClearFilters}
                                    className="ml-2 text-[#016E5B] hover:underline"
                                >
                                    Clear filters
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="text-red-500 text-center my-4 mx-4 sm:mx-6 lg:mx-12 p-3 bg-red-50 border border-red-200 rounded-md text-sm">
                        {error}
                    </div>
                )}

                {/* Content - Mobile or Desktop View */}
                <div className="mx-4 sm:mx-6 lg:mx-12">
                    {isMobile ? (
                        <div className="space-y-4">
                            {filteredData.length > 0 ? (
                                filteredData.map((employee, index) => (
                                    <MobileEmployeeCard key={employee.empID || index} employee={employee} index={index} />
                                ))
                            ) : (
                                <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg">
                                    <div className="flex flex-col items-center gap-3">
                                        <span className="text-4xl">📋</span>
                                        <span className="text-lg font-medium">No employees found</span>
                                        <span className="text-sm">Try adjusting your filters</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="overflow-x-auto text-black bg-white rounded-lg shadow-sm border border-gray-200">
                            <div className="max-h-[70vh] overflow-y-auto">
                                <table className="w-full text-sm">
                                    <thead className="sticky top-0 z-20 bg-[#016E5B] text-white">
                                        <tr>
                                            <th className="px-3 py-3 border-r border-[#014C3F] text-center font-semibold min-w-[90px]">Emp ID</th>
                                            <th className="px-3 py-3 border-r border-[#014C3F] text-center font-semibold min-w-[150px]">Name</th>
                                            <th className="px-3 py-3 border-r border-[#014C3F] text-center font-semibold min-w-[140px] hidden lg:table-cell">Role</th>
                                            <th className="px-3 py-3 border-r border-[#014C3F] text-center font-semibold min-w-[180px] hidden lg:table-cell">Branch</th>
                                            <th className="px-3 py-3 border-r border-[#014C3F] text-center font-semibold min-w-[80px] hidden md:table-cell">Training</th>
                                            <th className="px-3 py-3 border-r border-[#014C3F] text-center font-semibold min-w-[90px] hidden md:table-cell">Trng. Comp</th>
                                            <th className="px-3 py-3 border-r border-[#014C3F] text-center font-semibold min-w-[100px] hidden xl:table-cell">Trng. Overdue</th>
                                            <th className="px-3 py-3 border-r border-[#014C3F] text-center font-semibold min-w-[100px] hidden md:table-cell">Assessments</th>
                                            <th className="px-3 py-3 border-r border-[#014C3F] text-center font-semibold min-w-[100px] hidden md:table-cell">Assmt. Comp</th>
                                            <th className="px-3 py-3 border-r border-[#014C3F] text-center font-semibold min-w-[110px] hidden xl:table-cell">Assmt. Overdue</th>
                                            <th className="px-3 py-3 text-center font-semibold min-w-[70px]">View</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white">
                                        {filteredData.length > 0 ? (
                                            filteredData.map((employee, index) => (
                                                <tr
                                                    key={employee.empID || index}
                                                    className={`${index % 2 === 0 ? "bg-gray-50" : "bg-white"} hover:bg-blue-50 transition-all border-b border-gray-200`}
                                                >
                                                    <td className="px-3 py-3 border-r border-gray-200 text-center font-medium text-[#016E5B]">
                                                        #{employee.empID}
                                                    </td>
                                                    <td className="px-3 py-3 border-r border-gray-200 text-center" title={employee.username}>
                                                        <div className="lg:hidden">
                                                            <div className="font-medium">{employee.username}</div>
                                                            <div className="text-xs text-gray-500 mt-1">{employee.designation}</div>
                                                            <div className="text-xs text-gray-500">{employee.workingBranchLabel}</div>
                                                        </div>
                                                        <div className="hidden lg:block">{employee.username}</div>
                                                    </td>
                                                    <td className="px-3 py-3 border-r border-gray-200 text-center text-sm hidden lg:table-cell" title={employee.designation}>
                                                        {employee.designation}
                                                    </td>
                                                    <td className="px-3 py-3 border-r border-gray-200 text-center text-sm hidden lg:table-cell" title={employee.workingBranch}>
                                                        {employee.workingBranchLabel}
                                                    </td>
                                                    <td className="px-3 py-3 border-r border-gray-200 text-center font-medium hidden md:table-cell">
                                                        {employee.trainingCount}
                                                    </td>
                                                    <td className="px-3 py-3 border-r border-gray-200 text-center font-medium hidden md:table-cell">
                                                        {employee.trainingCompletionPercentage}%
                                                    </td>
                                                    <td className="px-3 py-3 border-r border-gray-200 text-center font-medium hidden xl:table-cell">
                                                        {employee.Trainingdue}
                                                    </td>
                                                    <td className="px-3 py-3 border-r border-gray-200 text-center font-medium hidden md:table-cell">
                                                        {employee.assignedAssessmentsCount}
                                                    </td>
                                                    <td className="px-3 py-3 border-r border-gray-200 text-center font-medium hidden md:table-cell">
                                                        {employee.assessmentCompletionPercentage}%
                                                    </td>
                                                    <td className="px-3 py-3 border-r border-gray-200 text-center font-medium hidden xl:table-cell">
                                                        {employee.AssessmentDue}
                                                    </td>
                                                    <td className="px-3 py-3 text-center">
                                                        <Link
                                                            to={ROUTE_PATHS.EMPLOYEE_DETAILS(employee.empID)}
                                                            className="text-[#016E5B] font-semibold hover:underline hover:text-[#014C3F] transition-colors text-sm px-2 py-1 rounded"
                                                        >
                                                            View
                                                        </Link>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="11" className="text-center py-12 text-gray-500 bg-gray-50">
                                                    <div className="flex flex-col items-center gap-3">
                                                        <span className="text-4xl">📋</span>
                                                        <span className="text-lg font-medium">No employees found</span>
                                                        <span className="text-sm">Try adjusting your filters</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EmployeeData;
