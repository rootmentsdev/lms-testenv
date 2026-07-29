import baseUrl from "../../api/api";

const authHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

async function fetchJson(path) {
  const res = await fetch(`${baseUrl.baseUrl}${path}`, {
    headers: authHeaders(),
    credentials: "include",
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Request failed");
  return json;
}

const pad2 = (n) => String(n).padStart(2, "0");

/** Extract YYYY-MM-DD as an IST calendar date (UTC+5:30), not browser-local time */
const toISTDateOnly = (date) => {
  const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
  const ist = new Date(date.getTime() + IST_OFFSET_MS);
  return `${ist.getUTCFullYear()}-${pad2(ist.getUTCMonth() + 1)}-${pad2(ist.getUTCDate())}`;
};

const normalizeDate = (value) => {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
};

const getPresetDateRange = (range) => {
  // Compute 'today' in IST calendar date to avoid off-by-one errors after 18:30 IST
  const todayIST = toISTDateOnly(new Date());
  const todayDate = new Date(`${todayIST}T00:00:00`);
  const key = String(range || "7");

  if (key === "7") {
    // Current week: Sunday through today
    const start = new Date(todayDate);
    start.setDate(todayDate.getDate() - todayDate.getDay());
    return { startDate: toISTDateOnly(start), endDate: todayIST };
  }

  if (key === "month") {
    // Current month: 1st of month through today
    const start = new Date(todayDate.getFullYear(), todayDate.getMonth(), 1);
    return { startDate: toISTDateOnly(start), endDate: todayIST };
  }

  if (key === "14" || key === "30" || key === "45") {
    const totalDays = Number(key);
    const start = new Date(todayDate);
    start.setDate(todayDate.getDate() - (totalDays - 1));
    return { startDate: toISTDateOnly(start), endDate: todayIST };
  }

  return null;
};

const buildWalkinChartPath = ({ range, startDate, endDate, chartOnly }) => {
  const useCustomRange = String(range) === "custom";
  const preset = getPresetDateRange(range);
  const start = useCustomRange && normalizeDate(startDate) ? toISTDateOnly(normalizeDate(startDate)) : preset?.startDate;
  const end = useCustomRange && normalizeDate(endDate) ? toISTDateOnly(normalizeDate(endDate)) : preset?.endDate;

  if (!start || !end) {
    throw new Error("A valid date range is required");
  }

  return `api/walkin/list?startDate=${start}&endDate=${end}&${chartOnly ? "chartOnly=true" : "dashboard=true"}`;
};

export function fetchHomeProgress() {
  return fetchJson("api/admin/get/HomeProgressSummary");
}

export function fetchHomeProgressChart() {
  return fetchJson("api/admin/get/HomeProgressData");
}

export function fetchDashboardTasks() {
  return fetchJson("api/task/list");
}

export function fetchWeeklyWalkins(daysCount = 7) {
  // Dashboard needs the full matching range, not a paginated slice.
  return fetchJson(buildWalkinChartPath({ range: daysCount, chartOnly: false }));
}

export function fetchDailyWalkinsChart({ range = "7", startDate, endDate } = {}) {
  return fetchJson(buildWalkinChartPath({ range, startDate, endDate, chartOnly: true }));
}

export function fetchWeeklyWalkinCount({ range = "7", startDate, endDate } = {}) {
  const useCustomRange = String(range) === "custom";
  const preset = getPresetDateRange(range);
  const start = useCustomRange && normalizeDate(startDate) ? toISTDateOnly(normalizeDate(startDate)) : preset?.startDate;
  const end = useCustomRange && normalizeDate(endDate) ? toISTDateOnly(normalizeDate(endDate)) : preset?.endDate;

  if (!start || !end) {
    throw new Error("A valid date range is required");
  }

  return fetchJson(`api/walkin/list?startDate=${start}&endDate=${end}&countOnly=true`);
}

export function fetchBestThreeUsers() {
  return fetchJson("api/admin/get/bestThreeUser");
}

export function fetchStoreManagerData() {
  return fetchJson("api/admin/get/storemanagerData");
}

export function fetchStoreManagerDueData() {
  return fetchJson("api/admin/get/storemanagerduedata");
}

export function fetchNotifications() {
  return fetchJson("api/admin/home/notification");
}

export function fetchLMSStats() {
  return fetchJson("api/lms-login/count-simple");
}
