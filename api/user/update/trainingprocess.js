// Vercel API route for /api/user/update/trainingprocess
import { UpdateuserTrainingprocess } from '../../../backend/controllers/CreateUser.js';

export default async function handler(req, res) {
  // Set CORS headers for localhost:5173
  const origin = req.headers.origin;
  if (origin === 'http://localhost:5173') {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, Pragma, X-API-Key');
    res.setHeader('Access-Control-Max-Age', '86400');
  }

  // Handle OPTIONS preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Handle PATCH requests
  if (req.method === 'PATCH') {
    try {
      await UpdateuserTrainingprocess(req, res);
    } catch (error) {
      console.error('Error in training process update:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
    return;
  }

  // Method not allowed for other HTTP methods
  res.setHeader('Allow', 'PATCH, OPTIONS');
  res.status(405).json({ error: 'Method not allowed' });
}
