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

const fixUserLocCodes = async () => {
    try {
        console.log('🔧 Fixing User Location Code Mismatch...\n');

        // 1. Get all branches and create a mapping
        const branches = await Branch.find();
        console.log(`📁 Found ${branches.length} branches`);
        
        // Create a mapping of branch names to locCodes
        const branchNameToLocCode = {};
        branches.forEach(branch => {
            branchNameToLocCode[branch.workingBranch] = branch.locCode;
        });

        // 2. Get all users
        const users = await User.find();
        console.log(`👥 Found ${users.length} users`);

        // 3. Update users with correct locCodes
        let updatedCount = 0;
        let skippedCount = 0;

        for (const user of users) {
            const currentLocCode = user.locCode;
            const workingBranch = user.workingBranch;
            
            // Check if we can find a matching branch
            if (branchNameToLocCode[workingBranch]) {
                const correctLocCode = branchNameToLocCode[workingBranch];
                
                if (currentLocCode !== correctLocCode) {
                    console.log(`🔄 Updating ${user.username}: ${currentLocCode} → ${correctLocCode} (${workingBranch})`);
                    
                    // Update the user's locCode
                    await User.findByIdAndUpdate(user._id, {
                        locCode: correctLocCode
                    });
                    
                    updatedCount++;
                } else {
                    console.log(`✅ ${user.username}: Already correct (${currentLocCode})`);
                }
            } else {
                console.log(`⚠️  ${user.username}: No matching branch found for "${workingBranch}"`);
                skippedCount++;
            }
        }

        console.log(`\n📊 Update Summary:`);
        console.log(`   - Total users: ${users.length}`);
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

        console.log(`\n🎉 User locCode fix completed!`);
        console.log(`\n💡 Now test your Top Performance section - it should show data!`);

    } catch (error) {
        console.error('❌ Error fixing user locCodes:', error);
    } finally {
        mongoose.disconnect();
        console.log('\n🔌 Disconnected from MongoDB');
    }
};

fixUserLocCodes();
