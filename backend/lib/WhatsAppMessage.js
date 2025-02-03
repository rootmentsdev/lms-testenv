import twilio from 'twilio';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);



// Send WhatsApp Notifications
//         for (const user of usersToNotify) {
//             const message = `Hello ${user.name}, 

// You have pending training modules (${user.pendingTraining}) and assessments (${user.pendingAssessments}). 
// Please complete them as soon as possible. ✅`;

//             await sendWhatsAppMessage(user.phone, message);
//         }

// Return results
;


// Function to Send WhatsApp Message
export const sendWhatsAppMessage = async (phone, message) => {
    try {
        const formattedPhone = `whatsapp:+${phone}`;
        await client.messages.create({
            from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
            to: formattedPhone,
            body: message,
        });
        console.log(`WhatsApp message sent to ${phone}`);
    } catch (error) {
        console.error('Error sending WhatsApp message:', error);
    }
};
