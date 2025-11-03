/**
 * Training Overdue Data Component
 * 
 * Displays employees with overdue trainings and allows sending reminders
 * Supports filtering by role and branch with dropdown menus
 * 
 * @returns {JSX.Element} - Training overdue data component
 */
import { useEffect, useState, useMemo, useCallback } from "react";
import { BsFillSendCheckFill, BsSend } from "react-icons/bs";
import { CiFilter } from "react-icons/ci";
import { toast } from "react-toastify";

import Header from "../../components/Header/Header";
import SideNav from "../../components/SideNav/SideNav";
import API_CONFIG from "../../api/api";

/**
 * API endpoints
 */
const API_ENDPOINTS = {
    GET_OVERDUE_TRAININGS: 'api/admin/overdue/Training',
    SEND_REMINDER: (empID) => `api/admin/overdue/Training/send/${empID}`,
};

/**
 * Table column headers
 */
const TABLE_HEADERS = [
    'Emp ID',
    'Name',
    'Role',
    'Branch',
    'Training Overdue',
    'Send Reminder',
];

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
 * Formats date to localized string
 * 
 * @param {string|Date} dateString - Date string or Date object
 * @returns {string} - Formatted date string
 */
const formatDate = (dateString) => {
    if (!dateString) return 'No deadline';
    
    try {
        return new Date(dateString).toLocaleDateString();
    } catch (error) {
        console.error('Error formatting date:', error);
        return 'Invalid date';
    }
};

/**
 * Training Overdue Data Component
 */
const TraningOverDuedata = () => {
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [filterRole, setFilterRole] = useState("");
    const [filterBranch, setFilterBranch] = useState("");
    const [isRoleOpen, setIsRoleOpen] = useState(false);
    const [isBranchOpen, setIsBranchOpen] = useState(false);
    const [error, setError] = useState("");
    const [sendStatus, setSendStatus] = useState({});
    const [isLoading, setIsLoading] = useState(true);

    const token = getAuthToken();

    /**
     * Fetches overdue training data
     */
    const fetchEmployees = useCallback(async () => {
        if (!token) return;

        setIsLoading(true);
        setError("");

        try {
            const response = await fetch(`${API_CONFIG.baseUrl}${API_ENDPOINTS.GET_OVERDUE_TRAININGS}`, {
                method: "GET",
                headers: buildAuthHeaders(),
                credentials: "include",
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            setData(result.data || []);
            setFilteredData(result.data || []);
        } catch (error) {
            console.error("Failed to fetch employees:", error.message);
            setError("Failed to fetch employee data. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchEmployees();
    }, [fetchEmployees]);

    /**
     * Extracts unique roles from data
     */
    const roles = useMemo(() => {
        return [...new Set(data.map(emp => emp.role).filter(Boolean))];
    }, [data]);

    /**
     * Extracts unique branches from data
     */
    const branches = useMemo(() => {
        return [...new Set(data.map(emp => emp.workingBranch).filter(Boolean))];
    }, [data]);

    /**
     * Filters data based on role and branch
     * 
     * @param {string} role - Role filter
     * @param {string} branch - Branch filter
     */
    const filterData = useCallback((role, branch) => {
        const filtered = data.filter(
            (employee) =>
                (!role || employee.role === role) &&
                (!branch || employee.workingBranch === branch)
        );
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
     * @param {string} branch - Selected branch
     */
    const handleBranchChange = useCallback((branch) => {
        setFilterBranch(branch);
        filterData(filterRole, branch);
        setIsBranchOpen(false);
    }, [filterRole, filterData]);

    /**
     * Sends reminder to employee
     * 
     * @param {string} empID - Employee ID
     */
    const handleSendReminder = useCallback(async (empID) => {
        if (!token) return;

        setSendStatus((prev) => ({ ...prev, [empID]: true }));

        try {
            const response = await fetch(
                `${API_CONFIG.baseUrl}${API_ENDPOINTS.SEND_REMINDER(empID)}`,
                {
                    method: 'GET',
                    headers: buildAuthHeaders(),
                }
            );

            const result = await response.json();

            if (response.ok) {
                toast.success(result.message || 'Reminder sent successfully', {
                    icon: <BsFillSendCheckFill className="text-green-500" size={24} />,
                });
            } else {
                throw new Error(result.message || 'Failed to send reminder');
            }
        } catch (error) {
            console.error('Error sending reminder:', error);
            toast.error(error.message || 'Failed to send reminder');
            setSendStatus((prev) => ({ ...prev, [empID]: false }));
        }
    }, [token]);

    /**
     * Renders filter dropdown
     * 
     * @param {Object} props - Dropdown props
     * @param {boolean} props.isOpen - Whether dropdown is open
     * @param {Function} props.setIsOpen - Function to set dropdown state
     * @param {string} props.selectedValue - Currently selected value
     * @param {Array} props.options - Options array
     * @param {Function} props.onChange - Change handler
     * @param {string} props.label - Dropdown label
     * @returns {JSX.Element} - Filter dropdown element
     */
    const FilterDropdown = ({ isOpen, setIsOpen, selectedValue, options, onChange, label }) => (
        <div className="relative inline-block text-left w-36">
            <button
                type="button"
                className="flex justify-between items-center w-full border-2 py-2 px-4 bg-white text-black rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
                onClick={() => setIsOpen((prev) => !prev)}
            >
                <h4>{selectedValue || label}</h4>
                <CiFilter className="text-[#016E5B]" />
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-full bg-white rounded-md shadow-lg z-10 border border-gray-200">
                    <button
                        type="button"
                        onClick={() => onChange("")}
                        className="block w-full py-2 px-4 text-sm text-gray-700 hover:bg-gray-100 text-left"
                    >
                        All
                    </button>
                    {options.map((option, index) => (
                        <button
                            key={index}
                            type="button"
                            onClick={() => onChange(option)}
                            className="block w-full py-2 px-4 text-sm text-gray-700 hover:bg-gray-100 text-left"
                        >
                            {option}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );

    /**
     * Renders overdue trainings list
     * 
     * @param {Array} overdueTrainings - Array of overdue trainings
     * @returns {JSX.Element} - Trainings list element
     */
    const renderOverdueTrainings = useCallback((overdueTrainings) => {
        if (!overdueTrainings || overdueTrainings.length === 0) {
            return <div className="text-gray-500">No Overdue Trainings</div>;
        }

        // Filter out trainings with null trainingId
        const validTrainings = overdueTrainings.filter((training) => training.trainingId);

        if (validTrainings.length === 0) {
            return <div className="text-gray-500">No Overdue Trainings</div>;
        }

        return (
            <div className="flex flex-col space-y-1">
                {validTrainings.map((training, idx) => (
                    <div key={idx}>
                        <div className="text-left">
                            {training.trainingId?.trainingName || 'Unknown Training'} 
                            {' (Due: '}
                            {formatDate(training.deadline)}
                            {')'}
                        </div>
                        {idx < validTrainings.length - 1 && (
                            <div className="border-t border-gray-300 w-full my-2"></div>
                        )}
                    </div>
                ))}
            </div>
        );
    }, []);

    return (
        <div className="bg-white h-[100] lg:mb-[90px]">
            <Header name="Employee" />
            <SideNav />

            <div className="md:ml-[90px] lg:mt-[100px]">
                {/* Filter Section */}
                <div className="flex justify-end mb-5 mt-20">
                    <div className="flex gap-4 mt-10">
                        <FilterDropdown
                            isOpen={isRoleOpen}
                            setIsOpen={setIsRoleOpen}
                            selectedValue={filterRole}
                            options={roles}
                            onChange={handleRoleChange}
                            label="Role"
                        />
                        <FilterDropdown
                            isOpen={isBranchOpen}
                            setIsOpen={setIsBranchOpen}
                            selectedValue={filterBranch}
                            options={branches}
                            onChange={handleBranchChange}
                            label="Branch"
                        />
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="text-red-500 text-center mb-4 mx-10">{error}</div>
                )}

                {/* Employee Table */}
                <div className="mx-10 overflow-x-auto text-black lg:mb-[70px]">
                    {isLoading ? (
                        <div className="text-center py-8 text-gray-500">Loading overdue trainings...</div>
                    ) : (
                        <table className="w-full border-2 border-gray-300">
                            <thead>
                                <tr className="bg-[#016E5B] text-white">
                                    {TABLE_HEADERS.map((header) => (
                                        <th key={header} className="px-3 py-1 border-2 border-gray-300">
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filteredData.length > 0 ? (
                                    filteredData.map((employee, index) => (
                                        <tr key={employee.empID || index} className="border-b hover:bg-gray-100">
                                            <td className="px-3 py-1 border-2 border-gray-300 text-center">
                                                #{employee.empID || 'N/A'}
                                            </td>
                                            <td className="px-3 py-1 border-2 border-gray-300 text-center">
                                                {employee.userName || 'N/A'}
                                            </td>
                                            <td className="px-3 py-1 border-2 border-gray-300 text-center">
                                                {employee.role || 'N/A'}
                                            </td>
                                            <td className="px-3 py-1 border-2 border-gray-300 text-center">
                                                {employee.workingBranch || 'N/A'}
                                            </td>
                                            <td className="px-3 py-1 border-2 border-gray-300 text-center">
                                                {renderOverdueTrainings(employee.overdueAssessments)}
                                            </td>
                                            <td className="px-3 py-1 border-2 border-gray-300 text-center">
                                                {sendStatus[employee.empID] ? (
                                                    <span className="flex justify-center items-center gap-2 text-[#016E5B]">
                                                        OK <BsFillSendCheckFill />
                                                    </span>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        className="flex justify-center items-center gap-2 cursor-pointer text-[#016E5B] hover:text-green-700 transition-colors"
                                                        onClick={() => handleSendReminder(employee.empID)}
                                                    >
                                                        Send <BsSend />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={TABLE_HEADERS.length} className="text-center py-3">
                                            {error ? 'Failed to load data' : 'No data available'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TraningOverDuedata;
