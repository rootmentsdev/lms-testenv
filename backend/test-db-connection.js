import mongoose from 'mongoose';
import User from './model/User.js';

// Test database connection and user lookup
async function testDatabaseConnection() {
  try {
    // Try different connection strings
    const connectionStrings = [
      'mongodb://localhost:27017/lms-testenv',
      'mongodb://localhost:27017/lms',
      'mongodb://localhost:27017/rootments',
      'mongodb://localhost:27017/test'
    ];
    
    for (const connectionString of connectionStrings) {
      console.log(`\n🔍 Testing connection: ${connectionString}`);
      
      try {
        await mongoose.connect(connectionString);
        console.log('✅ Connected successfully');
        
        // Check if users collection exists and has data
        const userCount = await User.countDocuments();
        console.log(`📊 User count: ${userCount}`);
        
        if (userCount > 0) {
          // Look for Emp87 specifically
          const emp87 = await User.findOne({ empID: 'Emp87' });
          if (emp87) {
            console.log('✅ Found Emp87:', {
              _id: emp87._id,
              username: emp87.username,
              empID: emp87.empID,
              designation: emp87.designation
            });
          } else {
            console.log('❌ Emp87 not found');
            // Show first few users
            const users = await User.find({}, 'empID username').limit(5);
            console.log('📋 Sample users:', users.map(u => ({ empID: u.empID, username: u.username })));
          }
        }
        
        await mongoose.disconnect();
        console.log('🔌 Disconnected');
        
      } catch (error) {
        console.log('❌ Connection failed:', error.message);
        await mongoose.disconnect();
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testDatabaseConnection();
