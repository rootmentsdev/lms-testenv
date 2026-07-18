import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve('backend/.env') });

import connectMongoDB from '../db/database.js';
import User from '../model/User.js';
import Admin from '../model/Admin.js';
import { sendNotification } from '../utils/notificationHelper.js';
import mongoose from 'mongoose';

async function runTest() {
  console.log("Running Push Notification flow verification...");
  await connectMongoDB();

  // Find a test user or admin
  let target = await User.findOne();
  let modelType = 'User';
  if (!target) {
    target = await Admin.findOne();
    modelType = 'Admin';
  }

  if (!target) {
    console.error("❌ No users or admins found in database to run test on.");
    process.exit(1);
  }

  console.log(`Found test target: ${modelType} (ID: ${target._id}, Name: ${target.name || target.username})`);

  // Mock saving FCM token
  const testToken = 'test-fcm-token-12345';
  const originalToken = target.fcmToken || '';

  console.log(`Saving mock FCM token: "${testToken}"`);
  target.fcmToken = testToken;
  await target.save();

  // Query back to check persistence
  const reFetched = modelType === 'User' 
    ? await User.findById(target._id) 
    : await Admin.findById(target._id);
  
  if (reFetched.fcmToken === testToken) {
    console.log("✅ FCM token successfully saved and verified in the database!");
  } else {
    console.error("❌ FCM token database update check failed.");
    process.exit(1);
  }

  // Trigger sendNotification (which will fetch the token and try to send via Firebase SDK)
  console.log("Triggering sendNotification...");
  await sendNotification({
    title: 'Test Notification Trigger',
    body: 'This is a verification of the push notification trigger flow.',
    userIds: [target._id.toString()],
    category: 'Task',
    senderName: 'Notification Tester'
  });

  // Cleanup: Restore original token
  console.log(`Restoring original FCM token: "${originalToken}"`);
  target.fcmToken = originalToken;
  await target.save();

  console.log("Disconnecting from MongoDB...");
  await mongoose.disconnect();
  console.log("🎉 Test completed successfully!");
}

runTest().catch(err => {
  console.error("❌ Test failed with error:", err);
  process.exit(1);
});
