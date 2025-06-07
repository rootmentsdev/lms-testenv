import mongoose from 'mongoose';
import TrainingProgress from '../model/Trainingprocessschema.js';

/**
 * POST /api/admin/migrate/foundationTraining
 * Migrates “Foundation of Service” progress
 *   – Moves each user’s *Completed* record from Assigned ➜ Mandatory
 *   – Merges if a Mandatory record already exists
 *   – Deletes the old Assigned record
 *   – Runs in a single transaction for full rollback safety
 */
export const migrateFoundationOfServiceTraining = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      // 1️⃣  Fetch all COMPLETED progress items in the Assigned section
      const assignedProgress = await TrainingProgress.find(
        {
          trainingName: { $regex: /^foundation of service$/i },
          section: 'Assigned',
          status: 'Completed'
        },
        null,
        { session }
      );

      // 2️⃣  For every user…
      for (const progress of assignedProgress) {
        // —— Check if they already have a Mandatory entry
        const mandatory = await TrainingProgress.findOne(
          {
            userId: progress.userId,
            trainingName: { $regex: /^foundation of service$/i },
            section: 'Mandatory'
          },
          null,
          { session }
        );

        if (mandatory) {
          // ✅ Merge the data
          mandatory.status    = 'Completed';
          mandatory.pass      = progress.pass      ?? mandatory.pass;
          mandatory.score     = progress.score     ?? mandatory.score;
          mandatory.deadline  = progress.deadline  ?? mandatory.deadline;
          mandatory.modules   = progress.modules?.length ? progress.modules : mandatory.modules;
          await mandatory.save({ session });
        } else {
          // ➕ Create a new Mandatory record
          await TrainingProgress.create(
            [
              {
                userId:       progress.userId,
                trainingName: progress.trainingName,   // keep exact capitalisation
                section:      'Mandatory',
                status:       'Completed',
                pass:         progress.pass,
                score:        progress.score,
                deadline:     progress.deadline,
                modules:      progress.modules
              }
            ],
            { session }
          );
        }

        // 3️⃣ Delete the old Assigned entry
        await TrainingProgress.deleteOne({ _id: progress._id }, { session });
      }
    });

    res.json({ message: 'Migration finished successfully 🎉' });
  } catch (err) {
    // Roll back everything if anything failed
    await session.abortTransaction();
    console.error('❌ Migration failed:', err);
    res.status(500).json({ message: 'Migration failed', error: err.message });
  } finally {
    session.endSession();
  }
};
