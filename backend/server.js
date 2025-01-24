import dotenv from 'dotenv';
dotenv.config();
import cors from 'cors';
import express from 'express';
import cookieParser from 'cookie-parser';
import connectMongoDB from './db/database.js';
import ModuleRouter from './routes/ModuleRoute.js';
import userrouter from './routes/AssessmentAndModule.js';
import UserCreating from './routes/UserRoute.js';
import UserRouters from './routes/UserConRoute.js';
import AdminData from './routes/AdminRoute.js'
import FutterAssessment from './routes/FutterAssessment.js'
import User from './model/User.js';
import Admin from './model/Admin.js';
const app = express();
const port = process.env.PORT || 7000;

//http://localhost:3000

app.use(express.json());

app.use(cookieParser());

app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: ['https://unicode-mu.vercel.app', 'http://localhost:3000', 'https://lms-steel-kappa.vercel.app', 'https://lms-1-121p.onrender.com'],
    credentials: true,
  })
);

app.get('/', (req, res) => {
  res.send('App is running');
});

app.use('/api', ModuleRouter)
app.use('/api/user', userrouter)
app.use('/api/usercreate', UserCreating)
app.use('/pi/auth', UserRouters)
app.use('/api/admin', AdminData)
app.use('/api/user/assessment', FutterAssessment)




const now = new Date();


const AlertNotification = async () => {
  try {
    // Fetch all users
    const users = await User.find();

    // Fetch all store managers with their branches populated
    const storeManagers = await Admin.find({ role: "store_admin" }).populate("branches");

    // Uncomment this block if you want to log branches for each store manager
    // storeManagers.forEach((storeManager) => {
    //   console.log(storeManager.branches);
    // });

    // Iterate through users and log deadlines
    users.forEach((user) => {
      const training = user.training; // Ensure the training field exists in the schema
      training.map((item) => {





        if (now >= new Date(deadline.getTime() - 24 * 60 * 60 * 1000)) {
          // Level 1: Notify 1 day before, on, and after the deadline
          const beforeDeadline = new Date(deadline.getTime() - 24 * 60 * 60 * 1000);
          const afterDeadline = new Date(deadline.getTime() + 24 * 60 * 60 * 1000);



        }
      })

    });
  } catch (error) {
    console.error("Error in AlertNotification:", error);
  }
};

// AlertNotification();




app.listen(port, () => {
  connectMongoDB()
  console.log(`Server running on port ${port}`);
});

