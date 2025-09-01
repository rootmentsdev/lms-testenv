# Overdue Training Count Fix

## Issue Description
The dashboard was showing incorrect overdue training counts because the system was calculating overdue trainings from the `User` collection's `training` array instead of the actual `TrainingProgress` collection where the real training progress and deadlines are stored.

## Root Cause
The following functions were using the wrong data source:
1. `calculateProgress` in `AssessmentController.js` - Dashboard data
2. `FindOverDueTraining` in `AssessmentReassign.js` - Overdue training page
3. `GetStoreManagerDueDate` in `FutterAssessment.js` - Store manager dashboard

## Changes Made

### 1. Fixed `calculateProgress` function in `backend/controllers/AssessmentController.js`
**Before:**
```javascript
users.forEach(user => {
    if (Array.isArray(user.training)) {
        trainingpend += user.training.filter(
            item => day > item.deadline && item.pass === false
        ).length;
    }
});
```

**After:**
```javascript
// Calculate overdue trainings from TrainingProgress collection
const currentDate = new Date();
const overdueTrainings = await TrainingProgress.find({
    userId: { $in: users.map(user => user._id) },
    deadline: { $lt: currentDate },
    pass: false
});

trainingpend = overdueTrainings.length;
```

### 2. Fixed `FindOverDueTraining` function in `backend/controllers/AssessmentReassign.js`
**Before:**
- Queried `User` collection with `training` array filter
- Used `user.training.filter()` to find overdue items

**After:**
- Queries `TrainingProgress` collection directly
- Groups results by user for proper display
- Includes proper population of training names

### 3. Fixed `GetStoreManagerDueDate` function in `backend/controllers/FutterAssessment.js`
**Before:**
- Used `user.training.filter()` and `user.assignedAssessments.filter()`

**After:**
- Queries `TrainingProgress` and `AssessmentProcess` collections separately
- Groups results by user for proper display

## Data Structure Changes
The overdue training data now comes from the correct source:
- **TrainingProgress Collection**: Contains actual training progress, deadlines, and completion status
- **AssessmentProcess Collection**: Contains assessment progress and deadlines

## Benefits
1. **Accurate Counts**: Dashboard now shows real overdue training numbers
2. **Real-time Data**: Uses actual progress data instead of assignment data
3. **Consistent Logic**: All overdue calculations now use the same data source
4. **Better Performance**: Direct queries to progress collections are more efficient

## Testing
- Backend server starts without syntax errors
- All imports are properly configured
- Data structure matches frontend expectations

## Files Modified
1. `backend/controllers/AssessmentController.js` - Dashboard progress calculation
2. `backend/controllers/AssessmentReassign.js` - Overdue training page
3. `backend/controllers/FutterAssessment.js` - Store manager dashboard

## Next Steps
1. Test the dashboard to verify overdue training counts are now accurate
2. Verify the overdue training page displays correct data
3. Check that store manager dashboard shows proper overdue counts
4. Monitor for any edge cases or additional data inconsistencies
