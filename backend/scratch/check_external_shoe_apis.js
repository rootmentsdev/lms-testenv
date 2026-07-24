import fetch from 'node-fetch';

const TODAY = new Date();
const pad = n => String(n).padStart(2, "0");
const toDateStr = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

// Query for current month range
const PERIOD_START = toDateStr(new Date(TODAY.getFullYear(), TODAY.getMonth(), 1));
const PERIOD_END = toDateStr(TODAY);
const BASE = "https://backend.brynex.com/api/external/shoe-sales";

async function runCheck() {
  console.log(`Checking Brynex Shoe Sales APIs from ${PERIOD_START} to ${PERIOD_END}...\n`);

  // 1. /bookings
  try {
    const url = `${BASE}/bookings?fromDate=${PERIOD_START}&toDate=${PERIOD_END}`;
    console.log(`Fetching GET ${url}`);
    const res = await fetch(url);
    const data = await res.json();
    console.log(`\n--- 1. BOOKINGS RESPONSE (Total items: ${Array.isArray(data) ? data.length : 'Object'}) ---`);
    if (Array.isArray(data) && data.length > 0) {
      console.log('Sample Record Keys:', Object.keys(data[0]));
      console.log('Sample Record Body:\n', JSON.stringify(data[0], null, 2));
    } else {
      console.log('Response body:', JSON.stringify(data, null, 2));
    }
  } catch (err) {
    console.error('Error fetching bookings:', err.message);
  }

  // 2. /returns
  try {
    const url = `${BASE}/returns?fromDate=${PERIOD_START}&toDate=${PERIOD_END}`;
    console.log(`\nFetching GET ${url}`);
    const res = await fetch(url);
    const data = await res.json();
    console.log(`\n--- 2. RETURNS RESPONSE (Total items: ${Array.isArray(data) ? data.length : 'Object'}) ---`);
    if (Array.isArray(data) && data.length > 0) {
      console.log('Sample Record Keys:', Object.keys(data[0]));
      console.log('Sample Record Body:\n', JSON.stringify(data[0], null, 2));
    } else {
      console.log('Response body:', JSON.stringify(data, null, 2));
    }
  } catch (err) {
    console.error('Error fetching returns:', err.message);
  }

  // 3. /summary
  try {
    const url = `${BASE}/summary?fromDate=${PERIOD_START}&toDate=${PERIOD_END}`;
    console.log(`\nFetching GET ${url}`);
    const res = await fetch(url);
    const data = await res.json();
    console.log(`\n--- 3. SUMMARY RESPONSE ---`);
    console.log('Keys in summary:', Object.keys(data));
    console.log('Response body:\n', JSON.stringify(data, null, 2).slice(0, 1500));
  } catch (err) {
    console.error('Error fetching summary:', err.message);
  }

  // 4. /by-salesperson
  try {
    const url = `${BASE}/by-salesperson?fromDate=${PERIOD_START}&toDate=${PERIOD_END}`;
    console.log(`\nFetching GET ${url}`);
    const res = await fetch(url);
    const data = await res.json();
    console.log(`\n--- 4. BY-SALESPERSON RESPONSE ---`);
    if (data && data.salespersons && data.salespersons.length > 0) {
      console.log('Sample Salesperson Record:', JSON.stringify(data.salespersons[0], null, 2));
    } else {
      console.log('Response body:\n', JSON.stringify(data, null, 2).slice(0, 1500));
    }
  } catch (err) {
    console.error('Error fetching by-salesperson:', err.message);
  }
}

runCheck();
