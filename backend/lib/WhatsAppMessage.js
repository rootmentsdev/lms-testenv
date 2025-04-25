import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();
// https://graph.facebook.com/v22.0/592456870611613/messages

const WHATSAPP_API_URL = 'https://graph.facebook.com/v22.0/' + process.env.WHATSAPP_PHONE_NUMBER_ID + '/messages';

export const sendWhatsAppMessage = async (phone, message) => {
    try {
        const payload = {
            messaging_product: 'whatsapp',
            to: phone,
            type: 'text',
            text: { body: message }
        };

        const response = await axios.post(WHATSAPP_API_URL, payload, {
            headers: {
                'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });

        console.log(`WhatsApp response:`, JSON.stringify(response.data, null, 2));
        console.log(`WhatsApp message sent to ${phone}:`, response.data);


    } catch (error) {
        console.error('Error sending WhatsApp message:', JSON.stringify(error.response?.data || error.message, null, 2));
    }
};




