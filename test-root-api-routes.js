// Test script for root API directory structure
// This tests the API routes in the root /api directory

const testRootApiRoutes = async () => {
  const baseUrl = 'https://lms-testenv-q8co.vercel.app';
  
  console.log('🧪 Testing Root API Directory Structure...');
  console.log(`📍 Base URL: ${baseUrl}`);
  console.log('💡 API routes should now be in root /api directory');
  
  // Test 1: Health check endpoint
  console.log('\n1️⃣ Testing API health check...');
  try {
    const healthResponse = await fetch(`${baseUrl}/api/`);
    console.log('✅ Health Check Status:', healthResponse.status);
    console.log('✅ Health Check Response:', await healthResponse.text());
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
  }
  
  // Test 2: OPTIONS preflight for training process
  console.log('\n2️⃣ Testing OPTIONS preflight for training process...');
  try {
    const optionsResponse = await fetch(`${baseUrl}/api/user/update/trainingprocess`, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'http://localhost:5173',
        'Access-Control-Request-Method': 'PATCH',
        'Access-Control-Request-Headers': 'Authorization, Content-Type'
      }
    });
    
    console.log('✅ OPTIONS Response Status:', optionsResponse.status);
    console.log('✅ CORS Headers:');
    console.log('   - Access-Control-Allow-Origin:', optionsResponse.headers.get('Access-Control-Allow-Origin'));
    console.log('   - Access-Control-Allow-Methods:', optionsResponse.headers.get('Access-Control-Allow-Methods'));
    console.log('   - Access-Control-Allow-Headers:', optionsResponse.headers.get('Access-Control-Allow-Headers'));
    console.log('   - Access-Control-Allow-Credentials:', optionsResponse.headers.get('Access-Control-Allow-Credentials'));
    
  } catch (error) {
    console.error('❌ OPTIONS request failed:', error.message);
  }
  
  // Test 3: PATCH request to training process
  console.log('\n3️⃣ Testing PATCH request to training process...');
  try {
    const patchResponse = await fetch(`${baseUrl}/api/user/update/trainingprocess?userId=test&trainingId=test&moduleId=test&videoId=test`, {
      method: 'PATCH',
      headers: {
        'Origin': 'http://localhost:5173',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token'
      }
    });
    
    console.log('✅ PATCH Response Status:', patchResponse.status);
    console.log('✅ CORS Headers:');
    console.log('   - Access-Control-Allow-Origin:', patchResponse.headers.get('Access-Control-Allow-Origin'));
    console.log('   - Access-Control-Allow-Credentials:', patchResponse.headers.get('Access-Control-Allow-Credentials'));
    
    // Get response body
    const responseText = await patchResponse.text();
    console.log('✅ PATCH Response Body:', responseText);
    
  } catch (error) {
    console.error('❌ PATCH request failed:', error.message);
  }
  
  // Test 4: Test frontend still works
  console.log('\n4️⃣ Testing frontend still works...');
  try {
    const frontendResponse = await fetch(`${baseUrl}/`);
    console.log('✅ Frontend Response Status:', frontendResponse.status);
    const frontendText = await frontendResponse.text();
    console.log('✅ Frontend contains HTML:', frontendText.includes('<html>'));
  } catch (error) {
    console.error('❌ Frontend test failed:', error.message);
  }
  
  console.log('\n🎯 Root API Directory Test Complete!');
  console.log('\n📋 Expected Results:');
  console.log('   ✅ Health check should return JSON API message');
  console.log('   ✅ OPTIONS should have CORS headers');
  console.log('   ✅ PATCH should work (even if data is invalid)');
  console.log('   ✅ Frontend should still work');
  console.log('\n💡 Root /api directory is the correct Vercel structure');
};

// Run the test
testRootApiRoutes().catch(console.error);
