import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useGetHomeProgressQuery, useGetWeeklyWalkinsQuery } from "../../features/dashboard/dashboardApi";
import {
  normalizeBranchProgress,
  countFromPercent,
} from "../../features/dashboard/dashboardUtils";

/* ── Individual stat card ─────────────────────────────────────────────────── */
const StatCard = ({ title, value, subtitle, icon, iconBg }) => (
  <div
    style={{
      flex:           '1 1 0',
      minWidth:       '0',
      height:         '100px',
      borderRadius:   '12px',
      paddingTop:     '14px',
      paddingRight:   '18px',
      paddingBottom:  '14px',
      paddingLeft:    '18px',
      opacity:        1,
      background:     '#ffffff',
      border:         '1px solid #f0f0f0',
      boxShadow:      '0 1px 4px rgba(0,0,0,0.06)',
      display:        'flex',
      flexDirection:  'column',
      justifyContent: 'space-between',
      boxSizing:      'border-box',
    }}
  >
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
      <span style={{ fontSize: '12px', fontWeight: 500, color: '#6b7280', lineHeight: '1.3', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</span>
      <div
        style={{ width: '28px', height: '28px', borderRadius: '8px', backgroundColor: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
      >
        {icon}
      </div>
    </div>
    <div className="text-[26px] font-bold text-gray-900 leading-none">{value}</div>
    <div className="text-[11px] text-gray-400 leading-tight">{subtitle}</div>
  </div>
);

const WalkinIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);

const TaskIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#EA580C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

const TrainingIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
    <line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
  </svg>
);

const EmployeeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
    <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
  </svg>
);

const AssessmentIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 11l3 3L22 4"/>
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
  </svg>
);

const DashboardOverview = () => {
  const { data: progressResponse } = useGetHomeProgressQuery();
  const { data: walkinResponse } = useGetWeeklyWalkinsQuery();

  const stats = useMemo(() => {
    const branches = normalizeBranchProgress(progressResponse);
    const totalBranches = branches.length;

    const totalEmp = branches.reduce((sum, b) => sum + (b.totalEmployees || 0), 0);
    const inTraining = branches.reduce(
      (sum, b) => sum + countFromPercent(b.pendingTraining, b.totalTraining),
      0
    );

    const avgTraining = totalBranches
      ? Math.round(branches.reduce((sum, b) => sum + (b.completeTraining || 0), 0) / totalBranches)
      : 0;

    const completedAssessments = branches.reduce(
      (sum, b) => sum + countFromPercent(b.completeAssessment, b.totalAssessment),
      0
    );
    const overdueCount = branches.reduce(
      (sum, b) => sum + countFromPercent(b.pendingAssessment, b.totalAssessment),
      0
    );
    const totalAssessments = completedAssessments + overdueCount;

    const walkins = walkinResponse?.data;
    const totalWalkins = Array.isArray(walkins) ? walkins.length : 0;

    return {
      totalBranches,
      totalEmp,
      inTraining,
      avgTraining,
      completedAssessments,
      overdueCount,
      totalAssessments,
      totalWalkins,
    };
  }, [progressResponse, walkinResponse]);

  const cards = [
    {
      title:    'Total Walk Ins',
      value:    stats.totalWalkins || '—',
      subtitle: `Last 7 days · ${stats.totalBranches} stores`,
      icon:     <WalkinIcon />,
      iconBg:   '#EDE9FE',
    },
    {
      title:    'Completed Assessments',
      value:    stats.completedAssessments || '—',
      subtitle: stats.totalAssessments
        ? `${Math.round((stats.completedAssessments / stats.totalAssessments) * 100)}% of ${stats.totalAssessments} total`
        : 'No assessments yet',
      icon:     <AssessmentIcon />,
      iconBg:   '#DBEAFE',
    },
    {
      title:    'Overdue Tasks',
      value:    stats.overdueCount || '0',
      subtitle: stats.overdueCount > 0 ? 'Require immediate action' : 'All tasks on track',
      icon:     <TaskIcon />,
      iconBg:   '#FFEDD5',
    },
    {
      title:    'Avg Training Progress',
      value:    `${stats.avgTraining}%`,
      subtitle: `${stats.totalEmp} employees`,
      icon:     <TrainingIcon />,
      iconBg:   '#FEF3C7',
    },
    {
      title:    'Employees in Training',
      value:    stats.inTraining || stats.totalEmp || '—',
      subtitle: `Across ${stats.totalBranches} stores`,
      icon:     <EmployeeIcon />,
      iconBg:   '#DCFCE7',
    },
  ];

  return (
    <div style={{ marginBottom: '24px' }}>
      <div className="flex items-start justify-between mb-5">
        <div>
          <h2 className="text-[22px] font-bold text-gray-900 leading-tight">Dashboard Overview</h2>
          <p className="text-[12px] text-gray-400 mt-0.5">Store walkings, tasks, and training progress across all locations</p>
        </div>
        <Link to="/walkin/list">
          <button className="bg-gray-900 text-white text-[13px] font-semibold px-5 py-2 rounded-xl hover:bg-gray-700 transition-colors flex-shrink-0">
            + Add Walk In
          </button>
        </Link>
      </div>

      <div style={{ display: 'flex', gap: '12px', flexWrap: 'nowrap' }}>
        {cards.map((card) => (
          <StatCard key={card.title} {...card} />
        ))}
      </div>
    </div>
  );
};

export default DashboardOverview;
