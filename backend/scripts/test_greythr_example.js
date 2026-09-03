import dotenv from 'dotenv';
dotenv.config();

import { logEmployeeCategoriesExample } from '../services/greythrService.js';

console.log('Testing GreytHR API Integration Example...');
logEmployeeCategoriesExample()
  .then(() => {
    console.log('GreytHR API Integration test completed.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('GreytHR API Integration test failed:', err);
    process.exit(1);
  });
