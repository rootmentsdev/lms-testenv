// Test script to verify PATCH route is working
// Run this with: node test-patch-route.js

import fetch from 'node-fetch';

const testPatchRoute = async () => {
  const baseUrl = 'http://localhost:7000';
  const endpoint = '/api/user/update/trainingprocess';
  
  console.log('🧪 Testing PATCH route functionality...');
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
    console.log('   - Access-Control-Allow-Headers:', optionsResponse.headers.get('Access-Control-Allow-Methods'));
    
  } catch (error) {
    console.error('❌ OPTIONS request failed:', error.message);
  }
  
  // Test 2: PATCH request with valid parameters
  console.log('\n2️⃣ Testing PATCH request...');
  try {
    const patchResponse = await fetch(`${baseUrl}${endpoint}?userId=test123&trainingId=test456&moduleId=test789&videoId=test101`, {
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
  
  // Test 3: Test with different HTTP methods (should fail)
  console.log('\n3️⃣ Testing invalid HTTP methods...');
  const methods = ['GET', 'POST', 'PUT', 'DELETE'];
  
  for (const method of methods) {
    try {
      const response = await fetch(`${baseUrl}${endpoint}?userId=test&trainingId=test&moduleId=test&videoId=test`, {
        method: method,
        headers: {
          'Origin': 'http://localhost:5173',
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`   ${method}: Status ${response.status} ${response.status === 405 ? '✅ (Expected Method Not Allowed)' : '❌ (Unexpected)'}`);
      
    } catch (error) {
      console.log(`   ${method}: ❌ Failed - ${error.message}`);
    }
  }
  
  console.log('\n🎯 PATCH Route Test Complete!');
  console.log('💡 If you see proper CORS headers and PATCH working, your route is fixed!');
  console.log('🚀 Test from your training app now.');
};

testPatchRoute().catch(console.error);
