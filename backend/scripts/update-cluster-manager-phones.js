import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import Admin from '../model/Admin.js';
import Branch from '../model/Branch.js';
import connectMongoDB from '../db/database.js';

/**
 * Quick script to update cluster manager phone numbers
 */

async function updateClusterManagerPhones() {
    try {
        await connectMongoDB();
        
        console.log('📱 Updating Cluster Manager Phone Numbers...\n');

        // Update athulp (North Cluster) - phone: 8590292642
        const athulp = await Admin.findOne({ email: 'north.cluster.grooms@outlook.com' });
        if (athulp) {
            athulp.phoneNumber = '918590292642';  // North Cluster
            await athulp.save();
            console.log('✅ Updated athulp (North Cluster):');
            console.log(`   Email: ${athulp.email}`);
            console.log(`   Phone: ${athulp.phoneNumber}`);
            console.log(`   Manages: 15 branches (North region)\n`);
        } else {
            console.log('⚠️ athulp not found\n');
        }

        // Update lekshmi (South Cluster) - phone: 9496649110
        const lekshmi = await Admin.findOne({ email: 'lakshmi23@gmail.com' });
        if (lekshmi) {
            lekshmi.phoneNumber = '919496649110';  // South Cluster
            await lekshmi.save();
            console.log('✅ Updated lekshmi (South Cluster):');
            console.log(`   Email: ${lekshmi.email}`);
            console.log(`   Phone: ${lekshmi.phoneNumber}`);
            console.log(`   Manages: 5 branches (South region)\n`);
        } else {
            console.log('⚠️ lekshmi not found\n');
        }

        // Verify the updates
        console.log('📊 Verification:');
        console.log('═'.repeat(80));
        const allClusterManagers = await Admin.find({ role: 'cluster_admin' }).populate('branches');
        for (const manager of allClusterManagers) {
            console.log(`   ${manager.name}:`);
            console.log(`      Phone: ${manager.phoneNumber || 'NOT SET'}`);
            console.log(`      Email: ${manager.email}`);
            console.log(`      Branches: ${manager.branches.map(b => b.locCode).join(', ')}`);
            console.log('');
        }

        console.log('🎉 Phone numbers updated successfully!');
        console.log('\n📱 Now the escalation system will send messages to:');
        console.log('   - North Cluster (athulp): 918590292642');
        console.log('   - South Cluster (lekshmi): 919496649110\n');

    } catch (error) {
        console.error('❌ Error updating phone numbers:', error);
    } finally {
        await mongoose.connection.close();
        console.log('📊 Database connection closed');
    }
}

// Run the script
updateClusterManagerPhones();

