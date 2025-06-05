// import dotenv from 'dotenv';
// dotenv.config();
// import cron from "node-cron";
// import cors from 'cors';
// import express from 'express';
// import cookieParser from 'cookie-parser';
// import connectMongoDB from './db/database.js';
// import ModuleRouter from './routes/ModuleRoute.js';
// import userrouter from './routes/AssessmentAndModule.js';
// import UserCreating from './routes/UserRoute.js';
// import UserRouters from './routes/UserConRoute.js';
// import AdminData from './routes/AdminRoute.js'
// import FutterAssessment from './routes/FutterAssessment.js'
// import Whatsapprouter from './routes/WhatsappRouteZoho.js'
// import trainingRoute from './routes/MigrateRoute.js'; // Use ES module syntax


// import { AlertNotification } from './lib/CornJob.js';
// // import { sendWhatsAppMessage } from './lib/WhatsAppMessage.js';
// import setupSwagger from './swagger.js';
// // import { sendWhatsAppMessage } from './lib/WhatsAppMessage.js';
// const app = express();

// setupSwagger(app);
// const port = process.env.PORT || 7000;



// //http://localhost:3000

// app.use(express.json());

// app.use(cookieParser());

// app.use(express.urlencoded({ extended: true }));
// app.use(
//   cors({
//     origin: ['https://unicode-mu.vercel.app', 'https://lms.rootments.live', 'http://localhost:3000', 'https://lms-dev-jishnu.vercel.app', 'https://lms-3w6k.vercel.app', 'https://lmsrootments.vercel.app','https://lms-testenv-q8co.vercel.app'],
//     credentials: true,
//   })
// );

// app.get('/', (req, res) => {
//   res.send('✅ API is working');
// });


// app.use('/api', ModuleRouter)
// app.use('/api/user', userrouter)
// app.use('/api/usercreate', UserCreating)
// app.use('/api/auth', UserRouters)
// app.use('/api/admin', AdminData)
// app.use('/api/user/assessment', FutterAssessment)
// app.use('/zoho', Whatsapprouter)
// app.use('/api/trainings', trainingRoutes);


// console.log(new Date());




// cron.schedule("30 18 * * *", async () => {
//   console.log("Running AlertNotification at 18:30 IST...");
//   try {
//     await AlertNotification();
//     console.log("AlertNotification executed successfully.");
//   } catch (error) {
//     console.error("Error executing AlertNotification:", error);
//   }
// }, {
//   timezone: "Asia/Kolkata"  // ✅ Set timezone explicitly
// });

// // sendWhatsAppMessage("919846871894", "Hello! This is a test message from WhatsApp Cloud API")

// // cron.schedule("* * * * *", async () => {
// //   console.log("Running AlertNotification every minute for testing...");
// //   try {
// //     await AlertNotification();
// //   } catch (error) {
// //     console.error("Error executing AlertNotification:", error);
// //   }
// // });



// // AlertNotification();

// // sendWhatsAppMessage('917736724727', 'Running AlertNotification every minute for testing...')


// //abhiram
  




//     connectMongoDB().then(() => {
//   app.listen(port, () => {
//     console.log(`✅ Server running on port ${port}`);
//   });
// }).catch(err => {
//   console.error('❌ MongoDB connection failed:', err);
// });

    


// abhiram s kumar 

import dotenv from 'dotenv';
dotenv.config();
import cron from "node-cron";
import cors from 'cors';
import express from 'express';
import cookieParser from 'cookie-parser';
import connectMongoDB from './db/database.js';
import ModuleRouter from './routes/ModuleRoute.js';
import userrouter from './routes/AssessmentAndModule.js';
import UserCreating from './routes/UserRoute.js';
import UserRouters from './routes/UserConRoute.js';
import AdminData from './routes/AdminRoute.js';
import FutterAssessment from './routes/FutterAssessment.js';
import Whatsapprouter from './routes/WhatsappRouteZoho.js';
import TrainingRoutes from './routes/TrainingRoutes.js';

// Make sure the file name is correct

 // <-- Migrate training data route
 // Ensure this matches the correct file name


import { AlertNotification } from './lib/CornJob.js';
// import { sendWhatsAppMessage } from './lib/WhatsAppMessage.js';  // <-- Commented out as requested
import setupSwagger from './swagger.js';
// import { sendWhatsAppMessage } from './lib/WhatsAppMessage.js';  // <-- Commented out as requested

const app = express();

setupSwagger(app);
const port = process.env.PORT || 7000;

// http://localhost:3000
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: ['https://unicode-mu.vercel.app', 'https://lms.rootments.live', 'http://localhost:3000', 'https://lms-dev-jishnu.vercel.app', 'https://lms-3w6k.vercel.app', 'https://lmsrootments.vercel.app', 'https://lms-testenv-q8co.vercel.app'],
    credentials: true,
  })
);

// Root route to confirm API is working
app.get('/', (req, res) => {
  res.send('✅ API is working');
});

// Route setups
app.use('/api', ModuleRouter);
app.use('/api/user', userrouter);
app.use('/api/usercreate', UserCreating);
app.use('/api/auth', UserRouters);
app.use('/api/admin', AdminData);
app.use('/api/user/assessment', FutterAssessment);
app.use('/zoho', Whatsapprouter);
app.use('/api/admin', TrainingRoutes); 

console.log(new Date());

// Cron job to run AlertNotification daily at 6:30 PM IST
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

// Placeholder code for WhatsApp message sending (commented out)
  // sendWhatsAppMessage("919846871894", "Hello! This is a test message from WhatsApp Cloud API")

// Uncomment below to test cron job every minute (commented out)
// cron.schedule("* * * * *", async () => {
//   console.log("Running AlertNotification every minute for testing...");
//   try {
//     await AlertNotification();
//   } catch (error) {
//     console.error("Error executing AlertNotification:", error);
//   }
// });

// Uncomment this to send WhatsApp test message every minute (commented out)
// sendWhatsAppMessage('917736724727', 'Running AlertNotification every minute for testing...')

// MongoDB connection and starting the server
connectMongoDB().then(() => {
  app.listen(port, () => {
    console.log(`✅ Server running on port ${port}`);
  });
}).catch(err => {
  console.error('❌ MongoDB connection failed:', err);
});














// import express from 'express';
// import dotenv from 'dotenv';
// dotenv.config();
// import cron from 'node-cron';
// import cors from 'cors';
// import cookieParser from 'cookie-parser';
// import connectMongoDB from './db/database.js';
// import ModuleRouter from './routes/ModuleRoute.js';
// import userrouter from './routes/AssessmentAndModule.js';
// import UserCreating from './routes/UserRoute.js';
// import UserRouters from './routes/UserConRoute.js';
// import AdminData from './routes/AdminRoute.js';
// import FutterAssessment from './routes/FutterAssessment.js';
// import Whatsapprouter from './routes/WhatsappRouteZoho.js';
// import trainingRoutes from './routes/trainingRoutes.js'; // Correct ES Module import

// const app = express();
// const port = process.env.PORT || 7000;

// app.use(express.json());
// app.use(cookieParser());
// app.use(express.urlencoded({ extended: true }));

// app.use(
//   cors({
//     origin: [
//       'https://unicode-mu.vercel.app',
//       'https://lms.rootments.live',
//       'http://localhost:3000',
//       'https://lms-dev-jishnu.vercel.app',
//       'https://lms-3w6k.vercel.app',
//       'https://lmsrootments.vercel.app',
//       'https://lms-testenv-q8co.vercel.app',
//     ],
//     credentials: true,
//   })
// );

// app.get('/', (req, res) => {
//   res.send('✅ API is working');
// });

// // Route setup
// app.use('/api', ModuleRouter);
// app.use('/api/user', userrouter);
// app.use('/api/usercreate', UserCreating);
// app.use('/api/auth', UserRouters);
// app.use('/api/admin', AdminData);
// app.use('/api/user/assessment', FutterAssessment);
// app.use('/zoho', Whatsapprouter);
// app.use('/api/trainings', trainingRoutes);  // Route to handle training migrations

// connectMongoDB().then(() => {
//   app.listen(port, () => {
//     console.log(`✅ Server running on port ${port}`);
//   });
// }).catch(err => {
//   console.error('❌ MongoDB connection failed:', err);
// });
