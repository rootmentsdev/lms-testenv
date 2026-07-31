import fetch from 'node-fetch';

async function run() {
  try {
    const locCode = '701'; // G.Kottayam
    const dateFrom = '2026-07-01';
    const dateTo = '2026-07-29';

    // 1. Get Performance Summary API
    const perfRes = await fetch("https://rentalapi.rootments.live/api/Reports/GetPerformanceStaffReportWithCancel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        DateFrom: dateFrom,
        DateTo: dateTo,
        BookingNo: "",
        LocationID: locCode,
        UserID: "7777"
      })
    });
    const perfJson = await perfRes.json();
    console.log('--- 1. GetPerformanceStaffReportWithCancel ---');
    console.log(perfJson.dataSet?.data);

    // 2. Get Booking List API (Detailed POS Rental Bookings)
    const bookingUrl = `https://rentalapi.rootments.live/api/GetBooking/GetBookingList?LocCode=${locCode}&DateFrom=${dateFrom}&DateTo=${dateTo}`;
    const bookingRes = await fetch(bookingUrl);
    if (bookingRes.ok) {
      const bookingData = await bookingRes.json();
      const list = Array.isArray(bookingData) ? bookingData : (bookingData.data || bookingData.dataSet?.data || []);
      console.log(`\n--- 2. GetBookingList (Total Rental Invoices: ${list.length}) ---`);
      
      // Filter for Abhijith
      const abhijithBookings = list.filter(b => {
        const staff = String(b.bookingBy || b.Staff || b.staff || b.salesPerson || '').toLowerCase();
        return staff.includes('abhijith');
      });
      console.log(`Abhijith Rental Bookings count: ${abhijithBookings.length}`);
      if (abhijithBookings.length > 0) {
        console.log('Sample Rental Booking item:');
        console.log(abhijithBookings[0]);
      }
    } else {
      console.log(`GetBookingList response status: ${bookingRes.status}`);
    }

  } catch (err) {
    console.error('Error:', err);
  }
}

run();
