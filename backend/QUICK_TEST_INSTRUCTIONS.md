# 🚀 Quick WhatsApp Test - 3 Easy Steps

## Step 1: Start Server ▶️
```bash
cd backend
npm start
```

Wait for: `Server running on port 7000`

---

## Step 2: Open Test Page 🌐

Double-click to open:
```
backend/test-whatsapp.html
```

Or navigate to it in your browser.

---

## Step 3: Send Test Message 📱

1. **Click "Check Config"** button
   - Should show: ✅ Ready to send messages
   - If not, check your `.env` file

2. **Enter Phone Number**
   - Format: `919876543210` (country code + number)
   - No spaces, no + sign

3. **Click "Send Test Message"**
   - Wait 2-3 seconds
   - Should show success message

4. **Check WhatsApp on Your Phone**
   - Open WhatsApp
   - You should see the test message!

---

## ✅ Success Looks Like:

### In Browser:
```
✅ Success!
WhatsApp message sent successfully to 919876543210!
Message: Hello! This is a test message from LMS Training System...
Time: 10/10/2024, 6:00:00 PM
```

### In Server Console:
```
✅ WhatsApp message sent successfully to 919876543210
WhatsApp response: {
  "messaging_product": "whatsapp",
  "contacts": [...],
  "messages": [...]
}
```

### On Your Phone:
```
[WhatsApp Notification]
From: Your Business Name
"Hello! This is a test message from LMS Training System. 
If you received this, WhatsApp integration is working! ✅"
```

---

## ❌ If Something Goes Wrong:

### "Cannot connect to server"
→ Make sure backend is running (`npm start`)

### "Not configured"
→ Check `.env` file has:
```env
WHATSAPP_PHONE_NUMBER_ID=your_id_here
WHATSAPP_ACCESS_TOKEN=your_token_here
```

### "Message not received"
→ Check phone number format (must include country code)
→ Phone must be in test numbers list (if in sandbox mode)

---

## 🎯 Alternative: Test via API

If HTML page doesn't work, try this in terminal:

```bash
# Check config
curl http://localhost:7000/api/test/whatsapp/config

# Send message
curl -X POST http://localhost:7000/api/test/whatsapp \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "919876543210"}'
```

---

## 📞 Need Help?

1. Check server console for error messages
2. Look at `backend/WHATSAPP_TEST_GUIDE.md` for detailed troubleshooting
3. Verify Meta Business Suite settings

---

**That's it! Once this works, you're ready to implement manager notifications! 🎉**

