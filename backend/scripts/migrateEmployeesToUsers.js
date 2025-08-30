import mongoose from 'mongoose';
import axios from 'axios';
import dotenv from 'dotenv';
import connectMongoDB from '../db/database.js';
import User from '../model/User.js';

dotenv.config();

// Configuration
const ROOTMENTS_API_TOKEN = 'RootX-production-9d17d9485eb772e79df8564004d4a4d4';
const UPSTREAM_API = 'https://rootments.in/api/employee_range';

/**
 * Fetch employee data from external API
 */
async function fetchEmployeeData(startEmpId = 'EMP1', endEmpId = 'EMP9999') {
    try {
        console.log(`🔄 Fetching employee data from ${startEmpId} to ${endEmpId}...`);
        
        const response = await axios.post(
            UPSTREAM_API,
            { startEmpId, endEmpId },
            {
                timeout: 30000,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${ROOTMENTS_API_TOKEN}`
                }
            }
        );

        if (response.data && response.data.status === 'success') {
            console.log(`✅ Successfully fetched ${response.data.data.length} employees`);
            return response.data.data;
        } else {
            throw new Error('Invalid response format from external API');
        }
    } catch (error) {
        console.error('❌ Error fetching employee data:', error.message);
        throw error;
    }
}

/**
 * Transform employee data to user format
 */
function transformEmployeeToUser(employee) {
    return {
        username: employee.name || '',
        email: employee.email || '',
        phoneNumber: employee.phone || '',
        locCode: employee.emp_code || '', // Using emp_code as locCode
        empID: employee.emp_code || '',
        designation: employee.role_name || '',
        workingBranch: employee.store_name || '',
        assignedModules: [],
        assignedAssessments: [],
        training: [],
        createdAt: new Date(),
        updatedAt: new Date()
    };
}

/**
 * Migrate employees to users collection
 */
async function migrateEmployeesToUsers() {
    try {
        // Connect to MongoDB
        await connectMongoDB();
        console.log('✅ Connected to MongoDB');

        // Fetch all employee data
        const employees = await fetchEmployeeData();
        
        if (!employees || employees.length === 0) {
            console.log('⚠️  No employee data found');
            return;
        }

        console.log(`🔄 Starting migration of ${employees.length} employees to users collection...`);

        let successCount = 0;
        let errorCount = 0;
        let skippedCount = 0;

        for (const employee of employees) {
            try {
                // Check if user already exists
                const existingUser = await User.findOne({ 
                    $or: [
                        { empID: employee.emp_code },
                        { email: employee.email }
                    ]
                });

                if (existingUser) {
                    console.log(`⏭️  Skipping ${employee.emp_code} - already exists`);
                    skippedCount++;
                    continue;
                }

                // Transform employee data to user format
                const userData = transformEmployeeToUser(employee);

                // Validate required fields
                if (!userData.username || !userData.email || !userData.empID || !userData.designation) {
                    console.log(`⚠️  Skipping employee with missing required fields: ${employee.emp_code || 'unknown'}`);
                    console.log(`   Missing fields: username=${!!userData.username}, email=${!!userData.email}, empID=${!!userData.empID}, designation=${!!userData.designation}`);
                    errorCount++;
                    continue;
                }

                // Create new user
                const newUser = new User(userData);
                await newUser.save();

                console.log(`✅ Created user: ${userData.empID} - ${userData.username}`);
                successCount++;

            } catch (error) {
                console.error(`❌ Error processing employee ${employee.emp_code}:`, error.message);
                errorCount++;
            }
        }

        console.log('\n📊 Migration Summary:');
        console.log(`✅ Successfully migrated: ${successCount} employees`);
        console.log(`⏭️  Skipped (already exists): ${skippedCount} employees`);
        console.log(`❌ Errors: ${errorCount} employees`);
        console.log(`📈 Total processed: ${employees.length} employees`);

    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        process.exit(1);
    } finally {
        // Close MongoDB connection
        await mongoose.connection.close();
        console.log('🔌 MongoDB connection closed');
    }
}

/**
 * Get migration statistics
 */
async function getMigrationStats() {
    try {
        await connectMongoDB();
        
        const totalUsers = await User.countDocuments();
        const usersWithEmpID = await User.countDocuments({ empID: { $exists: true, $ne: '' } });
        
        console.log('\n📊 Current Users Collection Statistics:');
        console.log(`📈 Total users: ${totalUsers}`);
        console.log(`👥 Users with employee ID: ${usersWithEmpID}`);
        
        await mongoose.connection.close();
    } catch (error) {
        console.error('❌ Error getting stats:', error.message);
    }
}

// Main execution
const command = process.argv[2];

if (command === 'stats') {
    getMigrationStats();
} else {
    console.log('🚀 Starting Employee to User Migration...');
    console.log('📝 This will fetch all employee data from external API and create users');
    console.log('⏰ Estimated time: 2-5 minutes depending on number of employees\n');
    
    migrateEmployeesToUsers();
}
