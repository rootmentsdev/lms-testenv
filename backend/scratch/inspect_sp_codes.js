import fetch from 'node-fetch';

const BASE = "https://backend.brynex.com/api/external/shoe-sales";

async function inspectCodes() {
  const TODAY = new Date();
  const pad = n => String(n).padStart(2, "0");
  const toDateStr = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const periodStart = toDateStr(new Date(TODAY.getFullYear(), TODAY.getMonth(), 1));
  const periodEnd = toDateStr(TODAY);

  const res = await fetch(`${BASE}/by-salesperson?fromDate=${periodStart}&toDate=${periodEnd}`);
  const data = await res.json();
  const list = data.salespersons || [];
  
  console.log(`=== BRYNEX SHOE SALESPERSONS (${list.length}) ===`);
  list.forEach(sp => {
    console.log(`Salesperson: "${sp.salesperson}" | empId: "${sp.empId}" | employeeId: "${sp.employeeId}"`);
  });
}

inspectCodes();
