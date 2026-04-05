/* ============================================================
   BODEGAVAULT — Cliente API
   ============================================================ */

// En producción usa la misma URL del sitio; en local apunta al backend local
const API_BASE = (location.hostname === 'localhost' || location.hostname === '127.0.0.1')
  ? 'http://localhost:4000/api'
  : '/api';

// ── Token ─────────────────────────────────────────────────
function getToken()      { return localStorage.getItem('bv_token'); }
function setToken(t)     { localStorage.setItem('bv_token', t); }
function clearToken()    { localStorage.removeItem('bv_token'); }
function isLoggedIn()    { return !!getToken(); }

// ── Fetch base ────────────────────────────────────────────
async function apiFetch(path, options = {}) {
  const token = getToken();
  const res = await fetch(API_BASE + path, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: 'Bearer ' + token } : {}),
    },
    ...options,
  });

  let data;
  try { data = await res.json(); } catch { data = {}; }

  if (!res.ok) {
    const err = new Error(data.error || `Error ${res.status}`);
    err.status = res.status;
    err.data   = data;
    throw err;
  }
  return data;
}

// ── Normalización: API (snake_case) → Frontend (camelCase) ─
function normalizeItem(item) {
  return {
    uid:        item.id,
    catalogId:  item.catalog_id,
    rarity:     item.rarity,
    condition:  item.condition,
    grade:      item.grade,
    identified: item.identified,
    forSale:    item.for_sale,
    value:      item.value,
  };
}

function normalizeOffer(offer) {
  return {
    id:      offer.id,
    npcId:   offer.npc_id,
    itemUid: offer.item_id,
    price:   offer.price,
    phrase:  offer.phrase,
    status:  offer.status,
    // datos del item adjuntos
    catalogId:  offer.catalog_id,
    rarity:     offer.rarity,
    condition:  offer.condition,
    grade:      offer.grade,
    value:      offer.value,
  };
}


function normalizeStats(user) {
  return {
    bodegas:         user.bodegas_opened  || 0,
    sold:            user.items_sold      || 0,
    repaired:        user.items_repaired  || 0,
    trades:          user.trades_done     || 0,
    bj_wins:         user.bj_wins         || 0,
    bj_losses:       user.bj_losses       || 0,
    bj_best_streak:  user.bj_best_streak  || 0,
    total_earned:    parseInt(user.total_earned || 0),
    total_spent:     parseInt(user.total_spent  || 0),
    found_rare:      0, found_epic: 0, found_legendary: 0, found_unique: 0,
    bj_streak: 0,
  };
}

// ── API pública ───────────────────────────────────────────
const API = {

  // Auth
  register: (username, email, password) =>
    apiFetch('/auth/register', { method:'POST', body: JSON.stringify({ username, email, password }) }),

  login: (login, password) =>
    apiFetch('/auth/login', { method:'POST', body: JSON.stringify({ login, password }) }),

  logout: () => apiFetch('/auth/logout', { method:'POST' }),

  me: () => apiFetch('/auth/me'),

  // Bodegas
  openBodega: (bodega_id) =>
    apiFetch('/bodegas/open', { method:'POST', body: JSON.stringify({ bodega_id }) }),

  // Items
  getItems: (params = {}) =>
    apiFetch('/items?' + new URLSearchParams(params))
      .then(items => items.map(normalizeItem)),

  evaluateItem: (id, type) =>
    apiFetch(`/items/${id}/evaluate`, { method:'POST', body: JSON.stringify({ type }) }),

  evaluateAll: () =>
    apiFetch('/items/evaluate-all', { method:'POST' }),

  repairItem: (id) =>
    apiFetch(`/items/${id}/repair`, { method:'POST' }),

  setSaleStatus: (id, for_sale) =>
    apiFetch(`/items/${id}/sale`, { method:'PATCH', body: JSON.stringify({ for_sale }) }),

  // Market
  getOffers: () =>
    apiFetch('/market/offers').then(offers => offers.map(normalizeOffer)),

  acceptOffer: (offerId) =>
    apiFetch(`/market/offers/${offerId}/accept`, { method:'POST' }),

  rejectOffer: (offerId) =>
    apiFetch(`/market/offers/${offerId}/reject`, { method:'POST' }),

  // Trades
  getTrades:         ()           => apiFetch('/trades'),
  getMyTrades:       ()           => apiFetch('/trades/mine'),
  getProposals:      ()           => apiFetch('/trades/proposals'),
  createTrade:       (data)       => apiFetch('/trades', { method:'POST', body: JSON.stringify(data) }),
  proposeTrade:      (id, items)  => apiFetch(`/trades/${id}/propose`, { method:'POST', body: JSON.stringify({ respond_items: items }) }),
  acceptTrade:       (id)         => apiFetch(`/trades/${id}/accept`, { method:'POST' }),
  rejectTrade:       (id)         => apiFetch(`/trades/${id}/reject`, { method:'POST' }),
  cancelTrade:       (id)         => apiFetch(`/trades/${id}/cancel`, { method:'POST' }),

  // Player
  claimDaily: () => apiFetch('/player/daily', { method:'POST' }),
  getCollection: () => apiFetch('/player/collection'),
  getAchievements: () => apiFetch('/player/achievements'),
  getNotifications: () => apiFetch('/player/notifications'),
  getLeaderboard: () => apiFetch('/player/leaderboard'),

  saveBlackjack: (outcome, bet, streak) =>
    apiFetch('/player/blackjack', { method:'POST', body: JSON.stringify({ outcome, bet, streak }) }),

  savePoker: (outcome, bet, blindsWon) =>
    apiFetch('/player/poker', { method:'POST', body: JSON.stringify({ outcome, bet, blindsWon }) }),

  // Roulette
  spinRoulette: () =>
    apiFetch('/player/roulette', { method:'POST' }),
  rouletteStatus: () =>
    apiFetch('/player/roulette-status'),
  useVoucher: (bodegaId) =>
    apiFetch('/player/use-voucher', { method:'POST', body: JSON.stringify({ bodegaId }) }),

  // Profile
  getProfile: (userId) =>
    apiFetch(`/profile/${userId}`),
  updateAvatar: (avatar) =>
    apiFetch('/profile/me/avatar', { method:'PATCH', body: JSON.stringify({ avatar }) }),
  getShowcase: () =>
    apiFetch('/profile/me/showcase'),
  updateShowcase: (slots) =>
    apiFetch('/profile/me/showcase', { method:'PUT', body: JSON.stringify({ slots }) }),
  getUserInventory: (userId) =>
    apiFetch(`/profile/${userId}/inventory`).then(items => items.map(normalizeItem)),

  // Friends
  getFriends: () =>
    apiFetch('/friends'),
  getFriendRequests: () =>
    apiFetch('/friends/requests'),
  sendFriendRequest: (userId) =>
    apiFetch(`/friends/request/${userId}`, { method:'POST' }),
  acceptFriendRequest: (friendshipId) =>
    apiFetch(`/friends/accept/${friendshipId}`, { method:'POST' }),
  removeFriend: (userId) =>
    apiFetch(`/friends/${userId}`, { method:'DELETE' }),
  searchUsers: (q) =>
    apiFetch(`/friends/search/users?q=${encodeURIComponent(q)}`),

  // Auctions
  getAuctions: () =>
    apiFetch('/auctions'),
  getMyAuctions: () =>
    apiFetch('/auctions/mine'),
  createAuction: (itemId, minBid, durationHours) =>
    apiFetch('/auctions', { method:'POST', body: JSON.stringify({ itemId, minBid, durationHours }) }),
  placeBid: (auctionId, amount) =>
    apiFetch(`/auctions/${auctionId}/bid`, { method:'POST', body: JSON.stringify({ amount }) }),

  // ── Revestimientos ───────────────────────────────────────
  getRevestimientos: () =>
    apiFetch('/revestimientos'),
  openDesignerBox: () =>
    apiFetch('/revestimientos/open-box', { method:'POST' }),
  equipRevestimiento: (id) =>
    apiFetch(`/revestimientos/${id}/equip`, { method:'POST' }),
  unequipRevestimiento: () =>
    apiFetch('/revestimientos/active', { method:'DELETE' }),

  // ── Regalos ──────────────────────────────────────────────
  getPendingGifts: () =>
    apiFetch('/gifts/pending'),
  sendGift: (friendId, bodegaId) =>
    apiFetch('/gifts/send', { method:'POST', body: JSON.stringify({ friend_id: friendId, bodega_id: bodegaId }) }),
  openGift: (giftId) =>
    apiFetch(`/gifts/${giftId}/open`, { method:'POST' }),
};
