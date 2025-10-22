# 🚀 **Switch to Production Mode - Send to Real Cluster Managers**

## ⚠️ **Current Issue**

You're in **TEST MODE**, so all messages go to the test number (918590292642) instead of the actual cluster manager numbers.

---

## ✅ **Solution: Switch to Production Mode**

### **Step 1: Update Your `.env` File**

Open `backend/.env` and change:

**FROM (Test Mode):**
```bash
ESCALATION_TEST_MODE=true
TEST_PHONE_NUMBER=918590292642
```

**TO (Production Mode):**
```bash
ESCALATION_TEST_MODE=false
TEST_PHONE_NUMBER=918590292642
```

**Just change `true` to `false`!**

---

### **Step 2: Restart Your Server**

```powershell
# Press Ctrl+C to stop the server
# Then start again:
npm start
```

---

### **Step 3: Test Again**

After restarting, run:

```powershell
Invoke-RestMethod -Uri "http://localhost:7000/api/escalation/run-manual" -Method POST
```

---

## 📱 **What Will Happen in Production Mode**

Messages will now go to the **REAL cluster manager numbers**:

### **South Cluster Manager**
- **Phone**: 919496649110
- **Receives**: Overdue data from South stores only
  - Branch 1 (Zorucci Edappally)
  - Branch 10 (GROOMS Perumbavoor)
  - Branch 11 (GROOMS Thrissur)
  - Branch 14 (GROOMS Vatakara)
  - Branch 16 (GROOMS Perinthalmanna)

### **North Cluster Manager**
- **Phone**: 918590292642
- **Receives**: Overdue data from North stores only
  - Branch 3, 5, 9, 10-21 (All North stores)

---

## 🧪 **Test Mode vs Production Mode**

| Feature | Test Mode (`true`) | Production Mode (`false`) |
|---------|-------------------|--------------------------|
| **Messages go to** | TEST_PHONE_NUMBER only | Real cluster manager phones |
| **South Cluster** | 918590292642 | 919496649110 ✅ |
| **North Cluster** | 918590292642 | 918590292642 ✅ |
| **Safe for testing** | ✅ Yes | ⚠️ Real managers get messages |

---

## ⚙️ **Quick Commands**

### **After Switching to Production Mode:**

```powershell
# Run manual escalation
Invoke-RestMethod -Uri "http://localhost:7000/api/escalation/run-manual" -Method POST

# Check status
Invoke-RestMethod -Uri "http://localhost:7000/api/escalation/status" -Method GET

# View overdue users
Invoke-RestMethod -Uri "http://localhost:7000/api/escalation/overdue-users" -Method GET
```

---

## 📋 **Summary**

**Current:** All messages → 918590292642 (test mode)  
**After Change:** 
- South Cluster messages → 919496649110 ✅
- North Cluster messages → 918590292642 ✅

**Just change `ESCALATION_TEST_MODE=true` to `ESCALATION_TEST_MODE=false` in your `.env` file and restart!** 🚀








