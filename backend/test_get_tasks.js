import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://abhirambca2021_db_user:Root@cluster0.5rf3i8g.mongodb.net/Rootments?retryWrites=true&w=majority&appName=Cluster0';

import { buildTaskFilter } from './lib/permissions.js';

async function run() {
  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB');
  
  try {
    // Emp8899 Admin ID: 6a3cf79867020fc685158d8e
    const filter = await buildTaskFilter('6a3cf79867020fc685158d8e');
    console.log('Task filter built successfully:', filter);
  } catch (error) {
    console.error('Error building task filter:', error);
  }
  
  await mongoose.disconnect();
}

run().catch(console.error);
