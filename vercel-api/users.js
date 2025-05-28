// Este archivo es un endpoint serverless para Vercel que proporciona datos de usuario

// Mock de usuarios para pruebas
const users = [
  { id: 1, username: "demo", fullName: "María García", company: "InmoTech Realty", role: "Agente Senior" },
  { id: 2, username: "carlos", fullName: "Carlos Rodríguez", company: "PropTech Solutions", role: "Agente Junior" },
  { id: 3, username: "elena", fullName: "Elena López", company: "InmoTech Realty", role: "Administrador" }
];

module.exports = (req, res) => {
  // Permitir CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // En una aplicación real aquí tendríamos autenticación
  // y una conexión a base de datos
  
  res.json({ users });
}; 