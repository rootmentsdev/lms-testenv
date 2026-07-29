import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://abhirambca2021_db_user:Root@cluster0.5rf3i8g.mongodb.net/Rootments?retryWrites=true&w=majority&appName=Cluster0';

import Task from './model/Task.js';

async function run() {
  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB');
  
  try {
    const taskId = '6a3cfd11205d81aea6d4261b';
    const task = await Task.findById(taskId).lean();
    if (!task) {
      console.log('Task not found');
      return;
    }
    
    console.log('Task ID:', task._id);
    console.log('Title:', task.title);
    
    // Check sizes of fields
    for (const key of Object.keys(task)) {
      const val = task[key];
      const size = Buffer.byteLength(JSON.stringify(val) || '');
      console.log(`Field [${key}]: size = ${size} bytes`);
      
      if (key === 'attachments' && Array.isArray(val)) {
        val.forEach((att, idx) => {
          const attSize = Buffer.byteLength(JSON.stringify(att) || '');
          console.log(`  -> Attachment [${idx}] name: "${att.name}", size = ${attSize} bytes`);
        });
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
  
  await mongoose.disconnect();
}

run().catch(console.error);
