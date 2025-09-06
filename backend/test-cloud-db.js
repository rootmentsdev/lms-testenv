import mongoose from 'mongoose';
import User from './model/User.js';

// Test cloud database connection
async function testCloudDatabase() {
  try {
    const mongoUri = 'mongodb+srv://abhirambca2021_db_user:Root@cluster0.5rf3i8g.mongodb.net/Rootments?retryWrites=true&w=majority&appName=Cluster0';
    console.log('🔗 Connecting to cloud MongoDB...');
    
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to cloud MongoDB successfully');
    console.log('📊 Database name:', mongoose.connection.db.databaseName);
    
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
          designation: emp87.designation,
          trainingCount: emp87.training.length
        });
      } else {
        console.log('❌ Emp87 not found');
        // Show first few users
        const users = await User.find({}, 'empID username').limit(5);
        console.log('📋 Sample users:', users.map(u => ({ empID: u.empID, username: u.username })));
      }
    }
    
  } catch (error) {
    console.error('❌ Cloud database connection failed:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

testCloudDatabase();
