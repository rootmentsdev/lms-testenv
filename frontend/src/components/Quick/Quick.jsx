/**
 * Quick Actions Component
 * 
 * Displays quick action buttons for common tasks
 * Links to employee, training, assessment, and branch management
 * 
 * @returns {JSX.Element} - Quick actions component
 */
import { Link } from "react-router-dom";
import { BiTask } from "react-icons/bi";
import { CgAddR } from "react-icons/cg";
import { SiHomeassistantcommunitystore } from "react-icons/si";

/**
 * Route path constants
 */
const ROUTE_PATHS = {
    EMPLOYEE: '/employee',
    TRAINING: '/training',
    ASSESSMENT: '/create/Assessment',
    BRANCH: '/branch',
};

/**
 * Plus icon SVG component
 */
const PlusIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="1.5"
        stroke="currentColor"
        className="w-5 h-5 text-[#016E5B]"
        aria-hidden="true"
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 4.5v15m7.5-7.5h-15"
        />
    </svg>
);

/**
 * Quick action configuration
 */
const QUICK_ACTIONS = [
    {
        id: 'add-employee',
        label: 'Add New Employee',
        icon: PlusIcon,
        link: ROUTE_PATHS.EMPLOYEE,
    },
    {
        id: 'assign-training',
        label: 'Assign Training',
        icon: BiTask,
        link: ROUTE_PATHS.TRAINING,
    },
    {
        id: 'create-assessment',
        label: 'Create Assessment',
        icon: CgAddR,
        link: ROUTE_PATHS.ASSESSMENT,
    },
    {
        id: 'add-branch',
        label: 'Add New Branch',
        icon: SiHomeassistantcommunitystore,
        link: ROUTE_PATHS.BRANCH,
    },
];

/**
 * Quick Actions Component
 */
const Quick = () => {
    return (
        <div className="bg-white mt-10 rounded-lg p-6 w-auto text-black">
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-4 text-xl">
                {QUICK_ACTIONS.map((action) => {
                    const IconComponent = action.icon;
                    return (
                        <Link key={action.id} to={action.link}>
                            <button
                                className="flex items-center justify-center gap-2 w-[180px] border rounded-md p-2 hover:bg-gray-100 transition-colors"
                                aria-label={action.label}
                            >
                                <IconComponent />
                                <span className="text-sm font-medium text-gray-700">
                                    {action.label}
                                </span>
                            </button>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
};

export default Quick;
