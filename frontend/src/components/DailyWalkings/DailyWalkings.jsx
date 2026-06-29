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
import { fetchDailyWalkinsChart } from "../../features/dashboard/dashboardFetch";

const fmt = (d) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });

const toDateInput = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

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
          {p.dataKey === "walkings" ? "Walkings" : "Loss"} : <b>{p.value}</b>
        </p>
      ))}
    </div>
  );
};

const buildDays = (range, startDate, endDate) => {
  if (range === "custom" && startDate && endDate) {
    const start = new Date(`${startDate}T00:00:00`);
    const end = new Date(`${endDate}T00:00:00`);
    const days = [];
    const cursor = new Date(start);
    while (cursor <= end) {
      days.push(new Date(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }
    return days;
  }

  const today = new Date();

  if (range === "month") {
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const days = [];
    const cursor = new Date(startOfMonth);
    while (cursor <= today) {
      days.push(new Date(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }
    return days;
  }

  const totalDays = Math.max(1, Number(range) || 7);

  if (totalDays === 7) {
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const days = [];
    const cursor = new Date(startOfWeek);
    while (cursor <= today) {
      days.push(new Date(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }
    return days;
  }

  return Array.from({ length: totalDays }, (_, index) => {
    const d = new Date();
    d.setDate(d.getDate() - (totalDays - 1 - index));
    return d;
  });
};

const DailyWalkings = ({ range = "7", customRange, onRangeChange, onCustomRangeChange }) => {
  const [activeIdx, setActiveIdx] = useState(null);
  const [walkinResponse, setWalkinResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setIsLoading(true);
      try {
        const data = await fetchDailyWalkinsChart({
          range,
          startDate: customRange?.startDate,
          endDate: customRange?.endDate,
        });
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
  }, [range, customRange?.startDate, customRange?.endDate]);

  const days = useMemo(() => buildDays(range, customRange?.startDate, customRange?.endDate), [
    range,
    customRange?.startDate,
    customRange?.endDate,
  ]);

  const rangeLabel = days.length ? `${fmt(days[0])} - ${fmt(days[days.length - 1])}, ${days[0].getFullYear()}` : "";

  const data = useMemo(() => {
    const series = new Map((walkinResponse?.data || []).map((row) => [row._id, row]));

    return days.map((d) => {
      const key = toDateInput(d);
      const row = series.get(key) || { walkings: 0, loss: 0 };
      return {
        name: fmt(d),
        walkings: Number(row.walkings || 0),
        loss: Number(row.loss || 0),
      };
    });
  }, [walkinResponse, days]);

  return (
    <div
      className="w-full lg:flex-1 min-w-0 bg-white dark:bg-[#111c2a] border border-[#e5e7eb] dark:border-slate-800"
      style={{
        height: "380px",
        padding: "20px",
        borderRadius: "18px",
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
        <div>
          <h3 className="text-[#111827] dark:text-[#f8fafc]" style={{ fontSize: "16px", fontWeight: 700, margin: 0 }}>Daily Walkings</h3>
          <p className="text-[#9ca3af] dark:text-[#94a3b8]" style={{ fontSize: "12px", margin: "2px 0 0" }}>{rangeLabel}</p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px" }}>
          <select
            value={range}
            onChange={(e) => onRangeChange?.(e.target.value)}
            className="border border-[#e5e7eb] dark:border-slate-800 bg-white dark:bg-[#162235] text-[#374151] dark:text-[#f8fafc] cursor-pointer outline-none"
            style={{
              borderRadius: "8px",
              padding: "6px 12px",
              fontSize: "13px",
              fontWeight: 500,
            }}
          >
            <option value="7">This week to date</option>
            <option value="month">This month till date</option>
            <option value="14">Last 14 days</option>
            <option value="30">Last 30 days</option>
            <option value="45">Last 45 days</option>
            <option value="custom">Custom range</option>
          </select>

          {range === "custom" && (
            <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap", justifyContent: "flex-end" }}>
              <input
                type="date"
                value={customRange?.startDate || ""}
                onChange={(e) => onCustomRangeChange?.({ ...(customRange || {}), startDate: e.target.value })}
                className="border border-[#e5e7eb] dark:border-slate-800 bg-white dark:bg-[#162235] text-[#374151] dark:text-[#f8fafc] outline-none"
                style={{ borderRadius: "8px", padding: "6px 10px", fontSize: "13px" }}
              />
              <span className="text-[#9ca3af] dark:text-[#94a3b8]" style={{ fontSize: "13px" }}>to</span>
              <input
                type="date"
                value={customRange?.endDate || ""}
                onChange={(e) => onCustomRangeChange?.({ ...(customRange || {}), endDate: e.target.value })}
                className="border border-[#e5e7eb] dark:border-slate-800 bg-white dark:bg-[#162235] text-[#374151] dark:text-[#f8fafc] outline-none"
                style={{ borderRadius: "8px", padding: "6px 10px", fontSize: "13px" }}
              />
              <button
                type="button"
                onClick={() => {
                  onCustomRangeChange?.({ startDate: "", endDate: "" });
                  onRangeChange?.("7");
                }}
                className="border border-[#e5e7eb] dark:border-slate-800 bg-white dark:bg-[#162235] text-[#374151] dark:text-[#f8fafc] cursor-pointer"
                style={{ borderRadius: "8px", padding: "6px 10px", fontSize: "13px" }}
              >
                Reset
              </button>
            </div>
          )}
        </div>
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
                dataKey="loss"
                stroke="#ef4444"
                strokeWidth={2.5}
                dot={{ r: 4, fill: "#ef4444", strokeWidth: 0 }}
                activeDot={{ r: 6, fill: "#ef4444" }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default DailyWalkings;
