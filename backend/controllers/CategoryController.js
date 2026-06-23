import Category from '../model/Category.js';
import Admin from '../model/Admin.js';
import User from '../model/User.js';

// Get categories
export const getCategories = async (req, res) => {
  try {
    const adminId = req.admin.userId;
    const { manage } = req.query;

    // Resolve user role
    let userRole = req.admin.role;
    const adminUser = await Admin.findById(adminId);
    if (adminUser) {
      userRole = adminUser.role;
    } else {
      const user = await User.findById(adminId);
      if (user) {
        userRole = user.role || 'employee'; // fallback
      }
    }

    let categories;
    if (['super_admin', 'admin'].includes(userRole) && manage === 'true') {
      // Admins managing categories get all of them
      categories = await Category.find({}).sort({ name: 1 });
    } else {
      // Filter categories allowed for the user's role.
      // If a category has an empty allowedRoles array, we assume it's visible to everyone
      categories = await Category.find({
        $or: [
          { allowedRoles: userRole },
          { allowedRoles: { $size: 0 } },
          { allowedRoles: { $exists: false } }
        ]
      }).sort({ name: 1 });
    }

    return res.status(200).json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
      error: error.message
    });
  }
};

// Create category
export const createCategory = async (req, res) => {
  try {
    const { name, subCategories = [], allowedRoles = [] } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required'
      });
    }

    const trimmedName = name.trim();

    // Check for existing category
    const existing = await Category.findOne({ name: { $regex: new RegExp(`^${trimmedName}$`, 'i') } });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Category already exists'
      });
    }

    const category = await Category.create({
      name: trimmedName,
      subCategories: subCategories.map(s => s.trim()).filter(Boolean),
      allowedRoles: allowedRoles.map(r => r.trim()).filter(Boolean)
    });

    return res.status(201).json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error('Error creating category:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create category',
      error: error.message
    });
  }
};

// Update category
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, subCategories, allowedRoles } = req.body;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    if (name !== undefined) {
      const trimmedName = name.trim();
      if (!trimmedName) {
        return res.status(400).json({
          success: false,
          message: 'Category name cannot be empty'
        });
      }
      // Check if name is taken by another category
      const existing = await Category.findOne({
        name: { $regex: new RegExp(`^${trimmedName}$`, 'i') },
        _id: { $ne: id }
      });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'Category name already exists'
        });
      }
      category.name = trimmedName;
    }

    if (subCategories !== undefined) {
      category.subCategories = subCategories.map(s => s.trim()).filter(Boolean);
    }

    if (allowedRoles !== undefined) {
      category.allowedRoles = allowedRoles.map(r => r.trim()).filter(Boolean);
    }

    await category.save();

    return res.status(200).json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error('Error updating category:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update category',
      error: error.message
    });
  }
};

// Delete category
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findByIdAndDelete(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete category',
      error: error.message
    });
  }
};
