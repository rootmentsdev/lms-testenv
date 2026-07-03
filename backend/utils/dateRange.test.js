/**
 * IST Date Range Utility — Verification Tests
 * ============================================
 * Run with: node --input-type=module < utils/dateRange.test.js
 * or:        node -e "import('./utils/dateRange.test.js')"
 */

import {
    getISTDayRange,
    getISTRangeBetween,
    isInISTRange,
    formatISTDateKey
} from './dateRange.js';

let passed = 0;
let failed = 0;

const assert = (label, actual, expected) => {
    const ok = actual === expected;
    if (ok) {
        console.log(`  ✅ ${label}`);
        passed++;
    } else {
        console.error(`  ❌ ${label}`);
        console.error(`       expected: ${expected}`);
        console.error(`       actual:   ${actual}`);
        failed++;
    }
};

// ─── TEST 1: Single date ────────────────────────────────────────────────────
console.log('\n[1] getISTDayRange("2026-07-03")');
{
    const { startUTC, nextDayStartUTC } = getISTDayRange('2026-07-03');
    assert(
        'startUTC       = 2026-07-02T18:30:00.000Z',
        startUTC.toISOString(),
        '2026-07-02T18:30:00.000Z'
    );
    assert(
        'nextDayStartUTC = 2026-07-03T18:30:00.000Z',
        nextDayStartUTC.toISOString(),
        '2026-07-03T18:30:00.000Z'
    );
}

// ─── TEST 2: Date range ─────────────────────────────────────────────────────
console.log('\n[2] getISTRangeBetween("2026-07-01", "2026-07-03")');
{
    const { startUTC, nextDayStartUTC } = getISTRangeBetween('2026-07-01', '2026-07-03');
    assert(
        'startUTC        = 2026-06-30T18:30:00.000Z',
        startUTC.toISOString(),
        '2026-06-30T18:30:00.000Z'
    );
    assert(
        'nextDayStartUTC = 2026-07-03T18:30:00.000Z',
        nextDayStartUTC.toISOString(),
        '2026-07-03T18:30:00.000Z'
    );
}

// ─── TEST 3: isInISTRange boundary checks ───────────────────────────────────
console.log('\n[3] isInISTRange boundaries for 2026-07-03');
{
    const { startUTC, nextDayStartUTC } = getISTDayRange('2026-07-03');

    // IST midnight = startUTC → should be IN range
    assert(
        'IST midnight (2026-07-02T18:30:00.000Z) is IN range',
        isInISTRange(new Date('2026-07-02T18:30:00.000Z'), startUTC, nextDayStartUTC),
        true
    );

    // 1ms before IST midnight → should NOT be in range
    assert(
        '1ms before IST midnight (2026-07-02T18:29:59.999Z) is NOT in range',
        isInISTRange(new Date('2026-07-02T18:29:59.999Z'), startUTC, nextDayStartUTC),
        false
    );

    // Last ms of IST day (23:59:59.999 IST = 2026-07-03T18:29:59.999Z) → should be IN range
    assert(
        'IST 23:59:59.999 (2026-07-03T18:29:59.999Z) is IN range',
        isInISTRange(new Date('2026-07-03T18:29:59.999Z'), startUTC, nextDayStartUTC),
        true
    );

    // nextDayStartUTC itself → should NOT be in range (exclusive upper bound)
    assert(
        'nextDayStartUTC (2026-07-03T18:30:00.000Z) is NOT in range (exclusive)',
        isInISTRange(new Date('2026-07-03T18:30:00.000Z'), startUTC, nextDayStartUTC),
        false
    );

    // null/undefined → should return false
    assert(
        'null date returns false',
        isInISTRange(null, startUTC, nextDayStartUTC),
        false
    );
}

// ─── TEST 4: formatISTDateKey ───────────────────────────────────────────────
console.log('\n[4] formatISTDateKey');
{
    // UTC midnight of July 3 = IST 05:30 on July 3 → key should be "2026-07-03"
    assert(
        'UTC 2026-07-03T00:00:00Z → IST key "2026-07-03"',
        formatISTDateKey(new Date('2026-07-03T00:00:00.000Z')),
        '2026-07-03'
    );

    // 2026-07-02T18:30:00Z = IST midnight July 3 → key should be "2026-07-03"
    assert(
        'UTC 2026-07-02T18:30:00Z → IST key "2026-07-03" (IST midnight boundary)',
        formatISTDateKey(new Date('2026-07-02T18:30:00.000Z')),
        '2026-07-03'
    );

    // 2026-07-02T18:29:59.999Z = 1ms before IST midnight July 3 → key should be "2026-07-02"
    assert(
        'UTC 2026-07-02T18:29:59.999Z → IST key "2026-07-02" (still July 2 IST)',
        formatISTDateKey(new Date('2026-07-02T18:29:59.999Z')),
        '2026-07-02'
    );

    // null → null
    assert(
        'null returns null',
        formatISTDateKey(null),
        null
    );
}

// ─── TEST 5: Frontend ISO string equivalency ────────────────────────────────
console.log('\n[5] Frontend explicit IST offset strings');
{
    // "2026-07-01T00:00:00+05:30" parsed should equal getISTDayRange("2026-07-01").startUTC
    const frontendStart = new Date('2026-07-01T00:00:00+05:30');
    const { startUTC } = getISTDayRange('2026-07-01');
    assert(
        '"2026-07-01T00:00:00+05:30" === getISTDayRange("2026-07-01").startUTC',
        frontendStart.toISOString(),
        startUTC.toISOString()
    );

    // "2026-07-03T23:59:59.999+05:30" parsed should equal nextDayStartUTC - 1ms
    const frontendEnd = new Date('2026-07-03T23:59:59.999+05:30');
    const { nextDayStartUTC } = getISTDayRange('2026-07-03');
    const expectedEndMs = nextDayStartUTC.getTime() - 1;
    assert(
        '"2026-07-03T23:59:59.999+05:30" is 1ms before nextDayStartUTC',
        frontendEnd.getTime(),
        expectedEndMs
    );
}

// ─── SUMMARY ────────────────────────────────────────────────────────────────
console.log(`\n${'─'.repeat(50)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);
if (failed === 0) {
    console.log('🎉 All tests passed — IST date range utility is correct!\n');
    process.exit(0);
} else {
    console.error(`🚨 ${failed} test(s) failed!\n`);
    process.exit(1);
}
