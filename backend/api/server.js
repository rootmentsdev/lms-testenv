// Vercel API server - This will be deployed as a serverless function
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import AssessmentAndModuleRouter from '../routes/AssessmentAndModule.js';
import AdminRoute from '../routes/AdminRoute.js';
import EmployeeRoute from '../routes/EmployeeRoute.js';
import UserConRoute from '../routes/UserConRoute.js';
import UserRoute from '../routes/UserRoute.js';
import UserLoginRoute from '../routes/UserLoginRoute.js';
import ModuleRoute from '../routes/ModuleRoute.js';
import FutterAssessment from '../routes/FutterAssessment.js';
import WhatsappRouteZoho from '../routes/WhatsappRouteZoho.js';
import externalEmployees from '../routes/externalEmployees.js';

const app = express();

// Enhanced CORS configuration for Vercel
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'https://unicode-mu.vercel.app',
      'https://lms.rootments.live',
      'http://localhost:3000',
      'http://localhost:5173', // dev (Vite) - CRITICAL FOR LOCAL DEVELOPMENT
      'https://lms-dev-jishnu.vercel.app',
      'https://lms-3w6k.vercel.app',
      'https://lmsrootments.vercel.app',
      'https://lms-testenv-q8co.vercel.app'
    ];
    
    // Log the origin for debugging in Vercel
    console.log('🌐 CORS Origin Check:', origin);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      console.log('✅ CORS Origin Allowed:', origin);
      callback(null, true);
    } else {
      console.log('🚫 CORS Origin Blocked:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control',
    'Pragma',
    'X-API-Key'
  ],
  exposedHeaders: ['Content-Length', 'X-Requested-With'],
  maxAge: 86400, // 24 hours
  preflightContinue: false,
  optionsSuccessStatus: 200
}));

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// Force CORS headers for all API routes in Vercel
app.use('/', (req, res, next) => {
  const origin = req.headers.origin;
  
  // Set CORS headers for localhost:5173
  if (origin === 'http://localhost:5173') {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, Pragma, X-API-Key');
    res.header('Access-Control-Max-Age', '86400');
  }
  
  next();
});

// Add specific OPTIONS handler for the training process endpoint
app.options('/user/update/trainingprocess', (req, res) => {
  const origin = req.headers.origin;
  
  if (origin) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Methods', 'PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, Pragma, X-API-Key');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Max-Age', '86400');
  
  res.status(200).end();
});

// Add direct PATCH route handler for training process (backup)
import { UpdateuserTrainingprocess } from '../controllers/CreateUser.js';
app.patch('/user/update/trainingprocess', async (req, res) => {
  // Set CORS headers
  const origin = req.headers.origin;
  if (origin) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Call the controller function
  await UpdateuserTrainingprocess(req, res);
});

// Enhanced preflight OPTIONS handler for Vercel compatibility
app.options('*', (req, res) => {
  const origin = req.headers.origin;
  
  // Set CORS headers
  if (origin) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, Pragma, X-API-Key');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Max-Age', '86400');
  
  // Handle preflight
  res.status(200).end();
});

// API routes (note: no /api prefix needed in Vercel api directory)
app.use('/user', AssessmentAndModuleRouter);
app.use('/admin', AdminRoute);
app.use('/employee', EmployeeRoute);
app.use('/usercon', UserConRoute);
app.use('/userroute', UserRoute);
app.use('/userlogin', UserLoginRoute);
app.use('/module', ModuleRoute);
app.use('/futterassessment', FutterAssessment);
app.use('/whatsapp', WhatsappRouteZoho);
app.use('/externalemployees', externalEmployees);

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ message: '✅ LMS API is working on Vercel' });
});

// Export for Vercel
export default app;
