import React, { useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";

const mockStoreFunnelRows = [
  {
    name: "Z Edappally",
    storeName: "Z Edappally",
    billFtd: 95000, billWtd: 570000,
    valFtd: 35, valWtd: 210,
    qtyFtd: 65, qtyWtd: 390,
    walkFtd: 85, walkWtd: 510,
    lossFtd: 15, lossWtd: 90,
    abvFtd: 2714, abvWtd: 2714,
    absFtd: 1.9, absWtd: 1.9,
    convFtd: 41, convWtd: 41,
    contrFtd: 15, contrWtd: 15,
    arpFtd: 1462, arpWtd: 1462
  },
  {
    name: "G Edappally",
    storeName: "G Edappally",
    billFtd: 82000, billWtd: 492000,
    valFtd: 28, valWtd: 168,
    qtyFtd: 52, qtyWtd: 312,
    walkFtd: 70, walkWtd: 420,
    lossFtd: 12, lossWtd: 72,
    abvFtd: 2929, abvWtd: 2929,
    absFtd: 1.9, absWtd: 1.9,
    convFtd: 40, convWtd: 40,
    contrFtd: 13, contrWtd: 13,
    arpFtd: 1577, arpWtd: 1577
  },
  {
    name: "Z Edappal",
    storeName: "Z Edappal",
    billFtd: 60000, billWtd: 360000,
    valFtd: 20, valWtd: 120,
    qtyFtd: 38, qtyWtd: 228,
    walkFtd: 55, walkWtd: 330,
    lossFtd: 10, lossWtd: 60,
    abvFtd: 3000, abvWtd: 3000,
    absFtd: 1.9, absWtd: 1.9,
    convFtd: 36, convWtd: 36,
    contrFtd: 10, contrWtd: 10,
    arpFtd: 1579, arpWtd: 1579
  },
  {
    name: "Z Perinthalmanna",
    storeName: "Z Perinthalmanna",
    billFtd: 75000, billWtd: 450000,
    valFtd: 26, valWtd: 156,
    qtyFtd: 48, qtyWtd: 288,
    walkFtd: 68, walkWtd: 408,
    lossFtd: 14, lossWtd: 84,
    abvFtd: 2885, abvWtd: 2885,
    absFtd: 1.8, absWtd: 1.8,
    convFtd: 38, convWtd: 38,
    contrFtd: 12, contrWtd: 12,
    arpFtd: 1563, arpWtd: 1563
  },
  {
    name: "Z Kottakkal",
    storeName: "Z Kottakkal",
    billFtd: 64000, billWtd: 384000,
    valFtd: 22, valWtd: 132,
    qtyFtd: 40, qtyWtd: 240,
    walkFtd: 58, walkWtd: 348,
    lossFtd: 8, lossWtd: 48,
    abvFtd: 2909, abvWtd: 2909,
    absFtd: 1.8, absWtd: 1.8,
    convFtd: 38, convWtd: 38,
    contrFtd: 10, contrWtd: 10,
    arpFtd: 1600, arpWtd: 1600
  },
  {
    name: "G Kottayam",
    storeName: "G Kottayam",
    billFtd: 88000, billWtd: 528000,
    valFtd: 30, valWtd: 180,
    qtyFtd: 55, qtyWtd: 330,
    walkFtd: 80, walkWtd: 480,
    lossFtd: 16, lossWtd: 96,
    abvFtd: 2933, abvWtd: 2933,
    absFtd: 1.8, absWtd: 1.8,
    convFtd: 38, convWtd: 38,
    contrFtd: 14, contrWtd: 14,
    arpFtd: 1600, arpWtd: 1600
  },
  {
    name: "G Perumbavoor",
    storeName: "G Perumbavoor",
    billFtd: 68000, billWtd: 408000,
    valFtd: 24, valWtd: 144,
    qtyFtd: 44, qtyWtd: 264,
    walkFtd: 62, walkWtd: 372,
    lossFtd: 10, lossWtd: 60,
    abvFtd: 2833, abvWtd: 2833,
    absFtd: 1.8, absWtd: 1.8,
    convFtd: 39, convWtd: 39,
    contrFtd: 11, contrWtd: 11,
    arpFtd: 1545, arpWtd: 1545
  },
  {
    name: "G Thrissur",
    storeName: "G Thrissur",
    billFtd: 98000, billWtd: 588000,
    valFtd: 34, valWtd: 204,
    qtyFtd: 68, qtyWtd: 408,
    walkFtd: 90, walkWtd: 540,
    lossFtd: 18, lossWtd: 108,
    abvFtd: 2882, abvWtd: 2882,
    absFtd: 2.0, absWtd: 2.0,
    convFtd: 38, convWtd: 38,
    contrFtd: 15, contrWtd: 15,
    arpFtd: 1441, arpWtd: 1441
  }
];
import SideNav from "../../components/SideNav/SideNav";
import ModileNav from "../../components/SideNav/ModileNav";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { FiSearch, FiDownload, FiArrowLeft, FiCalendar, FiEdit3 } from "react-icons/fi";
import baseUrl from "../../api/api";

const mockDSRData = [
  { sl: "01", name: "Z Edappally", target: 150000, achieved: 142500, balance: 7500, pct: 98 },
  { sl: "02", name: "G Edappally", target: 120000, achieved: 128400, balance: -8400, pct: 107 },
  { sl: "03", name: "Z Edappal", target: 90000, achieved: 82800, balance: 7200, pct: 92 },
  { sl: "04", name: "Z Perinthalmanna", target: 110000, achieved: 115500, balance: -5500, pct: 105 },
  { sl: "05", name: "Z Kottakkal", target: 95000, achieved: 88350, balance: 6650, pct: 93 },
  { sl: "06", name: "G Kottayam", target: 130000, achieved: 117000, balance: 13000, pct: 90 },
  { sl: "07", name: "G Perumbavoor", target: 100000, achieved: 108000, balance: -8000, pct: 108 },
  { sl: "08", name: "G Thrissur", target: 140000, achieved: 133000, balance: 7000, pct: 95 },
  { sl: "09", name: "Z Calicut", target: 125000, achieved: 118750, balance: 6250, pct: 95 },
  { sl: "10", name: "SG Calicut", target: 85000, achieved: 76500, balance: 8500, pct: 90 },
  { sl: "11", name: "Z Kannur", target: 160000, achieved: 168000, balance: -8000, pct: 105 },
  { sl: "12", name: "SG Palakkad", target: 80000, achieved: 72000, balance: 8000, pct: 90 },
  { sl: "13", name: "SG Manjeri", target: 145000, achieved: 152250, balance: -7250, pct: 105 },
  { sl: "14", name: "SG Trivandrum", target: 105000, achieved: 94500, balance: 10500, pct: 90 },
  { sl: "15", name: "SG Chavakkad", target: 90000, achieved: 96300, balance: -6300, pct: 107 },
  { sl: "16", name: "SG", target: 115000, achieved: 109250, balance: 5750, pct: 95 },
  { sl: "17", name: "Z Calicut", target: 75000, achieved: 78750, balance: -3750, pct: 105 },
  { sl: "18", name: "G Thrissur", target: 100000, achieved: 92000, balance: 8000, pct: 92 },
  { sl: "19", name: "Z Calicut", target: 85000, achieved: 89250, balance: -4250, pct: 105 },
  { sl: "20", name: "G Thrissur", target: 120000, achieved: 114000, balance: 6000, pct: 95 }
];

const mockCategoryData = [
  { name: "Menswear", value: 42, target: 950000, achieved: 932400, color: "#18181b" },
  { name: "Womenswear", value: 35, target: 780000, achieved: 761900, color: "#00A36C" },
  { name: "Kidswear", value: 15, target: 330000, achieved: 326500, color: "#3b82f6" },
  { name: "Accessories", value: 8, target: 160000, achieved: 156050, color: "#f59e0b" }
];

const mockFunnelRows = [
  {
    name: "Amal P",
    storeName: "G Thrissur",
    billFtd: 8000, billWtd: 48000,
    valFtd: 3, valWtd: 18,
    qtyFtd: 5, qtyWtd: 30,
    walkFtd: 7, walkWtd: 42,
    lossFtd: 2, lossWtd: 12,
    abvFtd: 2875, abvWtd: 2875,
    absFtd: 2.7, absWtd: 2.7,
    convFtd: 80, convWtd: 86,
    contrFtd: 85, contrWtd: 93,
    arpFtd: 1600, arpWtd: 1600
  },
  {
    name: "Anagha Hari",
    storeName: "G Thrissur",
    billFtd: 8000, billWtd: 48000,
    valFtd: 3, valWtd: 18,
    qtyFtd: 5, qtyWtd: 30,
    walkFtd: 7, walkWtd: 42,
    lossFtd: 2, lossWtd: 12,
    abvFtd: 2875, abvWtd: 2875,
    absFtd: 2.7, absWtd: 2.7,
    convFtd: 80, convWtd: 86,
    contrFtd: 85, contrWtd: 93,
    arpFtd: 1600, arpWtd: 1600
  },
  {
    name: "Rohit H",
    storeName: "G Thrissur",
    billFtd: 8000, billWtd: 48000,
    valFtd: 3, valWtd: 18,
    qtyFtd: 5, qtyWtd: 30,
    walkFtd: 7, walkWtd: 42,
    lossFtd: 2, lossWtd: 12,
    abvFtd: 2875, abvWtd: 2875,
    absFtd: 2.7, absWtd: 2.7,
    convFtd: 80, convWtd: 86,
    contrFtd: 85, contrWtd: 93,
    arpFtd: 1600, arpWtd: 1600
  },
  {
    name: "Abhiram S Kumar",
    storeName: "G Thrissur",
    billFtd: 8000, billWtd: 48000,
    valFtd: 3, valWtd: 18,
    qtyFtd: 5, qtyWtd: 30,
    walkFtd: 7, walkWtd: 42,
    lossFtd: 2, lossWtd: 12,
    abvFtd: 2875, abvWtd: 2875,
    absFtd: 2.7, absWtd: 2.7,
    convFtd: 80, convWtd: 86,
    contrFtd: 85, contrWtd: 93,
    arpFtd: 1600, arpWtd: 1600
  },
  {
    name: "Sanu Sujanan",
    storeName: "G Thrissur",
    billFtd: 8000, billWtd: 48000,
    valFtd: 3, valWtd: 18,
    qtyFtd: 5, qtyWtd: 30,
    walkFtd: 7, walkWtd: 42,
    lossFtd: 2, lossWtd: 12,
    abvFtd: 2875, abvWtd: 2875,
    absFtd: 2.7, absWtd: 2.7,
    convFtd: 80, convWtd: 86,
    contrFtd: 85, contrWtd: 93,
    arpFtd: 1600, arpWtd: 1600
  },
  {
    name: "Parvathy",
    storeName: "G Thrissur",
    billFtd: 8000, billWtd: 48000,
    valFtd: 3, valWtd: 18,
    qtyFtd: 5, qtyWtd: 30,
    walkFtd: 7, walkWtd: 42,
    lossFtd: 2, lossWtd: 12,
    abvFtd: 2875, abvWtd: 2875,
    absFtd: 2.7, absWtd: 2.7,
    convFtd: 80, convWtd: 86,
    contrFtd: 85, contrWtd: 93,
    arpFtd: 1600, arpWtd: 1600
  },
  {
    name: "Jophy",
    storeName: "G Thrissur",
    billFtd: 8000, billWtd: 48000,
    valFtd: 3, valWtd: 18,
    qtyFtd: 5, qtyWtd: 30,
    walkFtd: 7, walkWtd: 42,
    lossFtd: 2, lossWtd: 12,
    abvFtd: 2875, abvWtd: 2875,
    absFtd: 2.7, absWtd: 2.7,
    convFtd: 80, convWtd: 86,
    contrFtd: 85, contrWtd: 93,
    arpFtd: 1600, arpWtd: 1600
  },
  {
    name: "Abijith",
    storeName: "G Thrissur",
    billFtd: 8000, billWtd: 48000,
    valFtd: 3, valWtd: 18,
    qtyFtd: 5, qtyWtd: 30,
    walkFtd: 7, walkWtd: 42,
    lossFtd: 2, lossWtd: 12,
    abvFtd: 2875, abvWtd: 2875,
    absFtd: 2.7, absWtd: 2.7,
    convFtd: 80, convWtd: 86,
    contrFtd: 85, contrWtd: 93,
    arpFtd: 1600, arpWtd: 1600
  }
];

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

const DSRReport = () => {
  const user = useSelector((state) => state.auth.user);
  const isAdminOrSuperAdmin = user?.role === "super_admin" || user?.role === "admin";
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStore, setSelectedStore] = useState("All");
  const [selectedReport, setSelectedReport] = useState("Revenue Vs Target");
  const [activeTab, setActiveTab] = useState("MTD");
  const [customStartDate, setCustomStartDate] = useState("2026-06-22");
  const [customEndDate, setCustomEndDate] = useState("2026-06-28");

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
  const [modalMonth, setModalMonth] = useState("June");
  const [modalTarget, setModalTarget] = useState("");
  const [activeWeek, setActiveWeek] = useState(1);
  const [week1Dates, setWeek1Dates] = useState(() => localStorage.getItem("week1Dates") || "01 - 10 Jun");
  const [week2Dates, setWeek2Dates] = useState(() => localStorage.getItem("week2Dates") || "11 - 17 Jun");
  const [week3Dates, setWeek3Dates] = useState(() => localStorage.getItem("week3Dates") || "Select Days");
  const [week4Dates, setWeek4Dates] = useState(() => localStorage.getItem("week4Dates") || "Select Days");
  const [weeklyTargets, setWeeklyTargets] = useState(() => {
    try {
      const stored = localStorage.getItem("weeklyTargets");
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const getCurrentWeekId = () => {
    const today = new Date();
    const todayDateNum = today.getDate();

    const weeks = [
      { id: 1, val: week1Dates },
      { id: 2, val: week2Dates },
      { id: 3, val: week3Dates },
      { id: 4, val: week4Dates },
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
      const currentWeekId = getCurrentWeekId(); 
      if (storeTargetObj[currentWeekId] !== undefined) {
        return storeTargetObj[currentWeekId];
      }
      return Math.round(defaultTarget * 0.23);
    }

    if (activeTabVal === "Custom") {
      // For Custom date range, compute proportional target based on MTD target and customFactor
      // First, get the full month target
      const hasCustomWeeks = [1, 2, 3, 4].some(wId => storeTargetObj[wId] !== undefined);
      let mtdTarget = defaultTarget;
      if (hasCustomWeeks) {
        let sum = 0;
        for (let wId = 1; wId <= 4; wId++) {
          if (storeTargetObj[wId] !== undefined) {
            sum += storeTargetObj[wId];
          } else {
            sum += Math.round(defaultTarget * 0.23);
          }
        }
        mtdTarget = sum;
      }
      return Math.round(mtdTarget * customFactorVal);
    }
    
    return defaultTarget;
  };

  const handleSubmitTarget = (store, val, month) => {
    const cleanVal = String(val || "").replace(/[^0-9.-]/g, "");
    const parsed = Number(cleanVal);
    if (!isNaN(parsed)) {
      setWeeklyTargets((prev) => {
        const storeObj = prev[store] || {};
        const updated = {
          ...prev,
          [store]: {
            ...storeObj,
            [activeWeek]: parsed
          }
        };
        localStorage.setItem("weeklyTargets", JSON.stringify(updated));
        return updated;
      });
    }
    setAssignTargetModalOpen(false);
  };

  useEffect(() => {
    if (modalStore && activeWeek) {
      const customVal = weeklyTargets[modalStore]?.[activeWeek];
      if (customVal !== undefined) {
        setModalTarget(customVal.toString());
      } else {
        setModalTarget("");
      }
    }
  }, [modalStore, activeWeek, weeklyTargets]);

  const [calendarOpenForWeek, setCalendarOpenForWeek] = useState(null);
  const [weekStartDays, setWeekStartDays] = useState({ 1: 1, 2: 11, 3: null, 4: null });
  const [weekEndDays, setWeekEndDays] = useState({ 1: 10, 2: 17, 3: null, 4: null });

  const getDaysCountInMonth = (monthName, year = 2026) => {
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

  // Dynamic branches state
  const [branches, setBranches] = useState([]);
  const [loadingBranches, setLoadingBranches] = useState(true);

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

  const getWTDDateRangeString = () => {
    const today = new Date();
    const dayOfWeek = today.getDay(); 
    const monday = new Date(today);
    const distance = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    monday.setDate(today.getDate() + distance);
    
    const startMonth = monday.toLocaleString("en-US", { month: "long" });
    const startDay = String(monday.getDate()).padStart(2, "0");
    
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

  // Generate dynamic DSR data based on fetched branches (with mock fallback)
  const dsrData = useMemo(() => {
    let customFactor = 1.0;
    if (activeTab === "Custom") {
      const start = new Date(customStartDate);
      const end = new Date(customEndDate);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      customFactor = isNaN(diffDays) ? 1.0 : diffDays / 30.0;
    }

    const list = branches.length > 0
      ? branches.map((b, index) => {
          const sl = String(index + 1).padStart(2, "0");
          const name = displayBranchName(b.workingBranch);
          const mockItem = mockDSRData[index % mockDSRData.length];
          const rawAchieved = mockItem ? mockItem.achieved : 95000;
          
          const defaultTarget = mockItem ? mockItem.target : 100000;
          const target = getStoreTarget(name, defaultTarget, activeTab, customFactor);
          
          let achieved = rawAchieved;
          if (activeTab === "WTD") {
            achieved = Math.round(rawAchieved * 0.23);
          } else if (activeTab === "Custom") {
            achieved = Math.round(rawAchieved * customFactor);
          }

          const balance = target - achieved;
          const pct = target > 0 ? Math.round((achieved / target) * 100) : 0;
          return { sl, name, target, achieved, balance, pct };
        })
      : mockDSRData.map((item) => {
          const defaultTarget = item.target;
          const target = getStoreTarget(item.name, defaultTarget, activeTab, customFactor);
          
          let achieved = item.achieved;
          if (activeTab === "WTD") {
            achieved = Math.round(item.achieved * 0.23);
          } else if (activeTab === "Custom") {
            achieved = Math.round(item.achieved * customFactor);
          }

          const balance = target - achieved;
          const pct = target > 0 ? Math.round((achieved / target) * 100) : 0;
          return { ...item, target, achieved, balance, pct };
        });
    return list;
  }, [branches, weeklyTargets, activeTab, customStartDate, customEndDate]);

  // Generate dynamic Sales Funnel data based on fetched branches (with mock fallback)
  const funnelRows = useMemo(() => {
    if (isAdminOrSuperAdmin) {
      if (branches.length > 0) {
        return branches.map((b, index) => {
          const name = displayBranchName(b.workingBranch);
          const factor = 1 + (index % 5) * 0.15; // Realistic variations
          const billFtd = Math.round(80000 * factor);
          const billWtd = Math.round(480000 * factor);
          const valFtd = Math.round(30 * factor) || 1;
          const valWtd = Math.round(180 * factor) || 1;
          const qtyFtd = Math.round(50 * factor) || 1;
          const qtyWtd = Math.round(300 * factor) || 1;
          const walkFtd = Math.round(70 * factor) || 1;
          const walkWtd = Math.round(420 * factor) || 1;
          const lossFtd = Math.round(20 * factor);
          const lossWtd = Math.round(120 * factor);

          return {
            name,
            storeName: name,
            billFtd,
            billWtd,
            valFtd,
            valWtd,
            qtyFtd,
            qtyWtd,
            walkFtd,
            walkWtd,
            lossFtd,
            lossWtd,
            abvFtd: Math.round(billFtd / valFtd),
            abvWtd: Math.round(billWtd / valWtd),
            absFtd: parseFloat((qtyFtd / valFtd).toFixed(1)),
            absWtd: parseFloat((qtyWtd / valWtd).toFixed(1)),
            convFtd: Math.round((valFtd / walkFtd) * 100),
            convWtd: Math.round((valWtd / walkWtd) * 100),
            arpFtd: Math.round(billFtd / qtyFtd),
            arpWtd: Math.round(billWtd / qtyWtd)
          };
        });
      }
      return mockStoreFunnelRows;
    } else {
      const staffPool = [
        "Amal P", "Anagha Hari", "Rohit H", "Abhiram S Kumar",
        "Sanu Sujanan", "Parvathy", "Jophy", "Abijith",
        "Suresh Kumar", "Deepa Nair", "Arun G", "Rahul Raj",
        "Nithin Mohan", "Anjali S", "Kiran Dev", "Sinu Bose"
      ];

      if (branches.length > 0) {
        const allRows = [];
        branches.forEach((b, bIdx) => {
          const storeName = displayBranchName(b.workingBranch);
          // Generate 5 staff members for each store
          for (let sIdx = 0; sIdx < 5; sIdx++) {
            const staffName = staffPool[(bIdx * 3 + sIdx) % staffPool.length];
            const factor = 0.8 + ((bIdx * 7 + sIdx * 11) % 40) / 100;
            
            const billFtd = Math.round(8000 * factor);
            const billWtd = Math.round(48000 * factor);
            const valFtd = Math.round(3 * factor) || 1;
            const valWtd = Math.round(18 * factor) || 1;
            const qtyFtd = Math.round(5 * factor) || 1;
            const qtyWtd = Math.round(30 * factor) || 1;
            const walkFtd = Math.round(7 * factor) || 1;
            const walkWtd = Math.round(42 * factor) || 1;
            const lossFtd = Math.round(2 * factor);
            const lossWtd = Math.round(12 * factor);

            allRows.push({
              name: staffName,
              storeName,
              billFtd,
              billWtd,
              valFtd,
              valWtd,
              qtyFtd,
              qtyWtd,
              walkFtd,
              walkWtd,
              lossFtd,
              lossWtd,
              abvFtd: Math.round(billFtd / valFtd),
              abvWtd: Math.round(billWtd / valWtd),
              absFtd: parseFloat((qtyFtd / valFtd).toFixed(1)),
              absWtd: parseFloat((qtyWtd / valWtd).toFixed(1)),
              convFtd: Math.round((valFtd / walkFtd) * 100),
              convWtd: Math.round((valWtd / walkWtd) * 100),
              arpFtd: Math.round(billFtd / qtyFtd),
              arpWtd: Math.round(billWtd / qtyWtd)
            });
          }
        });
        return allRows;
      }
      return mockFunnelRows;
    }
  }, [branches, isAdminOrSuperAdmin]);

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
    return overallTarget > 0 ? ((overallAchieved / overallTarget) * 100).toFixed(1) : "0.0";
  }, [overallTarget, overallAchieved]);

  // Dynamic calculations for Sales Funnel totals row
  const totalBillFtd = useMemo(() => filteredFunnelRows.reduce((acc, row) => acc + row.billFtd, 0), [filteredFunnelRows]);
  const totalBillWtd = useMemo(() => filteredFunnelRows.reduce((acc, row) => acc + row.billWtd, 0), [filteredFunnelRows]);
  const totalValFtd = useMemo(() => filteredFunnelRows.reduce((acc, row) => acc + row.valFtd, 0), [filteredFunnelRows]);
  const totalValWtd = useMemo(() => filteredFunnelRows.reduce((acc, row) => acc + row.valWtd, 0), [filteredFunnelRows]);
  const totalQtyFtd = useMemo(() => filteredFunnelRows.reduce((acc, row) => acc + row.qtyFtd, 0), [filteredFunnelRows]);
  const totalQtyWtd = useMemo(() => filteredFunnelRows.reduce((acc, row) => acc + row.qtyWtd, 0), [filteredFunnelRows]);
  const totalWalkFtd = useMemo(() => filteredFunnelRows.reduce((acc, row) => acc + row.walkFtd, 0), [filteredFunnelRows]);
  const totalWalkWtd = useMemo(() => filteredFunnelRows.reduce((acc, row) => acc + row.walkWtd, 0), [filteredFunnelRows]);
  const totalLossFtd = useMemo(() => filteredFunnelRows.reduce((acc, row) => acc + row.lossFtd, 0), [filteredFunnelRows]);
  const totalLossWtd = useMemo(() => filteredFunnelRows.reduce((acc, row) => acc + row.lossWtd, 0), [filteredFunnelRows]);

  const totalAbvFtd = useMemo(() => (totalValFtd > 0 ? Math.round(totalBillFtd / totalValFtd) : 0), [totalBillFtd, totalValFtd]);
  const totalAbvWtd = useMemo(() => (totalValWtd > 0 ? Math.round(totalBillWtd / totalValWtd) : 0), [totalBillWtd, totalValWtd]);

  const totalAbsFtd = useMemo(() => (totalValFtd > 0 ? (totalQtyFtd / totalValFtd).toFixed(1) : "0.0"), [totalQtyFtd, totalValFtd]);
  const totalAbsWtd = useMemo(() => (totalValWtd > 0 ? (totalQtyWtd / totalValWtd).toFixed(1) : "0.0"), [totalQtyWtd, totalValWtd]);

  const totalConvFtd = useMemo(() => (totalWalkFtd > 0 ? Math.round((totalValFtd / totalWalkFtd) * 100) : 0), [totalValFtd, totalWalkFtd]);
  const totalConvWtd = useMemo(() => (totalWalkWtd > 0 ? Math.round((totalValWtd / totalWalkWtd) * 100) : 0), [totalValWtd, totalWalkWtd]);

  const totalArpFtd = useMemo(() => (totalQtyFtd > 0 ? Math.round(totalBillFtd / totalQtyFtd) : 0), [totalBillFtd, totalQtyFtd]);
  const totalArpWtd = useMemo(() => (totalQtyWtd > 0 ? Math.round(totalBillWtd / totalQtyWtd) : 0), [totalBillWtd, totalQtyWtd]);

  // Generate dynamic Category Contribution data based on fetched branches (with mock fallback)
  const categoryRows = useMemo(() => {
    const defaultStores = [
      { name: "G Thrissur" },
      { name: "SG Edappally" },
      { name: "Z Edappally" },
      { name: "G Edappally" },
      { name: "Z Edappal" },
      { name: "Z Perinthalmanna" },
      { name: "Z Kottakkal" },
      { name: "G Kottayam" },
      { name: "G Perumbavoor" }
    ];

    const activeList = branches.length > 0
      ? branches.map((b) => ({ name: displayBranchName(b.workingBranch) }))
      : defaultStores;

    return activeList.map((item, index) => {
      const name = item.name;
      const factor = 1 + (index % 5) * 0.15; // Realistic variations

      // Rental Products values
      const rentalValFtd = Math.round(8000 * factor);
      const rentalValWtd = Math.round(48000 * factor);
      const rentalBillFtd = Math.round(3 * factor) || 1;
      const rentalBillWtd = Math.round(18 * factor) || 1;
      const rentalQtyFtd = Math.round(3 * factor) || 1;
      const rentalQtyWtd = Math.round(18 * factor) || 1;

      // Dappr Squad values
      const squadValFtd = Math.round(8000 * factor * 0.9);
      const squadValWtd = Math.round(48000 * factor * 0.9);
      const squadBillFtd = Math.round(3 * factor) || 1;
      const squadBillWtd = Math.round(18 * factor) || 1;
      const squadQtyFtd = Math.round(3 * factor * 0.9) || 1;
      const squadQtyWtd = Math.round(18 * factor * 0.9) || 1;

      // Sales Products values
      const salesValFtd = Math.round(9000 * factor);
      const salesValWtd = Math.round(54000 * factor);
      const salesBillFtd = Math.round(4 * factor) || 1;
      const salesBillWtd = Math.round(24 * factor) || 1;
      const salesQtyFtd = Math.round(5 * factor) || 1;
      const salesQtyWtd = Math.round(30 * factor) || 1;

      return {
        name,
        rentalValFtd,
        rentalValWtd,
        rentalBillFtd,
        rentalBillWtd,
        rentalQtyFtd,
        rentalQtyWtd,
        squadValFtd,
        squadValWtd,
        squadBillFtd,
        squadBillWtd,
        squadQtyFtd,
        squadQtyWtd,
        salesValFtd,
        salesValWtd,
        salesBillFtd,
        salesBillWtd,
        salesQtyFtd,
        salesQtyWtd
      };
    });
  }, [branches]);

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
      fileName = `Revenue_Vs_Target_${activeTab}_2026.csv`;
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
      fileName = `Sales_Funnel_${activeTab}_2026.csv`;
      const headers = [
        isAdminOrSuperAdmin ? "Store Name" : "Staff Name",
        "Bill (FTD)", "Bill (WTD)",
        "Value (FTD)", "Value (WTD)",
        "Qty (FTD)", "Qty (WTD)",
        "Walk-In (FTD)", "Walk-In (WTD)",
        "Loss (FTD)", "Loss (WTD)",
        "ABV (FTD)", "ABV (WTD)",
        "ABS (FTD)", "ABS (WTD)",
        "Conv % (FTD)", "Conv % (WTD)",
        "ARP (FTD)", "ARP (WTD)"
      ];
      const rows = filteredFunnelRows.map((row) => [
        row.name,
        row.billFtd, row.billWtd,
        row.valFtd, row.valWtd,
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
        totalBillFtd, totalBillWtd,
        totalValFtd, totalValWtd,
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
      fileName = `Category_Contribution_2026.csv`;
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

                    let balColorClass = row.balance < 0 ? "text-[#00A36C]" : "text-gray-900";
                    if (row.pct <= 93) {
                      balColorClass = "text-[#e05a47]";
                    }

                    return (
                      <tr key={row.sl} className="odd:bg-white even:bg-[#f9fafb] hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-3.5 text-center text-gray-400 font-medium">{row.sl}</td>
                        <td className="px-6 py-3.5 font-bold text-gray-800">{row.name}</td>
                        <td className="px-6 py-3.5 text-right font-medium">
                          {formatIndianNumber(row.target)}
                        </td>
                        <td className="px-6 py-3.5 text-right font-bold text-gray-900">
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
              <h2 className="text-[17px] font-bold text-gray-900">Sales Funnel</h2>
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
                    <th className="px-4 py-2 border-r border-gray-600">WTD</th>
                    
                    <th className="px-4 py-2 border-r border-gray-600">FTD</th>
                    <th className="px-4 py-2 border-r border-gray-600">WTD</th>
                    
                    <th className="px-4 py-2 border-r border-gray-600">FTD</th>
                    <th className="px-4 py-2 border-r border-gray-600">WTD</th>

                    <th className="px-4 py-2 border-r border-gray-600">FTD</th>
                    <th className="px-4 py-2 border-r border-gray-600">WTD</th>

                    <th className="px-4 py-2 border-r border-gray-600">FTD</th>
                    <th className="px-4 py-2 border-r border-gray-600">WTD</th>

                    <th className="px-4 py-2 border-r border-gray-600">FTD</th>
                    <th className="px-4 py-2 border-r border-gray-600">WTD</th>

                    <th className="px-4 py-2 border-r border-gray-600">FTD</th>
                    <th className="px-4 py-2 border-r border-gray-600">WTD</th>

                    <th className="px-4 py-2 border-r border-gray-600">FTD</th>
                    <th className="px-4 py-2 border-r border-gray-600">WTD</th>

                    <th className="px-4 py-2 border-r border-gray-600">FTD</th>
                    <th className="px-4 py-2 border-r border-gray-600">WTD</th>

                    <th className="px-4 py-2 border-r border-gray-600">FTD</th>
                    <th className="px-4 py-2">WTD</th>
                  </tr>
                </thead>
                <tbody className="text-xs text-gray-700 divide-y divide-gray-100">
                  {filteredFunnelRows.map((row, idx) => {
                    const contributionFtd = totalBillFtd > 0 ? Math.round((row.billFtd / totalBillFtd) * 100) : 0;
                    const contributionWtd = totalBillWtd > 0 ? Math.round((row.billWtd / totalBillWtd) * 100) : 0;
                    
                    return (
                      <tr key={idx} className="odd:bg-white even:bg-[#f9fafb] hover:bg-gray-50/50 transition-colors">
                        <td className={`sticky left-0 z-10 px-6 py-3.5 text-left font-semibold text-gray-800 border-r border-gray-100 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.15)] ${idx % 2 === 0 ? "bg-white" : "bg-[#f9fafb]"}`}>{row.name}</td>
                        
                        <td className="px-4 py-3.5 border-r border-gray-100">{formatIndianNumber(row.billFtd)}</td>
                        <td className="px-4 py-3.5 border-r border-gray-100 text-gray-700">{formatIndianNumber(row.billWtd)}</td>
                        
                        <td className="px-4 py-3.5 border-r border-gray-100">{row.valFtd}</td>
                        <td className="px-4 py-3.5 border-r border-gray-100 text-gray-700">{row.valWtd}</td>
                        
                        <td className="px-4 py-3.5 border-r border-gray-100">{row.qtyFtd}</td>
                        <td className="px-4 py-3.5 border-r border-gray-100 text-gray-700">{row.qtyWtd}</td>

                        <td className="px-4 py-3.5 border-r border-gray-100">{row.walkFtd}</td>
                        <td className="px-4 py-3.5 border-r border-gray-100 text-gray-700">{row.walkWtd}</td>

                        <td className="px-4 py-3.5 border-r border-gray-100">{row.lossFtd}</td>
                        <td className="px-4 py-3.5 border-r border-gray-100 text-gray-700">{row.lossWtd}</td>

                        <td className="px-4 py-3.5 border-r border-gray-100 font-medium">{formatIndianNumber(row.abvFtd !== undefined ? row.abvFtd : Math.round(row.billFtd / (row.valFtd || 1)))}</td>
                        <td className="px-4 py-3.5 border-r border-gray-100 text-gray-700 font-medium">{formatIndianNumber(row.abvWtd !== undefined ? row.abvWtd : Math.round(row.billWtd / (row.valWtd || 1)))}</td>

                        <td className="px-4 py-3.5 border-r border-gray-100 font-medium">{row.absFtd !== undefined ? row.absFtd : (row.qtyFtd / (row.valFtd || 1)).toFixed(1)}</td>
                        <td className="px-4 py-3.5 border-r border-gray-100 text-gray-700 font-medium">{row.absWtd !== undefined ? row.absWtd : (row.qtyWtd / (row.valWtd || 1)).toFixed(1)}</td>

                        <td className="px-4 py-3.5 border-r border-gray-100 font-medium">{row.convFtd !== undefined ? row.convFtd : Math.round(((row.valFtd || 0) / (row.walkFtd || 1)) * 100)}%</td>
                        <td className="px-4 py-3.5 border-r border-gray-100 text-gray-700 font-medium">{row.convWtd !== undefined ? row.convWtd : Math.round(((row.valWtd || 0) / (row.walkWtd || 1)) * 100)}%</td>

                        <td className="px-4 py-3.5 border-r border-gray-100 font-semibold text-[#00A36C]">{row.contrFtd !== undefined ? row.contrFtd : contributionFtd}%</td>
                        <td className="px-4 py-3.5 border-r border-gray-100 text-gray-700 font-semibold text-[#00A36C]">{row.contrWtd !== undefined ? row.contrWtd : contributionWtd}%</td>

                        <td className="px-4 py-3.5 border-r border-gray-100 font-medium">{formatIndianNumber(row.arpFtd !== undefined ? row.arpFtd : Math.round(row.billFtd / (row.qtyFtd || 1)))}</td>
                        <td className="px-4 py-3.5 text-gray-700 font-medium">{formatIndianNumber(row.arpWtd !== undefined ? row.arpWtd : Math.round(row.billWtd / (row.qtyWtd || 1)))}</td>
                      </tr>
                    );
                  })}

                  {/* STORE TOTAL row */}
                  <tr className="bg-[#dce9f5] font-bold text-gray-900">
                    <td className="sticky left-0 z-10 bg-[#dce9f5] px-6 py-3.5 text-left border-r border-blue-200/50 uppercase tracking-wider shadow-[2px_0_5px_-2px_rgba(0,0,0,0.15)]">Store Total</td>
                    
                    <td className="px-4 py-3.5 border-r border-blue-200/50">{formatIndianNumber(totalBillFtd)}</td>
                    <td className="px-4 py-3.5 border-r border-blue-200/50">{formatIndianNumber(totalBillWtd)}</td>
                    
                    <td className="px-4 py-3.5 border-r border-blue-200/50">{formatIndianNumber(totalValFtd)}</td>
                    <td className="px-4 py-3.5 border-r border-blue-200/50">{formatIndianNumber(totalValWtd)}</td>
                    
                    <td className="px-4 py-3.5 border-r border-blue-200/50">{formatIndianNumber(totalQtyFtd)}</td>
                    <td className="px-4 py-3.5 border-r border-blue-200/50">{formatIndianNumber(totalQtyWtd)}</td>

                    <td className="px-4 py-3.5 border-r border-blue-200/50">{formatIndianNumber(totalWalkFtd)}</td>
                    <td className="px-4 py-3.5 border-r border-blue-200/50">{formatIndianNumber(totalWalkWtd)}</td>

                    <td className="px-4 py-3.5 border-r border-blue-200/50">{formatIndianNumber(totalLossFtd)}</td>
                    <td className="px-4 py-3.5 border-r border-blue-200/50">{formatIndianNumber(totalLossWtd)}</td>

                    {/* ABV */}
                    <td className="px-4 py-3.5 border-r border-blue-200/50">{formatIndianNumber(totalAbvFtd)}</td>
                    <td className="px-4 py-3.5 border-r border-blue-200/50">{formatIndianNumber(totalAbvWtd)}</td>

                    {/* ABS */}
                    <td className="px-4 py-3.5 border-r border-blue-200/50">{totalAbsFtd}</td>
                    <td className="px-4 py-3.5 border-r border-blue-200/50">{totalAbsWtd}</td>

                    {/* Conversion */}
                    <td className="px-4 py-3.5 border-r border-blue-200/50">{totalConvFtd}%</td>
                    <td className="px-4 py-3.5 border-r border-blue-200/50">{totalConvWtd}%</td>

                    {/* Contribution */}
                    <td className="px-4 py-3.5 border-r border-blue-200/50">85%</td>
                    <td className="px-4 py-3.5 border-r border-blue-200/50">93%</td>

                    {/* ARP */}
                    <td className="px-4 py-3.5 border-r border-blue-200/50">{formatIndianNumber(totalArpFtd)}</td>
                    <td className="px-4 py-3.5">{formatIndianNumber(totalArpWtd)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {selectedReport === "Category Contribution" && (
          <div className="bg-white rounded-[20px] shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-5 flex justify-between items-center">
              <h2 className="text-[17px] font-bold text-gray-900">Category Contribution</h2>
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
                    <th className="px-4 py-1.5 border-r border-gray-200/50 text-center">WTD</th>
                    <th className="px-4 py-1.5 border-r border-gray-200/50 text-center">FTD</th>
                    <th className="px-4 py-1.5 border-r border-gray-200/50 text-center">WTD</th>
                    <th className="px-4 py-1.5 border-r border-gray-200/50 text-center">FTD</th>
                    <th className="px-4 py-1.5 text-center">WTD</th>
                    
                    <th className="px-4 py-1.5 border-r border-gray-200/50 text-center">FTD</th>
                    <th className="px-4 py-1.5 border-r border-gray-200/50 text-center">WTD</th>
                    <th className="px-4 py-1.5 border-r border-gray-200/50 text-center">FTD</th>
                    <th className="px-4 py-1.5 border-r border-gray-200/50 text-center">WTD</th>
                    <th className="px-4 py-1.5 border-r border-gray-200/50 text-center">FTD</th>
                    <th className="px-4 py-1.5 text-center">WTD</th>

                    <th className="px-4 py-1.5 border-r border-gray-200/50 text-center">FTD</th>
                    <th className="px-4 py-1.5 border-r border-gray-200/50 text-center">WTD</th>
                    <th className="px-4 py-1.5 border-r border-gray-200/50 text-center">FTD</th>
                    <th className="px-4 py-1.5 border-r border-gray-200/50 text-center">WTD</th>
                    <th className="px-4 py-1.5 border-r border-gray-200/50 text-center">FTD</th>
                    <th className="px-4 py-1.5 text-center">WTD</th>
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
                      <td className="px-4 py-3.5 border-r border-gray-100 font-medium">{formatIndianNumber(row.rentalValFtd)}</td>
                      <td className="px-4 py-3.5 border-r border-gray-100 text-gray-700 font-medium">{formatIndianNumber(row.rentalValWtd)}</td>
                      
                      <td className="px-4 py-3.5 border-r border-gray-100">{row.rentalBillFtd}</td>
                      <td className="px-4 py-3.5 border-r border-gray-100 text-gray-700">{row.rentalBillWtd}</td>
                      
                      <td className="px-4 py-3.5 border-r border-gray-100">{row.rentalQtyFtd}</td>
                      <td className="px-4 py-3.5 text-gray-700">{row.rentalQtyWtd}</td>
                      
                      {/* Spacer cell */}
                      <td className="w-2 bg-white border-none"></td>
                      
                      {/* Dappr Squad Cells */}
                      <td className="px-4 py-3.5 border-r border-gray-100 font-medium">{formatIndianNumber(row.squadValFtd)}</td>
                      <td className="px-4 py-3.5 border-r border-gray-100 text-gray-700 font-medium">{formatIndianNumber(row.squadValWtd)}</td>
                      
                      <td className="px-4 py-3.5 border-r border-gray-100">{row.squadBillFtd}</td>
                      <td className="px-4 py-3.5 border-r border-gray-100 text-gray-700">{row.squadBillWtd}</td>

                      <td className="px-4 py-3.5 border-r border-gray-100">{row.squadQtyFtd}</td>
                      <td className="px-4 py-3.5 text-gray-700">{row.squadQtyWtd}</td>

                      {/* Spacer cell */}
                      <td className="w-2 bg-white border-none"></td>

                      {/* Sales Products Cells */}
                      <td className="px-4 py-3.5 border-r border-gray-100 font-medium">{formatIndianNumber(row.salesValFtd)}</td>
                      <td className="px-4 py-3.5 border-r border-gray-100 text-gray-700 font-medium">{formatIndianNumber(row.salesValWtd)}</td>
                      
                      <td className="px-4 py-3.5 border-r border-gray-100">{row.salesBillFtd}</td>
                      <td className="px-4 py-3.5 border-r border-gray-100 text-gray-700">{row.salesBillWtd}</td>
                      
                      <td className="px-4 py-3.5 border-r border-gray-100">{row.salesQtyFtd}</td>
                      <td className="px-4 py-3.5 text-gray-700">{row.salesQtyWtd}</td>
                    </tr>
                  ))}

                  {/* STORE TOTAL row */}
                  <tr className="bg-[#dce9f5] font-bold text-gray-900">
                    <td className="sticky left-0 z-10 bg-[#dce9f5] px-6 py-3.5 text-left border-r border-blue-200/50 uppercase tracking-wider shadow-[2px_0_5px_-2px_rgba(0,0,0,0.15)] border-none">Store Total</td>
                    {/* Spacer cell */}
                    <td className="w-2 bg-white border-none"></td>
                    
                    {/* Rental Products Totals */}
                    <td className="px-4 py-3.5 border-r border-blue-200/50">{formatIndianNumber(totalRentalValFtd)}</td>
                    <td className="px-4 py-3.5 border-r border-blue-200/50">{formatIndianNumber(totalRentalValWtd)}</td>
                    
                    <td className="px-4 py-3.5 border-r border-blue-200/50">{formatIndianNumber(totalRentalBillFtd)}</td>
                    <td className="px-4 py-3.5 border-r border-blue-200/50">{formatIndianNumber(totalRentalBillWtd)}</td>
                    
                    <td className="px-4 py-3.5 border-r border-blue-200/50">{formatIndianNumber(totalRentalQtyFtd)}</td>
                    <td className="px-4 py-3.5">{formatIndianNumber(totalRentalQtyWtd)}</td>
                    
                    {/* Spacer cell */}
                    <td className="w-2 bg-white border-none"></td>
                    
                    {/* Dappr Squad Totals */}
                    <td className="px-4 py-3.5 border-r border-blue-200/50">{formatIndianNumber(totalSquadValFtd)}</td>
                    <td className="px-4 py-3.5 border-r border-blue-200/50">{formatIndianNumber(totalSquadValWtd)}</td>
                    
                    <td className="px-4 py-3.5 border-r border-blue-200/50">{formatIndianNumber(totalSquadBillFtd)}</td>
                    <td className="px-4 py-3.5 border-r border-blue-200/50">{formatIndianNumber(totalSquadBillWtd)}</td>

                    <td className="px-4 py-3.5 border-r border-blue-200/50">{formatIndianNumber(totalSquadQtyFtd)}</td>
                    <td className="px-4 py-3.5">{formatIndianNumber(totalSquadQtyWtd)}</td>

                    {/* Spacer cell */}
                    <td className="w-2 bg-white border-none"></td>

                    {/* Sales Products Totals */}
                    <td className="px-4 py-3.5 border-r border-blue-200/50">{formatIndianNumber(totalSalesValFtd)}</td>
                    <td className="px-4 py-3.5 border-r border-blue-200/50">{formatIndianNumber(totalSalesValWtd)}</td>
                    
                    <td className="px-4 py-3.5 border-r border-blue-200/50">{formatIndianNumber(totalSalesBillFtd)}</td>
                    <td className="px-4 py-3.5 border-r border-blue-200/50">{formatIndianNumber(totalSalesBillWtd)}</td>
                    
                    <td className="px-4 py-3.5 border-r border-blue-200/50">{formatIndianNumber(totalSalesQtyFtd)}</td>
                    <td className="px-4 py-3.5">{formatIndianNumber(totalSalesQtyWtd)}</td>
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
                  { id: 1, label: "Week 1*", val: week1Dates, setVal: setWeek1Dates },
                  { id: 2, label: "Week 2*", val: week2Dates, setVal: setWeek2Dates },
                  { id: 3, label: "Week 3*", val: week3Dates, setVal: setWeek3Dates },
                  { id: 4, label: "Week 4*", val: week4Dates, setVal: setWeek4Dates }
                ].map((w) => {
                  const isActive = activeWeek === w.id;
                  return (
                    <div key={w.id} className="relative flex flex-col">
                      <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">{w.label}</label>
                      <div 
                        onClick={() => handleWeekCardClick(w.id, w.val)}
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
                      {calendarOpenForWeek === w.id && (
                        <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200/80 rounded-2xl shadow-xl z-30 p-4 w-[260px] select-none text-left">
                          <div className="text-center font-bold text-xs text-gray-800 mb-3 flex justify-between items-center px-1 border-b border-gray-100 pb-2">
                            <span>{modalMonth || "June"} 2026 Picker</span>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setCalendarOpenForWeek(null);
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
                                {Array.from({ length: getDaysCountInMonth(modalMonth || "June") }, (_, i) => i + 1).map((d) => {
                                  const isSelected = weekStartDays[w.id] === d;
                                  return (
                                    <button
                                      key={`start-${d}`}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleScrollPickerChange(w.id, d, weekEndDays[w.id], w.setVal);
                                      }}
                                      className={`py-1.5 text-xs font-semibold rounded-lg transition-colors text-center ${
                                        isSelected 
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
                                {Array.from({ length: getDaysCountInMonth(modalMonth || "June") }, (_, i) => i + 1).map((d) => {
                                  const isSelected = weekEndDays[w.id] === d;
                                  const isDisabled = weekStartDays[w.id] !== null && d < weekStartDays[w.id];
                                  return (
                                    <button
                                      key={`end-${d}`}
                                      disabled={isDisabled}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleScrollPickerChange(w.id, weekStartDays[w.id], d, w.setVal);
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

              {/* Target Field */}
              <div className="mb-6">
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Target*</label>
                <input 
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
                    const currentVal = dsrData.find(d => d.name === modalStore);
                    if (currentVal) {
                      setModalTarget(currentVal.target.toString());
                    }
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
                    if (!modalTarget) {
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

      </div>
    </div>
  );
};

export default DSRReport;
