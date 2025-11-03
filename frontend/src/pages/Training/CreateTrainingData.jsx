/**
 * Create Training Data Component (Mandatory Trainings)
 * 
 * Displays mandatory trainings with filtering by completion percentage and role
 * Supports navigating to all trainings and assigned trainings
 * 
 * @returns {JSX.Element} - Create training data component
 */
import { Link } from "react-router-dom";
import { useEffect, useState, useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import { CiFilter } from "react-icons/ci";

import Header from "../../components/Header/Header";
import SideNav from "../../components/SideNav/SideNav";
import Card from "../../components/Skeleton/Card";
import RoundProgressBar from "../../components/RoundBar/RoundBar";
import API_CONFIG from "../../api/api";

/**
 * API endpoints
 */
const API_ENDPOINTS = {
    GET_MANDATORY_TRAININGS: 'api/get/mandatory/allusertraining',
};

/**
 * Route paths
 */
const ROUTE_PATHS = {
    ALL_TRAININGS: '/Alltraining',
    ASSIGNED_TRAININGS: '/AssigData',
};

/**
 * Filter range options
 */
const FILTER_RANGES = [
    { label: 'ALL', value: '' },
    { label: '0-25%', value: '0-25' },
    { label: '26-51%', value: '26-51' },
    { label: '52-77%', value: '52-77' },
    { label: '78-100%', value: '78-100' },
];

/**
 * Filter range configurations
 */
const FILTER_RANGE_CONFIG = {
    '0-25': { min: 0, max: 25 },
    '26-51': { min: 26, max: 51 },
    '52-77': { min: 52, max: 77 },
    '78-100': { min: 78, max: 100 },
};

/**
 * Create Training Data Component
 */
const CreateTrainingData = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [trainings, setTrainings] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [filterRange, setFilterRange] = useState("");
    const [selectedUniqueItem, setSelectedUniqueItem] = useState("");
    const [dropdownStates, setDropdownStates] = useState({ range: false, role: false });
    const user = useSelector((state) => state.auth.user);
    const [uniqueItems, setUniqueItems] = useState([]);

    /**
     * Fetches mandatory trainings data
     */
    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${API_CONFIG.baseUrl}${API_ENDPOINTS.GET_MANDATORY_TRAININGS}`);
            
            if (!response.ok) {
                throw new Error("Failed to fetch data");
            }

            const result = await response.json();
            const trainingsData = result.data || [];
            
            setTrainings(trainingsData);

            // Extract unique items from all trainings
            const items = new Set();
            trainingsData.forEach((training) => {
                if (Array.isArray(training.uniqueItems)) {
                    training.uniqueItems.forEach((item) => items.add(item));
                }
            });

            setUniqueItems([...items]);
            setFilteredData(trainingsData);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    /**
     * Applies filters to training data
     * 
     * @param {string} range - Completion percentage range filter
     * @param {string} role - Role/unique item filter
     */
    const applyFilters = useCallback((range, role) => {
        let filtered = [...trainings];

        // Filter by completion percentage range
        if (range) {
            const rangeConfig = FILTER_RANGE_CONFIG[range];
            if (rangeConfig) {
                filtered = filtered.filter(
                    (item) =>
                        item.averageCompletionPercentage >= rangeConfig.min &&
                        item.averageCompletionPercentage <= rangeConfig.max
                );
            }
        }

        // Filter by unique item (role)
        if (role) {
            filtered = filtered.filter((item) =>
                item?.uniqueItems?.includes(role)
            );
        }

        setFilteredData(filtered);
    }, [trainings]);

    /**
     * Handles filter range change
     * 
     * @param {string} range - Selected range
     */
    const handleFilterRangeChange = useCallback((range) => {
        setFilterRange(range);
        setDropdownStates((prev) => ({ ...prev, range: false }));
        applyFilters(range, selectedUniqueItem);
    }, [selectedUniqueItem, applyFilters]);

    /**
     * Handles unique item (role) change
     * 
     * @param {string} role - Selected role
     */
    const handleUniqueItemChange = useCallback((role) => {
        setSelectedUniqueItem(role);
        setDropdownStates((prev) => ({ ...prev, role: false }));
        applyFilters(filterRange, role);
    }, [filterRange, applyFilters]);

    /**
     * Toggles dropdown visibility
     * 
     * @param {string} key - Dropdown key ('range' or 'role')
     */
    const toggleDropdown = useCallback((key) => {
        setDropdownStates((prev) => ({ ...prev, [key]: !prev[key] }));
    }, []);

    /**
     * Renders filter dropdown
     * 
     * @param {Object} props - Dropdown props
     * @param {string} props.type - Dropdown type ('range' or 'role')
     * @param {string} props.label - Dropdown label
     * @param {Array} props.options - Options array
     * @param {string} props.selectedValue - Selected value
     * @param {Function} props.onChange - Change handler
     * @returns {JSX.Element} - Filter dropdown element
     */
    const FilterDropdown = ({ type, label, options, selectedValue, onChange }) => {
        const isOpen = dropdownStates[type];

        return (
            <div className="relative inline-block text-left w-36">
                <button
                    type="button"
                    className="flex justify-between items-center w-full border-2 py-2 px-4 bg-white text-black rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    onClick={() => toggleDropdown(type)}
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
                                className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left"
                            >
                                ALL
                            </button>
                            {options.map((option, index) => (
                                <button
                                    key={index}
                                    type="button"
                                    onClick={() => onChange(option.value || option)}
                                    className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left"
                                >
                                    {option.label || option}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="w-full mb-[70px] h-full bg-white">
            <Header name="Mandatory Training" />
            <SideNav />

            <div className="md:ml-[100px] mt-[100px]">
                {/* Header Section */}
                <div className="flex justify-end mr-20">
                    <Link to={ROUTE_PATHS.ALL_TRAININGS}>
                        <div className="flex w-56 mt-5 border-2 justify-center items-center py-2 ml-10 cursor-pointer hover:bg-gray-50 transition-colors">
                            <h4 className="text-black font-medium">Show All Training</h4>
                        </div>
                    </Link>
                </div>

                {/* Filter Section */}
                <div className="flex text-black ml-10 gap-5 text-xl w-auto mt-5">
                    <h4 className="border-b-[3px] border-[#016E5B] text-[#016E5B]">
                        Mandatory Trainings
                    </h4>
                    <Link to={ROUTE_PATHS.ASSIGNED_TRAININGS}>
                        <h4 className="hover:text-[#016E5B] transition-colors cursor-pointer">
                            Assigned Trainings
                        </h4>
                    </Link>
                </div>

                {/* Filter Dropdowns */}
                <div className="flex justify-end gap-4 mr-20 mt-5">
                    <FilterDropdown
                        type="range"
                        label="Range"
                        options={FILTER_RANGES}
                        selectedValue={filterRange ? `${filterRange}%` : ""}
                        onChange={handleFilterRangeChange}
                    />
                    <FilterDropdown
                        type="role"
                        label="Role"
                        options={uniqueItems}
                        selectedValue={selectedUniqueItem}
                        onChange={handleUniqueItemChange}
                    />
                </div>

                {/* Training Cards Grid */}
                <div className="mt-10 ml-10 flex flex-wrap gap-3">
                    {isLoading ? (
                        <>
                            <Card />
                            <Card />
                            <Card />
                            <Card />
                        </>
                    ) : filteredData.length === 0 ? (
                        <div className="w-full text-center py-8 text-gray-500">
                            No mandatory trainings found{filterRange || selectedUniqueItem ? ' matching filters' : ''}.
                        </div>
                    ) : (
                        filteredData.map((training) => (
                            <Link
                                key={training._id || training.trainingId}
                                to={`/AssigTraining/${training?.trainingId}`}
                            >
                                <RoundProgressBar
                                    initialProgress={training?.averageCompletionPercentage || 0}
                                    title={training?.trainingName || 'Untitled Training'}
                                    Module={`No. of Modules : ${training?.numberOfModules || 0}`}
                                    duration={`No. of users: ${training?.totalUsers || 0}`}
                                    complete={`Completion Rate : ${training?.averageCompletionPercentage || 0}%`}
                                />
                            </Link>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default CreateTrainingData;
