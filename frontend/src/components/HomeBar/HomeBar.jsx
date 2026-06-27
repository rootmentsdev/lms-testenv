import { useEffect, useState, useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, AreaChart, Area
} from "recharts";
import { normalizeBranchProgress } from "../../features/dashboard/dashboardUtils";
import { Link } from "react-router-dom";
import { fetchHomeProgressChart as fetchHomeProgress } from "../../features/dashboard/dashboardFetch";

/* ── Canon normalizations (matching DSRReport.jsx) ────────────────────────── */
function canonFixes(s) {
  return s
    .replace(/\bedap{1,2}a?l{1,3}y\b/g, "edappally")
    .replace(/\bedap{1,2}a?l{1,3}i\b/g, "edappally")
    .replace(/\bmanjeri\b/g, "manjery")
    .replace(/\bperinthalmana\b/g, "perinthalmanna")
    .replace(/\bkottakal\b/g, "kottakkal")
    .replace(/\bkalpeta\b/g, "kalpetta")
    .replace(/\bzoruc+i\b/g, "zorucci");
}

function norm(s) {
  const x = String(s || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
  return canonFixes(x);
}

function displayBranchName(name) {
  const raw = String(name || "");
  if (/^grooms\s+/i.test(raw)) {
    return raw.replace(/^grooms\s+/i, "Suitor Guy ");
  }
  return raw;
}

function isHiddenBranch(name) {
  const normalized = norm(name);
  return (
    normalized === norm("Suitor Guy Kochi") ||
    normalized === norm("GROOMS Kochi") ||
    normalized === norm("Grooms Kochi") ||
    normalized === norm("Suitor Guy Calicut") ||
    normalized === norm("GROOMS Calicut") ||
    normalized === norm("Grooms Calicut")
  );
}

/* ── Mock target vs achieved data for line chart ────────────────────────── */
const mockDSRDataForGraph = [
  { name: "Z Edappally", target: 70000, achieved: 68000 },
  { name: "G Edappally", target: 75000, achieved: 76000 },
  { name: "Z Edappal", target: 60000, achieved: 52000 },
  { name: "Z Perinthalmanna", target: 65000, achieved: 62000 },
  { name: "Z Kottakkal", target: 55000, achieved: 68000 },
  { name: "G Kottayam", target: 70000, achieved: 42000 },
  { name: "G Perumbavoor", target: 72000, achieved: 32000 },
  { name: "G Thrissur", target: 65000, achieved: 38000 },
  { name: "SG Edappally", target: 58000, achieved: 35000 },
  { name: "Z Perumbavoor", target: 60000, achieved: 32000 },
  { name: "Z Thrissur", target: 78000, achieved: 52000 },
  { name: "SG Thrissur", target: 75000, achieved: 62000 },
  { name: "Z Manjeri", target: 72000, achieved: 41000 },
  { name: "Z Kalpetta", target: 69000, achieved: 36000 },
  { name: "Z Palakkad", target: 74000, achieved: 48000 },
  { name: "Z Kannur", target: 82000, achieved: 51000 },
  { name: "Z Muvattupuzha", target: 73000, achieved: 68000 },
  { name: "Z Aluva", target: 68000, achieved: 76000 },
  { name: "Z Angamaly", target: 58000, achieved: 51000 },
  { name: "Z Chalakudy", target: 64000, achieved: 62000 },
  { name: "Z Kollam", target: 56000, achieved: 68000 },
  { name: "Z Kayamkulam", target: 70000, achieved: 42000 },
  { name: "Z Tirur", target: 71500, achieved: 32000 },
  { name: "Z Vadakara", target: 64000, achieved: 38000 },
  { name: "SG Test", target: 58000, achieved: 35000 }
];

/* ── Colour tiers (matching reference image) ────────────────────────────── */
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

/* ── Custom Tooltips ────────────────────────────────────────────────────── */
const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div style={{
      background: "#fff", border: "1px solid #e5e7eb",
      borderRadius: "10px", padding: "10px 14px",
      boxShadow: "0 4px 16px rgba(0,0,0,0.12)", fontSize: "13px", minWidth: "140px",
    }}>
      <p style={{ fontWeight: 700, marginBottom: 4, color: "#111827" }}>{d.fullBranchName || d.branchName || d.name}</p>
      <p style={{ color: getTierColor(d.pct), margin: "2px 0" }}>Progress: <b>{Number(d.pct).toFixed(1)}%</b></p>
      <p style={{ color: "#6b7280", margin: "2px 0" }}>{d.employees} Employees</p>
      <p style={{ color: "#ef4444", margin: "2px 0" }}>Overdue: <b>{d.overdue}</b></p>
    </div>
  );
};

const RevenueTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const formatNum = (num) => num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return (
    <div style={{
      background: "#fff", border: "1px solid #e5e7eb",
      borderRadius: "10px", padding: "10px 14px",
      boxShadow: "0 4px 16px rgba(0,0,0,0.12)", fontSize: "13px", minWidth: "140px",
    }}>
      <p style={{ fontWeight: 700, marginBottom: 4, color: "#111827" }}>{d.fullName}</p>
      <p style={{ color: "#a855f7", margin: "2px 0" }}>Target: <b>₹{formatNum(d.target)}</b></p>
      <p style={{ color: "#f59e0b", margin: "2px 0" }}>Achieved: <b>₹{formatNum(d.achieved)}</b></p>
      <p style={{ color: d.achieved >= d.target ? "#22c55e" : "#ef4444", margin: "4px 0 2px", fontWeight: 600 }}>
        {d.achieved >= d.target ? "On Track" : "At Risk"}
      </p>
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

const BranchTick = ({ x, y, payload }) => {
  const label = String(payload?.value || "");
  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        dy={14}
        textAnchor="end"
        transform="rotate(-28)"
        fontSize={9}
        fill="#9ca3af"
      >
        {label}
      </text>
    </g>
  );
};

/* ── Main component ──────────────────────────────────────────────────────── */
const HomeBar = () => {
  const [activeGraph, setActiveGraph] = useState("revenue"); // "training" or "revenue"
  const [filter, setFilter] = useState("all");
  const [responseData, setResponseData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [weeklyTargets, setWeeklyTargets] = useState({});
  const [branches, setBranches] = useState([]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setIsLoading(true);
      try {
        const data = await fetchHomeProgress();
        if (!mounted) return;
        setResponseData(data);
      } catch {
        if (!mounted) return;
        setResponseData(null);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    load();

    const refresh = () => load();
    window.addEventListener("dashboard:refresh", refresh);

    // Fetch branches and weekly targets
    try {
      const stored = localStorage.getItem("weeklyTargets");
      if (stored) {
        setWeeklyTargets(JSON.parse(stored));
      }
    } catch (e) {
      console.error(e);
    }

    const fetchBranches = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`http://localhost:5000/api/usercreate/getBranch`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) {
          const json = await res.json();
          const list = Array.isArray(json?.data) ? json.data : [];
          if (mounted) {
            setBranches(list.filter((b) => !isHiddenBranch(b?.workingBranch)));
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchBranches();

    return () => {
      mounted = false;
      window.removeEventListener("dashboard:refresh", refresh);
    };
  }, []);

  const allData = useMemo(
    () => normalizeBranchProgress(responseData),
    [responseData]
  );

  const realChartData = useMemo(() =>
    allData.map((obj) => {
      const pct = Number(obj.completeTraining ?? 0);
      const pendingPct = Number(obj.pendingTraining ?? 0);
      return {
        name:       obj.branchName || obj.branch || obj.locCode,
        branchName: obj.shortBranchName || obj.branchName || obj.locCode,
        fullBranchName: obj.branchName || obj.locCode,
        pct: Number.isFinite(pct) ? Math.max(0, Math.min(100, pct)) : 0,
        pendingPct: Number.isFinite(pendingPct) ? Math.max(0, Math.min(100, pendingPct)) : 0,
        employees:  obj.totalEmployees || obj.employees || 0,
        overdue:    obj.overdueEmployeesCount || 0,
        tier:       getTierLabel(pct),
        color:      getTierColor(pct),
      };
    }), [allData]);

  const chartData = realChartData;

  const filtered = useMemo(() => {
    if (filter === "on-track")  return chartData.filter(d => d.tier === "on-track");
    if (filter === "at-risk")   return chartData.filter(d => d.tier === "at-risk" || d.tier === "needs-attention");
    return chartData;
  }, [chartData, filter]);

  /* ── Generate dynamic target vs achieved data for line chart ── */
  const revenueChartData = useMemo(() => {
    const isWtd = filter === "on-track"; // Use Tab state as a switcher or default MTD scale
    const scaleFactor = 1.0;
    
    const list = branches.length > 0
      ? branches.map((b, index) => {
          const name = displayBranchName(b.workingBranch);
          const shortName = name.replace(/^(Suitor Guy|SG|Z|G)\s+/i, "").substring(0, 5).toUpperCase();
          const mockItem = mockDSRDataForGraph[index % mockDSRDataForGraph.length];
          const rawAchieved = mockItem ? mockItem.achieved : 65000;
          
          const storeTargetObj = weeklyTargets[name] || {};
          let rawTarget = mockItem ? mockItem.target : 70000;
          
          const hasCustomWeeks = [1, 2, 3, 4].some(wId => storeTargetObj[wId] !== undefined);
          if (hasCustomWeeks) {
            let sum = 0;
            for (let wId = 1; wId <= 4; wId++) {
              if (storeTargetObj[wId] !== undefined) {
                sum += storeTargetObj[wId];
              } else {
                sum += Math.round(rawTarget * 0.23);
              }
            }
            rawTarget = sum;
          }

          const target = Math.round(rawTarget * scaleFactor);
          const achieved = Math.round(rawAchieved * scaleFactor);
          return {
            name: shortName,
            fullName: name,
            target,
            achieved
          };
        })
      : mockDSRDataForGraph.map((item) => {
          const name = item.name;
          const shortName = name.replace(/^(Suitor Guy|SG|Z|G)\s+/i, "").substring(0, 5).toUpperCase();
          const storeTargetObj = weeklyTargets[name] || {};
          let rawTarget = item.target;
          
          const hasCustomWeeks = [1, 2, 3, 4].some(wId => storeTargetObj[wId] !== undefined);
          if (hasCustomWeeks) {
            let sum = 0;
            for (let wId = 1; wId <= 4; wId++) {
              if (storeTargetObj[wId] !== undefined) {
                sum += storeTargetObj[wId];
              } else {
                sum += Math.round(rawTarget * 0.23);
              }
            }
            rawTarget = sum;
          }

          const target = Math.round(rawTarget * scaleFactor);
          const achieved = Math.round(item.achieved * scaleFactor);
          return {
            name: shortName,
            fullName: name,
            target,
            achieved
          };
        });
    return list;
  }, [branches, weeklyTargets, filter]);

  const filteredRevenue = useMemo(() => {
    if (filter === "on-track") return revenueChartData.filter(d => d.achieved >= d.target);
    if (filter === "at-risk") return revenueChartData.filter(d => d.achieved < d.target);
    return revenueChartData;
  }, [revenueChartData, filter]);

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

      {/* ── Row 1: Title + Switcher + Date button ── */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
          <div>
            <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#111827", margin: 0 }}>
              {activeGraph === "training" ? "Training Progress" : "Store Target Vs Achieved Target"}
            </h3>
            <p style={{ fontSize: "12px", color: "#9ca3af", margin: "2px 0 0" }}>
              {activeGraph === "training"
                ? `${today.toLocaleDateString("en-US", { month: "short", day: "numeric" })}, ${today.getFullYear()} | ${storeCount} Stores`
                : `June 01-27, 2026 | Comparison across ${revenueChartData.length} stores`
              }
            </p>
          </div>

          {/* Switcher Toggle Buttons */}
          <div style={{ display: "flex", background: "#f3f4f6", borderRadius: "10px", padding: "2.5px" }}>
            <button
              onClick={() => setActiveGraph("training")}
              style={{
                padding: "4px 12px", borderRadius: "8px", fontSize: "11px", fontWeight: 700,
                border: "none", cursor: "pointer",
                background: activeGraph === "training" ? "#fff" : "transparent",
                color: activeGraph === "training" ? "#111827" : "#6b7280",
                boxShadow: activeGraph === "training" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                transition: "all 0.15s"
              }}
            >
              Training Progress
            </button>
            <button
              onClick={() => setActiveGraph("revenue")}
              style={{
                padding: "4px 12px", borderRadius: "8px", fontSize: "11px", fontWeight: 700,
                border: "none", cursor: "pointer",
                background: activeGraph === "revenue" ? "#fff" : "transparent",
                color: activeGraph === "revenue" ? "#111827" : "#6b7280",
                boxShadow: activeGraph === "revenue" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                transition: "all 0.15s"
              }}
            >
              Store Target vs Achieved
            </button>
          </div>
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
          {activeGraph === "training" ? (
            <>
              <LegendPill color="#22c55e" label="≥85% On Track" />
              <LegendPill color="#3b82f6" label="65–84% In Progress" />
              <LegendPill color="#f59e0b" label="45–64% Needs Attention" />
              <LegendPill color="#ef4444" label="<45% At Risk" />
            </>
          ) : (
            <>
              <LegendPill color="#a855f7" label="Target" />
              <LegendPill color="#f59e0b" label="Achieved" />
            </>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <div style={{ display: "flex", background: "#f3f4f6", borderRadius: "8px", padding: "3px" }}>
            <Tab label="All"      active={filter === "all"}      onClick={() => setFilter("all")} />
            <Tab label="On Track" active={filter === "on-track"} onClick={() => setFilter("on-track")} />
            <Tab label="At Risk"  active={filter === "at-risk"}  onClick={() => setFilter("at-risk")} />
          </div>
          {activeGraph === "training" && (
            <button
              onClick={async () => {
                setIsLoading(false);
                try {
                  const data = await fetchHomeProgress();
                  setResponseData(data);
                } finally {
                  // completed refresh
                }
              }}
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
          )}
          
          <Link to={activeGraph === "training" ? "/training" : "/store-analysis/dsr-report"}>
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
        {activeGraph === "training" ? (
          isLoading ? (
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
                  dataKey="branchName"
                  tick={<BranchTick />}
                  axisLine={false}
                  tickLine={false}
                  interval={0}
                  height={70}
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
          )
        ) : (
          filteredRevenue.length === 0 ? (
            <div style={{ width: "100%", height: "280px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <p style={{ color: "#9ca3af", fontSize: "14px" }}>No store comparison data matching filters</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={filteredRevenue} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <defs>
                  <linearGradient id="colorTarget" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="colorAchieved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis 
                  dataKey="name" 
                  tick={<BranchTick />} 
                  interval={0}
                  axisLine={false}
                  tickLine={false}
                  height={60}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(tick) => `${tick / 1000}K`}
                  tick={{ fill: "#9ca3af", fontSize: 10 }}
                />
                <Tooltip content={<RevenueTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="target" 
                  stroke="#a855f7" 
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorTarget)" 
                  dot={{ r: 3, fill: "#fff", stroke: "#a855f7", strokeWidth: 2 }}
                  activeDot={{ r: 6 }}
                />
                <Area 
                  type="monotone" 
                  dataKey="achieved" 
                  stroke="#f59e0b" 
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorAchieved)" 
                  dot={{ r: 3, fill: "#fff", stroke: "#f59e0b", strokeWidth: 2 }}
                  activeDot={{ r: 6 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )
        )}
      </div>
    </div>
  );
};

export default HomeBar;
