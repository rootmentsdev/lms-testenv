# Employee to User Migration

This document explains how to migrate employee data from your external API to the users collection in MongoDB.

## Overview

The migration system fetches employee data from the external API (`https://rootments.in/api/employee_range`) and creates corresponding user records in the `users` collection.

## Features

- ✅ Fetches all employee data from external API
- ✅ Transforms employee data to user format
- ✅ Skips existing users (prevents duplicates)
- ✅ Validates required fields
- ✅ Provides detailed migration statistics
- ✅ Handles errors gracefully

## Data Mapping

| Employee Field | User Field | Required |
|---------------|------------|----------|
| `first_name + last_name` | `username` | ✅ |
| `email` | `email` | ✅ |
| `phone_number` | `phoneNumber` | ❌ |
| `loc_code` | `locCode` | ✅ |
| `emp_id` | `empID` | ✅ |
| `role_name` | `designation` | ✅ |
| `branch_name` | `workingBranch` | ✅ |

## Usage

### Method 1: API Endpoint (Recommended)

Make a POST request to `/api/migrate-employees-to-users`:

```bash
curl -X POST http://localhost:7000/api/migrate-employees-to-users \
  -H "Content-Type: application/json" \
  -d '{
    "startEmpId": "EMP1",
    "endEmpId": "EMP9999"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Employee to user migration completed successfully",
  "data": {
    "totalEmployees": 150,
    "created": 120,
    "skipped": 25,
    "errors": 5
  }
}
```

### Method 2: Command Line Script

Run the migration script directly:

```bash
# Navigate to backend directory
cd backend

# Run migration
node scripts/migrateEmployeesToUsers.js

# Check statistics
node scripts/migrateEmployeesToUsers.js stats
```

### Method 3: Test Script

Test the migration with a small range:

```bash
# Navigate to backend directory
cd backend

# Run test
node test-employee-migration.js
```

## Configuration

The migration uses the following configuration:

- **API Token**: `RootX-production-9d17d9485eb772e79df8564004d4a4d4`
- **External API**: `https://rootments.in/api/employee_range`
- **Timeout**: 30 seconds for API calls
- **Database**: Your MongoDB connection

## Error Handling

The migration handles various error scenarios:

1. **Duplicate Users**: Skips users that already exist (by empID or email)
2. **Missing Required Fields**: Skips employees with missing required data
3. **API Errors**: Logs and continues with next employee
4. **Database Errors**: Logs and continues with next employee

## Monitoring

Check migration progress in your server logs:

```
🔄 Starting employee to user migration...
📊 Fetched 150 employees from external API
✅ Created user: EMP001 - John Doe
⏭️ Skipping EMP002 - already exists
⚠️ Skipping employee with missing required fields: EMP003
✅ Migration completed: 120 created, 25 skipped, 5 errors
```

## Verification

After migration, verify the data in MongoDB Compass:

1. Connect to your database
2. Navigate to the `users` collection
3. Check that employee data has been properly migrated
4. Verify required fields are populated

## Troubleshooting

### Common Issues

1. **API Connection Failed**
   - Check your internet connection
   - Verify the API token is valid
   - Check if the external API is accessible

2. **Database Connection Failed**
   - Verify MongoDB is running
   - Check your database connection string
   - Ensure proper permissions

3. **Missing Required Fields**
   - Check the external API response format
   - Verify field mappings in the transformation function
   - Update field mappings if needed

### Debug Mode

Enable detailed logging by checking the server console output during migration.

## Security Notes

- The API token is hardcoded in the script for convenience
- Consider moving it to environment variables for production
- The migration endpoint should be protected in production environments

## Performance

- Migration time depends on the number of employees
- Estimated time: 2-5 minutes for 1000 employees
- The script processes employees sequentially to avoid overwhelming the database

## Support

If you encounter issues:

1. Check the server logs for detailed error messages
2. Verify the external API is responding correctly
3. Test with a small employee range first
4. Ensure all required dependencies are installed
