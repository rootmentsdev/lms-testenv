import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const db = mongoose.connection.db;

        // Fetch a few sample creator names from imported_walkins
        const creators = await db.collection('imported_walkins').distinct('created_by');
        console.log('Sample creator names in imported_walkins (first 10):', creators.slice(0, 10));

        // Check if any of these match usernames in employeedata
        const matchedEmployees = await db.collection('employeedata').find({}).limit(10).toArray();
        console.log('\nSample employeedata usernames:', matchedEmployees.map(e => e.username || e.name || e.firstName));

        // Check if any match usernames in users
        const matchedUsers = await db.collection('users').find({}).limit(10).toArray();
        console.log('\nSample users usernames:', matchedUsers.map(u => u.username));

        // Let's search for "RASEEB E A" in both collections
        const rasInEmp = await db.collection('employeedata').findOne({
            $or: [
                { username: /raseeb/i },
                { name: /raseeb/i },
                { firstName: /raseeb/i }
            ]
        });
        console.log('\nSearch "raseeb" in employeedata:', rasInEmp);

        const rasInUsers = await db.collection('users').findOne({
            username: /raseeb/i
        });
        console.log('Search "raseeb" in users:', rasInUsers);

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
};

run();
