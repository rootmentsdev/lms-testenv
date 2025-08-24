// Debug script for Vercel CORS issues
// This will help identify exactly what's happening

const debugVercelCors = async () => {
  const baseUrl = 'https://lms-testenv-q8co.vercel.app';
  const endpoint = '/api/user/update/trainingprocess';
  
  console.log('🔍 Debugging Vercel CORS configuration...');
  console.log(`📍 Testing endpoint: ${baseUrl}${endpoint}`);
  console.log(`🌐 Testing from origin: http://localhost:5173`);
  
  // Test 1: Basic GET request to see if server responds
  console.log('\n1️⃣ Testing basic server response...');
  try {
    const basicResponse = await fetch(`${baseUrl}/`);
    console.log('✅ Basic Response Status:', basicResponse.status);
    console.log('✅ Basic Response Text:', await basicResponse.text());
  } catch (error) {
    console.error('❌ Basic request failed:', error.message);
  }
  
  // Test 2: OPTIONS preflight request
  console.log('\n2️⃣ Testing OPTIONS preflight request...');
  try {
    const optionsResponse = await fetch(`${baseUrl}${endpoint}`, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'http://localhost:5173',
        'Access-Control-Request-Method': 'PATCH',
        'Access-Control-Request-Headers': 'Authorization, Content-Type'
      }
    });
    
    console.log('✅ OPTIONS Response Status:', optionsResponse.status);
    console.log('✅ OPTIONS Response Headers:');
    
    // Log all response headers
    for (const [key, value] of optionsResponse.headers.entries()) {
      console.log(`   ${key}: ${value}`);
    }
    
    // Check specific CORS headers
    console.log('\n🔍 CORS Header Analysis:');
    console.log('   - Access-Control-Allow-Origin:', optionsResponse.headers.get('Access-Control-Allow-Origin'));
    console.log('   - Access-Control-Allow-Methods:', optionsResponse.headers.get('Access-Control-Allow-Methods'));
    console.log('   - Access-Control-Allow-Headers:', optionsResponse.headers.get('Access-Control-Allow-Headers'));
    console.log('   - Access-Control-Allow-Credentials:', optionsResponse.headers.get('Access-Control-Allow-Credentials'));
    console.log('   - Access-Control-Max-Age:', optionsResponse.headers.get('Access-Control-Max-Age'));
    
  } catch (error) {
    console.error('❌ OPTIONS request failed:', error.message);
  }
  
  // Test 3: PATCH request with detailed error analysis
  console.log('\n3️⃣ Testing PATCH request...');
  try {
    const patchResponse = await fetch(`${baseUrl}${endpoint}?userId=test&trainingId=test&moduleId=test&videoId=test`, {
      method: 'PATCH',
      headers: {
        'Origin': 'http://localhost:5173',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token'
      }
    });
    
    console.log('✅ PATCH Response Status:', patchResponse.status);
    console.log('✅ PATCH Response Headers:');
    
    // Log all response headers
    for (const [key, value] of patchResponse.headers.entries()) {
      console.log(`   ${key}: ${value}`);
    }
    
    // Check specific CORS headers
    console.log('\n🔍 PATCH CORS Header Analysis:');
    console.log('   - Access-Control-Allow-Origin:', patchResponse.headers.get('Access-Control-Allow-Origin'));
    console.log('   - Access-Control-Allow-Credentials:', patchResponse.headers.get('Access-Control-Allow-Credentials'));
    
    // Get response body
    const responseText = await patchResponse.text();
    console.log('✅ PATCH Response Body:', responseText);
    
  } catch (error) {
    console.error('❌ PATCH request failed:', error.message);
  }
  
  // Test 4: Test with different origin to see if CORS is working at all
  console.log('\n4️⃣ Testing with different origin (should be blocked)...');
  try {
    const blockedResponse = await fetch(`${baseUrl}${endpoint}`, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'https://malicious-site.com',
        'Access-Control-Request-Method': 'PATCH'
      }
    });
    
    console.log('✅ Blocked Origin Response Status:', blockedResponse.status);
    console.log('✅ Blocked Origin CORS Headers:');
    console.log('   - Access-Control-Allow-Origin:', blockedResponse.headers.get('Access-Control-Allow-Origin'));
    
  } catch (error) {
    console.error('❌ Blocked origin test failed:', error.message);
  }
  
  console.log('\n🎯 Debug Complete!');
  console.log('\n📋 Analysis:');
  console.log('   - If CORS headers are null, the issue is in Vercel configuration');
  console.log('   - If PATCH returns 405, the route is not properly registered');
  console.log('   - If OPTIONS works but PATCH doesn\'t, it\'s a routing issue');
};

// Run the debug
debugVercelCors().catch(console.error);
