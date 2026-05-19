import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import Walkin from './model/Walkin.js';

const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://abhirambca2021_db_user:root@cluster0.n4lnqm2.mongodb.net/Rootments?retryWrites=true&w=majority&appName=Cluster0';

async function clearFakes() {
  try {
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB for clearing mock data.");
    
    // Keep ONLY 'abijith'
    const result = await Walkin.deleteMany({
      customerName: { $not: /abijith/i }
    });
    
    console.log(`Successfully deleted ${result.deletedCount} mock records.`);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    mongoose.disconnect();
  }
}

clearFakes();
