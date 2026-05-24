import Task from '../model/Task.js';
import Admin from '../model/Admin.js';

const ASSIGNED_TO_LABELS = {
  store_admin: 'Store Admin',
  cluster_admin: 'Cluster Admin',
  all_stores: 'All Stores',
};

const ROLE_LABELS = {
  super_admin: 'Super Admin',
  cluster_admin: 'Cluster Admin',
  store_admin: 'Store Admin',
};

/** Map form priority to table display priority */
const normalizePriority = (p) => {
  const map = { Urgent: 'High', High: 'High', Normal: 'Medium', Low: 'Low', Medium: 'Medium', Not: 'Not' };
  return map[p] || p;
};

const parseDateParts = (dateStr) => {
  if (!dateStr) return null;
  if (dateStr.includes('/')) {
    const [dd, mm, yyyy] = dateStr.split('/');
    return new Date(Number(yyyy), Number(mm) - 1, Number(dd));
  }
  if (dateStr.includes('-')) {
    const parts = dateStr.split('-');
    if (parts[0].length === 4) return new Date(dateStr);
    const [dd, mm, yyyy] = parts;
    return new Date(Number(yyyy), Number(mm) - 1, Number(dd));
  }
  return new Date(dateStr);
};

const computeStatus = (task) => {
  if (task.status === 'COMPLETED') return 'COMPLETED';
  if (task.status === 'IN PROGRESS') return 'IN PROGRESS';

  const end = parseDateParts(task.endDate);
  if (end) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    if (end < today) return 'OVERDUE';
  }
  return task.status || 'PENDING';
};

const formatDisplayDate = (dateStr) => {
  const d = parseDateParts(dateStr);
  if (!d || Number.isNaN(d.getTime())) return '—';
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};

const formatDetailDate = (dateStr) => {
  const d = dateStr instanceof Date
    ? dateStr
    : parseDateParts(dateStr);
  if (!d || Number.isNaN(d.getTime())) return '—';
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
};

const mapTaskForClient = (doc) => {
  const task = doc.toObject ? doc.toObject() : doc;
  const status = computeStatus(task);
  const priority = normalizePriority(task.priority);

  return {
    id: task.taskCode || task._id?.toString(),
    _id: task._id?.toString(),
    title: task.title,
    category: task.category,
    categorySub: task.storeName || task.storeCode || task.subCategory,
    categoryDetail: task.subCategory,
    assignee: task.assignedToLabel || ASSIGNED_TO_LABELS[task.assignedTo] || task.assignedTo,
    assigneeSub: task.storeName || task.storeCode || '—',
    assigneeRole: task.assignedToLabel || ASSIGNED_TO_LABELS[task.assignedTo] || task.assignedTo,
    priority,
    startDate: formatDisplayDate(task.startDate),
    startTime: task.startTime || '—',
    endDate: task.endDate ? formatDisplayDate(task.endDate) : '—',
    endTime: task.endTime || '—',
    description: task.description?.trim() || '—',
    status,
    assignedBy: task.assignedByName || '—',
    assignedByRole: task.assignedByRole || '—',
    assignedDate: formatDetailDate(task.createdAt ? new Date(task.createdAt) : task.startDate),
    assignedTime: task.startTime || '—',
    startDateDetail: formatDetailDate(task.startDate),
    endDateDetail: task.endDate ? formatDetailDate(task.endDate) : '—',
    mode: task.mode,
    additionalInfo: task.additionalInfo,
    createdAt: task.createdAt,
  };
};

const nextTaskCode = async () => {
  const count = await Task.countDocuments();
  return `TSK-${String(count + 1).padStart(3, '0')}`;
};

export const createTask = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.userId).populate('branches');
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }

    const {
      title,
      category,
      subCategory,
      assignedTo,
      mode = 'task',
      startDate,
      startTime = '',
      endDate = '',
      endTime = '',
      description = '',
      additionalInfo = '',
      priority = 'Normal',
    } = req.body;

    if (!title || !category || !subCategory || !assignedTo || !startDate) {
      return res.status(400).json({
        success: false,
        message: 'title, category, subCategory, assignedTo, and startDate are required',
      });
    }

    const branch = admin.branches?.[0];
    const storeName = branch?.workingBranch || '';
    const storeCode = branch?.locCode ? `Z-${branch.locCode}` : '';

    const taskCode = await nextTaskCode();
    const roleLabel = ROLE_LABELS[admin.role] || admin.role;
    const subRole = admin.subRole && admin.subRole !== 'NR' ? admin.subRole : '';

    const task = await Task.create({
      taskCode,
      title: title.trim(),
      category: category.trim(),
      subCategory: subCategory.trim(),
      assignedTo,
      assignedToLabel: ASSIGNED_TO_LABELS[assignedTo] || assignedTo,
      mode,
      startDate,
      startTime,
      endDate: mode === 'auto' ? startDate : endDate,
      endTime: mode === 'auto' ? startTime : endTime,
      description,
      additionalInfo,
      priority,
      status: 'PENDING',
      storeName,
      storeCode,
      createdBy: admin._id,
      assignedByName: admin.name,
      assignedByRole: subRole ? `${roleLabel} · ${subRole}` : roleLabel,
    });

    return res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: mapTaskForClient(task),
    });
  } catch (error) {
    console.error('Error creating task:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create task',
      error: error.message,
    });
  }
};

export const getTasks = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.userId).populate('branches');
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }

    const { search, category, priority, status } = req.query;
    let tasks = await Task.find({}).sort({ createdAt: -1 }).lean();

    if (admin.role !== 'super_admin') {
      const allowedCodes = (admin.branches || []).map((b) => b.locCode).filter(Boolean);
      const allowedNames = (admin.branches || []).map((b) => b.workingBranch).filter(Boolean);

      tasks = tasks.filter((t) => {
        if (t.createdBy?.toString() === admin._id.toString()) return true;
        if (t.storeCode && allowedCodes.some((c) => t.storeCode.includes(c))) return true;
        if (t.storeName && allowedNames.includes(t.storeName)) return true;
        return assignedToMatchesRole(t.assignedTo, admin.role);
      });
    }

    let mapped = tasks.map((t) => mapTaskForClient(t));

    if (search) {
      const q = search.toLowerCase();
      mapped = mapped.filter((t) => [
        t.title, t.id, t.assignee, t.categorySub, t.category, t.description,
      ].some((v) => String(v).toLowerCase().includes(q)));
    }

    if (category && category !== 'All') {
      mapped = mapped.filter((t) => t.category.toLowerCase().includes(category.toLowerCase()));
    }

    if (priority && priority !== 'All') {
      mapped = mapped.filter((t) => t.priority === priority);
    }

    if (status && status !== 'All') {
      mapped = mapped.filter((t) => t.status === status);
    }

    return res.status(200).json({
      success: true,
      count: mapped.length,
      data: mapped,
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch tasks',
      error: error.message,
    });
  }
};

function assignedToMatchesRole(assignedTo, role) {
  if (role === 'cluster_admin') {
    return assignedTo === 'cluster_admin' || assignedTo === 'all_stores' || assignedTo === 'store_admin';
  }
  if (role === 'store_admin') {
    return assignedTo === 'store_admin';
  }
  return true;
}

export const getTaskById = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findOne({
      $or: [{ taskCode: id }, ...(id.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: id }] : [])],
    });

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    return res.status(200).json({
      success: true,
      data: mapTaskForClient(task),
    });
  } catch (error) {
    console.error('Error fetching task:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch task',
      error: error.message,
    });
  }
};
