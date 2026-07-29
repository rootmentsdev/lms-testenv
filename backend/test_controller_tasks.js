import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://abhirambca2021_db_user:Root@cluster0.5rf3i8g.mongodb.net/Rootments?retryWrites=true&w=majority&appName=Cluster0';

import { buildTaskFilter } from './lib/permissions.js';
import Task from './model/Task.js';
import Admin from './model/Admin.js';
import User from './model/User.js';
import { mapTaskForClient } from './controllers/TaskController.js';

async function run() {
  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB');
  
  try {
    const adminId = '6a3cf79867020fc685158d8e'; // Emp8899 ID
    const baseQuery = {};
    const secureQuery = await buildTaskFilter(adminId, baseQuery);
    console.log('Secure Query:', secureQuery);
    
    let tasks = await Task.find(secureQuery).sort({ createdAt: -1 }).lean();
    console.log(`Found ${tasks.length} tasks.`);
    
    const assigneeIds = [...new Set(tasks.map(t => t.assignedTo?.toString()).filter(Boolean))];
    const [assigneeAdmins, assigneeUsers] = await Promise.all([
      Admin.find({ _id: { $in: assigneeIds } }, { role: 1, branches: 1 }).populate('branches', 'workingBranch locCode').lean(),
      User.find({ _id: { $in: assigneeIds } }, { workingBranch: 1, locCode: 1 }).lean(),
    ]);
    const branchByAssignee = {};
    assigneeAdmins.forEach(ad => {
      if (['super_admin', 'admin', 'hr_admin'].includes(ad.role)) {
        branchByAssignee[ad._id.toString()] = 'Office';
      } else {
        branchByAssignee[ad._id.toString()] = ad.branches?.[0]?.workingBranch || '';
      }
    });
    assigneeUsers.forEach(u => {
      branchByAssignee[u._id.toString()] = u.workingBranch || '';
    });
    
    console.log('Mapping tasks for client...');
    let mapped = tasks.map((t) => mapTaskForClient(t, branchByAssignee[t.assignedTo?.toString()] || null, 'employee'));
    console.log('Mapped tasks count:', mapped.length);
  } catch (error) {
    console.error('Error running controller logic:', error);
  }
  
  await mongoose.disconnect();
}

run().catch(console.error);
