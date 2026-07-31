import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import baseUrl from '../../api/api';
import { toast } from 'react-toastify';
import { FaUserCheck, FaStore, FaCalendarAlt, FaSave, FaSearch, FaCut } from 'react-icons/fa';

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const getCurrentMonthName = () => MONTH_NAMES[new Date().getMonth()];
const getCurrentYearNum = () => new Date().getFullYear();

const DapprSquadAdmin = () => {
  const user = useSelector((state) => state.auth.user);
  const token = localStorage.getItem('token');

  // Filter States
  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthName());
  const [selectedYear, setSelectedYear] = useState(getCurrentYearNum());
  const [selectedWeek, setSelectedWeek] = useState(1);

  // Store Customization Inputs State (Direct Store Entry)
  const [storeValue, setStoreValue] = useState('');
  const [storeBills, setStoreBills] = useState('');
  const [storeQty, setStoreQty] = useState('');

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // All Saved Attributions Overview State
  const [allAttributions, setAllAttributions] = useState([]);
  const [overviewSearch, setOverviewSearch] = useState('');

  // Admin Configured Week Ranges from DB State
  const [configuredWeekRanges, setConfiguredWeekRanges] = useState({});

  // Fetch branches/stores list on mount
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const res = await fetch(`${baseUrl.baseUrl}api/usercreate/getBranch/public`);
        const json = await res.json();
        if (json && json.data) {
          setStores(json.data);
          if (json.data.length > 0) {
            setSelectedStore(json.data[0].workingBranch);
          }
        }
      } catch (err) {
        console.error("Error fetching branches:", err);
      }
    };
    fetchBranches();
  }, []);

  // Fetch admin-assigned week configurations from DB
  const fetchWeekConfigurations = useCallback(async () => {
    if (!selectedMonth || !selectedYear) return;
    try {
      const res = await fetch(`${baseUrl.baseUrl}api/store-targets/weeks-configuration?month=${selectedMonth}&year=${selectedYear}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      if (json.success && json.stores) {
        const matched = json.stores.find(s => 
          s.storeName === selectedStore || 
          s.storeName?.toLowerCase() === selectedStore?.toLowerCase()
        );
        if (matched && matched.weekRanges) {
          setConfiguredWeekRanges(matched.weekRanges);
        } else if (json.globalConfig && json.globalConfig.weekRanges) {
          setConfiguredWeekRanges(json.globalConfig.weekRanges);
        }
      }
    } catch (err) {
      console.error("Error fetching week configurations:", err);
    }
  }, [selectedStore, selectedMonth, selectedYear, token]);

  useEffect(() => {
    fetchWeekConfigurations();
  }, [fetchWeekConfigurations]);

  // Fetch saved Customization attributions for current store/month/year/week
  const fetchAttributionData = useCallback(async () => {
    if (!selectedMonth || !selectedYear) return;
    setLoading(true);
    try {
      const storeParam = selectedStore || 'All';
      const url = `${baseUrl.baseUrl}api/customization-attributions?storeName=${encodeURIComponent(storeParam)}&month=${selectedMonth}&year=${selectedYear}&week=${selectedWeek}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();

      if (json.success && json.data) {
        const doc = Array.isArray(json.data) ? json.data[0] : json.data;
        if (doc && doc.attributions && doc.attributions.length > 0) {
          // Calculate aggregated store customization for this document
          let totalVal = 0;
          let totalBills = 0;
          let totalQty = 0;
          doc.attributions.forEach(attr => {
            totalVal += Number(attr.billWtd) || 0;
            totalBills += Number(attr.valWtd) || 0;
            totalQty += Number(attr.qtyWtd) || 0;
          });
          setStoreValue(totalVal > 0 ? String(totalVal) : '');
          setStoreBills(totalBills > 0 ? String(totalBills) : '');
          setStoreQty(totalQty > 0 ? String(totalQty) : '');
        } else {
          setStoreValue('');
          setStoreBills('');
          setStoreQty('');
        }
      } else {
        setStoreValue('');
        setStoreBills('');
        setStoreQty('');
      }
    } catch (err) {
      console.error("Error fetching customization attribution data:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedStore, selectedMonth, selectedYear, selectedWeek, token]);

  // Fetch overview of all saved customization attributions
  const fetchOverviewAttributions = useCallback(async () => {
    try {
      const url = `${baseUrl.baseUrl}api/customization-attributions?month=${selectedMonth}&year=${selectedYear}&week=All`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      if (json.success && json.data) {
        const docs = Array.isArray(json.data) ? json.data : [json.data];
        const aggregatedDocs = docs.map(doc => {
          let totalVal = 0;
          let totalBills = 0;
          let totalQty = 0;
          if (doc.attributions && Array.isArray(doc.attributions)) {
            doc.attributions.forEach(attr => {
              totalVal += Number(attr.billWtd) || 0;
              totalBills += Number(attr.valWtd) || 0;
              totalQty += Number(attr.qtyWtd) || 0;
            });
          }
          return {
            storeName: doc.storeName,
            week: doc.week,
            valWtd: totalVal,
            billWtd: totalBills,
            qtyWtd: totalQty,
            updatedAt: doc.updatedAt
          };
        });
        setAllAttributions(aggregatedDocs);
      } else {
        setAllAttributions([]);
      }
    } catch (err) {
      console.error("Error fetching overview attributions:", err);
    }
  }, [selectedMonth, selectedYear, token]);

  useEffect(() => {
    fetchAttributionData();
    fetchOverviewAttributions();
  }, [fetchAttributionData, fetchOverviewAttributions]);

  // Handle Save Customization for Store
  const handleSave = async () => {
    if (!selectedStore) {
      toast.warning("Please select a store.");
      return;
    }
    const val = Number(storeValue) || 0;
    const bills = Number(storeBills) || 0;
    const qty = Number(storeQty) || 0;

    if (val <= 0 && bills <= 0 && qty <= 0) {
      toast.warning("Please enter Value, Bills, or Quantity for the store.");
      return;
    }

    setSaving(true);
    try {
      const attributionsList = [
        {
          staffName: "Store Customization",
          billWtd: val,
          valWtd: bills,
          qtyWtd: qty
        }
      ];

      const res = await fetch(`${baseUrl.baseUrl}api/customization-attributions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          storeName: selectedStore,
          month: selectedMonth,
          year: Number(selectedYear),
          week: Number(selectedWeek),
          attributions: attributionsList
        })
      });

      const json = await res.json();
      if (json.success) {
        toast.success(`Customization saved for ${selectedStore}!`);
        fetchAttributionData();
        fetchOverviewAttributions();
      } else {
        toast.error(json.message || "Failed to save customization.");
      }
    } catch (err) {
      console.error("Save error:", err);
      toast.error("An error occurred while saving.");
    } finally {
      setSaving(false);
    }
  };

  // Filtered Overview Attributions
  const filteredOverview = useMemo(() => {
    if (!overviewSearch.trim()) return allAttributions;
    const q = overviewSearch.toLowerCase();
    return allAttributions.filter(item => 
      item.storeName?.toLowerCase().includes(q) ||
      String(item.week).includes(q)
    );
  }, [allAttributions, overviewSearch]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-4 sm:p-6 lg:p-8 font-sans md:ml-[110px]">
      {/* Header Title */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md">
              <FaCut size={20} />
            </div>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Customization Admin</h1>
          </div>
          <p className="text-xs text-gray-500 font-medium ml-13">
            Add and manage store customization values, bills, and quantities.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-bold px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center gap-1.5">
            <FaUserCheck size={12} /> Warehouse Admin
          </span>
        </div>
      </div>

      {/* Filter Row */}
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Store Selection */}
        <div>
          <label className="block text-xs font-bold text-gray-600 uppercase mb-2 flex items-center gap-1.5">
            <FaStore className="text-emerald-600" /> Select Store
          </label>
          <select
            value={selectedStore}
            onChange={(e) => setSelectedStore(e.target.value)}
            className="w-full h-11 px-4 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-emerald-500 bg-gray-50/50"
          >
            {stores.map((b) => (
              <option key={b._id} value={b.workingBranch}>{b.workingBranch}</option>
            ))}
          </select>
        </div>

        {/* Month Selection */}
        <div>
          <label className="block text-xs font-bold text-gray-600 uppercase mb-2 flex items-center gap-1.5">
            <FaCalendarAlt className="text-emerald-600" /> Month
          </label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-full h-11 px-4 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-emerald-500 bg-gray-50/50"
          >
            {MONTH_NAMES.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        {/* Year Selection */}
        <div>
          <label className="block text-xs font-bold text-gray-600 uppercase mb-2">Year</label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="w-full h-11 px-4 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-emerald-500 bg-gray-50/50"
          >
            {[2024, 2025, 2026, 2027].map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        {/* Week Selection */}
        <div>
          <label className="block text-xs font-bold text-gray-600 uppercase mb-2">Week</label>
          <select
            value={selectedWeek}
            onChange={(e) => setSelectedWeek(Number(e.target.value))}
            className="w-full h-11 px-4 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-emerald-500 bg-gray-50/50"
          >
            {(() => {
              const shortMonth = selectedMonth ? selectedMonth.substring(0, 3) : '';
              const monthIndex = MONTH_NAMES.indexOf(selectedMonth);
              const totalDays = monthIndex !== -1 ? new Date(selectedYear, monthIndex + 1, 0).getDate() : 31;

              const defaultRanges = {
                1: `01 - 07 ${shortMonth}`,
                2: `08 - 14 ${shortMonth}`,
                3: `15 - 21 ${shortMonth}`,
                4: `22 - ${totalDays} ${shortMonth}`
              };

              const options = [1, 2, 3, 4].map(w => {
                const customRange = configuredWeekRanges[w];
                const rangeStr = (customRange && customRange !== 'Select Days')
                  ? customRange
                  : defaultRanges[w];
                return { w, label: `Week ${w} (${rangeStr})` };
              });

              return options.map(({ w, label }) => (
                <option key={w} value={w}>{label}</option>
              ));
            })()}
          </select>
        </div>
      </div>

      {/* Summary Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Store Customization Value</span>
          <div className="text-2xl font-black text-emerald-600 mt-2">
            ₹{(Number(storeValue) || 0).toLocaleString()}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Store Bills</span>
          <div className="text-2xl font-black text-indigo-600 mt-2">
            {Number(storeBills) || 0}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Store Quantity</span>
          <div className="text-2xl font-black text-blue-600 mt-2">
            {Number(storeQty) || 0}
          </div>
        </div>
      </div>

      {/* Direct Store Customization Entry Card */}
      <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Add Store Customization — {selectedStore || 'Selected Store'}
            </h2>
            <p className="text-xs text-gray-500">
              Enter total Customization value (₹), bills, and quantity for {selectedMonth} {selectedYear}, Week {selectedWeek}.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setStoreValue('');
                setStoreBills('');
                setStoreQty('');
              }}
              className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer"
            >
              Clear Inputs
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <FaSave size={13} />
              {saving ? "Saving..." : "Save Customization"}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-sm font-semibold text-gray-400">Loading store customization data...</div>
        ) : (
          <div className="bg-emerald-50/50 p-6 rounded-2xl border border-emerald-100">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-2">
                  Total Customization Value (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 5000"
                  value={storeValue}
                  onChange={(e) => setStoreValue(e.target.value)}
                  className="w-full h-12 px-4 border border-gray-200 rounded-xl text-base font-extrabold text-emerald-700 focus:outline-none focus:border-emerald-500 bg-white shadow-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-2">
                  Total Bills
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 10"
                  value={storeBills}
                  onChange={(e) => setStoreBills(e.target.value)}
                  className="w-full h-12 px-4 border border-gray-200 rounded-xl text-base font-extrabold text-gray-800 focus:outline-none focus:border-emerald-500 bg-white shadow-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-2">
                  Total Quantity
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 15"
                  value={storeQty}
                  onChange={(e) => setStoreQty(e.target.value)}
                  className="w-full h-12 px-4 border border-gray-200 rounded-xl text-base font-extrabold text-gray-800 focus:outline-none focus:border-emerald-500 bg-white shadow-sm"
                />
              </div>
            </div>
          </div>
        )}
      </form>

      {/* Saved Customizations Overview */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Saved Store Customizations Overview</h2>
            <p className="text-xs text-gray-500">View all recorded store customizations for {selectedMonth} {selectedYear}.</p>
          </div>

          <div className="relative w-full sm:w-64">
            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={13} />
            <input
              type="text"
              placeholder="Search store..."
              value={overviewSearch}
              onChange={(e) => setOverviewSearch(e.target.value)}
              className="w-full pl-9 pr-4 h-10 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:border-emerald-500 bg-gray-50/50"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50/50">
                <th className="py-3 px-4">Store Name</th>
                <th className="py-3 px-4 text-center">Week</th>
                <th className="py-3 px-4 text-right">Value (₹)</th>
                <th className="py-3 px-4 text-center">Bills</th>
                <th className="py-3 px-4 text-center">Qty</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs font-semibold text-gray-700">
              {filteredOverview.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-400">
                    No saved store customizations found for {selectedMonth} {selectedYear}.
                  </td>
                </tr>
              ) : (
                filteredOverview.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-3 px-4 font-bold text-gray-900">{item.storeName}</td>
                    <td className="py-3 px-4 text-center"><span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-100">Week {item.week}</span></td>
                    <td className="py-3 px-4 text-right font-extrabold text-emerald-600">₹{item.valWtd.toLocaleString()}</td>
                    <td className="py-3 px-4 text-center font-bold text-gray-800">{item.billWtd}</td>
                    <td className="py-3 px-4 text-center font-bold text-gray-800">{item.qtyWtd}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DapprSquadAdmin;
