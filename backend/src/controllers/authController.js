const jwt= require('jsonwebtoken');
const User= require('../models/User');
const meliService= require('../services/meliService');
const login = (req, res) => {
  const url = meliService.getAuthUrl();
  res.json({ url }); 
};
const callback = async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ error: 'Código de autorização não recebido' });
  }
  try {
    const tokenData = await meliService.exchangeCodeForToken(code);
    const meliUser = await meliService.getMeliUser(tokenData.access_token);
    const tokenExpiresAt = new Date(Date.now() + tokenData.expires_in * 1000);
    const user = await User.findOneAndUpdate(
      { meliUserId: String(meliUser.id) },
      {
        meliUserId:String(meliUser.id),
        nickname:meliUser.nickname,
        email:meliUser.email,
        accessToken:tokenData.access_token,
        refreshToken:tokenData.refresh_token,
        tokenExpiresAt,
      },
      { upsert: true, new: true }
    );

    const jwtToken = jwt.sign(
      { userId: user._id, meliUserId: user.meliUserId },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.redirect(`${process.env.FRONTEND_URL}/auth/success?token=${jwtToken}`);

  } catch (err) {
    console.error('Erro no callback OAuth:', err.message);
    res.redirect(`${process.env.FRONTEND_URL}/auth/error`);
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-accessToken -refreshToken');
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Erro interno' });
  }
};

module.exports = { login, callback, getMe };