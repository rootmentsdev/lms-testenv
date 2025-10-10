# 🕐 **Set Escalation Cron Job to Run Every 10 Minutes**

## 📝 **Quick Instructions**

### **Step 1: Update Your `.env` File**

Open `backend/.env` and find this line:
```bash
ESCALATION_CRON_SCHEDULE=*/2 * * * *
```

Change it to:
```bash
ESCALATION_CRON_SCHEDULE=*/10 * * * *
```

### **Step 2: Restart Your Server**

```powershell
# Press Ctrl+C to stop the server
# Then start again:
npm start
```

### **Step 3: Verify**

You should see in the console:
```
🚀 Starting escalation cron job with schedule: */10 * * * *
✅ Escalation cron job started successfully
📅 Schedule: */10 * * * *
⏰ Next run: [timestamp in 10 minutes]
```

---

## ✅ **What This Means**

- The escalation system will now run **every 10 minutes**
- It will check for overdue trainings every 10 minutes
- Send WhatsApp messages to managers every 10 minutes
- Log all escalations to the database

---

## 🎯 **Other Common Schedules**

```bash
# Every 5 minutes
ESCALATION_CRON_SCHEDULE=*/5 * * * *

# Every 10 minutes (recommended for testing)
ESCALATION_CRON_SCHEDULE=*/10 * * * *

# Every 15 minutes
ESCALATION_CRON_SCHEDULE=*/15 * * * *

# Every 30 minutes
ESCALATION_CRON_SCHEDULE=*/30 * * * *

# Every hour
ESCALATION_CRON_SCHEDULE=0 * * * *

# Every 2 hours
ESCALATION_CRON_SCHEDULE=0 */2 * * *

# Every 4 hours (recommended for production)
ESCALATION_CRON_SCHEDULE=0 */4 * * *

# Daily at 9 AM
ESCALATION_CRON_SCHEDULE=0 9 * * *

# Daily at 12:40 PM
ESCALATION_CRON_SCHEDULE=40 12 * * *
```

---

## 🚀 **Alternative: Update Without Restarting Server**

If you don't want to restart the entire server:

```powershell
# 1. Update the .env file as shown above

# 2. Restart just the cron job via API:
Invoke-RestMethod -Uri "http://localhost:7000/api/escalation/restart" -Method POST

# 3. Verify the new schedule:
Invoke-RestMethod -Uri "http://localhost:7000/api/escalation/status" -Method GET
```

---

## ✅ **Done!**

Your escalation system will now run automatically every 10 minutes! 🎉

**Remember to also update your WhatsApp Access Token as mentioned in the previous message to fix the message sending issue.**
