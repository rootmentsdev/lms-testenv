import React, { useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
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
  // Z-Edappally (loc 1)
  "z-edapally1": "1",
  "z-edappally1": "1",
  "z edapally1": "1",
  "z edappally1": "1",
  "zorucci edappally": "1",
  "zorucci edapally": "1",
  // G-Edappally (loc 3)
  "g-edappally": "3",
  "g edappally": "3",
  "grooms edappally": "3",
  "suitor guy edappally": "3",
  // G-Trivandrum (loc 5)
  "g-trivandrum": "5",
  "g.trivandrum": "5",
  "g trivandrum": "5",
  "grooms trivandrum": "5",
  "suitor guy trivandrum": "5",
  // Z-Edappal (loc 6)
  "z- edappal": "6",
  "z.edappal": "6",
  "z edappal": "6",
  "zorucci edappal": "6",
  // Z-Perinthalmanna (loc 7)
  "z.perinthalmanna": "7",
  "z perinthalmanna": "7",
  "zorucci perinthalmanna": "7",
  // Z-Kottakkal (loc 8)
  "z.kottakkal": "8",
  "z kottakkal": "8",
  "zorucci kottakkal": "8",
  // G-Kottayam (loc 9)
  "g.kottayam": "9",
  "g kottayam": "9",
  "grooms kottayam": "9",
  "suitor guy kottayam": "9",
  // G-Perumbavoor (loc 10)
  "g.perumbavoor": "10",
  "g perumbavoor": "10",
  "grooms perumbavoor": "10",
  "suitor guy perumbavoor": "10",
  // G-Thrissur (loc 11)
  "g.thrissur": "11",
  "g thrissur": "11",
  "grooms thrissur": "11",
  "suitor guy thrissur": "11",
  // G-Chavakkad (loc 12)
  "g.chavakkad": "12",
  "g chavakkad": "12",
  "grooms chavakkad": "12",
  "suitor guy chavakkad": "12",
  // G-Calicut (loc 13)
  "g.calicut": "13",
  "g calicut": "13",
  "grooms calicut": "13",
  "suitor guy calicut": "13",
  // G-Vadakara (loc 14)
  "g.vadakara": "14",
  "g vadakara": "14",
  "grooms vadakara": "14",
  "suitor guy vadakara": "14",
  // G-Edappal (loc 15)
  "g.edappal": "15",
  "g edappal": "15",
  "grooms edappal": "15",
  "suitor guy edappal": "15",
  // G-Perinthalmanna (loc 16)
  "g.perinthalmanna": "16",
  "g perinthalmanna": "16",
  "grooms perinthalmanna": "16",
  "suitor guy perinthalmanna": "16",
  // G-Kottakkal (loc 17)
  "g.kottakkal": "17",
  "g kottakkal": "17",
  "grooms kottakkal": "17",
  "suitor guy kottakkal": "17",
  // G-Manjeri (loc 18)
  "g.manjeri": "18",
  "g manjeri": "18",
  "grooms manjeri": "18",
  "suitor guy manjeri": "18",
  // G-Palakkad (loc 19)
  "g.palakkad": "19",
  "g palakkad": "19",
  "grooms palakkad": "19",
  "suitor guy palakkad": "19",
  // G-Kalpetta (loc 20)
  "g.kalpetta": "20",
  "g kalpetta": "20",
  "grooms kalpetta": "20",
  "suitor guy kalpetta": "20",
  // G-Kannur (loc 21)
  "g.kannur": "21",
  "g kannur": "21",
  "grooms kannur": "21",
  "suitor guy kannur": "21",
  // G-MG Road (loc 23)
  "g.mg road": "23",
  "g.mgroad": "23",
  "g mg road": "23",
  "gmg road": "23",
  "grooms mg road": "23",
  "suitor guy mg road": "23",
  // Dappr Squad (loc 25)
  "dappr squad": "25",
  "sg.edappally": "25",
  "sg.perumbavoor": "25",
  "crsrootments": "25"
};

// Fuzzy normalized lookup: strips all non-alphanumeric chars then matches
const BRANCH_LOCATION_MAPPING_FUZZY = (() => {
  const fuzzy = {};
  Object.entries(BRANCH_LOCATION_MAPPING).forEach(([key, val]) => {
    const stripped = key.replace(/[^a-z0-9]/g, "");
    if (!fuzzy[stripped]) fuzzy[stripped] = val;
  });
  return fuzzy;
})();

function getBranchLocationId(workingBranch) {
  if (!workingBranch) return null;
  const normalized = String(workingBranch).trim().toLowerCase();
  // 1. Exact match
  if (BRANCH_LOCATION_MAPPING[normalized]) return BRANCH_LOCATION_MAPPING[normalized];
  // 2. Fuzzy match: strip all separators/spaces
  const stripped = normalized.replace(/[^a-z0-9]/g, "");
  if (BRANCH_LOCATION_MAPPING_FUZZY[stripped]) return BRANCH_LOCATION_MAPPING_FUZZY[stripped];
  // 3. Keyword-based fallback for common city names
  const CITY_TO_LOC = {
    "edappally": "3", "edapally": "3",
    "trivandrum": "5", "thiruvananthapuram": "5",
    "perinthalmanna": "7",
    "kottakkal": "8",
    "kottayam": "9",
    "perumbavoor": "10",
    "thrissur": "11",
    "chavakkad": "12",
    "calicut": "13", "kozhikode": "13",
    "vadakara": "14",
    "edappal": "15",
    "manjeri": "18",
    "palakkad": "19",
    "kalpetta": "20",
    "kannur": "21",
    "mgroad": "23",
  };
  for (const [city, locId] of Object.entries(CITY_TO_LOC)) {
    if (stripped.endsWith(city) || stripped.includes(city)) {
      // Only match if starts with a known brand prefix
      if (stripped.startsWith("z") || stripped.startsWith("g") || stripped.startsWith("sg") || stripped.startsWith("suitor") || stripped.startsWith("grooms") || stripped.startsWith("zorucci")) {
        // Distinguish zorucci (z) vs grooms/sg (g) based on prefix
        if ((stripped.startsWith("z") || stripped.startsWith("zorucci")) && city === "edappally") return "1";
        if ((stripped.startsWith("z") || stripped.startsWith("zorucci")) && city === "perinthalmanna") return "7";
        if ((stripped.startsWith("z") || stripped.startsWith("zorucci")) && city === "kottakkal") return "8";
        if ((stripped.startsWith("z") || stripped.startsWith("zorucci")) && city === "edappal") return "6";
        return locId;
      }
    }
  }
  return null;
}

// Maps Dappr Squad (loc 25) bookingBy names → the target store locId they belong to
const DAPPR_SQUAD_STORE_MAPPING = {
  // G-Edappally (loc 3)
  "sg.edappally": "3",
  "sg.edapally": "3",
  "sg.edappaly": "3",
  // G-Perumbavoor (loc 10)
  "sg.perumbavoor": "10",
  "sg.perumbavur": "10",
  // G-Thrissur (loc 11)
  "sg.thrissur": "11",
  "sg.tsr": "11",
  // G-Chavakkad (loc 12)
  "sg.chavakkad": "12",
  "sg.chavakad": "12",
  // G-Calicut (loc 13)
  "sg.calicut": "13",
  "sg.kozhikode": "13",
  // G-Vadakara (loc 14)
  "sg.vadakara": "14",
  // G-Edappal (loc 15)
  "sg.edappal": "15",
  // G-Perinthalmanna (loc 16)
  "sg.perinthalmanna": "16",
  "sg.perinthalmana": "16",
  "sg.pma": "16",
  // G-Kottakkal (loc 17)
  "sg.kottakkal": "17",
  "sg.kottakal": "17",
  "sg.ktk": "17",
  // G-Manjeri (loc 18)
  "sg.manjeri": "18",
  "sg.manjery": "18",
  // G-Palakkad (loc 19)
  "sg.palakkad": "19",
  "sg.palakad": "19",
  "sg.pkd": "19",
  // G-Kalpetta (loc 20)
  "sg.kalpetta": "20",
  "sg.kalpeta": "20",
  // G-Kannur (loc 21)
  "sg.kannur": "21",
  "sg.knr": "21",
  // G-Trivandrum (loc 5)
  "sg.trivandrum": "5",
  "sg.tvm": "5",
  "sg.trivandum": "5",
  "sg.trivandurm": "5",
  "sg.thiruvananthapuram": "5",
  "sg.tvpm": "5",
  // G-Kottayam (loc 9)
  "sg.kottayam": "9",
  "sg.ktm": "9",
  // G-MG Road (loc 23)
  "sg.mg road": "23",
  "sg.mgroad": "23",
  "sg.mg.road": "23",
  "sg.edapally1": "1"
};

// Get all Dappr Squad entries from loc 25 that belong to a given store locId
function getDapprSquadDataForStore(locId, dapprList) {
  return dapprList.filter(item => {
    const raw = String(item.bookingBy || "").trim().toLowerCase();

    // 1. Direct exact match
    if (DAPPR_SQUAD_STORE_MAPPING[raw] === locId) return true;

    // 2. Normalize: strip all non-alphanumeric, re-insert dot after "sg"
    const alphaOnly = raw.replace(/[^a-z0-9]/g, "");
    if (alphaOnly.startsWith("sg")) {
      const dotted = "sg." + alphaOnly.slice(2);
      if (DAPPR_SQUAD_STORE_MAPPING[dotted] === locId) return true;
    }

    // 3. Abbreviation expansion: map short codes to locIds directly
    const abbrevMap = {
      "tvm": "5", "tvpm": "5", "trivandum": "5", "trivandurm": "5",
      "tsr": "11", "pkd": "19", "ktk": "17", "ktm": "9",
      "knr": "21", "pma": "16", "mgroad": "23", "mgrd": "23",
    };
    if (alphaOnly.startsWith("sg")) {
      const code = alphaOnly.slice(2);
      if (abbrevMap[code] === locId) return true;
    }

    return false;
  });
}

const parseWeekDays = (val) => {
  if (!val || val === "Select Days") return { start: null, end: null };
  const digits = String(val).match(/\d+/g);
  if (digits && digits.length >= 2) {
    const start = parseInt(digits[0], 10);
    const end = parseInt(digits[1], 10);
    if (!isNaN(start) && !isNaN(end)) {
      return { start, end };
    }
  }
  return { start: null, end: null };
};


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

const isWalkinCreatedInRange = (dateVal, startStr, endStr) => {
  if (!dateVal) return false;
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return false;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const ymd = `${year}-${month}-${day}`;
  return ymd >= startStr && ymd <= endStr;
};

const shiftDateYear = (dateStr, years = -1) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  d.setFullYear(d.getFullYear() + years);
  return getLocalDateString(d);
};

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
  // Non-sales branches: hide from all report views
  const nonSalesBranches = ["office", "production", "warehouse"];
  if (nonSalesBranches.includes(normalized)) return true;
  // Any test store
  if (normalized.startsWith("test ") || normalized.startsWith("test")) {
    const afterTest = normalized.replace(/^test\s*/, "").trim();
    if (afterTest.length > 0) return true;
  }
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
  const visualPercentage = Math.min(100, Math.max(0, percentage));
  const outerStrokeDashoffset = outerCircumference - (visualPercentage / 100) * maxLen;

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
  const user = useSelector((state) => state.auth.user);
  const isStoreAdmin = user?.role === "store_admin";
  const isClusterAdmin = user?.role === "cluster_admin";

  // Page State
  const [isConsolidated, setIsConsolidated] = useState(true); // Consolidated vs Rental
  const [timeframe, setTimeframe] = useState("MTD"); // MTD, WTD, YTD, CUSTOM
  const [chartFilter, setChartFilter] = useState("All"); // All, On Track, At Risk
  const [roleFilter, setRoleFilter] = useState("Cluster");
  const [clusterFilter, setClusterFilter] = useState("All");
  const [storeFilter, setStoreFilter] = useState("All");
  const [clusters, setClusters] = useState([]);
  const [employees, setEmployees] = useState([]);
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
  const [employeeTargets, setEmployeeTargets] = useState({});
  const [performanceData, setPerformanceData] = useState({});
  const [lyPerformanceData, setLyPerformanceData] = useState({});
  const [loadingTargets, setLoadingTargets] = useState(false);
  const [loadingPerformance, setLoadingPerformance] = useState(false);
  const [walkins, setWalkins] = useState([]);
  const [lyWalkins, setLyWalkins] = useState([]);
  const [loadingWalkins, setLoadingWalkins] = useState(false);
  const [salesData, setSalesData] = useState({ shoeQty: 0, shirtQty: 0, shoeValue: 0, shirtValue: 0, shoeBills: 0, shirtBills: 0, byBranch: {} });
  const [lySalesData, setLySalesData] = useState({ shoeQty: 0, shirtQty: 0, shoeValue: 0, shirtValue: 0, shoeBills: 0, shirtBills: 0, byBranch: {} });
  const [salespersons, setSalespersons] = useState([]);
  const [loadingSales, setLoadingSales] = useState(false);

  // Google Reviews real data from backend
  const [googleReviewData, setGoogleReviewData] = useState({});
  const [ratingSummary, setRatingSummary] = useState({ averageRating: 0.0, totalRatings: 0 });

  // Last refreshed timestamp for real-time indicator
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

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
          let visible = list.filter((b) => !isHiddenBranch(b?.workingBranch));

          // For store_admin/cluster_admin: only show their assigned branches
          if (isStoreAdmin || isClusterAdmin) {
            const assignedBranchIds = (user?.branches || []).map(b => String(b._id || b));
            console.log("[StoreInsights] user.branches raw:", user?.branches);
            console.log("[StoreInsights] assignedBranchIds:", assignedBranchIds);
            console.log("[StoreInsights] all visible branches:", visible.map(b => ({ id: b._id, workingBranch: b.workingBranch, locCode: b.locCode })));
            visible = visible.filter(b => assignedBranchIds.includes(String(b._id)));
            console.log("[StoreInsights] filtered branches for store_admin:", visible.map(b => ({ id: b._id, workingBranch: b.workingBranch, locId: getBranchLocationId(b.workingBranch), locCode: b.locCode })));
          }

          setBranches(visible);
        }
      } catch (err) {
        console.error("Error fetching branches for Store Insights:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBranches();
  }, [isStoreAdmin, isClusterAdmin, user]);

  // Fetch real Google Review counts from backend
  useEffect(() => {
    const fetchGoogleReviews = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${baseUrl.baseUrl}api/google-reviews/dashboard`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) {
          const json = await res.json();
          if (json?.success && json?.data) {
            setGoogleReviewData(json.data);
          }
        }
      } catch (err) {
        console.error("Error fetching Google Reviews dashboard:", err);
      }
    };
    fetchGoogleReviews();
  }, []);

  // Fetch branch audit rating summary (staff/store ratings) from backend
  useEffect(() => {
    const fetchRatingSummary = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${baseUrl.baseUrl}api/admin/branch-audit/staff-rating-summary`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) {
          const json = await res.json();
          if (json?.success && json?.data) {
            setRatingSummary(json.data);
          }
        }
      } catch (err) {
        console.error("Error fetching rating summary in StoreInsights:", err);
      }
    };
    fetchRatingSummary();
  }, []);

  // Fetch active clusters dynamically (by querying admins/employees with role 'cluster_admin')
  useEffect(() => {
    const fetchClusters = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${baseUrl.baseUrl}api/admin/admin/list`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) {
          const json = await res.json();
          const list = Array.isArray(json?.data) 
            ? json.data.filter(item => item.role === "cluster_admin") 
            : [];
          setClusters(list);
        }
      } catch (err) {
        console.error("Error fetching cluster admins for Store Insights:", err);
      }
    };
    fetchClusters();
  }, []);

  // Fetch accessible employees dynamically
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${baseUrl.baseUrl}api/admin/accessible-employees`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) {
          const json = await res.json();
          setEmployees(Array.isArray(json?.employees) ? json.employees : []);
        }
      } catch (err) {
        console.error("Error fetching employees for Store Insights:", err);
      }
    };
    fetchEmployees();
  }, []);

  const getDaysCountInMonth = (monthName) => {
    const months = {
      January: 31, February: 28, March: 31, April: 30, May: 31, June: 30,
      July: 31, August: 31, September: 30, October: 31, November: 30, December: 31
    };
    return months[monthName] || 30;
  };

  function normalizeForMatch(str) {
    if (!str) return "";
    return String(str)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "")
      .replace(/^sg/, "g")
      .replace(/^dapper/, "dappr");
  }

  function isStaffNameMatch(strA, strB) {
    if (!strA || !strB) return false;
    const normA = normalizeForMatch(strA);
    const normB = normalizeForMatch(strB);
    if (!normA || !normB) return false;
    if (normA === normB) return true;

    if (normA.length >= 4 && normB.length >= 4) {
      if (normA.startsWith(normB) || normB.startsWith(normA)) return true;
    }
    return false;
  }

  const getStoreWeekRange = (storeName, monthName = CURRENT_MONTH_LONG) => {
    if (!storeName || storeName === "All") return null;
    const snorm = storeName.replace(/[.\-]/g, '-');
    const matchKey = Object.keys(storeWeekRanges).find(
      k => k === storeName || k === snorm || normalizeForMatch(k) === normalizeForMatch(storeName)
    );
    if (!matchKey) return null;
    const storeVal = storeWeekRanges[matchKey];
    if (!storeVal) return null;
    if (storeVal[monthName]) return storeVal[monthName];
    if (storeVal[1] || storeVal[2] || storeVal[3] || storeVal[4]) return storeVal;
    return null;
  };

  const getCurrentWeekId = (storeName = "All", targetMonthName = CURRENT_MONTH_LONG) => {
    const today = new Date();
    const todayDateNum = today.getDate();
    const daysInMonth = getDaysCountInMonth(targetMonthName);
    const daysInMonthStr = String(daysInMonth).padStart(2, "0");
    
    let w1 = `01 - 07 ${CURRENT_MONTH_SHORT}`;
    let w2 = `08 - 14 ${CURRENT_MONTH_SHORT}`;
    let w3 = `15 - 21 ${CURRENT_MONTH_SHORT}`;
    let w4 = `22 - ${daysInMonthStr} ${CURRENT_MONTH_SHORT}`;

    if (storeName !== "All") {
      const sr = getStoreWeekRange(storeName, targetMonthName);
      if (sr) {
        if (sr[1]) w1 = sr[1];
        if (sr[2]) w2 = sr[2];
        if (sr[3]) w3 = sr[3];
        if (sr[4]) w4 = sr[4];
      }
    }

    const parseRange = (val, weekId) => {
      let { start: startDay, end: endDay } = parseWeekDays(val);
      if (startDay === null || endDay === null || isNaN(startDay) || isNaN(endDay)) {
        if (weekId === 1) { startDay = 1; endDay = 7; }
        else if (weekId === 2) { startDay = 8; endDay = 14; }
        else if (weekId === 3) { startDay = 15; endDay = 21; }
        else { startDay = 22; endDay = getDaysCountInMonth(targetMonthName); }
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
    
    if (todayDateNum <= 7) return 1;
    if (todayDateNum <= 14) return 2;
    if (todayDateNum <= 21) return 3;
    return 4;
  };

  const getCustomRangeTarget = (storeName, startDateStr, endDateStr, targetMonthName, overrideTargetObj = null) => {
    if (!startDateStr || !endDateStr) return 0;
    
    const start = new Date(startDateStr);
    const end = new Date(endDateStr);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
    
    const targetMonth = start.getMonth();
    
    const daysInMonth = getDaysCountInMonth(targetMonthName);
    const daysInMonthStr = String(daysInMonth).padStart(2, "0");
    
    let w1 = `01 - 07 ${CURRENT_MONTH_SHORT}`;
    let w2 = `08 - 14 ${CURRENT_MONTH_SHORT}`;
    let w3 = `15 - 21 ${CURRENT_MONTH_SHORT}`;
    let w4 = `22 - ${daysInMonthStr} ${CURRENT_MONTH_SHORT}`;
    
    if (storeName !== "All") {
      const sr = getStoreWeekRange(storeName, targetMonthName);
      if (sr) {
        if (sr[1]) w1 = sr[1];
        if (sr[2]) w2 = sr[2];
        if (sr[3]) w3 = sr[3];
        if (sr[4]) w4 = sr[4];
      }
    }
    
    const parseRange = (val, weekId) => {
      let { start: startDay, end: endDay } = parseWeekDays(val);
      if (startDay === null || endDay === null || isNaN(startDay) || isNaN(endDay)) {
        if (weekId === 1) { startDay = 1; endDay = 7; }
        else if (weekId === 2) { startDay = 8; endDay = 14; }
        else if (weekId === 3) { startDay = 15; endDay = 21; }
        else { startDay = 22; endDay = getDaysCountInMonth(targetMonthName); }
      }
      return { startDay, endDay, count: (endDay - startDay + 1) };
    };
    
    const wRanges = {
      1: parseRange(w1, 1),
      2: parseRange(w2, 2),
      3: parseRange(w3, 3),
      4: parseRange(w4, 4),
    };
    
    const storeTargetObj = overrideTargetObj || weeklyTargets[storeName]?.[targetMonthName] || {};
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
    
    const daysInMonth = getDaysCountInMonth(monthName);
    const daysInMonthStr = String(daysInMonth).padStart(2, "0");
    let w1 = `01 - 07 ${CURRENT_MONTH_SHORT}`;
    let w2 = `08 - 14 ${CURRENT_MONTH_SHORT}`;
    let w3 = `15 - 21 ${CURRENT_MONTH_SHORT}`;
    let w4 = `22 - ${daysInMonthStr} ${CURRENT_MONTH_SHORT}`;

    if (storeName !== "All") {
      const sr = getStoreWeekRange(storeName, monthName);
      if (sr) {
        if (sr[1]) w1 = sr[1];
        if (sr[2]) w2 = sr[2];
        if (sr[3]) w3 = sr[3];
        if (sr[4]) w4 = sr[4];
      }
    }

    let startDayNum = 1;
    const weekVal = activeWeekId === 1 ? w1 
                  : activeWeekId === 2 ? w2 
                  : activeWeekId === 3 ? w3 
                  : w4;
                  
    const { start: parsedStart } = parseWeekDays(weekVal);
    if (parsedStart !== null) {
      startDayNum = parsedStart;
    } else {
      if (activeWeekId === 1) startDayNum = 1;
      else if (activeWeekId === 2) startDayNum = 8;
      else if (activeWeekId === 3) startDayNum = 15;
      else startDayNum = 22;
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
    const activeStore = isStoreAdmin && branches[0] ? displayBranchName(branches[0].workingBranch) : selectedStore;
    const wtdRange = getStoreWTDDateRange(activeStore || "All");
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

  const lyPeriodStart = shiftDateYear(periodStart, -1);
  const lyPeriodEnd = shiftDateYear(periodEnd, -1);

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
          const empTargetsMap = {};
          list.forEach((t) => {
            const store = t.storeName;
            const month = t.month;
            if (!targetsMap[store]) targetsMap[store] = {};
            if (!rangesMap[store]) rangesMap[store] = {};
            targetsMap[store][month] = t.weeklyTargets || {};
            rangesMap[store][month] = t.weekRanges || {};
            if (t.employeeTargets && t.employeeTargets.length > 0) {
              if (!empTargetsMap[store]) empTargetsMap[store] = {};
              empTargetsMap[store][month] = t.employeeTargets;
            }
          });
          setWeeklyTargets(targetsMap);
          setStoreWeekRanges(rangesMap);
          setEmployeeTargets(empTargetsMap);
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

        const allLocationIds = ["1", "3", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "23", "25"];

        // Always fetch all location IDs so no store data is missed due to branch name mismatches.
        // Display/filtering is restricted separately by the branches state (which is already filtered per role).
        const locationIds = allLocationIds;

        const getStoreNameFromLocId = (locId) => {
          const foundBranch = branches.find(b => getBranchLocationId(b.workingBranch) === locId);
          if (foundBranch) return displayBranchName(foundBranch.workingBranch);
          const branchKey = Object.keys(BRANCH_LOCATION_MAPPING).find(key => BRANCH_LOCATION_MAPPING[key] === locId);
          if (!branchKey) return "All";
          return displayBranchName(branchKey);
        };

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
        setLastRefreshed(new Date());

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

    // Auto-refresh every 5 minutes for real-time data
    // Silent refresh — no loading spinner so the UI doesn't flicker
    const REFRESH_INTERVAL_MS = 5 * 60 * 1000;
    const silentRefresh = async () => {
      // Clear the performance cache so stale entries don't block fresh data
      window.__performanceCache = {};
      try {
        await fetchPerformance();
      } catch {
        // Silently ignore — data stays as-is until next cycle
      }
    };
    const intervalId = setInterval(silentRefresh, REFRESH_INTERVAL_MS);
    return () => clearInterval(intervalId);
  }, [timeframe, customStartDate, customEndDate, branches, storeWeekRanges]);

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

    // Auto-refresh walkins every 5 minutes
    const intervalId = setInterval(() => { fetchWalkins(); }, 5 * 60 * 1000);
    return () => clearInterval(intervalId);
  }, [timeframe, customStartDate, customEndDate]);

  // Fetch Shoe & Shirt sales from brynex summary API
  useEffect(() => {
    if (branches.length === 0) return;
    const fetchSales = async () => {
      setLoadingSales(true);
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

        const shiftDateYear = (dateStr, years = -1) => {
          if (!dateStr) return "";
          const d = new Date(dateStr);
          if (isNaN(d.getTime())) return "";
          d.setFullYear(d.getFullYear() + years);
          return getLocalDateString(d);
        };
        const lyPeriodStart = shiftDateYear(periodStart, -1);
        const lyPeriodEnd = shiftDateYear(periodEnd, -1);

        // Fetch summary, salesperson lists, and last year summary in parallel
        const [res, resSalespersons, lyRes] = await Promise.all([
          fetch(
            `${baseUrl.baseUrl}api/brynex/shoe-sales/summary?fromDate=${periodStart}&toDate=${periodEnd}`
          ).then(r => r.ok ? r.json() : { stores: [], grandTotal: {} }),
          fetch(
            `${baseUrl.baseUrl}api/brynex/shoe-sales/by-salesperson?fromDate=${periodStart}&toDate=${periodEnd}`
          ).then(r => r.ok ? r.json() : { salespersons: [] }),
          fetch(
            `${baseUrl.baseUrl}api/brynex/shoe-sales/summary?fromDate=${lyPeriodStart}&toDate=${lyPeriodEnd}`
          ).then(r => r.ok ? r.json() : { stores: [], grandTotal: {} })
        ]);

        const stores = Array.isArray(res.stores) ? res.stores : [];
        const salespersonsList = Array.isArray(resSalespersons.salespersons) ? resSalespersons.salespersons : [];
        setSalespersons(salespersonsList);

        const byBranch = {};
        let totalShoeQty = 0, totalShirtQty = 0;
        let totalShoeValue = 0, totalShirtValue = 0;
        let totalShoeBills = 0, totalShirtBills = 0;

        stores.forEach(s => {
          const locCode = String(s.locCode || "");
          if (!locCode) return;

          const shoe  = s.shoe  || {};
          const shirt = s.shirt || {};
          const mixed = s.mixed || {};
          const total = s.total || {};

          // mixed goes to shoe (it's shoe+shirt combo — attributed to shoe bucket)
          const shoeQty   = (shoe.qty   || 0) + (mixed.qty   || 0);
          const shoeValue = (shoe.value || 0) + (mixed.value || 0);
          const shoeBills = (shoe.bills || 0) + (mixed.bills || 0);
          const shirtQty   = shirt.qty   || 0;
          const shirtValue = shirt.value || 0;
          const shirtBills = shirt.bills || 0;

          byBranch[locCode] = {
            totalValue: Math.round((total.value || 0)),
            totalQty:   total.qty   || 0,
            totalBills: total.bills || 0,
            shoeQty,   shoeValue,   shoeBills,
            shirtQty,  shirtValue,  shirtBills,
          };

          totalShoeQty   += shoeQty;
          totalShirtQty  += shirtQty;
          totalShoeValue += shoeValue;
          totalShirtValue += shirtValue;
          totalShoeBills += shoeBills;
          totalShirtBills += shirtBills;
        });

        setSalesData({
          shoeQty:   Math.round(totalShoeQty),
          shirtQty:  Math.round(totalShirtQty),
          shoeValue: Math.round(totalShoeValue),
          shirtValue: Math.round(totalShirtValue),
          shoeBills: totalShoeBills,
          shirtBills: totalShirtBills,
          byBranch
        });

        // Map last year sales data
        const lyStores = Array.isArray(lyRes.stores) ? lyRes.stores : [];
        const lyByBranch = {};
        let lyTotalShoeQty = 0, lyTotalShirtQty = 0;
        let lyTotalShoeValue = 0, lyTotalShirtValue = 0;
        let lyTotalShoeBills = 0, lyTotalShirtBills = 0;

        lyStores.forEach(s => {
          const locCode = String(s.locCode || "");
          if (!locCode) return;

          const shoe  = s.shoe  || {};
          const shirt = s.shirt || {};
          const mixed = s.mixed || {};
          const total = s.total || {};

          const shoeQty   = (shoe.qty   || 0) + (mixed.qty   || 0);
          const shoeValue = (shoe.value || 0) + (mixed.value || 0);
          const shoeBills = (shoe.bills || 0) + (mixed.bills || 0);
          const shirtQty   = shirt.qty   || 0;
          const shirtValue = shirt.value || 0;
          const shirtBills = shirt.bills || 0;

          lyByBranch[locCode] = {
            totalValue: Math.round((total.value || 0)),
            totalQty:   total.qty   || 0,
            totalBills: total.bills || 0,
            shoeQty,   shoeValue,   shoeBills,
            shirtQty,  shirtValue,  shirtBills,
          };

          lyTotalShoeQty   += shoeQty;
          lyTotalShirtQty  += shirtQty;
          lyTotalShoeValue += shoeValue;
          lyTotalShirtValue += shirtValue;
          lyTotalShoeBills += shoeBills;
          lyTotalShirtBills += shirtBills;
        });

        setLySalesData({
          shoeQty:   Math.round(lyTotalShoeQty),
          shirtQty:  Math.round(lyTotalShirtQty),
          shoeValue: Math.round(lyTotalShoeValue),
          shirtValue: Math.round(lyTotalShirtValue),
          shoeBills: lyTotalShoeBills,
          shirtBills: lyTotalShirtBills,
          byBranch: lyByBranch
        });
      } catch (err) {
        console.error("Error fetching sales data in StoreInsights:", err);
      } finally {
        setLoadingSales(false);
      }
    };
    fetchSales();
  }, [branches, timeframe, customStartDate, customEndDate]);

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

  // Generate dynamic chart data based on branches
  const chartData = useMemo(() => {
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
      if (locId === "25") return null;
      const locCode = b.locCode;

      let target = 0;
      if (timeframe === "YTD") {
        target = getYTDStoreTarget(name);
      } else {
        const targetMonth = timeframe === "CUSTOM" ? getMonthNameFromDateStr(customStartDate) : CURRENT_MONTH_LONG;
        target = getStoreTarget(name, 0, timeframe === "CUSTOM" ? "CUSTOM" : timeframe, customFactor, targetMonth);
      }

      const locPeriodList = performanceData[locId] || [];
      const dapprPeriodList = isConsolidated ? (performanceData["25"] || []) : [];
      const dapprPeriodForStore = isConsolidated ? getDapprSquadDataForStore(locId, dapprPeriodList) : [];
      const isGMGRoad = locId === "23";
      const unmappedDapprPeriodList = (isGMGRoad && isConsolidated)
        ? dapprPeriodList.filter(item => {
            const raw = String(item.bookingBy || "").trim().toLowerCase();
            const alphaOnly = raw.replace(/[^a-z0-9]/g, "");
            const dotted = alphaOnly.startsWith("sg") ? "sg." + alphaOnly.slice(2) : raw;
            return !DAPPR_SQUAD_STORE_MAPPING[raw] && !DAPPR_SQUAD_STORE_MAPPING[dotted];
          })
        : [];
      const mergedPeriodList = [...locPeriodList, ...dapprPeriodForStore, ...unmappedDapprPeriodList];
      const rentalValue = mergedPeriodList.reduce((sum, item) => sum + (item.totalValue || 0), 0);

      let achieved = rentalValue;

      if (isConsolidated) {
        // Use totalValue (matches DSRReport's fetchSalesForBranchRange calculation)
        const branchSales = (locCode && salesData.byBranch?.[locCode]) || {};
        const salesTotalValue = branchSales.totalValue || 0;

        achieved = rentalValue + salesTotalValue;
      }

      const balance = target - achieved;
      const pct = target > 0 ? Math.round((achieved / target) * 100) : 0;
      return { 
        name, 
        target, 
        achieved, 
        balance, 
        pct, 
        abbr: getAbbreviation(name),
        _id: b._id
      };
    }).filter(Boolean);

    return list;
  }, [branches, isConsolidated, timeframe, customStartDate, customEndDate, weeklyTargets, performanceData, salesData]);

  // Filter stores by cluster if selected
  const filteredStoresForKPIs = useMemo(() => {
    let list = chartData;
    if (clusterFilter !== "All") {
      const selectedClusterAdmin = clusters.find(c => String(c._id) === clusterFilter);
      if (selectedClusterAdmin) {
        const assignedIds = (selectedClusterAdmin.branches || []).map(b => String(b._id || b));
        list = chartData.filter(s => assignedIds.includes(String(s._id)));
      } else {
        list = [];
      }
    }
    if (storeFilter !== "All") {
      list = list.filter(s => s.name === storeFilter);
    }
    return list;
  }, [chartData, clusterFilter, clusters, storeFilter]);

  // Stores available for the store filter dropdown — scoped to selected cluster
  const storeOptionsForFilter = useMemo(() => {
    let list = chartData;
    if (clusterFilter !== "All") {
      const selectedClusterAdmin = clusters.find(c => String(c._id) === clusterFilter);
      if (selectedClusterAdmin) {
        const assignedIds = (selectedClusterAdmin.branches || []).map(b => String(b._id || b));
        list = chartData.filter(s => assignedIds.includes(String(s._id)));
      } else {
        list = [];
      }
    }
    return list.map(s => s.name).filter(Boolean).sort();
  }, [chartData, clusterFilter, clusters]);

  // Filtered chart data based on classification (All, On Track, At Risk)
  const filteredChartData = useMemo(() => {
    let list = filteredStoresForKPIs;
    if (chartFilter === "On Track") {
      return list.filter(item => item.pct >= 90);
    }
    if (chartFilter === "At Risk") {
      return list.filter(item => item.pct < 90);
    }
    return list;
  }, [filteredStoresForKPIs, chartFilter]);

  // Employee-level chart data for store_admin — shows each employee's achieved vs assigned target
  const employeeChartData = useMemo(() => {
    if (!isStoreAdmin || branches.length === 0) return [];
    const singleBranch = branches[0];
    const locId = getBranchLocationId(singleBranch?.workingBranch);
    if (!locId) return [];
    const locPeriodList = performanceData[locId] || [];

    // Determine the target month name from the active timeframe
    const targetMonthName = timeframe === "CUSTOM"
      ? (customStartDate ? new Date(customStartDate).toLocaleString("en-US", { month: "long" }) : CURRENT_MONTH_LONG)
      : CURRENT_MONTH_LONG;

    const storeName = displayBranchName(singleBranch.workingBranch);
    const storeEmpTargets = employeeTargets[storeName]?.[targetMonthName] || [];

    // Helper: resolve a staff member's target for the current timeframe
    const resolveStaffTarget = (staffName) => {
      const empT = storeEmpTargets.find(e => e.staffName === staffName);
      if (!empT || !empT.weeklyTargets) return 0;
      const wt = empT.weeklyTargets;

      if (timeframe === "MTD") {
        return [1, 2, 3, 4].reduce((s, wId) => s + (wt[wId] || 0), 0);
      }
      if (timeframe === "WTD") {
        const weekId = getCurrentWeekId(storeName, targetMonthName);
        return wt[weekId] || 0;
      }
      if (timeframe === "CUSTOM") {
        return getCustomRangeTarget(storeName, customStartDate, customEndDate, targetMonthName, wt);
      }
      return 0;
    };

    return locPeriodList
      .filter(item => item.bookingBy)
      .map(item => {
        const fullName = String(item.bookingBy || "").trim();
        const firstName = fullName.split(/\s+/)[0] || fullName;
        const achieved = item.totalValue || 0;
        const target = resolveStaffTarget(fullName);
        const balance = target - achieved;
        const pct = target > 0 ? Math.round((achieved / target) * 100) : 0;
        return { name: fullName, abbr: firstName, achieved, target, balance, pct };
      })
      .filter(item => item.achieved > 0)
      .sort((a, b) => b.achieved - a.achieved);
  }, [isStoreAdmin, branches, performanceData, employeeTargets, timeframe, customStartDate, customEndDate]);



  // Dynamic KPI Card Data
  const stats = useMemo(() => {
    // Totals from filtered stores
    const totalTarget = filteredStoresForKPIs.reduce((acc, c) => acc + c.target, 0);
    const totalAchieved = filteredStoresForKPIs.reduce((acc, c) => acc + c.achieved, 0);
    const achievedPct = totalTarget > 0 ? Math.round((totalAchieved / totalTarget) * 100) : 0;

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

    // --- Base Aggregations ---



    let rentalBills = 0;
    let rentalQty = 0;
    let rentalValue = 0;

    let lyRentalValue = 0;
    let lyRentalBills = 0;
    let lyRentalQty = 0;

    let shoeValue = 0, shirtValue = 0;
    let shoeQty = 0, shirtQty = 0;
    let shoeBills = 0, shirtBills = 0;

    let customerWalkins = 0;
    let lyCustomerWalkins = 0;
    let convertedWalkinsCount = 0;
    let lyConvertedWalkinsCount = 0;

    filteredStoresForKPIs.forEach(c => {
      const name = c.name;
      const locId = getBranchLocationId(name);
      if (!locId || locId === "25") return; // Skip Dappr Squad itself

      // 1. Current Rental
      const locPeriodList = performanceData[locId] || [];
      const dapprPeriodList = isConsolidated ? (performanceData["25"] || []) : [];
      const dapprPeriodForStore = isConsolidated ? getDapprSquadDataForStore(locId, dapprPeriodList) : [];
      const isGMGRoad = locId === "23";
      const unmappedDapprPeriodList = (isGMGRoad && isConsolidated)
        ? dapprPeriodList.filter(item => {
            const raw = String(item.bookingBy || "").trim().toLowerCase();
            const alphaOnly = raw.replace(/[^a-z0-9]/g, "");
            const dotted = alphaOnly.startsWith("sg") ? "sg." + alphaOnly.slice(2) : raw;
            return !DAPPR_SQUAD_STORE_MAPPING[raw] && !DAPPR_SQUAD_STORE_MAPPING[dotted];
          })
        : [];
      const mergedPeriodList = [...locPeriodList, ...dapprPeriodForStore, ...unmappedDapprPeriodList];

      rentalValue += mergedPeriodList.reduce((sum, item) => sum + (item.totalValue || 0), 0);
      rentalBills += mergedPeriodList.reduce((sum, item) => sum + (item.total_Number_Of_Bill || 0), 0);
      rentalQty += mergedPeriodList.reduce((sum, item) => sum + (item.totalQuantity ?? 0), 0);

      // 2. Last Year Rental
      const lyLocPeriodList = lyPerformanceData[locId] || [];
      const lyDapprPeriodList = isConsolidated ? (lyPerformanceData["25"] || []) : [];
      const lyDapprPeriodForStore = isConsolidated ? getDapprSquadDataForStore(locId, lyDapprPeriodList) : [];
      const lyUnmappedDapprPeriodList = (isGMGRoad && isConsolidated)
        ? lyDapprPeriodList.filter(item => {
            const raw = String(item.bookingBy || "").trim().toLowerCase();
            const alphaOnly = raw.replace(/[^a-z0-9]/g, "");
            const dotted = alphaOnly.startsWith("sg") ? "sg." + alphaOnly.slice(2) : raw;
            return !DAPPR_SQUAD_STORE_MAPPING[raw] && !DAPPR_SQUAD_STORE_MAPPING[dotted];
          })
        : [];
      const lyMergedPeriodList = [...lyLocPeriodList, ...lyDapprPeriodForStore, ...lyUnmappedDapprPeriodList];

      lyRentalValue += lyMergedPeriodList.reduce((sum, item) => sum + (item.totalValue || 0), 0);
      lyRentalBills += lyMergedPeriodList.reduce((sum, item) => sum + (item.total_Number_Of_Bill || 0), 0);
      lyRentalQty += lyMergedPeriodList.reduce((sum, item) => sum + (item.totalQuantity ?? 0), 0);

      // 3. Shoe & Shirt Sales  (use DSRReport-compatible totals from byBranch)
      const bObj = branches.find(b => normalizeForMatch(b.workingBranch) === normalizeForMatch(name));
      const locCode = bObj?.locCode;
      if (locCode && salesData.byBranch?.[locCode]) {
        const branchSales = salesData.byBranch[locCode];
        // Use totalValue/totalQty/totalBills which match DSRReport's invoice.value calc
        shoeValue += branchSales.totalValue || 0;
        shirtValue += 0; // shirt already included in totalValue
        shoeQty += branchSales.totalQty || 0;
        shirtQty += 0;
        shoeBills += branchSales.totalBills || 0;
        shirtBills += 0;
      }

      // 4. Walkins
      const storeKeyVal = normalizeForMatch(name);
      const storeWalkins = walkins.filter(w => 
        (w.storeId === bObj?._id || w.store === bObj?.workingBranch) && 
        isWalkinCreatedInRange(w.createdAt, periodStart, periodEnd)
      );
      customerWalkins += storeWalkins.length;
      convertedWalkinsCount += storeWalkins.filter(w => w.status?.toLowerCase() === "booked").length;

      const lyStoreWalkins = lyWalkins.filter(w => 
        (w.storeId === bObj?._id || w.store === bObj?.workingBranch) && 
        isWalkinCreatedInRange(w.createdAt, lyPeriodStart, lyPeriodEnd)
      );
      lyCustomerWalkins += lyStoreWalkins.length;
      lyConvertedWalkinsCount += lyStoreWalkins.filter(w => w.status?.toLowerCase() === "booked").length;
    });

    // (timeframe variables are initialized at the top of the memo block)

    let dapprSquadBills = 0;
    let dapprSquadValue = 0;
    let dapprSquadQty = 0;

    let lyDapprSquadBills = 0;
    let lyDapprSquadValue = 0;
    let lyDapprSquadQty = 0;

    const squadPeriodList = isConsolidated ? (performanceData["25"] || []) : [];
    const lySquadPeriodList = isConsolidated ? (lyPerformanceData["25"] || []) : [];

    filteredStoresForKPIs.forEach(c => {
      const name = c.name;
      const locId = getBranchLocationId(name);
      if (!locId || locId === "25") return;

      const dapprPeriodForStore = getDapprSquadDataForStore(locId, squadPeriodList);
      const isGMGRoad = locId === "23";
      const unmappedDapprPeriodList = isGMGRoad
        ? squadPeriodList.filter(item => {
            const raw = String(item.bookingBy || "").trim().toLowerCase();
            const alphaOnly = raw.replace(/[^a-z0-9]/g, "");
            const dotted = alphaOnly.startsWith("sg") ? "sg." + alphaOnly.slice(2) : raw;
            return !DAPPR_SQUAD_STORE_MAPPING[raw] && !DAPPR_SQUAD_STORE_MAPPING[dotted];
          })
        : [];
      const mergedList = [...dapprPeriodForStore, ...unmappedDapprPeriodList];

      dapprSquadBills += mergedList.reduce((sum, item) => sum + (item.total_Number_Of_Bill || 0), 0);
      dapprSquadValue += mergedList.reduce((sum, item) => sum + (item.totalValue || 0), 0);
      dapprSquadQty += mergedList.reduce((sum, item) => sum + (item.totalQuantity || item.total_Number_Of_Bill || 0), 0);

      // Last Year Dappr Squad
      const lyDapprPeriodForStore = getDapprSquadDataForStore(locId, lySquadPeriodList);
      const lyUnmappedDapprPeriodList = isGMGRoad
        ? lySquadPeriodList.filter(item => {
            const raw = String(item.bookingBy || "").trim().toLowerCase();
            const alphaOnly = raw.replace(/[^a-z0-9]/g, "");
            const dotted = alphaOnly.startsWith("sg") ? "sg." + alphaOnly.slice(2) : raw;
            return !DAPPR_SQUAD_STORE_MAPPING[raw] && !DAPPR_SQUAD_STORE_MAPPING[dotted];
          })
        : [];
      const lyMergedList = [...lyDapprPeriodForStore, ...lyUnmappedDapprPeriodList];

      lyDapprSquadBills += lyMergedList.reduce((sum, item) => sum + (item.total_Number_Of_Bill || 0), 0);
      lyDapprSquadValue += lyMergedList.reduce((sum, item) => sum + (item.totalValue || 0), 0);
      lyDapprSquadQty += lyMergedList.reduce((sum, item) => sum + (item.totalQuantity || item.total_Number_Of_Bill || 0), 0);
    });

    // Database-wide Walkins override for consolidated cluster filter "All"
    if (clusterFilter === "All" && !isStoreAdmin) {
      customerWalkins = walkins.filter(w => isWalkinCreatedInRange(w.createdAt, periodStart, periodEnd)).length;
      lyCustomerWalkins = lyWalkins.filter(w => isWalkinCreatedInRange(w.createdAt, lyPeriodStart, lyPeriodEnd)).length;
      convertedWalkinsCount = walkins.filter(w => 
        isWalkinCreatedInRange(w.createdAt, periodStart, periodEnd) && 
        w.status?.toLowerCase() === "booked"
      ).length;
      lyConvertedWalkinsCount = lyWalkins.filter(w => 
        isWalkinCreatedInRange(w.createdAt, lyPeriodStart, lyPeriodEnd) && 
        w.status?.toLowerCase() === "booked"
      ).length;
    }

    const getChangeStats = (curr, prev) => {
      const change = prev > 0 ? Math.round(((curr - prev) / prev) * 100) : 0;
      return {
        display: change >= 0 ? `+${change}%` : `${change}%`,
        color: change >= 0 ? "text-emerald-600" : "text-rose-500",
        trend: change >= 0 ? "up" : "down",
        trendColor: change >= 0 ? "#00A36C" : "#e11d48",
        curr,
        prev,
        diff: curr - prev
      };
    };

    const googleReviews = (() => {
      // Sum thisMonth counts for all stores in the current filter
      const storeNames = filteredStoresForKPIs.map(s => s.name);
      if (storeNames.length === 0) {
        // "All" — sum everything
        return Object.values(googleReviewData).reduce((sum, d) => sum + (d?.thisMonth || 0), 0);
      }
      return storeNames.reduce((sum, name) => {
        const entry = googleReviewData[name];
        return sum + (entry?.thisMonth || 0);
      }, 0);
    })();

    const lyGoogleReviews = (() => {
      const storeNames = filteredStoresForKPIs.map(s => s.name);
      if (storeNames.length === 0) {
        return Object.values(googleReviewData).reduce((sum, d) => sum + (d?.lyThisMonth || 0), 0);
      }
      return storeNames.reduce((sum, name) => {
        const entry = googleReviewData[name];
        return sum + (entry?.lyThisMonth || 0);
      }, 0);
    })();
    const googleRating = (() => {
      const storeNames = filteredStoresForKPIs.map(s => s.name);
      const activeEntries = storeNames.length === 0 
        ? Object.values(googleReviewData)
        : storeNames.map(name => googleReviewData[name]).filter(Boolean);
      
      const ratedEntries = activeEntries.filter(entry => entry.rating > 0);
      if (ratedEntries.length === 0) return 0;
      
      const sum = ratedEntries.reduce((acc, curr) => acc + (curr.rating || 0), 0);
      return parseFloat((sum / ratedEntries.length).toFixed(1));
    })();

    const totalReviewsCount = (() => {
      const storeNames = filteredStoresForKPIs.map(s => s.name);
      if (storeNames.length === 0) {
        return Object.values(googleReviewData).reduce((sum, d) => sum + (d?.total || 0), 0);
      }
      return storeNames.reduce((sum, name) => {
        const entry = googleReviewData[name];
        return sum + (entry?.total || 0);
      }, 0);
    })();

    if (isConsolidated) {
      const consolidatedValue = rentalValue + shoeValue + shirtValue;
      const consolidatedBills = rentalBills + shoeBills + shirtBills;
      const consolidatedTotalQty = rentalQty + shoeQty + shirtQty;

      const lyConsolidatedValue = lyRentalValue;
      const lyConsolidatedBills = lyRentalBills;
      const lyConsolidatedQty = lyRentalQty;

      const trueAchievedPct = totalTarget > 0 ? Math.round((consolidatedValue / totalTarget) * 100) : 0;

      const basketSize = consolidatedBills > 0 ? (consolidatedTotalQty / consolidatedBills).toFixed(1) : "0.0";
      const basketValue = consolidatedBills > 0 ? Math.round(consolidatedValue / consolidatedBills) : 0;
      const conversionRate = customerWalkins > 0 ? Math.min(100, Math.round((convertedWalkinsCount / customerWalkins) * 100)) : 0;

      const valChange = getChangeStats(consolidatedValue * roleMultiplier, lyConsolidatedValue * roleMultiplier);
      const billsChange = getChangeStats(consolidatedBills * roleMultiplier, lyConsolidatedBills * roleMultiplier);
      const qtyChange = getChangeStats(consolidatedTotalQty * roleMultiplier, lyConsolidatedQty * roleMultiplier);
      const absChange = getChangeStats(
        parseFloat(basketSize),
        lyConsolidatedBills > 0 ? parseFloat((lyConsolidatedQty / lyConsolidatedBills).toFixed(1)) : 0.0
      );
      const abvChange = getChangeStats(
        basketValue,
        lyConsolidatedBills > 0 ? Math.round(lyConsolidatedValue / lyConsolidatedBills) : 0
      );
      const walkChange = getChangeStats(customerWalkins * roleMultiplier, lyCustomerWalkins * roleMultiplier);

      // For the individual Shoe Sale / Shirt Sales cards, use per-category breakdown
      // Recalculate from byBranch using shoeValue/shirtValue (category-level)
      let cardShoeQty = 0, cardShirtQty = 0;
      let cardShoeValue = 0, cardShirtValue = 0;
      let lyCardShoeQty = 0, lyCardShirtQty = 0;
      let lyCardShoeValue = 0, lyCardShirtValue = 0;

      filteredStoresForKPIs.forEach(c => {
        const cName = c.name;
        const cBObj = branches.find(b => normalizeForMatch(b.workingBranch) === normalizeForMatch(cName));
        const cLocCode = cBObj?.locCode;
        if (cLocCode && salesData.byBranch?.[cLocCode]) {
          const bs = salesData.byBranch[cLocCode];
          cardShoeQty += bs.shoeQty || 0;
          cardShirtQty += bs.shirtQty || 0;
          cardShoeValue += bs.shoeValue || 0;
          cardShirtValue += bs.shirtValue || 0;
        }
        if (cLocCode && lySalesData.byBranch?.[cLocCode]) {
          const lbs = lySalesData.byBranch[cLocCode];
          lyCardShoeQty += lbs.shoeQty || 0;
          lyCardShirtQty += lbs.shirtQty || 0;
          lyCardShoeValue += lbs.shoeValue || 0;
          lyCardShirtValue += lbs.shirtValue || 0;
        }
      });

      const lyConversionRate = lyCustomerWalkins > 0 ? Math.min(100, Math.round((lyConvertedWalkinsCount / lyCustomerWalkins) * 100)) : 0;
      const conversionChange = getChangeStats(conversionRate, lyConversionRate);
      const shoeChange = getChangeStats(cardShoeQty, lyCardShoeQty);
      const shirtChange = getChangeStats(cardShirtQty, lyCardShirtQty);
      const dapprChange = getChangeStats(dapprSquadBills, lyDapprSquadBills);
      const reviewsChange = getChangeStats(googleReviews, lyGoogleReviews);

      return {
        achievedPct: trueAchievedPct,
        targetValue: totalTarget * roleMultiplier,
        achievedValue: consolidatedValue * roleMultiplier,
        billsGenerated: consolidatedBills * roleMultiplier,
        quantitySold: consolidatedTotalQty * roleMultiplier,
        basketSize,
        basketValue,
        customerWalkins: customerWalkins * roleMultiplier,
        conversionRate,
        convertedWalkins: convertedWalkinsCount * roleMultiplier,
        shoeSale: cardShoeQty,
        shoeValue: cardShoeValue,
        shirtSales: cardShirtQty,
        shirtValue: cardShirtValue,
        dapprSquadBills: dapprSquadBills * roleMultiplier,
        dapprSquadValue: dapprSquadValue * roleMultiplier,
        googleReviews,
        googleRating,
        
        valChangeDisplay: valChange.display, valChangeColor: valChange.color, valTrend: valChange.trend, valTrendColor: valChange.trendColor,
        billsChangeDisplay: billsChange.display, billsChangeColor: billsChange.color, billsTrend: billsChange.trend, billsTrendColor: billsChange.trendColor,
        qtyChangeDisplay: qtyChange.display, qtyChangeColor: qtyChange.color, qtyTrend: qtyChange.trend, qtyTrendColor: qtyChange.trendColor,
        absChangeDisplay: absChange.display, absChangeColor: absChange.color, absTrend: absChange.trend, absTrendColor: absChange.trendColor,
        abvChangeDisplay: abvChange.display, abvChangeColor: abvChange.color, abvTrend: abvChange.trend, abvTrendColor: abvChange.trendColor,
        walkChangeDisplay: walkChange.display, walkChangeColor: walkChange.color, walkTrend: walkChange.trend, walkTrendColor: walkChange.trendColor,
        valChange,
        billsChange,
        qtyChange,
        absChange,
        abvChange,
        walkChange,
        lyConversionRate,
        conversionChange,
        shoeChange,
        shirtChange,
        dapprChange,
        reviewsChange,
        lyCardShoeQty,
        lyCardShirtQty,
        lyCardShoeValue,
        lyCardShirtValue,
        lyGoogleReviews,
        totalReviewsCount
      };
    } else {
      const trueRentalValue = rentalValue;
      const trueRentalBills = rentalBills;
      const trueRentalQty = rentalQty;

      const lyTrueRentalValue = lyRentalValue;
      const lyTrueRentalBills = lyRentalBills;
      const lyTrueRentalQty = lyRentalQty;

      const trueAchievedPct = totalTarget > 0 ? Math.round((trueRentalValue / totalTarget) * 100) : 0;
      const conversionRate = customerWalkins > 0 ? Math.min(100, Math.round((convertedWalkinsCount / customerWalkins) * 100)) : 0;

      const basketSize = trueRentalBills > 0 ? (trueRentalQty / trueRentalBills).toFixed(1) : "0.0";
      const basketValue = trueRentalBills > 0 ? Math.round(trueRentalValue / trueRentalBills) : 0;

      const lyBasketSize = lyTrueRentalBills > 0 ? parseFloat((lyTrueRentalQty / lyTrueRentalBills).toFixed(1)) : 0.0;
      const lyBasketValue = lyTrueRentalBills > 0 ? Math.round(lyTrueRentalValue / lyTrueRentalBills) : 0;

      const valChange = getChangeStats(trueRentalValue * roleMultiplier, lyTrueRentalValue * roleMultiplier);
      const billsChange = getChangeStats(trueRentalBills * roleMultiplier, lyTrueRentalBills * roleMultiplier);
      const qtyChange = getChangeStats(trueRentalQty * roleMultiplier, lyTrueRentalQty * roleMultiplier);
      const absChange = getChangeStats(parseFloat(basketSize), lyBasketSize);

      const abvChange = getChangeStats(basketValue, lyBasketValue);
      const walkChange = getChangeStats(customerWalkins * roleMultiplier, lyCustomerWalkins * roleMultiplier);

      let lyCardShoeQty = 0, lyCardShirtQty = 0;
      let lyCardShoeValue = 0, lyCardShirtValue = 0;
      filteredStoresForKPIs.forEach(c => {
        const cName = c.name;
        const cBObj = branches.find(b => normalizeForMatch(b.workingBranch) === normalizeForMatch(cName));
        const cLocCode = cBObj?.locCode;
        if (cLocCode && lySalesData.byBranch?.[cLocCode]) {
          const lbs = lySalesData.byBranch[cLocCode];
          lyCardShoeQty += lbs.shoeQty || 0;
          lyCardShirtQty += lbs.shirtQty || 0;
          lyCardShoeValue += lbs.shoeValue || 0;
          lyCardShirtValue += lbs.shirtValue || 0;
        }
      });

      const lyConversionRate = lyCustomerWalkins > 0 ? Math.min(100, Math.round((lyConvertedWalkinsCount / lyCustomerWalkins) * 100)) : 0;
      const conversionChange = getChangeStats(conversionRate, lyConversionRate);
      const shoeChange = getChangeStats(shoeQty, lyCardShoeQty);
      const shirtChange = getChangeStats(shirtQty, lyCardShirtQty);
      const dapprChange = getChangeStats(dapprSquadBills, lyDapprSquadBills);
      const reviewsChange = getChangeStats(googleReviews, lyGoogleReviews);

      return {
        achievedPct: trueAchievedPct,
        targetValue: totalTarget * roleMultiplier,
        achievedValue: trueRentalValue * roleMultiplier,
        billsGenerated: trueRentalBills * roleMultiplier,
        quantitySold: trueRentalQty * roleMultiplier,
        basketSize,
        basketValue,
        customerWalkins: customerWalkins * roleMultiplier,
        conversionRate,
        convertedWalkins: convertedWalkinsCount * roleMultiplier,
        shoeSale: shoeQty,
        shoeValue: shoeValue,
        shirtSales: shirtQty,
        shirtValue: shirtValue,
        dapprSquadBills: dapprSquadBills * roleMultiplier,
        dapprSquadValue: dapprSquadValue * roleMultiplier,
        googleReviews,
        googleRating,
        
        valChangeDisplay: valChange.display, valChangeColor: valChange.color, valTrend: valChange.trend, valTrendColor: valChange.trendColor,
        billsChangeDisplay: billsChange.display, billsChangeColor: billsChange.color, billsTrend: billsChange.trend, billsTrendColor: billsChange.trendColor,
        qtyChangeDisplay: qtyChange.display, qtyChangeColor: qtyChange.color, qtyTrend: qtyChange.trend, qtyTrendColor: qtyChange.trendColor,
        absChangeDisplay: absChange.display, absChangeColor: absChange.color, absTrend: absChange.trend, absTrendColor: absChange.trendColor,
        abvChangeDisplay: abvChange.display, abvChangeColor: abvChange.color, abvTrend: abvChange.trend, abvTrendColor: abvChange.trendColor,
        walkChangeDisplay: walkChange.display, walkChangeColor: walkChange.color, walkTrend: walkChange.trend, walkTrendColor: walkChange.trendColor,
        valChange,
        billsChange,
        qtyChange,
        absChange,
        abvChange,
        walkChange,
        lyConversionRate,
        conversionChange,
        shoeChange,
        shirtChange,
        dapprChange,
        reviewsChange,
        lyCardShoeQty,
        lyCardShirtQty,
        lyCardShoeValue,
        lyCardShirtValue,
        lyGoogleReviews,
        totalReviewsCount
      };
    }
  }, [chartData, filteredStoresForKPIs, isConsolidated, roleFilter, performanceData, lyPerformanceData, walkins, lyWalkins, timeframe, customStartDate, customEndDate, salesData, lySalesData, isStoreAdmin, isClusterAdmin, clusterFilter, storeFilter, branches, periodStart, periodEnd, lyPeriodStart, lyPeriodEnd, googleReviewData]);

  // Store ranking data calculations
  const rankingData = useMemo(() => {
    const showStaffRanking = isStoreAdmin || storeFilter !== "All";
    if (showStaffRanking) {
      if (branches.length === 0) return [];
      const singleBranch = storeFilter !== "All"
        ? branches.find(b => displayBranchName(b.workingBranch) === storeFilter)
        : branches[0];

      if (!singleBranch) return [];
      const name = displayBranchName(singleBranch?.workingBranch);
      const storeKeyVal = normalizeForMatch(singleBranch?.workingBranch);
      const locId = getBranchLocationId(singleBranch?.workingBranch);
      const locCode = singleBranch.locCode || getBranchLocCode(singleBranch.workingBranch, branches);

      const locPeriodList = performanceData[locId] || [];

      // Find shoe sales specifically for this branch's locCode from salespersons
      const getSalesDataForStaff = (staffName) => {
        const staffKey = normalizeForMatch(staffName);
        const match = salespersons.find(sp => normalizeForMatch(sp.salesperson) === staffKey);
        if (!match) return { bills: 0, qty: 0, value: 0 };
        const storeMatch = match.stores && match.stores.find(st => String(st.locCode) === String(locCode));
        if (storeMatch) {
          const tot = storeMatch.total || {};
          return {
            bills: tot.bills || 0,
            qty: tot.qty || 0,
            value: tot.value || 0
          };
        }
        return { bills: 0, qty: 0, value: 0 };
      };

      const canonicalizeName = (rawName) => {
        if (!rawName) return "";
        const strName = String(rawName);
        if (strName.toLowerCase() === "unassigned") return "Unassigned";
        const normName = normalizeForMatch(strName);
        const match = locPeriodList.find(n => n && normalizeForMatch(n.bookingBy) === normName);
        return match ? match.bookingBy : strName;
      };

      const salesStaffNames = isConsolidated
        ? salespersons
            .filter(sp => sp.stores && sp.stores.some(st => String(st.locCode) === String(locCode)))
            .map(sp => canonicalizeName(sp.salesperson))
            .filter(Boolean)
        : [];

      const rawStaffNames = [
        ...locPeriodList.map(x => x && x.bookingBy),
        ...salesStaffNames
      ].filter(name => typeof name === "string" && name.trim() !== "");

      const staffNames = [];
      const seenNormalized = new Set();
      
      const sortedStaffNames = Array.from(new Set(rawStaffNames)).sort((a, b) => {
        const aUpper = /[A-Z]/.test(a);
        const bUpper = /[A-Z]/.test(b);
        if (aUpper && !bUpper) return -1;
        if (!aUpper && bUpper) return 1;
        return (b || "").length - (a || "").length;
      });

      sortedStaffNames.forEach(name => {
        if (!name) return;
        const norm = normalizeForMatch(name);
        if (norm && !seenNormalized.has(norm)) {
          seenNormalized.add(norm);
          staffNames.push(name);
        }
      });

      // Filter walkins for this store
      const storeWalkins = walkins.filter(w => 
        (w.storeId === singleBranch?._id || w.store === singleBranch?.workingBranch) && 
        isWalkinCreatedInRange(w.createdAt, periodStart, periodEnd)
      );

      // Sum total value of the store (rentals + sales if consolidated) to calculate contribution %
      let storeTotalValue = locPeriodList.reduce((sum, item) => sum + (item.totalValue || 0), 0);
      if (isConsolidated) {
        // Add total shoe sales specifically for this branch
        const branchSales = salesData.byBranch?.[locCode] || {};
        storeTotalValue += branchSales.totalValue || 0;
      }

      if (staffNames.length === 0) {
        // Fallback mock staff if no real data exists yet
        const mockStaff = [
          { name: "Staff Arun", targetAchieved: 15400, contribution: 45, abs: 2.1, abv: 1800, conversion: 85 },
          { name: "Staff Suresh", targetAchieved: 12100, contribution: 35, abs: 2.5, abv: 2100, conversion: 90 },
          { name: "Staff Vipin", targetAchieved: 6800, contribution: 20, abs: 1.8, abv: 1500, conversion: 75 },
        ];
        return mockStaff;
      }

      return staffNames.map(staffName => {
        const staffKey = normalizeForMatch(staffName);
        const staffFtdList = locPeriodList.filter(x => x && normalizeForMatch(x.bookingBy) === staffKey);

        let bills = staffFtdList.reduce((sum, x) => sum + (x.total_Number_Of_Bill || 0), 0);
        let qty = staffFtdList.reduce((sum, x) => sum + (x.totalQuantity || 0), 0);
        let value = staffFtdList.reduce((sum, x) => sum + (x.totalValue || 0), 0);

        if (isConsolidated) {
          const staffSales = getSalesDataForStaff(staffName);
          bills += staffSales.bills || 0;
          qty += staffSales.qty || 0;
          value += staffSales.value || 0;
        }

        const abs = bills > 0 ? parseFloat((qty / bills).toFixed(1)) : 0;
        const abv = bills > 0 ? Math.round(value / bills) : 0;

        // Conversion = bills / walkins for this staff
        const staffWalkins = storeWalkins.filter(w => {
          const wStaff = w.staff || w.staffName || (typeof w.createdBy === 'string' ? w.createdBy : w.createdBy?.name) || w.managerName || '';
          if (!wStaff) {
            return staffKey === "unassigned" || staffName.toLowerCase() === "unassigned";
          }
          return isStaffNameMatch(wStaff, staffName);
        }).length;
        const conversion = staffWalkins > 0 ? Math.min(100, Math.round((bills / staffWalkins) * 100)) : 0;

        // Contribution % of total store revenue
        const contribution = storeTotalValue > 0 ? Math.round((value / storeTotalValue) * 100) : 0;

        return {
          name: staffName,
          targetAchieved: value, // will show under "Value" column, and sort by value
          contribution,
          abs,
          abv,
          conversion
        };
      });
    }

    const defaultStores = [
      { name: "Zorucci Edappally", targetAchieved: 96, contribution: 96, abs: 2.3, abv: 2200, conversion: 87 },
      { name: "Suitor Guy Edappally", targetAchieved: 92, contribution: 96, abs: 3.2, abv: 3124, conversion: 85 },
      { name: "Suitor Guy Trivandrum", targetAchieved: 90, contribution: 96, abs: 2.6, abv: 3243, conversion: 90 },
      { name: "Suitor Guy Vadakara", targetAchieved: 86, contribution: 96, abs: 3.1, abv: 2020, conversion: 94 },
      { name: "Zorucci Perinthalmanna", targetAchieved: 84, contribution: 96, abs: 2.8, abv: 2811, conversion: 79 },
      { name: "Suitor Guy Manjeri", targetAchieved: 83, contribution: 96, abs: 3.4, abv: 2429, conversion: 81 }
    ];

    const activeBranches = branches
      .filter(b => getBranchLocationId(b.workingBranch) !== "25")
      .filter(b => {
        if (clusterFilter === "All") return true;
        const selectedClusterAdmin = clusters.find(c => String(c._id) === clusterFilter);
        if (!selectedClusterAdmin) return false;
        const assignedIds = (selectedClusterAdmin.branches || []).map(br => String(br._id || br));
        return assignedIds.includes(String(b._id));
      })
      .filter(b => storeFilter === "All" || displayBranchName(b.workingBranch) === storeFilter);

    if (isConsolidated) {
      // Calculate consolidated total value across all stores for contribution %
      let totalConsolidatedValue = 0;
      const storeMetrics = activeBranches.map(b => {
        const name = displayBranchName(b.workingBranch);
        const locId = getBranchLocationId(b.workingBranch);
        const locCode = b.locCode;

        const locPeriodList = performanceData[locId] || [];
        const dapprPeriodList = isConsolidated ? (performanceData["25"] || []) : [];
        const dapprPeriodForStore = isConsolidated ? getDapprSquadDataForStore(locId, dapprPeriodList) : [];
        const isGMGRoad = locId === "23";
        const unmappedDapprPeriodList = (isGMGRoad && isConsolidated)
          ? dapprPeriodList.filter(item => {
              const raw = String(item.bookingBy || "").trim().toLowerCase();
              const alphaOnly = raw.replace(/[^a-z0-9]/g, "");
              const dotted = alphaOnly.startsWith("sg") ? "sg." + alphaOnly.slice(2) : raw;
              return !DAPPR_SQUAD_STORE_MAPPING[raw] && !DAPPR_SQUAD_STORE_MAPPING[dotted];
            })
          : [];
        const mergedPeriodList = [...locPeriodList, ...dapprPeriodForStore, ...unmappedDapprPeriodList];

        const rentalVal = mergedPeriodList.reduce((sum, item) => sum + (item.totalValue || 0), 0);
        const rentalBills = mergedPeriodList.reduce((sum, item) => sum + (item.total_Number_Of_Bill || 0), 0);
        const rentalQty = mergedPeriodList.reduce((sum, item) => sum + (item.totalQuantity ?? 0), 0);

        const branchSales = (locCode && salesData.byBranch?.[locCode]) || {};
        // Use totalValue/totalBills/totalQty which match DSRReport's invoice.value calculation
        const salesTotalVal = branchSales.totalValue || 0;
        const salesTotalBills = branchSales.totalBills || 0;
        const salesTotalQty = branchSales.totalQty || 0;

        const value = rentalVal + salesTotalVal;
        const bills = rentalBills + salesTotalBills;
        const qty = rentalQty + salesTotalQty;

        totalConsolidatedValue += value;

        const chartItem = chartData.find(c => normalizeForMatch(c.name) === normalizeForMatch(name));
        const targetAchieved = chartItem ? Math.round(chartItem.pct) : 0;

        const abs = bills > 0 ? parseFloat((qty / bills).toFixed(1)) : 0.0;
        const abv = bills > 0 ? Math.round(value / bills) : 0;

        const bObj = branches.find(br => normalizeForMatch(br.workingBranch) === normalizeForMatch(name));
        const storeKeyVal = normalizeForMatch(name);
        const storeWalkins = walkins.filter(w => 
          (w.storeId === bObj?._id || w.store === bObj?.workingBranch) && 
          isWalkinCreatedInRange(w.createdAt, periodStart, periodEnd)
        ).length;
        const conversion = storeWalkins > 0 ? Math.min(100, Math.round((bills / storeWalkins) * 100)) : 0;

        return { name, targetAchieved, value, abs, abv, conversion };
      });

      return storeMetrics.map(item => {
        const contribution = totalConsolidatedValue > 0 ? Math.round((item.value / totalConsolidatedValue) * 100) : 0;
        return {
          name: item.name,
          targetAchieved: item.targetAchieved,
          contribution,
          abs: item.abs,
          abv: item.abv,
          conversion: item.conversion
        };
      });
    } else {
      // Rental Products
      let totalRentalValue = 0;
      const storeMetrics = activeBranches.map(b => {
        const name = displayBranchName(b.workingBranch);
        const locId = getBranchLocationId(b.workingBranch);

        const locPeriodList = performanceData[locId] || [];
        const dapprPeriodList = isConsolidated ? (performanceData["25"] || []) : [];
        const dapprPeriodForStore = isConsolidated ? getDapprSquadDataForStore(locId, dapprPeriodList) : [];
        const isGMGRoad = locId === "23";
        const unmappedDapprPeriodList = (isGMGRoad && isConsolidated)
          ? dapprPeriodList.filter(item => {
              const raw = String(item.bookingBy || "").trim().toLowerCase();
              const alphaOnly = raw.replace(/[^a-z0-9]/g, "");
              const dotted = alphaOnly.startsWith("sg") ? "sg." + alphaOnly.slice(2) : raw;
              return !DAPPR_SQUAD_STORE_MAPPING[raw] && !DAPPR_SQUAD_STORE_MAPPING[dotted];
            })
          : [];
        const mergedPeriodList = [...locPeriodList, ...dapprPeriodForStore, ...unmappedDapprPeriodList];

        const bills = mergedPeriodList.reduce((sum, item) => sum + (item.total_Number_Of_Bill || 0), 0);
        const qty = mergedPeriodList.reduce((sum, item) => sum + (item.totalQuantity ?? 0), 0);
        const value = mergedPeriodList.reduce((sum, item) => sum + (item.totalValue || 0), 0);

        totalRentalValue += value;

        const chartItem = chartData.find(c => normalizeForMatch(c.name) === normalizeForMatch(name));
        const targetAchieved = chartItem ? Math.round(chartItem.pct) : 0;

        const abs = bills > 0 ? parseFloat((qty / bills).toFixed(1)) : 0.0;
        const abv = bills > 0 ? Math.round(value / bills) : 0;

        const storeKeyVal = normalizeForMatch(name);
        const storeWalkins = walkins.filter(w => 
          (w.storeId === b?._id || w.store === b?.workingBranch) && 
          isWalkinCreatedInRange(w.createdAt, periodStart, periodEnd)
        ).length;
        const conversion = storeWalkins > 0 ? Math.min(100, Math.round((bills / storeWalkins) * 100)) : 0;

        return { name, targetAchieved, value, abs, abv, conversion };
      });

      return storeMetrics.map(item => {
        const contribution = totalRentalValue > 0 ? Math.round((item.value / totalRentalValue) * 100) : 0;
        return {
          name: item.name,
          targetAchieved: item.targetAchieved,
          contribution,
          abs: item.abs,
          abv: item.abv,
          conversion: item.conversion
        };
      });
    }
  }, [branches, chartData, isConsolidated, performanceData, walkins, isStoreAdmin, isClusterAdmin, salesData, salespersons, clusterFilter, storeFilter, clusters, periodStart, periodEnd]);

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

  // Dynamic Operational Highlights calculations
  const operationalHighlights = useMemo(() => {
    const highlights = [];

    const showStaffRanking = isStoreAdmin || storeFilter !== "All";
    if (showStaffRanking) {
      // 1. Lowest Performing Employee (target)
      const activeEmployeesData = [...employeeChartData];
      if (activeEmployeesData.length > 0) {
        const sortedByPct = [...activeEmployeesData].sort((a, b) => a.pct - b.pct);
        const worstEmp = sortedByPct[0];
        if (worstEmp && worstEmp.pct < 90) {
          highlights.push({
            type: "lowest_performing_employee",
            title: "Performance Attention Required",
            description: `${worstEmp.name} achieved only ${worstEmp.pct}% of target, ranking lowest among the store staff.`,
            location: worstEmp.name,
            meta: `${worstEmp.pct}% of target`,
            severity: "amber"
          });
        }

        // 2. Lowest Conversion Employee
        const staffRanking = [...rankingData].sort((a, b) => a.conversion - b.conversion);
        const worstConvStaff = staffRanking.find(s => s.conversion > 0);
        if (worstConvStaff && worstConvStaff.conversion < 75) {
          highlights.push({
            type: "low_conversion_employee",
            title: "Conversion Improvement Opportunity",
            description: `${worstConvStaff.name}'s customer conversion rate is at ${worstConvStaff.conversion}%, suggesting potential gaps in sales closure.`,
            location: worstConvStaff.name,
            meta: `${worstConvStaff.conversion}% conversion`,
            severity: "red"
          });
        }

        // 3. Low ABV Employee
        const staffWithAbv = [...rankingData].filter(s => s.abv > 0).sort((a, b) => a.abv - b.abv);
        const lowestAbvStaff = staffWithAbv[0];
        const avgAbv = staffWithAbv.length > 0 ? Math.round(staffWithAbv.reduce((s, x) => s + x.abv, 0) / staffWithAbv.length) : 0;
        if (lowestAbvStaff && avgAbv > 0 && lowestAbvStaff.abv < avgAbv * 0.7) {
          highlights.push({
            type: "low_abv_employee",
            title: "Low Average Basket Value",
            description: `${lowestAbvStaff.name} has an ABV of ₹${lowestAbvStaff.abv.toLocaleString()} vs store avg ₹${avgAbv.toLocaleString()}. Upselling opportunities being missed.`,
            location: lowestAbvStaff.name,
            meta: `ABV ₹${lowestAbvStaff.abv.toLocaleString()}`,
            severity: "amber"
          });
        }

        // 4. Low ABS Employee
        const staffWithAbs = [...rankingData].filter(s => s.abs > 0).sort((a, b) => a.abs - b.abs);
        const lowestAbsStaff = staffWithAbs[0];
        const avgAbs = staffWithAbs.length > 0 ? parseFloat((staffWithAbs.reduce((s, x) => s + x.abs, 0) / staffWithAbs.length).toFixed(1)) : 0;
        if (lowestAbsStaff && avgAbs > 0 && lowestAbsStaff.abs < avgAbs * 0.7) {
          highlights.push({
            type: "low_abs_employee",
            title: "Low Average Basket Size",
            description: `${lowestAbsStaff.name} is averaging ${lowestAbsStaff.abs} items/bill vs store avg ${avgAbs}. Review cross-selling techniques.`,
            location: lowestAbsStaff.name,
            meta: `ABS ${lowestAbsStaff.abs} items/bill`,
            severity: "blue"
          });
        }
      }
    } else {
      // Admin / Cluster Admin view (Store-level highlights)

      // 1. Lowest Performing Store (target %)
      const activeStores = [...filteredStoresForKPIs].sort((a, b) => a.pct - b.pct);
      if (activeStores.length > 0) {
        const lowestStore = activeStores[0];
        if (lowestStore.pct < 90) {
          highlights.push({
            type: "lowest_performing_store",
            title: "Lowest Performing Store",
            description: `Store achieved only ${lowestStore.pct}% of target and ranks last among all stores in the selection.`,
            location: lowestStore.name,
            meta: `${lowestStore.pct}% of target`,
            severity: "amber"
          });

          // --- Drill-in: find worst staff in the underperforming store ---
          const underBranch = branches.find(b => normalizeForMatch(b.workingBranch) === normalizeForMatch(lowestStore.name));
          if (underBranch) {
            const locId = getBranchLocationId(underBranch.workingBranch);
            const staffList = performanceData[locId] || [];
            if (staffList.length > 0) {
              const storeTotalVal = staffList.reduce((s, x) => s + (x.totalValue || 0), 0);
              const worstStaff = [...staffList].sort((a, b) => (a.totalValue || 0) - (b.totalValue || 0))[0];
              if (worstStaff) {
                const staffPct = storeTotalVal > 0 ? Math.round(((worstStaff.totalValue || 0) / storeTotalVal) * 100) : 0;
                highlights.push({
                  type: "underperforming_employee_in_store",
                  title: "Underperforming Employee Detected",
                  description: `In ${lowestStore.name}, ${worstStaff.bookingBy} contributes only ${staffPct}% of store revenue — the lowest among all staff.`,
                  location: `${lowestStore.name} → ${worstStaff.bookingBy}`,
                  meta: `₹${(worstStaff.totalValue || 0).toLocaleString()} revenue`,
                  severity: "red"
                });
              }
            }
          }
        }
      }

      // 2. High Footfall, Low Sales (Lowest Conversion Rate)
      const sortedByConversion = [...rankingData]
        .filter(s => s.conversion > 0)
        .sort((a, b) => a.conversion - b.conversion);
      if (sortedByConversion.length > 0) {
        const lowestConvStore = sortedByConversion[0];
        if (lowestConvStore.conversion < 75) {
          highlights.push({
            type: "high_footfall_low_sales",
            title: "High Footfall, Low Sales",
            description: `Customer conversion remains below expectations at ${lowestConvStore.name}. Opportunity loss detected.`,
            location: lowestConvStore.name,
            meta: `${lowestConvStore.conversion}% conversion`,
            severity: "red"
          });
        }
      }

      // 3. Lowest ABV Store
      const storesWithAbv = [...rankingData].filter(s => s.abv > 0).sort((a, b) => a.abv - b.abv);
      const lowestAbvStore = storesWithAbv[0];
      const avgAbv = storesWithAbv.length > 0 ? Math.round(storesWithAbv.reduce((s, x) => s + x.abv, 0) / storesWithAbv.length) : 0;
      if (lowestAbvStore && avgAbv > 0 && lowestAbvStore.abv < avgAbv * 0.75) {
        highlights.push({
          type: "low_abv_store",
          title: "Below-Average Basket Value",
          description: `${lowestAbvStore.name} has the lowest ABV at ₹${lowestAbvStore.abv.toLocaleString()} vs network avg ₹${avgAbv.toLocaleString()}. Focus on upselling premium items.`,
          location: lowestAbvStore.name,
          meta: `ABV ₹${lowestAbvStore.abv.toLocaleString()}`,
          severity: "amber"
        });
      }

      // 4. Lowest ABS Store
      const storesWithAbs = [...rankingData].filter(s => s.abs > 0).sort((a, b) => a.abs - b.abs);
      const lowestAbsStore = storesWithAbs[0];
      const avgAbs = storesWithAbs.length > 0 ? parseFloat((storesWithAbs.reduce((s, x) => s + x.abs, 0) / storesWithAbs.length).toFixed(1)) : 0;
      if (lowestAbsStore && avgAbs > 0 && lowestAbsStore.abs < avgAbs * 0.75) {
        highlights.push({
          type: "low_abs_store",
          title: "Low Items Per Bill",
          description: `${lowestAbsStore.name} averages only ${lowestAbsStore.abs} items/bill vs network avg ${avgAbs}. Bundling and cross-sell training recommended.`,
          location: lowestAbsStore.name,
          meta: `ABS ${lowestAbsStore.abs} items/bill`,
          severity: "blue"
        });
      }
    }

    // Default fallback
    if (highlights.length === 0) {
      highlights.push({
        type: "info",
        title: "All Stores Performing Well",
        description: "All stores/staff are achieving their targets with healthy conversion rates. Keep up the great work!",
        location: "System-wide",
        meta: "100% healthy",
        severity: "blue"
      });
    }

    return highlights;
  }, [isStoreAdmin, storeFilter, branches, employees, employeeChartData, rankingData, filteredStoresForKPIs, performanceData]);

  const itemsPerPageRanking = 6;
  const totalRankingItems = processedRanking.length;
  
  const paginatedRanking = useMemo(() => {
    const start = (rankingPage - 1) * itemsPerPageRanking;
    return processedRanking.slice(start, start + itemsPerPageRanking);
  }, [processedRanking, rankingPage]);

  const renderKpiChangeDetails = (changeObj, isCurrency = false, isFloat = false) => {
    if (!changeObj) return null;
    const tyVal = isCurrency 
      ? `₹${formatIndianNumber(changeObj.curr, 0)}` 
      : isFloat 
        ? changeObj.curr.toFixed(1) 
        : formatIndianNumber(changeObj.curr);
    
    const lyVal = isCurrency 
      ? `₹${formatIndianNumber(changeObj.prev || 0, 0)}` 
      : isFloat 
        ? (changeObj.prev || 0).toFixed(1) 
        : formatIndianNumber(changeObj.prev || 0);

    const diffVal = isCurrency 
      ? `₹${formatIndianNumber(Math.abs(changeObj.diff || 0), 0)}` 
      : isFloat 
        ? Math.abs(changeObj.diff || 0).toFixed(1) 
        : formatIndianNumber(Math.abs(changeObj.diff || 0));

    const diffPrefix = changeObj.diff >= 0 ? "+" : "-";
    const diffColor = changeObj.diff >= 0 ? "text-emerald-600" : "text-rose-500";

    return (
      <div className="text-[11px] font-semibold text-gray-500 font-sans mt-1.5 flex flex-col gap-0.5 leading-tight">
        <div>TY ({timeframe}): <span className="font-bold text-gray-800">{tyVal}</span></div>
        <div>LY ({timeframe}): <span className="font-bold text-gray-800">{lyVal}</span></div>
        <div>Diff: <span className={`font-bold ${diffColor}`}>{diffPrefix}{diffVal}</span></div>
      </div>
    );
  };

  const renderKpiComparisonBadge = (changeObj, unit = "") => {
    if (!changeObj) return null;
    const isUp = changeObj.diff >= 0;
    
    // Formatted absolute difference
    let absDiff = Math.abs(changeObj.diff);
    let diffStr = "";
    if (unit === "currency") {
      diffStr = `₹${formatIndianNumber(absDiff, 0)}`;
    } else if (unit === "float" || unit === "Basket Size") {
      diffStr = absDiff.toFixed(1);
    } else {
      diffStr = formatIndianNumber(absDiff);
    }

    // Add prefix/suffix
    let text = "";
    if (unit === "currency") {
      text = `${isUp ? "+" : "-"}${diffStr}`;
    } else if (unit === "pts") {
      text = `${isUp ? "+" : "-"}${diffStr} pts`;
    } else if (unit === "Walk-ins") {
      text = `${diffStr} Customers`;
    } else if (unit === "Basket Size") {
      text = `${diffStr} Items`;
    } else if (unit === "Shoes") {
      text = `${diffStr} Pairs`;
    } else if (unit === "Shirts") {
      text = `${diffStr} Shirts`;
    } else if (unit === "Bills") {
      text = `${diffStr} Bills`;
    } else if (unit === "Reviews") {
      text = `${diffStr} Reviews`;
    } else {
      text = `${isUp ? "+" : "-"}${diffStr}`;
    }

    const percentage = changeObj.display; // e.g. "+11.8%" or "-5.9%"
    
    const badgeBg = isUp ? "bg-emerald-50 text-emerald-700 font-sans" : "bg-rose-50 text-rose-600 font-sans";
    const arrow = isUp ? "↗" : "↘";

    return (
      <div className={`mt-3 py-1.5 px-3 rounded-xl flex items-center justify-center text-[11.5px] font-bold ${badgeBg}`}>
        <span className="flex items-center gap-1.5">
          <span>{arrow}</span>
          <span>{text} ({percentage})</span>
        </span>
      </div>
    );
  };

  const renderKpiCard = ({ title, mainVal, tyVal, lyVal, changeObj, unit, trend, trendColor }) => {
    const isUp = trend === "up" || (changeObj && changeObj.diff >= 0);
    const finalTrendColor = trendColor || (isUp ? "#00A36C" : "#e11d48");
    const finalTrend = trend || (isUp ? "up" : "down");
    return (
      <div className="bg-white rounded-[20px] shadow-sm border border-gray-100 p-5 flex flex-col justify-between h-[200px] w-full font-sans">
        <div>
          <span className="text-[13px] font-bold text-gray-700 block">{title}</span>
        </div>
        <div className="flex items-center justify-between mt-1">
          <span className="text-[28px] xs:text-[30px] sm:text-[32px] font-extrabold text-gray-900 leading-none">{mainVal}</span>
          <Sparkline type={finalTrend} color={finalTrendColor} />
        </div>
        <div className="flex flex-col gap-1.5 mt-3">
          <div className="flex justify-between items-center text-[12px]">
            <span className="text-gray-400 font-semibold">This Year :</span>
            <span className="text-gray-800 font-bold">{tyVal}</span>
          </div>
          <div className="flex justify-between items-center text-[12px]">
            <span className="text-gray-400 font-semibold">Last Year :</span>
            <span className="text-gray-800 font-bold">{lyVal}</span>
          </div>
        </div>
        {renderKpiComparisonBadge(changeObj, unit)}
      </div>
    );
  };

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
              <h2 className="text-[17px] font-bold text-gray-900">
                {isStoreAdmin ? "Employee Performance Overview" : "Store Target Vs Achieved Target"}
              </h2>
              <p className="text-gray-400 text-xs font-semibold font-sans mt-0.5">
                {timeframe === "MTD"
                  ? getMTDDateRangeString()
                  : timeframe === "WTD"
                    ? getWTDDateRangeString()
                    : timeframe === "YTD"
                      ? getYTDDateRangeString()
                      : getCustomDateRangeString()
                } | {isStoreAdmin
                  ? `${employeeChartData.length} employee${employeeChartData.length !== 1 ? "s" : ""}`
                  : `Comparison across all ${filteredChartData.length} stores`
                }
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Category selector pills — only for non-store-admin */}
              {!isStoreAdmin && (
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
              )}

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
            {isStoreAdmin && employeeChartData.length === 0 && !loadingPerformance && (
              <div className="flex items-center justify-center h-full text-gray-400 text-sm font-semibold">
                No employee performance data available for this period.
              </div>
            )}
            {(!isStoreAdmin || employeeChartData.length > 0 || loadingPerformance) && (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart 
                data={isStoreAdmin ? employeeChartData : filteredChartData} 
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
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
                  interval={0}
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
                              <span className="text-[#9333ea] font-extrabold">
                                {data.target > 0 ? `₹${formatIndianNumber(data.target, 2)}` : "—"}
                              </span>
                            </div>
                            <div className="flex items-center justify-between gap-6">
                              <span>Achieved :</span>
                              <span className="text-[#eab308] font-extrabold">₹{formatIndianNumber(data.achieved, 2)}</span>
                            </div>
                            <div className="flex items-center justify-between gap-6 border-t border-gray-100 pt-1.5 mt-1.5">
                              <span>Balance :</span>
                              <span className="text-gray-900 font-extrabold">
                                {data.target > 0 ? `₹${formatIndianNumber(data.balance, 2)}` : "—"}
                              </span>
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
            )}
          </div>
        </div>

        {/* 12 KPI Grid Container boxed in a box */}
        <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-6 mb-6">
          
          {/* Header Row with Role and Cluster Selectors */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 font-sans">
            <div>
              <h2 className="text-[18px] font-bold text-gray-900 leading-tight">Key Performance Indicators</h2>
              <p className="text-gray-400 text-[12px] mt-0.5 font-medium">
                {timeframe === "MTD"
                  ? getMTDDateRangeString()
                  : timeframe === "WTD"
                    ? getWTDDateRangeString()
                    : timeframe === "YTD"
                      ? getYTDDateRangeString()
                      : getCustomDateRangeString()
                }
              </p>
            </div>
            
            {!isStoreAdmin && !isClusterAdmin && (
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
                    onChange={(e) => { setClusterFilter(e.target.value); setStoreFilter("All"); }}
                    className="appearance-none bg-white border border-gray-200 rounded-[14px] px-4 py-2 pr-10 text-[13px] font-bold text-gray-700 shadow-sm focus:outline-none cursor-pointer hover:border-gray-300"
                  >
                    <option value="All">Cluster : All</option>
                    {clusters.map((c) => (
                      <option key={c._id} value={c._id}>
                        Cluster : {c.name}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {/* Store Select Dropdown — visible only when stores are available */}
                {storeOptionsForFilter.length > 0 && (
                  <div className="relative">
                    <select
                      value={storeFilter}
                      onChange={(e) => setStoreFilter(e.target.value)}
                      className="appearance-none bg-white border border-gray-200 rounded-[14px] px-4 py-2 pr-10 text-[13px] font-bold text-gray-700 shadow-sm focus:outline-none cursor-pointer hover:border-gray-300"
                    >
                      <option value="All">Store : All</option>
                      {storeOptionsForFilter.map((name) => (
                        <option key={name} value={name}>
                          {name}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                      <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

          {renderKpiCard({
            title: "Achieved Target %",
            mainVal: `${stats.achievedPct}%`,
            tyVal: `₹${formatIndianNumber(stats.achievedValue, 0)}`,
            lyVal: `₹${formatIndianNumber(stats.valChange?.prev || 0, 0)}`,
            changeObj: stats.valChange,
            unit: "currency",
            trend: stats.valTrend,
            trendColor: stats.valTrendColor
          })}

          {renderKpiCard({
            title: "Bills Generated",
            mainVal: `${stats.billsChange?.prev > 0 ? Math.round((stats.billsGenerated / stats.billsChange.prev) * 100) : 100}%`,
            tyVal: formatIndianNumber(stats.billsGenerated),
            lyVal: formatIndianNumber(stats.billsChange?.prev || 0),
            changeObj: stats.billsChange,
            unit: "Bills",
            trend: stats.billsTrend,
            trendColor: stats.billsTrendColor
          })}

          {renderKpiCard({
            title: "Quantity Sold",
            mainVal: `${stats.qtyChange?.prev > 0 ? Math.round((stats.quantitySold / stats.qtyChange.prev) * 100) : 100}%`,
            tyVal: formatIndianNumber(stats.quantitySold),
            lyVal: formatIndianNumber(stats.qtyChange?.prev || 0),
            changeObj: stats.qtyChange,
            unit: "",
            trend: stats.qtyTrend,
            trendColor: stats.qtyTrendColor
          })}

          {renderKpiCard({
            title: "Customer Walk-ins",
            mainVal: `${stats.walkChange?.prev > 0 ? Math.round((stats.customerWalkins / stats.walkChange.prev) * 100) : 100}%`,
            tyVal: formatIndianNumber(stats.customerWalkins),
            lyVal: formatIndianNumber(stats.walkChange?.prev || 0),
            changeObj: stats.walkChange,
            unit: "Walk-ins",
            trend: stats.walkTrend,
            trendColor: stats.walkTrendColor
          })}

          {renderKpiCard({
            title: "Average Basket Size",
            mainVal: `${stats.absChange?.prev > 0 ? Math.round((parseFloat(stats.basketSize) / stats.absChange.prev) * 100) : 100}%`,
            tyVal: `${parseFloat(stats.basketSize).toFixed(1)} Items`,
            lyVal: `${(stats.absChange?.prev || 0).toFixed(1)} Items`,
            changeObj: stats.absChange,
            unit: "Basket Size",
            trend: stats.absTrend,
            trendColor: stats.absTrendColor
          })}

          {renderKpiCard({
            title: "Average Basket Value",
            mainVal: `${stats.abvChange?.prev > 0 ? Math.round((stats.basketValue / stats.abvChange.prev) * 100) : 100}%`,
            tyVal: `₹${formatIndianNumber(stats.basketValue, 0)}`,
            lyVal: `₹${formatIndianNumber(stats.abvChange?.prev || 0, 0)}`,
            changeObj: stats.abvChange,
            unit: "currency",
            trend: stats.abvTrend,
            trendColor: stats.abvTrendColor
          })}

          {renderKpiCard({
            title: "Conversion %",
            mainVal: `${stats.conversionRate}%`,
            tyVal: `${stats.conversionRate}%`,
            lyVal: `${stats.lyConversionRate}%`,
            changeObj: stats.conversionChange,
            unit: "pts",
            trend: stats.conversionChange?.trend,
            trendColor: stats.conversionChange?.trendColor
          })}

          {renderKpiCard({
            title: "Shoe Sale",
            mainVal: `${stats.shoeChange?.prev > 0 ? Math.round((stats.shoeSale / stats.shoeChange.prev) * 100) : 100}%`,
            tyVal: formatIndianNumber(stats.shoeSale),
            lyVal: formatIndianNumber(stats.shoeChange?.prev || 0),
            changeObj: stats.shoeChange,
            unit: "Shoes",
            trend: stats.shoeChange?.trend,
            trendColor: stats.shoeChange?.trendColor
          })}

          {renderKpiCard({
            title: "Shirt Sale",
            mainVal: `${stats.shirtChange?.prev > 0 ? Math.round((stats.shirtSales / stats.shirtChange.prev) * 100) : 100}%`,
            tyVal: formatIndianNumber(stats.shirtSales),
            lyVal: formatIndianNumber(stats.shirtChange?.prev || 0),
            changeObj: stats.shirtChange,
            unit: "Shirts",
            trend: stats.shirtChange?.trend,
            trendColor: stats.shirtChange?.trendColor
          })}

          {renderKpiCard({
            title: "Dappr Squad Bills",
            mainVal: `${stats.dapprChange?.prev > 0 ? Math.round((stats.dapprSquadBills / stats.dapprChange.prev) * 100) : 100}%`,
            tyVal: formatIndianNumber(stats.dapprSquadBills),
            lyVal: formatIndianNumber(stats.dapprChange?.prev || 0),
            changeObj: stats.dapprChange,
            unit: "Bills",
            trend: stats.dapprChange?.trend,
            trendColor: stats.dapprChange?.trendColor
          })}

          {renderKpiCard({
            title: "Google Reviews",
            mainVal: `${stats.reviewsChange?.prev > 0 ? Math.round((stats.googleReviews / stats.reviewsChange.prev) * 100) : 100}%`,
            tyVal: formatIndianNumber(stats.googleReviews),
            lyVal: formatIndianNumber(stats.reviewsChange?.prev || 0),
            changeObj: stats.reviewsChange,
            unit: "Reviews",
            trend: stats.reviewsChange?.trend,
            trendColor: stats.reviewsChange?.trendColor
          })}

          {/* Card 12: Staff Rating / Store Rating */}
          <div className="bg-white rounded-[20px] shadow-sm border border-gray-100 p-5 h-[200px] flex flex-col justify-between font-sans">
            <div>
              <span className="text-[13px] font-bold text-gray-700 block">
                {user?.role === "store_admin" ? "Staff Rating" : "Store Rating"}
              </span>
            </div>
            <div className="flex-1 flex items-center justify-between min-h-0 mt-1">
              <div className="flex flex-col justify-center min-w-0">
                <h3 className="text-[28px] xs:text-[30px] sm:text-[32px] font-extrabold text-gray-900 leading-none">
                  {ratingSummary.averageRating} <span className="text-gray-400 font-normal text-[20px]">/ 5</span>
                </h3>
                <span className="text-[12px] text-gray-400 font-semibold font-sans block mt-3">
                  Based on {ratingSummary.totalRatings} ratings
                </span>
              </div>
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.907c.961 0 1.36 1.237.588 1.81l-3.97 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.971-2.888a1 1 0 00-1.17 0l-3.971 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.97-2.888c-.772-.573-.37-1.81.588-1.81h4.907a1 1 0 00.95-.69l1.519-4.674z" />
                </svg>
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
                <h2 className="text-[18px] font-bold text-gray-900 leading-tight">
                  {isStoreAdmin || storeFilter !== "All" ? "Staff Performance Ranking" : "Store Performance Ranking"}
                </h2>
                <p className="text-gray-400 text-[12px] mt-0.5 font-medium">
                  Best to least - {timeframe} - Showing all {totalRankingItems} {isStoreAdmin || storeFilter !== "All" ? "staff" : "stores"}
                </p>
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
                placeholder={isStoreAdmin || storeFilter !== "All" ? "Search by staff name..." : "Search by store name..."} 
                className="w-full bg-[#f3f4f6] text-gray-700 text-xs font-semibold rounded-[14px] pl-9 pr-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-gray-300"
              />
            </div>

            {/* Table Container */}
            <div className="overflow-x-auto flex-1 min-h-[460px] max-h-[500px] overflow-y-auto pr-1">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#f3f4f6] rounded-xl text-gray-500 text-[10px] font-extrabold tracking-wider uppercase">
                    <th className="py-3 px-4 rounded-l-xl">{isStoreAdmin || storeFilter !== "All" ? "Staff Name" : "Store Name"}</th>
                    <th className="py-3 px-4 text-center">{isStoreAdmin || storeFilter !== "All" ? "Value" : "Target Achieved %"}</th>
                    <th className="py-3 px-4 text-center">ABS</th>
                    <th className="py-3 px-4 text-center">ABV</th>
                    <th className="py-3 px-4 text-center">Contribution %</th>
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
                          {isStoreAdmin || storeFilter !== "All" ? (
                            <span className="block font-extrabold text-gray-900 text-[13px]">{s.name}</span>
                          ) : (
                            <>
                              <span className="block font-extrabold text-gray-900 text-[13px]">{brand}</span>
                              <span className="block text-gray-400 font-medium text-[11px] mt-0.5">{loc || "Store"}</span>
                            </>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center text-gray-900 font-extrabold text-[13px]">
                          {isStoreAdmin || storeFilter !== "All" ? `₹${formatIndianNumber(s.targetAchieved)}` : `${s.targetAchieved}%`}
                        </td>
                        <td className="py-3 px-4 text-center text-gray-500">{s.abs}</td>
                        <td className="py-3 px-4 text-center text-gray-900 font-extrabold">₹{formatIndianNumber(s.abv)}</td>
                        <td className="py-3 px-4 text-center text-gray-500">{s.contribution}%</td>
                        <td className="py-3 px-4 text-center text-gray-900 font-extrabold">{s.conversion}%</td>
                      </tr>
                    );
                  })}
                  {processedRanking.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-400 font-semibold">
                        {isStoreAdmin || storeFilter !== "All" ? "No staff found matching search criteria." : "No stores found matching search criteria."}
                      </td>
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
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="text-[10px] text-gray-400 font-semibold">
                    Live · updated {lastRefreshed.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} · refreshes every 5 min
                  </span>
                </div>
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
              {operationalHighlights.map((hl, index) => {
                const isBlue = hl.severity === "blue";
                const isAmber = hl.severity === "amber";
                const isRed = hl.severity === "red";
                
                return (
                  <div key={index} className="border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isBlue ? "bg-blue-50" : isAmber ? "bg-amber-50" : "bg-red-50"
                      }`}>
                        {hl.type === "low_abv_store" || hl.type === "low_abv_employee" ? (
                          // Shopping bag — low ABV
                          <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                          </svg>
                        ) : hl.type === "low_abs_store" || hl.type === "low_abs_employee" ? (
                          // Package/box — low ABS
                          <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
                          </svg>
                        ) : hl.type === "underperforming_employee_in_store" ? (
                          // Person with exclamation — underperforming employee
                          <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        ) : isBlue ? (
                          <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                        ) : isAmber ? (
                          <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <h4 className="text-[13px] font-extrabold text-gray-900">{hl.title}</h4>
                        <p className="text-gray-400 font-medium text-[11px] leading-relaxed mt-1">{hl.description}</p>
                      </div>
                    </div>
                    <div className="border-t border-dashed border-gray-100 my-3" />
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <div className="flex items-center gap-1.5 text-gray-700 min-w-0">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${
                          isBlue ? "bg-blue-600" : isAmber ? "bg-amber-500" : "bg-red-500"
                        }`} />
                        {hl.type === "underperforming_employee_in_store" ? (
                          <span className="flex flex-col leading-tight">
                            <span>{hl.location.split(" → ")[0]}</span>
                            <span className="text-gray-400 font-medium text-[10px]">↳ {hl.location.split(" → ")[1]}</span>
                          </span>
                        ) : (
                          <span>{hl.location}</span>
                        )}
                      </div>
                      <span className="text-gray-900 font-extrabold shrink-0 ml-2">{hl.meta}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div> {/* Close Key Performance Indicators outer box container */}

      </div>
    </div>
  );
};

export default StoreInsights;
