// Test script for Vercel deployment CORS
// Run this after deploying to Vercel

const testVercelCors = async () => {
  const baseUrl = 'https://lms-testenv-q8co.vercel.app';
  const endpoint = '/api/user/update/trainingprocess';
  
  console.log('🧪 Testing Vercel CORS configuration...');
  console.log(`📍 Testing endpoint: ${baseUrl}${endpoint}`);
  console.log(`🌐 Testing from origin: http://localhost:5173`);
  
  // Test 1: OPTIONS preflight request
  console.log('\n1️⃣ Testing OPTIONS preflight request...');
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
    console.log('✅ CORS Headers:');
    console.log('   - Access-Control-Allow-Origin:', optionsResponse.headers.get('Access-Control-Allow-Origin'));
    console.log('   - Access-Control-Allow-Methods:', optionsResponse.headers.get('Access-Control-Allow-Methods'));
    console.log('   - Access-Control-Allow-Headers:', optionsResponse.headers.get('Access-Control-Allow-Headers'));
    console.log('   - Access-Control-Allow-Credentials:', optionsResponse.headers.get('Access-Control-Allow-Credentials'));
    
  } catch (error) {
    console.error('❌ OPTIONS request failed:', error.message);
  }
  
  // Test 2: PATCH request (will fail due to missing auth, but CORS should work)
  console.log('\n2️⃣ Testing PATCH request (CORS headers)...');
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
    console.log('✅ CORS Headers:');
    console.log('   - Access-Control-Allow-Origin:', patchResponse.headers.get('Access-Control-Allow-Origin'));
    console.log('   - Access-Control-Allow-Credentials:', patchResponse.headers.get('Access-Control-Allow-Credentials'));
    
    if (patchResponse.status === 400) {
      const responseText = await patchResponse.text();
      console.log('✅ Expected 400 response (missing required data):', responseText);
    } else if (patchResponse.status === 404) {
      const responseText = await patchResponse.text();
      console.log('✅ Expected 404 response (test data not found):', responseText);
    } else {
      const responseText = await patchResponse.text();
      console.log('✅ Response:', responseText);
    }
    
  } catch (error) {
    console.error('❌ PATCH request failed:', error.message);
  }
  
  console.log('\n🎯 Vercel CORS Test Complete!');
  console.log('💡 If you see CORS headers above, your Vercel deployment is working!');
  console.log('🚀 Test from your training app now.');
};

// Run the test
testVercelCors().catch(console.error);
