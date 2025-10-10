# 🔧 **Escalation System Environment Setup**

## 📝 **Add These Lines to Your `.env` File**

Add the following configuration to your existing `.env` file in the `backend` directory:

```bash
# ========================================
# Escalation System Configuration
# ========================================

# Test Mode - Set to 'true' for testing, 'false' for production
ESCALATION_TEST_MODE=true

# Test Phone Number - Your phone number for testing (all messages will be sent here in test mode)
TEST_PHONE_NUMBER=918590292642

# Cron Schedule - How often to run the escalation system
# Format: minute hour day month weekday
# Examples:
#   */2 * * * *   = Every 2 minutes (for testing)
#   */5 * * * *   = Every 5 minutes
#   0 * * * *     = Every hour
#   0 */4 * * *   = Every 4 hours
#   0 9 * * *     = Every day at 9 AM
ESCALATION_CRON_SCHEDULE=*/2 * * * *
```

## 🚀 **Quick Setup Steps**

1. **Open your `.env` file** in the `backend` directory

2. **Add the three lines** above to the end of your `.env` file:
   ```bash
   ESCALATION_TEST_MODE=true
   TEST_PHONE_NUMBER=918590292642
   ESCALATION_CRON_SCHEDULE=*/2 * * * *
   ```

3. **Restart your server** for changes to take effect

4. **The escalation system will now automatically run every 2 minutes!**

## ✅ **What Happens When the Server Starts**

When you start the server with `npm start`, you will see:

```
✅ Server running on port 7000
🚀 Starting Escalation System...
🚀 Starting escalation cron job with schedule: */2 * * * *
✅ Escalation cron job started successfully
📅 Schedule: */2 * * * *
⏰ Next run: [timestamp]
✅ Escalation cron job started - running every 2 minutes
```

## 📊 **What the System Will Do**

Every 2 minutes, the system will:

1. ✅ Find all users with overdue trainings
2. ✅ Group them by escalation level:
   - **Level 1**: 1-2 days overdue → Store Managers
   - **Level 2**: 3-4 days overdue → Cluster Managers
   - **Level 3**: 5+ days overdue → HR Managers
3. ✅ Send WhatsApp messages to the appropriate managers
4. ✅ Log all escalations to the database
5. ✅ Display detailed logs in the console

## 🧪 **Testing Mode**

When `ESCALATION_TEST_MODE=true`:
- ✅ All messages are sent to `TEST_PHONE_NUMBER` (your phone: 918590292642)
- ✅ You can safely test without bothering real managers
- ✅ Full logging is enabled for debugging

## 🏭 **Production Mode**

When ready for production, change:
```bash
ESCALATION_TEST_MODE=false
ESCALATION_CRON_SCHEDULE=0 */4 * * *  # Every 4 hours
```

Then restart the server. Messages will now go to real managers!

## 📱 **Check System Status**

You can monitor the escalation system using these APIs:

```bash
# Get current status
Invoke-RestMethod -Uri "http://localhost:7000/api/escalation/status" -Method GET

# Get overdue users
Invoke-RestMethod -Uri "http://localhost:7000/api/escalation/overdue-users" -Method GET

# Get statistics
Invoke-RestMethod -Uri "http://localhost:7000/api/escalation/stats" -Method GET

# Run manual escalation (don't wait for cron)
Invoke-RestMethod -Uri "http://localhost:7000/api/escalation/run-manual" -Method POST

# Stop the cron job
Invoke-RestMethod -Uri "http://localhost:7000/api/escalation/stop" -Method POST

# Start the cron job again
Invoke-RestMethod -Uri "http://localhost:7000/api/escalation/start" -Method POST
```

## 🎯 **Expected Console Output Every 2 Minutes**

```
🕐 [2025-10-10T12:00:00.000Z] Starting escalation task...
🚀 Starting escalation process...
📊 Found 105 users with overdue trainings
📱 Processing Level 1 escalations (Store Managers)...
📊 Found 45 users for Level 1 escalation
📱 Sending Store Manager alert to John Doe (918590292642) - Attempt 1
✅ Store Manager alert sent successfully to John Doe
📱 Processing Level 2 escalations (Cluster Managers)...
📊 Found 35 users for Level 2 escalation
📱 Sending Cluster Manager alert to Jane Smith (918590292642) - Attempt 1
✅ Cluster Manager alert sent successfully to Jane Smith
📱 Processing Level 3 escalations (HR Managers)...
📊 Found 25 users for Level 3 escalation
📱 Sending HR Manager alert to HR Team (918590292642) - Attempt 1
✅ HR Manager alert sent successfully to HR Team
✅ Escalation process completed successfully
✅ [2025-10-10T12:00:05.234Z] Escalation task completed successfully in 5234ms
📊 Escalation Statistics:
   Total Escalations: 105
   Recent (24h): 105
   By Level: [...]
```

## 🛠️ **Troubleshooting**

### **If the cron job doesn't start:**
1. Check that all three environment variables are set
2. Verify the cron schedule format is correct
3. Check server logs for error messages

### **If messages aren't received:**
1. Verify `WHATSAPP_ACCESS_TOKEN` is valid
2. Check `WHATSAPP_PHONE_NUMBER_ID` is correct
3. Ensure `TEST_PHONE_NUMBER` is registered in Meta Business Suite

### **If you want to change the schedule:**
1. Update `ESCALATION_CRON_SCHEDULE` in `.env`
2. Restart the server
3. Or use the API: `POST /api/escalation/restart`

---

## ✅ **Setup Complete!**

Once you add these three lines to your `.env` file and restart the server, the escalation system will automatically run every 2 minutes and send messages to your phone!

**Your .env file should now include:**
```bash
ESCALATION_TEST_MODE=true
TEST_PHONE_NUMBER=918590292642
ESCALATION_CRON_SCHEDULE=*/2 * * * *
```

**Restart the server and watch the magic happen! 🎉**
