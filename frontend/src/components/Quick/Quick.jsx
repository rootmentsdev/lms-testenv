import { SiHomeassistantcommunitystore } from "react-icons/si";
import { BiTask } from "react-icons/bi";
import { CgAddR } from "react-icons/cg";
import { Link } from "react-router-dom";

const actions = [
    {
        label: "Add New Employee",
        icon: (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="w-5 h-5 text-[#016E5B]"
            >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
        ),
        Link: '/employee'
    },
    {
        label: "Assign Training",
        icon: (
            <BiTask className="text-[#016E5B]" />
        ),
        Link: '/training'
    },
    {
        label: "Create Assessment",
        icon: (
            <CgAddR className="text-[#016E5B]" />
        ),
        Link: '/create/Assessment'
    },
    {
        label: "Add New Branch",
        icon: (
            <SiHomeassistantcommunitystore className="text-[#016E5B]" />
        ),
        Link: '/branch'
    },
];

const Quick = () => {
    return (
        <div className="bg-white mt-10 rounded-lg p-6 w-auto text-black ">
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-4 text-xl">
                {actions.map((action, index) => (
                    <Link key={index} to={action.Link}>
                        <button
                            key={index}
                            className="flex items-center justify-center gap-2 w-[180px] border rounded-md p-2 hover:bg-gray-100 transition"
                        >
                            {action.icon}
                            <span className="text-sm font-medium text-gray-700">
                                {action.label}
                            </span>
                        </button>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default Quick;
