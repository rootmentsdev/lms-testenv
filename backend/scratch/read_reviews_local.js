import mongoose from 'mongoose';
import GoogleReviewEntry from '../model/GoogleReviewEntry.js';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb+srv://abhijithgkaimal0240_db_user:JrFuLL0YdZW0XCcK@cluster0.utxjdfx.mongodb.net/test?appName=Cluster0';

async function run() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    // Clean up test entries
    await GoogleReviewEntry.deleteMany({ date: { $in: ['2026-07-18', '2026-07-19'] } });

    // 1. Insert entry for Z-Edapally1 on 2026-07-18: 10 ratings with 5.0
    await GoogleReviewEntry.create({
      branchName: 'Z-Edapally1',
      date: '2026-07-18',
      count: 10,
      rating: 5.0,
    });

    // 2. Insert entry for Z-Edapally1 on 2026-07-19: 30 ratings with 4.2
    await GoogleReviewEntry.create({
      branchName: 'Z-Edapally1',
      date: '2026-07-19',
      count: 30,
      rating: 4.2,
    });

    // Weighted average: (10 * 5.0 + 30 * 4.2) / (10 + 30) = (50 + 126) / 40 = 176 / 40 = 4.4

    // Test aggregation
    const ratingStats = await GoogleReviewEntry.aggregate([
      { $match: { rating: { $gt: 0 } } },
      {
        $group: {
          _id: '$branchName',
          totalWeightedRating: { $sum: { $multiply: ['$rating', { $cond: [{ $gt: ['$count', 0] }, '$count', 1] }] } },
          totalWeight: { $sum: { $cond: [{ $gt: ['$count', 0] }, '$count', 1] } }
        }
      }
    ]);
    console.log("Weighted Average ratingStats output:", ratingStats);

    // Clean up test entries
    await GoogleReviewEntry.deleteMany({ date: { $in: ['2026-07-18', '2026-07-19'] } });
    console.log("Cleaned up test entries");

    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}

run();
