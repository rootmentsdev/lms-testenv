import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  FaSearch,
  FaPlus,
  FaBuilding,
  FaCheckCircle,
  FaBan,
  FaEye,
  FaTimes,
  FaUsers,
  FaExchangeAlt,
  FaCheckSquare,
  FaLock
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import baseUrl from '../../api/api';

const ALL_MODULES = [
  { id: 'dashboard', label: 'Dashboard Overview', desc: 'Main store insights & home dashboard' },
  { id: 'dsr_report', label: 'DSR Report', desc: 'Daily sales report & store metrics' },
  { id: 'employee', label: 'Employee Management', desc: 'Employee directory & profiles' },
  { id: 'settings', label: 'Settings', desc: 'User management & configuration' },
  { id: 'walkin', label: 'Walk-In Leads & Reports', desc: 'Customer walk-in entries, counts & reports' },
  { id: 'task', label: 'Task Management', desc: 'Create tasks, auto-schedule & manager' },
  { id: 'store_analysis', label: 'Store Analysis', desc: 'Growth comparison, google review & rating' },
  { id: 'training', label: 'Training Modules', desc: 'Training materials & progress' },
  { id: 'assessment', label: 'Assessments', desc: 'Exams, quizzes & assessment assignments' },
  { id: 'branch', label: 'Branch & Audits', desc: 'Branch profiles & audit forms' },
  { id: 'customization', label: 'Customization', desc: 'Attribution & warehouse customization' },
];

const DEFAULT_PLAN_PRESETS = {
  basic: ['dashboard', 'dsr_report', 'employee', 'branch', 'settings'],
  trial: ['dashboard', 'dsr_report', 'employee', 'branch', 'settings'],
  pro: ['dashboard', 'dsr_report', 'employee', 'branch', 'settings', 'walkin', 'task', 'store_analysis'],
  enterprise: ['dashboard', 'dsr_report', 'employee', 'branch', 'settings', 'walkin', 'task', 'store_analysis', 'training', 'assessment', 'customization']
};

const CompaniesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');

  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [isModulesModalOpen, setIsModulesModalOpen] = useState(false);

  const [selectedCompany, setSelectedCompany] = useState(null);

  // Create Form State
  const [createForm, setCreateForm] = useState({
    name: '',
    slug: '',
    email: '',
    phone: '',
    plan: 'basic',
    allowedModules: DEFAULT_PLAN_PRESETS.basic,
    adminName: '',
    adminEmail: '',
    adminPassword: '',
    adminEmpId: ''
  });
  const [creating, setCreating] = useState(false);

  // Change Plan State
  const [newPlan, setNewPlan] = useState('basic');
  const [updatingPlan, setUpdatingPlan] = useState(false);

  // Status toggle state
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Custom Modules Edit State
  const [selectedModules, setSelectedModules] = useState([]);
  const [updatingModules, setUpdatingModules] = useState(false);

  useEffect(() => {
    if (searchParams.get('openCreate') === 'true') {
      setIsCreateModalOpen(true);
      searchParams.delete('openCreate');
      setSearchParams(searchParams);
    }
  }, [searchParams, setSearchParams]);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const queryParams = new URLSearchParams();
      if (searchQuery) queryParams.append('search', searchQuery);
      if (statusFilter !== 'all') queryParams.append('status', statusFilter);
      if (planFilter !== 'all') queryParams.append('plan', planFilter);

      const res = await fetch(`${baseUrl.baseUrl}api/platform/companies?${queryParams.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setCompanies(data.data || []);
      } else {
        toast.error(data.message || 'Failed to load companies');
      }
    } catch (err) {
      console.error('Error fetching companies:', err);
      toast.error('Network error loading companies list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, [statusFilter, planFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchCompanies();
  };

  // Create Company Handler
  const handleCreateCompany = async (e) => {
    e.preventDefault();
    if (!createForm.name || !createForm.email || !createForm.adminEmail || !createForm.adminPassword) {
      toast.error('Please fill in all required fields');
      return;
    }

    setCreating(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${baseUrl.baseUrl}api/platform/companies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(createForm)
      });
      const data = await res.json();

      if (res.ok && data.success) {
        toast.success(`Company '${data.tenant.name}' created successfully!`);
        setIsCreateModalOpen(false);
        setCreateForm({
          name: '',
          slug: '',
          email: '',
          phone: '',
          plan: 'basic',
          allowedModules: DEFAULT_PLAN_PRESETS.basic,
          adminName: '',
          adminEmail: '',
          adminPassword: '',
          adminEmpId: ''
        });
        fetchCompanies();
      } else {
        toast.error(data.message || 'Failed to create company');
      }
    } catch (err) {
      console.error('Error creating company:', err);
      toast.error('Error creating company tenant');
    } finally {
      setCreating(false);
    }
  };

  // Toggle Suspend / Activate Handler
  const handleToggleStatus = async () => {
    if (!selectedCompany) return;
    const targetStatus = selectedCompany.status === 'active' ? 'suspended' : 'active';
    setUpdatingStatus(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${baseUrl.baseUrl}api/platform/companies/${selectedCompany._id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: targetStatus })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        toast.success(`Company status changed to ${targetStatus}`);
        setIsStatusModalOpen(false);
        fetchCompanies();
      } else {
        toast.error(data.message || 'Failed to update company status');
      }
    } catch (err) {
      console.error('Error updating company status:', err);
      toast.error('Error updating company status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Change Plan Handler
  const handleChangePlan = async (e) => {
    e.preventDefault();
    if (!selectedCompany) return;

    setUpdatingPlan(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${baseUrl.baseUrl}api/platform/companies/${selectedCompany._id}/plan`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ plan: newPlan, allowedModules: DEFAULT_PLAN_PRESETS[newPlan] })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        toast.success(`Plan updated to ${newPlan.toUpperCase()}`);
        setIsPlanModalOpen(false);
        fetchCompanies();
      } else {
        toast.error(data.message || 'Failed to update plan');
      }
    } catch (err) {
      console.error('Error changing plan:', err);
      toast.error('Error changing company plan');
    } finally {
      setUpdatingPlan(false);
    }
  };

  // Save Custom Page Permissions Handler
  const handleSaveModules = async (e) => {
    e.preventDefault();
    if (!selectedCompany) return;

    setUpdatingModules(true);
    try {
      const token = localStorage.getItem('token');
      let res = await fetch(`${baseUrl.baseUrl}api/platform/companies/${selectedCompany._id}/modules`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ allowedModules: selectedModules })
      });

      // Fallback: If backend node process is running older code in memory, use /plan endpoint
      if (res.status === 404) {
        res = await fetch(`${baseUrl.baseUrl}api/platform/companies/${selectedCompany._id}/plan`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ plan: selectedCompany.plan, allowedModules: selectedModules })
        });
      }

      const contentType = res.headers.get('content-type');
      let data = {};
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      }

      if (res.ok && data.success) {
        toast.success(`Page access updated (${selectedModules.length} pages enabled)`);
        setIsModulesModalOpen(false);
        fetchCompanies();
      } else {
        toast.error(data.message || 'Failed to update page access. Please restart backend server.');
      }
    } catch (err) {
      console.error('Error saving allowed modules:', err);
      toast.error('Error saving allowed modules');
    } finally {
      setUpdatingModules(false);
    }
  };

  const toggleModuleSelection = (modId, targetList, setTargetList) => {
    if (targetList.includes(modId)) {
      setTargetList(targetList.filter((m) => m !== modId));
    } else {
      setTargetList([...targetList, modId]);
    }
  };

  const getPlanBadge = (plan) => {
    switch (plan?.toLowerCase()) {
      case 'enterprise':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'pro':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'basic':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      default:
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-wide">Company Tenants Management</h2>
          <p className="text-sm text-gray-400 mt-1">Manage external companies, subscriptions, and custom page permissions</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center justify-center space-x-2 px-4 py-2.5 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl transition-all shadow-lg shadow-amber-500/10"
        >
          <FaPlus />
          <span>Create New Company</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#1e1e1e] p-4 rounded-2xl border border-[#2d2d2d] flex flex-col md:flex-row gap-4 justify-between items-center">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search by name, slug, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#141414] border border-[#2d2d2d] text-white text-xs rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-amber-500 transition-all placeholder-gray-500"
          />
          <FaSearch className="absolute left-3.5 top-3 text-gray-500 text-xs" />
        </form>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Status Filter */}
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-400">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#141414] border border-[#2d2d2d] text-white text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-amber-500 transition-all"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>

          {/* Plan Filter */}
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-400">Plan:</span>
            <select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              className="bg-[#141414] border border-[#2d2d2d] text-white text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-amber-500 transition-all"
            >
              <option value="all">All Plans</option>
              <option value="basic">Basic</option>
              <option value="pro">Pro</option>
              <option value="enterprise">Enterprise</option>
              <option value="trial">Trial</option>
            </select>
          </div>
        </div>
      </div>

      {/* Companies Table */}
      <div className="bg-[#1e1e1e] rounded-2xl border border-[#2d2d2d] overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">
            <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs">Loading companies...</p>
          </div>
        ) : companies.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <FaBuilding className="text-4xl text-gray-600 mx-auto mb-3" />
            <p className="font-semibold text-white">No companies found</p>
            <p className="text-xs text-gray-500 mt-1">Try adjusting search filters or create a new company tenant</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-[#181818] border-b border-[#2d2d2d] text-gray-400 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-6 py-4">Company</th>
                  <th className="px-4 py-4">Plan</th>
                  <th className="px-4 py-4 text-center">Allowed Pages</th>
                  <th className="px-4 py-4 text-center">Users</th>
                  <th className="px-4 py-4">Status</th>
                  <th className="px-4 py-4">Created</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#262626]">
                {companies.map((company) => {
                  const allowedCount = company.allowedModules?.length || 4;
                  return (
                    <tr key={company._id} className="hover:bg-[#222222] transition-colors">
                      <td className="px-6 py-4 font-medium text-white">
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-xl bg-[#282828] border border-[#333] flex items-center justify-center text-amber-400 font-bold">
                            {company.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-white text-sm">{company.name}</div>
                            <div className="text-[11px] text-gray-400">
                              {company.slug} &bull; {company.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <span className={`px-2.5 py-1 text-[11px] font-semibold border rounded-full uppercase tracking-wider ${getPlanBadge(company.plan)}`}>
                          {company.plan}
                        </span>
                      </td>

                      <td className="px-4 py-4 text-center">
                        <button
                          onClick={() => {
                            setSelectedCompany(company);
                            setSelectedModules(company.allowedModules || DEFAULT_PLAN_PRESETS[company.plan] || DEFAULT_PLAN_PRESETS.basic);
                            setIsModulesModalOpen(true);
                          }}
                          className="inline-flex items-center space-x-1.5 bg-[#252525] hover:bg-[#303030] text-amber-400 hover:text-amber-300 px-3 py-1 rounded-lg border border-[#383838] font-semibold transition-all"
                        >
                          <FaCheckSquare className="text-xs" />
                          <span>{allowedCount} Pages</span>
                        </button>
                      </td>

                      <td className="px-4 py-4 text-center font-bold text-white">
                        <div className="inline-flex items-center space-x-1.5 bg-[#282828] px-2.5 py-1 rounded-lg border border-[#333]">
                          <FaUsers className="text-gray-400 text-xs" />
                          <span>{company.userCount || 0}</span>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        {company.status === 'active' ? (
                          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            <span>Active</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 text-[11px] font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                            <span>Suspended</span>
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-4 text-gray-400">
                        {new Date(company.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => {
                              setSelectedCompany(company);
                              setSelectedModules(company.allowedModules || DEFAULT_PLAN_PRESETS[company.plan] || DEFAULT_PLAN_PRESETS.basic);
                              setIsModulesModalOpen(true);
                            }}
                            title="Manage Page Permissions"
                            className="p-2 text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 rounded-lg transition-all"
                          >
                            <FaCheckSquare />
                          </button>

                          <Link
                            to={`/platform-admin/companies/${company._id}`}
                            title="View Details"
                            className="p-2 text-gray-400 hover:text-white bg-[#262626] hover:bg-[#333] rounded-lg transition-all"
                          >
                            <FaEye />
                          </Link>

                          <button
                            onClick={() => {
                              setSelectedCompany(company);
                              setNewPlan(company.plan);
                              setIsPlanModalOpen(true);
                            }}
                            title="Change Plan Tier"
                            className="p-2 text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded-lg transition-all"
                          >
                            <FaExchangeAlt />
                          </button>

                          <button
                            onClick={() => {
                              setSelectedCompany(company);
                              setIsStatusModalOpen(true);
                            }}
                            title={company.status === 'active' ? 'Suspend Company' : 'Activate Company'}
                            className={`p-2 rounded-lg border transition-all ${
                              company.status === 'active'
                                ? 'text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border-rose-500/20'
                                : 'text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/20'
                            }`}
                          >
                            {company.status === 'active' ? <FaBan /> : <FaCheckCircle />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MANAGE CUSTOM PAGE ACCESS MODAL */}
      {isModulesModalOpen && selectedCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#1e1e1e] border border-[#333] rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-[#2d2d2d] flex items-center justify-between bg-[#181818]">
              <div>
                <h3 className="font-bold text-white text-base">Page Access Control</h3>
                <p className="text-xs text-gray-400">Select which pages {selectedCompany.name} can access</p>
              </div>
              <button
                onClick={() => setIsModulesModalOpen(false)}
                className="text-gray-400 hover:text-white p-1"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSaveModules} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="flex items-center justify-between bg-[#141414] p-3 rounded-xl border border-[#2a2a2a]">
                <span className="text-xs text-gray-300">Quick Plan Preset:</span>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setSelectedModules(DEFAULT_PLAN_PRESETS.basic)}
                    className="px-2.5 py-1 text-[11px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg"
                  >
                    Basic Preset (4 Pages)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedModules(DEFAULT_PLAN_PRESETS.pro)}
                    className="px-2.5 py-1 text-[11px] font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg"
                  >
                    Pro Preset (7 Pages)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedModules(DEFAULT_PLAN_PRESETS.enterprise)}
                    className="px-2.5 py-1 text-[11px] font-semibold bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-lg"
                  >
                    All Pages (11)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {ALL_MODULES.map((mod) => {
                  const isChecked = selectedModules.includes(mod.id);
                  return (
                    <label
                      key={mod.id}
                      onClick={() => toggleModuleSelection(mod.id, selectedModules, setSelectedModules)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start space-x-3 ${
                        isChecked
                          ? 'bg-amber-500/10 border-amber-500/40 text-white'
                          : 'bg-[#141414] border-[#2d2d2d] text-gray-400 hover:border-[#3d3d3d]'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="mt-0.5 rounded border-gray-600 text-amber-500 focus:ring-amber-500"
                      />
                      <div>
                        <div className={`text-xs font-bold ${isChecked ? 'text-amber-400' : 'text-white'}`}>
                          {mod.label}
                        </div>
                        <div className="text-[11px] text-gray-500 mt-0.5">{mod.desc}</div>
                      </div>
                    </label>
                  );
                })}
              </div>

              <div className="pt-4 flex items-center justify-between border-t border-[#2d2d2d]">
                <span className="text-xs text-gray-400">
                  <strong className="text-amber-400">{selectedModules.length}</strong> of {ALL_MODULES.length} pages enabled
                </span>
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsModulesModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-gray-400 hover:text-white bg-[#282828] rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updatingModules}
                    className="px-5 py-2 text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-xl transition-all disabled:opacity-50"
                  >
                    {updatingModules ? 'Saving Access...' : 'Save Page Access'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE COMPANY MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#1e1e1e] border border-[#333] rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-[#2d2d2d] flex items-center justify-between bg-[#181818]">
              <h3 className="font-bold text-white text-base">Create New Company Tenant</h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-gray-400 hover:text-white p-1"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleCreateCompany} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Company Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ABC Corporation"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  className="w-full bg-[#141414] border border-[#333] text-white text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Slug Identifier</label>
                  <input
                    type="text"
                    placeholder="abc-corporation"
                    value={createForm.slug}
                    onChange={(e) => setCreateForm({ ...createForm, slug: e.target.value })}
                    className="w-full bg-[#141414] border border-[#333] text-white text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Base Plan</label>
                  <select
                    value={createForm.plan}
                    onChange={(e) => {
                      const p = e.target.value;
                      setCreateForm({
                        ...createForm,
                        plan: p,
                        allowedModules: DEFAULT_PLAN_PRESETS[p] || DEFAULT_PLAN_PRESETS.basic
                      });
                    }}
                    className="w-full bg-[#141414] border border-[#333] text-white text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-amber-500"
                  >
                    <option value="basic">Basic (Dashboard, DSR, Employee, Settings)</option>
                    <option value="pro">Pro (+ Walk-in, Tasks, Store Analysis)</option>
                    <option value="enterprise">Enterprise (All Pages & Modules)</option>
                    <option value="trial">Trial (Free 14-day evaluation)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Company Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="contact@abc.com"
                    value={createForm.email}
                    onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                    className="w-full bg-[#141414] border border-[#333] text-white text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Company Phone</label>
                  <input
                    type="text"
                    placeholder="+1 555-0192"
                    value={createForm.phone}
                    onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                    className="w-full bg-[#141414] border border-[#333] text-white text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Page Access Checkboxes */}
              <div className="pt-2 border-t border-[#2d2d2d]">
                <label className="block text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">
                  Initial Page Access ({createForm.allowedModules.length} enabled)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {ALL_MODULES.map((mod) => {
                    const checked = createForm.allowedModules.includes(mod.id);
                    return (
                      <label
                        key={mod.id}
                        onClick={() => toggleModuleSelection(mod.id, createForm.allowedModules, (updated) => setCreateForm({ ...createForm, allowedModules: updated }))}
                        className={`px-2.5 py-1.5 rounded-lg border text-[11px] cursor-pointer font-medium transition-all ${
                          checked
                            ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                            : 'bg-[#141414] text-gray-400 border-[#2d2d2d]'
                        }`}
                      >
                        {checked ? '✓ ' : '+ '}
                        {mod.label}
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 border-t border-[#2d2d2d]">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
                  Client Account Initial Credentials
                </h4>
                <p className="text-[11px] text-gray-400 mb-3">
                  Set login credentials for this external organization. (Isolated from internal platform admin accounts).
                </p>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">Admin Full Name</label>
                    <input
                      type="text"
                      placeholder="John Doe"
                      value={createForm.adminName}
                      onChange={(e) => setCreateForm({ ...createForm, adminName: e.target.value })}
                      className="w-full bg-[#141414] border border-[#333] text-white text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">Admin Email *</label>
                    <input
                      type="email"
                      required
                      placeholder="admin@abc.com"
                      value={createForm.adminEmail}
                      onChange={(e) => setCreateForm({ ...createForm, adminEmail: e.target.value })}
                      className="w-full bg-[#141414] border border-[#333] text-white text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">Admin Password *</label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={createForm.adminPassword}
                      onChange={(e) => setCreateForm({ ...createForm, adminPassword: e.target.value })}
                      className="w-full bg-[#141414] border border-[#333] text-white text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-400 hover:text-white bg-[#282828] rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2 text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-xl transition-all disabled:opacity-50"
                >
                  {creating ? 'Creating Tenant...' : 'Create Company'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUSPEND / ACTIVATE CONFIRMATION MODAL */}
      {isStatusModalOpen && selectedCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#1e1e1e] border border-[#333] rounded-2xl w-full max-w-md p-6 space-y-4">
            <h3 className="font-bold text-white text-base">
              {selectedCompany.status === 'active' ? 'Suspend Company Account?' : 'Activate Company Account?'}
            </h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              {selectedCompany.status === 'active'
                ? `Are you sure you want to suspend '${selectedCompany.name}'? Users belonging to this tenant will immediately be denied application access.`
                : `Activate '${selectedCompany.name}'? Access will be restored for all company users.`}
            </p>
            <div className="pt-3 flex justify-end space-x-3">
              <button
                onClick={() => setIsStatusModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-gray-400 bg-[#282828] rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleToggleStatus}
                disabled={updatingStatus}
                className={`px-5 py-2 text-xs font-bold rounded-xl transition-all ${
                  selectedCompany.status === 'active'
                    ? 'bg-rose-500 hover:bg-rose-400 text-white'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                }`}
              >
                {updatingStatus
                  ? 'Updating...'
                  : selectedCompany.status === 'active'
                  ? 'Confirm Suspension'
                  : 'Confirm Activation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CHANGE PLAN MODAL */}
      {isPlanModalOpen && selectedCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#1e1e1e] border border-[#333] rounded-2xl w-full max-w-md p-6 space-y-4">
            <h3 className="font-bold text-white text-base">
              Update Subscription Plan: {selectedCompany.name}
            </h3>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-2">Select Base Plan Tier</label>
              <select
                value={newPlan}
                onChange={(e) => setNewPlan(e.target.value)}
                className="w-full bg-[#141414] border border-[#333] text-white text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-amber-500"
              >
                <option value="basic">Basic (Dashboard, DSR, Employee, Settings)</option>
                <option value="pro">Pro (+ Walk-in, Tasks, Store Analysis)</option>
                <option value="enterprise">Enterprise (All Pages & Modules)</option>
                <option value="trial">Trial (Free 14-day evaluation)</option>
              </select>
            </div>

            <div className="pt-3 flex justify-end space-x-3">
              <button
                onClick={() => setIsPlanModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-gray-400 bg-[#282828] rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleChangePlan}
                disabled={updatingPlan}
                className="px-5 py-2 text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-xl transition-all"
              >
                {updatingPlan ? 'Updating Plan...' : 'Save Plan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompaniesPage;
