import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import User from '../model/User.js';

async function checkEmp() {
  await mongoose.connect(process.env.MONGODB_URI);
  const users = await User.find({
    name: { $regex: /shan|shamil|shabir|faris|basil/i }
  }, { name: 1, username: 1, empID: 1, EmpId: 1, employeeId: 1, emp_code: 1, empCode: 1, workingBranch: 1 }).lean();
  
  console.log('--- MATCHING USERS ---');
  users.forEach(u => {
    const code = u.empID || u.EmpId || u.employeeId || u.emp_code || u.empCode;
    console.log(`Name: "${u.name || u.username}" | empID: "${code}" | branch: ${u.workingBranch}`);
  });

  process.exit(0);
}

checkEmp();
