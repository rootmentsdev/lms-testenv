import axios from 'axios';
import User from '../model/User.js';
import TrainingProgress from '../model/Trainingprocessschema.js';
import { Training } from '../model/Traning.js';
import Admin from '../model/Admin.js';
import {
  getExternalEmployeesNonBlocking,
  getProcessedCacheKey,
  getProcessedEmployees,
  setProcessedEmployees,
  refreshExternalEmployees,
  clearEmployeeCaches,
} from '../lib/employeeCache.js';

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
  'SUITOR GUY KANNUR': '21',
};

const USER_FIELDS = 'empID username designation workingBranch email phoneNumber training assignedAssessments locCode source';
const PROGRESS_FIELDS = 'userId trainingId pass deadline';

function filterExternalByBranch(externalEmployees, allowedLocCodes, isGlobalAdmin) {
  let filtered = externalEmployees.filter((emp) => {
    const storeName = emp?.store_name?.toUpperCase();
    return storeName && storeName !== 'NO STORE' && storeName !== '';
  });

  if (!isGlobalAdmin) {
    filtered = filtered.filter((emp) => {
      const storeName = emp?.store_name?.toUpperCase();
      const mappedLocCode = storeNameToLocCode[storeName];
      if (mappedLocCode && allowedLocCodes.includes(mappedLocCode)) return true;
      const empLocCode = emp?.store_code || emp?.locCode;
      return allowedLocCodes.includes(empLocCode);
    });
  }
  return filtered;
}

function buildEmployeeStats(localUser, mandatoryTrainings) {
  let trainingCount = 0;
  let passCountTraining = 0;
  let trainingDue = 0;
  let assignedAssessmentsCount = 0;
  let passCountAssessment = 0;
  let assessmentDue = 0;

  if (!localUser) {
    return {
      trainingCount,
      passCountTraining,
      trainingDue,
      assignedAssessmentsCount,
      passCountAssessment,
      assessmentDue,
      trainingCompletionPercentage: 0,
      assessmentCompletionPercentage: 0,
    };
  }

  const today = new Date();
  const assignedTrainingIds = localUser.training
    ? localUser.training.map((t) => String(t.trainingId))
    : [];

  if (localUser.training?.length) {
    trainingCount += localUser.training.length;
    passCountTraining += localUser.training.filter((t) => t.pass).length;
    trainingDue += localUser.training.filter(
      (t) => new Date(t.deadline) < today && !t.pass
    ).length;
  }

  trainingCount += mandatoryTrainings.length;
  passCountTraining += mandatoryTrainings.filter((t) => t.pass).length;
  trainingDue += mandatoryTrainings.filter(
    (t) => new Date(t.deadline) < today && !t.pass
  ).length;

  if (localUser.assignedAssessments?.length) {
    assignedAssessmentsCount = localUser.assignedAssessments.length;
    passCountAssessment = localUser.assignedAssessments.filter((a) => a.pass).length;
    assessmentDue = localUser.assignedAssessments.filter(
      (a) => new Date(a.deadline) < today && !a.pass
    ).length;
  }

  return {
    trainingCount,
    passCountTraining,
    trainingDue,
    assignedAssessmentsCount,
    passCountAssessment,
    assessmentDue,
    trainingCompletionPercentage:
      trainingCount > 0 ? Math.round((passCountTraining / trainingCount) * 100) : 0,
    assessmentCompletionPercentage:
      assignedAssessmentsCount > 0
        ? Math.round((passCountAssessment / assignedAssessmentsCount) * 100)
        : 0,
  };
}

async function buildProcessedEmployees(admin) {
  const allowedLocCodes = admin.branches.map((branch) => branch.locCode);
  const isGlobalAdmin = admin.role === 'super_admin' || allowedLocCodes.length === 0;
  const cacheKey = getProcessedCacheKey(admin._id.toString(), allowedLocCodes, isGlobalAdmin);

  const cached = getProcessedEmployees(cacheKey);
  if (cached) return { employees: cached, isGlobalAdmin, cacheKey };

  const localUsersQuery =
    !isGlobalAdmin && allowedLocCodes.length > 0
      ? {
          $and: [
            { locCode: { $in: allowedLocCodes } },
            {
              $nor: [
                { workingBranch: 'No Store' },
                { workingBranch: 'NO STORE' },
                { workingBranch: '' },
              ],
            },
          ],
        }
      : {
          $nor: [
            { workingBranch: 'No Store' },
            { workingBranch: 'NO STORE' },
            { workingBranch: '' },
          ],
        };

  const externalEmployees = getExternalEmployeesNonBlocking();
  const filteredExternal = filterExternalByBranch(
    externalEmployees,
    allowedLocCodes,
    isGlobalAdmin
  );

  const localUsers = await User.find(localUsersQuery).select(USER_FIELDS).lean();
  const localUsersByEmpId = new Map(localUsers.map((u) => [u.empID, u]));
  const allUserIds = localUsers.map((u) => u._id);

  const allTrainingProgress = allUserIds.length
    ? await TrainingProgress.find({ userId: { $in: allUserIds } })
        .select(PROGRESS_FIELDS)
        .lean()
    : [];

  const trainingProgressMap = new Map();
  allTrainingProgress.forEach((p) => {
    const key = p.userId.toString();
    if (!trainingProgressMap.has(key)) trainingProgressMap.set(key, []);
    trainingProgressMap.get(key).push(p);
  });

  const employeeDataMap = new Map();

  for (const emp of filteredExternal) {
    if (!emp.emp_code) continue;
    employeeDataMap.set(emp.emp_code, {
      empID: emp.emp_code,
      username: emp.name || '',
      designation: emp.role_name || '',
      workingBranch: emp.store_name || '',
      email: emp.email || '',
      phoneNumber: emp.phone || '',
      localUser: localUsersByEmpId.get(emp.emp_code) || null,
    });
  }

  localUsers.forEach((user) => {
    if (employeeDataMap.has(user.empID)) {
      employeeDataMap.get(user.empID).localUser = user;
      return;
    }
    employeeDataMap.set(user.empID, {
      empID: user.empID,
      username: user.username || '',
      designation: user.designation || '',
      workingBranch: user.workingBranch || '',
      email: user.email || '',
      phoneNumber: user.phoneNumber || '',
      localUser: user,
    });
  });

  const processedEmployees = [];

  for (const employeeData of employeeDataMap.values()) {
    const localUser = employeeData.localUser;
    let mandatoryTrainings = [];

    if (localUser) {
      const assignedTrainingIds = localUser.training
        ? localUser.training.map((t) => String(t.trainingId))
        : [];
      mandatoryTrainings = (trainingProgressMap.get(localUser._id.toString()) || []).filter(
        (tp) => !assignedTrainingIds.includes(String(tp.trainingId))
      );
    }

    const stats = buildEmployeeStats(localUser, mandatoryTrainings);

    processedEmployees.push({
      empID: employeeData.empID,
      username: employeeData.username,
      designation: employeeData.designation,
      workingBranch: employeeData.workingBranch,
      email: employeeData.email,
      phoneNumber: employeeData.phoneNumber,
      ...stats,
      isLocalUser: Boolean(localUser),
      hasTrainingData: Boolean(localUser),
    });
  }

  processedEmployees.sort(
    (a, b) =>
      (parseInt(a.empID.replace(/\D/g, ''), 10) || 0) -
      (parseInt(b.empID.replace(/\D/g, ''), 10) || 0)
  );

  setProcessedEmployees(cacheKey, processedEmployees);
  return { employees: processedEmployees, isGlobalAdmin, cacheKey };
}

function applyFilters(employees, { search, store, role }) {
  const q = (search || '').trim().toLowerCase();
  return employees.filter((e) => {
    const matchSearch =
      !q ||
      [e.username, e.empID, e.workingBranch, e.designation].some((v) =>
        String(v || '').toLowerCase().includes(q)
      );
    const matchStore = !store || store === 'All' || e.workingBranch === store;
    const matchRole = !role || role === 'All' || e.designation === role;
    return matchSearch && matchStore && matchRole;
  });
}

export const getAllEmployeesWithTrainingDetailsV2 = async (req, res) => {
  try {
    const admin = await Admin.findById(req?.admin?.userId).populate('branches');
    if (!admin) return res.status(401).json({ success: false, message: 'Admin not found' });

    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(500, Math.max(1, parseInt(req.query.limit, 10) || 7));
    const search = req.query.search || '';
    const store = req.query.store || 'All';
    const role = req.query.role || 'All';
    const refresh = req.query.refresh === 'true';

    if (refresh) {
      await refreshExternalEmployees(true);
    }

    const { employees: allEmployees, isGlobalAdmin } = await buildProcessedEmployees(admin);

    const stores = [
      'All',
      ...new Set(allEmployees.map((e) => e.workingBranch).filter(Boolean)),
    ].sort((a, b) => (a === 'All' ? -1 : a.localeCompare(b)));

    const roles = [
      'All',
      ...new Set(allEmployees.map((e) => e.designation).filter(Boolean)),
    ].sort((a, b) => (a === 'All' ? -1 : a.localeCompare(b)));

    const filtered = applyFilters(allEmployees, { search, store, role });
    const totalEmployees = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalEmployees / limit));
    const safePage = Math.min(page, totalPages);
    const data = filtered.slice((safePage - 1) * limit, safePage * limit);

    res.status(200).json({
      success: true,
      message: 'Employee data fetched successfully',
      data,
      totalEmployees,
      page: safePage,
      limit,
      totalPages,
      filters: { stores, roles },
      isGlobalAdmin,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch employee data',
      error: error.message,
    });
  }
};

const assignMandatoryTrainingsToUser = async (user) => {
  try {
    const flatten = (str) => str.toLowerCase().replace(/\s+/g, '');
    const flatDesignation = flatten(user.designation);
    const allTrainings = await Training.find({ Trainingtype: 'Mandatory' }).populate('modules');
    const mandatoryTraining = allTrainings.filter((training) =>
      training.Assignedfor.some((role) => flatten(role) === flatDesignation)
    );
    if (mandatoryTraining.length === 0) return;

    await Promise.all(
      mandatoryTraining.map(async (training) => {
        const existingProgress = await TrainingProgress.findOne({
          userId: user._id,
          trainingId: training._id,
        });
        if (existingProgress) return;

        const deadlineDate = new Date(Date.now() + training.deadline * 24 * 60 * 60 * 1000);
        const trainingProgress = new TrainingProgress({
          userId: user._id,
          trainingName: training.trainingName,
          trainingId: training._id,
          deadline: deadlineDate,
          pass: false,
          modules: training.modules.map((module) => ({
            moduleId: module._id,
            pass: false,
            videos: module.videos.map((video) => ({ videoId: video._id, pass: false })),
          })),
        });
        await trainingProgress.save();
      })
    );
  } catch (error) {
    console.error(`Error assigning mandatory trainings to user ${user.empID}:`, error.message);
  }
};

export const autoSyncEmployees = async (req, res) => {
  try {
    const ROOTMENTS_API_TOKEN = process.env.ROOTMENTS_API_TOKEN || 'RootX-production-9d17d9485eb772e79df8564004d4a4d4';
    const response = await axios.post(
      'https://rootments.in/api/employee_range',
      { startEmpId: 'EMP1', endEmpId: 'EMP9999' },
      {
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${ROOTMENTS_API_TOKEN}`,
        },
      }
    );

    const externalEmployees = response.data?.data || [];
    let createdCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;

    for (const emp of externalEmployees) {
      try {
        if (!emp.emp_code || !emp.email) {
          skippedCount++;
          continue;
        }

        let user = await User.findOne({ $or: [{ empID: emp.emp_code }, { email: emp.email }] });

        if (!user) {
          const locCode = storeNameToLocCode[emp.store_name?.toUpperCase()] || emp.store_code || 'Unknown';
          user = new User({
            username: emp.name || emp.emp_code || 'Unknown',
            email: emp.email,
            empID: emp.emp_code,
            designation: emp.role_name || 'Unknown',
            locCode,
            workingBranch: emp.store_name || 'Unknown',
            phoneNumber: emp.phone || '',
            source: 'external-sync',
            assignedModules: [],
            assignedAssessments: [],
            training: [],
          });
          await user.save();
          createdCount++;
          try {
            await assignMandatoryTrainingsToUser(user);
          } catch {
            /* silent */
          }
        } else {
          let hasChanges = false;
          if (emp.name && user.username !== emp.name) {
            user.username = emp.name;
            hasChanges = true;
          }
          if (emp.role_name && user.designation !== emp.role_name) {
            user.designation = emp.role_name;
            hasChanges = true;
          }
          if (emp.store_name && user.workingBranch !== emp.store_name) {
            user.workingBranch = emp.store_name;
            hasChanges = true;
          }
          if (emp.phone && user.phoneNumber !== emp.phone) {
            user.phoneNumber = emp.phone;
            hasChanges = true;
          }
          if (user.source !== 'external-sync') {
            user.source = 'external-sync';
            hasChanges = true;
          }
          if ((!user.locCode || user.locCode === 'Unknown') && emp.store_name) {
            const mapped = storeNameToLocCode[emp.store_name.toUpperCase()];
            if (mapped) {
              user.locCode = mapped;
              hasChanges = true;
            }
          }
          if (hasChanges) {
            await user.save();
            updatedCount++;
          }
          try {
            const existing = await TrainingProgress.countDocuments({ userId: user._id });
            if (existing === 0) await assignMandatoryTrainingsToUser(user);
          } catch {
            /* silent */
          }
        }
      } catch {
        skippedCount++;
      }
    }

    clearEmployeeCaches();
    await refreshExternalEmployees(true);

    if (res) {
      res.status(200).json({
        success: true,
        message: 'Employee auto-sync completed',
        results: {
          created: createdCount,
          updated: updatedCount,
          skipped: skippedCount,
          totalInDatabase: await User.countDocuments(),
          externalApiCount: externalEmployees.length,
        },
      });
    }
  } catch (error) {
    if (res) {
      res.status(500).json({ success: false, message: 'Auto-sync failed', error: error.message });
    } else {
      throw error;
    }
  }
};

/* ============================================================
   getAllAppRegisteredEmployees
   Returns ONLY users who registered through the Flutter app
   (i.e. local MongoDB User collection — no external API).
   Includes training + assessment stats per user.
   GET /api/employee/app-users?page=&limit=&search=&store=&role=
============================================================ */
export const getAllAppRegisteredEmployees = async (req, res) => {
  try {
    const admin = await Admin.findById(req?.admin?.userId).populate('branches');
    if (!admin) return res.status(401).json({ success: false, message: 'Admin not found' });

    const page  = Math.max(1, parseInt(req.query.page,  10) || 1);
    const limit = Math.min(500, Math.max(1, parseInt(req.query.limit, 10) || 7));
    const search = (req.query.search || '').trim().toLowerCase();
    const store  = req.query.store || 'All';
    const role   = req.query.role  || 'All';

    const allowedLocCodes = admin.branches.map((b) => b.locCode);
    const isGlobalAdmin   = admin.role === 'super_admin' || allowedLocCodes.length === 0;

    // ── 1. Build base query (branch-scoped for non-super admins) ──
    const appUserSourceQuery = { source: { $in: ['app', 'admin'] } };
    const baseQuery = isGlobalAdmin
      ? appUserSourceQuery
      : { $and: [{ locCode: { $in: allowedLocCodes } }, appUserSourceQuery] };

    // ── 2. Load all matching users ──
    const allUsers = await User.find(baseQuery)
      .select('empID username designation workingBranch email phoneNumber locCode training assignedAssessments createdAt source')
      .lean();

    // ── 3. Load TrainingProgress for mandatory trainings ──
    const userIds = allUsers.map((u) => u._id);
    const allProgress = userIds.length
      ? await TrainingProgress.find({ userId: { $in: userIds } })
          .select('userId trainingId pass deadline')
          .lean()
      : [];

    const progressMap = new Map();
    allProgress.forEach((p) => {
      const key = p.userId.toString();
      if (!progressMap.has(key)) progressMap.set(key, []);
      progressMap.get(key).push(p);
    });

    // ── 4. Build enriched employee list ──
    const today = new Date();

    const employees = allUsers.map((user) => {
      const assignedTrainingIds = new Set(
        (user.training || []).map((t) => String(t.trainingId))
      );

      // Mandatory trainings (from TrainingProgress, not in user.training)
      const mandatoryProgress = (progressMap.get(user._id.toString()) || []).filter(
        (tp) => !assignedTrainingIds.has(String(tp.trainingId))
      );

      // Training stats
      const assignedTrainings      = user.training || [];
      const trainingCount          = assignedTrainings.length + mandatoryProgress.length;
      const passCountTraining      = assignedTrainings.filter((t) => t.pass).length
                                   + mandatoryProgress.filter((t) => t.pass).length;
      const trainingDue            = assignedTrainings.filter((t) => new Date(t.deadline) < today && !t.pass).length
                                   + mandatoryProgress.filter((t) => new Date(t.deadline) < today && !t.pass).length;

      // Assessment stats
      const assignedAssessments        = user.assignedAssessments || [];
      const assignedAssessmentsCount   = assignedAssessments.length;
      const passCountAssessment        = assignedAssessments.filter((a) => a.pass).length;
      const assessmentDue              = assignedAssessments.filter((a) => new Date(a.deadline) < today && !a.pass).length;

      return {
        empID:      user.empID,
        username:   user.username,
        designation: user.designation,
        workingBranch: user.workingBranch,
        email:      user.email,
        phoneNumber: user.phoneNumber,
        locCode:    user.locCode,
        joinedAt:   user.createdAt,
        trainingCount,
        passCountTraining,
        trainingDue,
        trainingCompletionPercentage: trainingCount > 0
          ? Math.round((passCountTraining / trainingCount) * 100) : 0,
        assignedAssessmentsCount,
        passCountAssessment,
        assessmentDue,
        assessmentCompletionPercentage: assignedAssessmentsCount > 0
          ? Math.round((passCountAssessment / assignedAssessmentsCount) * 100) : 0,
      };
    });

    // ── 5. Apply search / store / role filters ──
    const filtered = employees.filter((e) => {
      const matchSearch = !search || [e.username, e.empID, e.workingBranch, e.designation, e.email]
        .some((v) => String(v || '').toLowerCase().includes(search));
      const matchStore = store === 'All' || e.workingBranch === store;
      const matchRole  = role  === 'All' || e.designation   === role;
      return matchSearch && matchStore && matchRole;
    });

    // ── 6. Build filter options ──
    const stores = ['All', ...new Set(employees.map((e) => e.workingBranch).filter(Boolean))].sort((a, b) => a === 'All' ? -1 : a.localeCompare(b));
    const roles  = ['All', ...new Set(employees.map((e) => e.designation).filter(Boolean))].sort((a, b) => a === 'All' ? -1 : a.localeCompare(b));

    // ── 7. Paginate ──
    const totalEmployees = filtered.length;
    const totalPages     = Math.max(1, Math.ceil(totalEmployees / limit));
    const safePage       = Math.min(page, totalPages);
    const data           = filtered.slice((safePage - 1) * limit, safePage * limit);

    res.status(200).json({
      success: true,
      message: 'App-registered employees fetched successfully',
      data,
      totalEmployees,
      page: safePage,
      limit,
      totalPages,
      filters: { stores, roles },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch app-registered employees',
      error: error.message,
    });
  }
};
