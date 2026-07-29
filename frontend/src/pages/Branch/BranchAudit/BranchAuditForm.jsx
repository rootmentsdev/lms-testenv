import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import SideNav from "../../../components/SideNav/SideNav";
import { FaArrowLeft, FaChevronDown, FaStar, FaUser, FaExclamationTriangle } from "react-icons/fa";
import { toast } from "react-toastify";
import baseUrl from "../../../api/api";

/* ─────────────────────────────────────────────────────────────────────────── */
/* ROLE-BASED SECTION DEFINITIONS                                              */
/* ─────────────────────────────────────────────────────────────────────────── */

// Store Manager → rates Employee (10 flat criteria)
const EMPLOYEE_CRITERIA = [
  "Punctuality",
  "Leave Discipline",
  "Grooming Standards",
  "Customer Etiquette",
  "Teamwork",
  "Product Ownership",
  "Customer Issue Ownership",
  "SOP Adherence",
  "Adapting",
  "Learning Attitude and Growth Mentality",
];

// Cluster Manager / Admin → rates Store (5 sections with sub-items)
const STORE_SECTIONS = [
  {
    title: "Business Performance Management",
    items: [
      "Weekly Target Achievement",
      "Conversion Management",
      "ABS Management",
      "Team Performance Monitoring",
    ],
  },
  {
    title: "Store Operations & SOP Compliance",
    items: [
      "Walk-in Discipline",
      "Reporting Discipline",
      "Billing SOP Adherence",
      "Process Implementation",
    ],
  },
  {
    title: "Product & Customer Readiness",
    items: [
      "Product Quality",
      "T-2 Rent-out Preparation",
      "Alteration Control",
      "Customer Complaints",
    ],
  },
  {
    title: "Team Leadership & Culture",
    items: [
      "Briefing Quality",
      "Team Discipline",
      "Fairness",
      "Coaching Ability",
      "Ownership Culture",
    ],
  },
  {
    title: "Store Standards & Presentation",
    items: [
      "VM Standards",
      "Store Cleanliness",
      "Product Presentation",
      "Brand Representation",
    ],
  },
];

/* ─────────────────────────────────────────────────────────────────────────── */
/* STAR RATING COMPONENT                                                        */
/* ─────────────────────────────────────────────────────────────────────────── */
const AuditStar = ({ value, onChange, label, error }) => (
  <div className={`flex flex-col items-center gap-3 text-center p-3 rounded-xl transition-all ${error ? 'bg-red-50/80 border border-red-200 shadow-sm' : ''}`}>
    <div className="text-[14px] font-semibold text-[#30343b] leading-snug">
      {label}
      <span className="text-red-500">*</span>
    </div>
    <div className="flex items-center gap-3">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className={`text-[36px] leading-none transition ${
            star <= value ? "text-yellow-400" : "text-[#d1d5db]"
          } hover:text-yellow-400`}
          aria-label={`${label} ${star} stars`}
        >
          <FaStar />
        </button>
      ))}
    </div>
    <span className={`text-[12px] font-medium ${value === 0 ? (error ? "text-red-600 font-semibold" : "text-amber-600") : "text-emerald-600"}`}>
      {value === 0 ? (error ? "Rating Required *" : "Not rated *") : `${value} / 5`}
    </span>
  </div>
);

/* ─────────────────────────────────────────────────────────────────────────── */
/* SECTION BLOCK (for cluster/admin view)                                       */
/* ─────────────────────────────────────────────────────────────────────────── */
const SectionBlock = ({ title, items, values, setValues, errors }) => (
  <section className="rounded-[8px] bg-white px-6 py-8 shadow-sm border border-gray-100">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 border-b border-gray-100 pb-3">
      <h2 className="text-[16px] font-bold text-black">{title}</h2>
      <span className="text-xs font-semibold text-red-600 bg-red-50 px-3 py-1 rounded-full border border-red-200 self-start sm:self-auto flex items-center gap-1.5">
        <FaExclamationTriangle className="text-red-500 text-[10px]" />
        All ratings & section remarks mandatory *
      </span>
    </div>
    <div className="grid grid-cols-1 gap-y-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-x-6">
      {items.map((label, idx) => {
        const key = `${title}-${idx}`;
        return (
          <AuditStar
            key={key}
            label={label}
            value={values[key] || 0}
            error={errors?.[key]}
            onChange={(next) => setValues((prev) => ({ ...prev, [key]: next }))}
          />
        );
      })}
    </div>
    <div className="mt-8">
      <label className="mb-2 block text-[14px] font-semibold text-[#30343b]">
        Remarks for {title} <span className="text-red-500">*</span>
      </label>
      <textarea
        rows={2}
        value={values[`${title}-remarks`] || ""}
        onChange={(e) =>
          setValues((prev) => ({ ...prev, [`${title}-remarks`]: e.target.value }))
        }
        placeholder={`Observations on ${title} (Required)...`}
        className={`w-full rounded-[6px] border px-3 py-2 text-[14px] outline-none focus:border-gray-500 resize-none ${
          errors?.[`${title}-remarks`] ? "border-red-500 bg-red-50/40" : "border-gray-200"
        }`}
      />
      {errors?.[`${title}-remarks`] && (
        <p className="text-xs text-red-600 font-semibold mt-1">Section remarks are required.</p>
      )}
    </div>
  </section>
);

/* ─────────────────────────────────────────────────────────────────────────── */
/* EMPLOYEE RATING BLOCK (for store_admin view)                                 */
/* ─────────────────────────────────────────────────────────────────────────── */
const EmployeeRatingBlock = ({ criteria, values, setValues, errors }) => (
  <section className="rounded-[8px] bg-white px-6 py-8 shadow-sm border border-gray-100">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 border-b border-gray-100 pb-3">
      <h2 className="text-[16px] font-bold text-black">
        Employee Performance Rating
      </h2>
      <span className="text-xs font-semibold text-red-600 bg-red-50 px-3 py-1 rounded-full border border-red-200 self-start sm:self-auto flex items-center gap-1.5">
        <FaExclamationTriangle className="text-red-500 text-[10px]" />
        All 10 criteria & overall remarks are mandatory *
      </span>
    </div>
    <div className="grid grid-cols-1 gap-y-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-x-6">
      {criteria.map((label, idx) => (
        <AuditStar
          key={idx}
          label={label}
          value={values[`emp-${idx}`] || 0}
          error={errors?.[`emp-${idx}`]}
          onChange={(next) =>
            setValues((prev) => ({ ...prev, [`emp-${idx}`]: next }))
          }
        />
      ))}
    </div>
    <div className="mt-8">
      <label className="mb-2 block text-[14px] font-semibold text-[#30343b]">
        Overall Remarks <span className="text-red-500">*</span>
      </label>
      <textarea
        rows={3}
        value={values["emp-remarks"] || ""}
        onChange={(e) =>
          setValues((prev) => ({ ...prev, "emp-remarks": e.target.value }))
        }
        placeholder="General observations about this employee's performance (Required)..."
        className={`w-full rounded-[6px] border px-3 py-2 text-[14px] outline-none focus:border-gray-500 resize-none ${
          errors?.["emp-remarks"] ? "border-red-500 bg-red-50/40" : "border-gray-200"
        }`}
      />
      {errors?.["emp-remarks"] && (
        <p className="text-xs text-red-600 font-semibold mt-1">Overall remarks are required.</p>
      )}
    </div>
  </section>
);

/* ─────────────────────────────────────────────────────────────────────────── */
/* MAIN FORM COMPONENT                                                          */
/* ─────────────────────────────────────────────────────────────────────────── */
const BranchAuditForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector((s) => s.auth.user);
  const basePath = location.pathname.startsWith("/store-analysis/store-rating")
    ? "/store-analysis/store-rating"
    : "/branch/audit";

  const isStoreAdmin = user?.role === "store_admin";

  const [store, setStore] = useState("");
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [employeeName, setEmployeeName] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [branchOptions, setBranchOptions] = useState([]);
  const [employeeOptions, setEmployeeOptions] = useState([]);

  /* Load branches — and auto-select for store_admin */
  useEffect(() => {
    let mounted = true;
    const loadBranches = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${baseUrl.baseUrl}api/usercreate/getBranch`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        });
        if (!response.ok) throw new Error("Failed to load branches");
        const json = await response.json();
        const list = Array.isArray(json?.data) ? json.data : [];
        if (mounted) {
          setBranchOptions(list.filter(Boolean));

          // Auto-select the store admin's own branch
          if (isStoreAdmin && user?.branches?.length > 0) {
            const myBranch = user.branches[0];
            // branches[0] is a full populated object with workingBranch
            const branchName =
              typeof myBranch === "object"
                ? myBranch.workingBranch || myBranch.branchName || ""
                : myBranch;
            const branchId =
              typeof myBranch === "object" ? myBranch._id : null;

            // Try to match in the fetched list
            const matched = list.find(
              (b) =>
                b.workingBranch === branchName ||
                (branchId && (b._id === branchId || String(b._id) === String(branchId)))
            );
            if (matched) {
              setStore(matched.workingBranch);
              setSelectedBranch(matched);
            } else if (branchName) {
              setStore(branchName);
            }
          }
        }
      } catch {
        if (mounted) setBranchOptions([]);
      }
    };
    loadBranches();
    return () => { mounted = false; };
  }, [isStoreAdmin, user?.branches]);

  /* Load employees when store selected (only for store_admin) */
  useEffect(() => {
    if (!isStoreAdmin || !store) return;
    let mounted = true;
    const loadEmployees = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `${baseUrl.baseUrl}api/admin/accessible-employees?store=${encodeURIComponent(store)}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const json = await response.json();
        const list = Array.isArray(json?.employees) ? json.employees : Array.isArray(json?.data) ? json.data : [];
        if (mounted) setEmployeeOptions(list);
      } catch {
        if (mounted) setEmployeeOptions([]);
      }
    };
    loadEmployees();
    return () => { mounted = false; };
  }, [isStoreAdmin, store]);

  /* Build submission payload */
  const buildPayload = () => {
    if (isStoreAdmin) {
      const items = EMPLOYEE_CRITERIA.map((label, idx) => ({
        label,
        score: Number(values[`emp-${idx}`] || 0),
      }));
      const sections = [
        {
          title: "Employee Performance Rating",
          items,
          remarks: values["emp-remarks"] || "",
        },
      ];
      return {
        store,
        storeId: selectedBranch?._id,
        employeeName,
        employeeId,
        ratingType: "employee",
        sections,
        auditorRemarks: {
          observationAcknowledged: values["audit-observation"] || "",
          actionPlanForShortfalls: values["audit-action-plan"] || "",
        },
        ratedOn: new Date().toISOString().slice(0, 10),
        metadata: { totalQuestions: EMPLOYEE_CRITERIA.length, employeeId, employeeName },
      };
    } else {
      const sections = STORE_SECTIONS.map((section) => ({
        title: section.title,
        items: section.items.map((label, idx) => ({
          label,
          score: Number(values[`${section.title}-${idx}`] || 0),
        })),
        remarks: values[`${section.title}-remarks`] || "",
      }));
      return {
        store,
        storeId: selectedBranch?._id,
        ratingType: "store",
        sections,
        auditorRemarks: {
          observationAcknowledged: values["audit-observation"] || "",
          actionPlanForShortfalls: values["audit-action-plan"] || "",
        },
        ratedOn: new Date().toISOString().slice(0, 10),
        metadata: {
          totalQuestions: sections.reduce((s, sec) => s + sec.items.length, 0),
        },
      };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!store || !store.trim()) {
      newErrors.store = true;
      toast.error("Store selection is required.");
      setErrors(newErrors);
      return;
    }

    if (isStoreAdmin) {
      if (!employeeId || !employeeId.trim()) {
        newErrors.employeeId = true;
        toast.error("Employee selection is required.");
        setErrors(newErrors);
        return;
      }

      const unratedIndices = [];
      EMPLOYEE_CRITERIA.forEach((_, idx) => {
        const val = Number(values[`emp-${idx}`] || 0);
        if (val <= 0) {
          unratedIndices.push(idx);
          newErrors[`emp-${idx}`] = true;
        }
      });

      const remarks = values["emp-remarks"] ? values["emp-remarks"].trim() : "";
      if (!remarks) {
        newErrors["emp-remarks"] = true;
      }

      if (unratedIndices.length > 0) {
        toast.error(`Please rate all 10 performance criteria before saving. (${unratedIndices.length} criterion missing)`);
        setErrors(newErrors);
        return;
      }

      if (!remarks) {
        toast.error("Overall remarks are required for staff rating.");
        setErrors(newErrors);
        return;
      }
    } else {
      // Cluster / Admin Store Rating validation
      const unrated = [];
      const missingSectionRemarks = [];

      STORE_SECTIONS.forEach((section) => {
        section.items.forEach((label, idx) => {
          const key = `${section.title}-${idx}`;
          if (!values[key] || Number(values[key]) <= 0) {
            unrated.push(label);
            newErrors[key] = true;
          }
        });

        const remKey = `${section.title}-remarks`;
        if (!values[remKey] || !values[remKey].trim()) {
          missingSectionRemarks.push(section.title);
          newErrors[remKey] = true;
        }
      });

      if (!values["audit-observation"] || !values["audit-observation"].trim()) {
        newErrors["audit-observation"] = true;
      }
      if (!values["audit-action-plan"] || !values["audit-action-plan"].trim()) {
        newErrors["audit-action-plan"] = true;
      }

      if (unrated.length > 0) {
        toast.error(`Please rate all store audit criteria. (${unrated.length} item(s) unrated)`);
        setErrors(newErrors);
        return;
      }

      if (missingSectionRemarks.length > 0) {
        toast.error(`Please enter remarks for all store rating sections.`);
        setErrors(newErrors);
        return;
      }

      if (!values["audit-observation"] || !values["audit-observation"].trim()) {
        toast.error("Auditor Observation Acknowledged is required.");
        setErrors(newErrors);
        return;
      }

      if (!values["audit-action-plan"] || !values["audit-action-plan"].trim()) {
        toast.error("Action Plan for Shortfalls is required.");
        setErrors(newErrors);
        return;
      }
    }

    setErrors({});
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const body = buildPayload();
      const response = await fetch(`${baseUrl.baseUrl}api/admin/branch-audit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to save audit");
      }

      toast.success(isStoreAdmin ? "Staff Rating saved successfully!" : "Store Rating saved successfully!");
      navigate(basePath);
    } catch (err) {
      toast.error(err.message || "Failed to save rating audit");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f4fb] font-[Poppins,sans-serif]">
      <SideNav />
      <div className="md:ml-[120px] px-4 sm:px-6 lg:px-8 py-6">
        <div className="mx-auto max-w-[1400px]">

          {/* Back link */}
          <Link
            to={basePath}
            className="mb-5 inline-flex items-center gap-2 text-[14px] font-semibold text-gray-400 hover:text-gray-600 transition"
          >
            <FaArrowLeft />
            Back to Store Rating
          </Link>

          {/* Page title */}
          <div className="mb-6 flex items-center gap-3">
            <h1 className="text-[22px] font-bold text-black">
              {isStoreAdmin ? "Employee Performance Rating" : "Store Rating Audit"}
            </h1>
            <span
              className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ${
                isStoreAdmin
                  ? "bg-blue-100 text-blue-700"
                  : "bg-purple-100 text-purple-700"
              }`}
            >
              {isStoreAdmin ? "Store Manager" : "Cluster / Admin"}
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Store selector */}
            <div className="rounded-[8px] bg-white px-6 py-5 shadow-sm">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-[14px] font-semibold text-[#30343b]">
                    Store<span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={store}
                      required
                      onChange={(e) => {
                        const next = e.target.value;
                        setStore(next);
                        setSelectedBranch(
                          branchOptions.find((b) => b.workingBranch === next) || null
                        );
                        setEmployeeName("");
                        setEmployeeId("");
                      }}
                      className="w-full appearance-none rounded-[8px] border border-gray-200 bg-white px-4 py-3 text-[14px] font-medium outline-none focus:border-gray-400"
                    >
                      <option value="">Select Store</option>
                      {branchOptions.map((opt) => (
                        <option key={opt._id || opt.workingBranch} value={opt.workingBranch}>
                          {opt.workingBranch}
                        </option>
                      ))}
                    </select>
                    <FaChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-[12px]" />
                  </div>
                </div>

                {/* Employee selector — only for store_admin */}
                {isStoreAdmin && (
                  <div>
                    <label className="mb-2 block text-[14px] font-semibold text-[#30343b]">
                      Employee<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <select
                          value={employeeId}
                          required
                          onChange={(e) => {
                            const sel = employeeOptions.find(
                              (emp) => (emp._id || emp.employeeId) === e.target.value
                            );
                            setEmployeeId(e.target.value);
                            setEmployeeName(
                              sel
                                ? `${sel.firstName || ""} ${sel.lastName || sel.name || ""}`.trim()
                                : e.target.value
                            );
                          }}
                          className="w-full appearance-none rounded-[8px] border border-gray-200 bg-white px-4 py-3 text-[14px] font-medium outline-none focus:border-gray-400"
                        >
                          <option value="">
                            {employeeOptions.length === 0 ? "Loading employees..." : "Select Employee"}
                          </option>
                          {employeeOptions.map((emp) => (
                            <option
                              key={emp._id || emp.employeeId}
                              value={emp._id || emp.employeeId}
                            >
                              {`${emp.firstName || ""} ${emp.lastName || emp.name || ""}`.trim() || emp.email}
                            </option>
                          ))}
                        </select>
                        <FaUser className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-[12px]" />
                      </div>
                  </div>
                )}
              </div>
            </div>

            {/* ── Store Manager View: Employee criteria ── */}
            {isStoreAdmin && (
              <EmployeeRatingBlock
                criteria={EMPLOYEE_CRITERIA}
                values={values}
                setValues={setValues}
                errors={errors}
              />
            )}

            {/* ── Cluster/Admin View: Store sections ── */}
            {!isStoreAdmin &&
              STORE_SECTIONS.map((section) => (
                <SectionBlock
                  key={section.title}
                  title={section.title}
                  items={section.items}
                  values={values}
                  setValues={setValues}
                  errors={errors}
                />
              ))}

            {/* Auditor Remarks (only for non-store admins) */}
            {!isStoreAdmin && (
              <section className="rounded-[8px] bg-white px-6 py-8 shadow-sm border border-gray-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 border-b border-gray-100 pb-3">
                  <h2 className="text-[16px] font-bold text-black">
                    Auditor Remarks
                  </h2>
                  <span className="text-xs font-semibold text-red-600 bg-red-50 px-3 py-1 rounded-full border border-red-200 self-start sm:self-auto flex items-center gap-1.5">
                    <FaExclamationTriangle className="text-red-500 text-[10px]" />
                    Both remarks are mandatory *
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-[14px] font-semibold text-[#30343b]">
                      Observation Acknowledged <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={3}
                      value={values["audit-observation"] || ""}
                      onChange={(e) =>
                        setValues((prev) => ({ ...prev, "audit-observation": e.target.value }))
                      }
                      placeholder="Key observations noted during this rating (Required)..."
                      className={`w-full rounded-[6px] border px-3 py-2 text-[14px] outline-none focus:border-gray-500 resize-none ${
                        errors?.["audit-observation"] ? "border-red-500 bg-red-50/40" : "border-gray-200"
                      }`}
                    />
                    {errors?.["audit-observation"] && (
                      <p className="text-xs text-red-600 font-semibold mt-1">Observation Acknowledged is required.</p>
                    )}
                  </div>
                  <div>
                    <label className="mb-2 block text-[14px] font-semibold text-[#30343b]">
                      Action Plan for Shortfalls <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={3}
                      value={values["audit-action-plan"] || ""}
                      onChange={(e) =>
                        setValues((prev) => ({ ...prev, "audit-action-plan": e.target.value }))
                      }
                      placeholder="Steps to address identified shortfalls (Required)..."
                      className={`w-full rounded-[6px] border px-3 py-2 text-[14px] outline-none focus:border-gray-500 resize-none ${
                        errors?.["audit-action-plan"] ? "border-red-500 bg-red-50/40" : "border-gray-200"
                      }`}
                    />
                    {errors?.["audit-action-plan"] && (
                      <p className="text-xs text-red-600 font-semibold mt-1">Action Plan for Shortfalls is required.</p>
                    )}
                  </div>
                </div>
              </section>
            )}

            {/* Submit */}
            <div className="flex justify-center pb-8">
              <button
                type="submit"
                disabled={saving}
                className="min-w-[200px] rounded-[8px] bg-[#1f1b22] px-10 py-3 text-[16px] font-semibold text-white transition hover:bg-black disabled:opacity-70"
              >
                {saving ? "Saving..." : "Save Rating"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BranchAuditForm;
