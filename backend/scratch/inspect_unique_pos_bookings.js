import fetch from 'node-fetch';

async function run() {
  const locCode = '701';
  const dateFrom = '2026-07-01';
  const dateTo = '2026-07-29';

  const bookingUrl = `https://rentalapi.rootments.live/api/GetBooking/GetBookingList?LocCode=${locCode}&DateFrom=${dateFrom}&DateTo=${dateTo}`;
  const res = await fetch(bookingUrl);
  const json = await res.json();
  const list = Array.isArray(json) ? json : (json.data || json.dataSet?.data || []);

  const abhijithBookings = list.filter(b => {
    const staff = String(b.bookingBy || '').toLowerCase();
    return staff.includes('abhijith');
  });

  const uniqueInvoices = new Set(abhijithBookings.map(b => b.invoiceNo));
  const uniquePhones = new Set(abhijithBookings.map(b => b.phoneNo));

  console.log(`Total Booking Items in POS: ${abhijithBookings.length}`);
  console.log(`Unique Invoice Numbers in POS: ${uniqueInvoices.size}`);
  console.log(`Unique Customer Phone Numbers in POS: ${uniquePhones.size}`);

  console.log('\nList of Unique Invoices in POS for Abhijith:');
  console.log(Array.from(uniqueInvoices));
}

run();
