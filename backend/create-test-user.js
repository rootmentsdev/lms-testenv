import mongoose from 'mongoose';
import User from './model/User.js';

// Create a test user with empID Emp87
async function createTestUser() {
  try {
    await mongoose.connect('mongodb://localhost:27017/lms-testenv');
    console.log('✅ Database connected');
    
    // Clear existing users
    await User.deleteMany({});
    console.log('🗑️ Cleared existing users');
    
    // Create a test user
    const testUser = new User({
      username: 'Test User Emp87',
      email: 'test.emp87@example.com',
      phoneNumber: '1234567890',
      locCode: 'EMP87',
      empID: 'Emp87',
      designation: 'Test Manager',
      workingBranch: 'Test Branch',
      assignedModules: [],
      assignedAssessments: [],
      training: []
    });
    
    await testUser.save();
    console.log('✅ Test user created:', {
      _id: testUser._id,
      username: testUser.username,
      empID: testUser.empID,
      designation: testUser.designation
    });
    
  } catch (error) {
    console.error('❌ Error creating test user:', error);
  } finally {
    await mongoose.disconnect();
  }
}

createTestUser();
