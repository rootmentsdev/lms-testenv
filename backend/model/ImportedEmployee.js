import mongoose from 'mongoose';

const importedEmployeeSchema = new mongoose.Schema({
  store_name: { type: String, default: '' },
  name: { type: String, default: '' },
  contact: { type: String, default: '', index: true },
  f_date: { type: String, default: '' },
  walk_status: { type: String, default: '' },
  cat: { type: String, default: '' },
  sub: { type: String, default: '' },
  remark: { type: String, default: '' },
  repeat_count: { type: String, default: '' },
  manager_name: { type: String, default: '' },
  created_by: { type: String, default: '' },
  created_at: { type: String, default: '' },
  raw: { type: mongoose.Schema.Types.Mixed, default: null },
}, {
  timestamps: true,
  collection: 'imported_employees',
});

importedEmployeeSchema.index({ store_name: 1 });
importedEmployeeSchema.index({ name: 1 });
importedEmployeeSchema.index({ created_at: -1 });

const ImportedEmployee = mongoose.model('ImportedEmployee', importedEmployeeSchema);

export default ImportedEmployee;
