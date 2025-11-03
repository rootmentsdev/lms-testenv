/**
 * Mandatory Training Page Component
 * 
 * Wrapper component for mandatory training management
 * Includes tab navigation between create and list views
 * Handles mobile navigation display
 * 
 * @returns {JSX.Element} - Mandatory training page component
 */
import { useState } from "react";
import ModileNav from "../../../components/SideNav/ModileNav";
import Mandatorytrainingdata from "./Mandatorytrainingdata";
import MandatoryTrainingList from "./MandatoryTrainingList";

/**
 * Tab type constants
 */
const TAB_TYPES = {
    CREATE: 'create',
    LIST: 'list',
};

/**
 * Tab configuration
 */
const TABS = [
    { id: TAB_TYPES.CREATE, label: 'Create Training' },
    { id: TAB_TYPES.LIST, label: 'Training List' },
];

/**
 * Component styling constants
 */
const CONTAINER_STYLES = {
    container: {
        display: "flex",
        width: "100%",
        minHeight: "100vh",
        backgroundColor: "white",
        overflowX: "hidden",
    },
    middle: {
        flex: 1,
        width: "100%",
        minHeight: "100vh",
    },
};

/**
 * Mandatory Training Page Component
 */
const Mandatorytraining = () => {
    const [activeTab, setActiveTab] = useState(TAB_TYPES.CREATE);

    /**
     * Handles tab change
     * 
     * @param {string} tabId - Tab identifier to switch to
     */
    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
    };

    /**
     * Gets active tab button className
     * 
     * @param {string} tabId - Tab identifier
     * @returns {string} - CSS class names
     */
    const getTabClassName = (tabId) => {
        const baseClasses = "px-6 py-3 text-sm font-medium rounded-t-lg transition-colors";
        return activeTab === tabId
            ? `${baseClasses} bg-[#016E5B] text-white border-b-2 border-[#016E5B]`
            : `${baseClasses} bg-gray-100 text-gray-600 hover:bg-gray-200`;
    };

    return (
        <div style={CONTAINER_STYLES.container} className="bg-white">
            {/* Mobile Navigation */}
            <div className="md:hidden sm:block">
                <ModileNav />
            </div>

            {/* Main Content */}
            <div style={CONTAINER_STYLES.middle}>
                {/* Tab Navigation */}
                <div className="flex border-b border-gray-200 mb-6">
                    {TABS.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => handleTabChange(tab.id)}
                            className={getTabClassName(tab.id)}
                            aria-label={`Switch to ${tab.label}`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                {activeTab === TAB_TYPES.CREATE ? (
                    <Mandatorytrainingdata />
                ) : (
                    <MandatoryTrainingList />
                )}
            </div>
        </div>
    );
};

export default Mandatorytraining;
