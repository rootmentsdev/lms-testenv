import React from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { FaBuilding, FaChartLine, FaHistory, FaArrowLeft, FaShieldAlt } from 'react-icons/fa';
import SideNav from '../../components/SideNav/SideNav';
import ModileNav from '../../components/SideNav/ModileNav';

const PlatformAdminLayout = ({ children }) => {
  const location = useLocation();

  const navItems = [
    { label: 'Overview', path: '/platform-admin', icon: FaChartLine },
    { label: 'Companies', path: '/platform-admin/companies', icon: FaBuilding },
    { label: 'Audit Logs', path: '/platform-admin/audit-logs', icon: FaHistory },
  ];

  const isActive = (path) => {
    if (path === '/platform-admin') {
      return location.pathname === '/platform-admin';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex min-h-screen bg-[#141414] text-white">
      <SideNav />
      <ModileNav />

      <div className="flex-1 flex flex-col min-w-0 md:ml-64">
        {/* Platform Admin Banner Header */}
        <header className="bg-[#1e1e1e] border-b border-[#2d2d2d] sticky top-0 z-30 px-4 md:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-slate-950 font-bold shadow-lg">
                <FaShieldAlt className="text-xl" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-lg md:text-xl font-bold text-white tracking-wide">
                    SaaS Platform Control Panel
                  </h1>
                  <span className="px-2.5 py-0.5 text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full">
                    Super Admin
                  </span>
                </div>
                <p className="text-xs text-gray-400">
                  Manage multi-tenant organizations, access controls, subscriptions, and system audit trails
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Link
                to="/"
                className="flex items-center space-x-2 px-3.5 py-2 text-xs font-medium text-gray-300 hover:text-white bg-[#2a2a2a] hover:bg-[#333] rounded-xl border border-[#3a3a3a] transition-all"
              >
                <FaArrowLeft />
                <span>Return to App</span>
              </Link>
            </div>
          </div>

          {/* Sub Navigation Bar */}
          <nav className="flex items-center space-x-2 mt-4 pt-3 border-t border-[#2a2a2a] overflow-x-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-4 py-2 text-xs font-medium rounded-xl transition-all whitespace-nowrap ${
                    active
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/10'
                      : 'text-gray-400 hover:text-white hover:bg-[#282828]'
                  }`}
                >
                  <Icon className={active ? 'text-slate-950' : 'text-gray-400'} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-4 md:p-8">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
};

export default PlatformAdminLayout;
