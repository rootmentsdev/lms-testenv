import dotenv from 'dotenv';
import cron from "node-cron";
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

import { AlertNotification } from './lib/CornJob.js';
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
app.use('/api/auth', UserRouters)
app.use('/api/admin', AdminData)
app.use('/api/user/assessment', FutterAssessment)



console.log(new Date());




cron.schedule("30 18 * * *", async () => {
  console.log("Running AlertNotification at 18:30 IST...");
  try {
    await AlertNotification();
    console.log("AlertNotification executed successfully.");
  } catch (error) {
    console.error("Error executing AlertNotification:", error);
  }
}, {
  timezone: "Asia/Kolkata"  // ✅ Set timezone explicitly
});



// cron.schedule("* * * * *", async () => {
//   console.log("Running AlertNotification every minute for testing...");
//   try {
//     await AlertNotification();
//   } catch (error) {
//     console.error("Error executing AlertNotification:", error);
//   }
// });



// AlertNotification();




app.listen(port, () => {
  connectMongoDB()
  console.log(`Server running on port ${port}`);
});

