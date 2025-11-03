/**
 * Setting Data Component
 * 
 * Main settings page with tab navigation for different setting categories
 * Manages routing between Permission, Create Notification, Create User, Subrole, and Escalation settings
 * 
 * @returns {JSX.Element} - Setting data component
 */
import { useState, useCallback } from "react";

import Header from "../../components/Header/Header";
import SideNav from "../../components/SideNav/SideNav";
import PermissionSettings from "./PermissionSettings";
import CreateCustomNotification from "./CreateNotification";
import CreateUser from "./CreateAdmin";
import SubroleCreation from "./SubroleCreation";
import Escalation from "./Escalation";

/**
 * Available setting tabs
 */
const SETTING_TABS = {
    PERMISSION: 'permission',
    CREATE_NOTIFICATION: 'createNotification',
    CREATE_USER: 'createUser',
    SUBROLE: 'subrole',
    ESCALATION: 'Escalation',
};

/**
 * Tab configuration with labels
 */
const TAB_CONFIG = [
    { id: SETTING_TABS.PERMISSION, label: 'Permission' },
    { id: SETTING_TABS.CREATE_NOTIFICATION, label: '+ Create Notification', indent: true },
    { id: SETTING_TABS.CREATE_USER, label: '+ Create User', indent: true },
    { id: SETTING_TABS.SUBROLE, label: '+ Add subrole', indent: true },
    { id: SETTING_TABS.ESCALATION, label: 'Escalation', indent: true },
];

/**
 * Setting Data Component
 */
const SettingData = () => {
    const [activeTab, setActiveTab] = useState(SETTING_TABS.PERMISSION);

    /**
     * Handles tab change
     * 
     * @param {string} tabId - Tab identifier
     */
    const handleTabChange = useCallback((tabId) => {
        setActiveTab(tabId);
    }, []);

    /**
     * Gets active tab button className
     * 
     * @param {string} tabId - Tab identifier
     * @returns {string} - CSS class names
     */
    const getTabClassName = useCallback((tabId) => {
        const baseClasses = "text-gray-600 hover:text-black transition-colors";
        return activeTab === tabId
            ? `${baseClasses} text-green-600 font-medium`
            : baseClasses;
    }, [activeTab]);

    /**
     * Renders the active component based on selected tab
     * 
     * @returns {JSX.Element|null} - Rendered component or null
     */
    const renderActiveComponent = useCallback(() => {
        switch (activeTab) {
            case SETTING_TABS.PERMISSION:
                return <PermissionSettings />;
            case SETTING_TABS.CREATE_NOTIFICATION:
                return <CreateCustomNotification />;
            case SETTING_TABS.CREATE_USER:
                return <CreateUser />;
            case SETTING_TABS.SUBROLE:
                return <SubroleCreation />;
            case SETTING_TABS.ESCALATION:
                return <Escalation />;
            default:
                return null;
        }
    }, [activeTab]);

    return (
        <div className="w-full h-full bg-white">
            <Header name="Settings" />
            <SideNav />

            <div className="md:ml-[100px] mt-[100px]">
                <div className="flex">
                    {/* Sidebar Navigation */}
                    <div className="w-64 bg-white shadow p-4 text-black fixed h-full md:left-28">
                        <h2 className="text-xl font-bold mb-6">Settings</h2>
                        <ul className="space-y-4">
                            {TAB_CONFIG.map((tab) => (
                                <li key={tab.id} className={tab.indent ? 'pl-4' : ''}>
                                    <button
                                        type="button"
                                        className={getTabClassName(tab.id)}
                                        onClick={() => handleTabChange(tab.id)}
                                    >
                                        {tab.label}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Main Content Area */}
                    <div className="flex-1 md:ml-64">
                        {renderActiveComponent()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingData;
