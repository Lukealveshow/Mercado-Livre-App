require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/db');
const { startSyncJob } = require('./src/services/syncService');

const PORT = process.env.PORT || 3000;

connectDB().then(() => {
  startSyncJob(); 
  app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
  });
});