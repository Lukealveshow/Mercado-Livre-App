const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
  meliItemId:  { type: String, required: true, unique: true },
  userId:{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title:{ type: String, required: true },
  price:{ type: Number, required: true },
  quantity:{ type: Number, required: true },
  status:{ type: String, enum: ['active', 'paused', 'closed'], default: 'active' },
  thumbnail:{ type: String },
  permalink:{ type: String },
  categoryId:{ type: String },
  rawData:{ type: mongoose.Schema.Types.Mixed }, 
  lastSyncedAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Listing', listingSchema);