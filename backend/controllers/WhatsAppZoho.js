import twilio from "twilio";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Twilio Credentials
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

let client = null;

// Initialize Twilio safely
if (accountSid && authToken && accountSid.startsWith("AC")) {
    client = twilio(accountSid, authToken);
    console.log("✅ Twilio initialized successfully");
} else {
    console.warn("⚠️ Twilio disabled - invalid or missing credentials");
}

const TWILIO_WHATSAPP_FROM = "whatsapp:+14155238886";

export const WhatsAppZoho = async (req, res) => {
    try {
        // (A) Parse Zoho invoice data
        const payload = req.body;
        console.log("Zoho Books Invoice Webhook Data:", payload);

        // (B) Extract invoice ID
        const invoiceId = payload.invoice_id || payload.data?.invoice_id;
        const InvoiceUrl = payload.Invoice_Url || payload.data?.Invoice_Url;
        const name = payload.name || payload.data?.name;

        if (!invoiceId) {
            console.error("No invoice ID found in payload");
            return res.status(400).send("No invoice ID found");
        }

        // (C) Retrieve the customer phone number
        let customerPhone = payload.contact_mobile_phone || "1234567890";

        // Add India country code
        customerPhone = "91" + customerPhone;

        // Convert to Twilio WhatsApp format
        customerPhone = `whatsapp:${customerPhone.startsWith("+") ? customerPhone : `+${customerPhone}`}`;

        // (D) Ensure Twilio client exists
        if (!client) {
            console.warn("Twilio client not configured");
            return res.status(500).send("Twilio not configured");
        }

        // (E) Send WhatsApp message
        const textMessage = await client.messages.create({
            body: `hello ${name}\nYour invoice ${invoiceId} has been created in Zoho Books! this is your url ${InvoiceUrl}`,
            from: TWILIO_WHATSAPP_FROM,
            to: customerPhone,
        });

        console.log("Twilio WhatsApp Text SID:", textMessage.sid);

        // (F) Success response
        return res
            .status(200)
            .send("OK: Invoice received, Twilio WhatsApp text message sent");
    } catch (error) {
        console.error("Error handling invoice webhook:", error?.message);
        return res.status(500).send("Error processing invoice webhook");
    }
};