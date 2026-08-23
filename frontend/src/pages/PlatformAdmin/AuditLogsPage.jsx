import React, { useEffect, useState } from 'react';
import { FaHistory, FaShieldAlt, FaBuilding, FaUserCheck, FaBan, FaCheckCircle, FaExchangeAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';
import baseUrl from '../../api/api';

const AuditLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${baseUrl.baseUrl}api/platform/audit-logs`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setLogs(data.data || []);
      } else {
        toast.error(data.message || 'Failed to fetch audit logs');
      }
    } catch (err) {
      console.error('Error fetching audit logs:', err);
      toast.error('Network error loading audit logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const getActionBadge = (action) => {
    switch (action) {
      case 'CREATE_COMPANY':
        return { bg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', icon: FaBuilding };
      case 'SUSPEND_COMPANY':
        return { bg: 'bg-rose-500/20 text-rose-400 border-rose-500/30', icon: FaBan };
      case 'ACTIVATE_COMPANY':
        return { bg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', icon: FaCheckCircle };
      case 'CHANGE_PLAN':
        return { bg: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: FaExchangeAlt };
      default:
        return { bg: 'bg-amber-500/20 text-amber-400 border-amber-500/30', icon: FaHistory };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-wide">Platform Audit Logs</h2>
          <p className="text-sm text-gray-400 mt-1">Immutable security log of administrative platform actions</p>
        </div>
        <button
          onClick={fetchAuditLogs}
          className="px-3.5 py-2 text-xs font-semibold text-gray-300 bg-[#242424] hover:bg-[#2e2e2e] border border-[#383838] rounded-xl transition-all"
        >
          Refresh Logs
        </button>
      </div>

      {/* Audit Log Table */}
      <div className="bg-[#1e1e1e] rounded-2xl border border-[#2d2d2d] overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">
            <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs">Loading audit logs...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <FaHistory className="text-4xl text-gray-600 mx-auto mb-3" />
            <p className="font-semibold text-white">No audit records found</p>
            <p className="text-xs text-gray-500 mt-1">Administrative activities will appear here</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-[#181818] border-b border-[#2d2d2d] text-gray-400 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-6 py-4">Timestamp</th>
                  <th className="px-4 py-4">Action</th>
                  <th className="px-4 py-4">Actor</th>
                  <th className="px-4 py-4">Target Tenant</th>
                  <th className="px-6 py-4">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#262626]">
                {logs.map((log) => {
                  const badge = getActionBadge(log.action);
                  const Icon = badge.icon;
                  return (
                    <tr key={log._id} className="hover:bg-[#222] transition-colors">
                      <td className="px-6 py-4 text-gray-400 whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit'
                        })}
                      </td>

                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 text-[11px] font-semibold border rounded-full ${badge.bg}`}>
                          <Icon className="text-xs" />
                          <span>{log.action}</span>
                        </span>
                      </td>

                      <td className="px-4 py-4 font-medium text-white">
                        <div>
                          <div>{log.actorEmail || log.actorId?.email || 'Super Admin'}</div>
                          <div className="text-[11px] text-amber-400 font-semibold uppercase">{log.actorRole}</div>
                        </div>
                      </td>

                      <td className="px-4 py-4 text-gray-300">
                        {log.tenantId ? (
                          <div className="font-semibold text-white">
                            {log.tenantId.name || log.details?.companyName || 'Tenant'}
                          </div>
                        ) : (
                          <span className="text-gray-500">Global Platform</span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-gray-400 max-w-xs truncate">
                        {log.details ? JSON.stringify(log.details) : '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditLogsPage;
