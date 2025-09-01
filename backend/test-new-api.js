import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Admin from './model/Admin.js';

dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

const testNewAPI = async () => {
    try {
        await connectDB();
        
        console.log('=== TESTING NEW API ENDPOINT ===');
        
        // Test the new function directly
        const { getAllUsersAndBranches } = await import('./controllers/DestinationController.js');
        
        // Create a mock request object
        const mockReq = {
            admin: {
                userId: '6825c098da59fba58e6e0132' // javad admin ID
            }
        };
        
        const mockRes = {
            status: (code) => ({
                json: (data) => {
                    console.log(`Response Status: ${code}`);
                    console.log('Response Data:', JSON.stringify(data, null, 2));
                    return mockRes;
                }
            }),
            json: (data) => {
                console.log('Response Data:', JSON.stringify(data, null, 2));
                return mockRes;
            }
        };
        
        console.log('Testing getAllUsersAndBranches function...');
        await getAllUsersAndBranches(mockReq, mockRes);
        
    } catch (error) {
        console.error('Error testing new API:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\nDisconnected from MongoDB');
    }
};

testNewAPI();
