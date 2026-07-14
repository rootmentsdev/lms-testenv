import fetch from 'node-fetch';

const TODAY = new Date();
const pad = n => String(n).padStart(2, "0");
const toDateStr = d => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const PERIOD_START = toDateStr(new Date(TODAY.getFullYear(), TODAY.getMonth(), 1));
const PERIOD_END   = toDateStr(TODAY);
const BASE = "https://backend.brynex.com/api/external/shoe-sales";

// Check TVM returns + Edappally returns for all fields
for (const store of [{ name: "G-Trivandrum", loc: "700" }, { name: "G-Edappally", loc: "702" }]) {
  const res = await fetch(`${BASE}/returns?fromDate=${PERIOD_START}&toDate=${PERIOD_END}&locCode=${store.loc}`);
  const data = await res.json();
  console.log(`\n=== ${store.name} RETURNS (${data.length}) ===`);
  data.forEach((r, i) => {
    console.log(`[${i+1}] ALL KEYS:`, Object.keys(r));
    console.log(`     DATA:`, JSON.stringify(r));
  });
}
