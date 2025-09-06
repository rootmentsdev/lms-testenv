import mongoose from 'mongoose';
import User from './model/User.js';

// Check what users exist in the database
async function checkUsers() {
  try {
    await mongoose.connect('mongodb://localhost:27017/lms-testenv');
    console.log('✅ Database connected');
    
    const users = await User.find({}, 'empID username email designation').limit(10);
    console.log('📋 Found users:');
    users.forEach(user => {
      console.log(`- empID: ${user.empID}, username: ${user.username}, designation: ${user.designation}`);
    });
    
    console.log(`\nTotal users in database: ${await User.countDocuments()}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

checkUsers();
