import mongoose from 'mongoose';
import Admin from './model/Admin.js';
import User from './model/User.js';
import Branch from './model/Branch.js';
import dotenv from 'dotenv';

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/lms-testenv')
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

const fixBranchLocCodes = async () => {
    try {
        console.log('🔧 Fixing Branch Location Code Mismatch (Alternative Approach)...\n');

        // 1. Get all users and create a mapping
        const users = await User.find();
        console.log(`👥 Found ${users.length} users`);
        
        // Create a mapping of branch names to user locCodes
        const branchNameToUserLocCode = {};
        users.forEach(user => {
            if (user.workingBranch && user.locCode) {
                branchNameToUserLocCode[user.workingBranch] = user.locCode;
            }
        });

        console.log(`📊 Branch name to user locCode mapping:`);
        Object.entries(branchNameToUserLocCode).forEach(([branchName, locCode]) => {
            console.log(`   - "${branchName}" → "${locCode}"`);
        });

        // 2. Get all branches
        const branches = await Branch.find();
        console.log(`\n📁 Found ${branches.length} branches`);

        // 3. Update branches with user locCodes where possible
        let updatedCount = 0;
        let skippedCount = 0;

        for (const branch of branches) {
            const currentLocCode = branch.locCode;
            const workingBranch = branch.workingBranch;
            
            // Check if we can find a matching user locCode
            if (branchNameToUserLocCode[workingBranch]) {
                const userLocCode = branchNameToUserLocCode[workingBranch];
                
                if (currentLocCode !== userLocCode) {
                    console.log(`🔄 Updating branch "${workingBranch}": ${currentLocCode} → ${userLocCode}`);
                    
                    // Update the branch's locCode
                    await Branch.findByIdAndUpdate(branch._id, {
                        locCode: userLocCode
                    });
                    
                    updatedCount++;
                } else {
                    console.log(`✅ Branch "${workingBranch}": Already correct (${currentLocCode})`);
                }
            } else {
                console.log(`⚠️  Branch "${workingBranch}": No matching user found`);
                skippedCount++;
            }
        }

        console.log(`\n📊 Update Summary:`);
        console.log(`   - Total branches: ${branches.length}`);
        console.log(`   - Updated: ${updatedCount}`);
        console.log(`   - Skipped: ${skippedCount}`);

        // 4. Test the fix by checking admin access
        console.log(`\n🔍 Testing Admin Access...`);
        const admins = await Admin.find().populate('branches');
        
        for (const admin of admins) {
            if (admin.branches.length > 0) {
                const allowedLocCodes = admin.branches.map(branch => branch.locCode);
                const adminUsers = await User.find({ locCode: { $in: allowedLocCodes } });
                
                console.log(`   - ${admin.name} (${admin.role}): ${adminUsers.length} users in ${admin.branches.length} branches`);
                
                if (adminUsers.length > 0) {
                    const sampleUser = adminUsers[0];
                    console.log(`     * Sample: ${sampleUser.username} - Branch: ${sampleUser.workingBranch}, LocCode: ${sampleUser.locCode}`);
                }
            }
        }

        console.log(`\n🎉 Branch locCode fix completed!`);
        console.log(`\n💡 Now test your Top Performance section - it should show data!`);

    } catch (error) {
        console.error('❌ Error fixing branch locCodes:', error);
    } finally {
        mongoose.disconnect();
        console.log('\n🔌 Disconnected from MongoDB');
    }
};

fixBranchLocCodes();
