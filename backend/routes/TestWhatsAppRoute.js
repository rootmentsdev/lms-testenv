import express from 'express';
import { sendWhatsAppMessage } from '../lib/WhatsAppMessage.js';

const router = express.Router();

/**
 * @swagger
 * /api/test/whatsapp:
 *   post:
 *     tags: [Testing]
 *     summary: Test WhatsApp message sending
 *     description: Send a test WhatsApp message to verify the integration is working
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phoneNumber:
 *                 type: string
 *                 description: Phone number with country code (e.g., 919876543210)
 *                 example: "919876543210"
 *               message:
 *                 type: string
 *                 description: Test message to send
 *                 example: "Hello! This is a test message from LMS Training System."
 *             required:
 *               - phoneNumber
 *     responses:
 *       200:
 *         description: Message sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: WhatsApp message sent successfully
 *                 phoneNumber:
 *                   type: string
 *                 sentMessage:
 *                   type: string
 *       400:
 *         description: Bad request - Phone number is required
 *       500:
 *         description: Failed to send WhatsApp message
 */
router.post('/whatsapp', async (req, res) => {
    try {
        const { phoneNumber, message } = req.body;

        // Validate phone number
        if (!phoneNumber) {
            return res.status(400).json({
                success: false,
                message: 'Phone number is required',
                example: 'Use format: 919876543210 (with country code)'
            });
        }

        // Default test message if none provided
        const testMessage = message || 'Hello! This is a test message from LMS Training System. If you received this, WhatsApp integration is working! ✅';

        console.log(`📱 Testing WhatsApp send to: ${phoneNumber}`);
        console.log(`📝 Message: ${testMessage}`);

        // Check if environment variables are set
        if (!process.env.WHATSAPP_PHONE_NUMBER_ID) {
            return res.status(500).json({
                success: false,
                message: 'WhatsApp configuration error: WHATSAPP_PHONE_NUMBER_ID not set in environment variables',
                hint: 'Please add WHATSAPP_PHONE_NUMBER_ID to your .env file'
            });
        }

        if (!process.env.WHATSAPP_ACCESS_TOKEN) {
            return res.status(500).json({
                success: false,
                message: 'WhatsApp configuration error: WHATSAPP_ACCESS_TOKEN not set in environment variables',
                hint: 'Please add WHATSAPP_ACCESS_TOKEN to your .env file'
            });
        }

        // Send the message
        await sendWhatsAppMessage(phoneNumber, testMessage);

        // Return success response
        res.status(200).json({
            success: true,
            message: 'WhatsApp message sent successfully! Check the phone for delivery.',
            phoneNumber: phoneNumber,
            sentMessage: testMessage,
            timestamp: new Date().toISOString(),
            note: 'Check console logs for detailed response from WhatsApp API'
        });

    } catch (error) {
        console.error('❌ Error in test WhatsApp endpoint:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send WhatsApp message',
            error: error.message,
            details: error.response?.data || 'No additional details available'
        });
    }
});

/**
 * @swagger
 * /api/test/whatsapp/config:
 *   get:
 *     tags: [Testing]
 *     summary: Check WhatsApp configuration
 *     description: Verify if WhatsApp environment variables are properly configured
 *     responses:
 *       200:
 *         description: Configuration status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 configured:
 *                   type: boolean
 *                 phoneNumberId:
 *                   type: string
 *                 hasAccessToken:
 *                   type: boolean
 *                 apiUrl:
 *                   type: string
 */
router.get('/whatsapp/config', (req, res) => {
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const hasAccessToken = !!process.env.WHATSAPP_ACCESS_TOKEN;
    
    const configured = phoneNumberId && hasAccessToken;

    res.status(200).json({
        configured: configured,
        phoneNumberId: phoneNumberId ? `${phoneNumberId.substring(0, 6)}...` : 'NOT SET',
        hasAccessToken: hasAccessToken,
        accessTokenLength: hasAccessToken ? process.env.WHATSAPP_ACCESS_TOKEN.length : 0,
        apiUrl: phoneNumberId ? `https://graph.facebook.com/v22.0/${phoneNumberId}/messages` : 'NOT CONFIGURED',
        status: configured ? '✅ Ready to send messages' : '❌ Missing configuration',
        instructions: configured ? null : 'Please set WHATSAPP_PHONE_NUMBER_ID and WHATSAPP_ACCESS_TOKEN in your .env file'
    });
});

export default router;

