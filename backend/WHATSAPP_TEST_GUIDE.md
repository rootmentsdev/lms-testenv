# 📱 WhatsApp API Testing Guide

## Overview
This guide will help you test if your WhatsApp Business API integration is working correctly.

## Prerequisites

Before testing, ensure you have the following environment variables set in your `.env` file:

```env
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_ACCESS_TOKEN=your_access_token
```

### How to Get These Values:

1. **WHATSAPP_PHONE_NUMBER_ID**: 
   - Go to [Meta Business Suite](https://business.facebook.com/)
   - Navigate to WhatsApp > API Setup
   - Copy the "Phone number ID"

2. **WHATSAPP_ACCESS_TOKEN**:
   - In the same WhatsApp API Setup page
   - Generate a permanent access token
   - Copy and save it securely

---

## Testing Methods

### Method 1: Using the HTML Test Page (Easiest) ✅

1. **Start your backend server:**
   ```bash
   cd backend
   npm start
   ```

2. **Open the test page:**
   - Open `backend/test-whatsapp.html` in your browser
   - Or navigate to: `file:///path/to/backend/test-whatsapp.html`

3. **Check Configuration:**
   - Click "Check Config" button
   - Verify that it shows "✅ Ready to send messages"
   - If not, check your environment variables

4. **Send a Test Message:**
   - Enter a phone number (with country code, e.g., `919876543210`)
   - Optionally, enter a custom message
   - Click "Send Test Message"
   - Wait for the response

5. **Check Your Phone:**
   - Open WhatsApp on the phone number you tested
   - You should receive the test message

---

### Method 2: Using Postman or cURL

#### Check Configuration:
```bash
curl http://localhost:7000/api/test/whatsapp/config
```

**Expected Response:**
```json
{
  "configured": true,
  "phoneNumberId": "592456...",
  "hasAccessToken": true,
  "apiUrl": "https://graph.facebook.com/v22.0/592456870611613/messages",
  "status": "✅ Ready to send messages"
}
```

#### Send Test Message:
```bash
curl -X POST http://localhost:7000/api/test/whatsapp \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "919876543210",
    "message": "Hello! This is a test from LMS."
  }'
```

**Expected Response (Success):**
```json
{
  "success": true,
  "message": "WhatsApp message sent successfully! Check the phone for delivery.",
  "phoneNumber": "919876543210",
  "sentMessage": "Hello! This is a test from LMS.",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "note": "Check console logs for detailed response from WhatsApp API"
}
```

---

### Method 3: Using Swagger UI

1. Start your backend server
2. Navigate to: `http://localhost:7000/api-docs`
3. Find the **Testing** section
4. Expand `POST /api/test/whatsapp`
5. Click "Try it out"
6. Enter your phone number and message
7. Click "Execute"
8. Check the response

---

## API Endpoints

### 1. Send Test WhatsApp Message
- **URL**: `POST /api/test/whatsapp`
- **Body**:
  ```json
  {
    "phoneNumber": "919876543210",
    "message": "Your test message (optional)"
  }
  ```

### 2. Check WhatsApp Configuration
- **URL**: `GET /api/test/whatsapp/config`
- **No body required**

---

## Troubleshooting

### Issue: "WHATSAPP_PHONE_NUMBER_ID not set"
**Solution**: 
- Create or edit your `.env` file in the backend directory
- Add: `WHATSAPP_PHONE_NUMBER_ID=your_actual_phone_number_id`
- Restart your server

### Issue: "WHATSAPP_ACCESS_TOKEN not set"
**Solution**:
- Add to your `.env` file: `WHATSAPP_ACCESS_TOKEN=your_actual_token`
- Make sure the token is valid and not expired
- Restart your server

### Issue: "Cannot connect to server"
**Solution**:
- Make sure your backend is running: `npm start` in backend directory
- Check if server is running on port 7000
- Try accessing: `http://localhost:7000/api/test/whatsapp/config`

### Issue: Message not received on phone
**Possible Causes**:
1. **Phone number not registered**: The recipient must have opted in to receive messages from your WhatsApp Business account
2. **Invalid phone number format**: Use international format without spaces (e.g., 919876543210)
3. **24-hour window expired**: WhatsApp has restrictions on when you can send messages
4. **Access token expired**: Generate a new permanent access token
5. **API rate limits**: You may have exceeded the rate limit

### Issue: Error 131051 - Message Undeliverable
**Solution**:
- The recipient number must first send a message to your WhatsApp Business number
- Or use a pre-approved message template
- Or the recipient must be in your test numbers list during development

---

## Phone Number Format

✅ **Correct formats:**
- `919876543210` (India)
- `14155238886` (USA)
- `447911123456` (UK)

❌ **Incorrect formats:**
- `+919876543210` (remove the +)
- `91 9876543210` (no spaces)
- `9876543210` (missing country code)

---

## Important Notes

1. **Sandbox Mode**: If you're in sandbox/test mode, only verified numbers can receive messages
2. **Production Mode**: All numbers can receive messages, but they must opt-in first
3. **Rate Limits**: Check your Meta Business account for rate limits
4. **Message Templates**: For production, consider using approved message templates
5. **Costs**: Check Meta's pricing for WhatsApp Business API messages

---

## Next Steps

Once WhatsApp is working:

1. ✅ **Implement Manager Notifications**: Modify `backend/lib/CornJob.js` to send alerts to managers
2. ✅ **Create Message Templates**: Design proper message templates for different escalation levels
3. ✅ **Add Logging**: Track all sent messages in the database
4. ✅ **Build Dashboard**: Create an admin dashboard to view message history
5. ✅ **Handle Failures**: Add retry logic for failed messages

---

## Support

If you need help:
1. Check server console logs for detailed error messages
2. Check Meta Business Suite > WhatsApp > API Setup for account status
3. Review Meta's WhatsApp Business API documentation
4. Verify your webhook is configured correctly (if using webhooks)

---

## Test Checklist

- [ ] Environment variables set correctly
- [ ] Backend server running
- [ ] Configuration check returns "Ready to send messages"
- [ ] Test message sent successfully via HTML page
- [ ] Test message sent successfully via API (Postman/cURL)
- [ ] Message received on WhatsApp
- [ ] Console shows success logs
- [ ] No errors in server console

---

**Created by**: LMS Development Team  
**Last Updated**: October 2025

