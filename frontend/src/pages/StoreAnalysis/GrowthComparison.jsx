import React, { useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import SideNav from "../../components/SideNav/SideNav";
import ModileNav from "../../components/SideNav/ModileNav";
import { FiSearch, FiDownload } from "react-icons/fi";
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

// Local date string formatting (YYYY-MM-DD) avoiding timezone shift errors
const getLocalDateString = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Date Range Helpers for TY/LY (This Year / Last Year)
const getWTDDateRange = (targetYear) => {
  const today = new Date();
  const dayOfWeek = today.getDay(); 
  const monday = new Date(today);
  const distance = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  monday.setDate(today.getDate() + distance);

  const start = new Date(monday);
  start.setFullYear(targetYear);
  const end = new Date(today);
  end.setFullYear(targetYear);

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

const GrowthComparison = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("MTD");
  const [branches, setBranches] = useState([]);
  const [tyWalkins, setTyWalkins] = useState([]);
  const [lyWalkins, setLyWalkins] = useState([]);
  const [loading, setLoading] = useState(false);

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

  // Fetch Year-Over-Year Walk-Ins based on selected activeTab
  useEffect(() => {
    const fetchYoYWalkins = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        
        // Define ranges for TY (2026) and LY (2025)
        let tyStart, tyEnd, lyStart, lyEnd;
        if (activeTab === "WTD") {
          const tyRange = getWTDDateRange(2026);
          const lyRange = getWTDDateRange(2025);
          tyStart = tyRange.start;
          tyEnd = tyRange.end;
          lyStart = lyRange.start;
          lyEnd = lyRange.end;
        } else {
          const tyRange = getMTDDateRange(2026);
          const lyRange = getMTDDateRange(2025);
          tyStart = tyRange.start;
          tyEnd = tyRange.end;
          lyStart = lyRange.start;
          lyEnd = lyRange.end;
        }

        // Fetch TY walkins
        const resTy = await fetch(`${baseUrl.baseUrl}api/walkin/list?startDate=${tyStart}&endDate=${tyEnd}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        let tyList = [];
        if (resTy.ok) {
          const jsonTy = await resTy.json();
          tyList = Array.isArray(jsonTy?.data) ? jsonTy.data : [];
        }

        // Fetch LY walkins
        const resLy = await fetch(`${baseUrl.baseUrl}api/walkin/list?startDate=${lyStart}&endDate=${lyEnd}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        let lyList = [];
        if (resLy.ok) {
          const jsonLy = await resLy.json();
          lyList = Array.isArray(jsonLy?.data) ? jsonLy.data : [];
        }

        setTyWalkins(tyList);
        setLyWalkins(lyList);
      } catch (err) {
        console.error("Error fetching YoY walkins for comparison:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchYoYWalkins();
  }, [activeTab]);

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
    const scaleFactor = activeTab === "WTD" ? 0.23 : 1.0;
    
    const activeList = branches.length > 0
      ? branches.map((b, index) => {
          const name = displayBranchName(b.workingBranch);
          const storeKeyVal = locationKey(b.workingBranch);
          
          const tyWalk = tyWalkins.filter(w => locationKey(w.store) === storeKeyVal).length;
          const lyWalk = lyWalkins.filter(w => locationKey(w.store) === storeKeyVal).length;
          
          const factor = 1 + (index % 5) * 0.15;
          const tyVal = Math.round(850000 * factor * scaleFactor);
          const lyVal = Math.round(820000 * factor * scaleFactor);
          const tyBill = Math.round(190 * factor * scaleFactor);
          const lyBill = Math.round(180 * factor * scaleFactor);
          const tyQty = Math.round(350 * factor * scaleFactor);
          const lyQty = Math.round(330 * factor * scaleFactor);

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
        })
      : mockComparisonRows.map((row) => {
          const storeKeyVal = locationKey(row.name);
          const tyWalk = tyWalkins.filter(w => locationKey(w.store) === storeKeyVal).length;
          const lyWalk = lyWalkins.filter(w => locationKey(w.store) === storeKeyVal).length;

          const tyVal = Math.round(row.tyVal * scaleFactor);
          const lyVal = Math.round(row.lyVal * scaleFactor);
          const tyBill = Math.round(row.tyBill * scaleFactor);
          const lyBill = Math.round(row.lyBill * scaleFactor);
          const tyQty = Math.round(row.tyQty * scaleFactor);
          const lyQty = Math.round(row.lyQty * scaleFactor);

          return {
            ...row,
            tyVal,
            lyVal,
            tyBill,
            lyBill,
            tyQty,
            lyQty,
            tyWalk: tyWalkins.length > 0 ? tyWalk : Math.round(row.tyWalk * scaleFactor),
            lyWalk: lyWalkins.length > 0 ? lyWalk : Math.round(row.lyWalk * scaleFactor)
          };
        });

    return activeList.filter((row) =>
      row.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [branches, tyWalkins, lyWalkins, searchQuery, activeTab]);

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
    const scaleLabel = activeTab === "MTD" ? "MTD" : "WTD";
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

          <div className="flex items-center gap-3">
            {/* MTD / WTD switcher */}
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
        <div className="bg-white rounded-[20px] shadow-sm border border-gray-100 overflow-hidden">
          
          {/* Data Table */}
          <div className="overflow-x-auto w-full">
            <table className="w-full text-center border-collapse">
              <thead>
                {/* Primary header row */}
                <tr className="bg-[#2e2e2e] text-white text-[11px] font-bold tracking-wider uppercase border-b border-gray-600">
                  <th rowSpan={2} className="sticky left-0 z-20 bg-[#2e2e2e] px-6 py-4 text-left border-r border-gray-600 w-60 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.3)]">Store Name</th>
                  <th colSpan={3} className="px-6 py-2 border-r border-gray-600 text-center">Value</th>
                  <th colSpan={3} className="px-6 py-2 border-r border-gray-600 text-center">Bill</th>
                  <th colSpan={3} className="px-6 py-2 border-r border-gray-600 text-center">Quantity</th>
                  <th colSpan={3} className="px-6 py-2 text-center">Walk In</th>
                </tr>
                {/* Secondary header row */}
                <tr className="bg-[#2e2e2e] text-white text-[10px] font-bold tracking-wider uppercase">
                  {/* Value */}
                  <th className="px-4 py-2 border-r border-gray-600">{activeTab === "MTD" ? "TY MTD" : "TY WTD"}</th>
                  <th className="px-4 py-2 border-r border-gray-600">{activeTab === "MTD" ? "LY MTD" : "LY WTD"}</th>
                  <th className="px-4 py-2 border-r border-gray-600">L2L</th>
                  
                  {/* Bill */}
                  <th className="px-4 py-2 border-r border-gray-600">{activeTab === "MTD" ? "TY MTD" : "TY WTD"}</th>
                  <th className="px-4 py-2 border-r border-gray-600">{activeTab === "MTD" ? "LY MTD" : "LY WTD"}</th>
                  <th className="px-4 py-2 border-r border-gray-600">L2L</th>
                  
                  {/* Quantity */}
                  <th className="px-4 py-2 border-r border-gray-600">{activeTab === "MTD" ? "TY MTD" : "TY WTD"}</th>
                  <th className="px-4 py-2 border-r border-gray-600">{activeTab === "MTD" ? "LY MTD" : "LY WTD"}</th>
                  <th className="px-4 py-2 border-r border-gray-600">L2L</th>

                  {/* Walk In */}
                  <th className="px-4 py-2 border-r border-gray-600">{activeTab === "MTD" ? "TY MTD" : "TY WTD"}</th>
                  <th className="px-4 py-2 border-r border-gray-600">{activeTab === "MTD" ? "LY MTD" : "LY WTD"}</th>
                  <th className="px-4 py-2">L2L</th>
                </tr>
              </thead>
              <tbody className="text-xs text-gray-700 divide-y divide-gray-100">
                {filteredRows.map((row, idx) => {
                  const calculatedL2lVal = row.tyVal - row.lyVal;
                  const calculatedL2lBill = row.tyBill - row.lyBill;
                  const calculatedL2lQty = row.tyQty - row.lyQty;
                  const calculatedL2lWalk = row.tyWalk - row.lyWalk;

                  const valL2lColor = calculatedL2lVal >= 0 ? "text-[#00A36C] font-semibold" : "text-[#e05a47] font-semibold";
                  const billL2lColor = calculatedL2lBill >= 0 ? "text-[#00A36C] font-semibold" : "text-[#e05a47] font-semibold";
                  const qtyL2lColor = calculatedL2lQty >= 0 ? "text-[#00A36C] font-semibold" : "text-[#e05a47] font-semibold";
                  const walkL2lColor = calculatedL2lWalk >= 0 ? "text-[#00A36C] font-semibold" : "text-[#e05a47] font-semibold";

                  return (
                    <tr key={idx} className="odd:bg-white even:bg-[#f9fafb] hover:bg-gray-50/50 transition-colors">
                      <td className={`sticky left-0 z-10 px-6 py-3.5 text-left font-bold text-gray-800 border-r border-gray-100 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.15)] ${idx % 2 === 0 ? "bg-white" : "bg-[#f9fafb]"}`}>{row.name}</td>
                      
                      <td className="px-4 py-3.5 font-medium border-r border-gray-100">{formatIndianNumber(row.tyVal)}</td>
                      <td className="px-4 py-3.5 font-medium border-r border-gray-100 text-gray-500">{formatIndianNumber(row.lyVal)}</td>
                      <td className={`px-4 py-3.5 border-r border-gray-100 ${valL2lColor}`}>{formatIndianNumber(calculatedL2lVal)}</td>
                      
                      <td className="px-4 py-3.5 font-medium border-r border-gray-100">{row.tyBill}</td>
                      <td className="px-4 py-3.5 font-medium border-r border-gray-100 text-gray-500">{row.lyBill}</td>
                      <td className={`px-4 py-3.5 border-r border-gray-100 ${billL2lColor}`}>{calculatedL2lBill > 0 ? `+${calculatedL2lBill}` : calculatedL2lBill}</td>
                      
                      <td className="px-4 py-3.5 font-medium border-r border-gray-100">{row.tyQty}</td>
                      <td className="px-4 py-3.5 font-medium border-r border-gray-100 text-gray-500">{row.lyQty}</td>
                      <td className={`px-4 py-3.5 border-r border-gray-100 ${qtyL2lColor}`}>{calculatedL2lQty > 0 ? `+${calculatedL2lQty}` : calculatedL2lQty}</td>

                      <td className="px-4 py-3.5 font-medium border-r border-gray-100">{formatIndianNumber(row.tyWalk)}</td>
                      <td className="px-4 py-3.5 font-medium border-r border-gray-100 text-gray-500">{formatIndianNumber(row.lyWalk)}</td>
                      <td className={`px-4 py-3.5 ${walkL2lColor}`}>{calculatedL2lWalk > 0 ? `+${calculatedL2lWalk}` : calculatedL2lWalk}</td>
                    </tr>
                  );
                })}

                {/* STORE TOTAL row */}
                <tr className="bg-[#dce9f5] font-bold text-gray-900">
                  <td className="sticky left-0 z-10 bg-[#dce9f5] px-6 py-3.5 text-left border-r border-blue-200/50 uppercase tracking-wider shadow-[2px_0_5px_-2px_rgba(0,0,0,0.15)]">Store Total</td>
                  
                  <td className="px-4 py-3.5 border-r border-blue-200/50">{formatIndianNumber(totalTyVal)}</td>
                  <td className="px-4 py-3.5 border-r border-blue-200/50 text-gray-600">{formatIndianNumber(totalLyVal)}</td>
                  <td className={`px-4 py-3.5 border-r border-blue-200/50 ${totalL2lVal >= 0 ? 'text-[#00A36C]' : 'text-[#e05a47]'}`}>{formatIndianNumber(totalL2lVal)}</td>
                  
                  <td className="px-4 py-3.5 border-r border-blue-200/50">{formatIndianNumber(totalTyBill)}</td>
                  <td className="px-4 py-3.5 border-r border-blue-200/50 text-gray-600">{formatIndianNumber(totalLyBill)}</td>
                  <td className={`px-4 py-3.5 border-r border-blue-200/50 ${totalL2lBill >= 0 ? 'text-[#00A36C]' : 'text-[#e05a47]'}`}>{totalL2lBill > 0 ? `+${totalL2lBill}` : totalL2lBill}</td>
                  
                  <td className="px-4 py-3.5 border-r border-blue-200/50">{formatIndianNumber(totalTyQty)}</td>
                  <td className="px-4 py-3.5 border-r border-blue-200/50 text-gray-600">{formatIndianNumber(totalLyQty)}</td>
                  <td className={`px-4 py-3.5 border-r border-blue-200/50 ${totalL2lQty >= 0 ? 'text-[#00A36C]' : 'text-[#e05a47]'}`}>{totalL2lQty > 0 ? `+${totalL2lQty}` : totalL2lQty}</td>

                  <td className="px-4 py-3.5 border-r border-blue-200/50">{formatIndianNumber(totalTyWalk)}</td>
                  <td className="px-4 py-3.5 border-r border-blue-200/50 text-gray-600">{formatIndianNumber(totalLyWalk)}</td>
                  <td className={`px-4 py-3.5 ${totalL2lWalk >= 0 ? 'text-[#00A36C]' : 'text-[#e05a47]'}`}>{totalL2lWalk > 0 ? `+${totalL2lWalk}` : totalL2lWalk}</td>
                </tr>
              </tbody>
            </table>
          </div>

        </div>

      </div>
    </div>
  );
};

export default GrowthComparison;
