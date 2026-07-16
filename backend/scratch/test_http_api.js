import { spawn } from 'child_process';
import axios from 'axios';
import path from 'path';

async function runHttpTest() {
  console.log("Starting server.js as a background process on port 7099...");
  
  const serverProcess = spawn('node', ['server.js'], {
    cwd: path.resolve(''),
    env: { ...process.env, PORT: '7099' }
  });

  serverProcess.stdout.on('data', (data) => {
    const line = data.toString().trim();
    if (line.includes('Server running on port')) console.log(`[Server]: ${line}`);
  });

  console.log("Waiting 6 seconds for the server to bind and connect to MongoDB...");
  await new Promise((resolve) => setTimeout(resolve, 6000));

  let success = false;
  try {
    const token = 'RootX-production-9d17d9485eb772e79df8564004d4a4d4';
    
    console.log("\nSending HTTP GET request with system token...");
    const responseGet = await axios.get('http://localhost:7099/api/store-targets/week-by-date', {
      params: {
        date: '2026-07-16',
        storeName: 'All'
      },
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log("GET Response:", JSON.stringify(responseGet.data, null, 2));

    if (responseGet.data.storeConfig && responseGet.data.globalConfig && responseGet.data.configSource) {
      console.log("✅ HTTP GET response contains storeConfig, globalConfig, and configSource fields!");
      success = true;
    } else {
      throw new Error("Missing required config mapping fields");
    }

  } catch (error) {
    console.error("❌ HTTP Integration Test Failed:", error.message);
  } finally {
    console.log("Killing server process...");
    serverProcess.kill('SIGTERM');
    setTimeout(() => {
      process.exit(success ? 0 : 1);
    }, 1000);
  }
}

runHttpTest();
