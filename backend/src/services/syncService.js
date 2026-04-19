const cron= require('node-cron');
const User= require('../models/User');
const meliService = require('./meliService');
const startSyncJob = () => {
  cron.schedule('50 */5 * * *', async () => {
    console.log('[Sync] Iniciando refresh de tokens...');
    const threshold = new Date(Date.now() + 2 * 60 * 60 * 1000);
    const users = await User.find({ tokenExpiresAt: { $lte: threshold } });

    for (const user of users) {
      try {
        const newTokenData = await meliService.refreshAccessToken(user.refreshToken);
        user.accessToken= newTokenData.access_token;
        user.refreshToken= newTokenData.refresh_token;
        user.tokenExpiresAt = new Date(Date.now() + newTokenData.expires_in * 1000);
        await user.save();
        console.log(`[Sync] Token renovado para: ${user.nickname}`);
      } catch (err) {
        console.error(`[Sync] Falha ao renovar token de ${user.nickname}:`, err.message);
      }
    }
  });

  console.log('[Sync] Job de refresh de token iniciado');
};

module.exports = { startSyncJob };