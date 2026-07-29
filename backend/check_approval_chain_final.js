import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://abhirambca2021_db_user:Root@cluster0.5rf3i8g.mongodb.net/Rootments?retryWrites=true&w=majority&appName=Cluster0';

import Task from '../model/Task.js';
import Admin from '../model/Admin.js';
import User from '../model/User.js';
import Employee from '../model/Employee.js';
import Branch from '../model/Branch.js';
import { createTask } from '../controllers/TaskController.js';

async function test() {
  await mongoose.connect(mongoUri);
  console.log('🔌 Connected to MongoDB');

  try {
    // 1. Fetch an employee to test assignment
    const testEmployee = await Employee.findOne({ status: 'Active' }).populate('storeId');
    if (!testEmployee) {
      console.log('❌ No active test employee found');
      return;
    }
    console.log(`👤 Testing with Employee: ${testEmployee.firstName} ${testEmployee.lastName} (${testEmployee._id})`);
    if (testEmployee.storeId) {
      console.log(`   Branch: ${testEmployee.storeId.workingBranch} (locCode: ${testEmployee.storeId.locCode}, clusterId: ${testEmployee.storeId.clusterId})`);
    }

    // 2. Fetch a Creator (Super Admin / Admin)
    const creator = await Admin.findOne({ role: 'super_admin' });
    if (!creator) {
      console.log('❌ No Super Admin creator found');
      return;
    }
    console.log(`👑 Assigner Creator: ${creator.name} (${creator._id})`);

    // 3. Mock request/response objects to run createTask
    const req = {
      admin: { userId: creator._id.toString(), role: 'super_admin' },
      body: {
        title: 'Script Test Task ' + Date.now(),
        category: 'Test Category',
        subCategory: 'Test Subcategory',
        assignedTo: testEmployee._id.toString(),
        assignedToLabel: `${testEmployee.firstName} ${testEmployee.lastName}`,
        startDate: '2026-07-27',
        description: 'Test description'
      }
    };

    let responseData = null;
    const res = {
      status: function(code) {
        return {
          json: function(data) {
            responseData = data;
            return res;
          }
        };
      }
    };

    console.log('🚀 Running createTask...');
    await createTask(req, res);

    if (responseData && responseData.success) {
      const createdTaskDoc = responseData.data;
      console.log('✅ Task created successfully!');
      console.log(`Task Code: ${createdTaskDoc.id}`);
      
      // Query the database directly to verify approvalChain values
      const taskInDb = await Task.findById(createdTaskDoc._id);
      console.log('🔗 Approval Chain:', taskInDb.approvalChain);
      console.log('🔗 Approval Chain Index:', taskInDb.approvalChainIndex);
      console.log('🔗 Task Titles:', taskInDb.taskTitles);
    } else {
      console.log('❌ createTask failed:', responseData);
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected');
  }
}

test().catch(console.error);
