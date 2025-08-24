// Test script to verify route registration
// Run this with: node test-route.js

import express from 'express';
import AssessmentAndModuleRouter from './routes/AssessmentAndModule.js';

const app = express();
app.use(express.json());

// Add the router
app.use('/api/user', AssessmentAndModuleRouter);

// List all registered routes
console.log('🧪 Testing route registration...');
console.log('📍 Registered routes:');

// Get all registered routes
const routes = [];
app._router.stack.forEach(middleware => {
  if (middleware.route) {
    routes.push({
      path: middleware.route.path,
      methods: Object.keys(middleware.route.methods)
    });
  } else if (middleware.name === 'router') {
    middleware.handle.stack.forEach(handler => {
      if (handler.route) {
        routes.push({
          path: `/api/user${handler.route.path}`,
          methods: Object.keys(handler.route.methods)
        });
      }
    });
  }
});

routes.forEach(route => {
  console.log(`   ${route.methods.join(', ').toUpperCase()} ${route.path}`);
});

console.log('\n🎯 Route test complete!');
console.log('💡 Look for: PATCH /api/user/update/trainingprocess');
