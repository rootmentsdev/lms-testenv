// Test script for LMS Website Login Tracking API
// Run this with: node test-lms-login-api.js

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:7000'; // Adjust if your backend runs on different port

async function testLMSLoginAPI() {
    console.log('🧪 Testing LMS Website Login Tracking API...\n');

    try {
        // Test 1: Get simple LMS login count (no auth required)
        console.log('1️⃣ Testing GET /api/lms-login/count-simple');
        const response1 = await fetch(`${BASE_URL}/api/lms-login/count-simple`);
        const data1 = await response1.json();
        
        if (response1.ok) {
            console.log('✅ Success:', data1);
        } else {
            console.log('❌ Error:', data1);
        }
        console.log('');

        // Test 2: Get detailed LMS login count (requires auth)
        console.log('2️⃣ Testing GET /api/lms-login/count');
        const response2 = await fetch(`${BASE_URL}/api/lms-login/count`);
        const data2 = await response2.json();
        
        if (response2.ok) {
            console.log('✅ Success:', data2);
        } else {
            console.log('❌ Expected 401 (no auth):', data2);
        }
        console.log('');

        // Test 3: Get LMS login analytics (requires auth)
        console.log('3️⃣ Testing GET /api/lms-login/analytics');
        const response3 = await fetch(`${BASE_URL}/api/lms-login/analytics`);
        const data3 = await response3.json();
        
        if (response3.ok) {
            console.log('✅ Success:', data3);
        } else {
            console.log('❌ Expected 401 (no auth):', data3);
        }
        console.log('');

        // Test 4: Track LMS login (requires auth)
        console.log('4️⃣ Testing POST /api/lms-login/track');
        const response4 = await fetch(`${BASE_URL}/api/lms-login/track`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: 'test-user-id',
                username: 'test-user',
                email: 'test@example.com'
            })
        });
        const data4 = await response4.json();
        
        if (response4.ok) {
            console.log('✅ Success:', data4);
        } else {
            console.log('❌ Expected 401 (no auth):', data4);
        }
        console.log('');

        console.log('🎉 LMS Website Login Tracking API tests completed!');
        console.log('\n📝 Notes:');
        console.log('- The simple count endpoint should work without authentication');
        console.log('- Other endpoints require JWT authentication');
        console.log('- To test authenticated endpoints, you need to login first and get a token');
        console.log('- The LMS website should call /api/lms-login/track when users login');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

// Run the test
testLMSLoginAPI();
