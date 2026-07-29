import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { createBranchAudit } from '../controllers/BranchAuditController.js';
import BranchAudit from '../model/BranchAudit.js';

dotenv.config();

const mockResponse = () => {
  const res = {};
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (data) => {
    res.jsonData = data;
    return res;
  };
  return res;
};

async function run() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("❌ MONGODB_URI not found in env file");
    process.exit(1);
  }

  console.log("🔌 Connecting to MongoDB...");
  await mongoose.connect(uri);
  console.log("✅ Connected successfully!");

  try {
    const payload = {
      store: "G.Kannur",
      storeId: "6a158244cb0a54bf2ec3b7c2",
      ratedBy: "SUBIN SUDHAKARAN P",
      ratedById: "Emp256",
      ratedOn: "2026-07-21",
      overallRating: 5.0,
      sections: [
        {
          title: "Business Performance Management",
          remarks: "",
          items: [
            {
              label: "Weekly target achievement",
              score: 5
            },
            {
              label: "Conversion management",
              score: 5
            },
            {
              label: "ABS management",
              score: 5
            },
            {
              label: "Team performance monitoring",
              score: 5
            }
          ]
        },
        {
          title: "Store Operations & SOP Compliance",
          remarks: "",
          items: [
            {
              label: "Walk-in discipline",
              score: 5
            },
            {
              label: "Reporting discipline",
              score: 5
            },
            {
              label: "Billing SOP adherence",
              score: 5
            },
            {
              label: "Process implementation",
              score: 5
            }
          ]
        },
        {
          title: "Product & Customer Readiness",
          remarks: "",
          items: [
            {
              label: "Product quality",
              score: 5
            },
            {
              label: "T-2 Rent-out preparation",
              score: 5
            },
            {
              label: "Alteration control",
              score: 5
            },
            {
              label: "Customer complaints",
              score: 5
            }
          ]
        },
        {
          title: "Team Leadership & Culture",
          remarks: "",
          items: [
            {
              label: "Briefing quality",
              score: 5
            },
            {
              label: "Team discipline",
              score: 5
            },
            {
              label: "Fairness",
              score: 5
            },
            {
              label: "Coaching ability",
              score: 5
            },
            {
              label: "Ownership culture",
              score: 5
            }
          ]
        },
        {
          title: "Store Standards & Presentation",
          remarks: "",
          items: [
            {
              label: "VM standards",
              score: 5
            },
            {
              label: "Store cleanliness",
              score: 5
            },
            {
              label: "Product presentation",
              score: 5
            },
            {
              label: "Brand representation",
              score: 5
            }
          ]
        }
      ],
      auditorRemarks: {
        observationAcknowledged: "AAAAAAAAAAAAAAAAAAAAA",
        actionPlanForShortfalls: "SSSSSSSSSSSSSSSSSS"
      }
    };

    console.log("🚀 Simulating controller invocation with payload...");
    const req = {
      body: payload,
      admin: { userId: "6a158244cb0a54bf2ec3b7c2" } // Logged in admin context
    };
    const res = mockResponse();

    await createBranchAudit(req, res);

    console.log(`Response Code: ${res.statusCode}`);
    console.log("Response data:", JSON.stringify(res.jsonData, null, 2));

    if (res.statusCode === 201) {
      console.log("✅ Audit created successfully via controller!");
      
      const savedDoc = await BranchAudit.findById(res.jsonData.data._id);
      if (!savedDoc) throw new Error("Document was not saved to MongoDB");

      console.log("Saved Document details from DB:");
      console.log("  store:", savedDoc.store);
      console.log("  storeId:", savedDoc.storeId);
      console.log("  ratedBy:", savedDoc.ratedBy);
      console.log("  ratedById:", savedDoc.ratedById);
      console.log("  overallRating:", savedDoc.overallRating);

      // Verify fields are correctly preserved
      if (savedDoc.ratedBy !== "SUBIN SUDHAKARAN P") {
        throw new Error(`ratedBy expected "SUBIN SUDHAKARAN P", got "${savedDoc.ratedBy}"`);
      }
      if (savedDoc.ratedById !== "Emp256") {
        throw new Error(`ratedById expected "Emp256", got "${savedDoc.ratedById}"`);
      }
      if (savedDoc.storeId.toString() !== "6a158244cb0a54bf2ec3b7c2") {
        throw new Error(`storeId expected "6a158244cb0a54bf2ec3b7c2", got "${savedDoc.storeId}"`);
      }

      console.log("🎉 ALL PRESENCE & VALIDATION VERIFICATIONS PASSED SUCCESSFULLY!");
      
      // Clean up the created test audit
      await BranchAudit.findByIdAndDelete(savedDoc._id);
      console.log("🗑️ Cleaned up test document.");
    } else {
      throw new Error(`Audit creation failed: ${res.jsonData?.message || "Unknown error"}`);
    }

  } catch (error) {
    console.error("❌ Verification failed:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB.");
  }
}

run();
