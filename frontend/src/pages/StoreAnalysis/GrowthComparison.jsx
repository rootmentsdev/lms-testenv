import React, { useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import SideNav from "../../components/SideNav/SideNav";
import ModileNav from "../../components/SideNav/ModileNav";
import { FiSearch, FiDownload } from "react-icons/fi";
import baseUrl from "../../api/api";

// Shared performance cache (same as StoreInsights/HomeBar to reuse cross-page results)
const getPerformanceCached = async (locId, startDate, endDate) => {
  const cacheKey = `perf_${locId}_${startDate}_${endDate}`;
  if (!window.__performanceCache) window.__performanceCache = {};
  if (window.__performanceCache[cacheKey]?.promise) {
    return window.__performanceCache[cacheKey].promise;
  }
  const promise = (async () => {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000); // 15s timeout
      const res = await fetch("https://rentalapi.rootments.live/api/Reports/GetPerformanceStaffReportWithCancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          DateFrom: startDate,
          DateTo: endDate,
          BookingNo: "",
          LocationID: locId,
          UserID: "7777"
        }),
        signal: controller.signal
      });
      clearTimeout(timeout);
      if (res.ok) {
        const json = await res.json();
        return Array.isArray(json.dataSet?.data) ? json.dataSet.data : [];
      }
    } catch (err) {
      if (err.name !== "AbortError") {
        console.error(`Error fetching performance for loc ${locId}:`, err);
      }
    } finally {
      delete window.__performanceCache[cacheKey];
    }
    return [];
  })();
  window.__performanceCache[cacheKey] = { promise, timestamp: Date.now() };
  return promise;
};

// Concurrency limiter — same pattern as StoreInsights
const runWithConcurrencyLimit = async (tasks, limit) => {
  const results = [];
  const executing = new Set();
  for (const task of tasks) {
    const p = Promise.resolve().then(() => task());
    results.push(p);
    executing.add(p);
    const clean = () => executing.delete(p);
    p.then(clean, clean);
    if (executing.size >= limit) await Promise.race(executing);
  }
  return Promise.all(results);
};

const BRAND_TOKENS = new Set(["zorucci", "grooms", "suitor", "guy", "sg"]);

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

function locationKey(name) {
  return norm(name)
    .split(" ")
    .filter((t) => t && !BRAND_TOKENS.has(t))
    .join(" ");
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

// Local date string formatting (YYYY-MM-DD) avoiding timezone shift errors
const getLocalDateString = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const CURRENT_MONTH_LONG = new Date().toLocaleString("en-US", { month: "long" });
const CURRENT_MONTH_SHORT = new Date().toLocaleString("en-US", { month: "short" });
const CURRENT_YEAR = new Date().getFullYear();

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

const getDaysInMonth = (monthName, year = CURRENT_YEAR) => {
  const months = {
    January: 31, February: 28, March: 31, April: 30, May: 31, June: 30,
    July: 31, August: 31, September: 30, October: 31, November: 30, December: 31
  };
  if (monthName === "February") {
    if ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0) {
      return 29;
    }
    return 28;
  }
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

const getAutoWeekDates = (monthName = CURRENT_MONTH_LONG, year = CURRENT_YEAR) => {
  const daysInMonth = getDaysInMonth(monthName, year);
  const mShort = monthName.substring(0, 3);
  return {
    1: `01 - 07 ${mShort}`,
    2: `08 - 14 ${mShort}`,
    3: `15 - 21 ${mShort}`,
    4: `22 - ${String(daysInMonth).padStart(2, "0")} ${mShort}`,
  };
};

const getStoreWeekRange = (storeName, storeWeekRanges = {}) => {
  if (!storeName) return null;

  const tryMatch = (name) => {
    if (!name) return null;
    const snorm = name.replace(/[.\-]/g, '-');
    const normKey = normalizeForMatch(name);
    const matchKey = Object.keys(storeWeekRanges).find(
      k => k === name || k === snorm || (normKey && normalizeForMatch(k) === normKey)
    );
    if (matchKey && storeWeekRanges[matchKey]) {
      const storeVal = storeWeekRanges[matchKey];
      if (storeVal[CURRENT_MONTH_LONG]) {
        const mVal = storeVal[CURRENT_MONTH_LONG];
        if (mVal[1] || mVal[2] || mVal[3] || mVal[4]) return mVal;
      }
      if (storeVal[1] || storeVal[2] || storeVal[3] || storeVal[4]) return storeVal;
    }
    return null;
  };

  const exactMatch = tryMatch(storeName);
  const allMatch = tryMatch("All");

  if (exactMatch && storeName !== "All") {
    if (allMatch) {
      const exact3 = String(exactMatch[3] || "");
      const all3 = String(allMatch[3] || "");
      if (exact3.includes("15 - 21") && !all3.includes("15 - 21")) {
        return allMatch;
      }
    }
    return exactMatch;
  }

  if (allMatch) return allMatch;
  if (exactMatch) return exactMatch;

  return null;
};

// Date Range Helpers for TY/LY (This Year / Last Year)
const getStoreWTDDateRange = (storeName = "All", targetYear, storeWeekRanges = {}) => {
  const today = new Date();
  const todayDateNum = today.getDate();
  const daysInMonth = getDaysInMonth(CURRENT_MONTH_LONG);
  const daysInMonthStr = String(daysInMonth).padStart(2, "0");

  let w1 = localStorage.getItem("week1Dates") || `01 - 07 ${CURRENT_MONTH_SHORT}`;
  let w2 = localStorage.getItem("week2Dates") || `08 - 14 ${CURRENT_MONTH_SHORT}`;
  let w3 = localStorage.getItem("week3Dates") || `15 - 21 ${CURRENT_MONTH_SHORT}`;
  let w4 = localStorage.getItem("week4Dates") || `22 - ${daysInMonthStr} ${CURRENT_MONTH_SHORT}`;

  const sr = getStoreWeekRange(storeName, storeWeekRanges);
  if (sr) {
    if (sr[1]) w1 = sr[1];
    if (sr[2]) w2 = sr[2];
    if (sr[3]) w3 = sr[3];
    if (sr[4]) w4 = sr[4];
  }

  const weeks = [
    { id: 1, val: w1 },
    { id: 2, val: w2 },
    { id: 3, val: w3 },
    { id: 4, val: w4 },
  ];

  let activeWeekId = 4;
  let found = false;
  for (const w of weeks) {
    const { start: startDay, end: endDay } = parseWeekDays(w.val);
    if (startDay !== null && endDay !== null) {
      if (todayDateNum >= startDay && todayDateNum <= endDay) {
        activeWeekId = w.id;
        found = true;
        break;
      }
    }
  }

  if (!found) {
    if (todayDateNum <= 7) activeWeekId = 1;
    else if (todayDateNum <= 14) activeWeekId = 2;
    else if (todayDateNum <= 21) activeWeekId = 3;
    else activeWeekId = 4;
  }

  let startDayNum = 1;
  let endDayNum = Math.min(todayDateNum, daysInMonth);
  const weekVal = activeWeekId === 1 ? w1 
                : activeWeekId === 2 ? w2 
                : activeWeekId === 3 ? w3 
                : w4;
                
  if (weekVal && weekVal !== "Select Days") {
    const { start: pStart, end: pEnd } = parseWeekDays(weekVal);
    if (pStart !== null) startDayNum = pStart;
    if (pEnd !== null) endDayNum = Math.min(todayDateNum, pEnd, daysInMonth);
  }

  const start = new Date(targetYear, today.getMonth(), startDayNum);
  const end = new Date(targetYear, today.getMonth(), endDayNum);

  return {
    start: getLocalDateString(start),
    end: getLocalDateString(end)
  };
};

const getMTDDateRange = (targetYear) => {
  const today = new Date();
  const start = new Date(targetYear, today.getMonth(), 1);
  const end = new Date(targetYear, today.getMonth(), today.getDate());
  return {
    start: getLocalDateString(start),
    end: getLocalDateString(end)
  };
};

const getActiveWeekInfo = (storeWeekRanges = {}) => {
  const today = new Date();
  const todayDateNum = today.getDate();
  const daysInMonth = getDaysInMonth(CURRENT_MONTH_LONG);

  let w1 = localStorage.getItem("week1Dates") || `01 - 07 ${CURRENT_MONTH_SHORT}`;
  let w2 = localStorage.getItem("week2Dates") || `08 - 14 ${CURRENT_MONTH_SHORT}`;
  let w3 = localStorage.getItem("week3Dates") || `15 - 21 ${CURRENT_MONTH_SHORT}`;
  let w4 = localStorage.getItem("week4Dates") || `22 - ${daysInMonth} ${CURRENT_MONTH_SHORT}`;

  const sr = getStoreWeekRange("All", storeWeekRanges);
  if (sr) {
    if (sr[1]) w1 = sr[1];
    if (sr[2]) w2 = sr[2];
    if (sr[3]) w3 = sr[3];
    if (sr[4]) w4 = sr[4];
  }

  const weeks = [
    { id: 1, val: w1 },
    { id: 2, val: w2 },
    { id: 3, val: w3 },
    { id: 4, val: w4 },
  ];

  let activeWeekId = 4;
  for (const w of weeks) {
    const { start: startDay, end: endDay } = parseWeekDays(w.val);
    if (startDay !== null && endDay !== null) {
      if (todayDateNum >= startDay && todayDateNum <= endDay) {
        activeWeekId = w.id;
        break;
      }
    }
  }

  const rangeStr = activeWeekId === 1 ? w1 : activeWeekId === 2 ? w2 : activeWeekId === 3 ? w3 : w4;
  return { activeWeekId, rangeStr };
};

const mockComparisonRows = [
  { sl: 1, name: "G Thrissur", tyVal: 798500, lyVal: 845200, l2lVal: -46700, tyBill: 186, lyBill: 172, l2lBill: 14, tyQty: 342, lyQty: 315, l2lQty: 27, tyWalk: 1240, lyWalk: 1180, l2lWalk: 60 },
  { sl: 2, name: "SG Edappally", tyVal: 924600, lyVal: 884500, l2lVal: 40100, tyBill: 198, lyBill: 187, l2lBill: 11, tyQty: 368, lyQty: 344, l2lQty: 24, tyWalk: 1320, lyWalk: 1270, l2lWalk: 50 },
  { sl: 3, name: "G Thrissur", tyVal: 798500, lyVal: 845200, l2lVal: -46700, tyBill: 186, lyBill: 172, l2lBill: 14, tyQty: 342, lyQty: 315, l2lQty: 27, tyWalk: 1240, lyWalk: 1180, l2lWalk: 60 },
  { sl: 4, name: "SG Edappally", tyVal: 924600, lyVal: 884500, l2lVal: 40100, tyBill: 198, lyBill: 187, l2lBill: 11, tyQty: 368, lyQty: 344, l2lQty: 24, tyWalk: 1320, lyWalk: 1270, l2lWalk: 50 },
  { sl: 5, name: "G Thrissur", tyVal: 798500, lyVal: 845200, l2lVal: -46700, tyBill: 186, lyBill: 172, l2lBill: 14, tyQty: 342, lyQty: 315, l2lQty: 27, tyWalk: 1240, lyWalk: 1180, l2lWalk: 60 },
  { sl: 6, name: "SG Edappally", tyVal: 924600, lyVal: 884500, l2lVal: 40100, tyBill: 198, lyBill: 187, l2lBill: 11, tyQty: 368, lyQty: 344, l2lQty: 24, tyWalk: 1320, lyWalk: 1270, l2lWalk: 50 },
  { sl: 7, name: "G Thrissur", tyVal: 798500, lyVal: 845200, l2lVal: -46700, tyBill: 186, lyBill: 172, l2lBill: 14, tyQty: 342, lyQty: 315, l2lQty: 27, tyWalk: 1240, lyWalk: 1180, l2lWalk: 60 },
  { sl: 8, name: "SG Edappally", tyVal: 924600, lyVal: 884500, l2lVal: 40100, tyBill: 198, lyBill: 187, l2lBill: 11, tyQty: 368, lyQty: 344, l2lQty: 24, tyWalk: 1320, lyWalk: 1270, l2lWalk: 50 },
  { sl: 9, name: "G Thrissur", tyVal: 798500, lyVal: 845200, l2lVal: -46700, tyBill: 186, lyBill: 172, l2lBill: 14, tyQty: 342, lyQty: 315, l2lQty: 27, tyWalk: 1240, lyWalk: 1180, l2lWalk: 60 },
  { sl: 10, name: "SG Edappally", tyVal: 924600, lyVal: 884500, l2lVal: 40100, tyBill: 198, lyBill: 187, l2lBill: 11, tyQty: 368, lyQty: 344, l2lQty: 24, tyWalk: 1320, lyWalk: 1270, l2lWalk: 50 }
];

const BRANCH_LOCATION_MAPPING = {
  "z-edapally1": "1",
  "g-edappally": "3",
  "z- edappal": "6",
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
  "g.mg road": "23",
  "g.mgroad": "23",
  "g-trivandrum": "5"
};

function getBranchLocationId(workingBranch) {
  if (!workingBranch) return null;
  const normalized = String(workingBranch).trim().toLowerCase();
  return BRANCH_LOCATION_MAPPING[normalized] || null;
}

const getStoreNameFromLocId = (locId) => {
  const branchKey = Object.keys(BRANCH_LOCATION_MAPPING).find(key => BRANCH_LOCATION_MAPPING[key] === locId);
  if (!branchKey) return "All";
  return displayBranchName(branchKey);
};

const GrowthComparison = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const STORES_PER_PAGE = 5;
  const [activeTab, setActiveTab] = useState("MTD");
  const [customStartDate, setCustomStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return `2026-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });
  const [customEndDate, setCustomEndDate] = useState(() => {
    const d = new Date();
    return `2026-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });
  const [branches, setBranches] = useState([]);
  const [tyWalkins, setTyWalkins] = useState([]);
  const [lyWalkins, setLyWalkins] = useState([]);
  const [tyPerformance, setTyPerformance] = useState({});
  const [lyPerformance, setLyPerformance] = useState({});
  const [loading, setLoading] = useState(false);
  const [storeWeekRanges, setStoreWeekRanges] = useState(() => {
    try { return JSON.parse(localStorage.getItem("storeWeekRanges") || "{}"); } catch { return {}; }
  });

  // Fetch store target week ranges on mount
  useEffect(() => {
    const fetchStoreTargets = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${baseUrl.baseUrl}api/store-targets?month=${CURRENT_MONTH_LONG}&year=${CURRENT_YEAR}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        });
        if (res.ok) {
          const json = await res.json();
          const data = Array.isArray(json?.data) ? json.data : [];
          const rangesMap = {};
          const autoWeeks = getAutoWeekDates(CURRENT_MONTH_LONG, CURRENT_YEAR);
          data.forEach((doc) => {
            const store = doc.storeName;
            const storeNorm = store.replace(/[.\-]/g, '-');
            const normKey = normalizeForMatch(store);
            const rangeEntry = {
              1: (doc.weekRanges?.[1] && doc.weekRanges?.[1] !== "Select Days") ? doc.weekRanges[1] : autoWeeks[1],
              2: (doc.weekRanges?.[2] && doc.weekRanges?.[2] !== "Select Days") ? doc.weekRanges[2] : autoWeeks[2],
              3: (doc.weekRanges?.[3] && doc.weekRanges?.[3] !== "Select Days") ? doc.weekRanges[3] : autoWeeks[3],
              4: (doc.weekRanges?.[4] && doc.weekRanges?.[4] !== "Select Days") ? doc.weekRanges[4] : autoWeeks[4],
              [CURRENT_MONTH_LONG]: {
                1: (doc.weekRanges?.[1] && doc.weekRanges?.[1] !== "Select Days") ? doc.weekRanges[1] : autoWeeks[1],
                2: (doc.weekRanges?.[2] && doc.weekRanges?.[2] !== "Select Days") ? doc.weekRanges[2] : autoWeeks[2],
                3: (doc.weekRanges?.[3] && doc.weekRanges?.[3] !== "Select Days") ? doc.weekRanges[3] : autoWeeks[3],
                4: (doc.weekRanges?.[4] && doc.weekRanges?.[4] !== "Select Days") ? doc.weekRanges[4] : autoWeeks[4],
              }
            };
            rangesMap[store] = rangeEntry;
            if (storeNorm !== store) rangesMap[storeNorm] = rangeEntry;
            if (normKey) rangesMap[normKey] = rangeEntry;
          });
          setStoreWeekRanges(rangesMap);
        }
      } catch (err) {
        console.error("Error fetching store targets in GrowthComparison:", err);
      }
    };
    fetchStoreTargets();
  }, []);

  const renderCellVal = (val, isPercent = false) => {
    const rawVal = String(val);
    const isZero = rawVal === "0" || rawVal === "0.0" || rawVal === "0%" || rawVal === "+0.0%" || rawVal === "-0.0%" || rawVal === "";
    const colorClass = isZero ? "text-[#e05a47] font-bold" : "";
    return (
      <span className={colorClass}>
        {val}{isPercent && "%"}
      </span>
    );
  };

  // Fetch branches dynamically
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
        console.error("Error fetching branches for Store Rental Comparison:", err);
      }
    };
    fetchBranches();
  }, []);

  // Fetch Year-Over-Year Walk-Ins and Performance Report Data
  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        
        let tyStart, tyEnd, lyStart, lyEnd;
        if (activeTab === "WTD") {
          const wtdTy = getStoreWTDDateRange("All", 2026, storeWeekRanges);
          const wtdLy = getStoreWTDDateRange("All", 2025, storeWeekRanges);
          tyStart = wtdTy.start;
          tyEnd = wtdTy.end;
          lyStart = wtdLy.start;
          lyEnd = wtdLy.end;
        } else if (activeTab === "CUSTOM") {
          tyStart = customStartDate;
          tyEnd = customEndDate;
          const tyYear = new Date(customStartDate).getFullYear() || 2026;
          const lyYear = tyYear - 1;
          lyStart = customStartDate.replace(String(tyYear), String(lyYear));
          lyEnd = customEndDate.replace(String(tyYear), String(lyYear));
        } else {
          const tyRange = getMTDDateRange(2026);
          const lyRange = getMTDDateRange(2025);
          tyStart = tyRange.start;
          tyEnd = tyRange.end;
          lyStart = lyRange.start;
          lyEnd = lyRange.end;
        }

        const locationIds = ["1", "3", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "23", "25"];

        const tyTasks = locationIds.map((locId) => async () => {
          let storeStart = tyStart;
          let storeEnd = tyEnd;
          if (activeTab === "WTD") {
            const storeName = getStoreNameFromLocId(locId);
            const range = getStoreWTDDateRange(storeName, 2026, storeWeekRanges);
            storeStart = range.start;
            storeEnd = range.end;
          }
          const data = await getPerformanceCached(locId, storeStart, storeEnd);
          return { locId, data };
        });

        const lyTasks = locationIds.map((locId) => async () => {
          let storeStart = lyStart;
          let storeEnd = lyEnd;
          if (activeTab === "WTD") {
            const storeName = getStoreNameFromLocId(locId);
            const range = getStoreWTDDateRange(storeName, 2025, storeWeekRanges);
            storeStart = range.start;
            storeEnd = range.end;
          }
          const data = await getPerformanceCached(locId, storeStart, storeEnd);
          return { locId, data };
        });

        // Run ALL fetches in parallel: TY walkins, LY walkins, TY performance, LY performance
        const walkinFetch = async (start, end) => {
          try {
            const ctrl = new AbortController();
            const t = setTimeout(() => ctrl.abort(), 8000); // 8s timeout
            const res = await fetch(`${baseUrl.baseUrl}api/walkin/list?startDate=${start}&endDate=${end}`, {
              method: "GET",
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
              signal: ctrl.signal,
            });
            clearTimeout(t);
            if (res.ok) {
              const json = await res.json();
              return Array.isArray(json?.data) ? json.data : [];
            }
          } catch (e) { /* ignore timeout/network errors */ }
          return [];
        };

        const [tyList, lyList, tyResults, lyResults] = await Promise.all([
          walkinFetch(tyStart, tyEnd),
          walkinFetch(lyStart, lyEnd),
          runWithConcurrencyLimit(tyTasks, 10),
          runWithConcurrencyLimit(lyTasks, 10),
        ]);

        if (cancelled) return;

        setTyWalkins(tyList);
        setLyWalkins(lyList);

        const tyMap = {};
        const lyMap = {};
        tyResults.forEach(r => { tyMap[r.locId] = r.data; });
        lyResults.forEach(r => { lyMap[r.locId] = r.data; });

        setTyPerformance(tyMap);
        setLyPerformance(lyMap);

      } catch (err) {
        console.error("Error fetching YoY walkins and performance for comparison:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    return () => { cancelled = true; };
  }, [activeTab, customStartDate, customEndDate]);

  const formatIndianNumber = (num) => {
    const isNegative = num < 0;
    const absNum = Math.abs(num);
    const str = absNum.toString();
    let lastThree = str.substring(str.length - 3);
    const otherNumbers = str.substring(0, str.length - 3);
    if (otherNumbers !== "") {
      lastThree = "," + lastThree;
    }
    const res = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
    return (isNegative ? "-" : "") + res;
  };

  const filteredRows = useMemo(() => {
    const activeList = branches.map((b, index) => {
      const name = displayBranchName(b.workingBranch);
      const storeKeyVal = locationKey(b.workingBranch);
      const locId = getBranchLocationId(b.workingBranch);

      const today = new Date();
      const todayStr = getLocalDateString(today);
      
      let tyStoreStart, tyStoreEnd, lyStoreStart, lyStoreEnd;
      if (activeTab === "WTD") {
        const rangeTy = getStoreWTDDateRange(name, 2026, storeWeekRanges);
        const rangeLy = getStoreWTDDateRange(name, 2025, storeWeekRanges);
        tyStoreStart = rangeTy.start;
        tyStoreEnd = rangeTy.end;
        lyStoreStart = rangeLy.start;
        lyStoreEnd = rangeLy.end;
      } else if (activeTab === "CUSTOM") {
        tyStoreStart = customStartDate;
        tyStoreEnd = customEndDate;
        const tyYear = new Date(customStartDate).getFullYear() || 2026;
        const lyYear = tyYear - 1;
        lyStoreStart = customStartDate.replace(String(tyYear), String(lyYear));
        lyStoreEnd = customEndDate.replace(String(tyYear), String(lyYear));
      } else {
        const rangeTy = getMTDDateRange(2026);
        const rangeLy = getMTDDateRange(2025);
        tyStoreStart = rangeTy.start;
        tyStoreEnd = rangeTy.end;
        lyStoreStart = rangeLy.start;
        lyStoreEnd = rangeLy.end;
      }

      const getWalkinDateString = (w) => {
        if (!w.date || w.date === '-') return '';
        return w.date.split(' ')[0];
      };

      const tyWalk = tyWalkins.filter(w => {
        const d = getWalkinDateString(w);
        return locationKey(w.store) === storeKeyVal && d && d >= tyStoreStart && d <= tyStoreEnd;
      }).length;

      const lyWalk = lyWalkins.filter(w => {
        const d = getWalkinDateString(w);
        return locationKey(w.store) === storeKeyVal && d && d >= lyStoreStart && d <= lyStoreEnd;
      }).length;

      const tyLocList = Array.isArray(tyPerformance[locId]) ? tyPerformance[locId] : [];
      const lyLocList = Array.isArray(lyPerformance[locId]) ? lyPerformance[locId] : [];

      // API property mapping from GetPerformanceStaffReportWithCancel:
      // totalValue = Sales Value (Rupees), total_Number_Of_Bill = Bill Count, totalQuantity = Qty
      const tyVal = tyLocList.reduce((sum, item) => sum + (item.totalValue || 0), 0);
      const lyVal = lyLocList.reduce((sum, item) => sum + (item.totalValue || 0), 0);
      const tyBill = tyLocList.reduce((sum, item) => sum + (item.total_Number_Of_Bill || 0), 0);
      const lyBill = lyLocList.reduce((sum, item) => sum + (item.total_Number_Of_Bill || 0), 0);
      const tyQty = tyLocList.reduce((sum, item) => sum + (item.totalQuantity || 0), 0);
      const lyQty = lyLocList.reduce((sum, item) => sum + (item.totalQuantity || 0), 0);

      return {
        sl: index + 1,
        name,
        tyVal,
        lyVal,
        tyBill,
        lyBill,
        tyQty,
        lyQty,
        tyWalk,
        lyWalk
      };
    });

    return activeList.filter((row) =>
      row.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [branches, tyWalkins, lyWalkins, tyPerformance, lyPerformance, searchQuery, activeTab, customStartDate, customEndDate, storeWeekRanges]);

  // Reset to page 1 when search or tab changes
  useEffect(() => { setCurrentPage(1); }, [searchQuery, activeTab]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / STORES_PER_PAGE));
  const paginatedRows = filteredRows.slice((currentPage - 1) * STORES_PER_PAGE, currentPage * STORES_PER_PAGE);

  // Dynamic calculations for totals row
  const totalTyVal = useMemo(() => filteredRows.reduce((acc, r) => acc + r.tyVal, 0), [filteredRows]);
  const totalLyVal = useMemo(() => filteredRows.reduce((acc, r) => acc + r.lyVal, 0), [filteredRows]);
  const totalL2lVal = useMemo(() => totalTyVal - totalLyVal, [totalTyVal, totalLyVal]);

  const totalTyBill = useMemo(() => filteredRows.reduce((acc, r) => acc + r.tyBill, 0), [filteredRows]);
  const totalLyBill = useMemo(() => filteredRows.reduce((acc, r) => acc + r.lyBill, 0), [filteredRows]);
  const totalL2lBill = useMemo(() => totalTyBill - totalLyBill, [totalTyBill, totalLyBill]);

  const totalTyQty = useMemo(() => filteredRows.reduce((acc, r) => acc + r.tyQty, 0), [filteredRows]);
  const totalLyQty = useMemo(() => filteredRows.reduce((acc, r) => acc + r.lyQty, 0), [filteredRows]);
  const totalL2lQty = useMemo(() => totalTyQty - totalLyQty, [totalTyQty, totalLyQty]);

  const totalTyWalk = useMemo(() => filteredRows.reduce((acc, r) => acc + r.tyWalk, 0), [filteredRows]);
  const totalLyWalk = useMemo(() => filteredRows.reduce((acc, r) => acc + r.lyWalk, 0), [filteredRows]);
  const totalL2lWalk = useMemo(() => totalTyWalk - totalLyWalk, [totalTyWalk, totalLyWalk]);

  const handleExportCSV = () => {
    const scaleLabel = activeTab === "MTD" ? "MTD" : (activeTab === "WTD" ? "WTD" : "CUSTOM");
    const fileName = `Growth_Comparison_${scaleLabel}_2026.csv`;
    
    const headers = [
      "Store Name",
      `Value TY (${scaleLabel})`, `Value LY (${scaleLabel})`, "Value L2L", "Value L2L %",
      `Bill TY (${scaleLabel})`, `Bill LY (${scaleLabel})`, "Bill L2L", "Bill L2L %",
      `Qty TY (${scaleLabel})`, `Qty LY (${scaleLabel})`, "Qty L2L", "Qty L2L %",
      `Walk-In TY (${scaleLabel})`, `Walk-In LY (${scaleLabel})`, "Walk-In L2L", "Walk-In L2L %"
    ];
    
    const rows = filteredRows.map((row) => {
      const vL2l = row.tyVal - row.lyVal;
      const vL2lPct = row.lyVal > 0 ? ((vL2l / row.lyVal) * 100).toFixed(1) + "%" : "0.0%";
      
      const bL2l = row.tyBill - row.lyBill;
      const bL2lPct = row.lyBill > 0 ? ((bL2l / row.lyBill) * 100).toFixed(1) + "%" : "0.0%";
      
      const qL2l = row.tyQty - row.lyQty;
      const qL2lPct = row.lyQty > 0 ? ((qL2l / row.lyQty) * 100).toFixed(1) + "%" : "0.0%";
      
      const wL2l = row.tyWalk - row.lyWalk;
      const wL2lPct = row.lyWalk > 0 ? ((wL2l / row.lyWalk) * 100).toFixed(1) + "%" : "0.0%";

      return [
        row.name,
        row.tyVal, row.lyVal, vL2l, vL2lPct,
        row.tyBill, row.lyBill, bL2l, bL2lPct,
        row.tyQty, row.lyQty, qL2l, qL2lPct,
        row.tyWalk, row.lyWalk, wL2l, wL2lPct
      ];
    });
    
    const totalVL2l = totalTyVal - totalLyVal;
    const totalVL2lPct = totalLyVal > 0 ? ((totalVL2l / totalLyVal) * 100).toFixed(1) + "%" : "0.0%";
    
    const totalBL2l = totalTyBill - totalLyBill;
    const totalBL2lPct = totalLyBill > 0 ? ((totalBL2l / totalLyBill) * 100).toFixed(1) + "%" : "0.0%";
    
    const totalQL2l = totalTyQty - totalLyQty;
    const totalQL2lPct = totalLyQty > 0 ? ((totalQL2l / totalLyQty) * 100).toFixed(1) + "%" : "0.0%";
    
    const totalWL2l = totalTyWalk - totalLyWalk;
    const totalWL2lPct = totalLyWalk > 0 ? ((totalWL2l / totalLyWalk) * 100).toFixed(1) + "%" : "0.0%";
    
    rows.push([
      "Total",
      totalTyVal, totalLyVal, totalVL2l, totalVL2lPct,
      totalTyBill, totalLyBill, totalBL2l, totalBL2lPct,
      totalTyQty, totalLyQty, totalQL2l, totalQL2lPct,
      totalTyWalk, totalLyWalk, totalWL2l, totalWL2lPct
    ]);
    
    const csvContent = [headers, ...rows].map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(",")).join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const scaleLabel = activeTab === "MTD" ? "MTD" : (activeTab === "WTD" ? "WTD" : "CUSTOM");

  return (
    <div className="flex w-full min-h-screen bg-[#f3f4f6] text-gray-800" style={{ fontFamily: "DM Sans, sans-serif" }}>
      {/* SideNav desktop */}
      <SideNav />
      
      {/* Mobile navigation */}
      <div className="md:hidden">
        <ModileNav />
      </div>

      {/* Main dashboard content */}
      <div className="flex-1 min-w-0 md:ml-[110px] min-h-screen p-4 sm:p-6 lg:p-8 mb-[70px] md:mb-0 overflow-x-hidden">
        
        {/* Top Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-[26px] font-bold text-gray-900 leading-tight">Store Rental Comparison</h1>
            <p className="text-gray-500 text-[13px] mt-0.5">Real time performance overview across all stores</p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            {activeTab === "WTD" && (
              <div className="flex items-center gap-2 bg-zinc-900 text-white px-3.5 py-1.5 rounded-xl text-xs font-semibold shadow-sm">
                <span className="bg-amber-500 text-black px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                  Week {getActiveWeekInfo(storeWeekRanges).activeWeekId}
                </span>
                <span>{getActiveWeekInfo(storeWeekRanges).rangeStr}</span>
              </div>
            )}
            {activeTab === "CUSTOM" && (
              <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-gray-200 shadow-sm text-xs font-medium text-gray-600">
                <span className="font-bold text-gray-800">TY Range:</span>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="bg-transparent border-none outline-none text-gray-800 font-semibold cursor-pointer"
                />
                <span className="text-gray-300">|</span>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="bg-transparent border-none outline-none text-gray-800 font-semibold cursor-pointer"
                />
              </div>
            )}
            {/* MTD / WTD / Custom switcher */}
            <div className="flex bg-[#e5e7eb] p-1 rounded-xl shadow-sm">
              <button 
                onClick={() => setActiveTab("MTD")}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === "MTD" 
                    ? "bg-[#18181b] text-white shadow-sm" 
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                MTD
              </button>
              <button 
                onClick={() => setActiveTab("WTD")}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === "WTD" 
                    ? "bg-[#18181b] text-white shadow-sm" 
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                WTD
              </button>
              <button 
                onClick={() => setActiveTab("CUSTOM")}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === "CUSTOM" 
                    ? "bg-[#18181b] text-white shadow-sm" 
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Custom
              </button>
            </div>
          </div>
        </div>

        {/* Filter Bar Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          {/* Search bar */}
          <div className="relative w-full sm:max-w-xs">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400">
              <FiSearch size={16} />
            </span>
            <input 
              type="text" 
              placeholder="Search Store name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#eef1f6] border-none rounded-xl pl-10 pr-4 py-2.5 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>

          {/* Export Button */}
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-2 bg-[#eaecf0] hover:bg-gray-200 text-gray-700 font-bold px-4 py-2 rounded-xl text-xs transition-colors self-start sm:self-auto cursor-pointer"
          >
            <FiDownload size={14} /> Export
          </button>
        </div>

        {/* Main Content Area Card */}
        <div className="relative bg-white rounded-[20px] shadow-sm border border-gray-100 overflow-hidden">
          {loading && (
            <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] flex flex-col items-center justify-center z-30 min-h-[300px]">
              <div className="w-8 h-8 border-3 border-zinc-300 border-t-zinc-900 rounded-full animate-spin mb-2" />
              <span className="text-xs font-bold text-gray-700">Loading Store Comparison Data...</span>
            </div>
          )}
          
          {/* Data Table */}
          <div className="overflow-x-auto w-full">
            <table className="w-full text-center border-collapse">
              <thead>
                {/* Primary header row */}
                <tr className="bg-[#18181b] text-white text-[11px] font-bold tracking-wider uppercase border-b border-zinc-700">
                  <th rowSpan={2} className="sticky left-0 z-20 bg-[#18181b] px-6 py-4 text-left border-r border-zinc-700 w-60 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.3)]">Store Name</th>
                  <th colSpan={3} className="px-6 py-2 border-r border-zinc-700 text-center">Value</th>
                  <th colSpan={3} className="px-6 py-2 border-r border-zinc-700 text-center">Bill</th>
                  <th colSpan={3} className="px-6 py-2 border-r border-zinc-700 text-center">Quantity</th>
                  <th colSpan={3} className="px-6 py-2 text-center">Walk In</th>
                </tr>
                {/* Secondary header row */}
                <tr className="bg-[#18181b] text-zinc-300 text-[10px] font-bold tracking-wider uppercase">
                  {/* Value */}
                  <th className="px-4 py-2 border-r border-zinc-700">{`TY ${scaleLabel}`}</th>
                  <th className="px-4 py-2 border-r border-zinc-700">{`LY ${scaleLabel}`}</th>
                  <th className="px-4 py-2 border-r border-zinc-700">L2L</th>
                  
                  {/* Bill */}
                  <th className="px-4 py-2 border-r border-zinc-700">{`TY ${scaleLabel}`}</th>
                  <th className="px-4 py-2 border-r border-zinc-700">{`LY ${scaleLabel}`}</th>
                  <th className="px-4 py-2 border-r border-zinc-700">L2L</th>
                  
                  {/* Quantity */}
                  <th className="px-4 py-2 border-r border-zinc-700">{`TY ${scaleLabel}`}</th>
                  <th className="px-4 py-2 border-r border-zinc-700">{`LY ${scaleLabel}`}</th>
                  <th className="px-4 py-2 border-r border-zinc-700">L2L</th>

                  {/* Walk In */}
                  <th className="px-4 py-2 border-r border-zinc-700">{`TY ${scaleLabel}`}</th>
                  <th className="px-4 py-2 border-r border-zinc-700">{`LY ${scaleLabel}`}</th>
                  <th className="px-4 py-2">L2L</th>
                </tr>
              </thead>
              <tbody className="text-xs text-gray-700 divide-y divide-gray-100">
                {paginatedRows.map((row, idx) => {
                  const calculatedL2lVal = row.tyVal - row.lyVal;
                  const calculatedL2lBill = row.tyBill - row.lyBill;
                  const calculatedL2lQty = row.tyQty - row.lyQty;
                  const calculatedL2lWalk = row.tyWalk - row.lyWalk;

                  const valL2lPctVal = row.lyVal > 0 ? ((row.tyVal / row.lyVal) * 100).toFixed(0) : "0";
                  const valL2lPctText = `${valL2lPctVal}%`;

                  const billL2lPctVal = row.lyBill > 0 ? ((row.tyBill / row.lyBill) * 100).toFixed(0) : "0";
                  const billL2lPctText = `${billL2lPctVal}%`;

                  const qtyL2lPctVal = row.lyQty > 0 ? ((row.tyQty / row.lyQty) * 100).toFixed(0) : "0";
                  const qtyL2lPctText = `${qtyL2lPctVal}%`;

                  const walkL2lPctVal = row.lyWalk > 0 ? ((row.tyWalk / row.lyWalk) * 100).toFixed(0) : "0";
                  const walkL2lPctText = `${walkL2lPctVal}%`;

                  const valL2lColor = calculatedL2lVal >= 0 ? "text-[#00A36C]" : "text-[#e05a47]";
                  const billL2lColor = calculatedL2lBill >= 0 ? "text-[#00A36C]" : "text-[#e05a47]";
                  const qtyL2lColor = calculatedL2lQty >= 0 ? "text-[#00A36C]" : "text-[#e05a47]";
                  const walkL2lColor = calculatedL2lWalk >= 0 ? "text-[#00A36C]" : "text-[#e05a47]";

                  return (
                    <tr key={idx} className="odd:bg-white even:bg-[#f9fafb] hover:bg-gray-50/50 transition-colors" style={{ animationDelay: `${idx * 40}ms` }}>
                      <td className={`sticky left-0 z-10 px-6 py-4 text-left font-bold text-gray-800 border-r border-gray-100 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.15)] ${idx % 2 === 0 ? "bg-white" : "bg-[#f9fafb]"}`}>{row.name}</td>
                      
                      <td className="px-4 py-4 font-medium border-r border-gray-100">{renderCellVal(formatIndianNumber(row.tyVal))}</td>
                      <td className="px-4 py-4 font-medium border-r border-gray-100 text-gray-500">{renderCellVal(formatIndianNumber(row.lyVal))}</td>
                      <td className="px-4 py-4 border-r border-gray-100">
                        <div className="flex flex-col items-center justify-center gap-0.5">
                          <span className="text-[13px] font-bold text-gray-900">{valL2lPctText}</span>
                          <span className={`text-[10px] font-semibold ${valL2lColor}`}>
                            {calculatedL2lVal >= 0 ? "" : "-"}{formatIndianNumber(Math.abs(calculatedL2lVal))}
                          </span>
                        </div>
                      </td>
                      
                      <td className="px-4 py-4 font-medium border-r border-gray-100">{renderCellVal(row.tyBill)}</td>
                      <td className="px-4 py-4 font-medium border-r border-gray-100 text-gray-500">{renderCellVal(row.lyBill)}</td>
                      <td className="px-4 py-4 border-r border-gray-100">
                        <div className="flex flex-col items-center justify-center gap-0.5">
                          <span className="text-[13px] font-bold text-gray-900">{billL2lPctText}</span>
                          <span className={`text-[10px] font-semibold ${billL2lColor}`}>
                            {calculatedL2lBill >= 0 ? "" : "-"}{formatIndianNumber(Math.abs(calculatedL2lBill))}
                          </span>
                        </div>
                      </td>
                      
                      <td className="px-4 py-4 font-medium border-r border-gray-100">{renderCellVal(row.tyQty)}</td>
                      <td className="px-4 py-4 font-medium border-r border-gray-100 text-gray-500">{renderCellVal(row.lyQty)}</td>
                      <td className="px-4 py-4 border-r border-gray-100">
                        <div className="flex flex-col items-center justify-center gap-0.5">
                          <span className="text-[13px] font-bold text-gray-900">{qtyL2lPctText}</span>
                          <span className={`text-[10px] font-semibold ${qtyL2lColor}`}>
                            {calculatedL2lQty >= 0 ? "" : "-"}{formatIndianNumber(Math.abs(calculatedL2lQty))}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-4 font-medium border-r border-gray-100">{renderCellVal(formatIndianNumber(row.tyWalk))}</td>
                      <td className="px-4 py-4 font-medium border-r border-gray-100 text-gray-500">{renderCellVal(formatIndianNumber(row.lyWalk))}</td>
                      <td className="px-4 py-4">
                        <div className="flex flex-col items-center justify-center gap-0.5">
                          <span className="text-[13px] font-bold text-gray-900">{walkL2lPctText}</span>
                          <span className={`text-[10px] font-semibold ${walkL2lColor}`}>
                            {calculatedL2lWalk >= 0 ? "" : "-"}{formatIndianNumber(Math.abs(calculatedL2lWalk))}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {/* STORE TOTAL row */}
                <tr className="bg-[#f1f5f9] border-t-2 border-zinc-300 font-bold text-gray-900">
                  <td className="sticky left-0 z-10 bg-[#f1f5f9] px-6 py-4 text-left border-r border-zinc-300 uppercase tracking-wider shadow-[2px_0_5px_-2px_rgba(0,0,0,0.15)]">Store Total</td>
                  
                  <td className="px-4 py-4 border-r border-zinc-200">{renderCellVal(formatIndianNumber(totalTyVal))}</td>
                  <td className="px-4 py-4 border-r border-zinc-200 text-gray-600">{renderCellVal(formatIndianNumber(totalLyVal))}</td>
                  <td className="px-4 py-4 border-r border-zinc-200">
                    <div className="flex flex-col items-center justify-center gap-0.5">
                      <span className="text-[13px] font-bold text-gray-900">{totalLyVal > 0 ? ((totalTyVal / totalLyVal) * 100).toFixed(0) : "0"}%</span>
                      <span className={`text-[10px] font-bold ${totalL2lVal >= 0 ? 'text-[#00A36C]' : 'text-[#e05a47]'}`}>
                        {totalL2lVal >= 0 ? "" : "-"}{formatIndianNumber(Math.abs(totalL2lVal))}
                      </span>
                    </div>
                  </td>
                  
                  <td className="px-4 py-4 border-r border-zinc-200">{renderCellVal(formatIndianNumber(totalTyBill))}</td>
                  <td className="px-4 py-4 border-r border-zinc-200 text-gray-600">{renderCellVal(formatIndianNumber(totalLyBill))}</td>
                  <td className="px-4 py-4 border-r border-zinc-200">
                    <div className="flex flex-col items-center justify-center gap-0.5">
                      <span className="text-[13px] font-bold text-gray-900">{totalLyBill > 0 ? ((totalTyBill / totalLyBill) * 100).toFixed(0) : "0"}%</span>
                      <span className={`text-[10px] font-bold ${totalL2lBill >= 0 ? 'text-[#00A36C]' : 'text-[#e05a47]'}`}>
                        {totalL2lBill >= 0 ? "" : "-"}{formatIndianNumber(Math.abs(totalL2lBill))}
                      </span>
                    </div>
                  </td>
                  
                  <td className="px-4 py-4 border-r border-zinc-200">{renderCellVal(formatIndianNumber(totalTyQty))}</td>
                  <td className="px-4 py-4 border-r border-zinc-200 text-gray-600">{renderCellVal(formatIndianNumber(totalLyQty))}</td>
                  <td className="px-4 py-4 border-r border-zinc-200">
                    <div className="flex flex-col items-center justify-center gap-0.5">
                      <span className="text-[13px] font-bold text-gray-900">{totalLyQty > 0 ? ((totalTyQty / totalLyQty) * 100).toFixed(0) : "0"}%</span>
                      <span className={`text-[10px] font-bold ${totalL2lQty >= 0 ? 'text-[#00A36C]' : 'text-[#e05a47]'}`}>
                        {totalL2lQty >= 0 ? "" : "-"}{formatIndianNumber(Math.abs(totalL2lQty))}
                      </span>
                    </div>
                  </td>

                  <td className="px-4 py-4 border-r border-zinc-200">{renderCellVal(formatIndianNumber(totalTyWalk))}</td>
                  <td className="px-4 py-4 border-r border-zinc-200 text-gray-600">{renderCellVal(formatIndianNumber(totalLyWalk))}</td>
                  <td className="px-4 py-4">
                    <div className="flex flex-col items-center justify-center gap-0.5">
                      <span className="text-[13px] font-bold text-gray-900">{totalLyWalk > 0 ? ((totalTyWalk / totalLyWalk) * 100).toFixed(0) : "0"}%</span>
                      <span className={`text-[10px] font-bold ${totalL2lWalk >= 0 ? 'text-[#00A36C]' : 'text-[#e05a47]'}`}>
                        {totalL2lWalk >= 0 ? "" : "-"}{formatIndianNumber(Math.abs(totalL2lWalk))}
                      </span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Pagination Bar */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-[#fafafa]">
              <span className="text-xs text-gray-500 font-medium">
                Showing <span className="font-bold text-gray-800">{((currentPage - 1) * STORES_PER_PAGE) + 1}–{Math.min(currentPage * STORES_PER_PAGE, filteredRows.length)}</span> of <span className="font-bold text-gray-800">{filteredRows.length}</span> stores
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold text-gray-500 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="First page"
                >
                  «
                </button>
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold text-gray-500 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="Previous page"
                >
                  ‹
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all ${
                      page === currentPage
                        ? "bg-[#18181b] text-white shadow-sm"
                        : "text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold text-gray-500 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="Next page"
                >
                  ›
                </button>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold text-gray-500 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="Last page"
                >
                  »
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default GrowthComparison;
