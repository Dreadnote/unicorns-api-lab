// api/update-geo.js - ФИНАЛЬНЫЙ КОД БЕЗ APP SERVICES
const { MongoClient } = require('mongodb');
const axios = require('axios');

module.exports = async function handler(req, res) {
  
  // Разрешаем запросы откуда угодно
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  
  // GET запрос - информация
  if (req.method === 'GET') {
    return res.json({
      service: 'Unicorns Location Service',
      status: 'online',
      method: 'MongoDB Connection String',
      endpoint: 'POST /api/update-geo',
      action: 'Adds real_country and real_town fields',
      connection: process.env.MONGODB_URI ? '✅ Configured' : '❌ Add MONGODB_URI to Vercel'
    });
  }
  
  // POST запрос - обновление единорога
  if (req.method === 'POST') {
    console.log('=== UNICORN UPDATE START ===');
    
    let client;
    try {
      // 1. Получаем строку подключения
      const connectionString = process.env.MONGODB_URI;
      
      if (!connectionString) {
        console.log('❌ No connection string');
        return res.status(500).json({
          error: 'No database connection',
          fix: 'Add MONGODB_URI to Vercel Environment Variables'
        });
      }
      
      console.log('🔗 Connecting to MongoDB...');
      client = new MongoClient(connectionString);
      await client.connect();
      console.log('✅ Connected!');
      
      // 2. Работаем с коллекцией unicorns
      const db = client.db('Learn');
      const unicorns = db.collection('unicorns');
      
      // 3. Ищем единорога без real_country
      const unicorn = await unicorns.findOne({
        "location.coordinates": { $exists: true },
        "real_country": { $exists: false }
      });
      
      if (!unicorn) {
        const count = await unicorns.countDocuments({ real_country: { $exists: true } });
        return res.json({
          message: `✅ All done! ${count} unicorns updated.`,
          status: 'complete'
        });
      }
      
      console.log(`🎯 Found: ${unicorn.name || 'Unnamed unicorn'}`);
      const [lon, lat] = unicorn.location.coordinates;
      
      // 4. Получаем адрес из OpenStreetMap
      console.log('🗺️  Getting address...');
      const response = await axios.get('https://nominatim.openstreetmap.org/reverse', {
        params: { lat, lon, format: 'json', zoom: 18, namedetails: 1, 'accept-language': 'en'},
        headers: { 'User-Agent': 'UnicornsApp' }
      });
      
      const address = response.data.address;
      const country = address.country || address.state || 'Unknown';
      const town = address.city || address.town || address.village || 'Unknown';
      const fullAddress = response.data.display_name;
      
      // 5. Сохраняем в MongoDB
      console.log('💾 Saving...');
      const result = await unicorns.updateOne(
        { _id: unicorn._id },
        {
          $set: {
            real_country: country,
            real_town: town,
            real_address: fullAddress,
            updated_at: new Date()
          }
        }
      );
      
      console.log('✅ Saved successfully');
      
      return res.json({
        success: true,
        unicorn: unicorn.name,
        location: { country, town, coordinates: [lon, lat] },
        address: fullAddress,
        updated: result.modifiedCount > 0
      });
      
    } catch (error) {
      console.error('💥 Error:', error.message);
      return res.status(500).json({
        error: 'Something went wrong',
        message: error.message
      });
    } finally {
      if (client) {
        await client.close();
        console.log('🔌 Connection closed');
      }
      console.log('=== UPDATE FINISHED ===');
    }
  }
  
  // Если метод не GET или POST
  res.status(405).json({ error: 'Use GET or POST' });
};
