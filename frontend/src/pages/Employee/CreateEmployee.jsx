import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Select from "react-select";
import SideNav from "../../components/SideNav/SideNav";
import baseUrl from "../../api/api";

const DESIGNATIONS = [
  "Assistant General Manager",
  "Assistant Store Manager",
  "Billing Staff",
  "Cleaning Staff",
  "Customer Relations Executive",
  "Electrician",
  "Fashion Consultant",
  "Fashion Designer",
  "Fashion Stylist",
  "Flutter Developer Internal",
  "Fullstack Developer (MERN) Intern",
  "Generalist",
  "HR Executive",
  "HR Recruiter",
  "IT Head",
  "Jewellery Stylist",
  "Maintenance Manager",
  "Manager",
  "Managing Director",
  "Office Admin",
  "Process Quality Manager",
  "Product Designer",
  "Project manager",
  "Quality Control",
  "Security System Monitor",
  "Senior Sales Associate",
  "Software QA intern",
  "Store Manager",
  "Tailor",
  "Telecaller",
  "Training Manager",
  "Video Creator",
  "Warehouse Incharge",
  "Warehouse Manager",
  "Warehouse Staff",
  "ZQ Admin",
  "ZQ Assistant Admin"
];

const CreateEmployee = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    empID: "",
    username: "",
    workingBranch: "",
    locCode: "",
    location: "",
    designation: "",
    email: "",
    phoneNumber: "",
    password: "",
  });

  const [selectedStoreOptions, setSelectedStoreOptions] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const storesRes = await fetch(`${baseUrl.baseUrl}api/usercreate/getBranch/public`);
        const storesJson = await storesRes.json();
        if (storesJson.data) setStores(storesJson.data);
      } catch (err) {
        console.error("Error fetching stores:", err);
        toast.error("Failed to load stores");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleStoreSelectChange = (selectedOptions) => {
    const hasAll = (selectedOptions || []).some(opt => opt.value === "all");
    let finalSelection = [];

    if (hasAll) {
      finalSelection = [{ value: "all", label: "All Stores" }];
      setForm(prev => ({
        ...prev,
        workingBranch: "All Stores",
        locCode: "All",
        location: "All Locations",
      }));
    } else {
      finalSelection = selectedOptions || [];
      const branchNames = finalSelection.map(opt => opt.label).join(", ");
      const locCodes = finalSelection.map(opt => opt.value).join(", ");
      setForm(prev => ({
        ...prev,
        workingBranch: branchNames,
        locCode: locCodes,
        location: finalSelection.length > 0 ? "Multiple Locations" : "",
      }));
    }

    setSelectedStoreOptions(finalSelection);
  };

  const customSelectStyles = {
    control: (provided, state) => ({
      ...provided,
      borderRadius: "10px",
      borderColor: state.isFocused ? "#111827" : "#e5e7eb",
      boxShadow: "none",
      minHeight: "40px",
      fontSize: "13px",
      fontFamily: "Poppins, sans-serif",
      "&:hover": {
        borderColor: "#111827",
      },
    }),
    valueContainer: (provided) => ({
      ...provided,
      padding: "2px 12px",
    }),
    placeholder: (provided) => ({
      ...provided,
      color: "#9ca3af",
    }),
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !form.empID ||
      !form.username ||
      !form.workingBranch ||
      !form.designation ||
      !form.email ||
      !form.phoneNumber ||
      !form.password
    ) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`${baseUrl.baseUrl}api/usercreate/create-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...form,
          empID: form.empID.toLowerCase().trim(),
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || "Failed to create employee");
      }

      toast.success("Employee created successfully!");
      navigate("/employee");
    } catch (err) {
      toast.error(err.message || "Failed to create employee");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={styles.container}>
      <SideNav />

      <div style={styles.content}>
        <div style={styles.header}>
          <button type="button" onClick={() => navigate("/employee")} style={styles.backButton}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#111827"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
          </button>
          <h2 style={styles.title}>Create New Employee</h2>
        </div>

        <div style={styles.card}>
          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "48px" }}>
              <div style={styles.spinner} />
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div style={styles.grid}>
                <div style={styles.field}>
                  <label style={styles.label}>
                    Emp ID<span style={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    name="empID"
                    placeholder="Enter Employee ID"
                    value={form.empID}
                    onChange={handleChange}
                    required
                    style={styles.input}
                  />
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>
                    Emp Name<span style={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    name="username"
                    placeholder="Enter Employee Name"
                    value={form.username}
                    onChange={handleChange}
                    required
                    style={styles.input}
                  />
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>
                    Store Name<span style={styles.required}>*</span>
                  </label>
                  {/*
                  <Select
                    placeholder="Select Store"
                    options={[
                      { value: "all", label: "All Stores" },
                      ...stores.map((s) => ({
                        value: String(s.locCode),
                        label: s.workingBranch,
                      })),
                    ]}
                    isMulti
                    value={selectedStoreOptions}
                    onChange={handleStoreSelectChange}
                    styles={customSelectStyles}
                  />
                  */}
                  <input
                    type="text"
                    name="workingBranch"
                    placeholder="Enter Store Name"
                    value={form.workingBranch}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val.trim().toLowerCase() === "all" || val.trim().toLowerCase() === "all stores") {
                        setForm(prev => ({
                          ...prev,
                          workingBranch: "All Stores",
                          locCode: "All",
                          location: "All Locations"
                        }));
                        return;
                      }

                      const inputBranches = val.split(',').map(name => name.trim().toLowerCase());
                      let hasManual = false;
                      const resolvedLocCodes = [];
                      const resolvedBranches = [];

                      inputBranches.forEach(inputBranch => {
                        if (!inputBranch) return;
                        const match = stores.find(s => 
                          (s.workingBranch && s.workingBranch.trim().toLowerCase() === inputBranch) || 
                          (s.locCode && String(s.locCode).trim().toLowerCase() === inputBranch)
                        );
                        if (match) {
                          resolvedLocCodes.push(String(match.locCode));
                          resolvedBranches.push(match.workingBranch);
                        } else {
                          resolvedLocCodes.push(inputBranch);
                          resolvedBranches.push(inputBranch);
                          hasManual = true;
                        }
                      });

                      setForm(prev => ({
                        ...prev,
                        workingBranch: val,
                        locCode: resolvedLocCodes.join(', '),
                        location: val ? (hasManual ? "Manual Entry" : (resolvedBranches.length > 1 ? "Multiple Locations" : "Store Location")) : ""
                      }));
                    }}
                    required
                    style={styles.input}
                  />
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>
                    Emp Designation<span style={styles.required}>*</span>
                  </label>
                  {/*
                  <select
                    name="designation"
                    value={form.designation}
                    onChange={handleChange}
                    required
                    style={{ ...styles.input, cursor: "pointer" }}
                  >
                    <option value="">Select Designation</option>
                    {DESIGNATIONS.map((designation, index) => (
                      <option key={index} value={designation}>
                        {designation}
                      </option>
                    ))}
                  </select>
                  */}
                  <input
                    type="text"
                    name="designation"
                    placeholder="Enter Designation"
                    value={form.designation}
                    onChange={handleChange}
                    required
                    style={styles.input}
                  />
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>
                    Email<span style={styles.required}>*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter Email Address"
                    value={form.email}
                    onChange={handleChange}
                    required
                    style={styles.input}
                  />
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>
                    Phone Number<span style={styles.required}>*</span>
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    placeholder="Enter Phone Number"
                    value={form.phoneNumber}
                    onChange={handleChange}
                    required
                    style={styles.input}
                  />
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>
                    Password<span style={styles.required}>*</span>
                  </label>
                  <input
                    type="password"
                    name="password"
                    placeholder="Enter Password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    style={styles.input}
                  />
                </div>
              </div>

              <button type="submit" disabled={saving} style={styles.saveBtn}>
                {saving ? "Saving..." : "Save New Employee"}
              </button>
            </form>
          )}
        </div>
      </div>
      <style>{`
        @keyframes create-emp-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    background: "#f9fafb",
    fontFamily: "Poppins, sans-serif",
  },
  content: {
    marginLeft: "120px",
    paddingTop: "24px",
    paddingLeft: "24px",
    paddingRight: "24px",
    paddingBottom: "40px",
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "20px",
  },
  backButton: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 0,
    display: "flex",
    alignItems: "center",
  },
  title: {
    fontSize: "20px",
    fontWeight: 700,
    color: "#111827",
    margin: 0,
  },
  card: {
    background: "#fff",
    borderRadius: "16px",
    border: "1px solid #f0f0f0",
    boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
    padding: "28px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "16px",
    marginBottom: "24px",
  },
  field: {
    display: "flex",
    flexDirection: "column",
  },
  label: {
    fontSize: "11px",
    fontWeight: 600,
    color: "#374151",
    marginBottom: "6px",
    display: "block",
  },
  input: {
    border: "1px solid #e5e7eb",
    borderRadius: "10px",
    padding: "9px 12px",
    fontSize: "13px",
    color: "#374151",
    outline: "none",
    background: "#fff",
    width: "100%",
    boxSizing: "border-box",
    fontFamily: "Poppins, sans-serif",
    height: "40px",
  },
  required: {
    color: "#ef4444",
    marginLeft: "2px",
  },
  saveBtn: {
    background: "#111827",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    padding: "10px 24px",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "Poppins, sans-serif",
    marginTop: "8px",
  },
  spinner: {
    width: "28px",
    height: "28px",
    border: "2px solid #e5e7eb",
    borderTopColor: "#111827",
    borderRadius: "50%",
    animation: "create-emp-spin 0.7s linear infinite",
  },
};

export default CreateEmployee;
