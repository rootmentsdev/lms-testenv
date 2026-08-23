import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  FaBuilding,
  FaCheckCircle,
  FaBan,
  FaUsers,
  FaEnvelope,
  FaPhone,
  FaCalendarAlt,
  FaArrowLeft,
  FaUserShield,
  FaHistory
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import baseUrl from '../../api/api';

const CompanyDetailPage = () => {
  const { tenantId } = useParams();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const fetchCompanyDetails = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${baseUrl.baseUrl}api/platform/companies/${tenantId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setCompany(data.data);
      } else {
        toast.error(data.message || 'Failed to fetch company details');
      }
    } catch (err) {
      console.error('Error fetching company detail:', err);
      toast.error('Network error loading company details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tenantId) {
      fetchCompanyDetails();
    }
  }, [tenantId]);

  if (loading) {
    return (
      <div className="p-12 text-center text-gray-400">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs">Loading company profile...</p>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="p-12 text-center text-gray-400">
        <FaBuilding className="text-4xl text-gray-600 mx-auto mb-3" />
        <p className="font-bold text-white">Company Tenant Not Found</p>
        <Link to="/platform-admin/companies" className="text-xs text-amber-400 hover:underline mt-2 inline-block">
          &larr; Back to Companies List
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <div>
        <Link
          to="/platform-admin/companies"
          className="inline-flex items-center space-x-2 text-xs font-semibold text-gray-400 hover:text-white transition-colors"
        >
          <FaArrowLeft />
          <span>Back to All Companies</span>
        </Link>
      </div>

      {/* Header Profile Card */}
      <div className="bg-[#1e1e1e] border border-[#2d2d2d] rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-2xl">
            {company.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center space-x-3">
              <h2 className="text-xl font-bold text-white">{company.name}</h2>
              {company.status === 'active' ? (
                <span className="px-2.5 py-0.5 text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full">
                  Active
                </span>
              ) : (
                <span className="px-2.5 py-0.5 text-xs font-semibold bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-full">
                  Suspended
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Slug: <code className="bg-[#141414] px-2 py-0.5 rounded text-amber-400">{company.slug}</code>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="bg-[#141414] px-4 py-3 rounded-xl border border-[#2a2a2a] text-center">
            <span className="block text-[10px] text-gray-400 uppercase tracking-wider">Plan</span>
            <span className="text-sm font-bold text-amber-400 uppercase">{company.plan}</span>
          </div>

          <div className="bg-[#141414] px-4 py-3 rounded-xl border border-[#2a2a2a] text-center">
            <span className="block text-[10px] text-gray-400 uppercase tracking-wider">Total Users</span>
            <span className="text-sm font-bold text-white">{company.userCount || 0}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-[#2d2d2d] pb-3">
        {['overview', 'users', 'subscription', 'activity'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-xs font-semibold rounded-xl capitalize transition-all ${
              activeTab === tab
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-gray-400 hover:text-white hover:bg-[#252525]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* TAB CONTENT: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#1e1e1e] border border-[#2d2d2d] rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white border-b border-[#2a2a2a] pb-3">Company Metadata</h3>
            
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-gray-400 flex items-center space-x-2">
                  <FaEnvelope className="text-gray-500" />
                  <span>Company Email</span>
                </span>
                <span className="text-white font-medium">{company.email}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-400 flex items-center space-x-2">
                  <FaPhone className="text-gray-500" />
                  <span>Phone</span>
                </span>
                <span className="text-white font-medium">{company.phone || 'N/A'}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-400 flex items-center space-x-2">
                  <FaCalendarAlt className="text-gray-500" />
                  <span>Created Date</span>
                </span>
                <span className="text-white font-medium">
                  {new Date(company.createdAt).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
              </div>

              <div className="pt-3 border-t border-[#2a2a2a]">
                <span className="text-gray-400 block mb-2 font-semibold">Enabled Page Permissions ({company.allowedModules?.length || 4}):</span>
                <div className="flex flex-wrap gap-1.5">
                  {(company.allowedModules || ['dashboard', 'dsr_report', 'employee', 'settings']).map((m) => (
                    <span key={m} className="px-2 py-0.5 text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-md uppercase">
                      {m.replace('_', ' ')}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#1e1e1e] border border-[#2d2d2d] rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white border-b border-[#2a2a2a] pb-3">Subscription Status</h3>
            
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Current Plan</span>
                <span className="px-2.5 py-0.5 text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full uppercase">
                  {company.plan}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-400">Subscription Status</span>
                <span className="text-emerald-400 font-bold capitalize">
                  {company.subscriptionStatus || 'active'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-400">Account Access</span>
                <span className={company.status === 'active' ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}>
                  {company.status === 'active' ? 'Enabled' : 'Suspended'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: USERS */}
      {activeTab === 'users' && (
        <div className="bg-[#1e1e1e] border border-[#2d2d2d] rounded-2xl p-6">
          <h3 className="text-sm font-bold text-white mb-4">Assigned Tenant Users</h3>
          {!company.users || company.users.length === 0 ? (
            <p className="text-xs text-gray-500">No users found for this company.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-300">
                <thead className="bg-[#181818] border-b border-[#2d2d2d] text-gray-400 font-semibold">
                  <tr>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Account Type</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#262626]">
                  {company.users.map((u) => (
                    <tr key={u._id} className="hover:bg-[#222]">
                      <td className="px-4 py-3 font-medium text-white">{u.name || u.username}</td>
                      <td className="px-4 py-3 text-gray-400">{u.email}</td>
                      <td className="px-4 py-3 font-semibold text-amber-400">{u.role || 'company_user'}</td>
                      <td className="px-4 py-3 text-gray-400">{u.type || (u.role ? 'Admin' : 'User')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: SUBSCRIPTION */}
      {activeTab === 'subscription' && (
        <div className="bg-[#1e1e1e] border border-[#2d2d2d] rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-white">Subscription & Plan Architecture</h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            Payment gateways are not connected in this version. The foundation supports plan tiers (Trial, Basic, Pro, Enterprise) and active status switches.
          </p>
        </div>
      )}

      {/* TAB CONTENT: ACTIVITY */}
      {activeTab === 'activity' && (
        <div className="bg-[#1e1e1e] border border-[#2d2d2d] rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-white">Company Activity History</h3>
          <p className="text-xs text-gray-400">View platform audit logs for detailed historical updates on this company.</p>
        </div>
      )}
    </div>
  );
};

export default CompanyDetailPage;
