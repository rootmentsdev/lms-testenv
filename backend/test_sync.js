import CronLog from './model/CronLog.js';
console.log('errorDetails path details:');
console.log(CronLog.schema.paths.errorDetails);
console.log('errorDetails caster details:');
console.log(CronLog.schema.paths.errorDetails.caster);
process.exit(0);
