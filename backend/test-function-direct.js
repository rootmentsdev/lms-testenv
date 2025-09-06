// Simple test to check if our new function works
import User from './model/User.js';
import Admin from './model/Admin.js';
import axios from 'axios';

const testFunction = async () => {
    try {
        console.log('🧪 Testing getAllEmployeesWithTrainingDetails function...');
        
        // Test the function directly
        const mockReq = {
            admin: { userId: '67bc02e686396dca5cd6b064' }
        };
        
        const mockRes = {
            status: (code) => ({
                json: (data) => {
                    console.log('✅ Response Status:', code);
                    console.log('📊 Response Data:', JSON.stringify(data, null, 2));
                }
            })
        };
        
        // Import and test the function
        const { getAllEmployeesWithTrainingDetails } = await import('./controllers/EmployeeController.js');
        
        await getAllEmployeesWithTrainingDetails(mockReq, mockRes);
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('Stack:', error.stack);
    }
};

testFunction();
