/**
 * Module Data Component
 * 
 * Displays a list of all training modules with completion statistics
 * Fetches module data from API and renders module cards
 * 
 * @returns {JSX.Element} - Module data component
 */
import { Link } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";

import Header from "../../components/Header/Header";
import SideNav from "../../components/SideNav/SideNav";
import RoundModule from "../../components/RoundBar/RoundModule";
import { FaPlus } from "react-icons/fa";
import API_CONFIG from "../../api/api";

/**
 * API endpoint for modules
 */
const MODULES_ENDPOINT = 'api/modules';

/**
 * Route path for creating modules
 */
const CREATE_MODULE_ROUTE = '/createModule';

/**
 * Default values for module statistics
 */
const DEFAULT_MODULE_STATS = {
    videoCount: 0,
    completionRate: 0,
};

/**
 * Retrieves module data from API
 * 
 * @returns {Promise<Array>} - Array of module data
 */
const fetchModules = async () => {
    try {
        const response = await fetch(`${API_CONFIG.baseUrl}${MODULES_ENDPOINT}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error("Failed to fetch modules:", error.message);
        throw error;
    }
};

/**
 * Module Data Component
 */
const ModuleData = () => {
    const [modules, setModules] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    /**
     * Loads modules data
     */
    const loadModules = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const data = await fetchModules();
            setModules(data);
        } catch (err) {
            setError("Failed to load modules. Please try again later.");
            console.error("Error loading modules:", err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadModules();
    }, [loadModules]);

    /**
     * Calculates module statistics
     * 
     * @param {Object} module - Module object
     * @returns {Object} - Statistics object with videoCount and completionRate
     */
    const getModuleStats = useCallback((module) => {
        return {
            videoCount: module?.videos?.length || DEFAULT_MODULE_STATS.videoCount,
            completionRate: module?.overallCompletionPercentage || DEFAULT_MODULE_STATS.completionRate,
        };
    }, []);

    if (error) {
        return (
            <div className="w-full h-full bg-white">
                <Header name="Modules" />
                <SideNav />
                <div className="md:ml-[200px] mt-[150px] mx-auto max-w-[1400px] w-full mb-[70px]">
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-800">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full bg-white">
            <Header name="Modules" />
            <SideNav />

            <div className="md:ml-[200px] mt-[150px] mx-auto max-w-[1400px] w-full mb-[70px]">
                {/* Header Section */}
                <div className="flex mx-10 justify-between mt-10">
                    <Link to={CREATE_MODULE_ROUTE}>
                        <div className="flex w-56 border-2 justify-evenly items-center py-2 ml-10 cursor-pointer hover:bg-gray-50 transition-colors">
                            <div className="text-[#016E5B]">
                                <FaPlus />
                            </div>
                            <h4 className="text-black font-medium">Add New Module</h4>
                        </div>
                    </Link>
                </div>

                {/* Modules Grid */}
                <div className="mt-10 ml-5 mx-auto flex mr-5 w-full flex-wrap gap-5">
                    {isLoading ? (
                        <div className="w-full text-center py-8 text-gray-500">
                            Loading modules...
                        </div>
                    ) : modules.length === 0 ? (
                        <div className="w-full text-center py-8 text-gray-500">
                            No modules found. Create your first module!
                        </div>
                    ) : (
                        modules.map((module) => {
                            const stats = getModuleStats(module);
                            return (
                                <RoundModule
                                    key={module.moduleId}
                                    initialProgress={stats.completionRate.toString()}
                                    title={module.moduleName}
                                    Module={`No. of videos: ${stats.videoCount}`}
                                    complete={`Completion Rate: ${stats.completionRate}%`}
                                />
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};

export default ModuleData;
