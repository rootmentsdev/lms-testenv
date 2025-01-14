import React, { useState } from "react";

const PermissionSettings = () => {
  const [permissions, setPermissions] = useState({
    admin: {
      training: [true, true, true,],
      assessment: [true, true, true],
      // employee: [true],
    },
    clusterManager: {
      training: [true, false, false,],
      assessment: [false, true, true],
      // employee: [false],
    },
    storeManager: {
      training: [true, true, false,],
      assessment: [false, true, true],
      // employee: [false],
    },
  });

  const togglePermission = (role, category, index) => {
    setPermissions((prev) => ({
      ...prev,
      [role]: {
        ...prev[role],
        [category]: prev[role][category].map((val, idx) =>
          idx === index ? !val : val
        ),
      },
    }));
  };

  const handleSaveChanges = () => {
    console.log("Permissions saved:", permissions);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen w-full text-black">
      <h1 className="text-2xl font-bold mb-6">Permission Settings</h1>
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-bold mb-4">Role-Based Permissions</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border-none border-gray-300">
            <thead>
              <tr>
                <th className="border border-gray-300 p-2">Action</th>
                <th className="border border-gray-300 p-2">Admin</th>
                <th className="border border-gray-300 p-2">Cluster Manager</th>
                <th className="border border-gray-300 p-2">Store Manager</th>
              </tr>
            </thead>
            <tbody>
              {[
                { category: "training", actions: ["Create Training", "Assign Training", "Delete Training"] },
                { category: "assessment", actions: ["Create Assessment", "Assign Assessment", "Delete Assessment"] },
                // { category: "employee", actions: ["Create/ Delete/ Edit Employee"] },
              ].map(({ category, actions }) => (
                <React.Fragment key={category}>
                  {actions.map((action, idx) => (
                    <tr key={action}>
                      <td className="border border-gray-300 p-2">{action}</td>
                      {["admin", "clusterManager", "storeManager"].map((role) => (
                        <td key={role} className="border border-gray-300 text-center p-2">
                          <input
                            type="checkbox"
                            checked={permissions[role][category][idx]}
                            onChange={() => togglePermission(role, category, idx)}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
        <button
          className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          onClick={handleSaveChanges}
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default PermissionSettings;
