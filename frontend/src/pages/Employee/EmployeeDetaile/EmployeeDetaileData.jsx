import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import SideNav from "../../../components/SideNav/SideNav";
import { GoPencil } from "react-icons/go";
import { FaRegTrashCan } from "react-icons/fa6";
import baseUrl from "../../../api/api.js";
import { toast } from "react-toastify";

/* ── Helpers ─────────────────────────────────────────────────────────────── */
const initials = (name = "") =>
  name.split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase() || "").join("") || "?";

const statusColor = (status = "") => {
  const s = status.toLowerCase();
  if (s === "completed") return "bg-emerald-100 text-emerald-700";
  if (s === "pending")   return "bg-amber-100 text-amber-700";
  if (s === "overdue")   return "bg-red-100 text-red-700";
  return "bg-gray-100 text-gray-600";
};

const fieldLabel = (key) => {
  const map = { _id: "ID", empID: "Emp ID", locCode: "Loc Code",
    workingBranch: "Working Branch", phoneNumber: "Phone Number" };
  return map[key] || key.replace(/([A-Z])/g, " $1").replace(/^_/, "").trim();
};

const fieldIcon = (key) => {
  if (key === "email")         return "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z";
  if (key === "phoneNumber")   return "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z";
  if (key === "empID")         return "M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2";
  if (key === "designation")   return "M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z";
  if (key === "workingBranch") return "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4";
  if (key === "locCode")       return "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z";
  return "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z";
};

const deduplicateTrainings = (trainings) => {
  if (!Array.isArray(trainings)) return [];
  const uniqueTrainingsMap = new Map();
  for (const item of trainings) {
    if (!item || !item.trainingId) continue;
    
    let key = '';
    if (typeof item.trainingId === 'object') {
      key = item.trainingId._id || item.trainingId.id || JSON.stringify(item.trainingId);
    } else {
      key = item.trainingId;
    }
    
    if (key) {
      const keyStr = key.toString();
      if (uniqueTrainingsMap.has(keyStr)) {
        const existing = uniqueTrainingsMap.get(keyStr);
        const merged = {
          ...existing,
          ...item,
          isMandatory: !!(existing.isMandatory || item.isMandatory),
          status: (item.status === 'Completed' || item.status === 'COMPLETED' || item.pass === true) ? item.status : existing.status,
          pass: existing.pass || item.pass || existing.pass === true || item.pass === true
        };
        uniqueTrainingsMap.set(keyStr, merged);
      } else {
        uniqueTrainingsMap.set(keyStr, item);
      }
    }
  }
  return Array.from(uniqueTrainingsMap.values());
};

const EmployeeDetaileData = () => {
  const token = localStorage.getItem("token");
  const { id } = useParams();
  const [isEditing, setIsEditing]   = useState(false);
  const [isExternal, setIsExternal] = useState(false);
  const [data, setData]             = useState({});
  const [fulldata, setfullData]     = useState({});
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerType, setDrawerType] = useState("training");
  const [loading, setLoading]       = useState(true);

  const handleSave = async () => {
    if (isExternal) { toast.error("External source — editing disabled."); return; }
    try {
      const response = await fetch(`${baseUrl.baseUrl}api/admin/user/update/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok) { toast.error(result?.message || "Failed to update"); return; }
      toast.success(result?.message || "Profile updated");
      await FetchUserData();
      setIsEditing(false);
    } catch { toast.error("Error updating data"); }
  };

  const FetchUserData = async () => {
    setLoading(true);
    try {
      const userdata = await fetch(
        `${baseUrl.baseUrl}api/admin/user/detailed/info/${id}?t=${Date.now()}`,
        { method: "GET", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, credentials: "include" }
      );
      if (!userdata.ok) throw new Error("DB route failed");
      const userdetail = await userdata.json();
      const selectedData = {
        _id: userdetail?.data?._id || "",
        username: userdetail?.data?.username || "",
        email: userdetail?.data?.email || "",
        phoneNumber: userdetail?.data?.phoneNumber || "",
        locCode: userdetail?.data?.locCode || "",
        empID: userdetail?.data?.empID || "",
        designation: userdetail?.data?.designation || "",
        workingBranch: userdetail?.data?.workingBranch || "",
      };
      try {
        const trainingUserId = userdetail?.data?._id || userdetail?.data?.empID || id;
        const progressRes = await fetch(`${baseUrl.baseUrl}api/user/training-progress/${trainingUserId}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include"
        });
        if (progressRes.ok) {
          const progressData = await progressRes.json();
          const rawTrainings = [
            ...(userdetail.data?.training || []),
            ...(progressData.mandatoryTrainings || [])
          ];
          setfullData({
            ...userdetail.data,
            training: deduplicateTrainings(rawTrainings)
          });
        } else {
          setfullData({
            ...(userdetail.data || {}),
            training: deduplicateTrainings(userdetail.data?.training)
          });
        }
      } catch {
        setfullData({
          ...(userdetail.data || {}),
          training: deduplicateTrainings(userdetail.data?.training)
        });
      }
      setData(selectedData);
      setIsExternal(false);
      setLoading(false);
      return;
    } catch (err) {
      console.warn("DB failed, trying external.", err?.message);
    }
    try {
      const res = await fetch(`${baseUrl.baseUrl}api/employee_detail`,
        { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ empId: id }) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const emp = Array.isArray(json?.data) ? json.data[0] : null;
      if (!emp) throw new Error("No record");
      setData({ username: emp?.name || "", email: emp?.email || "", phoneNumber: emp?.phone || "",
        locCode: emp?.store_code || "", empID: emp?.emp_code || id, designation: emp?.role_name || "", workingBranch: emp?.store_name || "" });
      setfullData({ training: [], assignedAssessments: [], __external: true });
      setIsExternal(true);
    } catch { toast.error("Failed to load employee details"); setfullData({ training: [], assignedAssessments: [] }); setData({}); setIsExternal(false); }
    setLoading(false);
  };

  useEffect(() => { FetchUserData(); }, [id]);

  const handleChange = (e) => setData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const profileFields    = Object.entries(data || {}).filter(([key]) => key !== "_id");
  const trainingRows     = (fulldata?.training || []).filter((t) => t.trainingId);
  const assessmentRows   = (fulldata?.assignedAssessments || []);
  const fullTrainingRows   = trainingRows;
  const fullAssessmentRows = assessmentRows;
  const openDrawer = (type) => { setDrawerType(type); setDrawerOpen(true); };

  const totalTraining   = fullTrainingRows.length;
  const doneTraining    = fullTrainingRows.filter((t) => t.status?.toLowerCase() === "completed").length;
  const totalAssessment = fullAssessmentRows.length;
  const doneAssessment  = fullAssessmentRows.filter((a) => a.status?.toLowerCase() === "completed").length;

  /* ── Render ─────────────────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-[#f4f5f7]" style={{ fontFamily: "Poppins, sans-serif" }}>
      <SideNav />

      <div className="md:ml-[120px] px-6 pt-6 pb-12">
        {/* ── Breadcrumb ── */}
        <Link to="/employee" onClick={() => setIsEditing(false)}
          className="inline-flex items-center gap-1.5 text-[12px] text-gray-500 hover:text-gray-800 mb-5 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Employees
        </Link>

        {/* ── Hero card ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-6 overflow-hidden">
          {/* Gradient banner */}
          <div className="h-24 bg-gradient-to-r from-[#1a1a1a] via-[#2d2d2d] to-[#016E5B]" />

          <div className="px-6 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 -mt-10">
              {/* Avatar + name */}
              <div className="flex items-end gap-4">
                <div className="w-20 h-20 rounded-2xl bg-[#016E5B] border-4 border-white shadow-lg flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                  {loading ? "…" : initials(data.username)}
                </div>
                <div className="mb-1">
                  <h1 className="text-[20px] font-bold text-gray-900 leading-tight">
                    {loading ? "Loading…" : data.username || "—"}
                  </h1>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-[12px] text-gray-500">{data.designation || "—"}</span>
                    {data.empID && (
                      <span className="text-[11px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">
                        {data.empID}
                      </span>
                    )}
                    {isExternal && (
                      <span className="text-[11px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                        External Source
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 mb-1">
                <button onClick={FetchUserData}
                  className="inline-flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-[12px] font-semibold px-3 py-2 rounded-xl transition-colors">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </button>
                <button
                  disabled={isExternal}
                  onClick={() => { if (isEditing) handleSave(); else setIsEditing(true); }}
                  className={`inline-flex items-center gap-1.5 text-[12px] font-semibold px-3 py-2 rounded-xl border transition-colors ${
                    isExternal ? "text-gray-400 border-gray-200 bg-gray-50 cursor-not-allowed"
                    : isEditing ? "bg-[#016E5B] text-white border-[#016E5B] hover:bg-[#015a4a]"
                    : "text-emerald-700 border-emerald-200 hover:bg-emerald-50"}`}>
                  <GoPencil className="w-3.5 h-3.5" />
                  {isEditing ? "Save Changes" : "Edit Profile"}
                </button>
                {isEditing && (
                  <button onClick={() => setIsEditing(false)}
                    className="inline-flex items-center gap-1.5 text-[12px] font-semibold px-3 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
                    Cancel
                  </button>
                )}
                <button className="inline-flex items-center gap-1.5 text-[12px] font-semibold px-3 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 transition-colors">
                  <FaRegTrashCan className="w-3.5 h-3.5" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Stat cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Trainings Assigned", value: totalTraining, icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253", color: "text-blue-600 bg-blue-50" },
            { label: "Trainings Completed", value: doneTraining, icon: "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z", color: "text-emerald-600 bg-emerald-50" },
            { label: "Assessments Assigned", value: totalAssessment, icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4", color: "text-purple-600 bg-purple-50" },
            { label: "Assessments Completed", value: doneAssessment, icon: "M5 13l4 4L19 7", color: "text-orange-600 bg-orange-50" },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${s.color}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={s.icon} />
                </svg>
              </div>
              <div>
                <div className="text-[22px] font-bold text-gray-900 leading-none">{loading ? "—" : s.value}</div>
                <div className="text-[11px] text-gray-500 mt-0.5">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Profile info ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-[15px] font-bold text-gray-900">Profile Information</h2>
              <p className="text-[11px] text-gray-400 mt-0.5">Basic employee details</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {profileFields.map(([key, value], index) => (
              <div key={index} className="flex flex-col gap-1.5">
                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
                  {fieldLabel(key)}
                </label>
                {isEditing && !isExternal ? (
                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={fieldIcon(key)} />
                    </svg>
                    <input type="text" name={key} value={value ?? ""} onChange={handleChange}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-[13px] text-gray-900 outline-none focus:border-[#016E5B] focus:ring-2 focus:ring-[#016E5B]/10 transition-all" />
                  </div>
                ) : (
                  <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-gray-100 bg-gray-50 min-h-[42px]">
                    <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={fieldIcon(key)} />
                    </svg>
                    <span className="text-[13px] text-gray-800 truncate">{value || "—"}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Training + Assessment summary cards ── */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
          {/* Training card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-[14px] font-bold text-gray-900">Training</h3>
                  <p className="text-[10px] text-gray-400">Assigned &amp; mandatory records</p>
                </div>
              </div>
              <span className="text-[11px] text-gray-400 bg-gray-50 px-2.5 py-1 rounded-full">
                {totalTraining} record{totalTraining !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="bg-gray-50/70">
                    <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Name</th>
                    <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Type</th>
                    <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Deadline</th>
                    <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {trainingRows.length > 0 ? trainingRows.map((t, i) => (
                    <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3 font-semibold text-gray-800">{t.trainingId?.trainingName || "—"}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${t.isMandatory ? "bg-orange-100 text-orange-700" : "bg-blue-100 text-blue-700"}`}>
                          {t.isMandatory ? "Mandatory" : "Assigned"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{t.deadline ? new Date(t.deadline).toLocaleDateString() : "—"}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusColor(t.status)}`}>
                          {t.status || "—"}
                        </span>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan="4" className="text-center py-10 text-gray-400 text-[12px]">No training records</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Assessment card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                  <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-[14px] font-bold text-gray-900">Assessments</h3>
                  <p className="text-[10px] text-gray-400">Assigned assessment records</p>
                </div>
              </div>
              <span className="text-[11px] text-gray-400 bg-gray-50 px-2.5 py-1 rounded-full">
                {totalAssessment} record{totalAssessment !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="bg-gray-50/70">
                    <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Name</th>
                    <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Questions</th>
                    <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Duration</th>
                    <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {assessmentRows.length > 0 ? assessmentRows.map((a, i) => (
                    <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3 font-semibold text-gray-800">{a.assessmentId?.title || "—"}</td>
                      <td className="px-4 py-3 text-gray-500">{a.assessmentId?.questions?.length ?? 0}</td>
                      <td className="px-4 py-3 text-gray-500">{a.assessmentId?.duration ? `${a.assessmentId.duration} min` : "—"}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusColor(a.status)}`}>
                          {a.status || "—"}
                        </span>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan="4" className="text-center py-10 text-gray-400 text-[12px]">No assessment records</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>

      {/* ── Drawer ── */}
      {drawerOpen && (
        <div className="fixed inset-0 z-[60]">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-full max-w-[500px] bg-white shadow-2xl flex flex-col">
            {/* Drawer header */}
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-white">
              <div>
                <h3 className="text-[16px] font-bold text-gray-900">
                  {drawerType === "training" ? "All Training Records" : "All Assessment Records"}
                </h3>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  {drawerType === "training" ? `${fullTrainingRows.length} total` : `${fullAssessmentRows.length} total`}
                </p>
              </div>
              <button onClick={() => setDrawerOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-colors text-lg font-light">
                ×
              </button>
            </div>

            <div className="p-5 overflow-y-auto flex-1 space-y-3">
              {drawerType === "training" ? (
                fullTrainingRows.length > 0 ? fullTrainingRows.map((t, i) => (
                  <div key={i} className="border border-gray-100 rounded-xl p-4 hover:border-gray-200 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900 text-[13px] truncate">{t.trainingId?.trainingName || "—"}</div>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          <span className="text-[11px] text-gray-400">{t.deadline ? new Date(t.deadline).toLocaleDateString() : "No deadline"}</span>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusColor(t.status)}`}>
                            {t.status || "—"}
                          </span>
                        </div>
                      </div>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-semibold flex-shrink-0 ${t.isMandatory ? "bg-orange-100 text-orange-700" : "bg-blue-100 text-blue-700"}`}>
                        {t.isMandatory ? "Mandatory" : "Assigned"}
                      </span>
                    </div>
                  </div>
                )) : <div className="text-center text-gray-400 py-16 text-[13px]">No training records available.</div>
              ) : (
                fullAssessmentRows.length > 0 ? fullAssessmentRows.map((a, i) => (
                  <div key={i} className="border border-gray-100 rounded-xl p-4 hover:border-gray-200 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900 text-[13px] truncate">{a.assessmentId?.title || "—"}</div>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          <span className="text-[11px] text-gray-400">{a.assessmentId?.questions?.length ?? 0} questions</span>
                          <span className="text-[11px] text-gray-400">{a.assessmentId?.duration ? `${a.assessmentId.duration} min` : "—"}</span>
                          <span className="text-[11px] text-gray-400">{a.deadline ? new Date(a.deadline).toLocaleDateString() : "No deadline"}</span>
                        </div>
                      </div>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-semibold flex-shrink-0 ${statusColor(a.status)}`}>
                        {a.status || "—"}
                      </span>
                    </div>
                  </div>
                )) : <div className="text-center text-gray-400 py-16 text-[13px]">No assessment records available.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeDetaileData;
