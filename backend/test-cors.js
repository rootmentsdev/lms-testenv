// Test script to verify CORS configuration
// Run this with: node test-cors.js

import fetch from 'node-fetch';

const testCors = async () => {
  const baseUrl = 'http://localhost:7000';
  const endpoint = '/api/user/update/trainingprocess';
  
  console.log('🧪 Testing CORS configuration...');
  console.log(`📍 Testing endpoint: ${baseUrl}${endpoint}`);
  
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
    
  } catch (error) {
    console.error('❌ PATCH request failed:', error.message);
  }
  
  console.log('\n🎯 CORS Test Complete!');
  console.log('💡 If you see CORS headers above, your configuration is working!');
};

testCors().catch(console.error);
