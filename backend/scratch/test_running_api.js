import axios from 'axios';

async function testRunningApi() {
  const url = 'http://localhost:7000/api/store-targets/week-by-date';
  const token = 'RootX-production-9d17d9485eb772e79df8564004d4a4d4';
  
  const testDates = [
    { date: '2026-07-16', storeName: 'All' },
    { date: '2026-10-15', storeName: 'G-Edappally' }
  ];

  console.log("------------------------------------------------------------------");
  console.log(`📡 Sending test requests to: ${url}`);
  console.log("------------------------------------------------------------------\n");

  for (const item of testDates) {
    try {
      console.log(`👉 Querying Date: ${item.date} for Store: ${item.storeName}...`);
      const response = await axios.get(url, {
        params: item,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = response.data;
      console.log(`   Success: ${data.success}`);
      console.log(`   Input Date: ${data.inputDate}`);
      console.log(`   Resolved Day: ${data.day}`);
      console.log(`   Resolved Week: ${data.week} (${data.weekLabel})`);
      console.log(`   Matched Date Range: "${data.dateRange}"`);
      console.log(`   Is Configured in DB: ${data.isConfigured}`);
      console.log(`   Configuration Source: "${data.configSource}"`);
      console.log(`   Store Config status: Exists = ${data.storeConfig.exists}`);
      console.log(`   Global Config status: Exists = ${data.globalConfig.exists}`);
      console.log(`   All Weeks configured/derived:`);
      data.allWeeks.forEach(w => {
        console.log(`     • ${w.weekLabel}: ${w.dateRange}${w.isCurrent ? ' <-- (CURRENT)' : ''}${w.isFallback ? ' (fallback calendar range)' : ''}`);
      });
      console.log("------------------------------------------------------------------\n");

    } catch (error) {
      console.error(`❌ Failed to query ${item.date}:`, error.message);
      if (error.response) {
        console.error("   Response Data:", error.response.data);
      }
      console.log("------------------------------------------------------------------\n");
    }
  }
}

testRunningApi();
