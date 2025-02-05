import express from 'express';
import { WhatsAppZoho } from '../controllers/WhatsAppZoho';

const router = express.Router();
router.post('/invoice-webhook',WhatsAppZoho );

export default router;
