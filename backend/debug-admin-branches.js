// Debug admin's branch structure
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Admin from './model/Admin.js';
import Branch from './model/Branch.js';
import User from './model/User.js';

dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

const debugAdminBranches = async () => {
    try {
        await connectDB();
        
        console.log('=== DEBUGGING ADMIN BRANCH ACCESS ===');
        
        // Test with the admin ID from your debug output
        const adminId = '68b443af70b25a462db3db0b';
        
        // Find the admin without populating branches first
        const adminWithoutPopulate = await Admin.findById(adminId);
        console.log('\n1. Admin without populate:');
        console.log('Admin found:', adminWithoutPopulate ? 'Yes' : 'No');
        if (adminWithoutPopulate) {
            console.log('Admin ID:', adminWithoutPopulate._id);
            console.log('Admin name:', adminWithoutPopulate.name);
            console.log('Admin role:', adminWithoutPopulate.role);
            console.log('Branches array length:', adminWithoutPopulate.branches?.length || 0);
            console.log('Branches array:', adminWithoutPopulate.branches);
        }
        
        // Now find the admin with populated branches
        const adminWithPopulate = await Admin.findById(adminId).populate('branches');
        console.log('\n2. Admin with populated branches:');
        console.log('Admin found:', adminWithPopulate ? 'Yes' : 'No');
        if (adminWithPopulate) {
            console.log('Admin ID:', adminWithPopulate._id);
            console.log('Admin name:', adminWithPopulate.name);
            console.log('Admin role:', adminWithPopulate.role);
            console.log('Branches array length:', adminWithPopulate.branches?.length || 0);
            console.log('Branches array:', adminWithPopulate.branches);
            
            if (adminWithPopulate.branches && adminWithPopulate.branches.length > 0) {
                console.log('\n3. Branch details:');
                adminWithPopulate.branches.forEach((branch, index) => {
                    console.log(`Branch ${index + 1}:`);
                    console.log('  ID:', branch._id);
                    console.log('  locCode:', branch.locCode);
                    console.log('  workingBranch:', branch.workingBranch);
                    console.log('  location:', branch.location);
                });
                
                // Extract locCodes
                const allowedLocCodes = adminWithPopulate.branches.map(branch => branch.locCode);
                console.log('\n4. Allowed locCodes:', allowedLocCodes);
                
                // Check if STORE001 is in the allowed locCodes
                console.log('\n5. STORE001 in allowed locCodes:', allowedLocCodes.includes('STORE001'));
                
                // Find users in these branches
                const users = await User.find({ locCode: { $in: allowedLocCodes } });
                console.log('\n6. Users found in allowed branches:', users.length);
                
                if (users.length > 0) {
                    console.log('Sample user:');
                    console.log('  Username:', users[0].username);
                    console.log('  locCode:', users[0].locCode);
                    console.log('  workingBranch:', users[0].workingBranch);
                }
            }
        }
        
        // Check if there are other admins with more branches
        console.log('\n7. Checking other admins:');
        const allAdmins = await Admin.find({}).populate('branches');
        console.log('Total admins found:', allAdmins.length);
        
        allAdmins.forEach((admin, index) => {
            console.log(`Admin ${index + 1}: ${admin.name} (${admin.role}) - ${admin.branches?.length || 0} branches`);
        });
        
        // Check if there's a super_admin with more branches
        const superAdmin = await Admin.findOne({ role: 'super_admin' }).populate('branches');
        if (superAdmin) {
            console.log('\n8. Super admin details:');
            console.log('Name:', superAdmin.name);
            console.log('Role:', superAdmin.role);
            console.log('Branches count:', superAdmin.branches?.length || 0);
            if (superAdmin.branches && superAdmin.branches.length > 0) {
                console.log('Sample branches:');
                superAdmin.branches.slice(0, 5).forEach((branch, index) => {
                    console.log(`  ${index + 1}. ${branch.locCode} - ${branch.workingBranch}`);
                });
            }
        }
        
        // Check total branches in the system
        console.log('\n9. Total branches in system:');
        const totalBranches = await Branch.countDocuments();
        console.log('Total branches:', totalBranches);
        
        if (totalBranches > 0) {
            const sampleBranches = await Branch.find({}).limit(5);
            console.log('Sample branches:');
            sampleBranches.forEach((branch, index) => {
                console.log(`  ${index + 1}. ${branch.locCode} - ${branch.workingBranch}`);
            });
        }
        
    } catch (error) {
        console.error('Error debugging admin branches:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\nDisconnected from MongoDB');
    }
};

debugAdminBranches();
