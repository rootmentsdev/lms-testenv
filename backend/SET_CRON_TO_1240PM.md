# 🕐 **Set Escalation Cron Job to Run at 12:40 PM**

## 📝 **Quick Instructions**

### **Option 1: Update .env File (Recommended)**

1. **Open your `.env` file** in the `backend` directory

2. **Find this line:**
   ```bash
   ESCALATION_CRON_SCHEDULE=*/2 * * * *
   ```

3. **Change it to:**
   ```bash
   ESCALATION_CRON_SCHEDULE=40 12 * * *
   ```

4. **Save the file**

5. **Restart your server:**
   ```powershell
   # Stop the server (Ctrl+C)
   # Then start again:
   npm start
   ```

6. **Verify the new schedule:**
   ```powershell
   Invoke-RestMethod -Uri "http://localhost:7000/api/escalation/status" -Method GET
   ```

---

## 📅 **Cron Schedule Examples**

### **Daily at Specific Times:**
```bash
# Daily at 12:40 PM
ESCALATION_CRON_SCHEDULE=40 12 * * *

# Daily at 9:00 AM
ESCALATION_CRON_SCHEDULE=0 9 * * *

# Daily at 6:30 PM
ESCALATION_CRON_SCHEDULE=30 18 * * *
```

### **Multiple Times Per Day:**
```bash
# Daily at 12:40 PM and 6:40 PM
ESCALATION_CRON_SCHEDULE=40 12,18 * * *

# Every 4 hours at 40 minutes past (12:40, 4:40, 8:40, etc.)
ESCALATION_CRON_SCHEDULE=40 */4 * * *

# At 9 AM, 12 PM, 3 PM, and 6 PM
ESCALATION_CRON_SCHEDULE=0 9,12,15,18 * * *
```

### **Testing Schedules:**
```bash
# Every 2 minutes (for testing)
ESCALATION_CRON_SCHEDULE=*/2 * * * *

# Every 5 minutes (for testing)
ESCALATION_CRON_SCHEDULE=*/5 * * * *

# Every hour
ESCALATION_CRON_SCHEDULE=0 * * * *
```

---

## 🎯 **What Happens at 12:40 PM**

When the cron job runs at 12:40 PM, it will:

1. ✅ Find all users with overdue trainings
2. ✅ Categorize by escalation level:
   - **Level 1** (1-2 days overdue) → Store Managers
   - **Level 2** (3-4 days overdue) → Cluster Managers
   - **Level 3** (5+ days overdue) → HR Managers
3. ✅ Send WhatsApp messages to appropriate managers
4. ✅ Log all escalations to database
5. ✅ Display detailed logs in console

---

## 🔄 **Option 2: Restart Cron Job via API (Without Server Restart)**

If you don't want to restart the entire server, you can restart just the cron job:

```powershell
# 1. First, update the .env file as shown above

# 2. Then restart the cron job via API:
Invoke-RestMethod -Uri "http://localhost:7000/api/escalation/restart" -Method POST

# 3. Verify the new schedule:
Invoke-RestMethod -Uri "http://localhost:7000/api/escalation/status" -Method GET
```

**Note:** The API restart will pick up the new schedule from the `.env` file.

---

## ✅ **Verification**

After updating, you should see in the console:

```
🚀 Starting escalation cron job with schedule: 40 12 * * *
✅ Escalation cron job started successfully
📅 Schedule: 40 12 * * *
⏰ Next run: 2025-10-10T12:40:00.000Z
```

And when you check the API status:

```powershell
Invoke-RestMethod -Uri "http://localhost:7000/api/escalation/status" -Method GET
```

You'll see:
```
{
  "isRunning": true,
  "schedule": "40 12 * * *",
  "nextRun": "2025-10-10T12:40:00.000Z"
}
```

---

## 🧪 **Testing Without Waiting Until 12:40 PM**

If you want to test the escalation immediately without waiting:

```powershell
# Run the escalation process manually right now:
Invoke-RestMethod -Uri "http://localhost:7000/api/escalation/run-manual" -Method POST
```

This will:
- Run the entire escalation process immediately
- Send WhatsApp messages to your test phone
- Not affect the scheduled 12:40 PM run

---

## 📊 **Your Current Setup**

Based on your logs, I can see:
- ✅ Escalation system is running
- ✅ Finding users with overdue trainings
- ✅ Processing store managers (but none found with matching location codes)
- ✅ System is working correctly

The "No store managers found" messages are expected if:
- You don't have store managers configured in the Admin collection
- Or the location codes don't match between Users and Admin branches

---

## 🎯 **Summary**

**To run escalation at 12:40 PM daily:**

1. Open `backend/.env`
2. Change `ESCALATION_CRON_SCHEDULE=*/2 * * * *` to `ESCALATION_CRON_SCHEDULE=40 12 * * *`
3. Save the file
4. Restart the server with `npm start`
5. Verify with the status API

**The escalation will now run automatically at 12:40 PM every day!** 🎉
