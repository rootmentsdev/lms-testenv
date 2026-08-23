import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaBuilding, FaCheckCircle, FaClock, FaBan, FaUsers, FaPlus, FaHistory, FaArrowRight } from 'react-icons/fa';
import { toast } from 'react-toastify';
import baseUrl from '../../api/api';

const PlatformDashboard = () => {
  const [stats, setStats] = useState({
    totalCompanies: 0,
    activeCompanies: 0,
    trialCompanies: 0,
    suspendedCompanies: 0,
    totalUsers: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${baseUrl.baseUrl}api/platform/dashboard`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const result = await res.json();

      if (res.ok && result.success) {
        setStats(result.data);
      } else {
        toast.error(result.message || 'Failed to load dashboard metrics');
      }
    } catch (err) {
      console.error('Error loading platform stats:', err);
      toast.error('Network error fetching platform dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const cards = [
    {
      title: 'Total Companies',
      value: stats.totalCompanies,
      icon: FaBuilding,
      color: 'from-blue-600 to-indigo-600',
      textColor: 'text-blue-400',
      bgColor: 'bg-blue-500/10 border-blue-500/20',
      desc: 'All registered customer organizations'
    },
    {
      title: 'Active Companies',
      value: stats.activeCompanies,
      icon: FaCheckCircle,
      color: 'from-emerald-600 to-teal-600',
      textColor: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10 border-emerald-500/20',
      desc: 'Organizations currently active'
    },
    {
      title: 'Trial Companies',
      value: stats.trialCompanies,
      icon: FaClock,
      color: 'from-amber-600 to-yellow-600',
      textColor: 'text-amber-400',
      bgColor: 'bg-amber-500/10 border-amber-500/20',
      desc: 'Companies on trial subscriptions'
    },
    {
      title: 'Suspended Companies',
      value: stats.suspendedCompanies,
      icon: FaBan,
      color: 'from-rose-600 to-red-600',
      textColor: 'text-rose-400',
      bgColor: 'bg-rose-500/10 border-rose-500/20',
      desc: 'Organizations temporarily disabled'
    },
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: FaUsers,
      color: 'from-purple-600 to-violet-600',
      textColor: 'text-purple-400',
      bgColor: 'bg-purple-500/10 border-purple-500/20',
      desc: 'Company admins and customer employees'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-wide">Platform Overview</h2>
          <p className="text-sm text-gray-400 mt-1">Real-time metrics across all SaaS customer tenants</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={fetchStats}
            className="px-3.5 py-2 text-xs font-semibold text-gray-300 bg-[#242424] hover:bg-[#2e2e2e] border border-[#383838] rounded-xl transition-all"
          >
            Refresh Metrics
          </button>
          <Link
            to="/platform-admin/companies?openCreate=true"
            className="flex items-center space-x-2 px-4 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl transition-all shadow-lg shadow-amber-500/10"
          >
            <FaPlus />
            <span>Create Company</span>
          </Link>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className={`p-5 rounded-2xl bg-[#1e1e1e] border border-[#2d2d2d] flex flex-col justify-between hover:border-[#3d3d3d] transition-all relative overflow-hidden group`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-400">{card.title}</span>
                <div className={`p-2.5 rounded-xl border ${card.bgColor} ${card.textColor}`}>
                  <Icon className="text-lg" />
                </div>
              </div>
              <div className="mt-4">
                {loading ? (
                  <div className="h-8 w-16 bg-[#2a2a2a] animate-pulse rounded-lg" />
                ) : (
                  <div className="text-3xl font-extrabold text-white tracking-tight">{card.value}</div>
                )}
                <p className="text-[11px] text-gray-500 mt-1">{card.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Platform ASCII Console Representation requested in specification */}
      <div className="bg-[#1e1e1e] border border-[#2d2d2d] rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-3">
          Console Status Display
        </h3>
        <div className="font-mono bg-[#141414] border border-[#282828] p-5 rounded-xl text-gray-300 text-xs md:text-sm leading-relaxed overflow-x-auto">
          <div className="text-amber-400 font-bold mb-2">-----------------------------------------</div>
          <div className="text-amber-400 font-bold mb-2"> SaaS Platform Admin Dashboard</div>
          <div className="text-amber-400 font-bold mb-2">-----------------------------------------</div>
          <div className="grid grid-cols-2 max-w-sm gap-y-1">
            <span className="text-gray-400">Total Companies:</span>
            <span className="font-bold text-white text-right">{stats.totalCompanies}</span>

            <span className="text-gray-400">Active Companies:</span>
            <span className="font-bold text-emerald-400 text-right">{stats.activeCompanies}</span>

            <span className="text-gray-400">Trial Companies:</span>
            <span className="font-bold text-amber-400 text-right">{stats.trialCompanies}</span>

            <span className="text-gray-400">Suspended Companies:</span>
            <span className="font-bold text-rose-400 text-right">{stats.suspendedCompanies}</span>

            <span className="text-gray-400">Total Users:</span>
            <span className="font-bold text-purple-400 text-right">{stats.totalUsers}</span>
          </div>
          <div className="text-amber-400 font-bold mt-2">-----------------------------------------</div>
        </div>
      </div>

      {/* Quick Action Navigation Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          to="/platform-admin/companies"
          className="p-6 rounded-2xl bg-[#1e1e1e] border border-[#2d2d2d] hover:border-amber-500/40 transition-all group flex items-center justify-between"
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
              <FaBuilding />
            </div>
            <div>
              <h3 className="font-bold text-white group-hover:text-amber-400 transition-colors">
                Company Management
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                View, filter, create, suspend, activate customer companies and manage subscription plans.
              </p>
            </div>
          </div>
          <FaArrowRight className="text-gray-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
        </Link>

        <Link
          to="/platform-admin/audit-logs"
          className="p-6 rounded-2xl bg-[#1e1e1e] border border-[#2d2d2d] hover:border-amber-500/40 transition-all group flex items-center justify-between"
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
              <FaHistory />
            </div>
            <div>
              <h3 className="font-bold text-white group-hover:text-purple-400 transition-colors">
                System Audit Logs
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                Track administrative activity, tenant creations, suspensions, and plan updates.
              </p>
            </div>
          </div>
          <FaArrowRight className="text-gray-500 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
        </Link>
      </div>
    </div>
  );
};

export default PlatformDashboard;
