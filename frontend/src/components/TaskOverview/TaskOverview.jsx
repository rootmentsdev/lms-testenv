import { useEffect, useMemo, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Link } from "react-router-dom";
import { fetchDashboardTasks } from "../../features/dashboard/dashboardFetch";

const COLORS = {
  Completed:  "#22c55e",
  "In Progress": "#3b82f6",
  Overdue:    "#ef4444",
  Pending:    "#d1d5db",
};

const LegendRow = ({ color, label, count }) => (
  <div className="border-b border-[#f3f4f6] dark:border-slate-800" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0" }}>
    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
      <span style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: color, flexShrink: 0, display: "inline-block" }} />
      <span className="text-[#374151] dark:text-[#cbd5e1]" style={{ fontSize: "13px" }}>{label}</span>
    </div>
    <span className="text-[#111827] dark:text-[#f8fafc]" style={{ fontSize: "13px", fontWeight: 600 }}>{count}</span>
  </div>
);

const TaskOverview = () => {
  const [tasksResponse, setTasksResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setIsLoading(true);
      try {
        const data = await fetchDashboardTasks();
        if (!mounted) return;
        setTasksResponse(data);
      } catch {
        if (!mounted) return;
        setTasksResponse(null);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    load();

    const refresh = () => load();
    window.addEventListener("dashboard:refresh", refresh);
    return () => {
      mounted = false;
      window.removeEventListener("dashboard:refresh", refresh);
    };
  }, []);

  const { completed, inProgress, overdue, pending, total, pct, pieData } = useMemo(() => {
    if (isLoading || !tasksResponse) {
      return {
        completed: 0,
        inProgress: 0,
        overdue: 0,
        pending: 0,
        total: 0,
        pct: 0,
        pieData: [],
      };
    }
    const tasks = tasksResponse.data || [];

    const done = tasks.filter(t => t.status === 'COMPLETED').length;
    const active = tasks.filter(t => t.status === 'IN PROGRESS').length;
    const late = tasks.filter(t => t.status === 'OVERDUE').length;
    const holdOrPending = tasks.filter(t => t.status === 'PENDING' || t.status === 'ON HOLD' || !t.status).length;

    const sum = done + active + late + holdOrPending;
    const percent = sum ? Math.round((done / sum) * 100) : 0;

    const slices = [
      { name: "Completed",   value: done },
      { name: "In Progress", value: active },
      { name: "Overdue",     value: late },
      { name: "Pending",     value: holdOrPending },
    ].filter((d) => d.value > 0);

    return {
      completed: done,
      inProgress: active,
      overdue: late,
      pending: holdOrPending,
      total: sum,
      pct: percent,
      pieData: slices,
    };
  }, [tasksResponse, isLoading]);

  return (
    <div className="w-full lg:w-[340px] flex-shrink-0 bg-white dark:bg-[#111c2a] border border-[#e5e7eb] dark:border-slate-800" style={{
      height: "380px",
      padding: "20px",
      borderRadius: "18px",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      boxSizing: "border-box",
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <h3 className="text-[#111827] dark:text-[#f8fafc]" style={{ fontSize: "16px", fontWeight: 700, margin: 0 }}>Task Overview</h3>
          <p className="text-[#9ca3af] dark:text-[#94a3b8]" style={{ fontSize: "12px", margin: "2px 0 0" }}>{completed} / {total}</p>
        </div>
        <Link to="/task">
          <button className="bg-[#111827] dark:bg-[#1e293b] text-white dark:text-slate-100 border-none hover:bg-gray-700 dark:hover:bg-slate-700 cursor-pointer" style={{
            borderRadius: "10px",
            padding: "8px 18px", fontSize: "13px",
            fontWeight: 600,
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

      <div className="border-t border-[#f3f4f6] dark:border-slate-800">
        <LegendRow color={COLORS["Completed"]}   label="Completed"   count={completed}  />
        <LegendRow color={COLORS["In Progress"]} label="In Progress" count={inProgress} />
        <LegendRow color={COLORS["Overdue"]}     label="Overdue"     count={overdue}    />
        <LegendRow color={COLORS["Pending"]}     label="Pending"     count={pending}    />
      </div>
    </div>
  );
};

export default TaskOverview;
