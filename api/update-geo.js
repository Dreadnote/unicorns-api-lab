const axios = require('axios');

module.exports = async function handler(req, res) {
  console.log('🦄 Unicorns API called');
  
  if (req.method === 'GET') {
    return res.json({
      project: 'Unicorns Real Location Service',
      status: 'online',
      endpoints: {
        updateGeo: 'POST /api/update-geo - Update unicorn with real country/town',
        test: 'GET /api/update-geo - This info'
      },
      env_check: {
        mongodb_key: process.env.MONGODB_API_KEY ? '✅ Set' : '❌ Missing',
        mongodb_app: process.env.MONGODB_APP_ID ? '✅ Set' : '❌ Missing'
      }
    });
  }
  
  if (req.method === 'POST') {
    try {
      // Проверяем переменные окружения
      if (!process.env.MONGODB_API_KEY || !process.env.MONGODB_APP_ID) {
        return res.status(500).json({
          error: 'Configuration missing',
          message: 'Add MONGODB_API_KEY and MONGODB_APP_ID in Vercel Environment Variables',
          action: 'Go to Vercel Dashboard → Settings → Environment Variables'
        });
      }
      
      return res.json({
        success: true,
        message: 'Ready to update unicorns!',
        next: 'Will connect to MongoDB and OpenStreetMap',
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      return res.status(500).json({
        error: 'Server error',
        message: error.message
      });
    }
  }
  
  res.status(405).json({ error: 'Method not allowed' });
};
