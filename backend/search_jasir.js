import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const AdminSchema = new mongoose.Schema({}, { strict: false });
const UserSchema = new mongoose.Schema({}, { strict: false });
const EmployeeSchema = new mongoose.Schema({}, { strict: false });

const Admin = mongoose.model('Admin', AdminSchema, 'admins');
const User = mongoose.model('User', UserSchema, 'users');
const Employee = mongoose.model('Employee', EmployeeSchema, 'employees');

async function run() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/lms-testenv'); // Assuming the db is local or in .env
  
  const query = { $or: [{ name: /jasir/i }, { username: /jasir/i }, { firstName: /jasir/i }] };
  
  const admins = await Admin.find(query);
  console.log('Admins:', JSON.stringify(admins, null, 2));
  
  const users = await User.find(query);
  console.log('Users:', JSON.stringify(users, null, 2));

  const employees = await Employee.find(query);
  console.log('Employees:', JSON.stringify(employees, null, 2));
  
  mongoose.disconnect();
}
run();
