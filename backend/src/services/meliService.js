const axios = require('axios');

const MELI_API = 'https://api.mercadolibre.com';
const MELI_AUTH = 'https://auth.mercadolivre.com.br';

const getAuthUrl = () => {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id:process.env.MELI_CLIENT_ID,
    redirect_uri:process.env.MELI_REDIRECT_URI,
  });
  return `${MELI_AUTH}/authorization?${params.toString()}`;
};

const exchangeCodeForToken = async (code) => {
  const { data } = await axios.post(`${MELI_API}/oauth/token`, new URLSearchParams({
    grant_type:'authorization_code',
    client_id:process.env.MELI_CLIENT_ID,
    client_secret: process.env.MELI_CLIENT_SECRET,code,
    redirect_uri:process.env.MELI_REDIRECT_URI,
  }), { headers: { 'content-type': 'application/x-www-form-urlencoded' } });
  return data; 
};

const refreshAccessToken = async (refreshToken) => {
  const { data } = await axios.post(`${MELI_API}/oauth/token`, new URLSearchParams({
    grant_type:'refresh_token',
    client_id:process.env.MELI_CLIENT_ID,
    client_secret: process.env.MELI_CLIENT_SECRET,
    refresh_token: refreshToken,
  }), { headers: { 'content-type': 'application/x-www-form-urlencoded' } });
  return data;
};

const getMeliUser = async (accessToken) => {
  const { data } = await axios.get(`${MELI_API}/users/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return data; 
};

const getSellerListings = async (accessToken, meliUserId, offset = 0, limit = 50) => {
  const { data } = await axios.get(
    `${MELI_API}/users/${meliUserId}/items/search`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: { offset, limit },
    }
  );

  if (!data.results?.length) return [];

  const ids = data.results.join(',');
  const { data: details } = await axios.get(`${MELI_API}/items`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    params: { ids },
  });

  return details
    .filter(item => item.code === 200)
    .map(item => item.body);
};

const getListingById = async (accessToken, itemId) => {
  const { data } = await axios.get(`${MELI_API}/items/${itemId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return data;
};

const createListing = async (accessToken, listingData) => {
  const { data } = await axios.post(`${MELI_API}/items`, listingData, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });
  return data;
};

const updateListing = async (accessToken, itemId, updateData) => {
  const { data } = await axios.put(`${MELI_API}/items/${itemId}`, updateData, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });
  return data;
};

const suggestCategory = async (accessToken, title) => {
  const { data } = await axios.get(`${MELI_API}/sites/MLB/domain_discovery/search`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    params: { q: title, limit: 5 },
  });
  return data;
};

module.exports = {
  getAuthUrl,
  exchangeCodeForToken,
  refreshAccessToken,
  getMeliUser,
  getSellerListings,
  getListingById,
  createListing,
  updateListing,
  suggestCategory,
};