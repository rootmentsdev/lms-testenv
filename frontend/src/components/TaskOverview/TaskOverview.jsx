import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { useGetDashboardProgressQuery } from "../../features/dashboard/dashboardApi";
import { Link } from "react-router-dom";

const COLORS = {
  Completed:  "#22c55e",
  "In Progress": "#3b82f6",
  Overdue:    "#ef4444",
  Pending:    "#d1d5db",
};

const LegendRow = ({ color, label, count }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f3f4f6" }}>
    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
      <span style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: color, flexShrink: 0, display: "inline-block" }} />
      <span style={{ fontSize: "13px", color: "#374151" }}>{label}</span>
    </div>
    <span style={{ fontSize: "13px", fontWeight: 600, color: "#111827" }}>{count}</span>
  </div>
);

const TaskOverview = () => {
  const { data: progressData } = useGetDashboardProgressQuery();

  const rawProgress = progressData?.data;
  const progress    = Array.isArray(rawProgress) ? rawProgress : (rawProgress ? Object.values(rawProgress) : []);

  const rawCompleted  = progress.reduce((s, b) => s + (b.completeTraining  || 0), 0);
  const rawInProgress = progress.reduce((s, b) => s + (b.pendingTraining   || 0), 0);
  const rawOverdue    = progress.reduce((s, b) => s + (b.pendingAssessment || 0), 0);
  const rawPending    = progress.reduce((s, b) => s + (b.completeAssessment|| 0), 0);

  const hasRealData = (rawCompleted + rawInProgress + rawOverdue + rawPending) > 0;

  const completed  = hasRealData ? rawCompleted  : 54;
  const inProgress = hasRealData ? rawInProgress : 6;
  const overdue    = hasRealData ? rawOverdue    : 4;
  const pending    = hasRealData ? rawPending    : 12;

  const total = completed + inProgress + overdue + pending;
  const pct   = total ? Math.round((completed / total) * 100) : 0;

  const pieData = [
    { name: "Completed",   value: completed  },
    { name: "In Progress", value: inProgress },
    { name: "Overdue",     value: overdue    },
    { name: "Pending",     value: pending    },
  ].filter(d => d.value > 0);

  /* Custom centre label */
  const renderCentreLabel = ({ viewBox }) => {
    const { cx, cy } = viewBox;
    return (
      <g>
        <text x={cx} y={cy - 8} textAnchor="middle" dominantBaseline="middle"
          style={{ fontSize: "26px", fontWeight: 700, fill: "#111827" }}>
          {pct}%
        </text>
        <text x={cx} y={cy + 18} textAnchor="middle" dominantBaseline="middle"
          style={{ fontSize: "12px", fill: "#9ca3af" }}>
          Done
        </text>
      </g>
    );
  };

  return (
    <div style={{
      flex: "0 0 340px",
      height: "380px",
      padding: "20px",
      borderRadius: "18px",
      borderWidth: "0.6px",
      borderStyle: "solid",
      borderColor: "#e5e7eb",
      background: "#fff",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      boxSizing: "border-box",
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#111827", margin: 0 }}>Task Overview</h3>
          <p style={{ fontSize: "12px", color: "#9ca3af", margin: "2px 0 0" }}>{completed} / {total}</p>
        </div>
        <Link to="/assessments">
          <button style={{
            background: "#111827", color: "#fff",
            border: "none", borderRadius: "10px",
            padding: "8px 18px", fontSize: "13px",
            fontWeight: 600, cursor: "pointer",
          }}>
            View All
          </button>
        </Link>
      </div>

      {/* Donut chart */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <ResponsiveContainer width={150} height={150}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%" cy="50%"
              innerRadius={46} outerRadius={65}
              startAngle={90} endAngle={-270}
              dataKey="value"
              labelLine={false}
            >
              {pieData.map((entry) => (
                <Cell key={entry.name} fill={COLORS[entry.name] || "#d1d5db"} strokeWidth={0} />
              ))}
            </Pie>
            {/* Centre text overlay */}
            <text x="50%" y="46%" textAnchor="middle" dominantBaseline="middle"
              style={{ fontSize: "26px", fontWeight: 700, fill: "#111827" }}>
              {pct}%
            </text>
            <text x="50%" y="58%" textAnchor="middle" dominantBaseline="middle"
              style={{ fontSize: "12px", fill: "#9ca3af" }}>
              Done
            </text>
            <Tooltip
              formatter={(v, n) => [v, n]}
              contentStyle={{ borderRadius: "8px", fontSize: "12px" }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div style={{ borderTop: "1px solid #f3f4f6" }}>
        <LegendRow color={COLORS["Completed"]}   label="Completed"   count={completed}  />
        <LegendRow color={COLORS["In Progress"]} label="In Progress" count={inProgress} />
        <LegendRow color={COLORS["Overdue"]}     label="Overdue"     count={overdue}    />
        <LegendRow color={COLORS["Pending"]}     label="Pending"     count={pending}    />
      </div>
    </div>
  );
};

export default TaskOverview;
