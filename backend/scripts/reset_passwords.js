import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import Admin from '../model/Admin.js';
import User from '../model/User.js';

dotenv.config();

const run = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI;
        if (!mongoUri) {
            console.error('No MONGODB_URI found in environment variables');
            process.exit(1);
        }

        console.log('Connecting to database...');
        await mongoose.connect(mongoUri);
        console.log('Connected!');

        const newPassword = '123456';
        console.log('Hashing new password...');
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        console.log('Password hashed successfully.');

        // 1. Reset Admin passwords
        console.log('\n--- Processing Admins ---');
        const admins = await Admin.find({});
        console.log(`Found ${admins.length} admin(s) in the database.`);
        let updatedAdminsCount = 0;
        for (const admin of admins) {
            admin.password = hashedPassword;
            await admin.save();
            console.log(`Updated password for admin: ${admin.name} (${admin.email})`);
            updatedAdminsCount++;
        }
        console.log(`Successfully updated ${updatedAdminsCount} admin(s).`);

        // 2. Reset User passwords
        console.log('\n--- Processing Users ---');
        const users = await User.find({});
        console.log(`Found ${users.length} user(s) in the database.`);
        let updatedUsersCount = 0;
        
        // Use bulkWrite for users if there are many of them to improve speed
        if (users.length > 0) {
            const bulkOps = users.map(user => ({
                updateOne: {
                    filter: { _id: user._id },
                    update: { $set: { password: hashedPassword } }
                }
            }));
            
            // Process in chunks of 1000
            const chunkSize = 1000;
            for (let i = 0; i < bulkOps.length; i += chunkSize) {
                const chunk = bulkOps.slice(i, i + chunkSize);
                await User.bulkWrite(chunk);
                updatedUsersCount += chunk.length;
                console.log(`Updated user passwords batch: ${updatedUsersCount}/${users.length}`);
            }
        }
        console.log(`Successfully updated ${updatedUsersCount} user(s).`);

    } catch (err) {
        console.error('Error during password reset:', err);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from database');
    }
};

run();
