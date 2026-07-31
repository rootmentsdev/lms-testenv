import fetch from 'node-fetch';

async function run() {
  try {
    const res = await fetch("https://rentalapi.rootments.live/api/Reports/GetPerformanceStaffReportWithCancel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        DateFrom: "2026-07-01",
        DateTo: "2026-07-29",
        BookingNo: "",
        LocationID: "",
        UserID: "7777"
      })
    });
    const json = await res.json();
    console.log('--- ALL KEYS IN GetPerformanceStaffReportWithCancel ---');
    const data = json.dataSet?.data || [];
    console.log(`Total rows: ${data.length}`);
    if (data.length > 0) {
      console.log('Sample Row 0 Keys:', Object.keys(data[0]));
      console.log('Sample Row 0 Content:', data[0]);

      const abhijith = data.find(r => (r.bookingBy || '').toLowerCase().includes('abhijith'));
      console.log('\nAbhijith Row Content:', abhijith);
    }
  } catch (err) {
    console.error('Error:', err);
  }
}

run();
