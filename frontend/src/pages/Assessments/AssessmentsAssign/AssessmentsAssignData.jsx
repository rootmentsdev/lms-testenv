import { Link, useNavigate, useParams } from "react-router-dom";
import SideNav from "../../../components/SideNav/SideNav";
import { useEffect, useState, useMemo } from "react";
import baseUrl from "../../../api/api";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

/* ── helpers ─────────────────────────────────────────────────────────────── */
const fmt = (dateStr) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d)) return "—";
  return `${String(d.getDate()).padStart(2,"0")}.${String(d.getMonth()+1).padStart(2,"0")}.${d.getFullYear()}`;
};

const daysLeft = (dateStr) => {
  if (!dateStr) return null;
  const diff = Math.ceil((new Date(dateStr) - Date.now()) / 86400000);
  return diff;
};

const StatusBadge = ({ status, deadline }) => {
  const days = daysLeft(deadline);
  const isOverdue = days !== null && days < 0;
  const isDone = String(status || "").toLowerCase() === "completed" || String(status || "").toLowerCase() === "passed";

  if (isOverdue && !isDone) {
    return (
      <span style={{ display:"inline-block", padding:"3px 10px", borderRadius:"99px", fontSize:"11px", fontWeight:700, background:"#fee2e2", color:"#ef4444", letterSpacing:"0.04em" }}>
        OVERDUE
      </span>
    );
  }
  if (isDone) {
    return (
      <span style={{ display:"inline-block", padding:"3px 10px", borderRadius:"99px", fontSize:"11px", fontWeight:700, background:"#dcfce7", color:"#16a34a", letterSpacing:"0.04em" }}>
        COMPLETED
      </span>
    );
  }
  return (
    <span style={{ display:"inline-block", padding:"3px 10px", borderRadius:"99px", fontSize:"11px", fontWeight:700, background:"#f3f4f6", color:"#6b7280", letterSpacing:"0.04em" }}>
      PENDING
    </span>
  );
};

const DueDateCell = ({ deadline }) => {
  const days = daysLeft(deadline);
  const isOverdue = days !== null && days < 0;
  const isUrgent = days !== null && days >= 0 && days <= 3;
  return (
    <div>
      <div style={{ fontSize:"13px", fontWeight:500, color:"#111827" }}>{fmt(deadline)}</div>
      <div style={{ fontSize:"11px", marginTop:"2px", color: isOverdue ? "#ef4444" : isUrgent ? "#f59e0b" : "#6b7280" }}>
        {days === null ? "" : days < 0 ? "0 Days left" : days === 0 ? "Due today" : `${days} Days Left`}
      </div>
    </div>
  );
};

const ScoreCell = ({ complete, total, pass }) => {
  if (complete === undefined || complete === null) return <span style={{ color:"#9ca3af" }}>—</span>;
  const score = Math.round(complete);
  const isLow = total && score / total < 0.5;
  return (
    <span style={{ fontSize:"13px", fontWeight:600, color: isLow ? "#ef4444" : "#111827" }}>
      {score}{total ? `/${total}` : ""}
    </span>
  );
};

/* ── Stat card ───────────────────────────────────────────────────────────── */
const StatCard = ({ label, value, sub }) => (
  <div style={{ flex:1, padding:"16px 20px", borderRight:"1px solid #f3f4f6" }}>
    <p style={{ fontSize:"11px", fontWeight:600, color:"#9ca3af", textTransform:"uppercase", letterSpacing:"0.06em", margin:0 }}>{label}</p>
    <p style={{ fontSize:"15px", fontWeight:700, color:"#111827", margin:"6px 0 0" }}>{value || "—"}</p>
    {sub && <p style={{ fontSize:"11px", color:"#9ca3af", margin:"2px 0 0" }}>{sub}</p>}
  </div>
);

/* ── Main ────────────────────────────────────────────────────────────────── */
const ROWS_PER_PAGE = 7;

const AssessmentsAssignData = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [users, setUsers]           = useState([]);
  const [meta, setMeta]             = useState(null);   // assessment metadata
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);

  const [search, setSearch]         = useState("");
  const [branchFilter, setBranch]   = useState("All");
  const [roleFilter, setRole]       = useState("All");
  const [statusFilter, setStatus]   = useState("All");
  const [page, setPage]             = useState(1);

  /* fetch users assigned to this assessment */
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res  = await fetch(`${baseUrl.baseUrl}api/user/get/assessment/details/${id}`);
        const json = await res.json();
        if (json?.data?.users) setUsers(json.data.users);
        else setError("No assessment details found.");
      } catch { setError("Failed to load assessment details."); }
      finally   { setLoading(false); }
    };
    load();
  }, [id]);

  /* fetch assessment metadata from the list endpoint */
  useEffect(() => {
    const loadMeta = async () => {
      try {
        const res  = await fetch(`${baseUrl.baseUrl}api/user/get/AllAssessment`);
        const json = await res.json();
        const found = (json?.data || []).find(a => String(a.assessmentId) === String(id));
        if (found) setMeta(found);
      } catch { /* non-critical */ }
    };
    loadMeta();
  }, [id]);

  /* derived filter options */
  const branches = useMemo(() => ["All", ...Array.from(new Set(users.map(u => u.workingBranch).filter(Boolean)))], [users]);
  const roles    = useMemo(() => ["All", ...Array.from(new Set(users.map(u => u.designation).filter(Boolean)))], [users]);

  /* filtered + sorted rows */
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users
      .filter(u => {
        const a = u.assignedAssessments?.[0];
        const days = daysLeft(a?.deadline);
        const isDone = String(a?.status || "").toLowerCase() === "completed" || String(a?.status || "").toLowerCase() === "passed";
        const isOverdue = days !== null && days < 0 && !isDone;

        const matchSearch = !q || `${u.empID} ${u.username} ${u.workingBranch}`.toLowerCase().includes(q);
        const matchBranch = branchFilter === "All" || u.workingBranch === branchFilter;
        const matchRole   = roleFilter   === "All" || u.designation   === roleFilter;
        const matchStatus =
          statusFilter === "All" ||
          (statusFilter === "Completed" && isDone) ||
          (statusFilter === "Overdue"   && isOverdue) ||
          (statusFilter === "Pending"   && !isDone && !isOverdue);

        return matchSearch && matchBranch && matchRole && matchStatus;
      })
      .sort((a, b) => (a.assignedAssessments?.[0]?.complete || 0) - (b.assignedAssessments?.[0]?.complete || 0));
  }, [users, search, branchFilter, roleFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE));
  const safePage   = Math.min(page, totalPages);
  const paged      = filtered.slice((safePage - 1) * ROWS_PER_PAGE, safePage * ROWS_PER_PAGE);

  useEffect(() => setPage(1), [search, branchFilter, roleFilter, statusFilter]);

  /* summary stats */
  const totalAssigned  = users.length;
  const totalCompleted = users.filter(u => {
    const s = String(u.assignedAssessments?.[0]?.status || "").toLowerCase();
    return s === "completed" || s === "passed";
  }).length;

  const selStyle = {
    appearance:"none", border:"1px solid #e5e7eb", borderRadius:"8px",
    padding:"6px 28px 6px 10px", fontSize:"13px", color:"#374151",
    background:"#fff", cursor:"pointer", outline:"none", fontFamily:"'DM Sans',sans-serif",
  };

  const FilterSelect = ({ label, value, onChange, options }) => (
    <div style={{ position:"relative", display:"flex", alignItems:"center", gap:"6px" }}>
      <span style={{ fontSize:"13px", color:"#374151", fontWeight:500, whiteSpace:"nowrap" }}>{label} :</span>
      <select value={value} onChange={e => onChange(e.target.value)} style={selStyle}>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      <svg style={{ position:"absolute", right:8, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }}
        width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="6 9 12 15 18 9"/>
      </svg>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background:"#f9fafb", fontFamily:"'DM Sans',sans-serif" }}>
      <SideNav />

      <div style={{ marginLeft:"120px", paddingTop:"24px", paddingLeft:"24px", paddingRight:"24px", paddingBottom:"40px" }}>

        {/* ── Page header ── */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"20px" }}>
          <div>
            <button onClick={() => navigate("/assessments")}
              style={{ display:"flex", alignItems:"center", gap:"6px", background:"none", border:"none", cursor:"pointer", color:"#6b7280", fontSize:"13px", fontWeight:500, padding:0, marginBottom:"6px" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
              {meta?.assessmentName || "Assessment"}
            </button>
            <h1 style={{ fontSize:"22px", fontWeight:700, lineHeight:1.2, color:"#111827", margin:0 }}>
              {meta?.assessmentName || "Assessment Details"}
            </h1>
            <p style={{ fontSize:"12px", color:"#9ca3af", margin:"4px 0 0" }}>
              {meta?.assessment ?? "—"} Questions
            </p>
          </div>
          <Link to="/assign/Assessment" style={{ textDecoration:"none" }}>
            <button style={{ background:"#111827", color:"#fff", border:"none", borderRadius:"10px", padding:"9px 18px", fontSize:"13px", fontWeight:600, cursor:"pointer" }}>
              Assign Assessment
            </button>
          </Link>
        </div>

        {/* ── Meta stat bar ── */}
        <div style={{ background:"#fff", borderRadius:"14px", border:"1px solid #e5e7eb", display:"flex", marginBottom:"20px", overflow:"hidden", boxShadow:"0 1px 3px rgba(0,0,0,0.04)" }}>
          <StatCard label="Created In"   value={meta?.assessmentName || "—"} />
          <StatCard label="Assigned to"  value={`${totalAssigned} Staffs`} />
          <StatCard label="Deadline"     value={meta?.assessmentdeadline ? `${meta.assessmentdeadline} days` : "—"} />
          <StatCard label="Duration"     value={meta?.assessmentduration ? `${meta.assessmentduration} mins` : "—"} sub={`${totalCompleted} completed`} />
        </div>

        {/* ── Search + filters ── */}
        <div style={{ background:"#fff", borderRadius:"14px", border:"1px solid #e5e7eb", padding:"12px 16px", display:"flex", alignItems:"center", justifyContent:"space-between", gap:"12px", marginBottom:"16px", boxShadow:"0 1px 3px rgba(0,0,0,0.04)", flexWrap:"wrap" }}>
          {/* Search */}
          <div style={{ display:"flex", alignItems:"center", gap:"8px", flex:1, maxWidth:"320px", border:"1px solid #e5e7eb", borderRadius:"8px", padding:"7px 12px", background:"#f9fafb" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input type="text" placeholder="Search by name, id, branch…" value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ border:"none", outline:"none", fontSize:"13px", color:"#374151", background:"transparent", width:"100%", fontFamily:"'DM Sans',sans-serif" }} />
          </div>

          {/* Filters */}
          <div style={{ display:"flex", alignItems:"center", gap:"12px", flexWrap:"wrap" }}>
            <FilterSelect label="Branch" value={branchFilter} onChange={setBranch} options={branches} />
            <FilterSelect label="Role"   value={roleFilter}   onChange={setRole}   options={roles} />
            <FilterSelect label="Status" value={statusFilter} onChange={setStatus} options={["All","Completed","Pending","Overdue"]} />
          </div>
        </div>

        {/* ── Table ── */}
        <div style={{ background:"#fff", borderRadius:"14px", border:"1px solid #e5e7eb", overflow:"hidden", boxShadow:"0 1px 4px rgba(0,0,0,0.05)" }}>
          {loading ? (
            <div style={{ display:"flex", justifyContent:"center", padding:"48px" }}>
              <div style={{ width:28, height:28, border:"2px solid #e5e7eb", borderTopColor:"#111827", borderRadius:"50%", animation:"as-spin 0.7s linear infinite" }} />
            </div>
          ) : error ? (
            <div style={{ textAlign:"center", padding:"48px", color:"#ef4444", fontSize:"13px" }}>{error}</div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign:"center", padding:"48px", color:"#9ca3af", fontSize:"13px" }}>No results found.</div>
          ) : (
            <>
              <div style={{ overflowX:"auto" }}>
                <table style={{ width:"100%", borderCollapse:"collapse", fontSize:"13px" }}>
                  <thead>
                    <tr style={{ background:"#f9fafb", borderBottom:"1px solid #f3f4f6" }}>
                      {["EMP ID","ASSIGNED TO","STORE","SCORE","STATUS","DUE DATE","ACTIONS"].map(h => (
                        <th key={h} style={{ padding:"10px 16px", textAlign: h==="ACTIONS"||h==="SCORE" ? "center":"left", fontSize:"10px", fontWeight:700, color:"#9ca3af", letterSpacing:"0.07em", whiteSpace:"nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {paged.map((user, i) => {
                      const a = user.assignedAssessments?.[0];
                      return (
                        <tr key={user.empID || i} style={{ borderBottom:"1px solid #f9fafb" }}
                          onMouseEnter={e => e.currentTarget.style.background = "#fafafa"}
                          onMouseLeave={e => e.currentTarget.style.background = "#fff"}>

                          {/* EMP ID */}
                          <td style={{ padding:"14px 16px", color:"#6b7280", fontSize:"12px", fontWeight:500 }}>
                            {user.empID || "—"}
                          </td>

                          {/* Name + role */}
                          <td style={{ padding:"14px 16px", minWidth:"160px" }}>
                            <div style={{ fontWeight:600, color:"#111827" }}>{user.username || "—"}</div>
                            <div style={{ fontSize:"11px", color:"#9ca3af", marginTop:2 }}>{user.designation || "—"}</div>
                          </td>

                          {/* Store + brand */}
                          <td style={{ padding:"14px 16px", minWidth:"130px" }}>
                            <div style={{ fontWeight:500, color:"#374151" }}>
                              {(user.workingBranch || "—").replace(/^(GROOMS|ZORUCCI|SUITOR GUY)\s*/i, "")}
                            </div>
                            <div style={{ fontSize:"11px", color:"#9ca3af", marginTop:2 }}>
                              {(user.workingBranch || "").match(/^(GROOMS|ZORUCCI|SUITOR GUY)/i)?.[0] || ""}
                            </div>
                          </td>

                          {/* Score */}
                          <td style={{ padding:"14px 16px", textAlign:"center" }}>
                            <ScoreCell complete={a?.complete} total={meta?.assessment} pass={a?.pass} />
                          </td>

                          {/* Status */}
                          <td style={{ padding:"14px 16px" }}>
                            <StatusBadge status={a?.status} deadline={a?.deadline} />
                          </td>

                          {/* Due date */}
                          <td style={{ padding:"14px 16px", minWidth:"110px" }}>
                            <DueDateCell deadline={a?.deadline} />
                          </td>

                          {/* Actions */}
                          <td style={{ padding:"14px 16px", textAlign:"center" }}>
                            <Link to={`/detailed/${user.empID}`} style={{ display:"inline-flex", alignItems:"center", gap:"5px", fontSize:"12px", fontWeight:600, color:"#374151", textDecoration:"none" }}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="3"/><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/>
                              </svg>
                              View
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 20px", borderTop:"1px solid #f3f4f6", fontSize:"13px", color:"#6b7280" }}>
                <span>Showing {String(Math.min(safePage * ROWS_PER_PAGE, filtered.length)).padStart(2,"0")} of {filtered.length}</span>
                <div style={{ display:"flex", gap:"6px" }}>
                  <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={safePage === 1}
                    style={{ width:30, height:30, border:"1px solid #e5e7eb", borderRadius:"6px", background:"#fff", cursor: safePage===1 ? "not-allowed":"pointer", opacity: safePage===1 ? 0.4:1, display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <FaChevronLeft size={10} />
                  </button>
                  <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={safePage === totalPages}
                    style={{ width:30, height:30, border:"1px solid #e5e7eb", borderRadius:"6px", background:"#fff", cursor: safePage===totalPages ? "not-allowed":"pointer", opacity: safePage===totalPages ? 0.4:1, display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <FaChevronRight size={10} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`@keyframes as-spin { to { transform:rotate(360deg); } }`}</style>
    </div>
  );
};

export default AssessmentsAssignData;
