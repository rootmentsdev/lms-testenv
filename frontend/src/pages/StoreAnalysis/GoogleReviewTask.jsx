import React, { useState, useEffect, useMemo } from "react";
import SideNav from "../../components/SideNav/SideNav";
import ModileNav from "../../components/SideNav/ModileNav";
import baseUrl from "../../api/api";
import { FiPlus, FiChevronDown, FiX, FiArrowLeft } from "react-icons/fi";

function norm(str) {
  if (!str) return "";
  return String(str).toLowerCase().trim().replace(/\s+/g, " ");
}

function isHiddenBranch(name) {
  const normalized = norm(name);
  const nonSalesBranches = ["office", "production", "warehouse"];
  if (nonSalesBranches.includes(normalized)) return true;
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

const parseStoreBrandAndName = (workingBranch) => {
  if (!workingBranch) return { displayName: "Unknown", brand: "General" };
  const raw = String(workingBranch).trim();
  const lower = raw.toLowerCase();
  
  let brand = "Zorucci";
  if (lower.startsWith("g-") || lower.startsWith("g.") || lower.startsWith("g ")) {
    brand = "Grooms";
  } else if (lower.startsWith("sg-") || lower.startsWith("sg.") || lower.startsWith("sg ")) {
    brand = "Suitor Guy";
  }
  
  let displayName = raw
    .replace(/^(z-|z\.|z\s+|g-|g\.|g\s+|sg-|sg\.|sg\s+)/i, "")
    .trim();
    
  if (displayName) {
    displayName = displayName.charAt(0).toUpperCase() + displayName.slice(1);
  }
  
  return { displayName, brand };
};

const GoogleReviewTask = () => {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [storeFilter, setStoreFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("Today"); // Today, This Week, This Month
  const [showAddModal, setShowAddModal] = useState(false);
  const [openedFromRow, setOpenedFromRow] = useState(false);
  
  // Modal form states
  const [selectedModalStore, setSelectedModalStore] = useState("");
  const [totalRatingsInput, setTotalRatingsInput] = useState("");

  // Loaded counts state mapped by workingBranch name
  const [reviewsState, setReviewsState] = useState({});
  const [loadingReviews, setLoadingReviews] = useState(true);

  // Fetch real dashboard data from backend
  const fetchDashboard = async () => {
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
          setReviewsState(json.data);
        }
      }
    } catch (err) {
      console.error("Error fetching Google Reviews dashboard:", err);
    } finally {
      setLoadingReviews(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  // Fetch branches
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
          if (visible.length > 0) {
            setSelectedModalStore(visible[0].workingBranch);
          }
        }
      } catch (err) {
        console.error("Error fetching branches:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBranches();
  }, []);

  // Merge dynamic branches with reviews counts state (mock data removed, defaults to 0)
  const tableRows = useMemo(() => {
    return branches.map((b) => {
      const { displayName, brand } = parseStoreBrandAndName(b.workingBranch);
      const saved = reviewsState[b.workingBranch] || {};
      
      return {
        id: b._id,
        workingBranch: b.workingBranch,
        displayName,
        brand,
        today: saved.today !== undefined ? saved.today : 0,
        thisWeek: saved.thisWeek !== undefined ? saved.thisWeek : 0,
        thisMonth: saved.thisMonth !== undefined ? saved.thisMonth : 0,
        total: saved.total !== undefined ? saved.total : 0,
      };
    });
  }, [branches, reviewsState]);

  // Filter and sort rows
  const processedRows = useMemo(() => {
    let list = [...tableRows];
    
    // 1. Store Filter
    if (storeFilter !== "All") {
      list = list.filter(r => r.workingBranch === storeFilter);
    }
    
    // 2. Sort depending on active Date Filter
    if (dateFilter === "Today") {
      list.sort((a, b) => b.today - a.today);
    } else if (dateFilter === "This Week") {
      list.sort((a, b) => b.thisWeek - a.thisWeek);
    } else if (dateFilter === "This Month") {
      list.sort((a, b) => b.thisMonth - a.thisMonth);
    }
    
    return list;
  }, [tableRows, storeFilter, dateFilter]);

  // Stores with ratings today metric (count stores where today > 0)
  const storesWithRatingsToday = useMemo(() => {
    return tableRows.filter(r => r.today > 0).length;
  }, [tableRows]);

  const handleRowClick = (branchName) => {
    setSelectedModalStore(branchName);
    const current = reviewsState[branchName] || {};
    setTotalRatingsInput(current.today > 0 ? String(current.today) : "");
    setOpenedFromRow(true);
    setShowAddModal(true);
  };

  const handleAddBtnClick = () => {
    if (branches.length > 0) {
      setSelectedModalStore(branches[0].workingBranch);
    }
    setTotalRatingsInput("");
    setOpenedFromRow(false);
    setShowAddModal(true);
  };

  const handleSaveReview = async (e) => {
    e.preventDefault();
    if (!selectedModalStore) return;

    const count = parseInt(totalRatingsInput, 10);
    if (isNaN(count) || count < 0) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${baseUrl.baseUrl}api/google-reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ branchName: selectedModalStore, count }),
      });

      if (res.ok) {
        // Refresh dashboard counts from backend
        await fetchDashboard();
      }
    } catch (err) {
      console.error("Error saving Google Review:", err);
    }

    setTotalRatingsInput("");
    setShowAddModal(false);
  };

  return (
    <div className="flex w-full min-h-screen bg-[#f9fafb] text-gray-800" style={{ fontFamily: "DM Sans, sans-serif" }}>
      <SideNav />
      <div className="md:hidden">
        <ModileNav />
      </div>

      <div className="flex-1 md:ml-[110px] min-h-screen p-4 sm:p-6 lg:p-8 mb-[70px] md:mb-0">
        
        {/* White Dashboard container */}
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-6 sm:p-8 max-w-[1400px] mx-auto mt-2">
          
          {/* Top Row: Title and Action Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 leading-tight">Review Dashboard</h1>
              <p className="text-gray-500 text-xs sm:text-sm mt-1">Monitor and manage customer feedback across all Stores.</p>
            </div>
            <button
              onClick={handleAddBtnClick}
              className="flex items-center justify-center gap-2 bg-[#17171f] hover:bg-black text-white text-xs sm:text-sm font-semibold py-2.5 px-4 rounded-xl shadow-sm transition-all self-start sm:self-center"
            >
              <FiPlus size={16} />
              Add New Review
            </button>
          </div>

          {/* Filters Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pt-2 border-t border-gray-100">
            <div className="flex flex-wrap items-center gap-3">
              {/* Store Filter Selector */}
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-semibold">Store :</span>
                <select
                  value={storeFilter}
                  onChange={(e) => setStoreFilter(e.target.value)}
                  className="pl-14 pr-8 py-2 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm font-bold text-gray-700 shadow-sm focus:outline-none focus:border-gray-400 appearance-none min-w-[130px] cursor-pointer"
                >
                  <option value="All">All</option>
                  {branches.map(b => (
                    <option key={b._id} value={b.workingBranch}>
                      {parseStoreBrandAndName(b.workingBranch).displayName}
                    </option>
                  ))}
                </select>
                <FiChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={14} />
              </div>

              {/* Date Filter Selector */}
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-semibold">Date :</span>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="pl-13 pr-8 py-2 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm font-bold text-gray-700 shadow-sm focus:outline-none focus:border-gray-400 appearance-none min-w-[120px] cursor-pointer"
                >
                  <option value="Today">Today</option>
                  <option value="This Week">This Week</option>
                  <option value="This Month">This Month</option>
                </select>
                <FiChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={14} />
              </div>
            </div>

            {/* Dynamic Metric */}
            <div className="text-right">
              <span className="text-gray-400 text-xs font-semibold">Stores with Ratings {dateFilter === "Today" ? "Today" : (dateFilter === "This Week" ? "This Week" : "This Month")}</span>
              <p className="text-gray-900 text-lg sm:text-xl font-bold mt-0.5">
                {dateFilter === "Today" ? storesWithRatingsToday : (dateFilter === "This Week" ? tableRows.filter(r => r.thisWeek > 0).length : tableRows.filter(r => r.thisMonth > 0).length)}
                <span className="text-gray-400 font-medium text-xs sm:text-sm"> /{tableRows.length}</span>
              </p>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
            <table className="w-full text-left border-collapse bg-white">
              <thead>
                <tr className="bg-[#f3f4f6] text-gray-500 text-[11px] font-bold uppercase tracking-wider border-b border-gray-200">
                  <th className="px-6 py-4 font-semibold">Store</th>
                  <th className="px-6 py-4 font-semibold text-center">Today</th>
                  <th className="px-6 py-4 font-semibold text-center">This Week</th>
                  <th className="px-6 py-4 font-semibold text-center">This Month</th>
                  <th className="px-6 py-4 font-semibold text-center">Total Count</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs sm:text-sm text-gray-700">
                {loading || loadingReviews ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-400">Loading stores...</td>
                  </tr>
                ) : processedRows.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-400">No stores found matching the filters.</td>
                  </tr>
                ) : (
                  processedRows.map((row) => (
                    <tr 
                      key={row.id} 
                      onClick={() => handleRowClick(row.workingBranch)}
                      className="hover:bg-gray-50/50 transition-colors cursor-pointer border-l-2 border-l-transparent hover:border-l-blue-500"
                      title="Click to edit rating counts"
                    >
                      {/* Store Details */}
                      <td className="px-6 py-4 border-r border-gray-100">
                        <p className="font-bold text-gray-900 text-xs sm:text-sm">{row.displayName}</p>
                        <p className="text-[10px] sm:text-xs text-gray-400 font-semibold mt-0.5">{row.brand}</p>
                      </td>
                      
                      {/* Counts columns */}
                      <td className="px-6 py-4 text-center font-semibold text-gray-900 border-r border-gray-100">{row.today}</td>
                      <td className="px-6 py-4 text-center font-semibold text-gray-900 border-r border-gray-100">{row.thisWeek}</td>
                      <td className="px-6 py-4 text-center font-semibold text-gray-900 border-r border-gray-100">{row.thisMonth}</td>
                      <td className="px-6 py-4 text-center font-bold text-gray-900">{row.total}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

        </div>

      </div>

      {/* Customer Rating Today dialog modal (redesigned matching mockup) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-[1px] transition-all">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-xl w-full max-w-[420px] overflow-hidden animate-in fade-in zoom-in-95 duration-150 p-6">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-900 hover:text-black transition-colors"
                >
                  <FiArrowLeft size={20} strokeWidth={2.5} />
                </button>
                <h3 className="font-bold text-gray-900 text-base">Customer Rating Today</h3>
              </div>
              <button 
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FiX size={18} strokeWidth={2.5} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveReview} className="space-y-5">
              {/* Store select (shown only if opened from general Add button, else show subtitle) */}
              {!openedFromRow ? (
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Select Store</label>
                  <select
                    required
                    value={selectedModalStore}
                    onChange={(e) => setSelectedModalStore(e.target.value)}
                    className="w-full py-2.5 px-3.5 bg-white border border-gray-200 rounded-2xl text-xs sm:text-sm font-semibold text-gray-700 shadow-sm focus:outline-none focus:border-gray-400 cursor-pointer"
                  >
                    {branches.map(b => (
                      <option key={b._id} value={b.workingBranch}>
                        {parseStoreBrandAndName(b.workingBranch).displayName} ({parseStoreBrandAndName(b.workingBranch).brand})
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="bg-gray-50/50 border border-gray-100 rounded-2xl p-3.5 flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Store</p>
                    <p className="font-bold text-gray-900 text-sm mt-0.5">
                      {parseStoreBrandAndName(selectedModalStore).displayName}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Brand</p>
                    <p className="font-bold text-gray-500 text-xs mt-0.5">
                      {parseStoreBrandAndName(selectedModalStore).brand}
                    </p>
                  </div>
                </div>
              )}

              {/* Total Ratings Input */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">
                  Total Ratings<span className="text-red-500 ml-0.5">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  placeholder="Enter total customer ratings today"
                  value={totalRatingsInput}
                  onChange={(e) => setTotalRatingsInput(e.target.value)}
                  className="w-full py-3 px-4 border border-gray-200 rounded-2xl text-xs sm:text-sm font-semibold text-gray-800 shadow-sm placeholder:text-gray-400 placeholder:font-normal focus:outline-none focus:border-gray-450 focus:ring-1 focus:ring-gray-450"
                />
              </div>

              {/* Submit Button (aligned left matching mockup) */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="bg-[#17171f] hover:bg-black text-white text-xs sm:text-sm font-bold py-2.5 px-6 rounded-xl shadow-md transition-all"
                >
                  Submit
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default GoogleReviewTask;
