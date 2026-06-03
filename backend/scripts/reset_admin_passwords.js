import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import Admin from '../model/Admin.js';

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

        const admins = await Admin.find({});
        console.log(`Found ${admins.length} admin(s) in the database.`);

        if (admins.length === 0) {
            console.log('No admins to update.');
            return;
        }

        const newPassword = '123456';
        console.log('Hashing new password...');
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        console.log('Password hashed successfully.');

        console.log('Updating passwords...');
        let updatedCount = 0;
        for (const admin of admins) {
            admin.password = hashedPassword;
            await admin.save();
            console.log(`Updated password for admin: ${admin.name} (${admin.email})`);
            updatedCount++;
        }

        console.log(`\nSuccessfully updated ${updatedCount} admin(s) passwords.`);

    } catch (err) {
        console.error('Error during password reset:', err);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from database');
    }
};

run();
