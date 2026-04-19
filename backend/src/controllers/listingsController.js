const User= require('../models/User');
const Listing= require('../models/Listing');
const meliService = require('../services/meliService');
const getAuthenticatedUser = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('Usuário não encontrado');
  if (new Date() >= user.tokenExpiresAt) {
    const newTokenData = await meliService.refreshAccessToken(user.refreshToken);
    user.accessToken= newTokenData.access_token;
    user.refreshToken= newTokenData.refresh_token;
    user.tokenExpiresAt= new Date(Date.now() + newTokenData.expires_in * 1000);
    await user.save();
  }

  return user;
};

const getListings = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;

    const filter = { userId: req.userId };
    if (status) filter.status = status;
    if (search) filter.title = { $regex: search, $options: 'i' };

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await Listing.countDocuments(filter);
    const items = await Listing.find(filter)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      items,
      pagination: {
        total,
        page:       Number(page),
        limit:      Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const syncListings = async (req, res) => {
  try {
    const user = await getAuthenticatedUser(req.userId);
    const meliItems = await meliService.getSellerListings(
      user.accessToken,
      user.meliUserId
    );

    let created = 0, updated = 0;

    for (const item of meliItems) {
      const existing = await Listing.findOne({ meliItemId: item.id });

      const listingData = {
        meliItemId:   item.id,
        userId:       user._id,
        title:        item.title,
        price:        item.price,
        quantity:     item.available_quantity,
        status:       item.status,
        thumbnail:    item.thumbnail,
        permalink:    item.permalink,
        categoryId:   item.category_id,
        rawData:      item,
        lastSyncedAt: new Date(),
      };

      if (existing) {
        await Listing.findOneAndUpdate(
          { meliItemId: item.id },
          listingData,
          { new: true }
        );
        updated++;
      } else {
        await Listing.findOneAndUpdate(
          { meliItemId: item.id },
          listingData,
          { upsert: true, new: true }
        );
        created++;
      }
    }

    res.json({ message: 'Sincronização concluída', created, updated });
  } catch (err) {
    console.error('[Sync] Erro ao sincronizar:', err.message);
    res.status(502).json({
      error: 'Falha ao comunicar com o Mercado Livre',
      detail: err.message,
    });
  }
};

const getListingDetail = async (req, res) => {
  try {
    const listing = await Listing.findOne({
      _id:    req.params.id,
      userId: req.userId,
    });
    if (!listing) return res.status(404).json({ error: 'Anúncio não encontrado' });
    res.json(listing);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const createListing = async (req, res) => {
  try {
    const user = await getAuthenticatedUser(req.userId);
    const { title, price, quantity, categoryId, description, condition } = req.body;
    const meliPayload = {
      title,
      price,
      available_quantity: quantity,
      category_id:categoryId,
      condition:condition || 'new',
      currency_id: 'BRL',
      listing_type_id:'gold_special',
      description:{ plain_text: description || '' },
      sale_terms:[],
      pictures:[],
      attributes:[],
    };

    const meliItem = await meliService.createListing(user.accessToken, meliPayload);
    const listing = await Listing.create({
      meliItemId:meliItem.id,
      userId:user._id,
      title:meliItem.title,
      price:meliItem.price,
      quantity:meliItem.available_quantity,
      status:meliItem.status,
      thumbnail:meliItem.thumbnail,
      permalink:meliItem.permalink,
      categoryId:meliItem.category_id,
      rawData:meliItem,
      lastSyncedAt: new Date(),
    });

    res.status(201).json(listing);
  } catch (err) {
    console.error('[Create] Erro:', err.response?.data || err.message);
    res.status(502).json({
      error: 'Falha ao criar anúncio no Mercado Livre',
      detail: err.response?.data || err.message,
    });
  }
};

const updateListing = async (req, res) => {
  try {
    const user = await getAuthenticatedUser(req.userId);

    const listing = await Listing.findOne({
      _id:    req.params.id,
      userId: req.userId,
    });
    if (!listing) return res.status(404).json({ error: 'Anúncio não encontrado' });

    const { price, quantity, status, title } = req.body;

    const meliUpdate = {};
    if (price    !== undefined) meliUpdate.price              = price;
    if (quantity !== undefined) meliUpdate.available_quantity = quantity;
    if (status   !== undefined) meliUpdate.status             = status;
    if (title    !== undefined) meliUpdate.title              = title;

    let rawData = listing.rawData; 

    if (!listing.meliItemId.startsWith('MLB-TEST')) {
      const meliItem = await meliService.updateListing(
        user.accessToken,
        listing.meliItemId,
        meliUpdate
      );
      rawData = meliItem; 
    }

    const updated = await Listing.findByIdAndUpdate(
      req.params.id,
      {
        ...(price    !== undefined && { price }),
        ...(quantity !== undefined && { quantity }),
        ...(status   !== undefined && { status }),
        ...(title    !== undefined && { title }),
        rawData,
        lastSyncedAt: new Date(),
      },
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    console.error('[Update] Erro:', err.response?.data || err.message);
    res.status(502).json({
      error: 'Falha ao atualizar anúncio no Mercado Livre',
      detail: err.response?.data || err.message,
    });
  }
};

const suggestCategories = async (req, res) => {
  try {
    const user = await getAuthenticatedUser(req.userId);
    const { q }  = req.query;
    if (!q) return res.status(400).json({ error: 'Parâmetro q obrigatório' });

    const suggestions = await meliService.suggestCategory(user.accessToken, q);
    res.json(suggestions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getListings,
  syncListings,
  getListingDetail,
  createListing,
  updateListing,
  suggestCategories,
};