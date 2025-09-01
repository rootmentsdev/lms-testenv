# Training Progress Validation Scripts

This directory contains comprehensive scripts to validate and check if training progress is correct in your LMS dashboard.

## 📁 Files Overview

- **`validate-training-progress.js`** - Comprehensive validation script with detailed error reporting
- **`check-dashboard-training-progress.js`** - Focused dashboard progress checking script
- **`run-training-progress-check.bat`** - Windows batch file to run validation
- **`run-training-progress-check.ps1`** - PowerShell script with better error handling
- **`check-training-progress.js`** - Original basic checking script

## 🚀 Quick Start

### Option 1: Using PowerShell (Recommended)
```powershell
# Navigate to backend directory
cd backend

# Run the PowerShell script
.\run-training-progress-check.ps1
```

### Option 2: Using Batch File
```cmd
# Navigate to backend directory
cd backend

# Run the batch file
run-training-progress-check.bat
```

### Option 3: Direct Node.js Execution
```bash
# Navigate to backend directory
cd backend

# Run the validation script directly
node check-dashboard-training-progress.js
```

## 🔧 Configuration

### Environment Variables
Set these environment variables in your `.env` file or system:

```bash
MONGODB_URI=mongodb://localhost:27017/lms
BASE_URL=http://localhost:7000
```

### Default Values
If environment variables are not set, the scripts will use:
- **MongoDB**: `mongodb://localhost:7000/lms`
- **Base URL**: `http://localhost:7000`

## 📊 What the Scripts Check

### 1. Data Integrity
- ✅ Required fields presence (userId, trainingId, trainingName, deadline)
- ✅ Valid data types and ranges
- ✅ Consistent module and video references

### 2. Progress Calculations
- ✅ Video completion percentages (0-100%)
- ✅ Module completion percentages
- ✅ Overall training progress calculations
- ✅ Pass status consistency with progress

### 3. Data Consistency
- ✅ User existence validation
- ✅ Training existence validation
- ✅ Module existence validation
- ✅ Video existence validation
- ✅ Orphaned record detection

### 4. Dashboard Metrics
- ✅ Total training count
- ✅ Completion rates
- ✅ Average progress calculations
- ✅ User-wise progress breakdown
- ✅ Training-wise statistics

## 📋 Output Examples

### Successful Validation
```
🚀 Starting Dashboard Training Progress Check...
============================================================
✅ Connected to MongoDB
📊 Found 25 training progress records

============================================================
📊 DASHBOARD TRAINING PROGRESS SUMMARY
============================================================
📈 Overall Statistics:
   Total Trainings: 25
   Completed: 18
   Pending: 7
   Average Progress: 78.5%
   Completion Rate: 72%

✅ No validation errors found
```

### Validation Errors Found
```
🚨 VALIDATION ERRORS FOUND:
----------------------------------------
   ❌ User John Doe (EMP001) - Training "Fire Safety" marked as passed but progress is only 85%
   ❌ User Jane Smith (EMP002) - Training "Data Security" has invalid progress: 125%
```

## 🛠️ Customization

### Log Levels
Modify the `LOG_LEVEL` in the scripts:
- `BASIC` - Essential information only
- `DETAILED` - Standard validation details
- `VERBOSE` - All information including data dumps

### Progress Thresholds
Adjust these values in the configuration:
```javascript
const CONFIG = {
    WATCH_PERCENTAGE_THRESHOLD: 80, // Minimum % to mark video complete
    MAX_PROGRESS_PERCENTAGE: 100,    // Maximum allowed progress
    MIN_PROGRESS_PERCENTAGE: 0       // Minimum allowed progress
};
```

## 🔍 Troubleshooting

### Common Issues

#### 1. MongoDB Connection Failed
```
❌ Error connecting to MongoDB: ECONNREFUSED
```
**Solution**: Ensure MongoDB is running and accessible at the configured URI.

#### 2. Module Not Found
```
❌ Module with ID 507f1f77bcf86cd799439011 not found
```
**Solution**: Check if the module exists in the Module collection or if there are orphaned references.

#### 3. Progress Calculation Errors
```
❌ Calculated progress 125.5% is outside valid range
```
**Solution**: Review the progress calculation logic and check for data corruption.

### Debug Mode
For detailed debugging, set log level to VERBOSE:
```javascript
LOG_LEVEL: 'VERBOSE'
```

## 📈 Performance Considerations

- **Large Datasets**: For systems with 1000+ training records, consider running validation during off-peak hours
- **Memory Usage**: The scripts load all training progress data into memory
- **Execution Time**: Typical validation takes 2-5 seconds per 100 records

## 🔄 Integration

### API Integration
Import and use the validation functions in your API:
```javascript
import { checkDashboardTrainingProgress } from './check-dashboard-training-progress.js';

// Use in your API endpoint
app.get('/api/validate-training-progress', async (req, res) => {
    try {
        const results = await checkDashboardTrainingProgress();
        res.json(results);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
```

### Scheduled Validation
Set up cron jobs for regular validation:
```bash
# Run validation every day at 2 AM
0 2 * * * cd /path/to/backend && node check-dashboard-training-progress.js
```

## 📞 Support

If you encounter issues:

1. **Check the logs** for detailed error messages
2. **Verify MongoDB connection** and database access
3. **Review data integrity** in your collections
4. **Check Node.js version** (requires Node.js 14+)

## 📝 Changelog

- **v1.0.0** - Initial release with comprehensive validation
- **v1.1.0** - Added dashboard-specific progress checking
- **v1.2.0** - Enhanced error reporting and recommendations
- **v1.3.0** - Added PowerShell and batch execution scripts

---

**Note**: Always backup your database before running validation scripts in production environments.
