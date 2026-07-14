import axios from 'axios';

async function main() {
    const locCode = '700';
    const dateFrom = '2026-06-29';
    const dateTo = '2026-07-02';

    const urls = {
        Booking: `https://rentalapi.rootments.live/api/GetBooking/GetBookingList?LocCode=${locCode}&DateFrom=${dateFrom}&DateTo=${dateTo}`,
        Rentout: `https://rentalapi.rootments.live/api/GetBooking/GetRentoutList?LocCode=${locCode}&DateFrom=${dateFrom}&DateTo=${dateTo}`,
        Return: `https://rentalapi.rootments.live/api/GetBooking/GetReturnList?LocCode=${locCode}&DateFrom=${dateFrom}&DateTo=${dateTo}`,
        Delete: `https://rentalapi.rootments.live/api/GetBooking/GetDeleteList?LocCode=${locCode}&DateFrom=${dateFrom}&DateTo=${dateTo}`,
        ShoeBilled: `https://backend.brynex.com/api/external/shoe-sales/bookings?fromDate=${dateFrom}&toDate=${dateTo}&locCode=${locCode}`
    };

    for (const [name, url] of Object.entries(urls)) {
        try {
            const res = await axios.get(url, { timeout: 15000 });
            let list = [];
            const rawData = res.data;
            if (rawData) {
                if (Array.isArray(rawData)) {
                    list = rawData;
                } else if (rawData.dataSet && Array.isArray(rawData.dataSet.data)) {
                    list = rawData.dataSet.data;
                } else if (Array.isArray(rawData.data)) {
                    list = rawData.data;
                }
            }

            const june30Items = list.filter(item => {
                const dateVal = item.bookingDate || item.rentOutDate || item.returnedDate || item.billedDate || item.date;
                return dateVal && dateVal.startsWith('2026-06-30');
            });

            console.log(`\n=== June 30 items in ${name} (Count: ${june30Items.length}) ===`);
            june30Items.forEach((item, idx) => {
                console.log(`  [${idx + 1}]`, JSON.stringify(item));
            });
        } catch (e) {
            console.error(`Error fetching ${name}:`, e.message);
        }
    }
}

main().catch(console.error);
