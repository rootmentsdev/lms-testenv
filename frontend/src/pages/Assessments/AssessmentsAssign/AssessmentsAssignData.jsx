/**
 * Assessments Assign Data Component
 * 
 * Displays assessment assignment details with filtering by role and branch
 * Shows user scores, status, and due dates sorted by completion score
 * 
 * @returns {JSX.Element} - Assessments assign data component
 */
import { Link, useParams } from "react-router-dom";
import { useEffect, useState, useMemo, useCallback } from "react";
import { FaPlus } from "react-icons/fa";
import { CiFilter } from "react-icons/ci";

import Header from "../../../components/Header/Header";
import SideNav from "../../../components/SideNav/SideNav";
import API_CONFIG from "../../../api/api";

/**
 * API endpoints
 */
const API_ENDPOINTS = {
    GET_ASSESSMENT_DETAILS: (assessmentId) => `api/user/get/assessment/details/${assessmentId}`,
};

/**
 * Route paths
 */
const ROUTE_PATHS = {
    ASSIGN_ASSESSMENT: '/assign/Assessment',
};

/**
 * Table column headers
 */
const TABLE_HEADERS = [
    'EmpID',
    'Name',
    'Designation',
    'Branch',
    'Due Date',
    'Status',
    'Score',
];

/**
 * Formats date to localized date string
 * 
 * @param {string|Date} dateString - Date string or Date object
 * @returns {string} - Formatted date string
 */
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
        return new Date(dateString).toLocaleDateString();
    } catch (error) {
        console.error('Error formatting date:', error);
        return 'Invalid date';
    }
};

/**
 * Rounds score value for display
 * 
 * @param {number|undefined} score - Score value
 * @returns {string} - Formatted score
 */
const formatScore = (score) => {
    if (score === undefined || score === null) return 'N/A';
    return Math.round(score).toString();
};

/**
 * Assessments Assign Data Component
 */
const AssessmentsAssignData = () => {
    const { id } = useParams();
    const [users, setUsers] = useState([]);
    const [error, setError] = useState(null);
    const [filterRole, setFilterRole] = useState("");
    const [filterBranch, setFilterBranch] = useState("");
    const [isRoleOpen, setIsRoleOpen] = useState(false);
    const [isBranchOpen, setIsBranchOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    /**
     * Fetches assessment details from API
     */
    const fetchAssessmentDetails = useCallback(async () => {
        if (!id) return;

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(
                `${API_CONFIG.baseUrl}${API_ENDPOINTS.GET_ASSESSMENT_DETAILS(id)}`
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (result?.data?.users) {
                setUsers(result.data.users);
            } else {
                setError("No assessment details found.");
            }
        } catch (error) {
            console.error('Error fetching assessment details:', error);
            setError("An error occurred while fetching data.");
        } finally {
            setIsLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchAssessmentDetails();
    }, [fetchAssessmentDetails]);

    /**
     * Extracts unique roles from users
     */
    const uniqueRoles = useMemo(() => {
        return [...new Set(users.map(user => user.designation).filter(Boolean))];
    }, [users]);

    /**
     * Extracts unique branches from users
     */
    const uniqueBranches = useMemo(() => {
        return [...new Set(users.map(user => user.workingBranch).filter(Boolean))];
    }, [users]);

    /**
     * Filters users by role and branch
     */
    const filteredData = useMemo(() => {
        let filtered = [...users];

        if (filterRole) {
            filtered = filtered.filter(user => user.designation === filterRole);
        }

        if (filterBranch) {
            filtered = filtered.filter(user => user.workingBranch === filterBranch);
        }

        return filtered;
    }, [users, filterRole, filterBranch]);

    /**
     * Sorts data by score in ascending order
     */
    const sortedData = useMemo(() => {
        return [...filteredData].sort((a, b) => {
            const scoreA = a.assignedAssessments?.[0]?.complete || 0;
            const scoreB = b.assignedAssessments?.[0]?.complete || 0;
            return scoreA - scoreB;
        });
    }, [filteredData]);

    /**
     * Handles role filter change
     * 
     * @param {string} role - Selected role
     */
    const handleRoleFilterChange = useCallback((role) => {
        setFilterRole(role);
        setIsRoleOpen(false);
    }, []);

    /**
     * Handles branch filter change
     * 
     * @param {string} branch - Selected branch
     */
    const handleBranchFilterChange = useCallback((branch) => {
        setFilterBranch(branch);
        setIsBranchOpen(false);
    }, []);

    /**
     * Closes dropdowns when clicking outside
     */
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest('.dropdown-container')) {
                setIsRoleOpen(false);
                setIsBranchOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

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
        <div className="relative inline-block text-left w-36 dropdown-container">
            <button
                type="button"
                className="flex justify-between items-center w-full border-2 py-2 px-4 bg-white text-black rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                onClick={() => setIsOpen(!isOpen)}
            >
                <h4>{selectedValue || label}</h4>
                <CiFilter className="text-[#016E5B]" />
            </button>

            {isOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-full rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                    <div className="py-1">
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
                </div>
            )}
        </div>
    );

    if (isLoading) {
        return (
            <div className="w-full h-full bg-white text-[#016E5B]">
                <Header name="Assessments Details" />
                <SideNav />
                <div className="md:ml-[100px] mt-[150px]">
                    <div className="text-center py-8 text-gray-500">Loading assessment details...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full bg-white text-[#016E5B]">
            <Header name="Assessments Details" />
            <SideNav />

            <div className="md:ml-[100px] mt-[150px]">
                {/* Header Actions */}
                <div className="flex justify-between mx-10 flex-wrap gap-4">
                    <Link to={ROUTE_PATHS.ASSIGN_ASSESSMENT}>
                        <div className="flex w-56 border-2 justify-evenly items-center py-2 ml-10 cursor-pointer hover:bg-gray-50 transition-colors">
                            <div className="text-[#016E5B]">
                                <FaPlus />
                            </div>
                            <h4 className="text-black font-medium">Assign Assessment</h4>
                        </div>
                    </Link>

                    {/* Filter Dropdowns */}
                    <div className="flex gap-5">
                        <FilterDropdown
                            isOpen={isRoleOpen}
                            setIsOpen={setIsRoleOpen}
                            selectedValue={filterRole}
                            options={uniqueRoles}
                            onChange={handleRoleFilterChange}
                            label="Role"
                        />
                        <FilterDropdown
                            isOpen={isBranchOpen}
                            setIsOpen={setIsBranchOpen}
                            selectedValue={filterBranch}
                            options={uniqueBranches}
                            onChange={handleBranchFilterChange}
                            label="Branch"
                        />
                    </div>
                </div>

                {/* Results Table */}
                <div className="overflow-x-auto md:mx-10 mt-5 flex justify-center">
                    {error ? (
                        <div className="text-red-500 text-center py-8">{error}</div>
                    ) : sortedData.length === 0 ? (
                        <div className="text-gray-500 text-center py-8">
                            No data available{filterRole || filterBranch ? ' matching filters' : ''}.
                        </div>
                    ) : (
                        <div className="overflow-x-auto max-w-full mx-2 mt-5">
                            <table className="min-w-max w-full lg:w-[1200px] border-2 border-gray-300">
                                <thead>
                                    <tr className="bg-[#016E5B] text-white">
                                        {TABLE_HEADERS.map((header) => (
                                            <th
                                                key={header}
                                                scope="col"
                                                className="px-3 py-1 border-2 border-gray-300"
                                            >
                                                {header}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedData.map((user, index) => {
                                        const assignment = user.assignedAssessments?.[0];
                                        return (
                                            <tr
                                                key={user.empID || index}
                                                className="border-b hover:bg-gray-100 transition-colors text-black"
                                            >
                                                <td className="px-3 py-2 border-2 border-gray-300 text-center">
                                                    {user.empID || 'N/A'}
                                                </td>
                                                <td className="px-3 py-1 border-2 border-gray-300 text-center">
                                                    {user.username || 'N/A'}
                                                </td>
                                                <td className="px-3 py-1 border-2 border-gray-300 text-center">
                                                    {user.designation || 'N/A'}
                                                </td>
                                                <td className="px-3 py-1 border-2 border-gray-300 text-center">
                                                    {user.workingBranch || 'N/A'}
                                                </td>
                                                <td className="px-3 py-1 border-2 border-gray-300 text-center">
                                                    {formatDate(assignment?.deadline)}
                                                </td>
                                                <td className="px-3 py-1 border-2 border-gray-300 text-center">
                                                    {assignment?.status || 'pending'}
                                                </td>
                                                <td className="px-3 py-1 border-2 border-gray-300 text-center">
                                                    {formatScore(assignment?.complete)}
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
        </div>
    );
};

export default AssessmentsAssignData;
