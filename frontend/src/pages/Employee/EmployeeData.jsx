import { useEffect, useState, useCallback } from "react";
import SideNav from "../../components/SideNav/SideNav";
import baseUrl from "../../api/api";
import { Link } from "react-router-dom";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const getProgressColor = (pct) => {
  if (pct >= 85) return "#22c55e";
  if (pct >= 65) return "#3b82f6";
  if (pct >= 45) return "#f59e0b";
  return "#ef4444";
};

const exportCSV = (data) => {
  const headers = ["#","Emp ID","Name","Role","Store","Training Progress","Tasks Done","Tasks Overdue","Training Done","Training Overdue"];
  const rows = data.map((e, i) => [i+1, e.empID, e.username, e.designation, e.workingBranch, `${e.trainingCompletionPercentage}%`, e.passCountAssessment, e.AssessmentDue, e.passCountTraining, e.Trainingdue]);
  const csv = [headers, ...rows].map(r => r.map(c => `"${String(c||'').replace(/"/g,'""')}"`).join(",")).join("\n");
  const a = document.createElement("a");
  a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
  a.download = "employees.csv";
  a.click();
};

const ProgressBar = ({ pct }) => {
  const color = getProgressColor(pct);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <div style={{ flex: 1, height: "6px", background: "#f3f4f6", borderRadius: "99px", overflow: "hidden" }}>
        <div style={{ width: `${Math.min(pct, 100)}%`, height: "100%", background: color, borderRadius: "99px", transition: "width 0.3s" }} />
      </div>
      <span style={{ fontSize: "11px", fontWeight: 600, color, minWidth: "34px" }}>{pct}%</span>
    </div>
  );
};

const StatCell = ({ done, total, overdue }) => (
  <div style={{ fontSize: "11px", lineHeight: "1.4" }}>
    <div style={{ color: "#111827", fontWeight: 500 }}>{done}/{total}</div>
    {overdue > 0
      ? <div style={{ color: "#ef4444", fontWeight: 500 }}>Overdue : {overdue}</div>
      : <div style={{ color: "#22c55e", fontWeight: 500 }}>Completed</div>
    }
  </div>
);

const mapEmployee = (e) => ({
  empID: e.empID || "",
  username: e.username || "",
  designation: e.designation || "",
  workingBranch: e.workingBranch || "",
  trainingCount: e.trainingCount || 0,
  passCountTraining: e.passCountTraining || 0,
  Trainingdue: e.trainingDue || 0,
  trainingCompletionPercentage: e.trainingCompletionPercentage || 0,
  assignedAssessmentsCount: e.assignedAssessmentsCount || 0,
  passCountAssessment: e.passCountAssessment || 0,
  AssessmentDue: e.assessmentDue || 0,
  assessmentCompletionPercentage: e.assessmentCompletionPercentage || 0,
});

const EmployeeData = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [storeFilter, setStoreFilter] = useState("All");
  const [roleFilter, setRoleFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [stores, setStores] = useState(["All"]);
  const [roles, setRoles] = useState(["All"]);
  const itemsPerPage = 7;

  const token = localStorage.getItem("token");

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(currentPage),
        limit: String(itemsPerPage),
        search: search.trim(),
        store: storeFilter,
        role: roleFilter,
      });
      const res = await fetch(
        `${baseUrl.baseUrl}api/employee/app-users?${params}`,
        { headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` } }
      );
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setData(json.data.map(mapEmployee));
        setTotalEmployees(json.totalEmployees ?? json.data.length);
        setTotalPages(json.totalPages ?? 1);
        if (json.filters?.stores?.length) setStores(json.filters.stores);
        if (json.filters?.roles?.length) setRoles(json.filters.roles);
        setError("");
      } else {
        throw new Error(json.message || "Failed");
      }
    } catch {
      setError("Failed to load employees.");
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [token, currentPage, search, storeFilter, roleFilter]);

  useEffect(() => {
    const timer = setTimeout(fetchEmployees, search ? 300 : 0);
    return () => clearTimeout(timer);
  }, [fetchEmployees, search]);

  const fetchAllForExport = async () => {
    const params = new URLSearchParams({
      page: "1",
      limit: "500",
      search: search.trim(),
      store: storeFilter,
      role: roleFilter,
    });
    const res = await fetch(
      `${baseUrl.baseUrl}api/employee/app-users?${params}`,
      { headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` } }
    );
    const json = await res.json();
    if (json.success) {
      exportCSV((json.data || []).map(mapEmployee));
    }
  };

  const sel = { border:"1px solid #e5e7eb", borderRadius:"8px", padding:"7px 12px", fontSize:"13px", color:"#374151", outline:"none", background:"#fff", cursor:"pointer", fontFamily:"'DM Sans', sans-serif" };
  const showingEnd = Math.min(currentPage * itemsPerPage, totalEmployees);

  return (
    <div style={{ minHeight:"100vh", background:"#f9fafb", fontFamily:"'DM Sans', sans-serif" }}>
      <SideNav />

      <div style={{ marginLeft:"120px", paddingTop:"24px", paddingLeft:"24px", paddingRight:"24px", paddingBottom:"40px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"20px" }}>
          <div>
            <h1 style={{ fontSize:"22px", fontWeight:700, lineHeight:1.2, color:"#111827", margin:0 }}>Employee Management</h1>
            <p style={{ fontSize:"12px", color:"#9ca3af", margin:"4px 0 0" }}>Store walkings, tasks, and training progress across all locations</p>
          </div>
          <Link to="/employee/create">
            <button style={{ background:"#111827", color:"#fff", border:"none", borderRadius:"10px", padding:"9px 18px", fontSize:"13px", fontWeight:600, cursor:"pointer" }}>
              + New Employee
            </button>
          </Link>
        </div>

        <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"16px", flexWrap:"wrap" }}>
          <div style={{ display:"flex", alignItems:"center", gap:"8px", border:"1px solid #e5e7eb", borderRadius:"8px", padding:"7px 12px", background:"#fff", flex:"0 0 260px" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" placeholder="Search by name, id, branch..." value={search} onChange={e=>{setSearch(e.target.value);setCurrentPage(1);}} style={{ border:"none", outline:"none", fontSize:"13px", color:"#374151", background:"transparent", width:"100%" }} />
          </div>

          <select value={storeFilter} onChange={e=>{setStoreFilter(e.target.value);setCurrentPage(1);}} style={sel}>
            {stores.map(s=><option key={s} value={s}>{s === "All" ? "Store : All" : s}</option>)}
          </select>

          <select value={roleFilter} onChange={e=>{setRoleFilter(e.target.value);setCurrentPage(1);}} style={sel}>
            {roles.map(r=><option key={r} value={r}>{r === "All" ? "Role : All" : r}</option>)}
          </select>

          <div style={{ flex:1 }} />

          <button type="button" onClick={fetchAllForExport} style={{ display:"flex", alignItems:"center", gap:"6px", border:"1px solid #e5e7eb", borderRadius:"8px", padding:"7px 14px", fontSize:"13px", fontWeight:500, color:"#374151", background:"#f9fafb", cursor:"pointer" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Export
          </button>
        </div>

        <div style={{ background:"#fff", borderRadius:"14px", border:"1px solid #f0f0f0", boxShadow:"0 1px 4px rgba(0,0,0,0.05)", overflow:"hidden" }}>
          {loading ? (
            <div style={{ display:"flex", justifyContent:"center", padding:"48px" }}>
              <div style={{ width:"28px", height:"28px", border:"2px solid #e5e7eb", borderTopColor:"#111827", borderRadius:"50%", animation:"emp-spin 0.7s linear infinite" }} />
            </div>
          ) : error ? (
            <div style={{ textAlign:"center", padding:"48px", color:"#ef4444", fontSize:"13px" }}>
              {error}
              <button type="button" onClick={fetchEmployees} style={{ marginLeft:12, textDecoration:"underline", background:"none", border:"none", cursor:"pointer", color:"#111827" }}>Retry</button>
            </div>
          ) : data.length === 0 ? (
            <div style={{ textAlign:"center", padding:"48px", color:"#9ca3af", fontSize:"13px" }}>No employees found.</div>
          ) : (
            <>
              <div style={{ overflowX:"auto" }}>
                <table style={{ width:"100%", borderCollapse:"collapse", fontSize:"13px" }}>
                  <thead>
                    <tr style={{ background:"#f9fafb", borderBottom:"1px solid #f3f4f6" }}>
                      {["#","EMPLOYEE","STORE","TRAINING PROGRESS","TASKS","TRAINING","ACTIONS"].map(h=>(
                        <th key={h} style={{ padding:"10px 16px", textAlign: h==="#"||h==="ACTIONS" ? "center":"left", fontSize:"10px", fontWeight:600, color:"#9ca3af", letterSpacing:"0.06em", whiteSpace:"nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((e, i) => (
                      <tr key={e.empID||i} style={{ borderBottom:"1px solid #f9fafb" }}
                        onMouseEnter={ev=>ev.currentTarget.style.background="#fafafa"}
                        onMouseLeave={ev=>ev.currentTarget.style.background="#fff"}
                      >
                        <td style={{ padding:"14px 16px", textAlign:"center", color:"#9ca3af", fontSize:"12px" }}>{(currentPage - 1) * itemsPerPage + i + 1}</td>
                        <td style={{ padding:"14px 16px", minWidth:"160px" }}>
                          <div style={{ fontWeight:600, color:"#111827", fontSize:"13px" }}>{e.username || "—"}</div>
                          <div style={{ fontSize:"11px", color:"#9ca3af", marginTop:"2px" }}>{e.designation || "—"}</div>
                        </td>
                        <td style={{ padding:"14px 16px", minWidth:"140px" }}>
                          {e.workingBranch ? (
                            <>
                              <div style={{ fontWeight:500, color:"#374151", fontSize:"13px" }}>
                                {e.workingBranch.replace(/^(GROOMS|ZORUCCI|SUITOR GUY)\s*/i, "")}
                              </div>
                              <div style={{ fontSize:"11px", color:"#9ca3af", marginTop:"2px" }}>
                                {e.workingBranch.match(/^(GROOMS|ZORUCCI|SUITOR GUY)/i)?.[0] || ""}
                              </div>
                            </>
                          ) : <span style={{ color:"#9ca3af" }}>—</span>}
                        </td>
                        <td style={{ padding:"14px 16px", minWidth:"160px" }}>
                          <ProgressBar pct={e.trainingCompletionPercentage} />
                        </td>
                        <td style={{ padding:"14px 16px", minWidth:"100px" }}>
                          <StatCell done={e.passCountAssessment} total={e.assignedAssessmentsCount} overdue={e.AssessmentDue} />
                        </td>
                        <td style={{ padding:"14px 16px", minWidth:"100px" }}>
                          <StatCell done={e.passCountTraining} total={e.trainingCount} overdue={e.Trainingdue} />
                        </td>
                        <td style={{ padding:"14px 16px", textAlign:"center" }}>
                          <Link to={`/detailed/${e.empID}`} style={{ display:"inline-flex", alignItems:"center", gap:"5px", fontSize:"12px", fontWeight:600, color:"#374151", textDecoration:"none" }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/></svg>
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"14px 20px", borderTop:"1px solid #f3f4f6", fontSize:"13px", color:"#6b7280" }}>
                <span>Showing {String(showingEnd).padStart(2,"0")} of {totalEmployees}</span>
                <div style={{ display:"flex", gap:"6px" }}>
                  <button type="button" onClick={()=>setCurrentPage(p=>Math.max(1,p-1))} disabled={currentPage===1} style={{ width:"30px", height:"30px", border:"1px solid #e5e7eb", borderRadius:"6px", background:"#fff", cursor:currentPage===1?"not-allowed":"pointer", opacity:currentPage===1?0.4:1, display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <FaChevronLeft size={10} />
                  </button>
                  <button type="button" onClick={()=>setCurrentPage(p=>Math.min(totalPages,p+1))} disabled={currentPage===totalPages||totalPages===0} style={{ width:"30px", height:"30px", border:"1px solid #e5e7eb", borderRadius:"6px", background:"#fff", cursor:(currentPage===totalPages||totalPages===0)?"not-allowed":"pointer", opacity:(currentPage===totalPages||totalPages===0)?0.4:1, display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <FaChevronRight size={10} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      <style>{`@keyframes emp-spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
};

export default EmployeeData;
