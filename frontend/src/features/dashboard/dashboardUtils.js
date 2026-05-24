/** Normalize HomeProgress API payload to a branch array. */
export function normalizeBranchProgress(responseData) {
  const raw = responseData?.data;
  return Array.isArray(raw) ? raw : raw ? Object.values(raw) : [];
}

/** Last 7 calendar days (oldest first). */
export function last7Days() {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d);
  }
  return days;
}

export function dateKey(raw) {
  if (!raw) return null;
  const parts = String(raw).split('-');
  if (parts.length === 3 && parts[2].length === 4) {
    return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
  }
  return String(raw).split('T')[0];
}

/** Derive training/assessment counts from HomeProgress percentage fields. */
export function countFromPercent(percent, total) {
  if (!total) return 0;
  return Math.round(((percent || 0) / 100) * total);
}
