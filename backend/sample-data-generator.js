import mongoose from 'mongoose';
import Admin from './model/Admin.js';
import User from './model/User.js';
import Branch from './model/Branch.js';
import Training from './model/Traning.js';
import Assessment from './model/Assessment.js';
import Module from './model/Module.js';
import dotenv from 'dotenv';

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/lms-testenv')
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

const generateSampleData = async () => {
    try {
        console.log('🚀 Generating Sample Data for Top Performance...\n');

        // 1. Create sample branches if they don't exist
        let branches = await Branch.find();
        if (branches.length === 0) {
            console.log('📁 Creating sample branches...');
            const sampleBranches = [
                { workingBranch: 'Main Office', locCode: 'MO001' },
                { workingBranch: 'North Branch', locCode: 'NB002' },
                { workingBranch: 'South Branch', locCode: 'SB003' },
                { workingBranch: 'East Branch', locCode: 'EB004' },
                { workingBranch: 'West Branch', locCode: 'WB005' }
            ];
            
            branches = await Branch.insertMany(sampleBranches);
            console.log(`✅ Created ${branches.length} branches`);
        } else {
            console.log(`📁 Found ${branches.length} existing branches`);
        }

        // 2. Create sample training if it doesn't exist
        let trainings = await Training.find();
        if (trainings.length === 0) {
            console.log('📚 Creating sample training...');
            const sampleTrainings = [
                { trainingName: 'Basic Safety Training', description: 'Essential safety protocols' },
                { trainingName: 'Customer Service Excellence', description: 'Customer interaction skills' },
                { trainingName: 'Product Knowledge', description: 'Understanding our products' },
                { trainingName: 'Team Collaboration', description: 'Working effectively in teams' },
                { trainingName: 'Leadership Skills', description: 'Basic leadership principles' }
            ];
            
            trainings = await Training.insertMany(sampleTrainings);
            console.log(`✅ Created ${trainings.length} training courses`);
        } else {
            console.log(`📚 Found ${trainings.length} existing training courses`);
        }

        // 3. Create sample assessments if they don't exist
        let assessments = await Assessment.find();
        if (assessments.length === 0) {
            console.log('📝 Creating sample assessments...');
            const sampleAssessments = [
                { assessmentName: 'Safety Assessment', description: 'Safety knowledge test' },
                { assessmentName: 'Customer Service Test', description: 'Customer service skills evaluation' },
                { assessmentName: 'Product Knowledge Quiz', description: 'Product understanding assessment' },
                { assessmentName: 'Teamwork Evaluation', description: 'Collaboration skills assessment' },
                { assessmentName: 'Leadership Assessment', description: 'Leadership potential evaluation' }
            ];
            
            assessments = await Assessment.insertMany(sampleAssessments);
            console.log(`✅ Created ${assessments.length} assessments`);
        } else {
            console.log(`📝 Found ${assessments.length} existing assessments`);
        }

        // 4. Create sample modules if they don't exist
        let modules = await Module.find();
        if (modules.length === 0) {
            console.log('📖 Creating sample modules...');
            const sampleModules = [
                { moduleName: 'Introduction to Safety', description: 'Basic safety concepts' },
                { moduleName: 'Customer Communication', description: 'Effective communication skills' },
                { moduleName: 'Product Overview', description: 'Product line introduction' },
                { moduleName: 'Team Dynamics', description: 'Understanding team behavior' },
                { moduleName: 'Leadership Basics', description: 'Fundamental leadership concepts' }
            ];
            
            modules = await Module.insertMany(sampleModules);
            console.log(`✅ Created ${sampleModules.length} modules`);
        } else {
            console.log(`📖 Found ${modules.length} existing modules`);
        }

        // 5. Create sample users if they don't exist
        let users = await User.find();
        if (users.length === 0) {
            console.log('👥 Creating sample users...');
            const sampleUsers = [];
            
            for (let i = 1; i <= 20; i++) {
                const branch = branches[i % branches.length];
                const user = {
                    username: `Employee${i}`,
                    email: `employee${i}@example.com`,
                    phoneNumber: `+123456789${i.toString().padStart(2, '0')}`,
                    locCode: branch.locCode,
                    empID: `EMP${i.toString().padStart(3, '0')}`,
                    designation: i <= 5 ? 'Manager' : i <= 10 ? 'Supervisor' : 'Employee',
                    workingBranch: branch.workingBranch,
                    assignedModules: [],
                    assignedAssessments: [],
                    training: []
                };
                
                // Add random training assignments
                const numTrainings = Math.floor(Math.random() * 4) + 1; // 1-4 trainings
                for (let j = 0; j < numTrainings; j++) {
                    const training = trainings[j % trainings.length];
                    const isCompleted = Math.random() > 0.3; // 70% completion rate
                    user.training.push({
                        trainingId: training._id,
                        deadline: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000), // Random deadline within 30 days
                        pass: isCompleted,
                        status: isCompleted ? 'Completed' : 'Pending'
                    });
                }
                
                // Add random assessment assignments
                const numAssessments = Math.floor(Math.random() * 3) + 1; // 1-3 assessments
                for (let j = 0; j < numAssessments; j++) {
                    const assessment = assessments[j % assessments.length];
                    const isCompleted = Math.random() > 0.4; // 60% completion rate
                    user.assignedAssessments.push({
                        assessmentId: assessment._id,
                        deadline: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000),
                        pass: isCompleted,
                        status: isCompleted ? 'Completed' : 'Pending',
                        complete: isCompleted ? 100 : 0
                    });
                }
                
                // Add random module assignments
                const numModules = Math.floor(Math.random() * 3) + 1; // 1-3 modules
                for (let j = 0; j < numModules; j++) {
                    const module = modules[j % modules.length];
                    const isCompleted = Math.random() > 0.5; // 50% completion rate
                    user.assignedModules.push({
                        moduleId: module._id,
                        deadline: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000),
                        pass: isCompleted,
                        status: isCompleted ? 'Completed' : 'Pending'
                    });
                }
                
                sampleUsers.push(user);
            }
            
            users = await User.insertMany(sampleUsers);
            console.log(`✅ Created ${users.length} sample users`);
        } else {
            console.log(`👥 Found ${users.length} existing users`);
        }

        // 6. Create or update admin with all branches
        let admin = await Admin.findOne({ role: 'super_admin' });
        if (!admin) {
            console.log('👑 Creating super admin...');
            admin = new Admin({
                name: 'Super Admin',
                email: 'admin@example.com',
                phoneNumber: '+12345678900',
                EmpId: 'ADM001',
                role: 'super_admin',
                subRole: 'NR',
                password: '$2b$10$rQJ8N5vK9mX2wL3pQ7sT8uI6oP9aB4cD5eF6gH7iJ8kL9mN0oP1qR2sT3uV4wX5yZ', // hashed 'password123'
                branches: branches.map(b => b._id)
            });
            await admin.save();
            console.log('✅ Created super admin with all branches');
        } else {
            console.log('👑 Found existing super admin');
            // Update admin to have all branches
            admin.branches = branches.map(b => b._id);
            await admin.save();
            console.log('✅ Updated admin with all branches');
        }

        console.log('\n🎉 Sample data generation completed!');
        console.log('\n📊 Summary:');
        console.log(`   - Branches: ${branches.length}`);
        console.log(`   - Training Courses: ${trainings.length}`);
        console.log(`   - Assessments: ${assessments.length}`);
        console.log(`   - Modules: ${modules.length}`);
        console.log(`   - Users: ${users.length}`);
        console.log(`   - Admin: ${admin.name} (${admin.role})`);
        
        console.log('\n🔍 Now you can test the Top Performance functionality!');

    } catch (error) {
        console.error('❌ Error generating sample data:', error);
    } finally {
        mongoose.disconnect();
        console.log('\n🔌 Disconnected from MongoDB');
    }
};

generateSampleData();
