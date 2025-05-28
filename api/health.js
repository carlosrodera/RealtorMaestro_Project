// Este archivo es un endpoint serverless para Vercel

module.exports = (req, res) => {
  // Permitir CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    message: 'API funcionando correctamente'
  });
}; 