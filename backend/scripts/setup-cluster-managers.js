import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import Admin from '../model/Admin.js';
import Branch from '../model/Branch.js';
import connectMongoDB from '../db/database.js';

/**
 * Setup Cluster Managers with their assigned branches
 * 
 * This script helps you configure cluster managers and assign them to specific stores/branches
 * so that escalation messages are sent to the correct cluster manager based on store location.
 */

async function setupClusterManagers() {
    try {
        await connectMongoDB();
        
        console.log('🚀 Setting up Cluster Managers...\n');

        // ========================================
        // STEP 1: Get all branches to see available locCodes
        // ========================================
        const allBranches = await Branch.find({}).select('locCode workingBranch location');
        console.log('📍 Available Branches:');
        console.log('═'.repeat(80));
        allBranches.forEach(branch => {
            console.log(`   locCode: ${branch.locCode.padEnd(15)} | ${branch.workingBranch} (${branch.location})`);
        });
        console.log('═'.repeat(80));
        console.log(`   Total: ${allBranches.length} branches\n`);

        // ========================================
        // STEP 2: Check existing cluster managers
        // ========================================
        const existingClusterManagers = await Admin.find({ role: 'cluster_admin' }).populate('branches');
        
        if (existingClusterManagers.length > 0) {
            console.log('👥 Existing Cluster Managers:');
            console.log('═'.repeat(80));
            for (const manager of existingClusterManagers) {
                console.log(`   Name: ${manager.name}`);
                console.log(`   Phone: ${manager.phoneNumber || 'NOT SET'}`);
                console.log(`   Email: ${manager.email}`);
                console.log(`   EmpId: ${manager.EmpId}`);
                console.log(`   Assigned Branches: ${manager.branches.length}`);
                if (manager.branches.length > 0) {
                    manager.branches.forEach(branch => {
                        console.log(`      - ${branch.locCode}: ${branch.workingBranch}`);
                    });
                }
                console.log('─'.repeat(80));
            }
            console.log('');
        } else {
            console.log('⚠️ No cluster managers found in database\n');
        }

        // ========================================
        // STEP 3: Configuration Template
        // ========================================
        console.log('📝 CONFIGURATION TEMPLATE:');
        console.log('═'.repeat(80));
        console.log('To set up your cluster managers, modify the configuration below:\n');

        const clusterManagersConfig = [
            {
                name: 'South Cluster Manager',
                email: 'south.cluster@example.com',
                phoneNumber: '919496649110',  // South Cluster
                EmpId: 'CM001',
                role: 'cluster_admin',
                subRole: 'South Cluster',
                password: 'changeme123',
                branchLocCodes: ['1', '2', '3', '4', '5']  // Assign south stores here
            },
            {
                name: 'North Cluster Manager',
                email: 'north.cluster@example.com',
                phoneNumber: '918590292642',  // North Cluster
                EmpId: 'CM002',
                role: 'cluster_admin',
                subRole: 'North Cluster',
                password: 'changeme123',
                branchLocCodes: ['6', '7', '8', '9', '10']  // Assign north stores here
            }
        ];

        console.log('const clusterManagersConfig = [');
        clusterManagersConfig.forEach((config, index) => {
            console.log('    {');
            console.log(`        name: '${config.name}',`);
            console.log(`        email: '${config.email}',`);
            console.log(`        phoneNumber: '${config.phoneNumber}',`);
            console.log(`        EmpId: '${config.EmpId}',`);
            console.log(`        role: '${config.role}',`);
            console.log(`        subRole: '${config.subRole}',`);
            console.log(`        password: '${config.password}',`);
            console.log(`        branchLocCodes: ${JSON.stringify(config.branchLocCodes)}`);
            console.log(`    }${index < clusterManagersConfig.length - 1 ? ',' : ''}`);
        });
        console.log('];\n');

        // ========================================
        // STEP 4: Instructions
        // ========================================
        console.log('📋 INSTRUCTIONS:');
        console.log('═'.repeat(80));
        console.log('1. Update the configuration above with your actual cluster manager details');
        console.log('2. Assign the correct branchLocCodes to each cluster manager');
        console.log('3. Uncomment the CREATE section below and run this script again');
        console.log('4. The escalation system will automatically send messages to the correct cluster manager\n');

        // ========================================
        // STEP 5: CREATE CLUSTER MANAGERS (UNCOMMENT TO USE)
        // ========================================
        console.log('🔧 TO CREATE CLUSTER MANAGERS:');
        console.log('═'.repeat(80));
        console.log('Uncomment the section below in the script and run again:\n');
        
        /*
        // UNCOMMENT THIS SECTION TO CREATE CLUSTER MANAGERS
        console.log('🔨 Creating/Updating Cluster Managers...\n');
        
        for (const config of clusterManagersConfig) {
            // Find branches by locCode
            const branches = await Branch.find({ locCode: { $in: config.branchLocCodes } });
            const branchIds = branches.map(b => b._id);
            
            if (branches.length === 0) {
                console.log(`⚠️ No branches found for ${config.name} with locCodes: ${config.branchLocCodes.join(', ')}`);
                continue;
            }
            
            // Create or update cluster manager
            const existingManager = await Admin.findOne({ email: config.email });
            
            if (existingManager) {
                // Update existing
                existingManager.name = config.name;
                existingManager.phoneNumber = config.phoneNumber;
                existingManager.EmpId = config.EmpId;
                existingManager.role = config.role;
                existingManager.subRole = config.subRole;
                existingManager.branches = branchIds;
                await existingManager.save();
                
                console.log(`✅ Updated: ${config.name}`);
                console.log(`   Phone: ${config.phoneNumber}`);
                console.log(`   Branches: ${branches.map(b => `${b.locCode} (${b.workingBranch})`).join(', ')}\n`);
            } else {
                // Create new
                const newManager = await Admin.create({
                    name: config.name,
                    email: config.email,
                    phoneNumber: config.phoneNumber,
                    EmpId: config.EmpId,
                    role: config.role,
                    subRole: config.subRole,
                    password: config.password,
                    branches: branchIds
                });
                
                console.log(`✅ Created: ${config.name}`);
                console.log(`   Phone: ${config.phoneNumber}`);
                console.log(`   Branches: ${branches.map(b => `${b.locCode} (${b.workingBranch})`).join(', ')}\n`);
            }
        }
        
        console.log('🎉 Cluster managers setup complete!\n');
        */

        console.log('═'.repeat(80));
        console.log('✅ Script completed. Review the information above and update as needed.\n');

    } catch (error) {
        console.error('❌ Error setting up cluster managers:', error);
    } finally {
        await mongoose.connection.close();
        console.log('📊 Database connection closed');
    }
}

// Run the script
setupClusterManagers();

