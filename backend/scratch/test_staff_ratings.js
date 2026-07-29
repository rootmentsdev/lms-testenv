import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://abhirambca2021_db_user:Root@cluster0.5rf3i8g.mongodb.net/Rootments?retryWrites=true&w=majority&appName=Cluster0';

import StaffPerformance from '../model/StaffPerformance.js';
import BranchAudit from '../model/BranchAudit.js';
import User from '../model/User.js';
import Admin from '../model/Admin.js';
import { savePerformance, getMyRating, getStaffResults } from '../controllers/PerformanceController.js';
import { createBranchAudit } from '../controllers/BranchAuditController.js';

// Mock Response Helper
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

async function testPerformanceAPI(testManager, testEmployee) {
  console.log('\n--- 1. Testing POST /api/performance/save ---');
  
  // Clean up any old rating first
  await StaffPerformance.deleteMany({ staffName: testEmployee.name });
  
  const postReq = {
    admin: { userId: testManager._id.toString() },
    body: {
      staffName: testEmployee.name,
      punctuality: 5,
      leaveDiscipline: 4,
      groomingStandards: 5,
      customerEtiquette: 5,
      teamwork: 4,
      productOwnership: 3,
      customerIssueOwnership: 4,
      sopAdherence: 5,
      adapting: 4,
      learningAttitude: 5
    }
  };
  
  const postRes = mockResponse();
  await savePerformance(postReq, postRes);
  
  console.log('Status Code:', postRes.statusCode);
  console.log('Response JSON:', postRes.jsonData);
  
  if (postRes.statusCode !== 201) {
    throw new Error('Performance save failed');
  }

  // Double check saved database record
  const savedRating = await StaffPerformance.findOne({ staffName: testEmployee.name });
  console.log('Saved Record in DB averageScore:', savedRating ? savedRating.averageScore : 'NOT FOUND');
  console.log('Resolved Employee ID (empID):', savedRating ? savedRating.empID : 'NOT FOUND');

  console.log('\n--- 2. Testing GET /api/performance/my-rating ---');
  const myRatingReq = {
    admin: { userId: testEmployee._id.toString(), email: testEmployee.email }
  };
  const myRatingRes = mockResponse();
  await getMyRating(myRatingReq, myRatingRes);
  
  console.log('Status Code:', myRatingRes.statusCode);
  console.log('Response JSON:', JSON.stringify(myRatingRes.jsonData, null, 2));
  
  if (myRatingRes.statusCode !== 200) {
    throw new Error('Get own rating failed');
  }

  console.log('\n--- 3. Testing GET /api/performance/staff-results ---');
  const staffResultsReq = {
    admin: { userId: testManager._id.toString() },
    query: {}
  };
  const staffResultsRes = mockResponse();
  await getStaffResults(staffResultsReq, staffResultsRes);
  
  console.log('Status Code:', staffResultsRes.statusCode);
  console.log('Response JSON List Size:', staffResultsRes.jsonData?.data?.length);
  console.log('First Record Average Score:', staffResultsRes.jsonData?.data?.[0]?.averageScore);
  
  if (staffResultsRes.statusCode !== 200) {
    throw new Error('Get staff results failed');
  }

  console.log('\n--- 4. Testing GET /api/performance/staff-results?staffName=... ---');
  const searchResultsReq = {
    admin: { userId: testManager._id.toString() },
    query: { staffName: testEmployee.name }
  };
  const searchResultsRes = mockResponse();
  await getStaffResults(searchResultsReq, searchResultsRes);
  
  console.log('Status Code:', searchResultsRes.statusCode);
  console.log('Filtered Response JSON:', JSON.stringify(searchResultsRes.jsonData, null, 2));

  if (searchResultsRes.jsonData?.data?.length === 0) {
    throw new Error('Search by staffName returned empty results');
  }
}

async function testBranchAuditAPI(testManager) {
  console.log('\n--- 5. Testing POST /api/admin/branch-audit root-level observation/action plan ---');
  
  const testStoreName = 'TEST_VERIFY_STORE_' + Date.now();
  
  const auditReq = {
    admin: { userId: testManager._id.toString() },
    body: {
      store: testStoreName,
      storeId: new mongoose.Types.ObjectId().toString(),
      sections: [
        {
          title: "Test Section",
          items: [{ label: "Item 1", score: 4 }],
          remarks: "Test Section Remarks"
        }
      ],
      auditorObservation: "This is a root-level observation",
      actionPlanForShortfalls: "This is a root-level shortfall action plan",
      ratedOn: "2026-07-19",
      metadata: {}
    }
  };

  const auditRes = mockResponse();
  await createBranchAudit(auditReq, auditRes);
  
  console.log('Status Code:', auditRes.statusCode);
  console.log('Response JSON auditorRemarks:', auditRes.jsonData?.data?.auditorRemarks);
  console.log('Response JSON root fields:', {
    auditorObservation: auditRes.jsonData?.data?.auditorObservation,
    actionPlanForShortfalls: auditRes.jsonData?.data?.actionPlanForShortfalls
  });
  
  if (auditRes.statusCode !== 201) {
    throw new Error('Branch audit creation failed');
  }

  // Retrieve from DB to make sure it saved
  const dbAudit = await BranchAudit.findOne({ store: testStoreName });
  console.log('DB BranchAudit Record saved fields:');
  console.log('  auditorObservation:', dbAudit.auditorObservation);
  console.log('  actionPlanForShortfalls:', dbAudit.actionPlanForShortfalls);
  console.log('  auditorRemarks.observationAcknowledged:', dbAudit.auditorRemarks?.observationAcknowledged);
  console.log('  auditorRemarks.actionPlanForShortfalls:', dbAudit.auditorRemarks?.actionPlanForShortfalls);

  if (dbAudit.auditorObservation !== "This is a root-level observation" ||
      dbAudit.actionPlanForShortfalls !== "This is a root-level shortfall action plan") {
    throw new Error('BranchAudit root-level fields were not saved properly in database!');
  }
  
  // Clean up
  await BranchAudit.deleteMany({ store: testStoreName });
}

async function run() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB');
  
  try {
    // Find or seed a test manager
    let testManager = await Admin.findOne({ role: 'super_admin' });
    if (!testManager) {
      testManager = await Admin.findOne({ role: 'store_admin' });
    }
    if (!testManager) {
      testManager = await Admin.findOne();
    }
    if (!testManager) {
      throw new Error('No manager / admin account found in database to act as manager');
    }
    console.log(`Using manager: Name: ${testManager.name || testManager.username}, ID: ${testManager._id}, Role: ${testManager.role}`);

    // Find or seed a test employee
    let testEmployee = await User.findOne({ empID: 'emp8899' });
    if (!testEmployee) {
      testEmployee = await User.findOne();
    }
    if (!testEmployee) {
      throw new Error('No employee account found in database to rate');
    }
    console.log(`Using employee to rate: Name: ${testEmployee.username}, ID: ${testEmployee._id}, Emp ID: ${testEmployee.empID}`);

    const employeeObj = {
      _id: testEmployee._id,
      name: testEmployee.username,
      email: testEmployee.email,
      empID: testEmployee.empID
    };

    await testPerformanceAPI(testManager, employeeObj);
    await testBranchAuditAPI(testManager);
    
    console.log('\n=============================================');
    console.log('✅ ALL VERIFICATION TESTS PASSED SUCCESSFULLY!');
    console.log('=============================================');
  } catch (error) {
    console.error('\n❌ VERIFICATION TEST FAILED:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

run().catch(console.error);
