// Test script to verify assigned trainings API
import axios from 'axios';

const API_BASE_URL = 'http://localhost:7000';

async function testAssignedTrainingsAPI() {
    try {
        console.log('🧪 Testing Assigned Trainings API...');
        
        // Test the assigned trainings endpoint
        const empID = 'Emp257'; // Use a test employee ID
        const response = await axios.get(`${API_BASE_URL}/api/user/getAll/training?empID=${empID}`);
        
        console.log('✅ API Response:', {
            status: response.status,
            message: response.data.message,
            hasData: !!response.data.data,
            dataKeys: response.data.data ? Object.keys(response.data.data) : 'No data',
            trainingProgress: response.data.data?.trainingProgress,
            trainingProgressLength: response.data.data?.trainingProgress?.length || 0
        });
        
        if (response.data.data?.trainingProgress) {
            console.log('📊 Assigned Trainings Found:', response.data.data.trainingProgress.length);
            response.data.data.trainingProgress.forEach((training, index) => {
                console.log(`Training ${index + 1}:`, {
                    trainingId: training.trainingId,
                    name: training.name,
                    completionPercentage: training.completionPercentage
                });
            });
        } else {
            console.log('⚠️ No assigned trainings found for this user');
        }
        
    } catch (error) {
        console.error('❌ API Test Failed:', {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data
        });
    }
}

// Run the test
testAssignedTrainingsAPI();
