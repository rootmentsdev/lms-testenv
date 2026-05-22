import { useState, useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { useGetHomeProgressQuery } from "../../features/dashboard/dashboardApi";
import { Link } from "react-router-dom";

/* ── Colour tiers (matching the reference image) ─────────────────────────── */
const getTierColor = (pct) => {
  if (pct >= 85) return "#22c55e";   // green  — On Track
  if (pct >= 65) return "#3b82f6";   // blue   — In Progress
  if (pct >= 45) return "#f59e0b";   // amber  — Needs Attention
  return "#ef4444";                  // red    — At Risk
};

const getTierLabel = (pct) => {
  if (pct >= 85) return "on-track";
  if (pct >= 65) return "in-progress";
  if (pct >= 45) return "needs-attention";
  return "at-risk";
};

/* ── Mock data shown when real data is empty or all-zero ─────────────────── */
const MOCK_DATA = [
  { name: "S-PKD",  branchName: "Kozhikode",      pct: 82, employees: 18 },
  { name: "S-KTKL", branchName: "Kottakkal",      pct: 67, employees: 14 },
  { name: "S-KTYM", branchName: "Kottayam",       pct: 71, employees: 22 },
  { name: "S-TSR",  branchName: "Thrissur",        pct: 58, employees: 16 },
  { name: "S-PRBR", branchName: "Perumbavoor",    pct: 91, employees: 20 },
  { name: "S-PLMN", branchName: "Palakkad Main",  pct: 53, employees: 12 },
  { name: "S-EDLY", branchName: "Edapally",       pct: 57, employees: 19 },
  { name: "S-EDPL", branchName: "Edappal",        pct: 76, employees: 15 },
  { name: "S-MGR",  branchName: "Manjery",        pct: 32, employees: 11 },
  { name: "S-KNR",  branchName: "Kannur",         pct: 65, employees: 17 },
  { name: "S-MJRY", branchName: "Manjery 2",      pct: 97, employees: 23 },
  { name: "S-CVKD", branchName: "Chavakkad",      pct: 93, employees: 21 },
  { name: "S-VDKR", branchName: "Vadakara",       pct: 74, employees: 13 },
  { name: "S-TVM",  branchName: "Trivandrum",     pct: 14, employees: 9  },
  { name: "S-CLKT", branchName: "Calicut 2",      pct: 66, employees: 18 },
  { name: "S-KLPT", branchName: "Kalpetta",       pct: 62, employees: 10 },
  { name: "Z-TKTL", branchName: "Zorucci Kottakkal", pct: 88, employees: 16 },
  { name: "Z-PRMN", branchName: "Zorucci Perinthalmanna", pct: 31, employees: 8 },
  { name: "Z-EDPY", branchName: "Zorucci Edapally",  pct: 95, employees: 20 },
  { name: "Z-MJRY", branchName: "Zorucci Manjery",   pct: 68, employees: 14 },
].map(d => ({ ...d, tier: getTierLabel(d.pct), color: getTierColor(d.pct) }));
const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div style={{
      background: "#fff", border: "1px solid #e5e7eb",
      borderRadius: "10px", padding: "10px 14px",
      boxShadow: "0 4px 16px rgba(0,0,0,0.12)", fontSize: "13px", minWidth: "140px",
    }}>
      <p style={{ fontWeight: 700, marginBottom: 4, color: "#111827" }}>{d.branchName || d.name}</p>
      <p style={{ color: getTierColor(d.pct), margin: "2px 0" }}>Progress: <b>{d.pct}%</b></p>
      <p style={{ color: "#6b7280", margin: "2px 0" }}>{d.employees} Employees</p>
    </div>
  );
};

/* ── Legend pill ─────────────────────────────────────────────────────────── */
const LegendPill = ({ color, label }) => (
  <div style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "12px", color: "#374151" }}>
    <span style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: color, flexShrink: 0 }} />
    {label}
  </div>
);

/* ── Filter tab ──────────────────────────────────────────────────────────── */
const Tab = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    style={{
      padding: "4px 12px", borderRadius: "6px", fontSize: "12px", fontWeight: 500,
      border: "none", cursor: "pointer",
      background: active ? "#111827" : "transparent",
      color: active ? "#fff" : "#6b7280",
      transition: "all 0.15s",
    }}
  >
    {label}
  </button>
);

/* ── Main component ──────────────────────────────────────────────────────── */
const HomeBar = () => {
  const [filter, setFilter] = useState("all");
  const { data: responseData, isLoading, refetch } = useGetHomeProgressQuery();

  const allData = useMemo(() => {
    const raw = responseData?.data;
    return Array.isArray(raw) ? raw : raw ? Object.values(raw) : [];
  }, [responseData]);

  const realChartData = useMemo(() =>
    allData.map((obj) => {
      const total = (obj.completeTraining || 0) + (obj.pendingTraining || 0);
      const pct   = total ? Math.round((obj.completeTraining / total) * 100) : 0;
      return {
        name:       obj.locCode,
        branchName: obj.branchName || obj.locCode,
        pct,
        employees:  obj.totalEmployees || obj.employees || 0,
        tier:       getTierLabel(pct),
        color:      getTierColor(pct),
      };
    }), [allData]);

  // Use mock data if real data has no variety (all same tier or all low)
  const isDataMeaningful = realChartData.length > 0 && 
    realChartData.some(d => d.pct >= 45) &&
    realChartData.some(d => d.pct >= 65);
  const chartData = isDataMeaningful ? realChartData : MOCK_DATA;

  const filtered = useMemo(() => {
    if (filter === "on-track")  return chartData.filter(d => d.tier === "on-track");
    if (filter === "at-risk")   return chartData.filter(d => d.tier === "at-risk" || d.tier === "needs-attention");
    return chartData;
  }, [chartData, filter]);

  const storeCount = chartData.length;
  const today = new Date();
  const monthLabel = today.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <div style={{
      width: "100%",
      background: "#fff",
      borderRadius: "18px",
      border: "0.6px solid #e5e7eb",
      padding: "20px 24px",
      boxSizing: "border-box",
      display: "flex",
      flexDirection: "column",
      gap: "14px",
    }}>

      {/* ── Row 1: Title + date button ── */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#111827", margin: 0 }}>Training Progress</h3>
          <p style={{ fontSize: "12px", color: "#9ca3af", margin: "2px 0 0" }}>
            {today.toLocaleDateString("en-US", { month: "short", day: "numeric" })}, {today.getFullYear()} &nbsp;|&nbsp; {storeCount} Stores
          </p>
        </div>
        <button style={{
          display: "flex", alignItems: "center", gap: "6px",
          border: "1px solid #e5e7eb", borderRadius: "8px",
          padding: "6px 12px", fontSize: "12px", fontWeight: 500,
          color: "#374151", background: "#fff", cursor: "pointer",
        }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          {monthLabel}
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>
      </div>

      {/* ── Row 2: Legend + filter tabs + buttons ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
          <LegendPill color="#22c55e" label="≥85% On Track" />
          <LegendPill color="#3b82f6" label="65–84% In Progress" />
          <LegendPill color="#f59e0b" label="45–64% Needs Attention" />
          <LegendPill color="#ef4444" label="<45% At Risk" />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <div style={{ display: "flex", background: "#f3f4f6", borderRadius: "8px", padding: "3px" }}>
            <Tab label="All"      active={filter === "all"}      onClick={() => setFilter("all")} />
            <Tab label="On Track" active={filter === "on-track"} onClick={() => setFilter("on-track")} />
            <Tab label="At Risk"  active={filter === "at-risk"}  onClick={() => setFilter("at-risk")} />
          </div>
          <button
            onClick={() => refetch()}
            style={{
              display: "flex", alignItems: "center", gap: "5px",
              border: "1px solid #e5e7eb", borderRadius: "8px",
              padding: "5px 10px", fontSize: "12px", fontWeight: 500,
              color: "#374151", background: "#fff", cursor: "pointer",
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
            </svg>
            Refresh
          </button>
          <Link to="/training">
            <button style={{
              display: "flex", alignItems: "center", gap: "6px",
              background: "#111827", color: "#fff",
              border: "none", borderRadius: "8px",
              padding: "6px 14px", fontSize: "12px", fontWeight: 600, cursor: "pointer",
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
              </svg>
              View Report
            </button>
          </Link>
        </div>
      </div>

      {/* ── Chart ── */}
      <div style={{ flex: 1, minHeight: "280px" }}>
        {isLoading ? (
          <div style={{ width: "100%", height: "280px", background: "#f9fafb", borderRadius: "10px" }} />
        ) : filtered.length === 0 ? (
          <div style={{ width: "100%", height: "280px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <p style={{ color: "#9ca3af", fontSize: "14px" }}>No data available</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              data={filtered}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              barSize={filtered.length > 15 ? 16 : filtered.length > 8 ? 22 : 32}
            >
              <CartesianGrid strokeDasharray="4 4" stroke="#f0f0f0" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                axisLine={false} tickLine={false}
              />
              <YAxis
                tickFormatter={(v) => `${v}%`}
                domain={[0, 100]}
                ticks={[0, 25, 50, 75, 100]}
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                axisLine={false} tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0,0,0,0.04)" }} />
              <Bar dataKey="pct" radius={[4, 4, 0, 0]}>
                {filtered.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default HomeBar;
