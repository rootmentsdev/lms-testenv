import { useEffect, useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { dateKey } from "../../features/dashboard/dashboardUtils";
import { fetchWeeklyWalkins } from "../../features/dashboard/dashboardFetch";

const fmt = (d) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: "10px",
        padding: "10px 14px",
        boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
        fontSize: "13px",
      }}
    >
      <p style={{ fontWeight: 600, marginBottom: 4 }}>{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color, margin: "2px 0" }}>
          {p.dataKey === "walkings" ? "Walkings" : "Completed"} : <b>{p.value}</b>
        </p>
      ))}
    </div>
  );
};

const buildDays = (count) => {
  const totalDays = Math.max(1, Number(count) || 7);
  return Array.from({ length: totalDays }, (_, index) => {
    const d = new Date();
    d.setDate(d.getDate() - (totalDays - 1 - index));
    return d;
  });
};

const DailyWalkings = () => {
  const [activeIdx, setActiveIdx] = useState(null);
  const [walkinResponse, setWalkinResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [range, setRange] = useState("7");

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setIsLoading(true);
      try {
        const data = await fetchWeeklyWalkins(range);
        if (!mounted) return;
        setWalkinResponse(data);
      } catch {
        if (!mounted) return;
        setWalkinResponse(null);
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
  }, [range]);

  const days = useMemo(() => buildDays(range), [range]);
  const rangeLabel = `${fmt(days[0])} – ${fmt(days[days.length - 1])}, ${days[0].getFullYear()}`;

  const data = useMemo(() => {
    const walkins = walkinResponse?.data || [];
    const grouped = {};

    days.forEach((d) => {
      grouped[d.toISOString().split("T")[0]] = { walkings: 0, completed: 0 };
    });

    walkins.forEach((w) => {
      const key = dateKey(w.date || w.createdAt);
      if (key && grouped[key] !== undefined) {
        grouped[key].walkings += 1;
        if (w.status === "Completed" || w.status === "Booking") {
          grouped[key].completed += 1;
        }
      }
    });

    return days.map((d) => {
      const key = d.toISOString().split("T")[0];
      return { name: fmt(d), ...grouped[key] };
    });
  }, [walkinResponse, days]);

  return (
    <div
      style={{
        flex: "1 1 0",
        minWidth: 0,
        height: "380px",
        padding: "20px",
        borderRadius: "18px",
        borderWidth: "0.6px",
        borderStyle: "solid",
        borderColor: "#e5e7eb",
        background: "#fff",
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#111827", margin: 0 }}>Daily Walkings</h3>
          <p style={{ fontSize: "12px", color: "#9ca3af", margin: "2px 0 0" }}>{rangeLabel}</p>
        </div>

        <select
          value={range}
          onChange={(e) => setRange(e.target.value)}
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            padding: "6px 12px",
            fontSize: "13px",
            fontWeight: 500,
            color: "#374151",
            background: "#fff",
            cursor: "pointer",
            outline: "none",
          }}
        >
          <option value="7">Last 7 days</option>
          <option value="14">Last 14 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
        </select>
      </div>

      <div style={{ flex: 1, minHeight: 0 }}>
        {isLoading ? (
          <div
            style={{
              width: "100%",
              height: "100%",
              background: "#f9fafb",
              borderRadius: "10px",
              animation: "pulse 1.5s infinite",
            }}
          />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              onMouseMove={(e) => {
                if (e.activeTooltipIndex !== undefined) setActiveIdx(e.activeTooltipIndex);
              }}
              onMouseLeave={() => setActiveIdx(null)}
            >
              <CartesianGrid strokeDasharray="4 4" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={false} />
              {activeIdx !== null && data[activeIdx] && (
                <ReferenceLine x={data[activeIdx].name} stroke="#3b82f6" strokeWidth={1.5} strokeDasharray="0" />
              )}
              <Line
                type="monotone"
                dataKey="walkings"
                stroke="#3b82f6"
                strokeWidth={2.5}
                dot={{ r: 4, fill: "#3b82f6", strokeWidth: 0 }}
                activeDot={{ r: 6, fill: "#3b82f6" }}
              />
              <Line
                type="monotone"
                dataKey="completed"
                stroke="#22c55e"
                strokeWidth={2}
                dot={{ r: 3, fill: "#22c55e", strokeWidth: 0 }}
                activeDot={{ r: 5, fill: "#22c55e" }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default DailyWalkings;
