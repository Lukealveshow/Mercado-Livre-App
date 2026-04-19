const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  meliUserId:{ type: String, required: true, unique: true },
  nickname:{ type: String },
  email:{ type: String },
  accessToken:{ type: String, required: true },
  refreshToken:{ type: String, required: true },
  tokenExpiresAt: { type: Date, required: true },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);