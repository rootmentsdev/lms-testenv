import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const mongoUri = process.env.MONGODB_URI;

async function run() {
    try {
        console.log('Connecting to:', mongoUri);
        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB.');

        const db = mongoose.connection.db;

        // Fetch from users (employees)
        const rawUsers = await db.collection('users').find({}).toArray();
        const usersList = rawUsers.map(u => ({
            name: u.username || 'N/A',
            email: u.email || 'N/A',
            phoneNumber: u.phoneNumber || 'N/A',
            id: u.empID || 'N/A',
            designation: u.designation || 'N/A',
            branch: u.workingBranch || 'N/A',
            type: 'Employee'
        }));

        // Fetch from admins (admin staff)
        const rawAdmins = await db.collection('admins').find({}).toArray();
        const adminsList = rawAdmins.map(a => ({
            name: a.name || 'N/A',
            email: a.email || 'N/A',
            phoneNumber: a.phoneNumber || 'N/A',
            id: a.EmpId || a.employeeId || 'N/A',
            designation: a.role || 'N/A',
            branch: 'N/A',
            type: 'Admin/Staff'
        }));

        const allStaff = [...usersList, ...adminsList];
        
        // Sort staff by name
        allStaff.sort((a, b) => a.name.localeCompare(b.name));

        // Generate Markdown table
        let md = '# Employee Directory\n\nTotal Records: ' + allStaff.length + '\n\n';
        md += '| Sl No | Name | Employee ID | Email | Phone Number | Designation | Type | Branch |\n';
        md += '|---|---|---|---|---|---|---|---|\n';
        
        allStaff.forEach((staff, index) => {
            md += `| ${index + 1} | ${staff.name} | ${staff.id} | ${staff.email} | ${staff.phoneNumber} | ${staff.designation} | ${staff.type} | ${staff.branch} |\n`;
        });

        // Write to file in workspace root
        fs.writeFileSync('d:/Testfolderrootments/lms-testenv/employee_directory.md', md, 'utf8');
        console.log('Successfully wrote employee_directory.md');

        await mongoose.disconnect();
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}
run();
