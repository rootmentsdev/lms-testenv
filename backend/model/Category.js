import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  subCategories: [{ type: String, trim: true }],
  allowedRoles: [{ type: String, trim: true }] // E.g., ['super_admin', 'admin', 'store_admin']
}, { timestamps: true });

const Category = mongoose.model('Category', categorySchema);

export const seedDefaultCategories = async () => {
  try {
    const count = await Category.countDocuments();
    if (count === 0) {
      console.log('🌱 Seeding default task categories...');
      const defaults = [
        {
          name: 'REPORTS&PERFORMANCE',
          subCategories: ['POS REPORTS', 'PERFORMANCE REPORTS', 'RECORDS&DOCUMENTS'],
          allowedRoles: ['super_admin', 'admin', 'hr_admin', 'cluster_admin', 'store_admin', 'employee']
        },
        {
          name: 'STORE HYGIENE&CLEANING',
          subCategories: ['DEEP CLEANING', 'VISUAL MERCHANDISING', 'PRODUCT CLEANING'],
          allowedRoles: ['super_admin', 'admin', 'hr_admin', 'cluster_admin', 'store_admin', 'employee']
        },
        {
          name: 'INVENTORY AUDIT&MANAGEMENT',
          subCategories: ['STOCK VALUATION&VERIFICATION', 'INTER STORE STOCK TRANSFER'],
          allowedRoles: ['super_admin', 'admin', 'hr_admin', 'cluster_admin', 'store_admin', 'employee']
        },
        {
          name: 'EMPLOYEE MANAGEMENT&DEVELOPMENT',
          subCategories: ['EMPLOYEE TRAININGS', 'EMPLOYEE PERFORMANCE REVIEW', 'EMPLOYEE SPECIFIC TASK'],
          allowedRoles: ['super_admin', 'admin', 'hr_admin', 'cluster_admin', 'store_admin', 'employee']
        },
        {
          name: 'MAINTENANCE',
          subCategories: ['ELECTRICAL', 'PLUMBING', 'CLEANING'],
          allowedRoles: ['super_admin', 'admin', 'hr_admin', 'cluster_admin', 'store_admin', 'employee']
        }
      ];
      await Category.insertMany(defaults);
      console.log('✅ Default task categories seeded successfully!');
    }
  } catch (error) {
    console.error('❌ Error seeding default task categories:', error);
  }
};

export default Category;

