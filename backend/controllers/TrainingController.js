import { runFoundationServiceMigration } from '../services/foundationMigration.js';

export const migrateFoundationOfServiceTraining = async (_req, res) => {
  try {
    const { moved, merged } = await runFoundationServiceMigration();
    res.json({ message: `Migration done ✔️  moved ${moved}, merged ${merged}` });
  } catch (err) {
    console.error('❌ Migration failed:', err);
    res.status(500).json({ message: 'Migration failed', error: err.message });
  }
};
