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

export function fetchHomeProgress() {
  return fetchJson("api/admin/get/HomeProgressData");
}

export function fetchDashboardTasks() {
  return fetchJson("api/task/list");
}

export function fetchWeeklyWalkins(daysCount = 7) {
  const totalDays = Math.max(1, Number(daysCount) || 7);
  const days = Array.from({ length: totalDays }, (_, index) => {
    const d = new Date();
    d.setDate(d.getDate() - (totalDays - 1 - index));
    return d;
  });
  const start = days[0].toISOString().split("T")[0];
  const end = days[days.length - 1].toISOString().split("T")[0];
  return fetchJson(`api/walkin/list?startDate=${start}&endDate=${end}`);
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
