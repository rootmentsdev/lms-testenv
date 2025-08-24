// Vercel API health check route for /api
export default function handler(req, res) {
  // Set CORS headers for localhost:5173
  const origin = req.headers.origin;
  if (origin === 'http://localhost:5173') {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, Pragma, X-API-Key');
    res.setHeader('Access-Control-Max-Age', '86400');
  }

  // Handle OPTIONS preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Handle GET requests
  if (req.method === 'GET') {
    res.status(200).json({ 
      message: '✅ LMS API is working on Vercel',
      timestamp: new Date().toISOString(),
      cors: 'localhost:5173 allowed'
    });
    return;
  }

  // Method not allowed for other HTTP methods
  res.setHeader('Allow', 'GET, OPTIONS');
  res.status(405).json({ error: 'Method not allowed' });
}
