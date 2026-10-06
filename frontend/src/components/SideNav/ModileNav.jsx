import React, { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { useSelector } from "react-redux";

const Icon = ({ d, size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
);

const ICONS = {
  dashboard: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10",
  walkin: ["M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"],
  task: [
    "M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2",
    "M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v0a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2z",
    "M9 12l2 2 4-4"
  ],
  employee: [
    "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2",
    "M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"
  ],
  training: [
    "M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z",
    "M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"
  ],
  assessment: ["M9 11l3 3L22 4", "M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"],
  module: ["M4 6h16M4 12h16M4 18h16"],
  branch: ["M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z", "M9 22V12h6v10"],
  storeAnalysis: ["M21.21 15.89A10 10 0 1 1 8 2.83", "M22 12A10 10 0 0 0 12 2v10z"],
  storeInsights: ["M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z", "M8.5 14.5l2.5-2.5 3 3 4.5-4.5", "M15 11.5h3v3"],
  settings: [
    "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
    "M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"
  ],
  customization: ["M12 20h9", "M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"],
};

const MobileNavItem = ({ to, icon, label, active, onClick }) => (
  to ? (
    <Link to={to} className="flex flex-col items-center gap-1 flex-1 flex-shrink-0 min-w-[72px]" onClick={onClick}>
      <div className={`flex flex-col items-center gap-1 py-1.5 px-2 rounded-xl transition-all duration-200 w-full
        ${active ? 'text-white bg-white/10' : 'text-gray-500'}`}>
        <Icon d={ICONS[icon]} size={20} />
        <span className="text-[9px] font-semibold tracking-wide text-center truncate w-full">{label}</span>
      </div>
    </Link>
  ) : (
    <button onClick={onClick} className="flex flex-col items-center gap-1 flex-1 flex-shrink-0 min-w-[72px] bg-transparent border-none outline-none focus:outline-none">
      <div className={`flex flex-col items-center gap-1 py-1.5 px-2 rounded-xl transition-all duration-200 w-full
        ${active ? 'text-white bg-white/10' : 'text-gray-500'}`}>
        <Icon d={ICONS[icon]} size={20} />
        <span className="text-[9px] font-semibold tracking-wide text-center truncate w-full">{label}</span>
      </div>
    </button>
  )
);

const DrawerOverlay = ({ isOpen, onClose, title, items }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[60] flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="relative bg-[#1a1a1a] rounded-t-3xl border-t border-white/10 pb-6 pt-4 px-6 w-full max-h-[80vh] overflow-y-auto animate-slideUpDrawer shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-6" />
        <h3 className="text-white font-bold text-lg mb-4 tracking-tight">{title}</h3>
        <div className="flex flex-col gap-2.5">
          {items.map((item, idx) => (
            <Link
              key={idx}
              to={item.to}
              onClick={onClose}
              className={`p-4 rounded-xl font-semibold transition-all flex items-center justify-between group active:scale-[0.98] ${
                item.active 
                  ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 shadow-inner' 
                  : 'bg-white/5 text-gray-300 border border-transparent active:bg-white/10'
              }`}
            >
              <span>{item.label}</span>
              {item.active && (
                <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
              )}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

const ModileNav = () => {
  const location = useLocation();
  const user = useSelector((s) => s.auth.user);
  const is = (path) => location.pathname === path;
  
  const [activeDrawer, setActiveDrawer] = useState(null);

  const isWalkin = is('/walkin/list') || is('/walkin/report') || is('/walkin/count');
  const isTask = is("/task") || is("/task/create") || is("/task/auto-schedule");

  const walkinItems = [
    { to: "/walkin/list", label: "Walkin List", active: is("/walkin/list") },
    { to: "/walkin/report", label: "Walkin Report", active: is("/walkin/report") },
    ...(["telecaller", "office_admin", "super_admin", "admin", "hr_admin", "process_control_manager", "cluster_admin", "store_admin"].includes(user?.role)
      ? [{ to: "/walkin/count", label: "Walkin Count", active: is("/walkin/count") }]
      : [])
  ];

  const taskItems = [
    { to: "/task/create", label: "Create Task", active: is("/task/create") },
    { to: "/task", label: "Task Management", active: is("/task") },
    { to: "/task/auto-schedule", label: "Auto Task", active: is("/task/auto-schedule") }
  ];

  const storeAnalysisItems = [
    { to: "/store-analysis/dsr-report", label: "DSR Report", active: is("/store-analysis/dsr-report") },
    { to: "/store-analysis/growth-comparison", label: "Growth Comparison", active: is("/store-analysis/growth-comparison") },
    { to: "/store-analysis/google-review-task", label: "Google Review", active: is("/store-analysis/google-review-task") },
    {
      to: "/store-analysis/store-rating",
      label: user?.role === "store_admin" ? "Staff Rating" : "Store Rating",
      active:
        is("/store-analysis/store-rating") ||
        is("/store-analysis/store-rating/create") ||
        location.pathname.startsWith("/store-analysis/store-rating/")
    }
  ];

  const settingsItems = [
    { to: "/settings/users", label: "Users", active: is("/settings/users") },
    { to: "/settings/create-user", label: "Create User", active: is("/settings/create-user") },
    { to: "/settings/create-notification", label: "Notifications", active: is("/settings/create-notification") }
  ];

  return (
    <>
      <div
        className="fixed bottom-0 left-0 right-0 z-50 flex items-center px-2 py-1 md:hidden overflow-x-auto scrollbar-none"
        style={{
          backgroundColor: '#1a1a1a',
          height: '64px',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}
      >
        {user?.role === 'warehouse_admin' ? (
          <>
            <MobileNavItem to="/customization" icon="customization" label="Customization" active={is('/customization')} />
          </>
        ) : (
          <>
            <MobileNavItem to="/" icon="dashboard" label="Dashboard" active={is('/') || is('/store-insights')} />
            
            <MobileNavItem 
              icon="walkin" 
              label="WalkIn" 
              active={isWalkin} 
              onClick={() => setActiveDrawer('walkin')} 
            />
            
            <MobileNavItem 
              to={user?.role === 'telecaller' ? "/task" : null} 
              icon="task" 
              label="Tasks" 
              active={isTask} 
              onClick={user?.role === 'telecaller' ? null : () => setActiveDrawer('task')} 
            />
            
            {user?.role !== 'telecaller' && (
              <MobileNavItem to="/employee" icon="employee" label="Employees" active={is('/employee')} />
            )}
            
            {user?.role !== 'store_admin' && user?.role !== 'telecaller' && (
              <MobileNavItem to="/training-dashboard" icon="training" label="Training Dash" active={is('/training-dashboard')} />
            )}
            
            {user?.role !== 'store_admin' && user?.role !== 'telecaller' && (
              <MobileNavItem to="/training" icon="training" label="Trainings" active={is('/training')} />
            )}
            
            {user?.role !== 'store_admin' && user?.role !== 'telecaller' && (
              <MobileNavItem to="/assessments" icon="assessment" label="Assessments" active={is('/assessments')} />
            )}
            
            {user?.role !== 'cluster_admin' && user?.role !== 'process_control_manager' && user?.role !== 'store_admin' && user?.role !== 'telecaller' && (
              <MobileNavItem to="/module" icon="module" label="Modules" active={is('/module')} />
            )}
            
            {user?.role !== 'telecaller' && (
              <MobileNavItem to="/branch" icon="branch" label="Branches" active={is('/branch')} />
            )}
            
            {user?.role !== 'telecaller' && (
              <MobileNavItem 
                icon="storeAnalysis" 
                label="Store Analysis" 
                active={location.pathname.startsWith('/store-analysis/')} 
                onClick={() => setActiveDrawer('storeAnalysis')} 
              />
            )}
            
            {user?.role !== 'telecaller' && (user?.role === 'super_admin' || user?.role === 'admin' || user?.role === 'hr_admin' || user?.role === 'process_control_manager' || user?.role === 'cluster_admin') && (
              <MobileNavItem 
                icon="settings" 
                label="Settings" 
                active={location.pathname.startsWith('/settings')} 
                onClick={() => setActiveDrawer('settings')} 
              />
            )}
          </>
        )}
      </div>

      <DrawerOverlay 
        isOpen={activeDrawer === 'walkin'} 
        onClose={() => setActiveDrawer(null)} 
        title="Walk-In Options" 
        items={walkinItems} 
      />
      
      <DrawerOverlay 
        isOpen={activeDrawer === 'task'} 
        onClose={() => setActiveDrawer(null)} 
        title="Task Options" 
        items={taskItems} 
      />
      
      <DrawerOverlay 
        isOpen={activeDrawer === 'storeAnalysis'} 
        onClose={() => setActiveDrawer(null)} 
        title="Store Analysis Options" 
        items={storeAnalysisItems} 
      />
      
      <DrawerOverlay 
        isOpen={activeDrawer === 'settings'} 
        onClose={() => setActiveDrawer(null)} 
        title="Settings" 
        items={settingsItems} 
      />

      <style>{`
        .scrollbar-none::-webkit-scrollbar {
          display: none;
        }
        @keyframes slideUpDrawer {
          0% { transform: translateY(100%); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        .animate-slideUpDrawer {
          animation: slideUpDrawer 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </>
  );
};

export default ModileNav;
