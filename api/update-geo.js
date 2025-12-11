// api/update-geo.js - САМЫЙ ПРОСТОЙ РАБОЧИЙ КОД
module.exports = async function handler(req, res) {
  console.log('✅ API called:', req.method, req.url);
  
  // Простой JSON ответ
  return res.status(200).json({
    success: true,
    project: 'Unicorns Geo API',
    message: 'API is working! 🦄',
    endpoint: '/api/update-geo',
    method: req.method,
    timestamp: new Date().toISOString(),
    features: [
      'GET - Test endpoint',
      'POST - Update unicorn location'
    ]
  });
};
