import React, { useState, useEffect, useMemo } from "react";
import SideNav from "../../components/SideNav/SideNav";
import ModileNav from "../../components/SideNav/ModileNav";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { FiDownload } from "react-icons/fi";
import { FaStar, FaStarHalfAlt, FaRegStar, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import baseUrl from "../../api/api";

// ── Helpers & Constants ──────────────────────────────────────────────────
const BRAND_TOKENS = new Set(["zorucci", "grooms", "suitor", "guy", "sg"]);

const BRANCH_LOCATION_MAPPING = {
  "z-edapally1": "1",
  "z-edappally1": "1",
  "g-edappally": "3",
  "g-trivandrum": "5",
  "z- edappal": "6",
  "z.edappal": "6",
  "z.perinthalmanna": "7",
  "z.kottakkal": "8",
  "g.kottayam": "9",
  "g.perumbavoor": "10",
  "g.thrissur": "11",
  "g.chavakkad": "12",
  "g.calicut": "13",
  "g.vadakara": "14",
  "g.edappal": "15",
  "g.perinthalmanna": "16",
  "g.kottakkal": "17",
  "g.manjeri": "18",
  "g.palakkad": "19",
  "g.kalpetta": "20",
  "g.kannur": "21",
  "dappr squad": "25",
  "sg.edappally": "25",
  "sg.perumbavoor": "25",
  "crsrootments": "25"
};

function getBranchLocationId(workingBranch) {
  if (!workingBranch) return null;
  const normalized = String(workingBranch).trim().toLowerCase();
  return BRANCH_LOCATION_MAPPING[normalized] || null;
}

const runWithConcurrencyLimit = async (tasks, limit) => {
  const results = [];
  const executing = new Set();
  for (const task of tasks) {
    const p = Promise.resolve().then(() => task());
    results.push(p);
    executing.add(p);
    const clean = () => executing.delete(p);
    p.then(clean, clean);
    if (executing.size >= limit) {
      await Promise.race(executing);
    }
  }
  return Promise.all(results);
};

const getPerformanceCached = async (locId, startDate, endDate) => {
  const cacheKey = `perf_${locId}_${startDate}_${endDate}`;
  if (!window.__performanceCache) {
    window.__performanceCache = {};
  }
  
  if (window.__performanceCache[cacheKey]?.promise) {
    return window.__performanceCache[cacheKey].promise;
  }

  const promise = (async () => {
    try {
      const res = await fetch("https://rentalapi.rootments.live/api/Reports/GetPerformanceStaffReportWithCancel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          DateFrom: startDate,
          DateTo: endDate,
          BookingNo: "",
          LocationID: locId,
          UserID: "7777"
        })
      });
      if (res.ok) {
        const json = await res.json();
        const data = json.dataSet?.data || [];
        return data;
      }
    } catch (err) {
      console.error(`Error in getPerformanceCached for loc ${locId}:`, err);
    } finally {
      delete window.__performanceCache[cacheKey];
    }
    return [];
  })();

  window.__performanceCache[cacheKey] = {
    promise,
    timestamp: Date.now()
  };

  return promise;
};

const getStoreNameFromLocId = (locId) => {
  const branchKey = Object.keys(BRANCH_LOCATION_MAPPING).find(key => BRANCH_LOCATION_MAPPING[key] === locId);
  if (!branchKey) return "All";
  return displayBranchName(branchKey);
};

function getLocalDateString(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const CURRENT_MONTH_LONG = new Date().toLocaleString("en-US", { month: "long" });
const CURRENT_MONTH_SHORT = new Date().toLocaleString("en-US", { month: "short" });
const CURRENT_YEAR = new Date().getFullYear();

const getMonthNameFromDateStr = (dateStr) => {
  if (!dateStr) return CURRENT_MONTH_LONG;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return CURRENT_MONTH_LONG;
  return d.toLocaleString("en-US", { month: "long" });
};

const getYearFromDateStr = (dateStr) => {
  if (!dateStr) return CURRENT_YEAR;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return CURRENT_YEAR;
  return d.getFullYear();
};

const getTodayDateHeaderString = () => {
  const today = new Date();
  const day = today.getDate();
  const month = today.toLocaleString("en-US", { month: "short" });
  const year = today.getFullYear();
  const weekday = today.toLocaleString("en-US", { weekday: "long" });
  return `${day} ${month} ${year} | ${weekday}`;
};

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

function normalizeForMatch(str) {
  if (!str) return "";
  return String(str)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .replace(/^sg/, "g")
    .replace(/^dapper/, "dappr");
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

// Generate store abbreviation for X-axis labels
function getAbbreviation(fullName) {
  const normName = fullName.toLowerCase();
  let prefix = "";
  if (normName.includes("zorucci")) prefix = "Z-";
  else if (normName.includes("suitor guy") || normName.includes("sg")) prefix = "SG-";
  else if (normName.includes("grooms") || normName.startsWith("g ")) prefix = "G-";
  else if (normName.startsWith("z ")) prefix = "Z-";
  
  const clean = fullName
    .replace(/zorucci|suitor guy|grooms|sg|g\s+|z\s+/i, "")
    .trim()
    .toUpperCase();
  
  if (clean.includes("EDAPPALLY")) return prefix + "EDPLY";
  if (clean.includes("EDAPPAL")) return prefix + "EDPL";
  if (clean.includes("PERINTHALMANNA")) return prefix + "PRMNA";
  if (clean.includes("KOTTAKKAL")) return prefix + "KTKL";
  if (clean.includes("KOTTAYAM")) return prefix + "KTYM";
  if (clean.includes("PERUMBAVOOR")) return prefix + "PBVR";
  if (clean.includes("THRISSUR")) return prefix + "TSR";
  if (clean.includes("CHAVAKKAD")) return prefix + "CVND";
  if (clean.includes("CALICUT")) return prefix + "CLCT";
  if (clean.includes("VADAKARA")) return prefix + "VDKRA";
  if (clean.includes("PALAKKAD")) return prefix + "PLKD";
  if (clean.includes("MANJERI")) return prefix + "MNJRY";
  if (clean.includes("TRIVANDRUM")) return prefix + "TVM";
  if (clean.includes("KANNUR")) return prefix + "KNR";
  
  return prefix + clean.slice(0, 5);
}

// Sparkline Mock Paths
const sparklineUp = [
  { value: 30 }, { value: 45 }, { value: 40 }, { value: 65 }, { value: 58 }, { value: 85 }
];
const sparklineDown = [
  { value: 85 }, { value: 70 }, { value: 75 }, { value: 50 }, { value: 55 }, { value: 35 }
];

// Reusable Circular Progress Ring SVG matching user design
const CircularProgress = ({ percentage, benchmarkPercentage = 82 }) => {
  const radius = 42;
  const stroke = 6;
  
  // Outer progress ring (thick blue gradient arc)
  const outerRadius = 34;
  const outerCircumference = outerRadius * 2 * Math.PI; // ~213.6
  const maxLen = (280 / 360) * outerCircumference; // limit track to 280 degrees
  const outerStrokeDashoffset = outerCircumference - (percentage / 100) * maxLen;

  // Inner thin ring (with the benchmark text inside)
  const innerRadius = 20;

  return (
    <div className="relative flex items-center justify-center select-none shrink-0 ml-2">
      <svg height={radius * 2} width={radius * 2}>
        <defs>
          {/* Blue gradient matching the image */}
          <linearGradient id="blueProgressGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0d59b3" /> {/* Darker blue */}
            <stop offset="60%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#3b82f6" /> {/* Sky blue */}
          </linearGradient>
        </defs>

        {/* Thick track background (light gray/blue segment) */}
        <circle
          cx={radius}
          cy={radius}
          r={outerRadius}
          fill="none"
          stroke="#f1f5f9"
          strokeWidth={stroke}
          strokeDasharray={outerCircumference}
          strokeDashoffset={outerCircumference - maxLen}
          strokeLinecap="round"
          transform={`rotate(130 ${radius} ${radius})`}
        />

        {/* Thick progress arc (gradient, with rotation matching screenshot) */}
        <circle
          cx={radius}
          cy={radius}
          r={outerRadius}
          fill="none"
          stroke="url(#blueProgressGrad)"
          strokeWidth={stroke}
          strokeDasharray={outerCircumference}
          strokeDashoffset={outerStrokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(130 ${radius} ${radius})`}
          style={{ transition: "stroke-dashoffset 0.6s ease-in-out" }}
        />

        {/* Inner thin benchmark circle */}
        <circle
          cx={radius}
          cy={radius}
          r={innerRadius}
          fill="none"
          stroke="#3b82f6"
          strokeWidth="0.8"
        />

        {/* Inner text (actual value) */}
        <text
          x={radius}
          y={radius + 3}
          textAnchor="middle"
          className="text-[9px] font-extrabold"
          fill="#1f2937"
          style={{ fontFamily: "DM Sans, sans-serif" }}
        >
          {percentage}%
        </text>
      </svg>
    </div>
  );
};

// Reusable Sparkline area matching exact screenshot curve and arrow
const Sparkline = ({ type = "up", color = "#00A36C" }) => {
  const isUp = type === "up";
  
  // Exact path coordinates mapping: scaled horizontally to leave a 15% safety margin on the right
  const linePath = isUp 
    ? "M 0 38 L 20 26 L 36 31 L 51 16 L 69 16 L 85 7" 
    : "M 0 7 L 20 18 L 36 13 L 51 28 L 69 28 L 85 37";
  
  const areaPath = isUp
    ? "M 0 38 L 20 26 L 36 31 L 51 16 L 69 16 L 86 7 L 86 45 L 0 45 Z"
    : "M 0 7 L 20 18 L 36 13 L 51 28 L 69 28 L 86 37 L 86 45 L 0 45 Z";

  const gradId = isUp ? "greenSparklineGrad" : "redSparklineGrad";
  const markerId = isUp ? "arrow-green" : "arrow-red";

  return (
    <div className="h-[45px] w-[70px] sm:w-[80px] lg:w-[65px] xl:w-[75px] 2xl:w-[95px] shrink-0 select-none ml-2 mr-1">
      <svg viewBox="0 0 100 45" className="w-full h-full overflow-visible">
        <defs>
          <linearGradient id="greenSparklineGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#00A36C" stopOpacity={0.25} />
            <stop offset="100%" stopColor="#00A36C" stopOpacity={0.0} />
          </linearGradient>
          <linearGradient id="redSparklineGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#e11d48" stopOpacity={0.25} />
            <stop offset="100%" stopColor="#e11d48" stopOpacity={0.0} />
          </linearGradient>
          
          <marker
            id="arrow-green"
            viewBox="0 0 10 10"
            refX="4"
            refY="5"
            markerWidth="5"
            markerHeight="5"
            orient="auto"
          >
            <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#00A36C" />
          </marker>
          <marker
            id="arrow-red"
            viewBox="0 0 10 10"
            refX="4"
            refY="5"
            markerWidth="5"
            markerHeight="5"
            orient="auto"
          >
            <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#e11d48" />
          </marker>
        </defs>

        {/* Gradient fill area */}
        <path d={areaPath} fill={`url(#${gradId})`} />

        {/* Trend stroke path */}
        <path 
          d={linePath} 
          fill="none" 
          stroke={color} 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          markerEnd={`url(#${markerId})`} 
        />
      </svg>
    </div>
  );
};

// Helper to render stars rating
const StarRating = ({ rating }) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 !== 0;

  for (let i = 1; i <= 5; i++) {
    if (i <= fullStars) {
      stars.push(<FaStar key={i} className="text-amber-400 text-xs" />);
    } else if (i === fullStars + 1 && hasHalf) {
      stars.push(<FaStarHalfAlt key={i} className="text-amber-400 text-xs" />);
    } else {
      stars.push(<FaRegStar key={i} className="text-gray-300 text-xs" />);
    }
  }
  return <div className="flex items-center gap-0.5">{stars}</div>;
};

// ── Component ────────────────────────────────────────────────────────────
const StoreInsights = () => {
  // Page State
  const [isConsolidated, setIsConsolidated] = useState(true); // Consolidated vs Rental
  const [timeframe, setTimeframe] = useState("MTD"); // MTD, WTD, YTD, CUSTOM
  const [chartFilter, setChartFilter] = useState("All"); // All, On Track, At Risk
  const [roleFilter, setRoleFilter] = useState("Cluster");
  const [clusterFilter, setClusterFilter] = useState("All");
  const [rankingSearch, setRankingSearch] = useState("");
  const [rankingSort, setRankingSort] = useState("Best to Least");
  const [rankingPage, setRankingPage] = useState(1);
  
  // Custom Date Picker states
  const [customStartDate, setCustomStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return getLocalDateString(d);
  });
  const [customEndDate, setCustomEndDate] = useState(() => getLocalDateString(new Date()));

  // Target and performance fetch states
  const [weeklyTargets, setWeeklyTargets] = useState({});
  const [storeWeekRanges, setStoreWeekRanges] = useState({});
  const [performanceData, setPerformanceData] = useState({});
  const [lyPerformanceData, setLyPerformanceData] = useState({});
  const [loadingTargets, setLoadingTargets] = useState(false);
  const [loadingPerformance, setLoadingPerformance] = useState(false);
  const [walkins, setWalkins] = useState([]);
  const [lyWalkins, setLyWalkins] = useState([]);
  const [loadingWalkins, setLoadingWalkins] = useState(false);

  // Dynamic branches state
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch active branches dynamically
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${baseUrl.baseUrl}api/usercreate/getBranch`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) {
          const json = await res.json();
          const list = Array.isArray(json?.data) ? json.data : [];
          const visible = list.filter((b) => !isHiddenBranch(b?.workingBranch));
          setBranches(visible);
        }
      } catch (err) {
        console.error("Error fetching branches for Store Insights:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBranches();
  }, []);

  const getDaysCountInMonth = (monthName) => {
    const months = {
      January: 31, February: 28, March: 31, April: 30, May: 31, June: 30,
      July: 31, August: 31, September: 30, October: 31, November: 30, December: 31
    };
    return months[monthName] || 30;
  };

  const getCurrentWeekId = (storeName = "All", targetMonthName = CURRENT_MONTH_LONG) => {
    const today = new Date();
    const todayDateNum = today.getDate();
    
    let w1 = `01 - 10 ${CURRENT_MONTH_SHORT}`;
    let w2 = `11 - 17 ${CURRENT_MONTH_SHORT}`;
    let w3 = "Select Days";
    let w4 = "Select Days";

    if (storeName !== "All" && storeWeekRanges[storeName]?.[targetMonthName]) {
      const sr = storeWeekRanges[storeName][targetMonthName];
      if (sr[1]) w1 = sr[1];
      if (sr[2]) w2 = sr[2];
      if (sr[3]) w3 = sr[3];
      if (sr[4]) w4 = sr[4];
    }

    const parseRange = (val, weekId) => {
      let startDay = null;
      let endDay = null;
      if (val && val !== "Select Days") {
        const parts = val.split("-");
        if (parts.length === 2) {
          const s = parseInt(parts[0].trim(), 10);
          const ePart = parts[1].trim().split(" ")[0];
          const e = parseInt(ePart, 10);
          if (!isNaN(s) && !isNaN(e)) {
            startDay = s;
            endDay = e;
          }
        }
      }
      if (startDay === null || endDay === null) {
        if (weekId === 1) { startDay = 1; endDay = 10; }
        else if (weekId === 2) { startDay = 11; endDay = 17; }
        else if (weekId === 3) { startDay = 18; endDay = 24; }
        else { startDay = 25; endDay = getDaysCountInMonth(targetMonthName); }
      }
      return { startDay, endDay };
    };

    const weeks = [
      { id: 1, range: parseRange(w1, 1) },
      { id: 2, range: parseRange(w2, 2) },
      { id: 3, range: parseRange(w3, 3) },
      { id: 4, range: parseRange(w4, 4) }
    ];

    for (const w of weeks) {
      if (w.range.startDay !== null && w.range.endDay !== null) {
        if (todayDateNum >= w.range.startDay && todayDateNum <= w.range.endDay) {
          return w.id;
        }
      }
    }
    
    if (todayDateNum <= 10) return 1;
    if (todayDateNum <= 17) return 2;
    if (todayDateNum <= 24) return 3;
    return 4;
  };

  const getCustomRangeTarget = (storeName, startDateStr, endDateStr, targetMonthName) => {
    if (!startDateStr || !endDateStr) return 0;
    
    const start = new Date(startDateStr);
    const end = new Date(endDateStr);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
    
    const targetMonth = start.getMonth();
    
    let w1 = `01 - 10 ${CURRENT_MONTH_SHORT}`;
    let w2 = `11 - 17 ${CURRENT_MONTH_SHORT}`;
    let w3 = "Select Days";
    let w4 = "Select Days";
    
    if (storeName !== "All" && storeWeekRanges[storeName]?.[targetMonthName]) {
      const sr = storeWeekRanges[storeName][targetMonthName];
      if (sr[1]) w1 = sr[1];
      if (sr[2]) w2 = sr[2];
      if (sr[3]) w3 = sr[3];
      if (sr[4]) w4 = sr[4];
    }
    
    const parseRange = (val, weekId) => {
      let startDay = null;
      let endDay = null;
      if (val && val !== "Select Days") {
        const parts = val.split("-");
        if (parts.length === 2) {
          const s = parseInt(parts[0].trim(), 10);
          const ePart = parts[1].trim().split(" ")[0];
          const e = parseInt(ePart, 10);
          if (!isNaN(s) && !isNaN(e)) {
            startDay = s;
            endDay = e;
          }
        }
      }
      if (startDay === null || endDay === null) {
        if (weekId === 1) { startDay = 1; endDay = 10; }
        else if (weekId === 2) { startDay = 11; endDay = 17; }
        else if (weekId === 3) { startDay = 18; endDay = 24; }
        else { startDay = 25; endDay = getDaysCountInMonth(targetMonthName); }
      }
      return { startDay, endDay, count: (endDay - startDay + 1) };
    };
    
    const wRanges = {
      1: parseRange(w1, 1),
      2: parseRange(w2, 2),
      3: parseRange(w3, 3),
      4: parseRange(w4, 4),
    };
    
    const storeTargetObj = weeklyTargets[storeName]?.[targetMonthName] || {};
    let totalTarget = 0;
    
    let temp = new Date(start);
    while (temp <= end) {
      const dayNum = temp.getDate();
      const tempMonth = temp.getMonth();
      if (tempMonth === targetMonth) {
        let foundWeekId = null;
        for (let wId = 1; wId <= 4; wId++) {
          const r = wRanges[wId];
          if (dayNum >= r.startDay && dayNum <= r.endDay) {
            foundWeekId = wId;
            break;
          }
        }
        
        if (foundWeekId) {
          const targetW = storeTargetObj[foundWeekId] || 0;
          const daysInW = wRanges[foundWeekId].count || 7;
          totalTarget += targetW / daysInW;
        }
      }
      temp.setDate(temp.getDate() + 1);
    }
    
    return Math.round(totalTarget);
  };

  const getStoreTarget = (storeName, defaultTarget, activeTabVal, customFactorVal, targetMonthName = CURRENT_MONTH_LONG) => {
    const storeTargetObj = weeklyTargets[storeName]?.[targetMonthName] || {};
    
    if (activeTabVal === "MTD") {
      const hasCustomWeeks = [1, 2, 3, 4].some(wId => storeTargetObj[wId] !== undefined);
      if (!hasCustomWeeks) {
        return defaultTarget;
      }
      
      let sum = 0;
      for (let wId = 1; wId <= 4; wId++) {
        if (storeTargetObj[wId] !== undefined) {
          sum += storeTargetObj[wId];
        } else {
          sum += Math.round(defaultTarget * 0.23);
        }
      }
      return sum;
    }
    
    if (activeTabVal === "WTD") {
      const currentWeekId = getCurrentWeekId(storeName, targetMonthName); 
      if (storeTargetObj[currentWeekId] !== undefined) {
        return storeTargetObj[currentWeekId];
      }
      return Math.round(defaultTarget * 0.23);
    }

    if (activeTabVal === "CUSTOM") {
      return getCustomRangeTarget(storeName, customStartDate, customEndDate, targetMonthName);
    }
    
    return defaultTarget;
  };

  const getYTDStoreTarget = (storeName) => {
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const today = new Date();
    const currentMonthIdx = today.getMonth(); // 0 to 11
    
    let sum = 0;
    for (let i = 0; i <= currentMonthIdx; i++) {
      const monthName = monthNames[i];
      sum += getStoreTarget(storeName, 0, "MTD", 1.0, monthName);
    }
    return sum;
  };

  const getStoreWTDDateRange = (storeName = "All") => {
    const today = new Date();
    const todayStr = getLocalDateString(today);
    const todayDateNum = today.getDate();
    
    const activeWeekId = getCurrentWeekId(storeName);
    const monthName = CURRENT_MONTH_LONG;
    
    let w1 = `01 - 10 ${CURRENT_MONTH_SHORT}`;
    let w2 = `11 - 17 ${CURRENT_MONTH_SHORT}`;
    let w3 = "Select Days";
    let w4 = "Select Days";

    if (storeName !== "All" && storeWeekRanges[storeName]?.[monthName]) {
      const sr = storeWeekRanges[storeName][monthName];
      if (sr[1]) w1 = sr[1];
      if (sr[2]) w2 = sr[2];
      if (sr[3]) w3 = sr[3];
      if (sr[4]) w4 = sr[4];
    }

    let startDayNum = 1;
    const weekVal = activeWeekId === 1 ? w1 
                  : activeWeekId === 2 ? w2 
                  : activeWeekId === 3 ? w3 
                  : w4;
                  
    if (weekVal && weekVal !== "Select Days") {
      const parts = weekVal.split("-");
      if (parts.length === 2) {
        startDayNum = parseInt(parts[0].trim(), 10);
      }
    } else {
      if (activeWeekId === 1) startDayNum = 1;
      else if (activeWeekId === 2) startDayNum = 11;
      else if (activeWeekId === 3) startDayNum = 18;
      else startDayNum = 25;
    }
    
    const startDate = new Date(today.getFullYear(), today.getMonth(), startDayNum);
    return {
      start: getLocalDateString(startDate),
      end: todayStr
    };
  };

  const getMTDDateRangeString = () => {
    const today = new Date();
    const monthName = today.toLocaleString("en-US", { month: "long" });
    const day = String(today.getDate()).padStart(2, "0");
    const year = today.getFullYear();
    return `${monthName} 01-${day}, ${year}`;
  };

  const getWTDDateRangeString = () => {
    const today = new Date();
    const wtdRange = getStoreWTDDateRange("All");
    const startDate = new Date(wtdRange.start);
    const startMonth = startDate.toLocaleString("en-US", { month: "long" });
    const startDay = String(startDate.getDate()).padStart(2, "0");
    const endDay = String(today.getDate()).padStart(2, "0");
    const year = today.getFullYear();
    if (startDate.getMonth() === today.getMonth()) {
      return `${startMonth} ${startDay}-${endDay}, ${year}`;
    }
    const endMonth = today.toLocaleString("en-US", { month: "long" });
    return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${year}`;
  };

  const getYTDDateRangeString = () => {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, "0");
    const monthName = today.toLocaleString("en-US", { month: "long" });
    return `January 01 - ${monthName} ${day}, ${today.getFullYear()}`;
  };

  const getCustomDateRangeString = () => {
    if (!customStartDate || !customEndDate) return "Custom Range";
    const start = new Date(customStartDate);
    const end = new Date(customEndDate);
    const startMonth = start.toLocaleString("en-US", { month: "long" });
    const startDay = String(start.getDate()).padStart(2, "0");
    const startYear = start.getFullYear();
    const endMonth = end.toLocaleString("en-US", { month: "long" });
    const endDay = String(end.getDate()).padStart(2, "0");
    const endYear = end.getFullYear();

    if (startYear !== endYear) {
      return `${startMonth} ${startDay}, ${startYear} - ${endMonth} ${endDay}, ${endYear}`;
    }
    if (startMonth === endMonth) {
      return `${startMonth} ${startDay}-${endDay}, ${startYear}`;
    }
    return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${startYear}`;
  };

  // Fetch targets once on mount for the current year
  useEffect(() => {
    const fetchTargets = async () => {
      setLoadingTargets(true);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${baseUrl.baseUrl}api/store-targets?year=${CURRENT_YEAR}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        });
        if (res.ok) {
          const json = await res.json();
          const list = Array.isArray(json?.data) ? json.data : [];
          
          const targetsMap = {};
          const rangesMap = {};
          list.forEach((t) => {
            const store = t.storeName;
            const month = t.month;
            if (!targetsMap[store]) targetsMap[store] = {};
            if (!rangesMap[store]) rangesMap[store] = {};
            targetsMap[store][month] = t.weeklyTargets || {};
            rangesMap[store][month] = t.weekRanges || {};
          });
          setWeeklyTargets(targetsMap);
          setStoreWeekRanges(rangesMap);
        }
      } catch (err) {
        console.error("Error fetching targets in StoreInsights:", err);
      } finally {
        setLoadingTargets(false);
      }
    };
    fetchTargets();
  }, []);

  // Fetch performance whenever timeframe or custom dates or branches list changes
  useEffect(() => {
    const fetchPerformance = async () => {
      setLoadingPerformance(true);
      try {
        const today = new Date();
        const todayStr = getLocalDateString(today);
        
        let periodStart = todayStr;
        let periodEnd = todayStr;
        
        if (timeframe === "WTD") {
          const wtdRange = getStoreWTDDateRange("All");
          periodStart = wtdRange.start;
          periodEnd = wtdRange.end;
        } else if (timeframe === "MTD") {
          periodStart = getLocalDateString(new Date(today.getFullYear(), today.getMonth(), 1));
          periodEnd = todayStr;
        } else if (timeframe === "YTD") {
          periodStart = getLocalDateString(new Date(today.getFullYear(), 0, 1));
          periodEnd = todayStr;
        } else if (timeframe === "CUSTOM") {
          periodStart = customStartDate || todayStr;
          periodEnd = customEndDate || todayStr;
        }

        const locationIds = ["1", "3", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "25"];

        const tasks = locationIds.map((locId) => async () => {
          let storePeriodStart = periodStart;
          let storePeriodEnd = periodEnd;
          
          if (timeframe === "WTD") {
            const storeName = getStoreNameFromLocId(locId);
            const wtdRange = getStoreWTDDateRange(storeName);
            storePeriodStart = wtdRange.start;
            storePeriodEnd = wtdRange.end;
          }

          const data = await getPerformanceCached(locId, storePeriodStart, storePeriodEnd);
          return { locId, data };
        });

        const results = await runWithConcurrencyLimit(tasks, 4);
        const map = {};
        results.forEach(r => {
          map[r.locId] = r.data;
        });
        setPerformanceData(map);

        // Fetch last year performance data shifted by exactly 1 year
        const shiftDateYear = (dateStr, years = -1) => {
          if (!dateStr) return "";
          const d = new Date(dateStr);
          if (isNaN(d.getTime())) return "";
          d.setFullYear(d.getFullYear() + years);
          return getLocalDateString(d);
        };
        const lyPeriodStart = shiftDateYear(periodStart, -1);
        const lyPeriodEnd = shiftDateYear(periodEnd, -1);

        const lyTasks = locationIds.map((locId) => async () => {
          let storePeriodStart = lyPeriodStart;
          let storePeriodEnd = lyPeriodEnd;
          
          if (timeframe === "WTD") {
            const storeName = getStoreNameFromLocId(locId);
            const wtdRange = getStoreWTDDateRange(storeName);
            storePeriodStart = shiftDateYear(wtdRange.start, -1);
            storePeriodEnd = shiftDateYear(wtdRange.end, -1);
          }

          const data = await getPerformanceCached(locId, storePeriodStart, storePeriodEnd);
          return { locId, data };
        });

        const lyResults = await runWithConcurrencyLimit(lyTasks, 4);
        const lyMap = {};
        lyResults.forEach(r => {
          lyMap[r.locId] = r.data;
        });
        setLyPerformanceData(lyMap);

      } catch (err) {
        console.error("Error in fetchPerformance for StoreInsights:", err);
      } finally {
        setLoadingPerformance(false);
      }
    };

    fetchPerformance();
  }, [timeframe, customStartDate, customEndDate, branches]);

  // Fetch walkins dynamically based on timeframe range
  useEffect(() => {
    const fetchWalkins = async () => {
      setLoadingWalkins(true);
      try {
        const token = localStorage.getItem("token");
        const today = new Date();
        const todayStr = getLocalDateString(today);
        
        let periodStart = todayStr;
        let periodEnd = todayStr;
        if (timeframe === "WTD") {
          const wtdRange = getStoreWTDDateRange("All");
          periodStart = wtdRange.start;
          periodEnd = wtdRange.end;
        } else if (timeframe === "MTD") {
          periodStart = getLocalDateString(new Date(today.getFullYear(), today.getMonth(), 1));
          periodEnd = todayStr;
        } else if (timeframe === "YTD") {
          periodStart = getLocalDateString(new Date(today.getFullYear(), 0, 1));
          periodEnd = todayStr;
        } else if (timeframe === "CUSTOM") {
          periodStart = customStartDate || todayStr;
          periodEnd = customEndDate || todayStr;
        }

        const fetchStart = periodStart < todayStr ? periodStart : todayStr;
        const fetchEnd = periodEnd > todayStr ? periodEnd : todayStr;

        const res = await fetch(`${baseUrl.baseUrl}api/walkin/list?startDate=${fetchStart}&endDate=${fetchEnd}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) {
          const json = await res.json();
          const list = Array.isArray(json?.data) ? json.data : [];
          setWalkins(list);
        }

        // Fetch last year walkins
        const shiftDateYear = (dateStr, years = -1) => {
          if (!dateStr) return "";
          const d = new Date(dateStr);
          if (isNaN(d.getTime())) return "";
          d.setFullYear(d.getFullYear() + years);
          return getLocalDateString(d);
        };
        const lyFetchStart = shiftDateYear(fetchStart, -1);
        const lyFetchEnd = shiftDateYear(fetchEnd, -1);

        const lyRes = await fetch(`${baseUrl.baseUrl}api/walkin/list?startDate=${lyFetchStart}&endDate=${lyFetchEnd}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (lyRes.ok) {
          const json = await lyRes.json();
          const list = Array.isArray(json?.data) ? json.data : [];
          setLyWalkins(list);
        }
      } catch (err) {
        console.error("Error fetching walkins for StoreInsights:", err);
      } finally {
        setLoadingWalkins(false);
      }
    };
    fetchWalkins();
  }, [timeframe, customStartDate, customEndDate]);

  // Format values to match Indian standard layout (e.g. 5,28,080.42)
  const formatIndianNumber = (num, decimals = 0) => {
    const isNegative = num < 0;
    const absNum = Math.abs(num);
    const parts = absNum.toFixed(decimals).split(".");
    let integerPart = parts[0];
    const decimalPart = parts[1] ? "." + parts[1] : "";

    let lastThree = integerPart.substring(integerPart.length - 3);
    const otherNumbers = integerPart.substring(0, integerPart.length - 3);
    if (otherNumbers !== "") {
      lastThree = "," + lastThree;
    }
    const res = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
    return (isNegative ? "-" : "") + res + decimalPart;
  };

  // Switcher Multiplier (changes values realistically based on MTD/WTD/YTD & Consolidated/Rental)
  const multipliers = useMemo(() => {
    let tfMult = 1.0;
    if (timeframe === "WTD") tfMult = 0.23;
    else if (timeframe === "YTD") tfMult = 8.4;
    else if (timeframe === "CUSTOM") tfMult = 0.65;

    let typeMult = isConsolidated ? 1.0 : 0.85;

    return tfMult * typeMult;
  }, [timeframe, isConsolidated]);

  // Generate dynamic chart data based on branches
  const chartData = useMemo(() => {
    const defaultStores = [
      { name: "Z Edappally", target: 72000, achieved: 68000 },
      { name: "G Edappally", target: 68000, achieved: 76000 },
      { name: "Z Edappal", target: 58000, achieved: 52000 },
      { name: "Z Perinthalmanna", target: 64000, achieved: 62000 },
      { name: "Z Kottakkal", target: 56000, achieved: 68000 },
      { name: "G Kottayam", target: 69000, achieved: 42000 },
      { name: "G Perumbavoor", target: 71000, achieved: 32000 },
      { name: "G Thrissur", target: 64000, achieved: 38000 },
      { name: "G Chavakkad", target: 58000, achieved: 34000 },
      { name: "G Calicut", target: 60000, achieved: 32000 },
      { name: "Grooms Vadakara", target: 78000, achieved: 52432.4 },
      { name: "G Edapaly", target: 75000, achieved: 62000 },
      { name: "G Perinthalmanna", target: 72000, achieved: 41000 },
      { name: "G Kottakkal", target: 69000, achieved: 36000 },
      { name: "G Manjeri", target: 74000, achieved: 48000 },
      { name: "G Palakkad", target: 82000, achieved: 51000 }
    ];

    if (isConsolidated) {
      const source = branches.length > 0 
        ? branches.map((b, idx) => {
            const name = displayBranchName(b?.workingBranch);
            const defaultItem = defaultStores[idx % defaultStores.length];
            return {
              name,
              target: (defaultItem?.target || 70000) * multipliers,
              achieved: (defaultItem?.achieved || 55000) * multipliers
            };
          })
        : defaultStores.map(s => ({
            name: s.name,
            target: s.target * multipliers,
            achieved: s.achieved * multipliers
          }));

      return source.map(item => {
        const pct = item.target > 0 ? (item.achieved / item.target) * 100 : 0;
        return {
          ...item,
          abbr: getAbbreviation(item.name),
          pct,
          balance: item.target - item.achieved
        };
      });
    } else {
      let customFactor = 1.0;
      if (timeframe === "CUSTOM") {
        const start = new Date(customStartDate);
        const end = new Date(customEndDate);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        customFactor = isNaN(diffDays) ? 1.0 : diffDays / 30.0;
      }

      const list = branches.map((b) => {
        const name = displayBranchName(b.workingBranch);
        const locId = getBranchLocationId(b.workingBranch);
        
        let target = 0;
        if (timeframe === "YTD") {
          target = getYTDStoreTarget(name);
        } else {
          const targetMonth = timeframe === "CUSTOM" ? getMonthNameFromDateStr(customStartDate) : CURRENT_MONTH_LONG;
          target = getStoreTarget(name, 0, timeframe === "CUSTOM" ? "CUSTOM" : timeframe, customFactor, targetMonth);
        }
        
        const locPeriodList = performanceData[locId] || [];
        const achieved = locPeriodList.reduce((sum, item) => sum + (item.totalValue || 0), 0);

        const balance = target - achieved;
        const pct = target > 0 ? Math.min(Math.round((achieved / target) * 100), 100) : 0;
        return { name, target, achieved, balance, pct, abbr: getAbbreviation(name) };
      });
      return list;
    }
  }, [branches, multipliers, isConsolidated, timeframe, customStartDate, customEndDate, weeklyTargets, performanceData]);

  // Filtered chart data based on classification (All, On Track, At Risk)
  const filteredChartData = useMemo(() => {
    if (chartFilter === "On Track") {
      return chartData.filter(item => item.pct >= 90);
    }
    if (chartFilter === "At Risk") {
      return chartData.filter(item => item.pct < 90);
    }
    return chartData;
  }, [chartData, chartFilter]);

  // Filter stores by cluster if selected
  const filteredStoresForKPIs = useMemo(() => {
    let list = chartData;
    if (clusterFilter === "Kochi") {
      list = chartData.filter(s => s.name.toLowerCase().includes("kochi") || s.name.toLowerCase().includes("edap"));
    } else if (clusterFilter === "Calicut") {
      list = chartData.filter(s => s.name.toLowerCase().includes("calicut"));
    } else if (clusterFilter === "South-Javad") {
      list = chartData.filter(s => 
        s.name.toLowerCase().includes("kottakkal") || 
        s.name.toLowerCase().includes("kottayam") || 
        s.name.toLowerCase().includes("thrissur") || 
        s.name.toLowerCase().includes("chavakkad") || 
        s.name.toLowerCase().includes("vadakara") ||
        s.name.toLowerCase().includes("perumbavoor")
      );
    }
    return list;
  }, [chartData, clusterFilter]);

  // Dynamic KPI Card Data
  const stats = useMemo(() => {
    // Totals from filtered stores
    const totalTarget = filteredStoresForKPIs.reduce((acc, c) => acc + c.target, 0);
    const totalAchieved = filteredStoresForKPIs.reduce((acc, c) => acc + c.achieved, 0);
    const achievedPct = totalTarget > 0 ? Math.min(Math.round((totalAchieved / totalTarget) * 100), 100) : 0;

    // Scale other count metrics proportionally to the number of filtered stores vs total stores
    const ratio = chartData.length > 0 ? filteredStoresForKPIs.length / chartData.length : 1;
    
    // Customize stats based on selected role as well
    const roleMultiplier = roleFilter === "Store Admin" ? 0.35 : (roleFilter === "Admin" ? 0.85 : 1.0);

    const shiftDateYear = (dateStr, years = -1) => {
      if (!dateStr) return "";
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return "";
      d.setFullYear(d.getFullYear() + years);
      return getLocalDateString(d);
    };

    if (isConsolidated) {
      return {
        achievedPct,
        targetValue: totalTarget * 1.08 * roleMultiplier,
        achievedValue: totalAchieved * roleMultiplier,
        billsGenerated: Math.round(1234 * multipliers * ratio * roleMultiplier),
        quantitySold: Math.round(2486 * multipliers * ratio * roleMultiplier),
        basketSize: (3.2).toFixed(1),
        basketValue: 3230.75 * 1.0,
        customerWalkins: Math.round(2850 * multipliers * ratio * roleMultiplier),
        conversionRate: 79,
        convertedWalkins: Math.round(2258 * multipliers * ratio * roleMultiplier),
        shoeSale: Math.round(320 * multipliers * ratio * roleMultiplier),
        shirtSales: Math.round(76 * multipliers * ratio * roleMultiplier),
        dapprSquadBills: Math.round(85 * multipliers * ratio * roleMultiplier),
        dapprSquadValue: 28230.75 * multipliers * ratio * roleMultiplier,
        googleReviews: Math.round(50 * ratio),
        googleRating: 3.6,
        
        // Mock consolidated change metrics
        valChangeDisplay: "+12%", valChangeColor: "text-emerald-600", valTrend: "up", valTrendColor: "#00A36C",
        billsChangeDisplay: "-8%", billsChangeColor: "text-rose-500", billsTrend: "down", billsTrendColor: "#e11d48",
        qtyChangeDisplay: "-4%", qtyChangeColor: "text-rose-500", qtyTrend: "down", qtyTrendColor: "#e11d48",
        absChangeDisplay: "-6%", absChangeColor: "text-rose-500", absTrend: "down", absTrendColor: "#e11d48",
        abvChangeDisplay: "+12%", abvChangeColor: "text-emerald-600", abvTrend: "up", abvTrendColor: "#00A36C",
        walkChangeDisplay: "-14%", walkChangeColor: "text-rose-500", walkTrend: "down", walkTrendColor: "#e11d48"
      };
    } else {
      // Aggregate bills/qty from ALL fetched location IDs directly from performanceData
      // This avoids the name→locId mapping gaps (e.g. loc 25 not in branch list)
      let billsGenerated = 0;
      let quantitySold = 0;
      let trueTotalAchieved = 0;

      const allFetchedLocIds = Object.keys(performanceData);
      const isAllClusters = clusterFilter === "All" || !clusterFilter;

      if (isAllClusters) {
        // Sum across ALL fetched locations using created bills (not net) for accurate count
        allFetchedLocIds.forEach(locId => {
          const locPeriodList = performanceData[locId] || [];
          // Use created_Number_Of_Bill so cancellation stores (like G.Perinthalmanna) don't reduce the total
          const storeBills = locPeriodList.reduce((sum, item) => sum + (item.created_Number_Of_Bill || 0), 0);
          const storeQty = locPeriodList.reduce((sum, item) => sum + (item.createdQuantity ?? item.totalQuantity ?? 0), 0);
          const storeVal = locPeriodList.reduce((sum, item) => sum + (item.totalValue || 0), 0);
          billsGenerated += Math.max(0, storeBills);
          quantitySold += Math.max(0, storeQty);
          trueTotalAchieved += storeVal;
        });
      } else {
        // Only sum locations that belong to the filtered cluster
        filteredStoresForKPIs.forEach(c => {
          const name = c.name;
          const locId = getBranchLocationId(name);
          if (!locId) return;
          const locPeriodList = performanceData[locId] || [];
          billsGenerated += Math.max(0, locPeriodList.reduce((sum, item) => sum + (item.created_Number_Of_Bill || 0), 0));
          quantitySold += Math.max(0, locPeriodList.reduce((sum, item) => sum + (item.createdQuantity ?? item.totalQuantity ?? 0), 0));
          trueTotalAchieved += locPeriodList.reduce((sum, item) => sum + (item.totalValue || 0), 0);
        });
      }

      const trueAchievedPct = totalTarget > 0 ? Math.min(Math.round((trueTotalAchieved / totalTarget) * 100), 100) : 0;

      const today = new Date();
      const todayStr = getLocalDateString(today);
      
      let periodStart = todayStr;
      let periodEnd = todayStr;
      if (timeframe === "WTD") {
        const wtdRange = getStoreWTDDateRange("All");
        periodStart = wtdRange.start;
        periodEnd = wtdRange.end;
      } else if (timeframe === "MTD") {
        periodStart = getLocalDateString(new Date(today.getFullYear(), today.getMonth(), 1));
        periodEnd = todayStr;
      } else if (timeframe === "YTD") {
        periodStart = getLocalDateString(new Date(today.getFullYear(), 0, 1));
        periodEnd = todayStr;
      } else if (timeframe === "CUSTOM") {
        periodStart = customStartDate || todayStr;
        periodEnd = customEndDate || todayStr;
      }

      let customerWalkins = 0;
      filteredStoresForKPIs.forEach(c => {
        const storeKeyVal = normalizeForMatch(c.name);
        const storeWalkins = walkins.filter(w => {
          const matchBranch = normalizeForMatch(w.branch) === storeKeyVal;
          const wDate = w.date ? w.date.split(" ")[0] : "";
          return matchBranch && wDate >= periodStart && wDate <= periodEnd;
        });
        customerWalkins += storeWalkins.length;
      });

      const convertedWalkins = billsGenerated;
      const conversionRate = customerWalkins > 0 ? Math.min(100, Math.round((convertedWalkins / customerWalkins) * 100)) : 0;

      const basketSize = billsGenerated > 0 ? (quantitySold / billsGenerated).toFixed(1) : "0.0";
      const basketValue = billsGenerated > 0 ? Math.round(trueTotalAchieved / billsGenerated) : 0;

      let dapprSquadBills = 0;
      let dapprSquadValue = 0;
      const squadPeriodList = performanceData["25"] || [];
      filteredStoresForKPIs.forEach(c => {
        const storeKeyVal = normalizeForMatch(c.name);
        const storePeriodItem = squadPeriodList.find(x => normalizeForMatch(x.bookingBy) === storeKeyVal) || {};
        dapprSquadBills += storePeriodItem.total_Number_Of_Bill || 0;
        dapprSquadValue += storePeriodItem.totalValue || 0;
      });

      // Calculate last year's metrics for comparison
      let lyBillsGenerated = 0;
      let lyQuantitySold = 0;
      let lyTotalAchieved = 0;

      const allLyFetchedLocIds = Object.keys(lyPerformanceData);
      if (isAllClusters) {
        allLyFetchedLocIds.forEach(locId => {
          const locPeriodList = lyPerformanceData[locId] || [];
          lyBillsGenerated += Math.max(0, locPeriodList.reduce((sum, item) => sum + (item.total_Number_Of_Bill || 0), 0));
          lyQuantitySold += Math.max(0, locPeriodList.reduce((sum, item) => sum + (item.totalQuantity || 0), 0));
          lyTotalAchieved += locPeriodList.reduce((sum, item) => sum + (item.totalValue || 0), 0);
        });
      } else {
        filteredStoresForKPIs.forEach(c => {
          const name = c.name;
          const locId = getBranchLocationId(name);
          if (!locId) return;
          const locPeriodList = lyPerformanceData[locId] || [];
          lyBillsGenerated += Math.max(0, locPeriodList.reduce((sum, item) => sum + (item.total_Number_Of_Bill || 0), 0));
          lyQuantitySold += Math.max(0, locPeriodList.reduce((sum, item) => sum + (item.totalQuantity || 0), 0));
          lyTotalAchieved += locPeriodList.reduce((sum, item) => sum + (item.totalValue || 0), 0);
        });
      }

      const lyPeriodStart = shiftDateYear(periodStart, -1);
      const lyPeriodEnd = shiftDateYear(periodEnd, -1);

      let lyCustomerWalkins = 0;
      filteredStoresForKPIs.forEach(c => {
        const storeKeyVal = normalizeForMatch(c.name);
        const storeWalkins = lyWalkins.filter(w => {
          const matchBranch = normalizeForMatch(w.branch) === storeKeyVal;
          const wDate = w.date ? w.date.split(" ")[0] : "";
          return matchBranch && wDate >= lyPeriodStart && wDate <= lyPeriodEnd;
        });
        lyCustomerWalkins += storeWalkins.length;
      });

      const lyBasketSize = lyBillsGenerated > 0 ? parseFloat((lyQuantitySold / lyBillsGenerated).toFixed(1)) : 0.0;
      const lyBasketValue = lyBillsGenerated > 0 ? Math.round(lyTotalAchieved / lyBillsGenerated) : 0;

      const getChangeStats = (curr, prev) => {
        const change = prev > 0 ? Math.round(((curr - prev) / prev) * 100) : 0;
        return {
          display: change >= 0 ? `+${change}%` : `${change}%`,
          color: change >= 0 ? "text-emerald-600" : "text-rose-500",
          trend: change >= 0 ? "up" : "down",
          trendColor: change >= 0 ? "#00A36C" : "#e11d48"
        };
      };

      const valChange = getChangeStats(trueTotalAchieved * roleMultiplier, lyTotalAchieved * roleMultiplier);
      const billsChange = getChangeStats(billsGenerated * roleMultiplier, lyBillsGenerated * roleMultiplier);
      const qtyChange = getChangeStats(quantitySold * roleMultiplier, lyQuantitySold * roleMultiplier);
      const absChange = getChangeStats(parseFloat(basketSize), lyBasketSize);
      const abvChange = getChangeStats(basketValue, lyBasketValue);
      const walkChange = getChangeStats(customerWalkins * roleMultiplier, lyCustomerWalkins * roleMultiplier);

      // Google rating - read from MongoDB or stable defaults
      const googleReviews = Math.round(14 * ratio);
      const googleRating = 3.6;

      return {
        achievedPct: trueAchievedPct,
        targetValue: totalTarget * roleMultiplier,
        achievedValue: trueTotalAchieved * roleMultiplier,
        billsGenerated: billsGenerated * roleMultiplier,
        quantitySold: quantitySold * roleMultiplier,
        basketSize,
        basketValue,
        customerWalkins: customerWalkins * roleMultiplier,
        conversionRate,
        convertedWalkins: convertedWalkins * roleMultiplier,
        shoeSale: 0,
        shirtSales: 0,
        dapprSquadBills,
        dapprSquadValue,
        googleReviews,
        googleRating,
        
        // Dynamic Rental change metrics
        valChangeDisplay: valChange.display, valChangeColor: valChange.color, valTrend: valChange.trend, valTrendColor: valChange.trendColor,
        billsChangeDisplay: billsChange.display, billsChangeColor: billsChange.color, billsTrend: billsChange.trend, billsTrendColor: billsChange.trendColor,
        qtyChangeDisplay: qtyChange.display, qtyChangeColor: qtyChange.color, qtyTrend: qtyChange.trend, qtyTrendColor: qtyChange.trendColor,
        absChangeDisplay: absChange.display, absChangeColor: absChange.color, absTrend: absChange.trend, absTrendColor: absChange.trendColor,
        abvChangeDisplay: abvChange.display, abvChangeColor: abvChange.color, abvTrend: abvChange.trend, abvTrendColor: abvChange.trendColor,
        walkChangeDisplay: walkChange.display, walkChangeColor: walkChange.color, walkTrend: walkChange.trend, walkTrendColor: walkChange.trendColor
      };
    }
  }, [chartData, filteredStoresForKPIs, multipliers, isConsolidated, roleFilter, performanceData, lyPerformanceData, walkins, lyWalkins, timeframe, customStartDate, customEndDate]);

  // Store ranking data calculations
  const rankingData = useMemo(() => {
    const defaultStores = [
      { name: "Zorucci Edappally", targetAchieved: 96, contribution: 96, abs: 2.3, abv: 2200, conversion: 87 },
      { name: "Suitor Guy Edappally", targetAchieved: 92, contribution: 96, abs: 3.2, abv: 3124, conversion: 85 },
      { name: "Suitor Guy Trivandrum", targetAchieved: 90, contribution: 96, abs: 2.6, abv: 3243, conversion: 90 },
      { name: "Suitor Guy Vadakara", targetAchieved: 86, contribution: 96, abs: 3.1, abv: 2020, conversion: 94 },
      { name: "Zorucci Perinthalmanna", targetAchieved: 84, contribution: 96, abs: 2.8, abv: 2811, conversion: 79 },
      { name: "Suitor Guy Manjeri", targetAchieved: 83, contribution: 96, abs: 3.4, abv: 2429, conversion: 81 }
    ];

    if (isConsolidated) {
      if (branches.length > 0) {
        return branches.map((b, idx) => {
          const name = displayBranchName(b?.workingBranch);
          const pctSeed = 80 + ((idx * 7) % 18);
          const abvSeed = 2000 + ((idx * 150) % 1500); 
          const conversionSeed = 75 + ((idx * 4) % 21);
          const absSeed = (2.0 + ((idx * 0.3) % 1.5)).toFixed(1);

          return {
            name,
            targetAchieved: pctSeed,
            contribution: 96,
            abs: absSeed,
            abv: abvSeed,
            conversion: conversionSeed
          };
        });
      }
      return defaultStores;
    } else {
      return chartData.map((item, idx) => {
        const conversionSeed = 75 + ((idx * 4) % 21);
        const absSeed = (2.0 + ((item.pct * 0.03) % 1.5)).toFixed(1);
        const abvSeed = item.achieved > 0 ? Math.round(item.achieved / (10 + (idx % 5))) : 1800;
        return {
          name: item.name,
          targetAchieved: Math.round(item.pct),
          contribution: 96,
          abs: absSeed,
          abv: abvSeed,
          conversion: conversionSeed
        };
      });
    }
  }, [branches, chartData, isConsolidated]);

  const processedRanking = useMemo(() => {
    let result = [...rankingData];
    
    if (rankingSearch.trim()) {
      const q = rankingSearch.toLowerCase();
      result = result.filter(s => s.name.toLowerCase().includes(q));
    }
    
    result.sort((a, b) => {
      if (rankingSort === "Best to Least") {
        return b.targetAchieved - a.targetAchieved;
      } else {
        return a.targetAchieved - b.targetAchieved;
      }
    });
    
    return result;
  }, [rankingData, rankingSearch, rankingSort]);

  const itemsPerPageRanking = 6;
  const totalRankingItems = processedRanking.length;
  
  const paginatedRanking = useMemo(() => {
    const start = (rankingPage - 1) * itemsPerPageRanking;
    return processedRanking.slice(start, start + itemsPerPageRanking);
  }, [processedRanking, rankingPage]);

  return (
    <div className="flex w-full min-h-screen bg-[#f3f4f6] text-gray-800 animate-fadeIn" style={{ fontFamily: "DM Sans, sans-serif" }}>
      {/* SideNav desktop */}
      <SideNav />
      
      {/* Mobile navigation */}
      <div className="md:hidden">
        <ModileNav />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 md:ml-[110px] min-h-screen p-4 sm:p-6 lg:p-8 mb-[70px] md:mb-0">
        
        {/* Top Header Controls row */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-[26px] font-bold text-gray-900 leading-tight">Store Performance Overview</h1>
            <p className="text-gray-500 text-[13px] mt-0.5 font-medium font-sans">Key performance metrics and trends across stores.</p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {/* Consolidated vs Rental Toggle */}
            <div className="flex bg-[#e5e7eb] p-1 rounded-xl shadow-sm">
              <button 
                onClick={() => setIsConsolidated(true)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  isConsolidated 
                    ? "bg-[#18181b] text-white shadow-sm" 
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Consolidated
              </button>
              <button 
                onClick={() => setIsConsolidated(false)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  !isConsolidated 
                    ? "bg-[#18181b] text-white shadow-sm" 
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Rental
              </button>
            </div>

            {/* Timeframe selector */}
            <div className="flex bg-[#e5e7eb] p-1 rounded-xl shadow-sm">
              {["MTD", "WTD", "YTD", "CUSTOM"].map((t) => (
                <button 
                  key={t}
                  onClick={() => setTimeframe(t)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    timeframe === t 
                      ? "bg-[#18181b] text-white shadow-sm" 
                      : "text-gray-600 hover:text-gray-950 font-bold"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {timeframe === "CUSTOM" && (
              <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-1.5 shadow-sm">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">From:</span>
                  <input 
                    type="date" 
                    value={customStartDate} 
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="border-none bg-transparent text-xs font-bold text-gray-700 outline-none p-0 focus:ring-0 cursor-pointer"
                  />
                </div>
                <div className="h-4 w-px bg-gray-200"></div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">To:</span>
                  <input 
                    type="date" 
                    value={customEndDate} 
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="border-none bg-transparent text-xs font-bold text-gray-700 outline-none p-0 focus:ring-0 cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* Date label */}
            <span className="text-gray-500 text-xs font-semibold select-none border-l border-gray-300 pl-4 py-1 font-sans">
              {getTodayDateHeaderString()}
            </span>
          </div>
        </div>

        {/* Store Target vs Achieved Target Chart Card */}
        <div className="bg-white rounded-[20px] shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="text-[17px] font-bold text-gray-900">Store Target Vs Achieved Target</h2>
              <p className="text-gray-400 text-xs font-semibold font-sans mt-0.5">
                {isConsolidated 
                  ? "Jun 01–22, 2026" 
                  : timeframe === "MTD"
                    ? getMTDDateRangeString()
                    : timeframe === "WTD"
                      ? getWTDDateRangeString()
                      : timeframe === "YTD"
                        ? getYTDDateRangeString()
                        : getCustomDateRangeString()
                } | Comparison across all {filteredChartData.length} stores
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Category selector pills */}
              <div className="flex bg-[#eef1f6] p-0.5 rounded-lg">
                {["All", "On Track", "At Risk"].map((filter) => (
                  <button 
                    key={filter}
                    onClick={() => setChartFilter(filter)}
                    className={`px-3 py-1.5 rounded-md text-[11px] font-bold transition-all ${
                      chartFilter === filter 
                        ? "bg-white text-gray-950 shadow-sm" 
                        : "text-gray-500 hover:text-gray-950"
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>

              {/* View Report Button */}
              <a 
                href="/store-analysis/dsr-report" 
                className="bg-[#18181b] hover:bg-black text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors select-none text-center"
              >
                View Report
              </a>
            </div>
          </div>

          {/* Chart Legends */}
          <div className="flex items-center gap-4 mb-4 text-xs font-bold text-gray-500">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#9333ea]" />
              <span>Target</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#eab308]" />
              <span>Achieved</span>
            </div>
          </div>

          {/* Recharts Area Graph */}
          <div className="h-[300px] w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={filteredChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="chartTargetGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#9333ea" stopOpacity={0.12} />
                    <stop offset="100%" stopColor="#9333ea" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="chartAchievedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#eab308" stopOpacity={0.12} />
                    <stop offset="100%" stopColor="#eab308" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis 
                  dataKey="abbr" 
                  tickLine={false} 
                  axisLine={false} 
                  tick={{ fill: "#9ca3af", fontSize: 10, fontWeight: 700 }} 
                />
                <YAxis 
                  tickLine={false} 
                  axisLine={false} 
                  tick={{ fill: "#9ca3af", fontSize: 10, fontWeight: 700 }}
                  tickFormatter={(val) => val >= 1000 ? `${val / 1000}K` : val} 
                />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xl text-xs font-sans">
                          <h4 className="font-extrabold text-gray-900 text-sm mb-2">{data.name}</h4>
                          <div className="space-y-1 font-semibold text-gray-500">
                            <div className="flex items-center justify-between gap-6">
                              <span>Target :</span>
                              <span className="text-[#9333ea] font-extrabold">₹{formatIndianNumber(data.target, 2)}</span>
                            </div>
                            <div className="flex items-center justify-between gap-6">
                              <span>Achieved :</span>
                              <span className="text-[#eab308] font-extrabold">₹{formatIndianNumber(data.achieved, 2)}</span>
                            </div>
                            <div className="flex items-center justify-between gap-6 border-t border-gray-100 pt-1.5 mt-1.5">
                              <span>Balance :</span>
                              <span className="text-gray-900 font-extrabold">₹{formatIndianNumber(data.balance, 2)}</span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="target" 
                  stroke="#9333ea" 
                  strokeWidth={2.5} 
                  fill="url(#chartTargetGrad)" 
                  dot={{ r: 3, stroke: "#9333ea", strokeWidth: 1, fill: "#ffffff" }}
                  activeDot={{ r: 6 }}
                />
                <Area 
                  type="monotone" 
                  dataKey="achieved" 
                  stroke="#eab308" 
                  strokeWidth={2.5} 
                  fill="url(#chartAchievedGrad)" 
                  dot={{ r: 3, stroke: "#eab308", strokeWidth: 1, fill: "#ffffff" }}
                  activeDot={{ r: 6 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 12 KPI Grid Container boxed in a box */}
        <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-6 mb-6">
          
          {/* Header Row with Role and Cluster Selectors */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 font-sans">
            <div>
              <h2 className="text-[18px] font-bold text-gray-900 leading-tight">Key Performance Indicators</h2>
              <p className="text-gray-400 text-[12px] mt-0.5 font-medium">
                {isConsolidated 
                  ? "Jun 01-22, 2026" 
                  : timeframe === "MTD"
                    ? getMTDDateRangeString()
                    : timeframe === "WTD"
                      ? getWTDDateRangeString()
                      : timeframe === "YTD"
                        ? getYTDDateRangeString()
                        : getCustomDateRangeString()
                }
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Role Select Dropdown */}
              <div className="relative">
                <select 
                  value={roleFilter} 
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="appearance-none bg-white border border-gray-200 rounded-[14px] px-4 py-2 pr-10 text-[13px] font-bold text-gray-700 shadow-sm focus:outline-none cursor-pointer hover:border-gray-300"
                >
                  <option value="Cluster">Role : Cluster</option>
                  <option value="Store Admin">Role : Store Admin</option>
                  <option value="Super Admin">Role : Super Admin</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                  <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Cluster Select Dropdown */}
              <div className="relative">
                <select 
                  value={clusterFilter} 
                  onChange={(e) => setClusterFilter(e.target.value)}
                  className="appearance-none bg-white border border-gray-200 rounded-[14px] px-4 py-2 pr-10 text-[13px] font-bold text-gray-700 shadow-sm focus:outline-none cursor-pointer hover:border-gray-300"
                >
                  <option value="South-Javad">Cluster : South-Javad</option>
                  <option value="Kochi">Cluster : Kochi</option>
                  <option value="Calicut">Cluster : Calicut</option>
                  <option value="All">Cluster : All</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                  <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

          {/* Card 1: Achieved Target % */}
          <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-5 h-[162px] flex flex-col justify-between">
            <div>
              <span className="text-[14px] font-bold text-gray-700 block">Achieved Target %</span>
              <div className="w-[85%] border-b border-gray-100 my-2" />
            </div>
            <div className="flex-1 flex items-center justify-between min-h-0 mt-1">
              <div className="flex flex-col justify-center min-w-0">
                <h3 className="text-[20px] xs:text-[22px] sm:text-[24px] lg:text-[18px] xl:text-[22px] 2xl:text-[28px] font-extrabold text-slate-900 leading-none truncate" title={`${stats.achievedPct}%`}>{stats.achievedPct}%</h3>
                <span className="text-[12px] text-gray-400 font-semibold font-sans block mt-3">
                  of Target Value <span className="font-extrabold text-[#1d4ed8]">₹{formatIndianNumber(stats.targetValue)}</span>
                </span>
              </div>
              <div className="mr-2">
                <CircularProgress percentage={stats.achievedPct} benchmarkPercentage={82} />
              </div>
            </div>
          </div>

          {/* Card 2: Achieved Target Value */}
          <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-5 h-[162px] flex flex-col justify-between">
            <div>
              <span className="text-[14px] font-bold text-gray-700 block">Achieved Target Value</span>
              <div className="w-[85%] border-b border-gray-100 my-2" />
            </div>
            <div className="flex-1 flex items-center justify-between min-h-0 mt-1">
              <div className="flex flex-col justify-center min-w-0">
                <h3 className="text-[20px] xs:text-[22px] sm:text-[24px] lg:text-[18px] xl:text-[22px] 2xl:text-[28px] font-extrabold text-slate-900 leading-none truncate" title={`₹${formatIndianNumber(stats.achievedValue, 2)}`}>₹{formatIndianNumber(stats.achievedValue, 2)}</h3>
                <span className={`text-[12px] font-bold block mt-3 ${stats.valChangeColor}`}>{stats.valChangeDisplay} <span className="text-gray-400 font-semibold font-sans">vs last year</span></span>
              </div>
              <Sparkline type={stats.valTrend} color={stats.valTrendColor} />
            </div>
          </div>

          {/* Card 3: Bills Generated */}
          <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-5 h-[162px] flex flex-col justify-between">
            <div>
              <span className="text-[14px] font-bold text-gray-700 block">Bills Generated</span>
              <div className="w-[85%] border-b border-gray-100 my-2" />
            </div>
            <div className="flex-1 flex items-center justify-between min-h-0 mt-1">
              <div className="flex flex-col justify-center min-w-0">
                <h3 className="text-[20px] xs:text-[22px] sm:text-[24px] lg:text-[18px] xl:text-[22px] 2xl:text-[28px] font-extrabold text-slate-900 leading-none truncate" title={formatIndianNumber(stats.billsGenerated)}>{formatIndianNumber(stats.billsGenerated)}</h3>
                <span className={`text-[12px] font-bold block mt-3 ${stats.billsChangeColor}`}>{stats.billsChangeDisplay} <span className="text-gray-400 font-semibold font-sans">vs last year</span></span>
              </div>
              <Sparkline type={stats.billsTrend} color={stats.billsTrendColor} />
            </div>
          </div>

          {/* Card 4: Quantity Sold */}
          <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-5 h-[162px] flex flex-col justify-between">
            <div>
              <span className="text-[14px] font-bold text-gray-700 block">Quantity Sold</span>
              <div className="w-[85%] border-b border-gray-100 my-2" />
            </div>
            <div className="flex-1 flex items-center justify-between min-h-0 mt-1">
              <div className="flex flex-col justify-center min-w-0">
                <h3 className="text-[20px] xs:text-[22px] sm:text-[24px] lg:text-[18px] xl:text-[22px] 2xl:text-[28px] font-extrabold text-slate-900 leading-none truncate" title={formatIndianNumber(stats.quantitySold)}>{formatIndianNumber(stats.quantitySold)}</h3>
                <span className={`text-[12px] font-bold block mt-3 ${stats.qtyChangeColor}`}>{stats.qtyChangeDisplay} <span className="text-gray-400 font-semibold font-sans">vs last year</span></span>
              </div>
              <Sparkline type={stats.qtyTrend} color={stats.qtyTrendColor} />
            </div>
          </div>

          {/* Card 5: Average Basket Size */}
          <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-5 h-[162px] flex flex-col justify-between">
            <div>
              <span className="text-[14px] font-bold text-gray-700 block">Average Basket Size</span>
              <div className="w-[85%] border-b border-gray-100 my-2" />
            </div>
            <div className="flex-1 flex items-center justify-between min-h-0 mt-1">
              <div className="flex flex-col justify-center min-w-0">
                <h3 className="text-[20px] xs:text-[22px] sm:text-[24px] lg:text-[18px] xl:text-[22px] 2xl:text-[28px] font-extrabold text-slate-900 leading-none truncate" title={stats.basketSize}>{stats.basketSize}</h3>
                <span className={`text-[12px] font-bold block mt-3 ${stats.absChangeColor}`}>{stats.absChangeDisplay} <span className="text-gray-400 font-semibold font-sans">vs last year</span></span>
              </div>
              <Sparkline type={stats.absTrend} color={stats.absTrendColor} />
            </div>
          </div>

          {/* Card 6: Average Basket Value */}
          <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-5 h-[162px] flex flex-col justify-between">
            <div>
              <span className="text-[14px] font-bold text-gray-700 block">Average Basket Value</span>
              <div className="w-[85%] border-b border-gray-100 my-2" />
            </div>
            <div className="flex-1 flex items-center justify-between min-h-0 mt-1">
              <div className="flex flex-col justify-center min-w-0">
                <h3 className="text-[20px] xs:text-[22px] sm:text-[24px] lg:text-[18px] xl:text-[22px] 2xl:text-[28px] font-extrabold text-slate-900 leading-none truncate" title={`₹${formatIndianNumber(stats.basketValue, 2)}`}>₹{formatIndianNumber(stats.basketValue, 2)}</h3>
                <span className={`text-[12px] font-bold block mt-3 ${stats.abvChangeColor}`}>{stats.abvChangeDisplay} <span className="text-gray-400 font-semibold font-sans">vs last year</span></span>
              </div>
              <Sparkline type={stats.abvTrend} color={stats.abvTrendColor} />
            </div>
          </div>

          {/* Card 7: Customer Walk-ins */}
          <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-5 h-[162px] flex flex-col justify-between">
            <div>
              <span className="text-[14px] font-bold text-gray-700 block">Customer Walk-ins</span>
              <div className="w-[85%] border-b border-gray-100 my-2" />
            </div>
            <div className="flex-1 flex items-center justify-between min-h-0 mt-1">
              <div className="flex flex-col justify-center min-w-0">
                <h3 className="text-[20px] xs:text-[22px] sm:text-[24px] lg:text-[18px] xl:text-[22px] 2xl:text-[28px] font-extrabold text-slate-900 leading-none truncate" title={formatIndianNumber(stats.customerWalkins)}>{formatIndianNumber(stats.customerWalkins)}</h3>
                <span className={`text-[12px] font-bold block mt-3 ${stats.walkChangeColor}`}>{stats.walkChangeDisplay} <span className="text-gray-400 font-semibold font-sans">vs last year</span></span>
              </div>
              <Sparkline type={stats.walkTrend} color={stats.walkTrendColor} />
            </div>
          </div>

          {/* Card 8: Conversion Rate % */}
          <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-5 h-[162px] flex flex-col justify-between">
            <div>
              <span className="text-[14px] font-bold text-gray-700 block">Conversion Rate %</span>
              <div className="w-[85%] border-b border-gray-100 my-2" />
            </div>
            <div className="flex-1 flex items-center justify-between min-h-0 mt-1">
              <div className="flex flex-col justify-center min-w-0">
                <h3 className="text-[20px] xs:text-[22px] sm:text-[24px] lg:text-[18px] xl:text-[22px] 2xl:text-[28px] font-extrabold text-slate-900 leading-none truncate" title={`${stats.conversionRate}%`}>{stats.conversionRate}%</h3>
                <span className="text-[12px] text-gray-400 font-semibold font-sans block mt-3">
                  <span className="font-extrabold text-[#1d4ed8]">{formatIndianNumber(stats.convertedWalkins)}</span> of walk ins converted
                </span>
              </div>
              <div className="mr-2">
                <CircularProgress percentage={stats.conversionRate} benchmarkPercentage={82} />
              </div>
            </div>
          </div>

          {/* Card 9: Shoe Sale */}
          <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-5 h-[162px] flex flex-col justify-between">
            <div>
              <span className="text-[14px] font-bold text-gray-700 block">Shoe Sale</span>
              <div className="w-[85%] border-b border-gray-100 my-2" />
            </div>
            <div className="flex-1 flex items-center justify-between min-h-0 mt-1">
              <div className="flex flex-col justify-center min-w-0">
                <h3 className="text-[20px] xs:text-[22px] sm:text-[24px] lg:text-[18px] xl:text-[22px] 2xl:text-[28px] font-extrabold text-gray-950 leading-none truncate" title={stats.shoeSale}>{stats.shoeSale}</h3>
                <span className="text-[12px] text-emerald-600 font-bold block mt-3">+10% <span className="text-gray-400 font-semibold font-sans">of conversion</span></span>
              </div>
              <Sparkline type="up" color="#00A36C" />
            </div>
          </div>

          {/* Card 10: Shirt Sales */}
          <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-5 h-[162px] flex flex-col justify-between">
            <div>
              <span className="text-[14px] font-bold text-gray-700 block">Shirt Sales</span>
              <div className="w-[85%] border-b border-gray-100 my-2" />
            </div>
            <div className="flex-1 flex items-center justify-between min-h-0 mt-1">
              <div className="flex flex-col justify-center min-w-0">
                <h3 className="text-[20px] xs:text-[22px] sm:text-[24px] lg:text-[18px] xl:text-[22px] 2xl:text-[28px] font-extrabold text-gray-950 leading-none truncate" title={stats.shirtSales}>{stats.shirtSales}</h3>
                <span className="text-[12px] text-rose-500 font-bold block mt-3">-6% <span className="text-gray-400 font-semibold font-sans">of conversion</span></span>
              </div>
              <Sparkline type="down" color="#e11d48" />
            </div>
          </div>

          {/* Card 11: Dappr Squad Bills */}
          <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-5 h-[162px] flex flex-col justify-between">
            <div>
              <span className="text-[14px] font-bold text-gray-700 block">Dappr Squad Bills</span>
              <div className="w-[85%] border-b border-gray-100 my-2" />
            </div>
            <div className="flex-1 flex flex-col justify-center min-h-0">
              <h3 className="text-[20px] xs:text-[22px] sm:text-[24px] lg:text-[18px] xl:text-[22px] 2xl:text-[28px] font-extrabold text-slate-900 leading-none truncate" title={stats.dapprSquadBills}>{stats.dapprSquadBills}</h3>
              <span className="text-[12px] text-gray-400 font-semibold font-sans mt-3 block">
                Total bill value <span className="font-extrabold text-[#1d4ed8]">₹{formatIndianNumber(stats.dapprSquadValue, 2)}</span>
              </span>
            </div>
          </div>

          {/* Card 12: Google Reviews */}
          <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-5 h-[162px] flex flex-col justify-between">
            <div>
              <span className="text-[14px] font-bold text-gray-700 block">Google Reviews</span>
              <div className="w-[85%] border-b border-gray-100 my-2" />
            </div>
            <div className="flex-1 flex items-center justify-between min-h-0 mt-1">
              <div className="flex flex-col justify-center min-w-0">
                <h3 className="text-[20px] xs:text-[22px] sm:text-[24px] lg:text-[18px] xl:text-[22px] 2xl:text-[28px] font-extrabold text-slate-900 leading-none truncate" title={stats.googleReviews}>{stats.googleReviews}</h3>
                <span className="text-[12px] text-gray-400 font-semibold font-sans mt-3 block">
                  Average rating <span className="font-extrabold text-slate-700">{stats.googleRating}</span>
                </span>
              </div>
              <div className="shrink-0 flex items-center h-full pt-4">
                <StarRating rating={stats.googleRating} />
              </div>
            </div>
          </div>

        </div> {/* Close grid container */}
      </div> {/* Close Key Performance Indicators outer box container */}

      {/* Dual-Column Store Ranking & Operational Highlights section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6 font-sans">
        
        {/* Store Performance Ranking (col-span-2) */}
        <div className="lg:col-span-2 bg-white rounded-[24px] shadow-sm border border-gray-100 p-6 flex flex-col justify-between h-full">
          <div className="flex flex-col h-full flex-1 min-h-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <h2 className="text-[18px] font-bold text-gray-900 leading-tight">Store Performance Ranking</h2>
                <p className="text-gray-400 text-[12px] mt-0.5 font-medium">Best to least - MTD - Showing all {totalRankingItems} stores</p>
              </div>
              
              {/* Sorting Dropdown */}
              <div className="relative shrink-0">
                <select 
                  value={rankingSort} 
                  onChange={(e) => {
                    setRankingSort(e.target.value);
                  }}
                  className="appearance-none bg-white border border-gray-200 rounded-[14px] px-4 py-2 pr-10 text-[13px] font-bold text-gray-700 shadow-sm focus:outline-none cursor-pointer hover:border-gray-300"
                >
                  <option value="Best to Least">Sort : Best to Least</option>
                  <option value="Least to Best">Sort : Least to Best</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                  <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative mb-5 max-w-xs">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input 
                type="text" 
                value={rankingSearch}
                onChange={(e) => {
                  setRankingSearch(e.target.value);
                }}
                placeholder="Search by store name..." 
                className="w-full bg-[#f3f4f6] text-gray-700 text-xs font-semibold rounded-[14px] pl-9 pr-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-gray-300"
              />
            </div>

            {/* Table Container */}
            <div className="overflow-x-auto flex-1 min-h-[460px] max-h-[500px] overflow-y-auto pr-1">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#f3f4f6] rounded-xl text-gray-500 text-[10px] font-extrabold tracking-wider uppercase">
                    <th className="py-3 px-4 rounded-l-xl">Store Name</th>
                    <th className="py-3 px-4 text-center">Target Achieved %</th>
                    <th className="py-3 px-4 text-center">Contribution %</th>
                    <th className="py-3 px-4 text-center">ABS</th>
                    <th className="py-3 px-4 text-center">ABV</th>
                    <th className="py-3 px-4 text-center rounded-r-xl">Conversion %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs font-bold text-gray-700">
                  {processedRanking.map((s, idx) => {
                    const nameParts = s.name.split(" ");
                    const brand = nameParts[0];
                    const loc = nameParts.slice(1).join(" ");
                    
                    return (
                      <tr key={idx} className="hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4">
                          <span className="block font-extrabold text-gray-900 text-[13px]">{brand}</span>
                          <span className="block text-gray-400 font-medium text-[11px] mt-0.5">{loc || "Store"}</span>
                        </td>
                        <td className="py-3 px-4 text-center text-gray-900 font-extrabold text-[13px]">{s.targetAchieved}%</td>
                        <td className="py-3 px-4 text-center text-gray-500">{s.contribution}%</td>
                        <td className="py-3 px-4 text-center text-gray-500">{s.abs}</td>
                        <td className="py-3 px-4 text-center text-gray-900 font-extrabold">₹{formatIndianNumber(s.abv)}</td>
                        <td className="py-3 px-4 text-center text-gray-900 font-extrabold">{s.conversion}%</td>
                      </tr>
                    );
                  })}
                  {processedRanking.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-400 font-semibold">No stores found matching search criteria.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>


        </div>

        {/* Operational Highlights (col-span-1) */}
        <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-[18px] font-bold text-gray-900 leading-tight">Operational Highlights</h2>
                <p className="text-gray-400 text-[12px] mt-0.5 font-medium">Areas requiring attention to improve performance</p>
              </div>
              <button 
                onClick={() => alert("All highlights loaded")}
                className="text-gray-900 hover:text-black font-extrabold text-[12px] flex items-center gap-1 whitespace-nowrap"
              >
                View All 
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Highlights cards stack */}
            <div className="space-y-4">
              
              {/* Card 1: Staff Shortage */}
              <div className="border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-[13px] font-extrabold text-gray-900">Staff Shortage Impact</h4>
                    <p className="text-gray-400 font-medium text-[11px] leading-relaxed mt-1">Two Fashion Stylists Shortage causing peak-hour coverage gaps and affecting conversion metrics.</p>
                  </div>
                </div>
                <div className="border-t border-dashed border-gray-100 my-3" />
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <div className="flex items-center gap-1.5 text-gray-700">
                    <span className="w-2 h-2 rounded-full bg-blue-600" />
                    <span>Z Edappally</span>
                  </div>
                  <span className="text-gray-900 font-extrabold">2 Staff Shortage</span>
                </div>
              </div>

              {/* Card 2: Lowest Performing */}
              <div className="border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-[13px] font-extrabold text-gray-900">Lowest Performing Store</h4>
                    <p className="text-gray-400 font-medium text-[11px] leading-relaxed mt-1">Store achieved only 68% of June Month till date target and ranks last among all stores.</p>
                  </div>
                </div>
                <div className="border-t border-dashed border-gray-100 my-3" />
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <div className="flex items-center gap-1.5 text-gray-700">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <span>SG Kottayam</span>
                  </div>
                  <span className="text-gray-900 font-extrabold">68% of target</span>
                </div>
              </div>

              {/* Card 3: High Footfall, Low Sales */}
              <div className="border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-[13px] font-extrabold text-gray-900">High Footfall, Low Sales</h4>
                    <p className="text-gray-400 font-medium text-[11px] leading-relaxed mt-1">Customer visits increased by 18%, but sales conversion remains below expectations. Opportunity loss detected.</p>
                  </div>
                </div>
                <div className="border-t border-dashed border-gray-100 my-3" />
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <div className="flex items-center gap-1.5 text-gray-700">
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    <span>SG Calicut</span>
                  </div>
                  <span className="text-gray-900 font-extrabold">54% conversion</span>
                </div>
              </div>

              {/* Card 4: Lowest Performing Store (Repeated) */}
              <div className="border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-[13px] font-extrabold text-gray-900">Lowest Performing Store</h4>
                    <p className="text-gray-400 font-medium text-[11px] leading-relaxed mt-1">Store achieved only 68% of June Month till date target and ranks last among all stores.</p>
                  </div>
                </div>
                <div className="border-t border-dashed border-gray-100 my-3" />
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <div className="flex items-center gap-1.5 text-gray-700">
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    <span>SG Kottayam</span>
                  </div>
                  <span className="text-gray-900 font-extrabold">68% of target</span>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div> {/* Close Key Performance Indicators outer box container */}

      </div>
    </div>
  );
};

export default StoreInsights;
