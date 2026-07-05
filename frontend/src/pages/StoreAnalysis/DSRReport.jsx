import React, { useState, useEffect, useMemo, useRef } from "react";
import { useSelector } from "react-redux";
import SideNav from "../../components/SideNav/SideNav";
import ModileNav from "../../components/SideNav/ModileNav";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { FiSearch, FiDownload, FiArrowLeft, FiCalendar, FiEdit3 } from "react-icons/fi";
import baseUrl from "../../api/api";

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

function getLocalDateString(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const BRANCH_LOCATION_MAPPING = {
  "z-edapally1": "1",
  "z-edappally1": "1",
  "g.mg road": "23",
  "g.mgroad": "23",
  "gmg road": "23",
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
};

// Maps Dappr Squad (loc 25) bookingBy names → the target store locId they belong to
const DAPPR_SQUAD_STORE_MAPPING = {
  "sg.edappally": "3",
  "sg.perumbavoor": "10",
  "sg.thrissur": "11",
  "sg.chavakkad": "12",
  "sg.calicut": "13",
  "sg.vadakara": "14",
  "sg.perinthalmanna": "16",
  "sg.kottakkal": "17",
  "sg.manjeri": "18",
  "sg.palakkad": "19",
  "sg.kalpetta": "20",
  "sg.kannur": "21",
  "sg.trivandrum": "5",
  "sg.kottayam": "9",
};

// Get all Dappr Squad entries from loc 25 that belong to a given store locId
function getDapprSquadDataForStore(locId, dapprList) {
  return dapprList.filter(item => {
    const name = String(item.bookingBy || "").trim().toLowerCase();
    return DAPPR_SQUAD_STORE_MAPPING[name] === locId;
  });
}

function getBranchLocationId(workingBranch) {
  if (!workingBranch) return null;
  const normalized = String(workingBranch).trim().toLowerCase();
  return BRANCH_LOCATION_MAPPING[normalized] || null;
}

const STORE_TO_LOC_CODE = {
  "zedapally1": "144",
  "zedappally1": "144",
  "gedappally": "702",
  "sgedappally": "702",
  "gtrivandrum": "700",
  "zedappal": "100",
  "zperinthalmanna": "133",
  "zkottakkal": "122",
  "gkottayam": "701",
  "gperumbavoor": "703",
  "gthrissur": "704",
  "gchavakkad": "706",
  "gcalicut": "712",
  "gvadakara": "708",
  "gedappal": "707",
  "gperinthalmanna": "709",
  "gkottakkal": "711",
  "gmanjeri": "710",
  "gpalakkad": "705",
  "gkalpetta": "717",
  "gkannur": "716",
  "gmgroad": "718"
};

function getBranchLocCode(workingBranch, branchesList) {
  if (!workingBranch) return null;
  const found = (branchesList || []).find(
    (b) => String(b.workingBranch).trim().toLowerCase() === String(workingBranch).trim().toLowerCase()
  );
  if (found && found.locCode) return found.locCode;

  const normalized = String(workingBranch).trim().toLowerCase().replace(/[^a-z0-9]/g, "");
  return STORE_TO_LOC_CODE[normalized] || null;
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
  const cacheKey = `perfnc_${locId}_${startDate}_${endDate}`;
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

function normalizeForMatch(str) {
  if (!str) return "";
  return String(str)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .replace(/^sg/, "g")
    .replace(/^dapper/, "dappr");
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

const DSRReport = () => {
  const user = useSelector((state) => state.auth.user);
  const isAdminOrSuperAdmin = user?.role === "super_admin" || user?.role === "admin";
  const [searchQuery, setSearchQuery] = useState("");
  const targetInputRef = useRef(null);
  const [selectedStore, setSelectedStore] = useState("All");
  const [selectedReport, setSelectedReport] = useState("Revenue Vs Target");
  const [activeTab, setActiveTab] = useState("MTD");
  const [customStartDate, setCustomStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return getLocalDateString(d);
  });
  const [customEndDate, setCustomEndDate] = useState(() => getLocalDateString(new Date()));

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
  
  // Custom dropdown states
  const [storeDropdownOpen, setStoreDropdownOpen] = useState(false);
  const [reportDropdownOpen, setReportDropdownOpen] = useState(false);

  // Assign target modal states
  const [assignTargetModalOpen, setAssignTargetModalOpen] = useState(false);
  const [modalStore, setModalStore] = useState("");
  const [modalMonth, setModalMonth] = useState(CURRENT_MONTH_LONG);
  const [modalTarget, setModalTarget] = useState("");
  const [activeWeeks, setActiveWeeks] = useState([1]);
  const [week1Dates, setWeek1Dates] = useState(() => localStorage.getItem("week1Dates") || `01 - 10 ${CURRENT_MONTH_SHORT}`);
  const [week2Dates, setWeek2Dates] = useState(() => localStorage.getItem("week2Dates") || `11 - 17 ${CURRENT_MONTH_SHORT}`);
  const [week3Dates, setWeek3Dates] = useState(() => localStorage.getItem("week3Dates") || "Select Days");
  const [week4Dates, setWeek4Dates] = useState(() => localStorage.getItem("week4Dates") || "Select Days");

  // Local modal week date states
  const [modalWeek1, setModalWeek1] = useState(`01 - 10 ${CURRENT_MONTH_SHORT}`);
  const [modalWeek2, setModalWeek2] = useState(`11 - 17 ${CURRENT_MONTH_SHORT}`);
  const [modalWeek3, setModalWeek3] = useState("Select Days");
  const [modalWeek4, setModalWeek4] = useState("Select Days");

  const [storeWeekRanges, setStoreWeekRanges] = useState(() => {
    try {
      const stored = localStorage.getItem("storeWeekRanges");
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const [weeklyTargets, setWeeklyTargets] = useState(() => {
    try {
      const stored = localStorage.getItem("weeklyTargets");
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const getCurrentWeekId = (storeName = "All") => {
    const today = new Date();
    const todayDateNum = today.getDate();

    let w1 = week1Dates, w2 = week2Dates, w3 = week3Dates, w4 = week4Dates;
    if (storeName !== "All" && storeWeekRanges[storeName]) {
      const sr = storeWeekRanges[storeName];
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

    for (const w of weeks) {
      if (w.val && w.val !== "Select Days") {
        const parts = w.val.split("-");
        if (parts.length === 2) {
          const startDay = parseInt(parts[0].trim(), 10);
          const endPart = parts[1].trim().split(" ");
          const endDay = parseInt(endPart[0], 10);

          if (!isNaN(startDay) && !isNaN(endDay)) {
            if (todayDateNum >= startDay && todayDateNum <= endDay) {
              return w.id;
            }
          }
        }
      }
    }

    if (todayDateNum <= 10) return 1;
    if (todayDateNum <= 17) return 2;
    if (todayDateNum <= 24) return 3;
    return 4;
  };

  const getCustomRangeTarget = (storeName, startDateStr, endDateStr) => {
    if (!startDateStr || !endDateStr) return 0;
    
    const start = new Date(startDateStr);
    const end = new Date(endDateStr);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
    
    // Parse the week date ranges for the store
    const targetMonth = start.getMonth(); // target month is the month of custom range start date
    
    const week1DatesVal = localStorage.getItem("week1Dates") || `01 - 10 ${CURRENT_MONTH_SHORT}`;
    const week2DatesVal = localStorage.getItem("week2Dates") || `11 - 17 ${CURRENT_MONTH_SHORT}`;
    const week3DatesVal = localStorage.getItem("week3Dates") || "Select Days";
    const week4DatesVal = localStorage.getItem("week4Dates") || "Select Days";

    let w1 = week1DatesVal, w2 = week2DatesVal, w3 = week3DatesVal, w4 = week4DatesVal;
    if (storeName !== "All" && storeWeekRanges[storeName]) {
      const sr = storeWeekRanges[storeName];
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
        // Fallbacks
        if (weekId === 1) { startDay = 1; endDay = 10; }
        else if (weekId === 2) { startDay = 11; endDay = 17; }
        else if (weekId === 3) { startDay = 18; endDay = 24; }
        else { 
          const startMonthName = start.toLocaleString("en-US", { month: "long" });
          startDay = 25; 
          endDay = getDaysCountInMonth(startMonthName); 
        }
      }
      return { startDay, endDay, count: (endDay - startDay + 1) };
    };
    
    const wRanges = {
      1: parseRange(w1, 1),
      2: parseRange(w2, 2),
      3: parseRange(w3, 3),
      4: parseRange(w4, 4),
    };
    
    const storeTargetObj = weeklyTargets[storeName] || {};
    
    // Sum daily target contributions
    let totalTarget = 0;
    
    // Loop through each day from start to end
    let temp = new Date(start);
    while (temp <= end) {
      const dayNum = temp.getDate();
      const tempMonth = temp.getMonth();
      // Ensure we only sum for the target month
      if (tempMonth === targetMonth) {
        // Find which week contains this day
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
      
      // Move to next day
      temp.setDate(temp.getDate() + 1);
    }
    
    return Math.round(totalTarget);
  };

  const getStoreTarget = (storeName, defaultTarget, activeTabVal, customFactorVal) => {
    const storeTargetObj = weeklyTargets[storeName] || {};
    
    // Monthly (MTD) is the sum of all weeks
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
      // Weekly (WTD) shows the active week target
      const currentWeekId = getCurrentWeekId(storeName); 
      if (storeTargetObj[currentWeekId] !== undefined) {
        return storeTargetObj[currentWeekId];
      }
      return Math.round(defaultTarget * 0.23);
    }

    if (activeTabVal === "Custom") {
      // Proportional custom target calculated accurately based on custom date overlaps
      return getCustomRangeTarget(storeName, customStartDate, customEndDate);
    }
    
    return defaultTarget;
  };

  const handleSubmitTarget = async (store, val, month) => {
    const cleanVal = String(val || "").replace(/[^0-9.-]/g, "");
    const parsed = Number(cleanVal);
    
    // Save targets
    if (val !== undefined && val !== null && val.trim() !== "" && !isNaN(parsed)) {
      const updatedTargets = { ...weeklyTargets };
      
      if (store === "All") {
        const allObj = { ...(updatedTargets["All"] || {}) };
        activeWeeks.forEach((wk) => {
          allObj[wk] = parsed;
        });
        updatedTargets["All"] = allObj;

        storeOptions.filter(o => o !== "All").forEach((storeName) => {
          const storeObj = { ...(updatedTargets[storeName] || {}) };
          activeWeeks.forEach((wk) => {
            storeObj[wk] = parsed;
          });
          updatedTargets[storeName] = storeObj;
        });
      } else {
        const storeObj = { ...(updatedTargets[store] || {}) };
        activeWeeks.forEach((wk) => {
          storeObj[wk] = parsed;
        });
        updatedTargets[store] = storeObj;
      }
      
      setWeeklyTargets(updatedTargets);
      localStorage.setItem("weeklyTargets", JSON.stringify(updatedTargets));

      // Pushing to DB asynchronously
      if (store === "All") {
        // Save to All first
        await saveStoreTargetToDb("All", updatedTargets, storeWeekRanges, month, CURRENT_YEAR);
        // Save for each store in list
        const promises = storeOptions.filter(o => o !== "All").map((storeName) => {
          return saveStoreTargetToDb(storeName, updatedTargets, storeWeekRanges, month, CURRENT_YEAR);
        });
        await Promise.all(promises);
      } else {
        await saveStoreTargetToDb(store, updatedTargets, storeWeekRanges, month, CURRENT_YEAR);
      }
    }

    setAssignTargetModalOpen(false);
  };

  // Configure Week Dates Modal States
  const [configWeeksModalOpen, setConfigWeeksModalOpen] = useState(false);
  const [configStore, setConfigStore] = useState("All");
  const [configMonth, setConfigMonth] = useState(CURRENT_MONTH_LONG);
  const [configWeek1, setConfigWeek1] = useState(`01 - 10 ${CURRENT_MONTH_SHORT}`);
  const [configWeek2, setConfigWeek2] = useState(`11 - 17 ${CURRENT_MONTH_SHORT}`);
  const [configWeek3, setConfigWeek3] = useState("Select Days");
  const [configWeek4, setConfigWeek4] = useState("Select Days");
  const [configCalendarOpen, setConfigCalendarOpen] = useState(null);
  const [configStartDays, setConfigStartDays] = useState({ 1: 1, 2: 11, 3: null, 4: null });
  const [configEndDays, setConfigEndDays] = useState({ 1: 10, 2: 17, 3: null, 4: null });

  // Sync config week dates when configStore changes
  useEffect(() => {
    if (configWeeksModalOpen) {
      if (configStore && configStore !== "All" && storeWeekRanges[configStore]) {
        const sr = storeWeekRanges[configStore];
        setConfigWeek1(sr[1] || week1Dates);
        setConfigWeek2(sr[2] || week2Dates);
        setConfigWeek3(sr[3] || week3Dates);
        setConfigWeek4(sr[4] || week4Dates);
      } else {
        setConfigWeek1(week1Dates);
        setConfigWeek2(week2Dates);
        setConfigWeek3(week3Dates);
        setConfigWeek4(week4Dates);
      }
    }
  }, [configStore, configWeeksModalOpen, storeWeekRanges, week1Dates, week2Dates, week3Dates, week4Dates]);

  // Parse picker days for the config weeks modal
  useEffect(() => {
    const parseDays = (dateStr) => {
      if (!dateStr || dateStr === "Select Days") return { start: null, end: null };
      const parts = dateStr.split("-");
      if (parts.length === 2) {
        const startDay = parseInt(parts[0].trim(), 10);
        const cleanEndPart = parts[1].trim().split(" ")[0];
        const endDay = parseInt(cleanEndPart, 10);
        if (!isNaN(startDay) && !isNaN(endDay)) {
          return { start: startDay, end: endDay };
        }
      }
      return { start: null, end: null };
    };

    const p1 = parseDays(configWeek1);
    const p2 = parseDays(configWeek2);
    const p3 = parseDays(configWeek3);
    const p4 = parseDays(configWeek4);
    setConfigStartDays({ 1: p1.start, 2: p2.start, 3: p3.start, 4: p4.start });
    setConfigEndDays({ 1: p1.end, 2: p2.end, 3: p3.end, 4: p4.end });
  }, [configWeek1, configWeek2, configWeek3, configWeek4, configWeeksModalOpen]);

  const handleSaveConfigWeeks = async () => {
    if (!configStore) {
      alert("Please select a store (or All Stores).");
      return;
    }
    
    if (configStore === "All") {
      setWeek1Dates(configWeek1);
      setWeek2Dates(configWeek2);
      setWeek3Dates(configWeek3);
      setWeek4Dates(configWeek4);
      localStorage.setItem("week1Dates", configWeek1);
      localStorage.setItem("week2Dates", configWeek2);
      localStorage.setItem("week3Dates", configWeek3);
      localStorage.setItem("week4Dates", configWeek4);
      
      setStoreWeekRanges((prev) => {
        const updated = {
          ...prev,
          "All": {
            1: configWeek1,
            2: configWeek2,
            3: configWeek3,
            4: configWeek4
          }
        };
        localStorage.setItem("storeWeekRanges", JSON.stringify(updated));
        return updated;
      });
      
      // Save global All default range to DB
      await saveStoreTargetToDb("All", weeklyTargets, {
        ...storeWeekRanges,
        "All": { 1: configWeek1, 2: configWeek2, 3: configWeek3, 4: configWeek4 }
      }, configMonth, CURRENT_YEAR);
    } else {
      setStoreWeekRanges((prev) => {
        const updated = {
          ...prev,
          [configStore]: {
            1: configWeek1,
            2: configWeek2,
            3: configWeek3,
            4: configWeek4
          }
        };
        localStorage.setItem("storeWeekRanges", JSON.stringify(updated));
        return updated;
      });
      
      // Save specific store range to DB
      await saveStoreTargetToDb(configStore, weeklyTargets, {
        ...storeWeekRanges,
        [configStore]: { 1: configWeek1, 2: configWeek2, 3: configWeek3, 4: configWeek4 }
      }, configMonth, CURRENT_YEAR);
    }
    
    setConfigWeeksModalOpen(false);
  };

  useEffect(() => {
    if (modalStore && activeWeeks && activeWeeks.length > 0) {
      const primaryWeek = activeWeeks[0];
      const customVal = weeklyTargets[modalStore]?.[primaryWeek];
      if (customVal !== undefined) {
        setModalTarget(customVal.toString());
      } else {
        setModalTarget("");
      }
    }
  }, [modalStore, activeWeeks, weeklyTargets]);

  // Synchronize modal state dates when store or modal visibility changes
  useEffect(() => {
    if (assignTargetModalOpen) {
      setActiveWeeks([1]);
      if (modalStore && modalStore !== "All" && storeWeekRanges[modalStore]) {
        const sr = storeWeekRanges[modalStore];
        setModalWeek1(sr[1] || week1Dates);
        setModalWeek2(sr[2] || week2Dates);
        setModalWeek3(sr[3] || week3Dates);
        setModalWeek4(sr[4] || week4Dates);
      } else {
        setModalWeek1(week1Dates);
        setModalWeek2(week2Dates);
        setModalWeek3(week3Dates);
        setModalWeek4(week4Dates);
      }
    }
  }, [modalStore, assignTargetModalOpen, storeWeekRanges, week1Dates, week2Dates, week3Dates, week4Dates]);

  const [calendarOpenForWeek, setCalendarOpenForWeek] = useState(null);
  const [weekStartDays, setWeekStartDays] = useState({ 1: 1, 2: 11, 3: null, 4: null });
  const [weekEndDays, setWeekEndDays] = useState({ 1: 10, 2: 17, 3: null, 4: null });

  useEffect(() => {
    const parseDays = (dateStr) => {
      if (!dateStr || dateStr === "Select Days") return { start: null, end: null };
      const parts = dateStr.split("-");
      if (parts.length === 2) {
        const startDay = parseInt(parts[0].trim(), 10);
        const cleanEndPart = parts[1].trim().split(" ")[0];
        const endDay = parseInt(cleanEndPart, 10);
        if (!isNaN(startDay) && !isNaN(endDay)) {
          return { start: startDay, end: endDay };
        }
      }
      return { start: null, end: null };
    };

    const p1 = parseDays(modalWeek1);
    const p2 = parseDays(modalWeek2);
    const p3 = parseDays(modalWeek3);
    const p4 = parseDays(modalWeek4);
    setWeekStartDays({ 1: p1.start, 2: p2.start, 3: p3.start, 4: p4.start });
    setWeekEndDays({ 1: p1.end, 2: p2.end, 3: p3.end, 4: p4.end });
  }, [modalWeek1, modalWeek2, modalWeek3, modalWeek4, assignTargetModalOpen]);

  const getDaysCountInMonth = (monthName, year = CURRENT_YEAR) => {
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

  const handleWeekCardClick = (weekId, currentVal) => {
    setActiveWeek(weekId);
    setCalendarOpenForWeek(calendarOpenForWeek === weekId ? null : weekId);
    
    if (currentVal && currentVal !== "Select Days") {
      const parts = currentVal.split("-");
      if (parts.length === 2) {
        const startDay = parseInt(parts[0].trim(), 10);
        const cleanEndPart = parts[1].trim().split(" ")[0];
        const endDay = parseInt(cleanEndPart, 10);
        if (!isNaN(startDay) && !isNaN(endDay)) {
          setWeekStartDays(prev => ({ ...prev, [weekId]: startDay }));
          setWeekEndDays(prev => ({ ...prev, [weekId]: endDay }));
          return;
        }
      }
    }
  };

  const handleScrollPickerChange = (weekId, startDay, endDay, setVal) => {
    let newStart = startDay;
    let newEnd = endDay;

    if (newStart !== null && newEnd !== null && newEnd < newStart) {
      newEnd = newStart;
    }

    setWeekStartDays(prev => ({ ...prev, [weekId]: newStart }));
    setWeekEndDays(prev => ({ ...prev, [weekId]: newEnd }));

    const monthAbbr = (modalMonth || "June").substring(0, 3);
    if (newStart !== null && newEnd !== null) {
      const formatted = `${String(newStart).padStart(2, "0")} - ${String(newEnd).padStart(2, "0")} ${monthAbbr}`;
      setVal(formatted);
    } else if (newStart !== null) {
      const formatted = `${String(newStart).padStart(2, "0")} - ${String(newStart).padStart(2, "0")} ${monthAbbr}`;
      setVal(formatted);
    } else {
      setVal("Select Days");
    }
  };

  const fetchStoreTargets = async (targetMonth = CURRENT_MONTH_LONG, targetYear = CURRENT_YEAR) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${baseUrl.baseUrl}api/store-targets?month=${targetMonth}&year=${targetYear}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) {
        const json = await res.json();
        const data = json.data || [];
        
        const targetsMap = {};
        const rangesMap = {};
        const monthShort = targetMonth.substring(0, 3);
        let w1 = `01 - 10 ${monthShort}`;
        let w2 = `11 - 17 ${monthShort}`;
        let w3 = "Select Days";
        let w4 = "Select Days";
        
        data.forEach((doc) => {
          const store = doc.storeName;
          if (store === "All") {
            w1 = doc.weekRanges?.[1] || `01 - 10 ${monthShort}`;
            w2 = doc.weekRanges?.[2] || `11 - 17 ${monthShort}`;
            w3 = doc.weekRanges?.[3] || "Select Days";
            w4 = doc.weekRanges?.[4] || "Select Days";
          }
          
          targetsMap[store] = {
            1: doc.weeklyTargets?.[1] || 0,
            2: doc.weeklyTargets?.[2] || 0,
            3: doc.weeklyTargets?.[3] || 0,
            4: doc.weeklyTargets?.[4] || 0,
          };
          
          rangesMap[store] = {
            1: doc.weekRanges?.[1] || "Select Days",
            2: doc.weekRanges?.[2] || "Select Days",
            3: doc.weekRanges?.[3] || "Select Days",
            4: doc.weekRanges?.[4] || "Select Days",
          };
        });
        
        setWeeklyTargets(targetsMap);
        setStoreWeekRanges(rangesMap);
        setWeek1Dates(w1);
        setWeek2Dates(w2);
        setWeek3Dates(w3);
        setWeek4Dates(w4);
      }
    } catch (err) {
      console.error("Error fetching store targets from MongoDB:", err);
    }
  };

  const saveStoreTargetToDb = async (storeName, updatedTargets, updatedRanges, month = CURRENT_MONTH_LONG, year = CURRENT_YEAR) => {
    try {
      const token = localStorage.getItem("token");
      const targetObj = updatedTargets[storeName] || {};
      const rangeObj = updatedRanges[storeName] || {};
      
      const payload = {
        storeName,
        month,
        year: Number(year),
        weekRanges: {
          1: rangeObj[1] || "Select Days",
          2: rangeObj[2] || "Select Days",
          3: rangeObj[3] || "Select Days",
          4: rangeObj[4] || "Select Days"
        },
        weeklyTargets: {
          1: targetObj[1] || 0,
          2: targetObj[2] || 0,
          3: targetObj[3] || 0,
          4: targetObj[4] || 0
        }
      };
      
      await fetch(`${baseUrl.baseUrl}api/store-targets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
    } catch (err) {
      console.error(`Error saving targets for store ${storeName} to MongoDB:`, err);
    }
  };

  // Dynamic branches state
  const [branches, setBranches] = useState([]);
  const [loadingBranches, setLoadingBranches] = useState(true);
  const [walkins, setWalkins] = useState([]);
  const [loadingWalkins, setLoadingWalkins] = useState(false);
  const [performanceData, setPerformanceData] = useState({ ftd: {}, period: {} });
  const [loadingPerformance, setLoadingPerformance] = useState(false);
  const [salesData, setSalesData] = useState({ ftd: {}, period: {} });
  const [loadingSales, setLoadingSales] = useState(false);

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
        console.error("Error fetching branches for DSR Report:", err);
      } finally {
        setLoadingBranches(false);
      }
    };
    fetchBranches();
  }, []);

  // Fetch targets dynamically when not editing targets in modals
  useEffect(() => {
    if (!assignTargetModalOpen && !configWeeksModalOpen) {
      const targetMonth = activeTab === "Custom" ? getMonthNameFromDateStr(customStartDate) : CURRENT_MONTH_LONG;
      const targetYear = activeTab === "Custom" ? getYearFromDateStr(customStartDate) : CURRENT_YEAR;
      fetchStoreTargets(targetMonth, targetYear);
    }
  }, [assignTargetModalOpen, configWeeksModalOpen, activeTab, customStartDate]);

  // Fetch targets when assignTargetModalOpen is active and modalMonth changes
  useEffect(() => {
    if (assignTargetModalOpen && modalMonth) {
      fetchStoreTargets(modalMonth, CURRENT_YEAR);
    }
  }, [modalMonth, assignTargetModalOpen]);

  // Fetch targets when configWeeksModalOpen is active and configMonth changes
  useEffect(() => {
    if (configWeeksModalOpen && configMonth) {
      fetchStoreTargets(configMonth, CURRENT_YEAR);
    }
  }, [configMonth, configWeeksModalOpen]);

  // Fetch walkins dynamically based on timeframe range
  useEffect(() => {
    const fetchWalkins = async () => {
      setLoadingWalkins(true);
      try {
        const token = localStorage.getItem("token");
        const todayStr = getLocalDateString(new Date());
        
        let periodStart = todayStr;
        let periodEnd = todayStr;
        if (activeTab === "WTD") {
          const today = new Date();
          periodStart = getLocalDateString(new Date(today.getFullYear(), today.getMonth(), 1));
          periodEnd = todayStr;
        } else if (activeTab === "MTD") {
          const today = new Date();
          periodStart = getLocalDateString(new Date(today.getFullYear(), today.getMonth(), 1));
          periodEnd = todayStr;
        } else if (activeTab === "Custom") {
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
      } catch (err) {
        console.error("Error fetching walkins for DSR:", err);
      } finally {
        setLoadingWalkins(false);
      }
    };

    fetchWalkins();
  }, [activeTab, customStartDate, customEndDate]);

  // Fetch staff performance dynamically based on timeframe range
  useEffect(() => {
    const fetchPerformance = async () => {
      setLoadingPerformance(true);
      try {
        const todayStr = getLocalDateString(new Date());
        
        let periodStart = todayStr;
        let periodEnd = todayStr;
        if (activeTab === "WTD") {
          // Fallback global range used only for default values
          const wtdRange = getStoreWTDDateRange("All");
          periodStart = wtdRange.start;
          periodEnd = wtdRange.end;
        } else if (activeTab === "MTD") {
          const today = new Date();
          periodStart = getLocalDateString(new Date(today.getFullYear(), today.getMonth(), 1));
          periodEnd = todayStr;
        } else if (activeTab === "Custom") {
          periodStart = customStartDate || todayStr;
          periodEnd = customEndDate || todayStr;
        }

        const locationIds = ["1", "3", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "23", "25"];

        const getStoreNameFromLocId = (locId) => {
          const branchKey = Object.keys(BRANCH_LOCATION_MAPPING).find(key => BRANCH_LOCATION_MAPPING[key] === locId);
          if (!branchKey) return "All";
          return displayBranchName(branchKey);
        };

        // Parallel fetch for FTD (For The Day - today) with concurrency limit
        const ftdTasks = locationIds.map((locId) => async () => {
          const data = await getPerformanceCached(locId, todayStr, todayStr);
          return { locId, data };
        });

        // Parallel fetch for Period (WTD, MTD, Custom) with concurrency limit
        const periodTasks = locationIds.map((locId) => async () => {
          let storePeriodStart = periodStart;
          let storePeriodEnd = periodEnd;
          if (activeTab === "WTD") {
            const storeName = getStoreNameFromLocId(locId);
            const wtdRange = getStoreWTDDateRange(storeName);
            storePeriodStart = wtdRange.start;
            storePeriodEnd = wtdRange.end;
          }

          const data = await getPerformanceCached(locId, storePeriodStart, storePeriodEnd);
          return { locId, data };
        });

        const ftdResults = await runWithConcurrencyLimit(ftdTasks, 4);
        const periodResults = await runWithConcurrencyLimit(periodTasks, 4);

        const ftdMap = {};
        const periodMap = {};

        ftdResults.forEach(r => {
          ftdMap[r.locId] = r.data;
        });
        periodResults.forEach(r => {
          periodMap[r.locId] = r.data;
        });

        setPerformanceData({ ftd: ftdMap, period: periodMap });
      } catch (err) {
        console.error("Error fetching performance reports:", err);
      } finally {
        setLoadingPerformance(false);
      }
    };

    fetchPerformance();
  }, [activeTab, customStartDate, customEndDate]);

  // Fetch Shoe Sales Bookings & Returns dynamically based on timeframe range
  useEffect(() => {
    const fetchSales = async () => {
      setLoadingSales(true);
      try {
        const todayStr = getLocalDateString(new Date());
        
        let periodStart = todayStr;
        let periodEnd = todayStr;
        if (activeTab === "WTD") {
          const wtdRange = getStoreWTDDateRange("All");
          periodStart = wtdRange.start;
          periodEnd = wtdRange.end;
        } else if (activeTab === "MTD") {
          const today = new Date();
          periodStart = getLocalDateString(new Date(today.getFullYear(), today.getMonth(), 1));
          periodEnd = todayStr;
        } else if (activeTab === "Custom") {
          periodStart = customStartDate || todayStr;
          periodEnd = customEndDate || todayStr;
        }

        const activeList = branches.length > 0
          ? branches.map((b) => ({ name: displayBranchName(b.workingBranch), workingBranch: b.workingBranch, locCode: b.locCode }))
          : [
              { name: "G Thrissur", workingBranch: "G.Thrissur", locCode: "704" },
              { name: "SG Edappally", workingBranch: "G-Edappally", locCode: "702" },
              { name: "Z Edappally", workingBranch: "Z-Edapally1", locCode: "144" },
              { name: "G Edappally", workingBranch: "G-Edappally", locCode: "702" },
              { name: "Z Edappal", workingBranch: "Z- Edappal", locCode: "100" },
              { name: "Z Perinthalmanna", workingBranch: "Z.Perinthalmanna", locCode: "133" },
              { name: "Z Kottakkal", workingBranch: "Z.Kottakkal", locCode: "122" },
              { name: "G Kottayam", workingBranch: "G.Kottayam", locCode: "701" },
              { name: "G Perumbavoor", workingBranch: "G.Perumbavoor", locCode: "703" }
            ];

        const fetchSalesForBranchRange = async (locCode, fromDate, toDate) => {
          if (!locCode) return { value: 0, qty: 0, bills: 0 };
          try {
            const bookingsUrl = `https://backend.brynex.com/api/external/shoe-sales/bookings?fromDate=${fromDate}&toDate=${toDate}&locCode=${locCode}`;
            const returnsUrl = `https://backend.brynex.com/api/external/shoe-sales/returns?fromDate=${fromDate}&toDate=${toDate}&locCode=${locCode}`;
            
            const [bRes, rRes] = await Promise.all([
              fetch(bookingsUrl).then(r => r.ok ? r.json() : []),
              fetch(returnsUrl).then(r => r.ok ? r.json() : [])
            ]);

            const bookings = Array.isArray(bRes) ? bRes : [];
            const returns = Array.isArray(rRes) ? rRes : [];

            const value = bookings.reduce((sum, b) => sum + (b.value || 0), 0) + returns.reduce((sum, r) => sum + (r.value || 0), 0);
            const qty = bookings.reduce((sum, b) => sum + (b.quantity || 0), 0) - returns.reduce((sum, r) => sum + Math.abs(r.quantity || 0), 0);
            const bills = bookings.length - returns.length;

            return { value, qty, bills };
          } catch (err) {
            console.error(`Error fetching shoe sales for branch ${locCode}:`, err);
            return { value: 0, qty: 0, bills: 0 };
          }
        };

        const ftdTasks = activeList.map((item) => async () => {
          const locCode = item.locCode || getBranchLocCode(item.workingBranch, branches);
          const data = await fetchSalesForBranchRange(locCode, todayStr, todayStr);
          return { workingBranch: item.workingBranch, locCode, data };
        });

        const periodTasks = activeList.map((item) => async () => {
          const locCode = item.locCode || getBranchLocCode(item.workingBranch, branches);
          
          let storePeriodStart = periodStart;
          let storePeriodEnd = periodEnd;
          if (activeTab === "WTD") {
            const wtdRange = getStoreWTDDateRange(item.name);
            storePeriodStart = wtdRange.start;
            storePeriodEnd = wtdRange.end;
          }

          const data = await fetchSalesForBranchRange(locCode, storePeriodStart, storePeriodEnd);
          return { workingBranch: item.workingBranch, locCode, data };
        });

        const ftdResults = await runWithConcurrencyLimit(ftdTasks, 5);
        const periodResults = await runWithConcurrencyLimit(periodTasks, 5);

        const ftdMap = {};
        const periodMap = {};

        ftdResults.forEach((r) => {
          if (r.locCode) {
            ftdMap[r.locCode] = r.data;
          }
          const keyName = normalizeForMatch(r.workingBranch);
          if (keyName) {
            ftdMap[keyName] = r.data;
          }
        });

        periodResults.forEach((r) => {
          if (r.locCode) {
            periodMap[r.locCode] = r.data;
          }
          const keyName = normalizeForMatch(r.workingBranch);
          if (keyName) {
            periodMap[keyName] = r.data;
          }
        });

        setSalesData({ ftd: ftdMap, period: periodMap });
      } catch (err) {
        console.error("Error in fetchSales:", err);
      } finally {
        setLoadingSales(false);
      }
    };

    fetchSales();
  }, [activeTab, customStartDate, customEndDate, branches]);


  useEffect(() => {
    localStorage.setItem("week1Dates", week1Dates);
  }, [week1Dates]);

  useEffect(() => {
    localStorage.setItem("week2Dates", week2Dates);
  }, [week2Dates]);

  useEffect(() => {
    localStorage.setItem("week3Dates", week3Dates);
  }, [week3Dates]);

  useEffect(() => {
    localStorage.setItem("week4Dates", week4Dates);
  }, [week4Dates]);

  const getMTDDateRangeString = () => {
    const today = new Date();
    const monthName = today.toLocaleString("en-US", { month: "long" });
    const day = String(today.getDate()).padStart(2, "0");
    const year = today.getFullYear();
    return `${monthName} 01-${day}, ${year}`;
  };

  const getStoreWTDDateRange = (storeName = "All") => {
    const today = new Date();
    const todayStr = getLocalDateString(today);
    const todayDateNum = today.getDate();
    
    const activeWeekId = getCurrentWeekId(storeName);
    
    let w1 = week1Dates, w2 = week2Dates, w3 = week3Dates, w4 = week4Dates;
    if (storeName !== "All" && storeWeekRanges[storeName]) {
      const sr = storeWeekRanges[storeName];
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

  const getWTDDateRangeString = () => {
    const today = new Date();
    const wtdRange = getStoreWTDDateRange(selectedStore);
    const startDate = new Date(wtdRange.start);
    
    const startMonth = startDate.toLocaleString("en-US", { month: "long" });
    const startDay = String(startDate.getDate()).padStart(2, "0");
    
    const endMonth = today.toLocaleString("en-US", { month: "long" });
    const endDay = String(today.getDate()).padStart(2, "0");
    const year = today.getFullYear();
    
    if (startMonth === endMonth) {
      return `${startMonth} ${startDay}-${endDay}, ${year}`;
    } else {
      return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${year}`;
    }
  };

  // Format values to match Indian standard layout (e.g. 22,20,000)
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

  const renderCellVal = (val, isPercent = false) => {
    const rawVal = String(val);
    const numVal = parseFloat(rawVal.replace(/,/g, ""));
    const isZero = rawVal === "0" || rawVal === "0.0" || rawVal === "0%" || rawVal === "";
    const isNegative = !isNaN(numVal) && numVal < 0;
    const colorClass = isNegative ? "text-[#e05a47] font-bold" : isZero ? "text-[#e05a47] font-bold" : "";
    return (
      <span className={colorClass}>
        {val}{isPercent && "%"}
      </span>
    );
  };

  // Generate dynamic DSR data based on fetched branches (No mock fallbacks!)
  const dsrData = useMemo(() => {
    let customFactor = 1.0;
    if (activeTab === "Custom") {
      const start = new Date(customStartDate);
      const end = new Date(customEndDate);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      customFactor = isNaN(diffDays) ? 1.0 : diffDays / 30.0;
    }

    const list = branches.map((b, index) => {
      const sl = String(index + 1).padStart(2, "0");
      const name = displayBranchName(b.workingBranch);
      const locId = getBranchLocationId(b.workingBranch);
      
      const defaultTarget = 0;
      const target = getStoreTarget(name, defaultTarget, activeTab, customFactor);
      
      const locPeriodList = performanceData.period[locId] || [];
      const dapprPeriodList = performanceData.period["25"] || [];
      const dapprPeriodForStore = getDapprSquadDataForStore(locId, dapprPeriodList);
      const mergedPeriodList = [...locPeriodList, ...dapprPeriodForStore];
      const achieved = mergedPeriodList.reduce((sum, item) => sum + (item.totalValue || 0), 0);

      const balance = target - achieved;
      const pct = target > 0 ? Math.min(Math.round((achieved / target) * 100), 100) : 0;
      return { sl, name, target, achieved, balance, pct };
    });
    return list;
  }, [branches, weeklyTargets, activeTab, customStartDate, customEndDate, performanceData]);

  // Generate dynamic Sales Funnel data based on fetched branches (with mock fallback)
  const funnelRows = useMemo(() => {
    const todayStr = getLocalDateString(new Date());
    
    // Calculate active period start and end date
    let periodStart = todayStr;
    let periodEnd = todayStr;
    if (activeTab === "WTD") {
      const wtdRange = getStoreWTDDateRange("All");
      periodStart = wtdRange.start;
      periodEnd = wtdRange.end;
    } else if (activeTab === "MTD") {
      const today = new Date();
      periodStart = getLocalDateString(new Date(today.getFullYear(), today.getMonth(), 1));
      periodEnd = todayStr;
    } else if (activeTab === "Custom") {
      periodStart = customStartDate || todayStr;
      periodEnd = customEndDate || todayStr;
    }

    const getWalkinDateString = (w) => {
      if (!w.date || w.date === '-') return '';
      return w.date.split(' ')[0];
    };

    const isLoss = (w) => {
      const s = String(w.status || '').toLowerCase();
      const rentalS = String(w.rentalStatus || '').toLowerCase();
      const shoeS = String(w.shoeStatus || '').toLowerCase();
      return s === 'loss' || s === 'revisit loss' || s === 'lost' ||
             rentalS === 'loss' || rentalS === 'revisit loss' || rentalS === 'lost' ||
             shoeS === 'loss' || shoeS === 'revisit loss' || shoeS === 'lost';
    };

    const isFtdEmpty = Object.keys(performanceData.ftd).length === 0;
    const isPeriodEmpty = Object.keys(performanceData.period).length === 0;
    const useMock = isFtdEmpty && isPeriodEmpty;

    // Helper to calculate derived metrics for a row
    // valFtd/valWtd = total_Number_Of_Bill (bill count)
    // billFtd/billWtd = totalValue (sale value / money)
    // qtyFtd/qtyWtd = totalQuantity
    const withDerivedMetrics = (row) => {
      // ABV = Total Value / Total Bills
      const abvFtd = row.valFtd > 0 ? Math.round(row.billFtd / row.valFtd) : 0;
      const abvWtd = row.valWtd > 0 ? Math.round(row.billWtd / row.valWtd) : 0;
      // ABS = Total Quantity / Total Bills
      const absFtd = row.valFtd > 0 ? parseFloat((row.qtyFtd / row.valFtd).toFixed(1)) : 0;
      const absWtd = row.valWtd > 0 ? parseFloat((row.qtyWtd / row.valWtd).toFixed(1)) : 0;
      // Conversion = Total Bills / Walk-ins
      const convFtd = row.walkFtd > 0 ? Math.min(100, Math.round((row.valFtd / row.walkFtd) * 100)) : 0;
      const convWtd = row.walkWtd > 0 ? Math.min(100, Math.round((row.valWtd / row.walkWtd) * 100)) : 0;
      // ARP = Total Value / Total Quantity
      const arpFtd = row.qtyFtd > 0 ? Math.round(row.billFtd / row.qtyFtd) : 0;
      const arpWtd = row.qtyWtd > 0 ? Math.round(row.billWtd / row.qtyWtd) : 0;
      
      return {
        ...row,
        abvFtd,
        abvWtd,
        absFtd,
        absWtd,
        convFtd,
        convWtd,
        arpFtd,
        arpWtd
      };
    };

    // Real API Data calculations (no mock fallback!)
    if (isAdminOrSuperAdmin) {
      if (selectedStore === "All") {
        // Show store-level summary
        return branches.map((b) => {
          const storeName = displayBranchName(b.workingBranch);
          const storeKeyVal = locationKey(b.workingBranch);
          const locId = getBranchLocationId(b.workingBranch);

          const locFtdList = performanceData.ftd[locId] || [];
          const locPeriodList = performanceData.period[locId] || [];

          // Dappr Squad (loc 25) data gets merged INTO corresponding stores.
          // When processing the Dappr Squad branch itself, use empty lists (data redistributed).
          // For all other stores, merge in any matching Dappr Squad entries.
          const isDapprSquadBranch = locId === "25";
          const dapprFtdList = isDapprSquadBranch ? [] : (performanceData.ftd["25"] || []);
          const dapprPeriodList = isDapprSquadBranch ? [] : (performanceData.period["25"] || []);
          const dapprFtdForStore = getDapprSquadDataForStore(locId, dapprFtdList);
          const dapprPeriodForStore = getDapprSquadDataForStore(locId, dapprPeriodList);
          const mergedFtdList = isDapprSquadBranch ? [] : [...locFtdList, ...dapprFtdForStore];
          const mergedPeriodList = isDapprSquadBranch ? [] : [...locPeriodList, ...dapprPeriodForStore];

          // Walkin/Loss calculations
          let storePeriodStart = todayStr;
          let storePeriodEnd = todayStr;
          if (activeTab === "WTD") {
            const wtdRange = getStoreWTDDateRange(storeName);
            storePeriodStart = wtdRange.start;
            storePeriodEnd = wtdRange.end;
          } else if (activeTab === "MTD") {
            const today = new Date();
            storePeriodStart = getLocalDateString(new Date(today.getFullYear(), today.getMonth(), 1));
            storePeriodEnd = todayStr;
          } else if (activeTab === "Custom") {
            storePeriodStart = customStartDate || todayStr;
            storePeriodEnd = customEndDate || todayStr;
          }

          const storeWalkins = walkins.filter(w => locationKey(w.store) === storeKeyVal);
          const ftdWalkins = storeWalkins.filter(w => getWalkinDateString(w) === todayStr);
          const periodWalkins = storeWalkins.filter(w => {
            const d = getWalkinDateString(w);
            return d && d >= storePeriodStart && d <= storePeriodEnd;
          });

          // Performance API aggregations (includes Dappr Squad data merged in)
          // Note: totalValue mapped to bill, total_Number_Of_Bill mapped to val, totalQuantity mapped to qty
          const billFtd = mergedFtdList.reduce((sum, item) => sum + (item.totalValue || 0), 0);
          const billWtd = mergedPeriodList.reduce((sum, item) => sum + (item.totalValue || 0), 0);
          const valFtd = mergedFtdList.reduce((sum, item) => sum + (item.total_Number_Of_Bill || 0), 0);
          const valWtd = mergedPeriodList.reduce((sum, item) => sum + (item.total_Number_Of_Bill || 0), 0);
          const qtyFtd = mergedFtdList.reduce((sum, item) => sum + (item.totalQuantity || 0), 0);
          const qtyWtd = mergedPeriodList.reduce((sum, item) => sum + (item.totalQuantity || 0), 0);

          const createdValFtd = mergedFtdList.reduce((sum, item) => sum + (item.created_Number_Of_Bill || 0), 0);
          const createdValWtd = mergedPeriodList.reduce((sum, item) => sum + (item.created_Number_Of_Bill || 0), 0);
          const createdQtyFtd = mergedFtdList.reduce((sum, item) => sum + (item.createdQuantity || 0), 0);
          const createdQtyWtd = mergedPeriodList.reduce((sum, item) => sum + (item.createdQuantity || 0), 0);

          const walkFtd = ftdWalkins.length;
          const walkWtd = periodWalkins.length;
          const lossFtd = Math.max(0, walkFtd - valFtd);
          const lossWtd = Math.max(0, walkWtd - valWtd);

          return withDerivedMetrics({
            name: storeName,
            storeName,
            billFtd,
            billWtd,
            valFtd,
            valWtd,
            qtyFtd,
            qtyWtd,
            createdValFtd,
            createdValWtd,
            createdQtyFtd,
            createdQtyWtd,
            walkFtd,
            walkWtd,
            lossFtd,
            lossWtd
          });
        });
      } else {
        // Drill-down view: Show individual staff members of the selected store
        const selectedBranch = branches.find(b => displayBranchName(b.workingBranch) === selectedStore);
        if (!selectedBranch) return [];

        const storeName = displayBranchName(selectedBranch.workingBranch);
        const storeKeyVal = locationKey(selectedBranch.workingBranch);
        const locId = getBranchLocationId(selectedBranch.workingBranch);

        const locFtdList = performanceData.ftd[locId] || [];
        const locPeriodList = performanceData.period[locId] || [];

        // Unique staff names
        const staffNames = Array.from(new Set([
          ...locFtdList.map(x => x.bookingBy),
          ...locPeriodList.map(x => x.bookingBy)
        ])).filter(Boolean);

        return staffNames.map(staffName => {
          const staffFtd = locFtdList.find(x => x.bookingBy === staffName) || {};
          const staffPeriod = locPeriodList.find(x => x.bookingBy === staffName) || {};

          // Walk-ins filtered by staff name
          let storePeriodStart = todayStr;
          let storePeriodEnd = todayStr;
          if (activeTab === "WTD") {
            const wtdRange = getStoreWTDDateRange(storeName);
            storePeriodStart = wtdRange.start;
            storePeriodEnd = wtdRange.end;
          } else if (activeTab === "MTD") {
            const today = new Date();
            storePeriodStart = getLocalDateString(new Date(today.getFullYear(), today.getMonth(), 1));
            storePeriodEnd = todayStr;
          } else if (activeTab === "Custom") {
            storePeriodStart = customStartDate || todayStr;
            storePeriodEnd = customEndDate || todayStr;
          }

          const staffWalkins = walkins.filter(w => 
            locationKey(w.store) === storeKeyVal && 
            w.staff && w.staff.trim().toLowerCase() === staffName.trim().toLowerCase()
          );
          const ftdWalkins = staffWalkins.filter(w => getWalkinDateString(w) === todayStr);
          const periodWalkins = staffWalkins.filter(w => {
            const d = getWalkinDateString(w);
            return d && d >= storePeriodStart && d <= storePeriodEnd;
          });

          const billFtd = staffFtd.totalValue || 0;
          const billWtd = staffPeriod.totalValue || 0;
          const valFtd = staffFtd.total_Number_Of_Bill || 0;
          const valWtd = staffPeriod.total_Number_Of_Bill || 0;
          const qtyFtd = staffFtd.totalQuantity || 0;
          const qtyWtd = staffPeriod.totalQuantity || 0;

          const createdValFtd = staffFtd.created_Number_Of_Bill || 0;
          const createdValWtd = staffPeriod.created_Number_Of_Bill || 0;
          const createdQtyFtd = staffFtd.createdQuantity || 0;
          const createdQtyWtd = staffPeriod.createdQuantity || 0;

          const walkFtd = ftdWalkins.length;
          const walkWtd = periodWalkins.length;
          const lossFtd = Math.max(0, walkFtd - valFtd);
          const lossWtd = Math.max(0, walkWtd - valWtd);

          return withDerivedMetrics({
            name: staffName,
            storeName,
            billFtd,
            billWtd,
            valFtd,
            valWtd,
            qtyFtd,
            qtyWtd,
            createdValFtd,
            createdValWtd,
            createdQtyFtd,
            createdQtyWtd,
            walkFtd,
            walkWtd,
            lossFtd,
            lossWtd
          });
        });
      }
    } else {
      // Non-admin view: Show individual staff members for all accessible branches
      const allRows = [];
      branches.forEach((b) => {
        const storeName = displayBranchName(b.workingBranch);
        const storeKeyVal = locationKey(b.workingBranch);
        const locId = getBranchLocationId(b.workingBranch);

        const locFtdList = performanceData.ftd[locId] || [];
        const locPeriodList = performanceData.period[locId] || [];

        const staffNames = Array.from(new Set([
          ...locFtdList.map(x => x.bookingBy),
          ...locPeriodList.map(x => x.bookingBy)
        ])).filter(Boolean);

        staffNames.forEach(staffName => {
          const staffFtd = locFtdList.find(x => x.bookingBy === staffName) || {};
          const staffPeriod = locPeriodList.find(x => x.bookingBy === staffName) || {};

          // Walk-ins filtered by staff name
          let storePeriodStart = todayStr;
          let storePeriodEnd = todayStr;
          if (activeTab === "WTD") {
            const wtdRange = getStoreWTDDateRange(storeName);
            storePeriodStart = wtdRange.start;
            storePeriodEnd = wtdRange.end;
          } else if (activeTab === "MTD") {
            const today = new Date();
            storePeriodStart = getLocalDateString(new Date(today.getFullYear(), today.getMonth(), 1));
            storePeriodEnd = todayStr;
          } else if (activeTab === "Custom") {
            storePeriodStart = customStartDate || todayStr;
            storePeriodEnd = customEndDate || todayStr;
          }

          const staffWalkins = walkins.filter(w => 
            locationKey(w.store) === storeKeyVal && 
            w.staff && w.staff.trim().toLowerCase() === staffName.trim().toLowerCase()
          );
          const ftdWalkins = staffWalkins.filter(w => getWalkinDateString(w) === todayStr);
          const periodWalkins = staffWalkins.filter(w => {
            const d = getWalkinDateString(w);
            return d && d >= storePeriodStart && d <= storePeriodEnd;
          });

          const billFtd = staffFtd.totalValue || 0;
          const billWtd = staffPeriod.totalValue || 0;
          const valFtd = staffFtd.total_Number_Of_Bill || 0;
          const valWtd = staffPeriod.total_Number_Of_Bill || 0;
          const qtyFtd = staffFtd.totalQuantity || 0;
          const qtyWtd = staffPeriod.totalQuantity || 0;

          const createdValFtd = staffFtd.created_Number_Of_Bill || 0;
          const createdValWtd = staffPeriod.created_Number_Of_Bill || 0;
          const createdQtyFtd = staffFtd.createdQuantity || 0;
          const createdQtyWtd = staffPeriod.createdQuantity || 0;

          const walkFtd = ftdWalkins.length;
          const walkWtd = periodWalkins.length;
          const lossFtd = Math.max(0, walkFtd - valFtd);
          const lossWtd = Math.max(0, walkWtd - valWtd);

          allRows.push(withDerivedMetrics({
            name: staffName,
            storeName,
            billFtd,
            billWtd,
            valFtd,
            valWtd,
            qtyFtd,
            qtyWtd,
            createdValFtd,
            createdValWtd,
            createdQtyFtd,
            createdQtyWtd,
            walkFtd,
            walkWtd,
            lossFtd,
            lossWtd
          }));
        });
      });
      return allRows;
    }
  }, [branches, isAdminOrSuperAdmin, walkins, performanceData, selectedStore, activeTab, customStartDate, customEndDate]);

  // Populate dynamic store options for dropdown
  const storeOptions = useMemo(() => {
    const names = dsrData.map((d) => d.name);
    return ["All", ...Array.from(new Set(names))];
  }, [dsrData]);

  // Filter functions
  const filteredData = useMemo(() => {
    return dsrData.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStore = selectedStore === "All" || item.name === selectedStore;
      return matchesSearch && matchesStore;
    });
  }, [dsrData, searchQuery, selectedStore]);

  const filteredFunnelRows = useMemo(() => {
    return funnelRows.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStore = selectedStore === "All" || item.storeName === selectedStore || (item.storeName === undefined && selectedStore === "G Thrissur");
      return matchesSearch && matchesStore;
    });
  }, [funnelRows, searchQuery, selectedStore]);

  // Dynamic calculations for Revenue Vs Target metrics cards
  const overallTarget = useMemo(() => {
    return filteredData.reduce((acc, row) => acc + row.target, 0);
  }, [filteredData]);

  const overallAchieved = useMemo(() => {
    return filteredData.reduce((acc, row) => acc + row.achieved, 0);
  }, [filteredData]);

  const overallBalance = useMemo(() => {
    return overallTarget - overallAchieved;
  }, [overallTarget, overallAchieved]);

  const overallPct = useMemo(() => {
    if (overallTarget <= 0) return "0.0";
    const rawPct = (overallAchieved / overallTarget) * 100;
    return Math.min(rawPct, 100).toFixed(1);
  }, [overallTarget, overallAchieved]);

  // Dynamic calculations for Sales Funnel totals row
  const totalBillFtd = useMemo(() => filteredFunnelRows.reduce((acc, row) => acc + row.billFtd, 0), [filteredFunnelRows]);
  const totalBillWtd = useMemo(() => filteredFunnelRows.reduce((acc, row) => acc + row.billWtd, 0), [filteredFunnelRows]);
  const totalValFtd = useMemo(() => filteredFunnelRows.reduce((acc, row) => acc + (row.valFtd || 0), 0), [filteredFunnelRows]);
  const totalValWtd = useMemo(() => filteredFunnelRows.reduce((acc, row) => acc + (row.valWtd || 0), 0), [filteredFunnelRows]);
  const totalQtyFtd = useMemo(() => filteredFunnelRows.reduce((acc, row) => acc + (row.qtyFtd || 0), 0), [filteredFunnelRows]);
  const totalQtyWtd = useMemo(() => filteredFunnelRows.reduce((acc, row) => acc + (row.qtyWtd || 0), 0), [filteredFunnelRows]);
  const totalWalkFtd = useMemo(() => filteredFunnelRows.reduce((acc, row) => acc + row.walkFtd, 0), [filteredFunnelRows]);
  const totalWalkWtd = useMemo(() => filteredFunnelRows.reduce((acc, row) => acc + row.walkWtd, 0), [filteredFunnelRows]);
  const totalLossFtd = useMemo(() => filteredFunnelRows.reduce((acc, row) => acc + row.lossFtd, 0), [filteredFunnelRows]);
  const totalLossWtd = useMemo(() => filteredFunnelRows.reduce((acc, row) => acc + row.lossWtd, 0), [filteredFunnelRows]);

  const totalAbvFtd = useMemo(() => (totalValFtd > 0 ? Math.round(totalBillFtd / totalValFtd) : 0), [totalBillFtd, totalValFtd]);
  const totalAbvWtd = useMemo(() => (totalValWtd > 0 ? Math.round(totalBillWtd / totalValWtd) : 0), [totalBillWtd, totalValWtd]);

  const totalAbsFtd = useMemo(() => (totalValFtd > 0 ? (totalQtyFtd / totalValFtd).toFixed(1) : "0.0"), [totalQtyFtd, totalValFtd]);
  const totalAbsWtd = useMemo(() => (totalValWtd > 0 ? (totalQtyWtd / totalValWtd).toFixed(1) : "0.0"), [totalQtyWtd, totalValWtd]);

  const totalConvFtd = useMemo(() => (totalWalkFtd > 0 ? Math.min(100, Math.round((totalValFtd / totalWalkFtd) * 100)) : 0), [totalValFtd, totalWalkFtd]);
  const totalConvWtd = useMemo(() => (totalWalkWtd > 0 ? Math.min(100, Math.round((totalValWtd / totalWalkWtd) * 100)) : 0), [totalValWtd, totalWalkWtd]);

  const totalArpFtd = useMemo(() => (totalQtyFtd > 0 ? Math.round(totalBillFtd / totalQtyFtd) : 0), [totalBillFtd, totalQtyFtd]);
  const totalArpWtd = useMemo(() => (totalQtyWtd > 0 ? Math.round(totalBillWtd / totalQtyWtd) : 0), [totalBillWtd, totalQtyWtd]);

  // Generate dynamic Category Contribution data based on fetched branches (with mock fallback)
  const categoryRows = useMemo(() => {
    const defaultStores = [
      { name: "G Thrissur", workingBranch: "G.Thrissur" },
      { name: "SG Edappally", workingBranch: "G-Edappally" },
      { name: "Z Edappally", workingBranch: "Z-Edapally1" },
      { name: "G Edappally", workingBranch: "G-Edappally" },
      { name: "Z Edappal", workingBranch: "Z- Edappal" },
      { name: "Z Perinthalmanna", workingBranch: "Z.Perinthalmanna" },
      { name: "Z Kottakkal", workingBranch: "Z.Kottakkal" },
      { name: "G Kottayam", workingBranch: "G.Kottayam" },
      { name: "G Perumbavoor", workingBranch: "G.Perumbavoor" }
    ];

    const activeList = branches.length > 0
      ? branches.map((b) => ({ name: displayBranchName(b.workingBranch), workingBranch: b.workingBranch, locCode: b.locCode }))
      : defaultStores.map(ds => ({ ...ds, locCode: getBranchLocCode(ds.workingBranch, branches) }));

    return activeList.map((item, index) => {
      const name = item.name;
      const workingBranch = item.workingBranch;

      // Real API data (NO MOCK DATA!)
      const locId = getBranchLocationId(workingBranch);
      const storeKeyVal = normalizeForMatch(workingBranch);
      const locCode = item.locCode || getBranchLocCode(workingBranch, branches);

      // Rental Products (Live API for locId)
      const locFtdList = performanceData.ftd[locId] || [];
      const locPeriodList = performanceData.period[locId] || [];

      const rentalValFtd = locFtdList.reduce((sum, x) => sum + (x.totalValue || 0), 0);
      const rentalValWtd = locPeriodList.reduce((sum, x) => sum + (x.totalValue || 0), 0);
      const rentalBillFtd = locFtdList.reduce((sum, x) => sum + (x.total_Number_Of_Bill || 0), 0);
      const rentalBillWtd = locPeriodList.reduce((sum, x) => sum + (x.total_Number_Of_Bill || 0), 0);
      const rentalQtyFtd = locFtdList.reduce((sum, x) => sum + (x.totalQuantity || 0), 0);
      const rentalQtyWtd = locPeriodList.reduce((sum, x) => sum + (x.totalQuantity || 0), 0);

      // Dappr Squad (Live API for 25 matching store name)
      const squadFtdList = performanceData.ftd["25"] || [];
      const squadPeriodList = performanceData.period["25"] || [];

      const storeFtdItem = squadFtdList.find(x => normalizeForMatch(x.bookingBy) === storeKeyVal) || {};
      const storePeriodItem = squadPeriodList.find(x => normalizeForMatch(x.bookingBy) === storeKeyVal) || {};

      const squadValFtd = storeFtdItem.totalValue || 0;
      const squadValWtd = storePeriodItem.totalValue || 0;
      const squadBillFtd = storeFtdItem.total_Number_Of_Bill || 0;
      const squadBillWtd = storePeriodItem.total_Number_Of_Bill || 0;
      const squadQtyFtd = storeFtdItem.totalQuantity || 0;
      const squadQtyWtd = storePeriodItem.totalQuantity || 0;

      // Sales Products (Live API)
      const salesFtdItem = salesData.ftd[locCode] || salesData.ftd[storeKeyVal] || { value: 0, qty: 0, bills: 0 };
      const salesPeriodItem = salesData.period[locCode] || salesData.period[storeKeyVal] || { value: 0, qty: 0, bills: 0 };

      const salesValFtd = salesFtdItem.value || 0;
      const salesValWtd = salesPeriodItem.value || 0;
      const salesBillFtd = salesFtdItem.bills || 0;
      const salesBillWtd = salesPeriodItem.bills || 0;
      const salesQtyFtd = salesFtdItem.qty || 0;
      const salesQtyWtd = salesPeriodItem.qty || 0;

      return {
        name,
        rentalValFtd, rentalValWtd, rentalBillFtd, rentalBillWtd, rentalQtyFtd, rentalQtyWtd,
        squadValFtd, squadValWtd, squadBillFtd, squadBillWtd, squadQtyFtd, squadQtyWtd,
        salesValFtd, salesValWtd, salesBillFtd, salesBillWtd, salesQtyFtd, salesQtyWtd
      };
    });
  }, [branches, performanceData, salesData]);

  const filteredCategoryRows = useMemo(() => {
    return categoryRows.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStore = selectedStore === "All" || item.name === selectedStore;
      return matchesSearch && matchesStore;
    });
  }, [categoryRows, searchQuery, selectedStore]);

  // Dynamic calculations for category totals row
  const totalRentalValFtd = useMemo(() => filteredCategoryRows.reduce((acc, row) => acc + row.rentalValFtd, 0), [filteredCategoryRows]);
  const totalRentalValWtd = useMemo(() => filteredCategoryRows.reduce((acc, row) => acc + row.rentalValWtd, 0), [filteredCategoryRows]);
  const totalRentalBillFtd = useMemo(() => filteredCategoryRows.reduce((acc, row) => acc + row.rentalBillFtd, 0), [filteredCategoryRows]);
  const totalRentalBillWtd = useMemo(() => filteredCategoryRows.reduce((acc, row) => acc + row.rentalBillWtd, 0), [filteredCategoryRows]);
  const totalRentalQtyFtd = useMemo(() => filteredCategoryRows.reduce((acc, row) => acc + row.rentalQtyFtd, 0), [filteredCategoryRows]);
  const totalRentalQtyWtd = useMemo(() => filteredCategoryRows.reduce((acc, row) => acc + row.rentalQtyWtd, 0), [filteredCategoryRows]);

  const totalSquadValFtd = useMemo(() => filteredCategoryRows.reduce((acc, row) => acc + row.squadValFtd, 0), [filteredCategoryRows]);
  const totalSquadValWtd = useMemo(() => filteredCategoryRows.reduce((acc, row) => acc + row.squadValWtd, 0), [filteredCategoryRows]);
  const totalSquadBillFtd = useMemo(() => filteredCategoryRows.reduce((acc, row) => acc + row.squadBillFtd, 0), [filteredCategoryRows]);
  const totalSquadBillWtd = useMemo(() => filteredCategoryRows.reduce((acc, row) => acc + row.squadBillWtd, 0), [filteredCategoryRows]);
  const totalSquadQtyFtd = useMemo(() => filteredCategoryRows.reduce((acc, row) => acc + row.squadQtyFtd, 0), [filteredCategoryRows]);
  const totalSquadQtyWtd = useMemo(() => filteredCategoryRows.reduce((acc, row) => acc + row.squadQtyWtd, 0), [filteredCategoryRows]);

  const totalSalesValFtd = useMemo(() => filteredCategoryRows.reduce((acc, row) => acc + row.salesValFtd, 0), [filteredCategoryRows]);
  const totalSalesValWtd = useMemo(() => filteredCategoryRows.reduce((acc, row) => acc + row.salesValWtd, 0), [filteredCategoryRows]);
  const totalSalesBillFtd = useMemo(() => filteredCategoryRows.reduce((acc, row) => acc + row.salesBillFtd, 0), [filteredCategoryRows]);
  const totalSalesBillWtd = useMemo(() => filteredCategoryRows.reduce((acc, row) => acc + row.salesBillWtd, 0), [filteredCategoryRows]);
  const totalSalesQtyFtd = useMemo(() => filteredCategoryRows.reduce((acc, row) => acc + row.salesQtyFtd, 0), [filteredCategoryRows]);
  const totalSalesQtyWtd = useMemo(() => filteredCategoryRows.reduce((acc, row) => acc + row.salesQtyWtd, 0), [filteredCategoryRows]);

  const handleExportCSV = () => {
    let csvContent = "";
    let fileName = "";

    if (selectedReport === "Revenue Vs Target") {
      fileName = `Revenue_Vs_Target_${activeTab}_${CURRENT_YEAR}.csv`;
      const headers = ["Sl No", "Store Name", "Target (INR)", "Achieved (INR)", "Balance (INR)", "Achieved (%)"];
      const rows = filteredData.map((row) => [
        row.sl,
        row.name,
        row.target,
        row.achieved,
        row.balance,
        `${row.pct}%`
      ]);
      rows.push([
        "Total",
        "ALL STORES",
        overallTarget,
        overallAchieved,
        overallBalance,
        `${overallPct}%`
      ]);
      
      csvContent = [headers, ...rows].map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(",")).join("\n");

    } else if (selectedReport === "Sales Funnel") {
      fileName = `Sales_Funnel_${activeTab}_${CURRENT_YEAR}.csv`;
      const headers = [
        isAdminOrSuperAdmin ? "Store Name" : "Staff Name",
        "Bill (FTD)", `Bill (${activeTab})`,
        "Value (FTD)", `Value (${activeTab})`,
        "Qty (FTD)", `Qty (${activeTab})`,
        "Walk-In (FTD)", `Walk-In (${activeTab})`,
        "Loss (FTD)", `Loss (${activeTab})`,
        "ABV (FTD)", `ABV (${activeTab})`,
        "ABS (FTD)", `ABS (${activeTab})`,
        "Conv % (FTD)", `Conv % (${activeTab})`,
        "ARP (FTD)", `ARP (${activeTab})`
      ];
      const rows = filteredFunnelRows.map((row) => [
        row.name,
        row.valFtd, row.valWtd,
        row.billFtd, row.billWtd,
        row.qtyFtd, row.qtyWtd,
        row.walkFtd, row.walkWtd,
        row.lossFtd, row.lossWtd,
        row.abvFtd, row.abvWtd,
        row.absFtd, row.absWtd,
        `${row.convFtd}%`, `${row.convWtd}%`,
        row.arpFtd, row.arpWtd
      ]);
      rows.push([
        "Total",
        totalValFtd, totalValWtd,
        totalBillFtd, totalBillWtd,
        totalQtyFtd, totalQtyWtd,
        totalWalkFtd, totalWalkWtd,
        totalLossFtd, totalLossWtd,
        totalAbvFtd, totalAbvWtd,
        totalAbsFtd, totalAbsWtd,
        `${totalConvFtd}%`, `${totalConvWtd}%`,
        totalArpFtd, totalArpWtd
      ]);
      
      csvContent = [headers, ...rows].map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(",")).join("\n");

    } else if (selectedReport === "Category Contribution") {
      fileName = `Category_Contribution_${CURRENT_YEAR}.csv`;
      const headers = [
        "Store Name",
        "Rental Products - Value FTD", "Rental Products - Value WTD", "Rental Products - Bill FTD", "Rental Products - Bill WTD", "Rental Products - Qty FTD", "Rental Products - Qty WTD",
        "Dappr Squad - Value FTD", "Dappr Squad - Value WTD", "Dappr Squad - Bill FTD", "Dappr Squad - Bill WTD", "Dappr Squad - Qty FTD", "Dappr Squad - Qty WTD",
        "Sales Products - Value FTD", "Sales Products - Value WTD", "Sales Products - Bill FTD", "Sales Products - Bill WTD", "Sales Products - Qty FTD", "Sales Products - Qty WTD"
      ];
      const rows = filteredCategoryRows.map((row) => [
        row.name,
        row.rentalValFtd, row.rentalValWtd, row.rentalBillFtd, row.rentalBillWtd, row.rentalQtyFtd, row.rentalQtyWtd,
        row.squadValFtd, row.squadValWtd, row.squadBillFtd, row.squadBillWtd, row.squadQtyFtd, row.squadQtyWtd,
        row.salesValFtd, row.salesValWtd, row.salesBillFtd, row.salesBillWtd, row.salesQtyFtd, row.salesQtyWtd
      ]);
      rows.push([
        "Total",
        totalRentalValFtd, totalRentalValWtd, totalRentalBillFtd, totalRentalBillWtd, totalRentalQtyFtd, totalRentalQtyWtd,
        totalSquadValFtd, totalSquadValWtd, totalSquadBillFtd, totalSquadBillWtd, totalSquadQtyFtd, totalSquadQtyWtd,
        totalSalesValFtd, totalSalesValWtd, totalSalesBillFtd, totalSalesBillWtd, totalSalesQtyFtd, totalSalesQtyWtd
      ]);
      
      csvContent = [headers, ...rows].map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(",")).join("\n");
    }

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
            <h1 className="text-[26px] font-bold text-gray-900 leading-tight">DSR Report</h1>
            <p className="text-gray-500 text-[13px] mt-0.5">Real time performance overview across all stores</p>
          </div>

          <div className="flex items-center gap-3">
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
                onClick={() => setActiveTab("Custom")}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === "Custom" 
                    ? "bg-[#18181b] text-white shadow-sm" 
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Custom
              </button>
            </div>

            {activeTab === "Custom" && (
              <div className="flex items-center gap-2 bg-[#f9fafb] border border-gray-200 rounded-xl px-3 py-1.5 shadow-sm">
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

            {/* Configure Weeks Button */}
            <button 
              onClick={() => setConfigWeeksModalOpen(true)}
              className="flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Configure Weeks
            </button>

            {/* Assign Target Button */}
            <button 
              onClick={() => setAssignTargetModalOpen(true)}
              className="flex items-center gap-2 bg-[#18181b] hover:bg-black text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Assign Target
            </button>
          </div>
        </div>

        {/* Filter Bar Row */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          {/* Search bar */}
          <div className="relative w-full lg:max-w-xs text-gray-400">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
              <FiSearch size={16} />
            </span>
            <input 
              type="text" 
              placeholder={selectedReport === "Sales Funnel" ? (isAdminOrSuperAdmin ? "Search by Store name" : "Search by Staff name") : "Search by Store name"}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#eef1f6] border-none rounded-xl pl-10 pr-4 py-2.5 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Custom Store Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setStoreDropdownOpen(!storeDropdownOpen)}
                className="flex items-center gap-1.5 bg-white border border-gray-200/80 rounded-xl px-4 py-2.5 text-xs font-semibold text-gray-500 shadow-sm hover:bg-gray-50 transition-colors focus:outline-none"
              >
                <span>Store :</span>
                <span className="text-gray-950 font-extrabold">{selectedStore}</span>
                <svg className={`w-4 h-4 ml-1 text-gray-400 transition-transform duration-200 ${storeDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Backdrop closer when open */}
              {storeDropdownOpen && (
                <div className="fixed inset-0 z-40" onClick={() => setStoreDropdownOpen(false)} />
              )}

              <div 
                className={`absolute right-0 mt-2 w-48 max-h-60 overflow-y-auto rounded-xl bg-white border border-gray-100 shadow-lg z-50 py-1.5 origin-top-right transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  storeDropdownOpen 
                    ? "opacity-100 scale-100 translate-y-0 pointer-events-auto" 
                    : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
                }`}
              >
                {storeOptions.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => {
                      setSelectedStore(opt);
                      setStoreDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-xs font-bold transition-colors flex items-center justify-between ${
                      selectedStore === opt 
                        ? "bg-gray-50 text-gray-950" 
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-950"
                    }`}
                  >
                    {opt}
                    {selectedStore === opt && (
                      <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Report Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setReportDropdownOpen(!reportDropdownOpen)}
                className="flex items-center gap-1.5 bg-white border border-gray-200/80 rounded-xl px-4 py-2.5 text-xs font-semibold text-gray-500 shadow-sm hover:bg-gray-50 transition-colors focus:outline-none"
              >
                <span>Report :</span>
                <span className="text-gray-950 font-extrabold">{selectedReport}</span>
                <svg className={`w-4 h-4 ml-1 text-gray-400 transition-transform duration-200 ${reportDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Backdrop closer when open */}
              {reportDropdownOpen && (
                <div className="fixed inset-0 z-40" onClick={() => setReportDropdownOpen(false)} />
              )}

              <div 
                className={`absolute right-0 mt-2 w-56 rounded-xl bg-white border border-gray-100 shadow-lg z-50 py-1 origin-top-right transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  reportDropdownOpen 
                    ? "opacity-100 scale-100 translate-y-0 pointer-events-auto" 
                    : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
                }`}
              >
                {["Revenue Vs Target", "Sales Funnel", "Category Contribution"].map((opt) => (
                  <button
                    key={opt}
                    onClick={() => {
                      setSelectedReport(opt);
                      setReportDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-xs font-bold transition-colors flex items-center justify-between ${
                      selectedReport === opt 
                        ? "bg-gray-50 text-gray-950" 
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-950"
                    }`}
                  >
                    {opt}
                    {selectedReport === opt && (
                      <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Export Button */}
            <button 
              onClick={handleExportCSV}
              className="flex items-center gap-2 bg-[#eaecf0] hover:bg-gray-200 text-gray-700 font-bold px-4 py-2.5 rounded-xl text-xs transition-colors shadow-sm cursor-pointer"
            >
              <FiDownload size={14} /> Export
            </button>
          </div>
        </div>

        {/* Dynamic Content Switching based on Report selector */}
        {selectedReport === "Revenue Vs Target" && (
          <div className="bg-white rounded-[20px] shadow-sm border border-gray-100 overflow-hidden">
            
            {/* Card Title Header */}
            <div className="px-6 py-5">
              <h2 className="text-[17px] font-bold text-gray-900">Revenue Vs Target</h2>
              <p className="text-gray-400 text-xs mt-0.5 font-medium font-sans">
                {activeTab === "MTD" 
                  ? getMTDDateRangeString() 
                  : activeTab === "WTD" 
                    ? getWTDDateRangeString() 
                    : getCustomDateRangeString()}
              </p>
            </div>

            {/* Metric Summary Indicators Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 border-t border-b border-gray-100 divide-x divide-gray-100">
              <div className="p-6">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Overall Target</span>
                <h3 className="text-[22px] font-extrabold text-[#00A36C] mt-1">₹{formatIndianNumber(overallTarget)}</h3>
              </div>
              <div className="p-6">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Achieved Target</span>
                <h3 className="text-[22px] font-extrabold text-[#212121] mt-1">₹{formatIndianNumber(overallAchieved)}</h3>
              </div>
              <div className="p-6">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Balance</span>
                <h3 className="text-[22px] font-extrabold text-[#e05a47] mt-1">₹{formatIndianNumber(overallBalance)}</h3>
              </div>
              <div className="p-6">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Achieved %</span>
                <h3 className="text-[22px] font-extrabold text-[#212121] mt-1">{overallPct}%</h3>
              </div>
            </div>

            {/* Data Table */}
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#2e2e2e] text-white text-[11px] font-bold tracking-wider uppercase">
                    <th className="px-6 py-3.5 text-center w-20">Sl No</th>
                    <th className="px-6 py-3.5">Store Name</th>
                    <th className="px-6 py-3.5 text-right">Target (₹)</th>
                    <th className="px-6 py-3.5 text-right">Achieved (₹)</th>
                    <th className="px-6 py-3.5 text-right">Balance (₹)</th>
                    <th className="px-6 py-3.5 text-center">Achieved (%)</th>
                  </tr>
                </thead>
                <tbody className="text-xs text-gray-700 divide-y divide-gray-100">
                  {filteredData.map((row) => {
                    let pctColorClass = "text-gray-900";
                    if (row.pct >= 100) {
                      pctColorClass = "text-[#00A36C] font-semibold";
                    } else if (row.pct <= 93) {
                      pctColorClass = "text-[#e05a47] font-semibold";
                    }

                    let targetColorClass = "text-gray-900";
                    if (row.target === 0) {
                      targetColorClass = "text-[#e05a47] font-semibold";
                    }

                    let achievedColorClass = "text-gray-900";
                    if (row.achieved === 0) {
                      achievedColorClass = "text-[#e05a47]";
                    }

                    let balColorClass = row.balance < 0 ? "text-[#00A36C]" : "text-gray-900";
                    if (row.pct <= 93 || row.balance === 0) {
                      balColorClass = "text-[#e05a47]";
                    }

                    return (
                      <tr key={row.sl} className="odd:bg-white even:bg-[#f9fafb] hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-3.5 text-center text-gray-400 font-medium">{row.sl}</td>
                        <td className="px-6 py-3.5 font-bold text-gray-800">{row.name}</td>
                        <td className={`px-6 py-3.5 text-right font-medium ${targetColorClass}`}>
                          {formatIndianNumber(row.target)}
                        </td>
                        <td className={`px-6 py-3.5 text-right font-bold ${achievedColorClass}`}>
                          {formatIndianNumber(row.achieved)}
                        </td>
                        <td className={`px-6 py-3.5 text-right font-bold ${balColorClass}`}>
                          {formatIndianNumber(row.balance)}
                        </td>
                        <td className={`px-6 py-3.5 text-center font-bold ${pctColorClass}`}>
                          {row.pct}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {selectedReport === "Sales Funnel" && (
          <div className="bg-white rounded-[20px] shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-5 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <h2 className="text-[17px] font-bold text-gray-900">Sales Funnel</h2>
                {(loadingPerformance || loadingWalkins) && (
                  <span className="flex h-2.5 w-2.5 relative" title="Syncing real-time store performance data...">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                )}
              </div>
              <p className="text-gray-400 text-xs font-semibold">
                {activeTab === "MTD" 
                  ? getMTDDateRangeString() 
                  : activeTab === "WTD" 
                    ? getWTDDateRangeString() 
                    : getCustomDateRangeString()}
              </p>
            </div>

            {/* Sales Funnel Grid Table */}
            <div className="overflow-x-auto w-full">
              <table className="w-full text-center border-collapse">
                <thead>
                  {/* Primary header row */}
                  <tr className="bg-[#2e2e2e] text-white text-[11px] font-bold tracking-wider uppercase border-b border-gray-600">
                    <th rowSpan={2} className="sticky left-0 z-20 bg-[#2e2e2e] px-6 py-4 text-left border-r border-gray-600 w-60 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.3)]">{isAdminOrSuperAdmin ? "Store Name" : "Staff Name"}</th>
                    <th colSpan={2} className="px-6 py-2 border-r border-gray-600 text-center">Bill</th>
                    <th colSpan={2} className="px-6 py-2 border-r border-gray-600 text-center">Value</th>
                    <th colSpan={2} className="px-6 py-2 border-r border-gray-600 text-center">Quantity</th>
                    <th colSpan={2} className="px-6 py-2 border-r border-gray-600 text-center">Walk In</th>
                    <th colSpan={2} className="px-6 py-2 border-r border-gray-600 text-center">Loss</th>
                    <th colSpan={2} className="px-6 py-2 border-r border-gray-600 text-center">ABV</th>
                    <th colSpan={2} className="px-6 py-2 border-r border-gray-600 text-center">ABS</th>
                    <th colSpan={2} className="px-6 py-2 border-r border-gray-600 text-center">Conversion (%)</th>
                    <th colSpan={2} className="px-6 py-2 border-r border-gray-600 text-center">Contribution (%)</th>
                    <th colSpan={2} className="px-6 py-2 text-center">ARP</th>
                  </tr>
                  {/* Secondary header row */}
                  <tr className="bg-[#2e2e2e] text-white text-[10px] font-bold tracking-wider uppercase">
                    <th className="px-4 py-2 border-r border-gray-600">FTD</th>
                    <th className="px-4 py-2 border-r border-gray-600">{activeTab}</th>
                    
                    <th className="px-4 py-2 border-r border-gray-600">FTD</th>
                    <th className="px-4 py-2 border-r border-gray-600">{activeTab}</th>
                    
                    <th className="px-4 py-2 border-r border-gray-600">FTD</th>
                    <th className="px-4 py-2 border-r border-gray-600">{activeTab}</th>

                    <th className="px-4 py-2 border-r border-gray-600">FTD</th>
                    <th className="px-4 py-2 border-r border-gray-600">{activeTab}</th>

                    <th className="px-4 py-2 border-r border-gray-600">FTD</th>
                    <th className="px-4 py-2 border-r border-gray-600">{activeTab}</th>

                    <th className="px-4 py-2 border-r border-gray-600">FTD</th>
                    <th className="px-4 py-2 border-r border-gray-600">{activeTab}</th>

                    <th className="px-4 py-2 border-r border-gray-600">FTD</th>
                    <th className="px-4 py-2 border-r border-gray-600">{activeTab}</th>

                    <th className="px-4 py-2 border-r border-gray-600">FTD</th>
                    <th className="px-4 py-2 border-r border-gray-600">{activeTab}</th>

                    <th className="px-4 py-2 border-r border-gray-600">FTD</th>
                    <th className="px-4 py-2 border-r border-gray-600">{activeTab}</th>

                    <th className="px-4 py-2 border-r border-gray-600">FTD</th>
                    <th className="px-4 py-2">{activeTab}</th>
                  </tr>
                </thead>
                <tbody className="text-xs text-gray-700 divide-y divide-gray-100">
                  {filteredFunnelRows.map((row, idx) => {
                    const contributionFtd = totalBillFtd > 0 ? Math.round((row.billFtd / totalBillFtd) * 100) : 0;
                    const contributionWtd = totalBillWtd > 0 ? Math.round((row.billWtd / totalBillWtd) * 100) : 0;
                    
                    return (
                      <tr key={idx} className="odd:bg-white even:bg-[#f9fafb] hover:bg-gray-50/50 transition-colors">
                        <td className={`sticky left-0 z-10 px-6 py-3.5 text-left font-semibold text-gray-800 border-r border-gray-100 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.15)] ${idx % 2 === 0 ? "bg-white" : "bg-[#f9fafb]"}`}>{row.name}</td>
                        <td className="px-4 py-3.5 border-r border-gray-100">{renderCellVal(row.valFtd)}</td>
                        <td className="px-4 py-3.5 border-r border-gray-100 text-gray-700">{renderCellVal(row.valWtd)}</td>
                        
                        <td className="px-4 py-3.5 border-r border-gray-100">{renderCellVal(formatIndianNumber(row.billFtd))}</td>
                        <td className="px-4 py-3.5 border-r border-gray-100 text-gray-700">{renderCellVal(formatIndianNumber(row.billWtd))}</td>
                        
                        <td className="px-4 py-3.5 border-r border-gray-100">{renderCellVal(row.qtyFtd)}</td>
                        <td className="px-4 py-3.5 border-r border-gray-100 text-gray-700">{renderCellVal(row.qtyWtd)}</td>

                        <td className="px-4 py-3.5 border-r border-gray-100">{renderCellVal(row.walkFtd)}</td>
                        <td className="px-4 py-3.5 border-r border-gray-100 text-gray-700">{renderCellVal(row.walkWtd)}</td>

                        <td className="px-4 py-3.5 border-r border-gray-100">{renderCellVal(row.lossFtd)}</td>
                        <td className="px-4 py-3.5 border-r border-gray-100 text-gray-700">{renderCellVal(row.lossWtd)}</td>

                        <td className="px-4 py-3.5 border-r border-gray-100 font-medium">{renderCellVal(formatIndianNumber(row.abvFtd !== undefined ? row.abvFtd : Math.round(row.billFtd / (row.valFtd || 1))))}</td>
                        <td className="px-4 py-3.5 border-r border-gray-100 text-gray-700 font-medium">{renderCellVal(formatIndianNumber(row.abvWtd !== undefined ? row.abvWtd : Math.round(row.billWtd / (row.valWtd || 1))))}</td>

                        <td className="px-4 py-3.5 border-r border-gray-100 font-medium">{renderCellVal(row.absFtd !== undefined ? row.absFtd : (row.qtyFtd / (row.valFtd || 1)).toFixed(1))}</td>
                        <td className="px-4 py-3.5 border-r border-gray-100 text-gray-700 font-medium">{renderCellVal(row.absWtd !== undefined ? row.absWtd : (row.qtyWtd / (row.valWtd || 1)).toFixed(1))}</td>

                        <td className="px-4 py-3.5 border-r border-gray-100 font-medium">{renderCellVal(row.convFtd !== undefined ? Math.min(100, row.convFtd) : Math.min(100, Math.round((row.valFtd / (row.walkFtd || 1)) * 100)), true)}</td>
                        <td className="px-4 py-3.5 border-r border-gray-100 text-gray-700 font-medium">{renderCellVal(row.convWtd !== undefined ? Math.min(100, row.convWtd) : Math.min(100, Math.round((row.valWtd / (row.walkWtd || 1)) * 100)), true)}</td>

                        <td className="px-4 py-3.5 border-r border-gray-100 font-semibold text-[#00A36C]">{renderCellVal(contributionFtd, true)}</td>
                        <td className="px-4 py-3.5 border-r border-gray-100 text-gray-700 font-semibold text-[#00A36C]">{renderCellVal(contributionWtd, true)}</td>

                        <td className="px-4 py-3.5 border-r border-gray-100 font-medium">{renderCellVal(formatIndianNumber(row.arpFtd !== undefined ? row.arpFtd : Math.round(row.billFtd / (row.qtyFtd || 1))))}</td>
                        <td className="px-4 py-3.5 text-gray-700 font-medium">{renderCellVal(formatIndianNumber(row.arpWtd !== undefined ? row.arpWtd : Math.round(row.billWtd / (row.qtyWtd || 1))))}</td>
                      </tr>
                    );
                  })}

                  {/* STORE TOTAL row */}
                  <tr className="bg-[#dce9f5] font-bold text-gray-900">
                    <td className="sticky left-0 z-10 bg-[#dce9f5] px-6 py-3.5 text-left border-r border-blue-200/50 uppercase tracking-wider shadow-[2px_0_5px_-2px_rgba(0,0,0,0.15)]">Store Total</td>
                    
                    <td className="px-4 py-3.5 border-r border-blue-200/50">{renderCellVal(formatIndianNumber(totalValFtd))}</td>
                    <td className="px-4 py-3.5 border-r border-blue-200/50">{renderCellVal(formatIndianNumber(totalValWtd))}</td>
                    
                    <td className="px-4 py-3.5 border-r border-blue-200/50">{renderCellVal(formatIndianNumber(totalBillFtd))}</td>
                    <td className="px-4 py-3.5 border-r border-blue-200/50">{renderCellVal(formatIndianNumber(totalBillWtd))}</td>
                    
                    <td className="px-4 py-3.5 border-r border-blue-200/50">{renderCellVal(formatIndianNumber(totalQtyFtd))}</td>
                    <td className="px-4 py-3.5 border-r border-blue-200/50">{renderCellVal(formatIndianNumber(totalQtyWtd))}</td>

                    <td className="px-4 py-3.5 border-r border-blue-200/50">{renderCellVal(formatIndianNumber(totalWalkFtd))}</td>
                    <td className="px-4 py-3.5 border-r border-blue-200/50">{renderCellVal(formatIndianNumber(totalWalkWtd))}</td>

                    <td className="px-4 py-3.5 border-r border-blue-200/50">{renderCellVal(formatIndianNumber(totalLossFtd))}</td>
                    <td className="px-4 py-3.5 border-r border-blue-200/50">{renderCellVal(formatIndianNumber(totalLossWtd))}</td>

                    {/* ABV */}
                    <td className="px-4 py-3.5 border-r border-blue-200/50">{renderCellVal(formatIndianNumber(totalAbvFtd))}</td>
                    <td className="px-4 py-3.5 border-r border-blue-200/50">{renderCellVal(formatIndianNumber(totalAbvWtd))}</td>

                    {/* ABS */}
                    <td className="px-4 py-3.5 border-r border-blue-200/50">{renderCellVal(totalAbsFtd)}</td>
                    <td className="px-4 py-3.5 border-r border-blue-200/50">{renderCellVal(totalAbsWtd)}</td>

                    {/* Conversion */}
                    <td className="px-4 py-3.5 border-r border-blue-200/50">{renderCellVal(totalConvFtd, true)}</td>
                    <td className="px-4 py-3.5 border-r border-blue-200/50">{renderCellVal(totalConvWtd, true)}</td>

                    {/* Contribution */}
                    <td className="px-4 py-3.5 border-r border-blue-200/50">{renderCellVal(totalBillFtd > 0 ? "100%" : "0%")}</td>
                    <td className="px-4 py-3.5 border-r border-blue-200/50">{renderCellVal(totalBillWtd > 0 ? "100%" : "0%")}</td>

                    {/* ARP */}
                    <td className="px-4 py-3.5 border-r border-blue-200/50">{renderCellVal(formatIndianNumber(totalArpFtd))}</td>
                    <td className="px-4 py-3.5">{renderCellVal(formatIndianNumber(totalArpWtd))}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {selectedReport === "Category Contribution" && (
          <div className="bg-white rounded-[20px] shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-5 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <h2 className="text-[17px] font-bold text-gray-900">Category Contribution</h2>
                {(loadingPerformance || loadingWalkins || loadingSales) && (
                  <span className="flex h-2.5 w-2.5 relative" title="Syncing real-time category performance data...">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                )}
              </div>
              <p className="text-gray-400 text-xs font-semibold">
                {activeTab === "MTD" 
                  ? getMTDDateRangeString() 
                  : activeTab === "WTD" 
                    ? getWTDDateRangeString() 
                    : getCustomDateRangeString()}
              </p>
            </div>

            {/* Category Contribution Table */}
            <div className="overflow-x-auto w-full p-4">
              <table className="w-full text-center border-collapse">
                <thead>
                  {/* Primary header row */}
                  <tr className="text-white text-[11px] font-bold tracking-wider uppercase">
                    <th rowSpan={3} className="sticky left-0 z-20 bg-[#2e2e2e] text-white px-6 py-4 text-left rounded-[16px] w-60 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.3)] border-none">
                      Store Name
                    </th>
                    {/* Spacer column margin between pills */}
                    <th className="w-2 bg-white" rowSpan={3}></th>
                    
                    <th colSpan={6} className="bg-[#2e2e2e] text-white rounded-t-[16px] py-3 text-center border-b border-gray-600/50 border-none">
                      Rental Products
                    </th>
                    {/* Spacer column margin between pills */}
                    <th className="w-2 bg-white" rowSpan={3}></th>
                    
                    <th colSpan={6} className="bg-[#2e2e2e] text-white rounded-t-[16px] py-3 text-center border-b border-gray-600/50 border-none">
                      Dappr Squad
                    </th>
                    {/* Spacer column margin between pills */}
                    <th className="w-2 bg-white" rowSpan={3}></th>
                    
                    <th colSpan={6} className="bg-[#2e2e2e] text-white rounded-t-[16px] py-3 text-center border-b border-gray-600/50 border-none">
                      Sales Products
                    </th>
                  </tr>
                  
                  {/* Secondary header row */}
                  <tr className="bg-[#e5ecf6] text-gray-700 text-[10px] font-bold tracking-wider uppercase border-b border-gray-200">
                    <th colSpan={2} className="px-4 py-2 border-r border-gray-200/50 text-center">Value</th>
                    <th colSpan={2} className="px-4 py-2 border-r border-gray-200/50 text-center">Bill</th>
                    <th colSpan={2} className="px-4 py-2 text-center">Quantity</th>
                    
                    <th colSpan={2} className="px-4 py-2 border-r border-gray-200/50 text-center">Value</th>
                    <th colSpan={2} className="px-4 py-2 border-r border-gray-200/50 text-center">Bill</th>
                    <th colSpan={2} className="px-4 py-2 text-center">Quantity</th>

                    <th colSpan={2} className="px-4 py-2 border-r border-gray-200/50 text-center">Value</th>
                    <th colSpan={2} className="px-4 py-2 border-r border-gray-200/50 text-center">Bill</th>
                    <th colSpan={2} className="px-4 py-2 text-center">Quantity</th>
                  </tr>
                  
                  {/* Tertiary header row */}
                  <tr className="bg-[#e5ecf6] text-gray-600 text-[9px] font-bold tracking-wider uppercase border-b border-gray-200">
                    <th className="px-4 py-1.5 border-r border-gray-200/50 text-center">FTD</th>
                    <th className="px-4 py-1.5 border-r border-gray-200/50 text-center">{activeTab}</th>
                    <th className="px-4 py-1.5 border-r border-gray-200/50 text-center">FTD</th>
                    <th className="px-4 py-1.5 border-r border-gray-200/50 text-center">{activeTab}</th>
                    <th className="px-4 py-1.5 border-r border-gray-200/50 text-center">FTD</th>
                    <th className="px-4 py-1.5 text-center">{activeTab}</th>
                    
                    <th className="px-4 py-1.5 border-r border-gray-200/50 text-center">FTD</th>
                    <th className="px-4 py-1.5 border-r border-gray-200/50 text-center">{activeTab}</th>
                    <th className="px-4 py-1.5 border-r border-gray-200/50 text-center">FTD</th>
                    <th className="px-4 py-1.5 border-r border-gray-200/50 text-center">{activeTab}</th>
                    <th className="px-4 py-1.5 border-r border-gray-200/50 text-center">FTD</th>
                    <th className="px-4 py-1.5 text-center">{activeTab}</th>

                    <th className="px-4 py-1.5 border-r border-gray-200/50 text-center">FTD</th>
                    <th className="px-4 py-1.5 border-r border-gray-200/50 text-center">{activeTab}</th>
                    <th className="px-4 py-1.5 border-r border-gray-200/50 text-center">FTD</th>
                    <th className="px-4 py-1.5 border-r border-gray-200/50 text-center">{activeTab}</th>
                    <th className="px-4 py-1.5 border-r border-gray-200/50 text-center">FTD</th>
                    <th className="px-4 py-1.5 text-center">{activeTab}</th>
                  </tr>
                </thead>
                <tbody className="text-xs text-gray-700 divide-y divide-gray-100">
                  {filteredCategoryRows.map((row, idx) => (
                    <tr key={idx} className="odd:bg-white even:bg-[#f9fafb] hover:bg-gray-50/50 transition-colors">
                      {/* Sticky Store Name cell */}
                      <td className={`sticky left-0 z-10 px-6 py-3.5 text-left font-semibold text-gray-800 border-r border-gray-100 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.15)] border-none ${idx % 2 === 0 ? "bg-white" : "bg-[#f9fafb]"}`}>
                        {row.name}
                      </td>
                      {/* Spacer cell */}
                      <td className="w-2 bg-white border-none"></td>
                      
                      {/* Rental Products Cells */}
                      <td className={`px-4 py-3.5 border-r border-gray-100 font-medium ${!row.rentalValFtd && "text-red-500"}`}>{renderCellVal(formatIndianNumber(row.rentalValFtd))}</td>
                      <td className={`px-4 py-3.5 border-r border-gray-100 text-gray-700 font-medium ${!row.rentalValWtd && "text-red-500"}`}>{renderCellVal(formatIndianNumber(row.rentalValWtd))}</td>
                      
                      <td className={`px-4 py-3.5 border-r border-gray-100 ${!row.rentalBillFtd && "text-red-500"}`}>{renderCellVal(row.rentalBillFtd)}</td>
                      <td className={`px-4 py-3.5 border-r border-gray-100 text-gray-700 ${!row.rentalBillWtd && "text-red-500"}`}>{renderCellVal(row.rentalBillWtd)}</td>
                      
                      <td className={`px-4 py-3.5 border-r border-gray-100 ${!row.rentalQtyFtd && "text-red-500"}`}>{renderCellVal(row.rentalQtyFtd)}</td>
                      <td className={`px-4 py-3.5 text-gray-700 ${!row.rentalQtyWtd && "text-red-500"}`}>{renderCellVal(row.rentalQtyWtd)}</td>
                      
                      {/* Spacer cell */}
                      <td className="w-2 bg-white border-none"></td>
                      
                      {/* Dappr Squad Cells */}
                      <td className={`px-4 py-3.5 border-r border-gray-100 font-medium ${!row.squadValFtd && "text-red-500"}`}>{renderCellVal(formatIndianNumber(row.squadValFtd))}</td>
                      <td className={`px-4 py-3.5 border-r border-gray-100 text-gray-700 font-medium ${!row.squadValWtd && "text-red-500"}`}>{renderCellVal(formatIndianNumber(row.squadValWtd))}</td>
                      
                      <td className={`px-4 py-3.5 border-r border-gray-100 ${!row.squadBillFtd && "text-red-500"}`}>{renderCellVal(row.squadBillFtd)}</td>
                      <td className={`px-4 py-3.5 border-r border-gray-100 text-gray-700 ${!row.squadBillWtd && "text-red-500"}`}>{renderCellVal(row.squadBillWtd)}</td>

                      <td className={`px-4 py-3.5 border-r border-gray-100 ${!row.squadQtyFtd && "text-red-500"}`}>{renderCellVal(row.squadQtyFtd)}</td>
                      <td className={`px-4 py-3.5 text-gray-700 ${!row.squadQtyWtd && "text-red-500"}`}>{renderCellVal(row.squadQtyWtd)}</td>

                      {/* Spacer cell */}
                      <td className="w-2 bg-white border-none"></td>

                      {/* Sales Products Cells */}
                      <td className={`px-4 py-3.5 border-r border-gray-100 font-medium ${!row.salesValFtd && "text-red-500"}`}>{renderCellVal(formatIndianNumber(row.salesValFtd))}</td>
                      <td className={`px-4 py-3.5 border-r border-gray-100 text-gray-700 font-medium ${!row.salesValWtd && "text-red-500"}`}>{renderCellVal(formatIndianNumber(row.salesValWtd))}</td>
                      
                      <td className={`px-4 py-3.5 border-r border-gray-100 ${!row.salesBillFtd && "text-red-500"}`}>{renderCellVal(row.salesBillFtd)}</td>
                      <td className={`px-4 py-3.5 border-r border-gray-100 text-gray-700 ${!row.salesBillWtd && "text-red-500"}`}>{renderCellVal(row.salesBillWtd)}</td>
                      
                      <td className={`px-4 py-3.5 border-r border-gray-100 ${!row.salesQtyFtd && "text-red-500"}`}>{renderCellVal(row.salesQtyFtd)}</td>
                      <td className={`px-4 py-3.5 text-gray-700 ${!row.salesQtyWtd && "text-red-500"}`}>{renderCellVal(row.salesQtyWtd)}</td>
                    </tr>
                  ))}

                  {/* STORE TOTAL row */}
                  <tr className="bg-[#dce9f5] font-bold text-gray-900">
                    <td className="sticky left-0 z-10 bg-[#dce9f5] px-6 py-3.5 text-left border-r border-blue-200/50 uppercase tracking-wider shadow-[2px_0_5px_-2px_rgba(0,0,0,0.15)] border-none">Store Total</td>
                    {/* Spacer cell */}
                    <td className="w-2 bg-white border-none"></td>
                    
                    {/* Rental Products Totals */}
                    <td className="px-4 py-3.5 border-r border-blue-200/50">{renderCellVal(formatIndianNumber(totalRentalValFtd))}</td>
                    <td className="px-4 py-3.5 border-r border-blue-200/50">{renderCellVal(formatIndianNumber(totalRentalValWtd))}</td>
                    
                    <td className="px-4 py-3.5 border-r border-blue-200/50">{renderCellVal(formatIndianNumber(totalRentalBillFtd))}</td>
                    <td className="px-4 py-3.5 border-r border-blue-200/50">{renderCellVal(formatIndianNumber(totalRentalBillWtd))}</td>
                    
                    <td className="px-4 py-3.5 border-r border-blue-200/50">{renderCellVal(formatIndianNumber(totalRentalQtyFtd))}</td>
                    <td className="px-4 py-3.5">{renderCellVal(formatIndianNumber(totalRentalQtyWtd))}</td>
                    
                    {/* Spacer cell */}
                    <td className="w-2 bg-white border-none"></td>
                    
                    {/* Dappr Squad Totals */}
                    <td className="px-4 py-3.5 border-r border-blue-200/50">{renderCellVal(formatIndianNumber(totalSquadValFtd))}</td>
                    <td className="px-4 py-3.5 border-r border-blue-200/50">{renderCellVal(formatIndianNumber(totalSquadValWtd))}</td>
                    
                    <td className="px-4 py-3.5 border-r border-blue-200/50">{renderCellVal(formatIndianNumber(totalSquadBillFtd))}</td>
                    <td className="px-4 py-3.5 border-r border-blue-200/50">{renderCellVal(formatIndianNumber(totalSquadBillWtd))}</td>

                    <td className="px-4 py-3.5 border-r border-blue-200/50">{renderCellVal(formatIndianNumber(totalSquadQtyFtd))}</td>
                    <td className="px-4 py-3.5">{renderCellVal(formatIndianNumber(totalSquadQtyWtd))}</td>

                    {/* Spacer cell */}
                    <td className="w-2 bg-white border-none"></td>

                    {/* Sales Products Totals */}
                    <td className="px-4 py-3.5 border-r border-blue-200/50">{renderCellVal(formatIndianNumber(totalSalesValFtd))}</td>
                    <td className="px-4 py-3.5 border-r border-blue-200/50">{renderCellVal(formatIndianNumber(totalSalesValWtd))}</td>
                    
                    <td className="px-4 py-3.5 border-r border-blue-200/50">{renderCellVal(formatIndianNumber(totalSalesBillFtd))}</td>
                    <td className="px-4 py-3.5 border-r border-blue-200/50">{renderCellVal(formatIndianNumber(totalSalesBillWtd))}</td>
                    
                    <td className="px-4 py-3.5 border-r border-blue-200/50">{renderCellVal(formatIndianNumber(totalSalesQtyFtd))}</td>
                    <td className="px-4 py-3.5">{renderCellVal(formatIndianNumber(totalSalesQtyWtd))}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Assign Store Target Modal */}
        {assignTargetModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black/50 backdrop-blur-[4px] transition-opacity duration-300"
              onClick={() => setAssignTargetModalOpen(false)}
            />

            {/* Modal Container */}
            <div className="bg-white rounded-[24px] w-full max-w-[620px] shadow-2xl relative z-10 p-6 transition-all transform scale-100 border border-gray-100/50">
              {/* Header */}
              <div className="flex items-center gap-3.5 mb-6">
                <button 
                  onClick={() => setAssignTargetModalOpen(false)}
                  className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <FiArrowLeft size={20} className="text-gray-800" />
                </button>
                <h2 className="text-lg font-bold text-gray-900 leading-none">Assign Store Target</h2>
              </div>

              {/* Store Name & Month Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Store Name*</label>
                  <select 
                    value={modalStore}
                    onChange={(e) => setModalStore(e.target.value)}
                    className="w-full bg-[#fcfcfc] border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-gray-700 focus:outline-none focus:ring-1 focus:ring-black hover:border-gray-300 transition-colors"
                  >
                    <option value="">Select Store</option>
                    <option value="All">All Stores</option>
                    {storeOptions.filter(o => o !== "All").map((store) => (
                      <option key={store} value={store}>{store}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Month*</label>
                  <select 
                    value={modalMonth}
                    onChange={(e) => setModalMonth(e.target.value)}
                    className="w-full bg-[#fcfcfc] border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-gray-700 focus:outline-none focus:ring-1 focus:ring-black hover:border-gray-300 transition-colors"
                  >
                    <option value="">Select Month</option>
                    {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Week Date Picker Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                {[
                  { id: 1, label: "Week 1", val: modalWeek1 },
                  { id: 2, label: "Week 2", val: modalWeek2 },
                  { id: 3, label: "Week 3", val: modalWeek3 },
                  { id: 4, label: "Week 4", val: modalWeek4 }
                ].map((w) => {
                  const isActive = activeWeeks.includes(w.id);
                  return (
                    <div key={w.id} className="relative flex flex-col">
                      <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">{w.label}</label>
                      <div 
                        onClick={() => {
                          setActiveWeeks(prev => {
                            if (prev.includes(w.id)) {
                              if (prev.length === 1) return prev;
                              return prev.filter(id => id !== w.id);
                            } else {
                              return [...prev, w.id];
                            }
                          });
                        }}
                        className={`relative flex items-center justify-between w-full bg-[#fcfcfc] border rounded-xl px-3 py-2.5 text-xs font-semibold text-gray-700 cursor-pointer transition-all duration-200 ${
                          isActive 
                            ? "border-black ring-1 ring-black shadow-[0_0_0_1px_black]" 
                            : "border-gray-200 hover:border-gray-400"
                        }`}
                      >
                        <span className="text-xs font-semibold text-gray-700">{w.val}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Target Field */}
              <div className="mb-6">
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Target*</label>
                <input 
                  ref={targetInputRef}
                  type="text" 
                  placeholder="Enter target here..."
                  value={modalTarget}
                  onChange={(e) => setModalTarget(e.target.value)}
                  className="w-full bg-[#fcfcfc] border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-gray-700 focus:outline-none focus:ring-1 focus:ring-black hover:border-gray-300 transition-colors"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
                <button 
                  onClick={() => {
                    if (!modalStore) {
                      alert("Please select a store to edit.");
                      return;
                    }
                    const primaryWeek = activeWeeks[0];
                    const customVal = weeklyTargets[modalStore]?.[primaryWeek];
                    if (customVal !== undefined) {
                      setModalTarget(customVal.toString());
                    } else {
                      setModalTarget("");
                    }
                    setTimeout(() => {
                      targetInputRef.current?.focus();
                    }, 50);
                  }}
                  className="flex items-center gap-1.5 border border-gray-200 hover:bg-gray-50 rounded-xl px-5 py-2.5 text-xs font-bold text-gray-700 transition-colors cursor-pointer"
                >
                  <FiEdit3 size={14} /> Edit
                </button>
                <button 
                  onClick={() => {
                    if (!modalStore) {
                      alert("Please select a store.");
                      return;
                    }
                    if (!modalTarget || modalTarget.trim() === "") {
                      alert("Please enter a target value.");
                      return;
                    }
                    handleSubmitTarget(modalStore, modalTarget, modalMonth);
                  }}
                  className="bg-black hover:bg-black/90 text-white rounded-xl px-6 py-2.5 text-xs font-bold transition-colors cursor-pointer"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Configure Week Dates Modal */}
        {configWeeksModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black/50 backdrop-blur-[4px] transition-opacity duration-300"
              onClick={() => setConfigWeeksModalOpen(false)}
            />

            {/* Modal Container */}
            <div className="bg-white rounded-[24px] w-full max-w-[620px] shadow-2xl relative z-10 p-6 border border-gray-100/50 scale-100 transition-all">
              {/* Header */}
              <div className="flex items-center gap-3.5 mb-6">
                <button 
                  onClick={() => setConfigWeeksModalOpen(false)}
                  className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <FiArrowLeft size={20} className="text-gray-800" />
                </button>
                <h2 className="text-lg font-bold text-gray-900 leading-none">Configure Week Dates</h2>
              </div>

              {/* Store Name & Month Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Store Name*</label>
                  <select 
                    value={configStore}
                    onChange={(e) => setConfigStore(e.target.value)}
                    className="w-full bg-[#fcfcfc] border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-gray-700 focus:outline-none focus:ring-1 focus:ring-black hover:border-gray-300 transition-colors"
                  >
                    <option value="All">All Stores (Global)</option>
                    {storeOptions.filter(o => o !== "All").map((store) => (
                      <option key={store} value={store}>{store}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Month*</label>
                  <select 
                    value={configMonth}
                    onChange={(e) => setConfigMonth(e.target.value)}
                    className="w-full bg-[#fcfcfc] border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-gray-700 focus:outline-none focus:ring-1 focus:ring-black hover:border-gray-300 transition-colors"
                  >
                    <option value="">Select Month</option>
                    {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Week Date Picker Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                {[
                  { id: 1, label: "Week 1*", val: configWeek1, setVal: setConfigWeek1 },
                  { id: 2, label: "Week 2*", val: configWeek2, setVal: setConfigWeek2 },
                  { id: 3, label: "Week 3*", val: configWeek3, setVal: setConfigWeek3 },
                  { id: 4, label: "Week 4*", val: configWeek4, setVal: setConfigWeek4 }
                ].map((w) => {
                  const isActive = configCalendarOpen === w.id;
                  const isDayTakenInOtherWeeks = (day) => {
                    const weeks = [1, 2, 3, 4];
                    for (const wid of weeks) {
                      if (wid === w.id) continue;
                      const start = configStartDays[wid];
                      const end = configEndDays[wid];
                      if (start !== null && end !== null && start !== undefined && end !== undefined) {
                        if (day >= start && day <= end) {
                          return true;
                        }
                      }
                    }
                    return false;
                  };
                  return (
                    <div key={w.id} className="relative flex flex-col">
                      <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">{w.label}</label>
                      <div 
                        onClick={() => setConfigCalendarOpen(configCalendarOpen === w.id ? null : w.id)}
                        className={`relative flex items-center justify-between w-full bg-[#fcfcfc] border rounded-xl px-3 py-2.5 text-xs font-semibold text-gray-700 cursor-pointer transition-all duration-200 ${
                          isActive 
                            ? "border-black ring-1 ring-black shadow-[0_0_0_1px_black]" 
                            : "border-gray-200 hover:border-gray-400"
                        }`}
                      >
                        <input 
                          type="text"
                          value={w.val}
                          onChange={(e) => w.setVal(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          className="bg-transparent border-none outline-none w-full text-xs font-semibold text-gray-700 focus:ring-0 p-0"
                        />
                        <FiCalendar size={14} className="text-gray-400 ml-1.5 flex-shrink-0" />
                      </div>

                      {/* Custom Scroll Wheel Range Selector Popup */}
                      {configCalendarOpen === w.id && (
                        <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200/80 rounded-2xl shadow-xl z-30 p-4 w-[260px] select-none text-left">
                          <div className="text-center font-bold text-xs text-gray-800 mb-3 flex justify-between items-center px-1 border-b border-gray-100 pb-2">
                            <span>{configMonth || CURRENT_MONTH_LONG} {CURRENT_YEAR} Picker</span>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setConfigCalendarOpen(null);
                              }}
                              className="text-gray-400 hover:text-gray-900 text-[10px] font-bold uppercase tracking-wider"
                            >
                              Done
                            </button>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            {/* Start Day Column */}
                            <div className="flex flex-col">
                              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 text-center">Start Day</span>
                              <div className="h-[150px] overflow-y-auto flex flex-col gap-1 pr-1 scrollbar-thin scrollbar-thumb-gray-200">
                                {Array.from({ length: getDaysCountInMonth(configMonth || CURRENT_MONTH_LONG) }, (_, i) => i + 1).map((d) => {
                                  const isSelected = configStartDays[w.id] === d;
                                  const isDisabled = isDayTakenInOtherWeeks(d);
                                  return (
                                    <button
                                      key={`start-${d}`}
                                      disabled={isDisabled}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        const newStart = d;
                                        let newEnd = configEndDays[w.id];
                                        if (newStart !== null && newEnd !== null && newEnd < newStart) {
                                          newEnd = newStart;
                                        }
                                        setConfigStartDays(prev => ({ ...prev, [w.id]: newStart }));
                                        setConfigEndDays(prev => ({ ...prev, [w.id]: newEnd }));
                                        const monthAbbr = (configMonth || CURRENT_MONTH_LONG).substring(0, 3);
                                        if (newStart !== null && newEnd !== null) {
                                          w.setVal(`${String(newStart).padStart(2, "0")} - ${String(newEnd).padStart(2, "0")} ${monthAbbr}`);
                                        }
                                      }}
                                      className={`py-1.5 text-xs font-semibold rounded-lg transition-colors text-center ${
                                        isDisabled
                                          ? "text-gray-300 cursor-not-allowed opacity-40"
                                          : isSelected 
                                            ? "bg-black text-white font-bold" 
                                            : "text-gray-700 hover:bg-gray-100"
                                      }`}
                                    >
                                      {String(d).padStart(2, "0")}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                            
                            {/* End Day Column */}
                            <div className="flex flex-col">
                              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 text-center">End Day</span>
                              <div className="h-[150px] overflow-y-auto flex flex-col gap-1 pr-1 scrollbar-thin scrollbar-thumb-gray-200">
                                {Array.from({ length: getDaysCountInMonth(configMonth || CURRENT_MONTH_LONG) }, (_, i) => i + 1).map((d) => {
                                  const isSelected = configEndDays[w.id] === d;
                                  const isDisabled = (() => {
                                    if (configStartDays[w.id] === null) return true;
                                    if (d < configStartDays[w.id]) return true;
                                    for (let day = configStartDays[w.id]; day <= d; day++) {
                                      if (isDayTakenInOtherWeeks(day)) return true;
                                    }
                                    return false;
                                  })();
                                  return (
                                    <button
                                      key={`end-${d}`}
                                      disabled={isDisabled}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        const newEnd = d;
                                        setConfigEndDays(prev => ({ ...prev, [w.id]: newEnd }));
                                        const monthAbbr = (configMonth || CURRENT_MONTH_LONG).substring(0, 3);
                                        if (configStartDays[w.id] !== null && newEnd !== null) {
                                          w.setVal(`${String(configStartDays[w.id]).padStart(2, "0")} - ${String(newEnd).padStart(2, "0")} ${monthAbbr}`);
                                        }
                                      }}
                                      className={`py-1.5 text-xs font-semibold rounded-lg transition-colors text-center ${
                                        isDisabled 
                                          ? "text-gray-300 cursor-not-allowed opacity-40"
                                          : isSelected 
                                            ? "bg-black text-white font-bold" 
                                            : "text-gray-700 hover:bg-gray-100"
                                      }`}
                                    >
                                      {String(d).padStart(2, "0")}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
                <button 
                  onClick={() => setConfigWeeksModalOpen(false)}
                  className="flex items-center gap-1.5 border border-gray-200 hover:bg-gray-50 rounded-xl px-5 py-2.5 text-xs font-bold text-gray-700 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveConfigWeeks}
                  className="bg-black hover:bg-black/90 text-white rounded-xl px-6 py-2.5 text-xs font-bold transition-colors cursor-pointer"
                >
                  Save Dates
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default DSRReport;
