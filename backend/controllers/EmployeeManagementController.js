import axios from 'axios';
import User from '../model/User.js';
import TrainingProgress from '../model/Trainingprocessschema.js';
import { Training } from '../model/Traning.js';
import Module from '../model/Module.js';
import Admin from '../model/Admin.js';

const BASE_URL = process.env.BASE_URL || 'http://localhost:7000';

// Helper function to assign mandatory trainings to a user
const assignMandatoryTrainingsToUser = async (user) => {
    try {
        // Function to flatten a string (remove spaces and lowercase)
        const flatten = (str) => str.toLowerCase().replace(/\s+/g, '');
        
        // Flatten input designation
        const flatDesignation = flatten(user.designation);
        
        // Step 1: Fetch all mandatory trainings
        const allTrainings = await Training.find({
            Trainingtype: 'Mandatory'
        }).populate('modules');
        
        // Step 2: Filter in JS using flattened comparison
        const mandatoryTraining = allTrainings.filter(training =>
            training.Assignedfor.some(role => flatten(role) === flatDesignation)
        );
        
        if (mandatoryTraining.length === 0) {
            return;
        }
        
        // Create TrainingProgress for each mandatory training
        const trainingAssignments = mandatoryTraining.map(async (training) => {
            // Use the training's actual deadline instead of hardcoded 30 days
            const deadlineDate = new Date(Date.now() + training.deadline * 24 * 60 * 60 * 1000);
            // Check if this user already has this training assigned
            const existingProgress = await TrainingProgress.findOne({
                userId: user._id,
                trainingId: training._id
            });
            
            if (existingProgress) {
                return;
            }
            
            // Create TrainingProgress for the user
            const trainingProgress = new TrainingProgress({
                userId: user._id,
                trainingName: training.trainingName,
                trainingId: training._id,
                deadline: deadlineDate,
                pass: false,
                modules: training.modules.map(module => ({
                    moduleId: module._id,
                    pass: false,
                    videos: module.videos.map(video => ({
                        videoId: video._id,
                        pass: false,
                    })),
                })),
            });
            
            await trainingProgress.save();
        });
        
        await Promise.all(trainingAssignments);
        
    } catch (error) {
        console.error(`❌ Error assigning mandatory trainings to user ${user.empID}:`, error);
        // Don't throw error - let the main process continue
    }
};

// Store name to locCode mapping
const storeNameToLocCode = {
    'GROOMS TRIVANDRUM': '1',
    'GROOMS KOCHI': '2',
    'GROOMS EDAPPALLY': '3',
    'GROOMS CALICUT': '4',
    'GROOMS KANNUR': '5',
    'GROOMS THALASSERY': '6',
    'GROOMS KOTTAYAM': '9',
    'GROOMS PERUMBAVOOR': '10',
    'GROOMS THRISSUR': '11',
    'GROOMS CHAVAKKAD': '12',
    'GROOMS EDAPPAL': '15',
    'GROOMS VATAKARA': '14',
    'GROOMS PERINTHALMANNA': '16',
    'GROOMS MANJERY': '18',
    'GROOMS KOTTAKKAL': '17',
    'SUITOR GUY KOTTAKKAL': '17',
    'GROOMS KOZHIKODE': '13',
    'GROOMS CALICUT': '13',
    'GROOMS KANNUR': '21',
    'GROOMS KALPETTA': '20',
    'ZORUCCI EDAPPAL': '6',
    'ZORUCCI KOTTAKKAL': '8',
    'ZORUCCI PERINTHALMANNA': '7',
    'ZORUCCI EDAPPALLY': '1',
    'SUITOR GUY TRIVANDRUM': '5',
    'SUITOR GUY PALAKKAD': '19',
    'SUITOR GUY EDAPPALLY': '3',
    'SUITOR GUY KOTTAYAM': '9',
    'SUITOR GUY PERUMBAVOOR': '10',
    'SUITOR GUY THRISSUR': '11',
    'SUITOR GUY CHAVAKKAD': '12',
    'SUITOR GUY EDAPPAL': '15',
    'SUITOR GUY VATAKARA': '14',
    'SUITOR GUY PERINTHALMANNA': '16',
    'SUITOR GUY MANJERI': '18',
    'SUITOR GUY KOTTAKKAL': '17',
    'SUITOR GUY CALICUT': '13',
    'SUITOR GUY KALPETTA': '20',
    'SUITOR GUY KANNUR': '21'
};

export const getAllEmployeesWithTrainingDetailsV2 = async (req, res) => {
    try {
        const admin = await Admin.findById(req?.admin?.userId).populate('branches');
        if (!admin) return res.status(401).json({ success: false, message: 'Admin not found' });

        const allowedLocCodes = admin.branches.map(branch => branch.locCode);
        const isGlobalAdmin = admin.role === 'super_admin' || allowedLocCodes.length === 0;

        // Fetch external employees — single attempt, short timeout
        let externalEmployees = [];
        try {
            const ROOTMENTS_API_TOKEN = 'RootX-production-9d17d9485eb772e79df8564004d4a4d4';
            const response = await axios.post('https://rootments.in/api/employee_range', {
                startEmpId: 'EMP1', endEmpId: 'EMP9999'
            }, {
                timeout: 10000,
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': `Bearer ${ROOTMENTS_API_TOKEN}` }
            });
            externalEmployees = response.data?.data || [];
        } catch (error) {
            // Silent fallback to local data only
        }

        // Filter out "No Store" employees
        let filteredExternalEmployees = externalEmployees.filter(emp => {
            const storeName = emp?.store_name?.toUpperCase();
            return storeName && storeName !== 'NO STORE' && storeName !== '';
        });

        if (!isGlobalAdmin) {
            filteredExternalEmployees = filteredExternalEmployees.filter(emp => {
                const storeName = emp?.store_name?.toUpperCase();
                const mappedLocCode = storeNameToLocCode[storeName];
                if (mappedLocCode && allowedLocCodes.includes(mappedLocCode)) return true;
                const empLocCode = emp?.store_code || emp?.locCode;
                return allowedLocCodes.includes(empLocCode);
            });
        }

        // Get local users
        const localUsersQuery = (!isGlobalAdmin && allowedLocCodes.length > 0)
            ? { $and: [{ locCode: { $in: allowedLocCodes } }, { $nor: [{ workingBranch: 'No Store' }, { workingBranch: 'NO STORE' }, { workingBranch: '' }] }] }
            : {};
        const localUsers = await User.find(localUsersQuery);

        // Build employee map
        const employeeDataMap = new Map();
        const newUsersToCreate = [];

        for (const emp of filteredExternalEmployees) {
            if (!emp.emp_code) continue;
            employeeDataMap.set(emp.emp_code, {
                empID: emp.emp_code, username: emp.name || '', designation: emp.role_name || '',
                workingBranch: emp.store_name || '', email: emp.email || '', phoneNumber: emp.phone || '',
                isLocalUser: false, hasTrainingData: false, externalData: emp
            });
            if (!localUsers.find(u => u.empID === emp.emp_code)) {
                let locCode = emp.store_code || (emp.store_name ? storeNameToLocCode[emp.store_name.toUpperCase()] : '') || '1';
                newUsersToCreate.push({
                    empID: emp.emp_code, username: emp.name || '', email: emp.email || `${emp.emp_code}@company.com`,
                    designation: emp.role_name || '', workingBranch: emp.store_name || '', locCode,
                    phoneNumber: emp.phone || '', training: [], assignedAssessments: []
                });
            }
        }

        // Create missing local users (no per-user mandatory training assignment here — done by cron)
        if (newUsersToCreate.length > 0) {
            try {
                const created = await User.insertMany(newUsersToCreate, { ordered: false });
                localUsers.push(...created);
            } catch (e) { /* ignore duplicate key errors */ }
        }

        localUsers.forEach(user => {
            const existing = employeeDataMap.get(user.empID);
            if (existing) { existing.isLocalUser = true; existing.hasTrainingData = true; existing.localUser = user; }
            else { employeeDataMap.set(user.empID, { empID: user.empID, username: user.username || '', designation: user.designation || '', workingBranch: user.workingBranch || '', email: user.email || '', phoneNumber: user.phoneNumber || '', isLocalUser: true, hasTrainingData: true, localUser: user, externalData: null }); }
        });

        // Bulk fetch training progress
        const allUserIds = localUsers.map(u => u._id);
        const allTrainingProgress = await TrainingProgress.find({ userId: { $in: allUserIds } });
        const trainingProgressMap = new Map();
        allTrainingProgress.forEach(p => {
            const key = p.userId.toString();
            if (!trainingProgressMap.has(key)) trainingProgressMap.set(key, []);
            trainingProgressMap.get(key).push(p);
        });

        const processedEmployees = [];
        for (const [, employeeData] of employeeDataMap) {
            const localUser = employeeData.localUser;
            let trainingCount = 0, passCountTraining = 0, trainingDue = 0;
            let assignedAssessmentsCount = 0, passCountAssessment = 0, assessmentDue = 0;

            if (localUser) {
                const assignedTrainingIds = localUser.training ? localUser.training.map(t => t.trainingId.toString()) : [];
                const userMandatoryTrainings = (trainingProgressMap.get(localUser._id.toString()) || []).filter(tp => !assignedTrainingIds.includes(tp.trainingId.toString()));
                const today = new Date();

                if (localUser.training?.length) {
                    trainingCount += localUser.training.length;
                    passCountTraining += localUser.training.filter(t => t.pass).length;
                    trainingDue += localUser.training.filter(t => new Date(t.deadline) < today && !t.pass).length;
                }
                trainingCount += userMandatoryTrainings.length;
                passCountTraining += userMandatoryTrainings.filter(t => t.pass).length;
                trainingDue += userMandatoryTrainings.filter(t => new Date(t.deadline) < today && !t.pass).length;

                if (localUser.assignedAssessments?.length) {
                    assignedAssessmentsCount = localUser.assignedAssessments.length;
                    passCountAssessment = localUser.assignedAssessments.filter(a => a.pass).length;
                    assessmentDue = localUser.assignedAssessments.filter(a => new Date(a.deadline) < today && !a.pass).length;
                }
            }

            processedEmployees.push({
                empID: employeeData.empID, username: employeeData.username, designation: employeeData.designation,
                workingBranch: employeeData.workingBranch, email: employeeData.email, phoneNumber: employeeData.phoneNumber,
                trainingCount, passCountTraining, trainingDue,
                trainingCompletionPercentage: trainingCount > 0 ? Math.round((passCountTraining / trainingCount) * 100) : 0,
                assignedAssessmentsCount, passCountAssessment, assessmentDue,
                assessmentCompletionPercentage: assignedAssessmentsCount > 0 ? Math.round((passCountAssessment / assignedAssessmentsCount) * 100) : 0,
                isLocalUser: employeeData.isLocalUser, hasTrainingData: employeeData.hasTrainingData,
            });
        }

        processedEmployees.sort((a, b) => (parseInt(a.empID.replace(/\D/g,''))||0) - (parseInt(b.empID.replace(/\D/g,''))||0));

        res.status(200).json({ success: true, message: 'Employee data fetched successfully', data: processedEmployees, totalEmployees: processedEmployees.length, isGlobalAdmin });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch employee data', error: error.message });
    }
};

// Auto-sync function to keep database updated with external API
export const autoSyncEmployees = async (req, res) => {
    try {
        const ROOTMENTS_API_TOKEN = 'RootX-production-9d17d9485eb772e79df8564004d4a4d4';
        const response = await axios.post('https://rootments.in/api/employee_range', {
            startEmpId: 'EMP1', endEmpId: 'EMP9999'
        }, {
            timeout: 30000,
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': `Bearer ${ROOTMENTS_API_TOKEN}` }
        });

        const externalEmployees = response.data?.data || [];
        let createdCount = 0, updatedCount = 0, skippedCount = 0;

        for (const emp of externalEmployees) {
            try {
                if (!emp.emp_code || !emp.email) { skippedCount++; continue; }

                let user = await User.findOne({ $or: [{ empID: emp.emp_code }, { email: emp.email }] });

                if (!user) {
                    const locCode = storeNameToLocCode[emp.store_name] || emp.store_code || 'Unknown';
                    user = new User({
                        username: emp.name || emp.emp_code || 'Unknown', email: emp.email, empID: emp.emp_code,
                        designation: emp.role_name || 'Unknown', locCode, workingBranch: emp.store_name || 'Unknown',
                        phoneNumber: emp.phone || '', assignedModules: [], assignedAssessments: [], training: []
                    });
                    await user.save();
                    createdCount++;
                    try { await assignMandatoryTrainingsToUser(user); } catch (e) { /* silent */ }
                } else {
                    let hasChanges = false;
                    if (emp.name && user.username !== emp.name) { user.username = emp.name; hasChanges = true; }
                    if (emp.role_name && user.designation !== emp.role_name) { user.designation = emp.role_name; hasChanges = true; }
                    if (emp.store_name && user.workingBranch !== emp.store_name) { user.workingBranch = emp.store_name; hasChanges = true; }
                    if (emp.phone && user.phoneNumber !== emp.phone) { user.phoneNumber = emp.phone; hasChanges = true; }
                    if ((!user.locCode || user.locCode === 'Unknown') && emp.store_name && storeNameToLocCode[emp.store_name]) {
                        user.locCode = storeNameToLocCode[emp.store_name]; hasChanges = true;
                    }
                    if (hasChanges) { await user.save(); updatedCount++; }
                    try {
                        const existing = await TrainingProgress.countDocuments({ userId: user._id });
                        if (existing === 0) await assignMandatoryTrainingsToUser(user);
                    } catch (e) { /* silent */ }
                }
            } catch (e) { skippedCount++; }
        }

        res.status(200).json({
            success: true, message: 'Employee auto-sync completed',
            results: { created: createdCount, updated: updatedCount, skipped: skippedCount, totalInDatabase: await User.countDocuments(), externalApiCount: externalEmployees.length }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Auto-sync failed', error: error.message });
    }
};
