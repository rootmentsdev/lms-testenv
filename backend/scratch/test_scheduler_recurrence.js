import { shouldGenerateToday } from '../services/autoTaskGenerationService.js';

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  } else {
    console.log(`✅ PASSED: ${message}`);
  }
}

console.log("Running scheduler recurrence tests...");

// --- Quarterly Tests ---
const qTemplate = {
  startDate: '2026-01-15',
  repeatType: 'quarterly',
  endDate: ''
};

assert(shouldGenerateToday(qTemplate, '2026-01-15') === true, "Quarterly: matches start date");
assert(shouldGenerateToday(qTemplate, '2026-02-15') === false, "Quarterly: wrong month (1 month after)");
assert(shouldGenerateToday(qTemplate, '2026-03-15') === false, "Quarterly: wrong month (2 months after)");
assert(shouldGenerateToday(qTemplate, '2026-04-15') === true, "Quarterly: correct month (3 months after, same day)");
assert(shouldGenerateToday(qTemplate, '2026-04-14') === false, "Quarterly: correct month but wrong day");
assert(shouldGenerateToday(qTemplate, '2026-07-15') === true, "Quarterly: correct month (6 months after, same day)");
assert(shouldGenerateToday(qTemplate, '2027-01-15') === true, "Quarterly: correct month (12 months after, same day)");

// --- Quarterly Day Bounds Test ---
const qBoundTemplate = {
  startDate: '2026-08-31', // August 31st
  repeatType: 'quarterly',
  endDate: ''
};
// 3 months after August is November (which has only 30 days)
assert(shouldGenerateToday(qBoundTemplate, '2026-11-30') === true, "Quarterly Bound: November 30th matches August 31st");
assert(shouldGenerateToday(qBoundTemplate, '2026-11-31') === false, "Quarterly Bound: November 31st doesn't exist");
assert(shouldGenerateToday(qBoundTemplate, '2026-11-29') === false, "Quarterly Bound: November 29th doesn't match");

// --- Yearly Tests ---
const yTemplate = {
  startDate: '2026-01-15',
  repeatType: 'yearly',
  endDate: ''
};

assert(shouldGenerateToday(yTemplate, '2026-01-15') === true, "Yearly: matches start date");
assert(shouldGenerateToday(yTemplate, '2026-04-15') === false, "Yearly: wrong month (3 months after)");
assert(shouldGenerateToday(yTemplate, '2027-01-15') === true, "Yearly: correct date (1 year later)");
assert(shouldGenerateToday(yTemplate, '2027-01-16') === false, "Yearly: wrong day (1 year later)");
assert(shouldGenerateToday(yTemplate, '2028-01-15') === true, "Yearly: correct date (2 years later)");

// --- Yearly Leap Year / Month End Bounds Test ---
const yLeapTemplate = {
  startDate: '2024-02-29', // Leap year
  repeatType: 'yearly',
  endDate: ''
};
assert(shouldGenerateToday(yLeapTemplate, '2025-02-28') === true, "Yearly Bound: Feb 28, 2025 matches Feb 29, 2024");
assert(shouldGenerateToday(yLeapTemplate, '2025-02-29') === false, "Yearly Bound: Feb 29, 2025 doesn't exist");
assert(shouldGenerateToday(yLeapTemplate, '2028-02-29') === true, "Yearly Bound: Feb 29, 2028 matches Feb 29, 2024");

console.log("\n🎉 All scheduler recurrence tests passed successfully!");
