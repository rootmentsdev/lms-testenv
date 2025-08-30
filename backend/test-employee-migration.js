import axios from 'axios';

// Test configuration
const API_BASE_URL = 'http://localhost:7000';
const TEST_ENDPOINT = '/api/migrate-employees-to-users';

async function testEmployeeMigration() {
    try {
        console.log('🧪 Testing Employee to User Migration...');
        console.log(`📍 Testing endpoint: ${API_BASE_URL}${TEST_ENDPOINT}`);
        
        // Test with a small range first
        const testData = {
            startEmpId: 'EMP1',
            endEmpId: 'EMP10' // Test with first 10 employees
        };

        console.log('📤 Sending test request...');
        const response = await axios.post(`${API_BASE_URL}${TEST_ENDPOINT}`, testData, {
            timeout: 60000, // 60 seconds timeout
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.log('✅ Test completed successfully!');
        console.log('📊 Response:', JSON.stringify(response.data, null, 2));

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        
        if (error.response) {
            console.error('📄 Response data:', error.response.data);
            console.error('📊 Status:', error.response.status);
        }
    }
}

// Run the test
testEmployeeMigration();
