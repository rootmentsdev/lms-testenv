import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Training } from '../model/Traning.js';
import User from '../model/User.js';
import TrainingProgress from '../model/Trainingprocessschema.js';
import connectMongoDB from '../db/database.js';

dotenv.config();

async function createTestOverdueTrainings() {
    await connectMongoDB();
    console.log('Connected to MongoDB for creating test overdue trainings.');

    try {
        // Create test trainings with very short deadlines (already overdue)
        const testTrainings = [
            {
                trainingName: "Test Overdue Safety Training",
                modules: [], // Empty modules array for now
                deadline: 1, // 1 day deadline (already overdue if created before yesterday)
                deadlineDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago (overdue)
                Trainingtype: "Assigned",
                Assignedfor: ["Normal"],
                createdDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // Created 3 days ago
            },
            {
                trainingName: "Test Overdue Compliance Training",
                modules: [],
                deadline: 7, // 7 day deadline
                deadlineDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago (overdue)
                Trainingtype: "Mandatory",
                Assignedfor: ["Manager"],
                createdDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), // Created 8 days ago
            },
            {
                trainingName: "Test Overdue Security Training",
                modules: [],
                deadline: 3, // 3 day deadline
                deadlineDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago (overdue)
                Trainingtype: "Assigned",
                Assignedfor: ["Normal", "Supervisor"],
                createdDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Created 7 days ago
            }
        ];

        // Create trainings in database
        const createdTrainings = await Training.insertMany(testTrainings);
        console.log(`✅ Created ${createdTrainings.length} test overdue trainings`);
        
        // Get some users to assign these trainings to
        const users = await User.find().limit(10).lean();
        console.log(`📝 Found ${users.length} users to assign trainings to`);

        if (users.length === 0) {
            console.log('⚠️  No users found. Please create some users first.');
            return;
        }

        const assignedCount = [];
        
        // Assign trainings to users
        for (const training of createdTrainings) {
            const randomUsers = users.slice(0, Math.min(5, users.length)); // Assign to up to 5 users
            
            for (const user of randomUsers) {
                if (training.Trainingtype === "Mandatory") {
                    // Create TrainingProgress for mandatory trainings
                    const progress = new TrainingProgress({
                        userId: user._id,
                        trainingId: training._id,
                        trainingName: training.trainingName,
                        deadline: training.deadlineDate, // Use the overdue deadlineDate
                        pass: false, // Not passed = overdue
                        modules: [],
                    });
                    await progress.save();
                    assignedCount.push(`Mandatory: ${training.trainingName} -> ${user.firstName} ${user.lastName}`);
                } else {
                    // Add to user.training array for assigned trainings
                    await User.findByIdAndUpdate(user._id, {
                        $push: {
                            training: {
                                trainingId: training._id,
                                deadline: training.deadlineDate, // Use the overdue deadlineDate
                                pass: false, // Not passed = overdue
                                status: 'Pending'
                            }
                        }
                    });
                    assignedCount.push(`Assigned: ${training.trainingName} -> ${user.firstName} ${user.lastName}`);
                }
            }
        }

        console.log('\n📋 Assignments made:');
        assignedCount.forEach(assignment => console.log(`  - ${assignment}`));

        console.log('\n✅ Test overdue trainings created successfully!');
        console.log('\n🔍 You can now check:');
        console.log('  1. Dashboard overdue count');
        console.log('  2. Overdue training detail page');
        console.log('  3. API endpoint: /api/admin/overdue/Training');

    } catch (error) {
        console.error('❌ Error creating test overdue trainings:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB.');
    }
}

createTestOverdueTrainings();
