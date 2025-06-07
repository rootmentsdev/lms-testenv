import mongoose from 'mongoose';
import TrainingProgress from '../model/Trainingprocessschema.js';

export const runFoundationServiceMigration = async () => {
  const session = await mongoose.startSession();
  let moved = 0;
  let merged = 0;

  try {
    await session.withTransaction(async () => {
      const assigned = await TrainingProgress.find(
        {
          trainingName: { $regex: /^foundation of service$/i },
          section: 'Assigned',
          status: 'Completed'
        },
        null,
        { session }
      );

      for (const p of assigned) {
        const mandatory = await TrainingProgress.findOne(
          {
            userId: p.userId,
            trainingName: { $regex: /^foundation of service$/i },
            section: 'Mandatory'
          },
          null,
          { session }
        );

        if (mandatory) {
          mandatory.status   = 'Completed';
          mandatory.pass     = p.pass     ?? mandatory.pass;
          mandatory.score    = p.score    ?? mandatory.score;
          mandatory.deadline = p.deadline ?? mandatory.deadline;
          mandatory.modules  = p.modules?.length ? p.modules : mandatory.modules;
          await mandatory.save({ session });
          merged++;
        } else {
          await TrainingProgress.create(
            [
              {
                userId:       p.userId,
                trainingName: p.trainingName,
                section:      'Mandatory',
                status:       'Completed',
                pass:         p.pass,
                score:        p.score,
                deadline:     p.deadline,
                modules:      p.modules
              }
            ],
            { session }
          );
          moved++;
        }

        await TrainingProgress.deleteOne({ _id: p._id }, { session });
      }
    });

    return { moved, merged };
  } finally {
    session.endSession();
  }
};
