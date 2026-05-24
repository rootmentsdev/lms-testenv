import { useMemo } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Link } from "react-router-dom";
import { useGetHomeProgressQuery } from "../../features/dashboard/dashboardApi";
import {
  normalizeBranchProgress,
  countFromPercent,
} from "../../features/dashboard/dashboardUtils";

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
  const { data: progressResponse } = useGetHomeProgressQuery();

  const { completed, inProgress, overdue, pending, total, pct, pieData } = useMemo(() => {
    const branches = normalizeBranchProgress(progressResponse);

    const done = branches.reduce(
      (s, b) => s + countFromPercent(b.completeTraining, b.totalTraining),
      0
    );
    const active = branches.reduce(
      (s, b) => s + countFromPercent(b.pendingTraining, b.totalTraining),
      0
    );
    const late = branches.reduce(
      (s, b) => s + countFromPercent(b.pendingAssessment, b.totalAssessment),
      0
    );
    const doneAssess = branches.reduce(
      (s, b) => s + countFromPercent(b.completeAssessment, b.totalAssessment),
      0
    );

    const sum = done + active + late + doneAssess;
    const percent = sum ? Math.round((done / sum) * 100) : 0;

    const slices = [
      { name: "Completed",   value: done },
      { name: "In Progress", value: active },
      { name: "Overdue",     value: late },
      { name: "Pending",     value: doneAssess },
    ].filter((d) => d.value > 0);

    return {
      completed: done,
      inProgress: active,
      overdue: late,
      pending: doneAssess,
      total: sum,
      pct: percent,
      pieData: slices,
    };
  }, [progressResponse]);

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
