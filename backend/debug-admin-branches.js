// Debug admin's branch structure
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Admin from './model/Admin.js';
import User from './model/User.js';

dotenv.config();

const connectMongoDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');
    } catch (error) {
        console.error('❌ Error connecting to MongoDB:', error);
        process.exit(1);
    }
};

async function debugAdminBranches() {
    try {
        await connectMongoDB();
        
        console.log('\n🔍 DEBUGGING ADMIN BRANCHES\n');
        console.log('============================\n');
        
        // Get admin
        const adminId = '67bc02e686396dca5cd6b064';
        const admin = await Admin.findById(adminId);
        
        if (!admin) {
            console.log('❌ Admin not found!');
            return;
        }
        
        console.log(`👤 Admin: ${admin.name}`);
        console.log(`🏢 Total branches: ${admin.branches?.length || 0}`);
        
        // Check branch structure
        if (admin.branches && admin.branches.length > 0) {
            console.log('\n📋 BRANCH DETAILS:');
            console.log('==================');
            
            admin.branches.forEach((branch, index) => {
                console.log(`\nBranch ${index + 1}:`);
                console.log(`  _id: ${branch._id}`);
                console.log(`  locCode: ${branch.locCode || 'UNDEFINED'}`);
                console.log(`  workingBranch: ${branch.workingBranch}`);
                console.log(`  location: ${branch.location}`);
                console.log(`  manager: ${branch.manager}`);
            });
        }
        
        // Check if branches have locCode
        const branchesWithLocCode = admin.branches?.filter(branch => branch.locCode) || [];
        const branchesWithoutLocCode = admin.branches?.filter(branch => !branch.locCode) || [];
        
        console.log('\n🔍 LOCATION CODE ANALYSIS:');
        console.log('==========================');
        console.log(`Branches WITH locCode: ${branchesWithLocCode.length}`);
        console.log(`Branches WITHOUT locCode: ${branchesWithoutLocCode.length}`);
        
        if (branchesWithLocCode.length > 0) {
            console.log('\n📍 Branches with locCode:');
            branchesWithLocCode.forEach(branch => {
                console.log(`  - ${branch.workingBranch}: ${branch.locCode}`);
            });
        }
        
        if (branchesWithoutLocCode.length > 0) {
            console.log('\n⚠️  Branches without locCode:');
            branchesWithoutLocCode.forEach(branch => {
                console.log(`  - ${branch.workingBranch}: NO locCode`);
            });
        }
        
        // Try to find users with the available locCodes
        if (branchesWithLocCode.length > 0) {
            const availableLocCodes = branchesWithLocCode.map(branch => branch.locCode);
            console.log(`\n🔍 Searching for users with locCodes: [${availableLocCodes.join(', ')}]`);
            
            const users = await User.find({ locCode: { $in: availableLocCodes } });
            console.log(`👥 Users found: ${users.length}`);
            
            if (users.length > 0) {
                console.log('\n📋 Sample users:');
                users.slice(0, 3).forEach((user, index) => {
                    console.log(`  ${index + 1}. ${user.name} - ${user.EmpId} - Branch: ${user.locCode}`);
                });
            }
        }
        
        // Check all users to see what locCodes exist
        console.log('\n🔍 ALL AVAILABLE LOCATION CODES IN SYSTEM:');
        console.log('==========================================');
        const allUsers = await User.find({});
        const allLocCodes = [...new Set(allUsers.map(user => user.locCode).filter(code => code))];
        
        console.log(`Total users in system: ${allUsers.length}`);
        console.log(`Unique location codes: ${allLocCodes.length}`);
        console.log(`Location codes: [${allLocCodes.join(', ')}]`);
        
    } catch (error) {
        console.error('❌ Error debugging admin branches:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n✅ Disconnected from MongoDB');
    }
}

debugAdminBranches();
