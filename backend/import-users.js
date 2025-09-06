import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import User from './model/User.js';

// Import user data from JSON file
async function importUsers() {
  try {
    await mongoose.connect('mongodb://localhost:27017/lms-testenv');
    console.log('✅ Database connected');
    
    // Read the JSON file
    const jsonFilePath = 'C:\\Users\\Asus\\Downloads\\rootments.users.json';
    console.log('📖 Reading JSON file:', jsonFilePath);
    
    const jsonData = fs.readFileSync(jsonFilePath, 'utf8');
    const users = JSON.parse(jsonData);
    
    console.log(`📋 Found ${users.length} users in JSON file`);
    
    // Clear existing users
    await User.deleteMany({});
    console.log('🗑️ Cleared existing users');
    
    // Convert MongoDB ObjectId format to regular format for import
    const processedUsers = users.map(user => ({
      _id: user._id.$oid,
      username: user.username,
      email: user.email,
      phoneNumber: user.phoneNumber,
      locCode: user.locCode,
      empID: user.empID,
      designation: user.designation,
      workingBranch: user.workingBranch,
      assignedModules: user.assignedModules || [],
      assignedAssessments: user.assignedAssessments || [],
      training: (user.training || []).map(training => ({
        trainingId: training.trainingId.$oid,
        deadline: new Date(training.deadline.$date),
        pass: training.pass,
        status: training.status,
        _id: training._id.$oid
      })),
      createdAt: new Date(user.createdAt.$date),
      updatedAt: new Date(user.updatedAt.$date),
      __v: user.__v
    }));
    
    // Insert users into database
    const result = await User.insertMany(processedUsers);
    console.log(`✅ Successfully imported ${result.length} users`);
    
    // Check if Emp87 was imported
    const emp87 = await User.findOne({ empID: 'Emp87' });
    if (emp87) {
      console.log('✅ Emp87 found:', {
        _id: emp87._id,
        username: emp87.username,
        empID: emp87.empID,
        designation: emp87.designation
      });
    } else {
      console.log('❌ Emp87 not found after import');
    }
    
  } catch (error) {
    console.error('❌ Error importing users:', error);
  } finally {
    await mongoose.disconnect();
  }
}

importUsers();
