/* ============================================================
   BODEGAVAULT — Lógica Principal (con API)
   ============================================================ */

// ─── ESTADO LOCAL (caché del servidor) ────────────────────
let S = {
  userId: null, username: null, avatar: '🧑',
  money: 0, level: 1, xp: 0, xpNext: 118,
  inventory: [], collection: {}, playerTrades: [], myTrades: [], proposals: [], pendingOffers: [],
  notifications: [], unlockedAch: [], dailyLast: null,
  screen: 'hub',
  // Nuevos campos
  rouletteLast: null, bodegaVouchers: 0, levelRewardsClaimed: 0, dailySales: 0, equippedTitle: null,
  showcase: [],
  friends: [], friendRequests: [],
  auctions: [], myAuctions: [],
  pendingGifts: [],
  revestimientos: [], activeRevestimiento: null,
  stats: { bodegas:0, sold:0, repaired:0, trades:0, bj_wins:0,
           bj_losses:0, bj_best_streak:0, total_earned:0, total_spent:0,
           found_rare:0, found_epic:0, found_legendary:0, found_unique:0 },
  bj: { deck:[], playerHand:[], dealerHand:[], bet:50, state:'idle', streak:0, result:null },
  poker: { state:'idle', bet:100, blind:0, deck:[], hand:[], selected:[], playsLeft:4, discardsLeft:3, score:0, bossEffect:null, result:null },
};

// Intervalo para countdown de subastas
let auctionCountdownInterval = null;

const TITLES_MAP = {
  collector_all: 'Pansita Llena Corazon Contento',
  level_50:      'Niño Rata',
  millionaire:   'Goloso',
  poker_royal:   'La Escalera es la Clave',
  bodega_50:     'Comprador Compulsivo',
};

// ─── CARGA DE ESTADO DESDE API ────────────────────────────
async function loadGameState() {
  showLoading('Cargando tu partida...');
  try {
    const [user, items, collection, offers, notifs, achievements, showcase, friends, friendReqs, pendingGifts, revData] = await Promise.all([
      API.me(),
      API.getItems({ limit: 1000 }),
      API.getCollection(),
      API.getOffers(),
      API.getNotifications(),
      API.getAchievements(),
      API.getShowcase(),
      API.getFriends(),
      API.getFriendRequests(),
      API.getPendingGifts(),
      API.getRevestimientos(),
    ]);

    S.userId              = user.id;
    S.username            = user.username;
    S.avatar              = user.avatar || '🧑';
    S.money               = parseInt(user.money);
    S.level               = user.level;
    S.xp                  = parseInt(user.xp);
    S.xpNext              = parseInt(user.xp_next);
    S.dailyLast           = user.daily_last;
    S.rouletteLast        = user.roulette_last || null;
    S.bodegaVouchers      = parseInt(user.bodega_vouchers || 0);
    S.levelRewardsClaimed = parseInt(user.level_rewards_claimed || 0);
    const today = new Date().toISOString().slice(0, 10);
    const salesDate = user.daily_sales_date ? String(user.daily_sales_date).slice(0, 10) : null;
    S.dailySales = salesDate === today ? parseInt(user.daily_sales || 0) : 0;
    S.stats = { ...S.stats,
      bodegas:        user.bodegas_opened  || 0,
      sold:           user.items_sold      || 0,
      repaired:       user.items_repaired  || 0,
      trades:         user.trades_done     || 0,
      bj_wins:        user.bj_wins         || 0,
      bj_losses:      user.bj_losses       || 0,
      bj_best_streak: user.bj_best_streak  || 0,
      total_earned:   parseInt(user.total_earned || 0),
      total_spent:    parseInt(user.total_spent  || 0),
    };

    S.inventory      = items;
    S.collection     = {};
    collection.forEach(c => { S.collection[c.catalog_id] = true; });
    S.pendingOffers  = offers;
    S.notifications  = notifs;
    S.unlockedAch    = achievements.unlocked || [];
    S.showcase       = showcase || [];
    S.friends        = friends || [];
    S.friendRequests = friendReqs || [];
    S.pendingGifts        = pendingGifts || [];
    S.revestimientos      = revData?.revestimientos || [];
    S.activeRevestimiento = revData?.active || null;

    // Load equipped title
    try {
      const titlesData = await API.getMyTitles();
      S.equippedTitle = titlesData?.equipped || null;
    } catch (_) {
      S.equippedTitle = null;
    }

  } catch (err) {
    console.error('Error cargando partida:', err);
    if (err.status === 401) { doLogout(); return; }
    toast('Error al cargar la partida. Reintentando...', 'error');
  } finally {
    hideLoading();
  }
}

// ─── AUTH ─────────────────────────────────────────────────
function showAuthTab(tab) {
  document.querySelectorAll('.auth-tab').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  document.getElementById('auth-login').classList.toggle('hidden', tab !== 'login');
  document.getElementById('auth-register').classList.toggle('hidden', tab !== 'register');
  document.getElementById('auth-error').classList.add('hidden');
  document.getElementById('auth-error-reg').classList.add('hidden');
}

async function doLogin() {
  const login    = document.getElementById('login-user').value.trim();
  const password = document.getElementById('login-pass').value;
  const errEl    = document.getElementById('auth-error');
  const btn      = document.getElementById('btn-login');
  if (!login || !password) { showAuthError(errEl, 'Completa todos los campos'); return; }

  btn.disabled = true; btn.textContent = 'Entrando...';
  try {
    const res = await API.login(login, password);
    setToken(res.token);
    await startGame();
  } catch (err) {
    showAuthError(errEl, err.message || 'Error al iniciar sesión');
  } finally {
    btn.disabled = false; btn.textContent = 'Entrar al juego →';
  }
}

async function doRegister() {
  const username = document.getElementById('reg-username').value.trim();
  const email    = document.getElementById('reg-email').value.trim();
  const password = document.getElementById('reg-pass').value;
  const errEl    = document.getElementById('auth-error-reg');
  const btn      = document.getElementById('btn-register');
  if (!username || !email || !password) { showAuthError(errEl, 'Completa todos los campos'); return; }

  btn.disabled = true; btn.textContent = 'Creando cuenta...';
  try {
    const res = await API.register(username, email, password);
    setToken(res.token);
    toast(`🎉 ¡Bienvenido, ${res.user.username}!`, 'gold');
    await startGame();
  } catch (err) {
    showAuthError(errEl, err.message || 'Error al registrarse');
  } finally {
    btn.disabled = false; btn.textContent = 'Crear cuenta →';
  }
}

async function doLogout() {
  try { await API.logout(); } catch {}
  clearToken();
  S = { ...S, userId:null, username:null, inventory:[], collection:{} };
  document.getElementById('game-container').classList.add('hidden');
  document.getElementById('auth-screen').classList.remove('hidden');
  showAuthTab('login');
}

function showAuthError(el, msg) {
  el.textContent = msg;
  el.classList.remove('hidden');
}

async function startGame() {
  document.getElementById('auth-screen').classList.add('hidden');
  document.getElementById('game-container').classList.remove('hidden');
  await loadGameState();
  setupNavHandlers();
  renderHUD();
  switchScreen('hub');
}

// ─── LOADING OVERLAY ─────────────────────────────────────
function showLoading(text = 'Cargando...') {
  document.getElementById('loading-text').textContent = text;
  document.getElementById('loading-overlay').classList.remove('hidden');
}
function hideLoading() {
  document.getElementById('loading-overlay').classList.add('hidden');
}

// ─── UTILIDADES ───────────────────────────────────────────
function fmt(n) { return Number(n).toLocaleString('es-ES'); }

function toast(msg, type = 'info') {
  const c = document.getElementById('toast-container');
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.textContent = msg;
  c.appendChild(t);
  setTimeout(() => t.remove(), 3200);
}

function applyLevelUpResult(res) {
  const srvLevel  = res.new_level   ?? res.xpResult?.level        ?? S.level;
  const srvXP     = res.new_xp      ?? res.xpResult?.xp           ?? null;
  const srvXPNext = res.new_xp_next ?? res.xpResult?.xpNext       ?? S.xpNext;
  const levelsUp  = res.levels_up   ?? res.xpResult?.levelsGained ?? [];
  const xpGained  = res.xp_gained   ?? null;
  const rewards   = res.levelRewards ?? [];

  if (levelsUp.length > 0) {
    // Hubo level-up: el servidor manda el XP sobrante tras el rollover — es correcto
    S.level  = srvLevel;
    S.xp     = srvXP ?? 0;
    S.xpNext = srvXPNext;
    showLevelUpModal(levelsUp, rewards);
  } else {
    // Sin level-up: el XP solo puede subir
    // Preferir xp_gained si viene, sino usar el valor del servidor pero nunca bajar
    if (xpGained !== null && xpGained > 0) {
      S.xp = (S.xp ?? 0) + xpGained;
    } else if (srvXP !== null && srvXP > (S.xp ?? 0)) {
      S.xp = srvXP;
    }
    if (srvLevel > S.level) S.level = srvLevel;
    S.xpNext = srvXPNext;
  }

  // Actualizar vouchers si vinieron recompensas
  rewards.forEach(r => {
    if (r.type === 'bodega') S.bodegaVouchers++;
  });
}

function timeAgo(ts) {
  const diff = Date.now() - new Date(ts).getTime();
  if (diff < 60000)    return 'Ahora mismo';
  if (diff < 3600000)  return Math.floor(diff / 60000) + ' min';
  if (diff < 86400000) return Math.floor(diff / 3600000) + ' h';
  return Math.floor(diff / 86400000) + ' d';
}

// ─── SISTEMA GACHA / BODEGAS ──────────────────────────────
async function useVoucher(bodegaId) {
  if (S.bodegaVouchers < 1) { toast('No tienes bodegas gratuitas', 'error'); return; }
  showLoading('Usando voucher...');
  try {
    await API.useVoucher(bodegaId);
    S.bodegaVouchers--;
    hideLoading();
    toast('🎁 Voucher usado. Abriendo bodega gratuita...', 'success');
    openBodegaFree(bodegaId);
  } catch (err) {
    hideLoading();
    toast(err.message || 'Error al usar voucher', 'error');
  }
}

async function openBodegaFree(bodegaId) {
  // Igual que openBodega pero sin cobrar el costo
  const bodega = BODEGAS.find(b => b.id === bodegaId);
  if (!bodega) return;
  showLoading('Abriendo bodega gratuita...');
  try {
    const res = await API.openBodega(bodegaId);
    const items = res.items.map(i => ({
      uid: i.id, catalogId: i.catalog_id, rarity: i.rarity,
      condition: i.condition, grade: i.grade, identified: i.identified,
      forSale: i.for_sale || false, value: i.value,
    }));
    S.inventory.push(...items);
    items.forEach(item => { if (item.identified) S.collection[item.catalogId] = true; });
    S.stats.bodegas++;
    applyLevelUpResult(res);
    renderHUD();
    hideLoading();
    showBodegaAnimation(bodega, items, res.xp_gained ?? 0);
  } catch (err) {
    hideLoading();
    toast(err.message || 'Error', 'error');
  }
}

async function openBodega(bodegaId) {
  const bodega = BODEGAS.find(b => b.id === bodegaId);
  if (!bodega) return;

  showLoading('Abriendo bodega...');
  try {
    const res = await API.openBodega(bodegaId);
    // Normalizar items recibidos
    const items = res.items.map(i => ({
      uid:        i.id,
      catalogId:  i.catalog_id,
      rarity:     i.rarity,
      condition:  i.condition,
      grade:      i.grade,
      identified: i.identified,
      forSale:    i.for_sale || false,
      value:      i.value,
    }));

    // Actualizar estado local
    S.money -= bodega.cost;
    S.inventory.push(...items);
    items.forEach(item => {
      if (item.identified) S.collection[item.catalogId] = true;
    });
    S.stats.bodegas++;
    applyLevelUpResult(res);

    // Procesar recompensas de catálogo completado
    const catRewards = res.categoryRewards || [];
    catRewards.forEach(cr => {
      const rewardItem = {
        uid:        'cat_' + cr.item.id + '_' + Date.now(),
        catalogId:  cr.item.id,
        rarity:     cr.item.rarity,
        condition:  'new',
        grade:      10,
        identified: true,
        forSale:    false,
        value:      cr.item.baseValue,
      };
      S.inventory.push(rewardItem);
      S.collection[cr.item.id] = true;
    });

    renderHUD();

    hideLoading();
    showBodegaAnimation(bodega, items, res.xp_gained ?? 0);

    // Mostrar popup de catálogo completado (con delay para que no se solape)
    if (catRewards.length > 0) {
      setTimeout(() => showCategoryRewardModal(catRewards), items.length * 450 + 1200);
    }
  } catch (err) {
    hideLoading();
    toast(err.message || 'Error al abrir la bodega', 'error');
  }
}

function showBodegaAnimation(bodega, items, xpGained = 0) {
  const anim = document.getElementById('bodega-anim');
  document.getElementById('bodega-anim-icon').textContent     = bodega.icon;
  document.getElementById('bodega-anim-title').textContent    = bodega.name;
  document.getElementById('bodega-anim-subtitle').textContent = 'Abriendo bodega...';
  const container = document.getElementById('bodega-anim-items');
  container.innerHTML = '';
  document.getElementById('bodega-anim-close').classList.add('hidden');
  anim.classList.remove('hidden');

  items.forEach((item, i) => {
    const cat  = CATALOG.find(c => c.id === item.catalogId);
    const r    = RARITIES[item.rarity];
    const cond = CONDITIONS[item.condition];
    setTimeout(() => {
      const card = document.createElement('div');
      card.className = `reveal-card${item.identified ? '' : ' unid'}${item.rarity === 'exotic' ? ' exotic' : ''}`;
      card.style.border     = `2px solid ${r.color}`;
      card.style.background = r.bg;
      card.innerHTML = `
        <span class="rc-emoji">${item.identified ? cat.emoji : '❓'}</span>
        <div class="rc-name">${item.identified ? cat.name : 'No Identificado'}</div>
        <span class="rc-rarity" style="background:${r.bg};color:${r.color}">${r.name}</span>
        <div class="rc-condition" style="color:${cond.color}">${item.identified ? cond.name : '???'}</div>
        <div class="rc-value">${item.identified ? '💰 ' + fmt(item.value) : '💰 ???'}</div>
      `;
      container.appendChild(card);
      if (i === items.length - 1) {
        setTimeout(() => {
          document.getElementById('bodega-anim-subtitle').textContent =
            `¡${items.length} objetos encontrados! · ✨ +${xpGained} XP`;
          document.getElementById('bodega-anim-close').classList.remove('hidden');
        }, 400);
      }
    }, i * 450);
  });
}

function closeBodegaAnim() {
  document.getElementById('bodega-anim').classList.add('hidden');
  renderScreen();
}

function showCategoryRewardModal(catRewards) {
  const CATEGORY_NAMES = {
    videogames:'Videojuegos', electronics:'Electrónica', machines:'Máquinas',
    rarities:'Rarezas', art:'Arte', music:'Música', toys:'Juguetes',
    sports:'Deportes', entertainment:'Entretenimiento', mystery:'Misterio',
    everyday:'Cotidiano', valuables:'Valiosos',
  };
  const rewardCards = catRewards.map(cr => {
    const catEntry = CATALOG.find(c => c.id === cr.item.id);
    const emoji = catEntry ? catEntry.emoji : '🏆';
    return `
      <div style="background:rgba(233,30,99,0.12);border:2px solid #e91e63;border-radius:12px;padding:16px 20px;margin:10px 0;text-align:center">
        <div style="font-size:2.5rem">${emoji}</div>
        <div style="font-size:1.1rem;font-weight:700;color:#e91e63;margin:6px 0">${cr.item.name}</div>
        <div style="font-size:0.8rem;color:#aaa">Catálogo completado: ${CATEGORY_NAMES[cr.category] || cr.category}</div>
        <div style="font-size:0.85rem;color:#e91e63;margin-top:4px">💰 Valor: ${fmt(cr.item.baseValue)}</div>
      </div>`;
  }).join('');

  showModal(`
    <div style="text-align:center;padding:10px 0">
      <div style="font-size:3rem">🏆</div>
      <h2 style="color:#e91e63;margin:8px 0">¡Catálogo Completado!</h2>
      <p style="color:#ccc;margin-bottom:16px">Completaste ${catRewards.length > 1 ? `${catRewards.length} catálogos` : 'un catálogo'} y recibiste un objeto exclusivo único.</p>
      ${rewardCards}
      <button class="btn-primary" style="margin-top:16px" onclick="hideModal()">¡Increíble!</button>
    </div>
  `);
}

// ─── EVALUACIÓN ───────────────────────────────────────────
async function quickEvaluate(itemUid) {
  const item = S.inventory.find(i => i.uid === itemUid);
  if (!item || item.identified) return;
  showLoading('Evaluando...');
  try {
    const res = await API.evaluateItem(itemUid, 'quick');
    item.identified = true;
    item.value      = res.item.value;
    item.grade      = res.item.grade;
    S.collection[item.catalogId] = true;
    applyLevelUpResult(res);
    renderHUD();
    toast('🔍 Evaluación rápida completada', 'info');
    hideModal();
    renderScreen();
  } catch (err) {
    toast(err.message || 'Error al evaluar', 'error');
  } finally {
    hideLoading();
  }
}

async function professionalEvaluate(itemUid) {
  const item = S.inventory.find(i => i.uid === itemUid);
  if (!item || item.identified) return;
  showLoading('Evaluación profesional...');
  try {
    const res = await API.evaluateItem(itemUid, 'professional');
    item.identified = true;
    item.value      = res.item.value;
    item.grade      = res.item.grade;
    S.collection[item.catalogId] = true;
    S.money -= 50;
    applyLevelUpResult(res);
    renderHUD();
    toast('🎓 Evaluación profesional completa — grado mejorado', 'success');
    hideModal();
    renderScreen();
  } catch (err) {
    toast(err.message || 'Error al evaluar', 'error');
  } finally {
    hideLoading();
  }
}

// ─── REPARACIÓN ──────────────────────────────────────────
const REPAIR_SUCCESS  = { new:0, used:0.85, damaged:0.70, very_damaged:0.55 };
const REPAIR_COST_M   = { common:1, rare:2, epic:4, legendary:8, unique:20 };
const REPAIR_BASE_COST = { new:0, used:30, damaged:80, very_damaged:150 };

function calcRepairCost(condition, rarity) {
  return Math.round((REPAIR_BASE_COST[condition] || 80) * (REPAIR_COST_M[rarity] || 1));
}

async function attemptRepair(itemUid) {
  const item = S.inventory.find(i => i.uid === itemUid);
  if (!item) return;
  if (item.condition === 'new') { toast('Ya está en perfecto estado', 'info'); return; }

  showLoading('Reparando...');
  try {
    const res = await API.repairItem(itemUid);
    item.condition = res.newCondition;
    item.value     = res.newValue;
    S.money       -= res.cost;
    S.stats.repaired++;
    renderHUD();

    if (res.repair.success && res.repair.critical) toast('✨ ¡Reparación crítica! Mejoró dos niveles', 'success');
    else if (res.repair.success)                   toast('🔧 Reparación exitosa', 'success');
    else if (res.repair.fail)                      toast('💥 ¡Fallo crítico! El objeto empeoró', 'error');
    else                                           toast('😬 La reparación falló, sin cambios', 'error');

    hideModal();
    renderScreen();
  } catch (err) {
    toast(err.message || 'Error al reparar', 'error');
  } finally {
    hideLoading();
  }
}

// ─── VENTAS ───────────────────────────────────────────────
async function putForSale(itemUid) {
  const item = S.inventory.find(i => i.uid === itemUid);
  if (!item || !item.identified) { toast('Primero debes evaluar el objeto', 'info'); return; }

  showLoading('Publicando en venta...');
  try {
    await API.setSaleStatus(itemUid, true);
    item.forSale = true;
    // Recargar ofertas
    S.pendingOffers = await API.getOffers();
    toast('💼 ¡Objeto en venta! Los compradores han sido notificados', 'success');
    hideModal();
    switchScreen('mercado');
  } catch (err) {
    toast(err.message || 'Error al poner en venta', 'error');
  } finally {
    hideLoading();
  }
}

async function removeFromSale(itemUid) {
  showLoading('Retirando de venta...');
  try {
    await API.setSaleStatus(itemUid, false);
    const item = S.inventory.find(i => i.uid === itemUid);
    if (item) item.forSale = false;
    S.pendingOffers = S.pendingOffers.filter(o => o.itemUid !== itemUid);
    toast('📦 Objeto retirado de la venta', 'info');
    renderScreen();
  } catch (err) {
    toast(err.message || 'Error', 'error');
  } finally {
    hideLoading();
  }
}

async function acceptOffer(offerId) {
  if (_pendingActions.has('offer_' + offerId)) return;
  _pendingActions.add('offer_' + offerId);
  showLoading('Procesando venta...');
  try {
    const res = await API.acceptOffer(offerId);
    const offer = S.pendingOffers.find(o => o.id === offerId);
    if (offer) {
      S.inventory     = S.inventory.filter(i => i.uid !== offer.itemUid);
      S.pendingOffers = S.pendingOffers.filter(o => o.itemUid !== offer.itemUid);
      S.money        += offer.price;
      S.stats.sold++;
    }
    applyLevelUpResult(res);
    S.dailySales = Math.min((S.dailySales || 0) + 1, 12);
    renderHUD();
    const npc = NPCS.find(n => n.id === offer?.npcId);
    toast(`✅ Vendido a ${npc?.name || 'comprador'} por ${fmt(offer?.price || 0)} monedas`, 'success');
    renderScreen();
  } catch (err) {
    toast(err.message || 'Error al aceptar oferta', 'error');
  } finally {
    hideLoading();
    _pendingActions.delete('offer_' + offerId);
  }
}

const _pendingActions = new Set();

async function rejectOffer(offerId) {
  if (_pendingActions.has('offer_' + offerId)) return;
  _pendingActions.add('offer_' + offerId);
  try {
    await API.rejectOffer(offerId);
    S.pendingOffers = S.pendingOffers.filter(o => o.id !== offerId);
    renderScreen();
  } catch (err) {
    toast(err.message || 'Error al rechazar oferta', 'error');
  } finally {
    _pendingActions.delete('offer_' + offerId);
  }
}


// ─── RECOMPENSA DIARIA ────────────────────────────────────
function checkDailyReward() {
  if (!S.dailyLast) return true;
  const last = new Date(S.dailyLast);
  const now  = new Date();
  return last.toDateString() !== now.toDateString();
}

async function claimDaily() {
  if (!checkDailyReward()) { toast('Ya reclamaste tu recompensa hoy', 'info'); return; }
  showLoading('Reclamando recompensa...');
  try {
    const res = await API.claimDaily();
    S.money   += res.amount;
    S.dailyLast = new Date().toISOString();
    applyLevelUpResult(res);
    renderHUD();
    toast(`🎁 ¡Recompensa diaria! +${fmt(res.amount)} monedas`, 'gold');
    renderScreen();
  } catch (err) {
    toast(err.message || 'Error al reclamar recompensa', 'error');
  } finally {
    hideLoading();
  }
}

// ─── BLACKJACK (completamente local, guarda al final) ─────
const SUITS = ['♠', '♥', '♦', '♣'];
const FACES = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];

function buildDeck() {
  const deck = [];
  SUITS.forEach(s => FACES.forEach(f => deck.push({ suit:s, face:f })));
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

function cardValue(card) {
  if (card.face === 'A') return 11;
  if (['J','Q','K'].includes(card.face)) return 10;
  return parseInt(card.face);
}

function handValue(hand) {
  let total = hand.reduce((s, c) => s + cardValue(c), 0);
  let aces  = hand.filter(c => c.face === 'A').length;
  while (total > 21 && aces > 0) { total -= 10; aces--; }
  return total;
}

function isRed(card) { return card.suit === '♥' || card.suit === '♦'; }

function bjStart() {
  const bj = S.bj;
  if (bj.bet > S.money) { toast('💸 No tienes suficiente dinero para esta apuesta', 'error'); return; }
  S.money -= bj.bet;
  bj.deck       = buildDeck();
  bj.playerHand = [bj.deck.pop(), bj.deck.pop()];
  bj.dealerHand = [bj.deck.pop(), bj.deck.pop()];
  bj.state      = 'playing';
  bj.result     = null;
  renderHUD();
  renderBlackjack();
  if (handValue(bj.playerHand) === 21) bjStand();
}

function bjHit() {
  const bj = S.bj;
  if (bj.state !== 'playing') return;
  bj.playerHand.push(bj.deck.pop());
  if (handValue(bj.playerHand) > 21) bjEndGame('lose');
  else renderBlackjack();
}

function bjStand() {
  const bj = S.bj;
  if (bj.state !== 'playing') return;
  bj.state = 'dealer';
  while (handValue(bj.dealerHand) < 17) bj.dealerHand.push(bj.deck.pop());
  const pv = handValue(bj.playerHand);
  const dv = handValue(bj.dealerHand);
  if (dv > 21 || pv > dv)    bjEndGame('win');
  else if (pv === dv)         bjEndGame('push');
  else                        bjEndGame('lose');
}

function bjEndGame(outcome) {
  const bj = S.bj;
  bj.state  = 'ended';

  if (outcome === 'win') {
    bj.streak++;
    if (bj.streak > S.stats.bj_best_streak) S.stats.bj_best_streak = bj.streak;
    const mult  = 1 + Math.min(bj.streak - 1, 4) * 0.25;
    const won   = Math.round(bj.bet * mult);
    S.money    += bj.bet + won;
    S.stats.bj_wins++;
    bj.result   = { outcome:'win', amount: won, mult };
    toast(`🃏 ¡Ganaste! +${fmt(won)} monedas${mult > 1 ? ' (x'+mult.toFixed(2)+')' : ''}`, 'success');
    // Guardar en API (fire & forget)
    API.saveBlackjack('win', bj.bet, bj.streak).catch(() => {});
  } else if (outcome === 'push') {
    S.money    += bj.bet;
    bj.result   = { outcome:'push', amount:0 };
    bj.streak   = 0;
    toast('🤝 Empate — apuesta devuelta', 'info');
    API.saveBlackjack('push', bj.bet, 0).catch(() => {});
  } else {
    S.stats.bj_losses++;
    bj.result   = { outcome:'lose', amount: bj.bet };
    bj.streak   = 0;
    toast(`💀 Perdiste ${fmt(bj.bet)} monedas`, 'error');
    API.saveBlackjack('lose', bj.bet, 0).catch(() => {});
  }

  renderHUD();
  renderBlackjack();
}

function bjSetBet(amount) {
  S.bj.bet = Math.max(10, Math.min(amount, S.money));
  renderBlackjack();
}

// ─── INTERCAMBIOS ENTRE JUGADORES ────────────────────────

let _tradeTab = 'mercado'; // 'mercado' | 'mis' | 'propuestas'

async function renderIntercambiosAsync() {
  try {
    const [global, mine, proposals] = await Promise.all([
      API.getTrades(),
      API.getMyTrades(),
      API.getProposals(),
    ]);
    S.playerTrades = global;
    S.myTrades     = mine;
    S.proposals    = proposals;
    if (S.screen !== 'intercambios') return;
    document.getElementById('content').innerHTML = renderIntercambios();
  } catch (err) {
    document.getElementById('content').innerHTML = `<div class="page-title">🌐 Intercambios</div><p style="color:var(--danger)">Error al cargar intercambios.</p>`;
  }
}

function renderIntercambios() {
  const tabs = [
    { id:'mercado',    label:'🌐 Mercado',    count: S.playerTrades.length },
    { id:'mis',        label:'📤 Mis ofertas', count: S.myTrades.length },
    { id:'propuestas', label:'📥 Propuestas',  count: S.proposals.length },
  ];

  const tabHtml = `
    <div style="display:flex;gap:8px;margin-bottom:16px">
      ${tabs.map(t => `
        <button onclick="_tradeTab='${t.id}';document.getElementById('content').innerHTML=renderIntercambios()"
          style="flex:1;padding:10px 6px;border-radius:10px;border:none;cursor:pointer;font-size:0.82rem;font-weight:600;
                 background:${_tradeTab===t.id?'var(--accent)':'rgba(255,255,255,0.07)'};
                 color:${_tradeTab===t.id?'#fff':'var(--text2)'}">
          ${t.label}${t.count>0?` <span style="background:rgba(255,255,255,0.2);border-radius:10px;padding:1px 7px;font-size:0.75rem">${t.count}</span>`:''}
        </button>`).join('')}
    </div>`;

  if (_tradeTab === 'mercado') return `
    <div class="page-title">🌐 Intercambios</div>
    <div class="page-subtitle">Intercambia objetos directamente con otros jugadores.</div>
    ${tabHtml}
    <button class="btn-gold" style="width:100%;margin-bottom:16px;padding:12px" onclick="showCreateTradeModal()">
      ➕ Crear nueva oferta
    </button>
    ${S.playerTrades.length === 0
      ? `<div style="text-align:center;padding:40px 20px;color:var(--text2)">
           <div style="font-size:3rem;margin-bottom:12px">🤝</div>
           <div>No hay intercambios activos ahora mismo.<br>¡Crea el primero!</div>
         </div>`
      : S.playerTrades.map(t => tradeCard(t, 'mercado')).join('')
    }`;

  if (_tradeTab === 'mis') return `
    <div class="page-title">🌐 Intercambios</div>
    <div class="page-subtitle">Intercambia objetos directamente con otros jugadores.</div>
    ${tabHtml}
    <button class="btn-gold" style="width:100%;margin-bottom:16px;padding:12px" onclick="showCreateTradeModal()">
      ➕ Crear nueva oferta
    </button>
    ${S.myTrades.length === 0
      ? `<div style="text-align:center;padding:40px 20px;color:var(--text2)">
           <div style="font-size:3rem;margin-bottom:12px">📤</div>
           <div>No tienes intercambios activos.<br>Crea uno desde el Mercado.</div>
         </div>`
      : S.myTrades.map(t => tradeCard(t, 'mis')).join('')
    }`;

  if (_tradeTab === 'propuestas') return `
    <div class="page-title">🌐 Intercambios</div>
    <div class="page-subtitle">Intercambia objetos directamente con otros jugadores.</div>
    ${tabHtml}
    ${S.proposals.length === 0
      ? `<div style="text-align:center;padding:40px 20px;color:var(--text2)">
           <div style="font-size:3rem;margin-bottom:12px">📥</div>
           <div>Nadie ha propuesto intercambio aún.<br>Crea una oferta para recibir propuestas.</div>
         </div>`
      : S.proposals.map(t => tradeCard(t, 'propuestas')).join('')
    }`;

  return '';
}

function tradeCard(trade, mode) {
  const offerItems  = (trade.offer_item_details || []).map(i => {
    const cat = CATALOG.find(c => c.id === i.catalog_id);
    const r   = RARITIES[i.rarity] || RARITIES.common;
    return `<div style="display:inline-flex;align-items:center;gap:4px;background:${r.bg};
             border:1px solid ${r.color};border-radius:8px;padding:4px 8px;font-size:0.78rem;margin:2px">
      <span>${cat ? cat.emoji : '📦'}</span>
      <span style="color:${r.color};font-weight:600">${cat ? cat.name : i.catalog_id}</span>
    </div>`;
  }).join('');

  const respondItems = (trade.respond_item_details || []).map(i => {
    const cat = CATALOG.find(c => c.id === i.catalog_id);
    const r   = RARITIES[i.rarity] || RARITIES.common;
    return `<div style="display:inline-flex;align-items:center;gap:4px;background:${r.bg};
             border:1px solid ${r.color};border-radius:8px;padding:4px 8px;font-size:0.78rem;margin:2px">
      <span>${cat ? cat.emoji : '📦'}</span>
      <span style="color:${r.color};font-weight:600">${cat ? cat.name : i.catalog_id}</span>
    </div>`;
  }).join('');

  const wantText = trade.want_catalog
    ? (() => { const c = CATALOG.find(x => x.id === trade.want_catalog); return c ? `${c.emoji} ${c.name}` : trade.want_catalog; })()
    : trade.want_rarity
    ? `Cualquier objeto ${RARITIES[trade.want_rarity]?.name || trade.want_rarity}`
    : trade.want_note || 'Cualquier cosa interesante';

  const expiresIn = Math.max(0, Math.round((new Date(trade.expires_at) - Date.now()) / 3600000));

  let actions = '';
  if (mode === 'mercado') {
    actions = trade.respondent_id
      ? `<div style="font-size:0.78rem;color:#ff9800;padding:8px;text-align:center">⏳ Propuesta pendiente de respuesta</div>`
      : `<button class="btn-gold" style="width:100%;padding:10px;margin-top:8px"
           onclick="showProposeTradeModal('${trade.id}')">🤝 Proponer intercambio</button>`;
  } else if (mode === 'mis') {
    actions = `<button class="btn-outline" style="width:100%;padding:8px;margin-top:8px;font-size:0.82rem"
        onclick="cancelTrade('${trade.id}')">❌ Cancelar oferta</button>`;
  } else if (mode === 'propuestas') {
    actions = trade.respondent_id ? `
      <div style="margin-top:10px;padding-top:10px;border-top:1px solid rgba(255,255,255,0.08)">
        <div style="font-size:0.78rem;color:var(--text2);margin-bottom:6px">
          Propuesta de <strong style="color:var(--text1)">${trade.respondent_name || 'jugador'}</strong>:
        </div>
        <div style="margin-bottom:8px">${respondItems || '<span style="color:var(--text2);font-size:0.8rem">Sin detalles</span>'}</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
          <button class="btn-gold" style="padding:10px;font-size:0.85rem" onclick="acceptTrade('${trade.id}')">✅ Aceptar</button>
          <button class="btn-outline" style="padding:10px;font-size:0.85rem" onclick="rejectTrade('${trade.id}')">❌ Rechazar</button>
        </div>
      </div>` : '';
  }

  return `
    <div style="background:var(--card);border-radius:14px;padding:16px;margin-bottom:12px;
         border:1px solid rgba(255,255,255,0.07)">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
        <div style="font-weight:700;font-size:0.9rem">
          ${mode === 'mercado' ? `👤 ${trade.creator_name}` : mode === 'mis' ? '📤 Tu oferta' : '📥 Propuesta recibida'}
        </div>
        <div style="font-size:0.72rem;color:var(--text2)">⏱ ${expiresIn}h restantes</div>
      </div>
      <div style="font-size:0.78rem;color:var(--text2);margin-bottom:4px">Ofrece:</div>
      <div style="margin-bottom:10px">${offerItems}</div>
      <div style="font-size:0.78rem;color:var(--text2);margin-bottom:4px">Quiere:</div>
      <div style="background:rgba(255,255,255,0.05);border-radius:8px;padding:8px;font-size:0.82rem;color:var(--text1)">
        🎯 ${wantText}
      </div>
      ${actions}
    </div>`;
}

function showCreateTradeModal() {
  const eligible = S.inventory.filter(i => {
    const cat = CATALOG.find(c => c.id === i.catalogId);
    return i.identified && !i.forSale && !i.inAuction && !(cat && (cat.category_reward || cat.exclusive));
  });
  const rarities = ['common','rare','epic','legendary','unique','exotic'];

  showModal(`
    <h2 style="color:var(--gold);margin:0 0 16px">➕ Nueva oferta de intercambio</h2>
    <div style="font-size:0.82rem;color:var(--text2);margin-bottom:14px">
      Selecciona qué ofreces (1-3 objetos) y qué quieres a cambio.
    </div>

    <div style="font-weight:600;margin-bottom:8px">Objetos que ofreces:</div>
    <div style="max-height:180px;overflow-y:auto;display:flex;flex-direction:column;gap:6px;margin-bottom:14px">
      ${eligible.length === 0
        ? `<div style="color:var(--text2);font-size:0.82rem;padding:10px">No tienes objetos identificados disponibles.</div>`
        : eligible.map(item => {
            const cat = CATALOG.find(c => c.id === item.catalogId);
            const r   = RARITIES[item.rarity] || RARITIES.common;
            return `<label style="display:flex;align-items:center;gap:10px;background:rgba(255,255,255,0.04);
                    border-radius:8px;padding:8px 10px;cursor:pointer;border:1px solid rgba(255,255,255,0.07)">
              <input type="checkbox" class="trade-offer-check" value="${item.uid}"
                style="width:16px;height:16px;accent-color:var(--gold)">
              <span style="font-size:1.1rem">${cat ? cat.emoji : '📦'}</span>
              <div style="flex:1">
                <div style="font-size:0.85rem;font-weight:600">${cat ? cat.name : item.catalogId}</div>
                <div style="font-size:0.72rem;color:${r.color}">${r.name} · 💰${fmt(item.value)}</div>
              </div>
            </label>`;
          }).join('')}
    </div>

    <div style="font-weight:600;margin-bottom:8px">¿Qué quieres a cambio?</div>
    <select id="trade-want-type" onchange="updateTradeWantFields()" style="width:100%;padding:10px;border-radius:8px;
      background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.15);color:var(--text1);margin-bottom:10px">
      <option value="open">Cualquier cosa interesante</option>
      <option value="rarity">Una rareza específica</option>
      <option value="note">Descripción libre</option>
    </select>
    <div id="trade-want-extra"></div>

    <button class="btn-gold" style="width:100%;padding:12px;margin-top:8px" onclick="submitCreateTrade()">
      🤝 Publicar oferta
    </button>
  `);
}

function updateTradeWantFields() {
  const type = document.getElementById('trade-want-type').value;
  const el   = document.getElementById('trade-want-extra');
  const rarities = ['common','rare','epic','legendary','unique','exotic'];
  if (type === 'rarity') {
    el.innerHTML = `<select id="trade-want-rarity" style="width:100%;padding:10px;border-radius:8px;
      background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.15);color:var(--text1);margin-bottom:10px">
      ${rarities.map(r => `<option value="${r}">${RARITIES[r]?.name || r}</option>`).join('')}
    </select>`;
  } else if (type === 'note') {
    el.innerHTML = `<input id="trade-want-note" type="text" maxlength="100" placeholder="Ej: algo de música o deportes..."
      style="width:100%;padding:10px;border-radius:8px;background:rgba(255,255,255,0.07);
             border:1px solid rgba(255,255,255,0.15);color:var(--text1);margin-bottom:10px;box-sizing:border-box">`;
  } else {
    el.innerHTML = '';
  }
}

async function submitCreateTrade() {
  const checked = [...document.querySelectorAll('.trade-offer-check:checked')].map(el => el.value);
  if (checked.length === 0) { toast('Selecciona al menos 1 objeto', 'error'); return; }
  if (checked.length > 3)   { toast('Máximo 3 objetos por oferta', 'error'); return; }

  const type    = document.getElementById('trade-want-type').value;
  const payload = { offer_items: checked };
  if (type === 'rarity') payload.want_rarity = document.getElementById('trade-want-rarity')?.value;
  if (type === 'note')   payload.want_note   = document.getElementById('trade-want-note')?.value;

  try {
    await API.createTrade(payload);
    hideModal();
    toast('✅ Oferta publicada', 'success');
    renderIntercambiosAsync();
  } catch (err) {
    toast(err.message || 'Error al crear oferta', 'error');
  }
}

function showProposeTradeModal(tradeId) {
  const trade    = S.playerTrades.find(t => t.id === tradeId);
  if (!trade) return;
  const eligible = S.inventory.filter(i => {
    const cat = CATALOG.find(c => c.id === i.catalogId);
    return i.identified && !i.forSale && !i.inAuction && !(cat && (cat.category_reward || cat.exclusive));
  });

  showModal(`
    <h2 style="color:var(--gold);margin:0 0 8px">🤝 Proponer intercambio</h2>
    <div style="font-size:0.82rem;color:var(--text2);margin-bottom:14px">
      Selecciona los objetos que darías a cambio (1-3).
    </div>
    <div style="max-height:200px;overflow-y:auto;display:flex;flex-direction:column;gap:6px;margin-bottom:14px">
      ${eligible.length === 0
        ? `<div style="color:var(--text2);font-size:0.82rem;padding:10px">No tienes objetos disponibles.</div>`
        : eligible.map(item => {
            const cat = CATALOG.find(c => c.id === item.catalogId);
            const r   = RARITIES[item.rarity] || RARITIES.common;
            return `<label style="display:flex;align-items:center;gap:10px;background:rgba(255,255,255,0.04);
                    border-radius:8px;padding:8px 10px;cursor:pointer;border:1px solid rgba(255,255,255,0.07)">
              <input type="checkbox" class="trade-respond-check" value="${item.uid}"
                style="width:16px;height:16px;accent-color:var(--gold)">
              <span style="font-size:1.1rem">${cat ? cat.emoji : '📦'}</span>
              <div style="flex:1">
                <div style="font-size:0.85rem;font-weight:600">${cat ? cat.name : item.catalogId}</div>
                <div style="font-size:0.72rem;color:${r.color}">${r.name} · 💰${fmt(item.value)}</div>
              </div>
            </label>`;
          }).join('')}
    </div>
    <button class="btn-gold" style="width:100%;padding:12px" onclick="submitProposeTrade('${tradeId}')">
      📤 Enviar propuesta
    </button>
  `);
}

async function submitProposeTrade(tradeId) {
  const checked = [...document.querySelectorAll('.trade-respond-check:checked')].map(el => el.value);
  if (checked.length === 0) { toast('Selecciona al menos 1 objeto', 'error'); return; }
  if (checked.length > 3)   { toast('Máximo 3 objetos', 'error'); return; }
  try {
    await API.proposeTrade(tradeId, checked);
    hideModal();
    toast('📤 Propuesta enviada', 'success');
    renderIntercambiosAsync();
  } catch (err) {
    toast(err.message || 'Error al enviar propuesta', 'error');
  }
}

async function acceptTrade(tradeId) {
  if (_pendingActions.has('trade_' + tradeId)) return;
  _pendingActions.add('trade_' + tradeId);
  try {
    const res = await API.acceptTrade(tradeId);
    applyLevelUpResult(res);
    toast('✅ ¡Intercambio completado! Los objetos están en tu inventario.', 'success');
    await renderIntercambiosAsync();
    // Recargar inventario
    S.inventory = await API.getItems({ limit: 1000 });
  } catch (err) {
    toast(err.message || 'Error al aceptar', 'error');
  } finally {
    _pendingActions.delete('trade_' + tradeId);
  }
}

async function rejectTrade(tradeId) {
  if (_pendingActions.has('trade_' + tradeId)) return;
  _pendingActions.add('trade_' + tradeId);
  try {
    await API.rejectTrade(tradeId);
    toast('❌ Propuesta rechazada', 'info');
    renderIntercambiosAsync();
  } catch (err) {
    toast(err.message || 'Error al rechazar', 'error');
  } finally {
    _pendingActions.delete('trade_' + tradeId);
  }
}

async function cancelTrade(tradeId) {
  if (_pendingActions.has('trade_' + tradeId)) return;
  _pendingActions.add('trade_' + tradeId);
  try {
    await API.cancelTrade(tradeId);
    toast('🗑 Oferta cancelada', 'info');
    renderIntercambiosAsync();
  } catch (err) {
    toast(err.message || 'Error al cancelar', 'error');
  } finally {
    _pendingActions.delete('trade_' + tradeId);
  }
}

// ─── NAVEGACIÓN ───────────────────────────────────────────
function switchScreen(id) {
  // Limpiar countdown de subastas al salir
  if (auctionCountdownInterval && id !== 'subastas') {
    clearInterval(auctionCountdownInterval);
    auctionCountdownInterval = null;
  }
  S.screen = id;
  document.querySelectorAll('.nav-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.screen === id);
  });
  renderScreen();
  window.scrollTo(0, 0);
}

function renderScreen() {
  const el = document.getElementById('content');
  switch (S.screen) {
    case 'hub':        el.innerHTML = renderHub();        break;
    case 'bodegas':    el.innerHTML = renderBodegas();    break;
    case 'inventario': el.innerHTML = renderInventario(); break;
    case 'mercado':    el.innerHTML = renderMercado();    break;
    case 'subastas':
      el.innerHTML = '<div class="page-title">🔨 Subastas</div><div class="page-subtitle">Cargando subastas...</div>';
      renderSubastasAsync();
      break;
    case 'intercambios':
      el.innerHTML = '<div class="page-title">🌐 Intercambios</div><div class="page-subtitle">Cargando...</div>';
      renderIntercambiosAsync();
      break;
    case 'coleccion':  el.innerHTML = renderColeccion(); renderTitlesSection(); break;
    case 'cartas':     el.innerHTML = ''; renderBlackjack(); break;
    case 'poker':      el.innerHTML = ''; renderPoker();     break;
    case 'perfil':
      el.innerHTML = '<div class="page-title">👤 Mi Perfil</div><div class="page-subtitle">Cargando perfil...</div>';
      renderPerfilAsync(S.userId);
      break;
    default:           el.innerHTML = renderHub();
  }
  renderHUD();
}

// ─── HUD ──────────────────────────────────────────────────
function renderHUD() {
  document.getElementById('money-display').textContent = fmt(S.money);
  document.getElementById('level-display').textContent = `Nv. ${S.level}`;
  const pct = S.xpNext > 0 ? (S.xp / S.xpNext * 100) : 0;
  document.getElementById('xp-fill').style.width  = pct + '%';
  document.getElementById('xp-display').textContent = `${fmt(S.xp)} / ${fmt(S.xpNext)} XP`;
  const hudUser = document.getElementById('hud-user');
  if (hudUser) hudUser.textContent = S.avatar || '🧑';
  const hudTitle = document.getElementById('hud-title');
  if (hudTitle) {
    if (S.equippedTitle && TITLES_MAP[S.equippedTitle]) {
      hudTitle.textContent = TITLES_MAP[S.equippedTitle];
      hudTitle.classList.remove('hidden');
    } else {
      hudTitle.textContent = '';
      hudTitle.classList.add('hidden');
    }
  }
  if (S.bodegaVouchers > 0) {
    const vEl = document.getElementById('voucher-badge');
    if (vEl) { vEl.textContent = `🎁×${S.bodegaVouchers}`; vEl.classList.remove('hidden'); }
  } else {
    const vEl = document.getElementById('voucher-badge');
    if (vEl) vEl.classList.add('hidden');
  }
}

// ─── PANTALLA HUB ─────────────────────────────────────────
function rouletteReady() {
  if (!S.rouletteLast) return true;
  return Date.now() - new Date(S.rouletteLast).getTime() >= 3600000;
}

function rouletteWaitText() {
  if (rouletteReady()) return null;
  const waitMs  = 3600000 - (Date.now() - new Date(S.rouletteLast).getTime());
  const waitMin = Math.ceil(waitMs / 60000);
  return `${waitMin} min`;
}

function renderHub() {
  const daily      = checkDailyReward();
  const totalValue = S.inventory.reduce((s, i) => s + (i.value || 0), 0);
  const notifs     = S.notifications.slice(0, 5);
  const roulReady  = rouletteReady();
  const roulWait   = rouletteWaitText();
  const pendingReqs = S.friendRequests.length;

  return `
    <div class="page-title">🏠 Inicio — ${S.avatar} ${S.username || 'Jugador'}</div>
    <div class="page-subtitle">Bienvenido a BodegaVault — Coleccionista de Rarezas</div>

    <div class="hub-cards-row">
      ${daily ? `
      <div class="daily-card">
        <div><h3>🎁 Recompensa Diaria</h3>
          <p>+${fmt(100 + S.level * 20)} monedas + XP</p></div>
        <button class="btn-gold" onclick="claimDaily()">Reclamar</button>
      </div>` : `
      <div class="daily-card" style="opacity:0.55">
        <div><h3>🎁 Recompensa Diaria</h3><p>Ya reclamada hoy</p></div>
      </div>`}

      <div class="daily-card${roulReady ? '' : ' locked-card'}">
        <div><h3>🎰 Ruleta Horaria</h3>
          <p>${roulReady ? '¡Disponible ahora!' : `Disponible en ${roulWait}`}</p></div>
        ${roulReady
          ? `<button class="btn-gold" onclick="showRouletteModal()">Girar</button>`
          : `<button class="btn-outline" disabled>⏳ ${roulWait}</button>`}
      </div>
    </div>

    ${S.bodegaVouchers > 0 ? `
    <div class="voucher-banner">
      🎁 Tienes <strong>${S.bodegaVouchers}</strong> ${S.bodegaVouchers===1?'bodega gratuita':'bodegas gratuitas'} —
      <button class="btn-link" onclick="switchScreen('bodegas')">Ir a Bodegas</button>
    </div>` : ''}

    ${pendingReqs > 0 ? `
    <div class="voucher-banner" style="background:rgba(108,99,255,0.15);border-color:var(--accent)">
      👋 Tienes <strong>${pendingReqs}</strong> solicitud${pendingReqs>1?'es':''} de amistad pendiente${pendingReqs>1?'s':''} —
      <button class="btn-link" onclick="switchScreen('perfil')">Ver Perfil</button>
    </div>` : ''}

    ${S.pendingGifts.length > 0 ? `
    <div class="voucher-banner gift-banner">
      🎁 Tienes <strong>${S.pendingGifts.length}</strong> bodega${S.pendingGifts.length>1?'s':''}  regalada${S.pendingGifts.length>1?'s':''} sin abrir —
      <button class="btn-link" onclick="showPendingGiftsModal()">Abrir ahora</button>
    </div>` : ''}

    <div class="hub-grid">
      <div class="stat-card"><div class="stat-icon">💰</div><div class="stat-val">${fmt(S.money)}</div><div class="stat-label">Monedas</div></div>
      <div class="stat-card"><div class="stat-icon">📦</div><div class="stat-val">${S.inventory.length}</div><div class="stat-label">Objetos</div></div>
      <div class="stat-card"><div class="stat-icon">📊</div><div class="stat-val">${Object.keys(S.collection).length}/${CATALOG.length}</div><div class="stat-label">Colección</div></div>
      <div class="stat-card"><div class="stat-icon">💎</div><div class="stat-val">${fmt(totalValue)}</div><div class="stat-label">Valor total</div></div>
      <div class="stat-card"><div class="stat-icon">🏭</div><div class="stat-val">${S.stats.bodegas}</div><div class="stat-label">Bodegas abiertas</div></div>
      <div class="stat-card"><div class="stat-icon">👥</div><div class="stat-val">${S.friends.length}</div><div class="stat-label">Amigos</div></div>
    </div>

    <div class="section-title">Actividad Reciente</div>
    ${notifs.length ? `<div class="notif-list">${notifs.map(n => {
      const meta = n.metadata;
      const isGift = meta && meta.type === 'gift' && meta.gift_id;
      return `
      <div class="notif-item${isGift ? ' notif-gift' : ''}">
        <span class="notif-icon">${isGift ? '🎁' : '📌'}</span>
        <div style="flex:1">
          <div>${n.message}</div>
          <div class="notif-time">${timeAgo(n.created_at)}</div>
        </div>
        ${isGift ? `<button class="btn-gold btn-sm" onclick="openGift('${meta.gift_id}')">¡Abrir!</button>` : ''}
      </div>`;
    }).join('')}</div>` : `<p style="color:var(--text2);font-size:0.85rem">Sin actividad reciente.</p>`}

    <div class="section-title" style="margin-top:24px">Accesos Rápidos</div>
    <div style="display:flex;gap:10px;flex-wrap:wrap;">
      <button class="btn-primary" onclick="switchScreen('bodegas')">🏭 Comprar Bodega</button>
      <button class="btn-primary" onclick="switchScreen('inventario')">📦 Ver Inventario</button>
      <button class="btn-primary" onclick="switchScreen('subastas')">🔨 Ver Subastas</button>
      <button class="btn-primary" onclick="switchScreen('cartas')">🃏 Jugar Cartas</button>
    </div>
  `;
}

// ─── PANTALLA BODEGAS ─────────────────────────────────────
function renderBodegas() {
  return `
    <div class="page-title">🏭 Comprar Bodegas</div>
    <div class="page-subtitle">Cada bodega contiene objetos aleatorios. ¡La emoción está en no saber qué encontrarás!</div>
    ${S.bodegaVouchers > 0 ? `
    <div class="voucher-banner">
      🎁 Tienes <strong>${S.bodegaVouchers}</strong> bodega${S.bodegaVouchers>1?'s gratuitas':' gratuita'} — Úsalas al comprar cualquier bodega básica gratis:
      <button class="btn-gold btn-sm" style="margin-left:8px" onclick="useVoucher('basica')">Usar Voucher</button>
    </div>` : ''}
    <div class="bodegas-grid">
      ${BODEGAS.map(b => {
        const canAfford  = S.money >= b.cost;
        const locked     = b.minLevel && S.level < b.minLevel;
        const isPremium  = b.id === 'magnate' || b.id === 'abismo';
        const extraClass = b.id === 'magnate' ? 'magnate-card' : b.id === 'abismo' ? 'abismo-card' : '';
        const borderColor = locked ? 'var(--border)' : canAfford ? b.color : 'var(--border)';
        // Regalos: solo bodegas normales (no premium)
        const canGift = S.level >= 5 && S.friends.length > 0 && !isPremium;
        return `
        <div class="bodega-card ${extraClass}" style="border-color:${borderColor}">
          <div class="bodega-icon">${b.icon}</div>
          <h3>${b.name}${b.id==='abismo'?` <span class="exotic-badge">☢️ EXÓTICO</span>`:''}</h3>
          ${b.minLevel ? `<div style="font-size:0.75rem;color:var(--text2);margin-bottom:4px">🔒 Nivel ${b.minLevel}+ requerido</div>` : ''}
          <div class="bodega-desc">${b.desc}</div>
          <div class="bodega-info">📦 ${b.itemCount.min}–${b.itemCount.max} objetos${b.unidChance > 0 ? ` &nbsp;|&nbsp; 🔮 ${Math.round(b.unidChance*100)}% no ident.` : ' &nbsp;|&nbsp; ✅ Todos identificados'}</div>
          <div class="prob-bars">
            ${Object.entries(b.rarityW).filter(([,v])=>v>0).map(([k,v]) => {
              const r = RARITIES[k];
              return `<div class="prob-row">
                <span class="prob-label" style="color:${r.color}">${r.name}</span>
                <div class="prob-bar-outer"><div class="prob-bar-inner" style="width:${v}%;background:${r.color}"></div></div>
                <span class="prob-pct" style="color:${r.color}">${v}%</span>
              </div>`;
            }).join('')}
          </div>
          <div style="display:flex;align-items:center;justify-content:space-between;margin-top:6px;gap:6px;">
            <div class="bodega-cost">💰 ${fmt(b.cost)}</div>
            <div style="display:flex;gap:6px;">
              ${canGift ? `<button class="btn-outline btn-sm" onclick="showGiftModal('${b.id}')">🎁 Regalar</button>` : ''}
              <button class="btn-primary btn-sm"
                ${canAfford && !locked ? `onclick="openBodega('${b.id}')"` : 'disabled'}
              >${locked ? `Nv.${b.minLevel}` : canAfford ? 'Comprar' : 'Sin fondos'}</button>
            </div>
          </div>
        </div>`;
      }).join('')}
    </div>

    ${S.level >= 5 ? `
    <div class="section-title" style="margin-top:24px">🎨 Revestimientos de Vitrina</div>
    <div class="page-subtitle" style="margin-bottom:12px">Modifica el aspecto visual de los marcos de tu vitrina.</div>
    <div class="bodegas-grid">
      <div class="bodega-card designer-box-card" style="border-color:${S.money >= CAJA_DISENADOR.cost ? CAJA_DISENADOR.color : 'var(--border)'}">
        <div class="bodega-icon">${CAJA_DISENADOR.icon}</div>
        <h3>${CAJA_DISENADOR.name}</h3>
        <div class="bodega-desc">${CAJA_DISENADOR.desc}</div>
        <div class="prob-bars">
          ${Object.entries(CAJA_DISENADOR.rarityW).filter(([,v])=>v>0).map(([k,v]) => {
            const r = RARITIES[k];
            return `<div class="prob-row">
              <span class="prob-label" style="color:${r.color}">${r.name}</span>
              <div class="prob-bar-outer"><div class="prob-bar-inner" style="width:${v}%;background:${r.color}"></div></div>
              <span class="prob-pct" style="color:${r.color}">${v}%</span>
            </div>`;
          }).join('')}
        </div>
        <div style="display:flex;align-items:center;justify-content:space-between;margin-top:8px;gap:6px;">
          <div class="bodega-cost">💰 ${fmt(CAJA_DISENADOR.cost)}</div>
          <div style="display:flex;gap:6px;">
            <button class="btn-outline btn-sm" onclick="showRevestimientosModal()">🖼️ Mi colección</button>
            <button class="btn-primary btn-sm"
              ${S.money >= CAJA_DISENADOR.cost ? `onclick="doOpenDesignerBox()"` : 'disabled'}
            >${S.money >= CAJA_DISENADOR.cost ? 'Abrir caja' : 'Sin fondos'}</button>
          </div>
        </div>
      </div>
    </div>` : `
    <div class="lock-notice" style="margin-top:20px;text-align:center;color:var(--text2);font-size:0.85rem">🔒 La Caja de Diseñador se desbloquea en nivel 5</div>`}
  `;
}

// ─── PANTALLA INVENTARIO ──────────────────────────────────
let invFilter = 'all';

function renderInventario() {
  const items = S.inventory.filter(i => {
    if (invFilter === 'all')  return true;
    if (invFilter === 'unid') return !i.identified;
    const cat = CATALOG.find(c => c.id === i.catalogId);
    return cat && cat.category === invFilter;
  });

  const unidCount = S.inventory.filter(i => !i.identified).length;

  return `
    <div class="page-title">📦 Inventario</div>
    <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;margin-bottom:12px">
      <div class="page-subtitle" style="margin:0">${S.inventory.length} objetos en total</div>
      ${unidCount > 0 ? `
      <button class="btn-gold btn-sm" onclick="evaluateAllItems()">
        🔍 Evaluar todos (${unidCount})
      </button>` : ''}
    </div>
    <div class="inv-filters">
      ${['all','unid',...Object.keys(CATEGORIES)].map(f => {
        const label = f==='all'?'Todos':f==='unid'?'❓ Sin identificar':CATEGORIES[f].icon+' '+CATEGORIES[f].name;
        return `<button class="filter-btn${invFilter===f?' active':''}" onclick="setInvFilter('${f}')">${label}</button>`;
      }).join('')}
    </div>
    ${items.length === 0 ? `
      <div class="empty-state">
        <div class="empty-icon">📭</div><h3>Sin objetos</h3>
        <p>Compra una bodega para conseguir objetos.</p>
        <button class="btn-primary" style="margin-top:12px" onclick="switchScreen('bodegas')">Ir a Bodegas</button>
      </div>` : `
    <div class="items-grid">${items.map(item => renderItemCard(item)).join('')}</div>`}
  `;
}

function setInvFilter(f) { invFilter = f; renderScreen(); }

async function evaluateAllItems() {
  const unidCount = S.inventory.filter(i => !i.identified).length;
  if (!unidCount) { toast('No tienes objetos sin identificar', 'info'); return; }

  showLoading(`Evaluando ${unidCount} objetos...`);
  try {
    const res = await API.evaluateAll();

    // Actualizar inventario local
    res.items.forEach(srv => {
      const local = S.inventory.find(i => i.uid === srv.id);
      if (local) {
        local.identified = true;
        local.value      = srv.value;
        local.grade      = srv.grade;
      }
      if (srv.catalog_id) S.collection[srv.catalog_id] = true;
    });

    applyLevelUpResult(res);
    renderHUD();
    hideLoading();
    renderScreen();

    showModal(`
      <div style="text-align:center;padding:8px 0">
        <div style="font-size:2.5rem;margin-bottom:8px">🔍</div>
        <h3 style="margin-bottom:8px">¡${res.count} objetos identificados!</h3>
        <p style="color:var(--text2);margin-bottom:12px">Se generaron ofertas NPC para cada uno.</p>
        <p style="color:var(--text2);font-size:0.85rem;margin-bottom:12px">Se generaron ofertas NPC para cada uno.</p>
        <button class="btn-primary" style="width:100%" onclick="hideModal()">Cerrar</button>
      </div>
    `);
  } catch (err) {
    hideLoading();
    toast(err.message || 'Error al evaluar', 'error');
  }
}

function renderItemCard(item, readonly = false) {
  const cat  = CATALOG.find(c => c.id === item.catalogId);
  const r    = RARITIES[item.rarity];
  const cond = CONDITIONS[item.condition];
  const isU  = !item.identified;
  const click = readonly ? '' : `onclick="showItemDetail('${item.uid}')"`;
  return `
    <div class="item-card ${isU ? 'unidentified' : item.rarity}" ${click} style="${readonly?'cursor:default':''}">
      <span class="item-emoji">${isU ? '❓' : cat?.emoji || '📦'}</span>
      <div class="item-name">${isU ? 'No Identificado' : cat?.name || item.catalogId}</div>
      <span class="item-rarity-badge" style="background:${r.bg};color:${r.color}">${r.name}</span>
      <div class="item-condition" style="color:${cond.color}">${isU ? '???' : cond.name}</div>
      <div class="item-value">${isU ? '💰 ???' : '💰 ' + fmt(item.value)}</div>
      ${item.forSale ? '<div style="font-size:0.7rem;color:var(--warn);margin-top:4px">EN VENTA</div>' : ''}
      ${cat?.exclusive ? '<div style="font-size:0.68rem;color:var(--gold);margin-top:2px">⭐ EXCLUSIVO</div>' : ''}
    </div>
  `;
}

function showItemDetail(itemUid) {
  const item = S.inventory.find(i => i.uid === itemUid);
  if (!item) return;
  const cat      = CATALOG.find(c => c.id === item.catalogId);
  const r        = RARITIES[item.rarity] || RARITIES.common;
  const cond     = CONDITIONS[item.condition] || CONDITIONS.good;
  const category = (cat && CATEGORIES[cat.category]) || { icon:'📦', name:'Objeto', color:'#888' };
  const isU      = !item.identified;
  const isCatReward = cat && !!cat.category_reward;
  const repairCost   = calcRepairCost(item.condition, item.rarity);
  const repairChance = Math.round((REPAIR_SUCCESS[item.condition] || 0) * 100);
  const pips = Array.from({length:10}, (_,i) =>
    `<div class="grade-pip${i < item.grade ? ' filled' : ''}"></div>`).join('');

  showModal(`
    <div class="item-detail-header">
      <div class="item-detail-emoji">${isU ? '❓' : cat.emoji}</div>
      <div class="item-detail-info">
        <h2>${isU ? 'Objeto No Identificado' : cat.name}</h2>
        <span class="rarity-tag" style="background:${r.bg};color:${r.color}">${r.name}</span>
        <span class="badge" style="background:${category.color}20;color:${category.color};margin-left:6px">${category.icon} ${category.name}</span>
        ${isCatReward ? `<span class="badge" style="background:rgba(233,30,99,0.15);color:#e91e63;margin-left:6px">🏆 Recompensa de catálogo</span>` : ''}
        <div class="detail-desc">${isU ? 'Requiere evaluación para revelar su identidad y valor.' : cat.desc}</div>
      </div>
    </div>
    <div class="item-detail-stats">
      <div class="detail-stat"><span>Estado</span><span style="color:${cond.color};font-weight:700">${isU?'???':cond.name}</span></div>
      <div class="detail-stat"><span>Valor</span><span style="color:var(--gold);font-weight:700">${isU?'???':'💰 '+fmt(item.value)}</span></div>
      <div class="detail-stat"><span>Calificación</span>
        <div class="grade-display">${isU?'<span style="color:var(--text2)">???</span>':pips+`<span style="font-size:0.72rem;color:var(--text2);margin-left:4px">${item.grade}/10</span>`}</div>
      </div>
      <div class="detail-stat"><span>Valor base</span><span>${cat.baseValue} monedas</span></div>
    </div>
    <div class="item-detail-actions">
      ${isU ? `
        <button class="btn-primary" onclick="quickEvaluate('${item.uid}')">🔍 Eval. Rápida (gratis)</button>
        <button class="btn-gold"    onclick="professionalEvaluate('${item.uid}')">🎓 Eval. Profesional (50💰)</button>
      ` : isCatReward ? `
        <div style="background:rgba(233,30,99,0.1);border:1px solid rgba(233,30,99,0.3);border-radius:10px;
             padding:10px 14px;font-size:0.8rem;color:#e91e63;text-align:center">
          🔒 Este objeto es una recompensa exclusiva de catálogo.<br>
          <span style="color:#aaa">No se puede vender ni intercambiar.</span>
        </div>
      ` : `
        ${!item.forSale
          ? `<button class="btn-gold" onclick="putForSale('${item.uid}')">💼 Poner en Venta</button>`
          : `<button class="btn-outline" onclick="removeFromSale('${item.uid}')">❌ Retirar de Venta</button>`}
        ${item.condition !== 'new' ? `
          <div style="width:100%;margin-top:6px">
            <div style="font-size:0.75rem;color:var(--text2);margin-bottom:4px">
              🔧 Reparar mejora el valor — <em>opcional</em>
            </div>
            <div class="repair-risk">
              <span style="font-size:0.75rem">Éxito:</span>
              <div class="risk-bar-outer"><div class="risk-bar-fill" style="width:${repairChance}%;background:${repairChance>70?'var(--success)':repairChance>40?'var(--warn)':'var(--danger)'}"></div></div>
              <span style="font-size:0.75rem">${repairChance}%</span>
            </div>
            <button class="btn-primary btn-sm" style="margin-top:6px" onclick="attemptRepair('${item.uid}')">🔧 Reparar (${fmt(repairCost)}💰)</button>
          </div>
        ` : ''}
      `}
      <button class="btn-outline" onclick="hideModal()">Cerrar</button>
    </div>
  `);
}

// ─── PANTALLA MERCADO ─────────────────────────────────────
function renderMercado() {
  const forSale = S.inventory.filter(i => i.forSale);
  return `
    <div class="page-title">💼 Mercado</div>
    <div class="page-subtitle">Gestiona tus ventas y responde a las ofertas de los compradores.</div>
    <div style="display:inline-flex;align-items:center;gap:8px;background:var(--card);border:1px solid var(--border);border-radius:var(--radius);padding:8px 16px;margin-bottom:16px;font-size:0.9rem">
      <span>🏪 Ventas hoy:</span>
      <span style="font-weight:700;color:${S.dailySales >= 12 ? '#f44336' : S.dailySales >= 9 ? '#ff9800' : 'var(--gold)'}">${S.dailySales}/12</span>
      ${S.dailySales >= 12 ? '<span style="color:#f44336;font-size:0.8rem">— Límite alcanzado, vuelve mañana</span>' : ''}
    </div>

    ${forSale.length === 0 ? `
      <div class="empty-state">
        <div class="empty-icon">🏪</div><h3>Nada en venta</h3>
        <p>Ve al inventario, selecciona un objeto identificado y pulsa "Poner en Venta".</p>
        <button class="btn-primary" style="margin-top:12px" onclick="switchScreen('inventario')">Ir al Inventario</button>
      </div>` :
    forSale.map(item => {
      const cat       = CATALOG.find(c => c.id === item.catalogId);
      const r         = RARITIES[item.rarity];
      const cond      = CONDITIONS[item.condition];
      const itemOffers = S.pendingOffers.filter(o => o.itemUid === item.uid);
      return `
        <div style="background:var(--card);border:1px solid var(--border);border-radius:var(--radius-lg);padding:18px;margin-bottom:16px">
          <div style="display:flex;gap:12px;align-items:center;margin-bottom:14px">
            <span style="font-size:2rem">${cat.emoji}</span>
            <div>
              <div style="font-weight:700">${cat.name}</div>
              <span class="badge" style="background:${r.bg};color:${r.color}">${r.name}</span>
              <span class="badge" style="background:${cond.color}20;color:${cond.color};margin-left:4px">${cond.name}</span>
              <div style="color:var(--gold);font-weight:700;margin-top:4px">💰 Valor: ${fmt(item.value)}</div>
            </div>
            <div style="margin-left:auto">
              <button class="btn-outline btn-sm" onclick="removeFromSale('${item.uid}')">Retirar</button>
            </div>
          </div>
          ${itemOffers.length === 0
            ? `<p style="color:var(--text2);font-size:0.82rem">⏳ Esperando ofertas...</p>`
            : `<div class="section-title" style="margin-top:0">Ofertas recibidas</div>
               <div class="market-layout">
                 ${itemOffers.map(offer => {
                   const npc  = NPCS.find(n => n.id === offer.npcId);
                   const pct  = Math.round(offer.price / item.value * 100);
                   return `
                   <div class="npc-buyer-card">
                     <div class="npc-buyer-header">
                       <span class="npc-avatar">${npc.avatar}</span>
                       <div><div class="npc-buyer-name">${npc.name}</div><div class="npc-buyer-title">${npc.title}</div></div>
                     </div>
                     <div class="npc-offer-text">"${offer.phrase}"</div>
                     <div class="npc-offer-amount">💰 ${fmt(offer.price)}</div>
                     <div style="font-size:0.75rem;color:${pct>=100?'var(--success)':pct>=70?'var(--warn)':'var(--danger)'}">${pct}% del valor estimado</div>
                     <div style="display:flex;gap:8px;margin-top:8px">
                       <button class="btn-gold btn-sm" onclick="acceptOffer('${offer.id}')">✅ Aceptar</button>
                       <button class="btn-outline btn-sm" onclick="rejectOffer('${offer.id}')">❌ Rechazar</button>
                     </div>
                   </div>`;
                 }).join('')}
               </div>`}
        </div>`;
    }).join('')}
  `;
}


// ─── PANTALLA PERFIL ──────────────────────────────────────
async function renderPerfilAsync(userId) {
  try {
    const profile = await API.getProfile(userId);
    const el = document.getElementById('content');
    if (S.screen !== 'perfil') return;
    const isOwn = userId === S.userId;
    const maxSlots = showcaseSlotsForLevel(profile.level);
    const revClass = profile.activeRevestimiento?.css_class || '';
    const slots = Array.from({ length: 7 }, (_, i) => {
      const slot  = i + 1;
      const item  = profile.showcase.find(s => s.slot === slot);
      const locked = slot > maxSlots;
      const unlockAt = slot <= 1 ? 5 : slot <= 3 ? 10 : slot <= 5 ? 15 : 20;
      if (locked) {
        return `<div class="showcase-slot locked" title="Desbloquea en nivel ${unlockAt}">
          🔒<span class="showcase-lock-label">Nv.${unlockAt}</span>
        </div>`;
      }
      if (!item || !item.catalog_id) {
        return `<div class="showcase-slot empty ${revClass}" ${isOwn ? `onclick="editShowcaseModal()"` : ''}>
          ${isOwn ? '＋' : '·'}
        </div>`;
      }
      const cat = CATALOG.find(c => c.id === item.catalog_id);
      const r   = RARITIES[item.rarity];
      return `<div class="showcase-slot filled ${revClass}" style="border-color:${r.color};background:${r.bg}" title="${cat?.name}">
        <span class="showcase-emoji">${cat?.emoji || '?'}</span>
        <span class="showcase-name">${cat?.name || item.catalog_id}</span>
        <span class="showcase-rarity" style="color:${r.color}">${r.name}</span>
        <span class="showcase-value">💰 ${fmt(item.value)}</span>
      </div>`;
    });

    // Amigos: estado de relación
    let friendBtn = '';
    if (!isOwn) {
      const isFriend = S.friends.some(f => f.friendId === userId);
      const hasPending = S.friendRequests.some(r => r.requesterId === userId);
      if (isFriend) {
        friendBtn = `<button class="btn-outline btn-sm" onclick="doRemoveFriend('${userId}')">❌ Eliminar amigo</button>`;
      } else if (hasPending) {
        const req = S.friendRequests.find(r => r.requesterId === userId);
        friendBtn = `<button class="btn-gold btn-sm" onclick="doAcceptFriend('${req.friendshipId}')">✅ Aceptar solicitud</button>`;
      } else {
        friendBtn = `<button class="btn-primary btn-sm" onclick="doSendFriendRequest('${userId}')">👋 Agregar amigo</button>`;
      }
    }

    el.innerHTML = `
      <div class="profile-header">
        <div class="profile-avatar-big" ${isOwn ? 'onclick="showAvatarModal()" title="Cambiar avatar"' : ''}>${profile.avatar || '🧑'}</div>
        <div class="profile-info">
          <h2>${profile.username}</h2>
          ${profile.equippedTitle && TITLES_MAP[profile.equippedTitle] ? `<div style="color:#ff2222;font-style:italic;font-weight:700;font-size:0.9rem;margin-bottom:4px;text-shadow:0 0 8px #ff0000aa">🎖️ ${TITLES_MAP[profile.equippedTitle]}</div>` : ''}
          <div class="profile-badges">
            <span class="hud-level-badge">Nv. ${profile.level}</span>
            ${isOwn ? `<button class="btn-link" onclick="showAvatarModal()">✏️ Cambiar avatar</button>` : ''}
          </div>
          <div class="profile-stats-row">
            <span>🏭 ${profile.bodegas} bodegas</span>
            <span>💼 ${profile.sold} ventas</span>
            <span>📚 ${profile.collectionCount}/${CATALOG.length}</span>
            <span>🃏 ${profile.bjWins} victorias BJ</span>
          </div>
          <div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap">
            ${friendBtn}
            ${!isOwn ? `<button class="btn-outline btn-sm" onclick="showUserInventory('${userId}','${profile.username}')">📦 Ver Inventario</button>` : ''}
          </div>
        </div>
      </div>

      <div class="section-title">🖼️ Vitrina${isOwn ? ` <button class="btn-link" onclick="editShowcaseModal()" style="margin-left:10px">✏️ Editar</button>` : ''}${profile.activeRevestimiento ? ` <span class="rev-badge ${profile.activeRevestimiento.css_class}-badge">🎨 ${profile.activeRevestimiento.name}</span>` : ''}</div>
      <div class="showcase-grid">
        ${slots.join('')}
      </div>

      ${isOwn && S.friendRequests.length > 0 ? `
      <div class="section-title">👋 Solicitudes de Amistad (${S.friendRequests.length})</div>
      <div class="friends-list">
        ${S.friendRequests.map(r => `
          <div class="friend-card">
            <span class="friend-avatar">${r.avatar || '🧑'}</span>
            <div class="friend-info"><strong>${r.username}</strong><span>Nv. ${r.level}</span></div>
            <div class="friend-actions">
              <button class="btn-gold btn-sm" onclick="doAcceptFriend('${r.friendshipId}')">✅ Aceptar</button>
            </div>
          </div>`).join('')}
      </div>` : ''}

      ${isOwn ? `
      <div class="section-title">👥 Amigos (${S.friends.length})</div>
      <div class="friend-search-row">
        <input id="friend-search-input" type="text" placeholder="Buscar usuario..." class="text-input" oninput="searchFriends()">
      </div>
      <div id="friend-search-results"></div>
      ${S.friends.length === 0 ? `<p style="color:var(--text2);font-size:0.85rem">Aún no tienes amigos. ¡Busca a otros jugadores!</p>` : `
      <div class="friends-list">
        ${S.friends.map(f => `
          <div class="friend-card">
            <span class="friend-avatar">${f.avatar || '🧑'}</span>
            <div class="friend-info">
              <strong>${f.username}</strong><span>Nv. ${f.level}</span>
            </div>
            <div class="friend-actions">
              <button class="btn-primary btn-sm" onclick="viewProfile('${f.friendId}')">👤 Ver Perfil</button>
              <button class="btn-outline btn-sm" onclick="doRemoveFriend('${f.friendId}')">❌</button>
            </div>
          </div>`).join('')}
      </div>`}` : ''}

      <div class="section-title">🏆 Logros (${profile.achievements.length})</div>
      <div class="achievements-grid">
        ${ACHIEVEMENTS.map(a => `
          <div class="ach-card ${profile.achievements.includes(a.id) ? 'unlocked' : ''}">
            <div class="ach-icon">${a.icon}</div>
            <div class="ach-name">${a.name}</div>
            <div class="ach-desc">${a.desc}</div>
          </div>`).join('')}
      </div>
    `;
  } catch (err) {
    document.getElementById('content').innerHTML = `<div class="empty-state"><div class="empty-icon">❌</div><h3>Error al cargar perfil</h3><p>${err.message}</p></div>`;
  }
}

function viewProfile(userId) {
  S.screen = 'perfil';
  document.querySelectorAll('.nav-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.screen === 'perfil');
  });
  const el = document.getElementById('content');
  el.innerHTML = '<div class="page-title">👤 Perfil</div><div class="page-subtitle">Cargando...</div>';
  renderPerfilAsync(userId);
  window.scrollTo(0, 0);
}

// ─── AVATAR ───────────────────────────────────────────────
function showAvatarModal() {
  showModal(`
    <h3 style="margin-bottom:16px">🎭 Elegir Avatar</h3>
    <div class="avatar-grid">
      ${AVATARS.map(a => `
        <div class="avatar-option${S.avatar===a?' selected':''}" onclick="selectAvatar('${a}')">${a}</div>
      `).join('')}
    </div>
  `);
}

async function selectAvatar(emoji) {
  try {
    await API.updateAvatar(emoji);
    S.avatar = emoji;
    hideModal();
    renderHUD();
    toast('Avatar actualizado', 'success');
    // Refrescar perfil si estamos en esa pantalla
    if (S.screen === 'perfil') renderPerfilAsync(S.userId);
  } catch (err) {
    toast(err.message || 'Error al cambiar avatar', 'error');
  }
}

// ─── VITRINA ──────────────────────────────────────────────
function editShowcaseModal() {
  const maxSlots = showcaseSlotsForLevel(S.level);
  if (maxSlots === 0) {
    toast('Desbloquea la Vitrina llegando al nivel 5', 'info');
    return;
  }
  const identified = S.inventory.filter(i => i.identified && !i.forSale);
  const currentSlots = Array.from({ length: maxSlots }, (_, i) => {
    const slot = i + 1;
    const cur  = S.showcase.find(s => s.slot === slot);
    return { slot, itemId: cur?.id || null };
  });

  showModal(`
    <h3 style="margin-bottom:4px">🖼️ Editar Vitrina</h3>
    <p style="color:var(--text2);font-size:0.82rem;margin-bottom:16px">Selecciona hasta ${maxSlots} objeto${maxSlots>1?'s':''} para mostrar en tu perfil.</p>
    <div id="showcase-editor">
      ${currentSlots.map(s => {
        const curItem = s.itemId ? identified.find(i => i.uid === s.itemId) || null : null;
        const curCat  = curItem ? CATALOG.find(c => c.id === curItem.catalogId) : null;
        return `
          <div class="showcase-edit-row">
            <span class="showcase-slot-label">Slot ${s.slot}</span>
            <select class="showcase-select" id="sc-slot-${s.slot}">
              <option value="">— Vacío —</option>
              ${identified.map(item => {
                const cat = CATALOG.find(c => c.id === item.catalogId);
                const r   = RARITIES[item.rarity];
                return `<option value="${item.uid}" ${s.itemId===item.uid?'selected':''}>${cat.emoji} ${cat.name} (${r.name})</option>`;
              }).join('')}
            </select>
          </div>`;
      }).join('')}
    </div>
    <div style="display:flex;gap:8px;margin-top:16px">
      <button class="btn-gold" onclick="saveShowcase(${maxSlots})">💾 Guardar</button>
      <button class="btn-outline" onclick="hideModal()">Cancelar</button>
    </div>
  `);
}

async function saveShowcase(maxSlots) {
  const slots = [];
  for (let i = 1; i <= maxSlots; i++) {
    const sel = document.getElementById(`sc-slot-${i}`);
    if (sel && sel.value) slots.push({ slot: i, itemId: sel.value });
  }
  showLoading('Guardando vitrina...');
  try {
    const res = await API.updateShowcase(slots);
    S.showcase = res.showcase || [];
    hideModal();
    hideLoading();
    toast('🖼️ Vitrina actualizada', 'success');
    if (S.screen === 'perfil') renderPerfilAsync(S.userId);
  } catch (err) {
    hideLoading();
    toast(err.message || 'Error al guardar', 'error');
  }
}

// ─── AMIGOS ───────────────────────────────────────────────
async function doSendFriendRequest(userId) {
  try {
    await API.sendFriendRequest(userId);
    toast('👋 Solicitud de amistad enviada', 'success');
    if (S.screen === 'perfil') renderPerfilAsync(userId);
  } catch (err) {
    toast(err.message || 'Error', 'error');
  }
}

async function doAcceptFriend(friendshipId) {
  try {
    await API.acceptFriendRequest(friendshipId);
    S.friendRequests = S.friendRequests.filter(r => r.friendshipId !== friendshipId);
    S.friends = await API.getFriends();
    toast('✅ ¡Ahora son amigos!', 'success');
    if (S.screen === 'perfil') renderPerfilAsync(S.userId);
  } catch (err) {
    toast(err.message || 'Error', 'error');
  }
}

async function doRemoveFriend(userId) {
  try {
    await API.removeFriend(userId);
    S.friends = S.friends.filter(f => f.friendId !== userId);
    toast('Amigo eliminado', 'info');
    if (S.screen === 'perfil') renderPerfilAsync(S.userId);
  } catch (err) {
    toast(err.message || 'Error', 'error');
  }
}

let searchTimeout = null;
function searchFriends() {
  clearTimeout(searchTimeout);
  const q = document.getElementById('friend-search-input')?.value?.trim();
  if (!q || q.length < 2) {
    const el = document.getElementById('friend-search-results');
    if (el) el.innerHTML = '';
    return;
  }
  searchTimeout = setTimeout(async () => {
    const results = await API.searchUsers(q);
    const el = document.getElementById('friend-search-results');
    if (!el) return;
    el.innerHTML = results.length === 0 ? `<p style="color:var(--text2);font-size:0.82rem">Sin resultados</p>` :
      `<div class="friends-list">${results.map(u => {
        const isSelf   = u.id === S.userId;
        const isFriend = S.friends.some(f => f.friendId === u.id);
        return `<div class="friend-card">
          <span class="friend-avatar">${u.avatar || '🧑'}</span>
          <div class="friend-info"><strong>${u.username}</strong><span>Nv. ${u.level}</span></div>
          <div class="friend-actions">
            ${isSelf ? '' : isFriend
              ? `<span style="color:var(--success);font-size:0.8rem">✅ Amigos</span>`
              : `<button class="btn-primary btn-sm" onclick="doSendFriendRequest('${u.id}')">👋 Agregar</button>`}
            <button class="btn-outline btn-sm" onclick="viewProfile('${u.id}')">👤 Ver</button>
          </div>
        </div>`;
      }).join('')}</div>`;
  }, 400);
}

async function showUserInventory(userId, username) {
  showLoading('Cargando inventario...');
  try {
    const items = await API.getUserInventory(userId);
    hideLoading();
    showModal(`
      <h3 style="margin-bottom:12px">📦 Inventario de ${username}</h3>
      ${items.length === 0 ? '<p style="color:var(--text2)">Inventario vacío</p>' :
        `<div class="items-grid" style="max-height:60vh;overflow-y:auto">${items.map(item => renderItemCard(item, true)).join('')}</div>`}
      <button class="btn-outline" onclick="hideModal()" style="margin-top:12px">Cerrar</button>
    `);
  } catch (err) {
    hideLoading();
    toast(err.message || 'Error', 'error');
  }
}

// ─── PANTALLA SUBASTAS ────────────────────────────────────
let auctionTab = 'all'; // 'all' | 'mine' | 'create'

async function renderSubastasAsync() {
  try {
    const [auctions, myAuctions] = await Promise.all([API.getAuctions(), API.getMyAuctions()]);
    S.auctions   = auctions;
    S.myAuctions = myAuctions;
    const el = document.getElementById('content');
    if (S.screen !== 'subastas') return;
    el.innerHTML = renderSubastas();
    startAuctionCountdown();
  } catch (err) {
    document.getElementById('content').innerHTML = `<div class="empty-state"><p>Error cargando subastas</p></div>`;
  }
}

function renderSubastas() {
  const list = auctionTab === 'mine' ? S.myAuctions : S.auctions.filter(a => a.seller_id !== S.userId);
  return `
    <div class="page-title">🔨 Subastas</div>
    <div class="page-subtitle">Compra y vende objetos en tiempo real con otros jugadores.</div>
    <div class="auction-tabs">
      <button class="filter-btn${auctionTab==='all'?' active':''}"  onclick="setAuctionTab('all')">📋 Activas</button>
      <button class="filter-btn${auctionTab==='mine'?' active':''}" onclick="setAuctionTab('mine')">🧾 Mis Subastas</button>
      <button class="filter-btn${auctionTab==='create'?' active':''}" onclick="setAuctionTab('create')">➕ Crear Subasta</button>
    </div>

    ${auctionTab === 'create' ? renderCreateAuction() : ''}
    ${auctionTab !== 'create' && list.length === 0 ? `
      <div class="empty-state">
        <div class="empty-icon">🔨</div>
        <h3>${auctionTab === 'mine' ? 'Sin subastas propias' : 'Sin subastas activas'}</h3>
        <p>${auctionTab === 'mine' ? 'Crea una subasta desde tu inventario.' : 'Vuelve pronto, los precios cambian.'}</p>
      </div>` : ''}

    ${auctionTab !== 'create' ? `
    <div class="auctions-list">
      ${list.map(a => renderAuctionCard(a)).join('')}
    </div>` : ''}
  `;
}

function renderAuctionCard(a) {
  const cat   = CATALOG.find(c => c.id === a.catalog_id);
  const r     = RARITIES[a.rarity];
  const cond  = CONDITIONS[a.condition];
  const isOwn = a.seller_id === S.userId;
  const isWinner = a.winner_id === S.userId;
  const currentBid = a.current_bid || a.min_bid;
  const minNext    = (a.current_bid || 0) + 1 < a.min_bid ? a.min_bid : (a.current_bid || 0) + 1;
  const endsAt = new Date(a.ends_at);

  return `
    <div class="auction-card" data-ends="${a.ends_at}">
      <div class="auction-item-info">
        <span class="auction-emoji">${cat?.emoji || '?'}</span>
        <div>
          <div class="auction-item-name">${cat?.name || a.catalog_id}${a.is_exclusive ? ' ⭐' : ''}</div>
          <div>
            <span class="badge" style="background:${r.bg};color:${r.color}">${r.name}</span>
            <span class="badge" style="background:${cond.color}20;color:${cond.color};margin-left:4px">${cond.name}</span>
          </div>
          <div style="font-size:0.78rem;color:var(--text2);margin-top:2px">
            Vendedor: ${a.seller_avatar || '🧑'} ${a.seller_name}
          </div>
        </div>
      </div>
      <div class="auction-bid-info">
        <div class="auction-current-bid">
          💰 ${fmt(a.current_bid || a.min_bid)}
          <span style="font-size:0.72rem;color:var(--text2)">${a.current_bid ? 'puja actual' : 'mínimo'}</span>
        </div>
        <div class="auction-bid-count">${a.bid_count || 0} puja${a.bid_count!==1?'s':''}</div>
        <div class="auction-countdown" data-ends="${a.ends_at}">⏳ Calculando...</div>
        ${isOwn ? `<span style="color:var(--text2);font-size:0.78rem">Tu subasta</span>` :
          isWinner ? `<span style="color:var(--success);font-size:0.78rem">🏆 Puja ganadora</span>` :
          a.status === 'active' ? `
          <button class="btn-gold btn-sm" onclick="showBidModal('${a.id}',${minNext},${currentBid})">
            💰 Pujar
          </button>` : ''}
      </div>
    </div>`;
}

function renderCreateAuction() {
  const eligible = S.inventory.filter(i => {
    const cat = CATALOG.find(c => c.id === i.catalogId);
    return i.identified && !i.forSale && !i.inAuction && !(cat && cat.category_reward);
  });
  return `
    <div class="create-auction-form">
      <h3 style="margin-bottom:12px">➕ Nueva Subasta</h3>
      ${eligible.length === 0 ? `<p style="color:var(--text2)">No tienes objetos disponibles para subastar.</p>` : `
      <div class="form-group">
        <label>Objeto a subastar</label>
        <select id="auction-item-select" class="auction-select">
          <option value="">— Selecciona un objeto —</option>
          ${eligible.map(item => {
            const cat = CATALOG.find(c => c.id === item.catalogId);
            const r   = RARITIES[item.rarity];
            return `<option value="${item.uid}">${cat.emoji} ${cat.name} (${r.name}) — 💰${fmt(item.value)}</option>`;
          }).join('')}
        </select>
      </div>
      <div class="form-group">
        <label>Precio mínimo (monedas)</label>
        <input id="auction-min-bid" type="number" class="text-input" min="1" placeholder="Ej: 500" value="100">
      </div>
      <div class="form-group">
        <label>Duración</label>
        <div class="duration-options">
          <label class="duration-opt"><input type="radio" name="dur" value="1" checked> 1 hora</label>
          <label class="duration-opt"><input type="radio" name="dur" value="6"> 6 horas</label>
          <label class="duration-opt"><input type="radio" name="dur" value="12"> 12 horas</label>
          <label class="duration-opt"><input type="radio" name="dur" value="24"> 24 horas</label>
        </div>
      </div>
      <button class="btn-gold" onclick="doCreateAuction()">🔨 Publicar Subasta</button>
      `}
    </div>`;
}

function setAuctionTab(tab) {
  auctionTab = tab;
  const el = document.getElementById('content');
  el.innerHTML = renderSubastas();
  if (tab !== 'create') startAuctionCountdown();
}

function startAuctionCountdown() {
  if (auctionCountdownInterval) clearInterval(auctionCountdownInterval);
  const update = () => {
    document.querySelectorAll('.auction-countdown[data-ends]').forEach(el => {
      const endsAt = new Date(el.dataset.ends);
      const diff   = endsAt - Date.now();
      if (diff <= 0) { el.textContent = '🔴 Terminada'; return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      el.textContent = h > 0 ? `⏳ ${h}h ${m}m` : m > 0 ? `⏳ ${m}m ${s}s` : `⏳ ${s}s`;
    });
  };
  update();
  auctionCountdownInterval = setInterval(update, 1000);
}

function showBidModal(auctionId, minBid, currentBid) {
  showModal(`
    <h3 style="margin-bottom:12px">💰 Realizar Puja</h3>
    <p style="color:var(--text2);margin-bottom:8px">Puja mínima: <strong style="color:var(--gold)">${fmt(minBid)} monedas</strong></p>
    <p style="color:var(--text2);margin-bottom:16px">Tu saldo: <strong style="color:var(--gold)">${fmt(S.money)} monedas</strong></p>
    <div class="form-group">
      <label>Tu puja</label>
      <input id="bid-amount" type="number" class="text-input" min="${minBid}" value="${minBid}" placeholder="Cantidad">
    </div>
    <div style="display:flex;gap:8px;margin-top:12px">
      <button class="btn-gold" onclick="doPlaceBid('${auctionId}',${minBid})">✅ Confirmar Puja</button>
      <button class="btn-outline" onclick="hideModal()">Cancelar</button>
    </div>
  `);
}

async function doPlaceBid(auctionId, minBid) {
  const amountEl = document.getElementById('bid-amount');
  const amount   = parseInt(amountEl?.value);
  if (!amount || amount < minBid) { toast(`La puja mínima es ${fmt(minBid)}`, 'error'); return; }
  if (amount > S.money) { toast('No tienes suficientes monedas', 'error'); return; }

  showLoading('Enviando puja...');
  try {
    await API.placeBid(auctionId, amount);
    S.money -= amount;
    renderHUD();
    hideModal();
    hideLoading();
    toast(`💰 Puja de ${fmt(amount)} registrada`, 'success');
    // Recargar subastas
    await renderSubastasAsync();
  } catch (err) {
    hideLoading();
    toast(err.message || 'Error al pujar', 'error');
  }
}

async function doCreateAuction() {
  const itemId    = document.getElementById('auction-item-select')?.value;
  const minBid    = parseInt(document.getElementById('auction-min-bid')?.value);
  const durEl     = document.querySelector('input[name="dur"]:checked');
  const duration  = durEl ? parseFloat(durEl.value) : 1;

  if (!itemId)        { toast('Selecciona un objeto', 'error'); return; }
  if (!minBid || minBid < 1) { toast('Precio mínimo inválido', 'error'); return; }

  showLoading('Creando subasta...');
  try {
    await API.createAuction(itemId, minBid, duration);
    // Marcar item como en subasta localmente
    const item = S.inventory.find(i => i.uid === itemId);
    if (item) item.inAuction = true;
    hideLoading();
    toast('🔨 ¡Subasta creada! Ya está visible para todos los jugadores.', 'success');
    auctionTab = 'mine';
    await renderSubastasAsync();
  } catch (err) {
    hideLoading();
    toast(err.message || 'Error al crear subasta', 'error');
  }
}

// ─── PANTALLA COLECCIÓN ───────────────────────────────────
function renderColeccion() {
  const total = CATALOG.length;
  const found = Object.keys(S.collection).length;
  const pct   = Math.round(found / total * 100);

  // Para el conteo de requeridos, excluir los propios category_reward y abismo
  const REQUIRED_CATALOG = CATALOG.filter(c => !c.category_reward && !c.abismo);
  const CAT_REWARD_IDS = {};
  CATALOG.filter(c => c.category_reward).forEach(c => { CAT_REWARD_IDS[c.category] = c.id; });

  const byCategory = {};
  Object.keys(CATEGORIES).forEach(k => {
    const catItems  = REQUIRED_CATALOG.filter(c => c.category === k);
    const foundCnt  = catItems.filter(c => S.collection[c.id]).length;
    const rewardId  = CAT_REWARD_IDS[k];
    const completed = foundCnt === catItems.length && catItems.length > 0;
    const rewardOwned = rewardId && !!S.collection[rewardId];
    byCategory[k]  = { total: catItems.length, found: foundCnt, completed, rewardOwned, rewardId };
  });

  return `
    <div class="page-title">📊 Colección</div>
    <div class="page-subtitle">Completa cada categoría para desbloquear un objeto exclusivo único.</div>
    <div class="collection-progress">
      <h3>Progreso Total</h3>
      <div class="big-progress">
        <div class="big-progress-bar"><div class="big-progress-fill" style="width:${pct}%"></div></div>
        <div class="big-progress-text">${found} / ${total} objetos — ${pct}%</div>
      </div>
    </div>
    <div class="section-title">Por Categoría</div>
    <div class="cat-grid">
      ${Object.entries(byCategory).map(([k,v]) => {
        const cat       = CATEGORIES[k];
        const p         = Math.round(v.found / v.total * 100);
        const rewardCat = v.rewardId ? CATALOG.find(c => c.id === v.rewardId) : null;
        const r         = rewardCat ? RARITIES[rewardCat.rarity] : null;

        // Mini-tarjeta del objeto de recompensa
        const miniCard = rewardCat && r ? `
          <div style="display:flex;align-items:center;gap:8px;margin-top:10px;
               background:${v.rewardOwned ? r.bg : 'rgba(255,255,255,0.04)'};
               border:1.5px solid ${v.rewardOwned ? r.color : 'rgba(255,255,255,0.12)'};
               border-radius:10px;padding:7px 10px;opacity:${v.rewardOwned ? '1' : '0.72'}">
            <span style="font-size:1.5rem;line-height:1">${rewardCat.emoji}</span>
            <div style="flex:1;min-width:0">
              <div style="font-size:0.75rem;font-weight:700;color:${v.rewardOwned ? r.color : '#ccc'};
                   white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
                ${rewardCat.name}
              </div>
              <div style="display:flex;align-items:center;gap:5px;margin-top:2px">
                <span style="font-size:0.65rem;background:${r.bg};color:${r.color};
                     border:1px solid ${r.color};border-radius:4px;padding:1px 5px;font-weight:600">
                  ${r.name}
                </span>
                <span style="font-size:0.65rem;color:#aaa">💰 ${fmt(rewardCat.baseValue)}</span>
              </div>
            </div>
            ${v.rewardOwned
              ? `<span style="font-size:1rem;color:#e91e63" title="Ya obtenido">🏆</span>`
              : `<span style="font-size:0.85rem;color:#666" title="Completa el catálogo para obtenerlo">🔒</span>`
            }
          </div>` : '';

        return `<div class="cat-card" style="${v.rewardOwned ? 'border-color:#e91e63;box-shadow:0 0 8px rgba(233,30,99,0.3)' : ''}">
          <div style="display:flex;align-items:center;gap:6px">
            <span class="cat-icon" style="font-size:1.4rem">${cat.icon}</span>
            <div class="cat-name" style="flex:1">${cat.name}</div>
            <span style="font-size:0.7rem;color:#aaa">${v.found}/${v.total}</span>
          </div>
          <div class="cat-prog-bar" style="margin:6px 0 2px">
            <div class="cat-prog-fill" style="width:${p}%;background:${cat.color}"></div>
          </div>
          <div class="cat-count">${p}%${v.completed && !v.rewardOwned ? ' · <span style="color:#ff9800;font-weight:700">¡Completo!</span>' : ''}</div>
          ${miniCard}
        </div>`;
      }).join('')}
    </div>
    <div class="section-title">Estadísticas</div>
    <div class="hub-grid">
      <div class="stat-card"><div class="stat-icon">💼</div><div class="stat-val">${S.stats.sold}</div><div class="stat-label">Ventas</div></div>
      <div class="stat-card"><div class="stat-icon">🔧</div><div class="stat-val">${S.stats.repaired}</div><div class="stat-label">Reparaciones</div></div>
      <div class="stat-card"><div class="stat-icon">🏭</div><div class="stat-val">${S.stats.bodegas}</div><div class="stat-label">Bodegas abiertas</div></div>
      <div class="stat-card"><div class="stat-icon">🃏</div><div class="stat-val">${S.stats.bj_wins}</div><div class="stat-label">Victorias cartas</div></div>
      <div class="stat-card"><div class="stat-icon">💰</div><div class="stat-val">${fmt(S.stats.total_earned)}</div><div class="stat-label">Total ganado</div></div>
      <div class="stat-card"><div class="stat-icon">🏆</div><div class="stat-val">${S.stats.bj_best_streak}</div><div class="stat-label">Mejor racha cartas</div></div>
    </div>
    <div class="section-title">Logros (${S.unlockedAch.length}/20)</div>
    <div class="achievements-grid">
      ${ACHIEVEMENTS.map(a => `
        <div class="ach-card ${S.unlockedAch.includes(a.id) ? 'unlocked' : ''}">
          <div class="ach-icon">${a.icon}</div>
          <div class="ach-name">${a.name}</div>
          <div class="ach-desc">${a.desc}</div>
          ${TITLES_MAP[a.id] ? `<div style="margin-top:5px;font-size:0.7rem;color:#ff2222;font-weight:700;font-style:italic;text-shadow:0 0 5px #ff0000aa">🎖️ "${TITLES_MAP[a.id]}"</div>` : ''}
        </div>`).join('')}
    </div>
    <div class="section-title">🎖️ Títulos</div>
    <div id="titles-section"><div style="color:var(--text2);font-size:0.85rem">Cargando títulos...</div></div>
  `;
}

async function renderTitlesSection() {
  const el = document.getElementById('titles-section');
  if (!el) return;
  try {
    const data = await API.getMyTitles();
    console.log('titles data:', data);
    const titles = data?.titles || [];
    const equipped = data?.equipped || null;
    if (titles.length === 0) {
      el.innerHTML = `<p style="color:var(--text2);font-size:0.85rem">Completa logros especiales para desbloquear títulos.</p>`;
      return;
    }
    el.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:10px">
        ${titles.map(tid => {
          const titleText = TITLES_MAP[tid] || tid;
          const isEquipped = equipped === tid;
          return `
            <div style="display:flex;align-items:center;justify-content:space-between;
                 background:${isEquipped ? 'rgba(255,215,0,0.12)' : 'var(--card-bg)'};
                 border:1.5px solid ${isEquipped ? 'var(--gold)' : 'var(--border)'};
                 border-radius:10px;padding:10px 14px;gap:10px">
              <div>
                <div style="font-weight:700;color:${isEquipped ? 'var(--gold)' : 'var(--text1)'}">🎖️ ${titleText}</div>
                <div style="font-size:0.75rem;color:var(--text2);margin-top:2px">${isEquipped ? '✓ Equipado actualmente' : ''}</div>
              </div>
              ${isEquipped
                ? `<button class="btn-outline btn-sm" onclick="doUnequipTitle()">Desequipar</button>`
                : `<button class="btn-gold btn-sm" onclick="doEquipTitle('${tid}')">Equipar</button>`
              }
            </div>`;
        }).join('')}
      </div>`;
  } catch (err) {
    console.error('renderTitlesSection error:', err);
    el.innerHTML = `<p style="color:var(--error);font-size:0.85rem">Error: ${err.message || 'No se pudieron cargar los títulos.'}</p>`;
  }
}

async function doEquipTitle(titleId) {
  try {
    await API.equipTitle(titleId);
    S.equippedTitle = titleId;
    renderHUD();
    await renderTitlesSection();
    toast('🎖️ Título equipado', 'success');
  } catch (err) {
    toast(err.message || 'Error al equipar título', 'error');
  }
}

async function doUnequipTitle() {
  try {
    await API.equipTitle(null);
    S.equippedTitle = null;
    renderHUD();
    await renderTitlesSection();
    toast('Título desequipado', 'info');
  } catch (err) {
    toast(err.message || 'Error al desequipar título', 'error');
  }
}

// ─── PANTALLA BLACKJACK ───────────────────────────────────
function renderBlackjack() {
  const el = document.getElementById('content');
  const bj = S.bj;
  const pv = bj.playerHand.length ? handValue(bj.playerHand) : 0;
  const dv = bj.dealerHand.length ? handValue(bj.dealerHand) : 0;
  const isPlaying = bj.state === 'playing';
  const isEnded   = bj.state === 'ended';

  const renderCards = (hand, hideSecond = false) => hand.map((c, i) => {
    if (hideSecond && i === 1) return `<div class="bj-card facedown">🂠</div>`;
    return `<div class="bj-card ${isRed(c) ? 'red' : 'black'}">
      <span>${c.face}</span><span class="bj-suit">${c.suit}</span>
    </div>`;
  }).join('');

  let resultHtml = '';
  if (isEnded && bj.result) {
    const r = bj.result;
    if (r.outcome === 'win')  resultHtml = `<div class="bj-result win">🏆 ¡GANASTE! +${fmt(r.amount)} monedas${r.mult>1?' (x'+r.mult.toFixed(2)+')':''}</div>`;
    else if (r.outcome === 'push') resultHtml = `<div class="bj-result push">🤝 EMPATE — Apuesta devuelta</div>`;
    else resultHtml = `<div class="bj-result lose">💀 PERDISTE — ${fmt(r.amount)} monedas</div>`;
  }

  el.innerHTML = `
    <div class="page-title">🃏 Mesa de Cartas</div>
    <div class="page-subtitle">Blackjack — Acércate a 21 sin pasarte. As = 1 u 11.</div>
    <div class="bj-table">
      <div class="bj-score-row">
        <span class="bj-score-badge">💰 ${fmt(S.money)}</span>
        <span class="bj-streak">${bj.streak > 0 ? '🔥 Racha: ' + bj.streak : ''}</span>
        <span class="bj-score-badge">W: ${S.stats.bj_wins} | L: ${S.stats.bj_losses}</span>
      </div>
      <div>
        <div class="bj-hand-label">Crupier ${isEnded ? '(' + dv + ')' : ''}</div>
        <div class="bj-cards">
          ${bj.dealerHand.length ? renderCards(bj.dealerHand, isPlaying) : '<span style="color:#7fbf7f;font-size:0.85rem">Esperando...</span>'}
        </div>
      </div>
      <hr class="bj-divider">
      <div>
        <div class="bj-hand-label">Tus cartas ${bj.playerHand.length ? '(' + pv + ')' : ''}</div>
        <div class="bj-cards">
          ${bj.playerHand.length ? renderCards(bj.playerHand) : '<span style="color:#7fbf7f;font-size:0.85rem">Esperando...</span>'}
        </div>
      </div>
      ${resultHtml}
      <div>
        ${!isPlaying ? `
          <div class="bj-bet-row">
            <span class="bj-bet-label">Apuesta: <strong style="color:var(--gold)">${fmt(bj.bet)}</strong></span>
            <div class="bj-bet-chips">
              <div class="bj-chip chip-10"    onclick="bjSetBet(S.bj.bet+10)">+10</div>
              <div class="bj-chip chip-25"    onclick="bjSetBet(S.bj.bet+25)">+25</div>
              <div class="bj-chip chip-50"    onclick="bjSetBet(S.bj.bet+50)">+50</div>
              <div class="bj-chip chip-100"   onclick="bjSetBet(S.bj.bet+100)">+100</div>
              <div class="bj-chip chip-1000"  onclick="bjSetBet(S.bj.bet+1000)">+1K</div>
              <div class="bj-chip chip-10000" onclick="bjSetBet(S.bj.bet+10000)">+10K</div>
            </div>
            <button class="btn-outline btn-sm" onclick="bjSetBet(10)">Reset</button>
          </div>
          <div class="bj-controls">
            <button class="btn-gold" onclick="bjStart()" ${S.money < bj.bet ? 'disabled' : ''}>
              🃏 ${isEnded ? 'Nueva Partida' : 'Repartir'}
            </button>
          </div>
        ` : `
          <div class="bj-controls">
            <button class="btn-primary" onclick="bjHit()">➕ Pedir Carta</button>
            <button class="btn-gold"    onclick="bjStand()">✋ Plantarse (${pv})</button>
          </div>
        `}
      </div>
      <div class="bj-stats-row">
        <span>Mejor racha: ${S.stats.bj_best_streak}</span>
      </div>
    </div>
  `;
}

// ─── PANTALLA POKER (BODEGAPOKER) ────────────────────────

const POKER_BLINDS = [
  { name:'Small Blind', emoji:'🟡', target:300  },
  { name:'Big Blind',   emoji:'🟠', target:800  },
  { name:'Boss Blind',  emoji:'💀', target:2000 },
];
const POKER_BOSS_EFFECTS = [
  { id:'no_figures',  desc:'Las figuras (J, Q, K) valen 0 chips' },
  { id:'max_2_cards', desc:'Solo puedes jugar máximo 2 cartas' },
  { id:'one_discard', desc:'Solo tienes 1 descarte total' },
];

function buildPokerDeck() {
  const suits = ['♠','♥','♦','♣'];
  const faces = ['2','3','4','5','6','7','8','9','10','J','Q','K','A'];
  const deck  = [];
  for (const s of suits) for (const f of faces) {
    // value: valor numérico real para detectar escaleras (A=14 alto, A=1 bajo se maneja en evaluación)
    const value = f==='A'?14 : f==='K'?13 : f==='Q'?12 : f==='J'?11 : parseInt(f);
    deck.push({ suit:s, face:f, value, red: s==='♥'||s==='♦' });
  }
  for (let i=deck.length-1;i>0;i--) { const j=Math.floor(Math.random()*(i+1)); [deck[i],deck[j]]=[deck[j],deck[i]]; }
  return deck;
}

function cardChips(card, bossEffect) {
  if (bossEffect === 'no_figures' && ['J','Q','K'].includes(card.face)) return 0;
  if (card.face === 'A') return 11;
  if (['J','Q','K'].includes(card.face)) return 10;
  return parseInt(card.face);
}

function evaluatePokerHand(cards) {
  const n = cards.length;
  if (n === 0) return { name:'Sin cartas', chips:0, mult:1 };
  if (n === 1) return { name:'Carta Alta', chips:5, mult:1 };

  const faces = cards.map(c => c.face);
  const suits = cards.map(c => c.suit);
  const vals  = cards.map(c => c.value).sort((a,b) => a-b);

  const faceCount = {};
  faces.forEach(f => faceCount[f] = (faceCount[f]||0)+1);
  const counts = Object.values(faceCount).sort((a,b) => b-a);

  const isFlush = n === 5 && new Set(suits).size === 1;

  // Escalera normal (5 valores únicos consecutivos)
  const uniqueVals = [...new Set(vals)];
  let isStraight = false;
  if (n === 5 && uniqueVals.length === 5) {
    // Escalera alta: 10-J-Q-K-A (10,11,12,13,14)
    // Escalera baja: A-2-3-4-5 → tratar As como 1
    const highStraight = vals[4] - vals[0] === 4;
    const aceLowVals   = vals[0] === 14 ? [1, ...vals.slice(1)].sort((a,b)=>a-b) : null;
    const lowStraight  = aceLowVals && aceLowVals[4] - aceLowVals[0] === 4;
    isStraight = highStraight || lowStraight;
  }

  // Escalera Real: 10-J-Q-K-A del mismo palo
  const isRoyal = isFlush && isStraight && vals[0] === 10 && vals[4] === 14;

  if (isFlush && isStraight) {
    return isRoyal
      ? { name:'Escalera Real',     chips:200, mult:8, isRoyalFlush:true }
      : { name:'Escalera de Color', chips:200, mult:8 };
  }
  if (n >= 4 && counts[0] === 4)                    return { name:'Póker',      chips:120, mult:7 };
  if (n === 5 && counts[0] === 3 && counts[1] === 2) return { name:'Full House', chips:90,  mult:4 };
  if (isFlush)                                       return { name:'Color',      chips:80,  mult:4 };
  if (isStraight)                                    return { name:'Escalera',   chips:80,  mult:4 };
  if (counts[0] === 3)                               return { name:'Trío',       chips:50,  mult:3 };
  if (counts[0] === 2 && counts[1] === 2)            return { name:'Doble Par',  chips:30,  mult:2 };
  if (counts[0] === 2)                               return { name:'Par',        chips:20,  mult:2 };
  return { name:'Carta Alta', chips:5, mult:1 };
}

function pokerStart() {
  const pk = S.poker;
  if (pk.bet > S.money) { toast('💸 No tienes suficiente dinero', 'error'); return; }
  S.money -= pk.bet;
  pk.blind      = 0;
  pk.score      = 0;
  pk.bossEffect = POKER_BOSS_EFFECTS[Math.floor(Math.random()*POKER_BOSS_EFFECTS.length)];
  pk.result     = null;
  pk.hadRoyalFlush = false;
  pk.state      = 'playing';
  pokerStartBlind();
}

function pokerStartBlind() {
  const pk  = S.poker;
  pk.deck   = buildPokerDeck();
  pk.hand   = [pk.deck.pop(),pk.deck.pop(),pk.deck.pop(),pk.deck.pop(),
               pk.deck.pop(),pk.deck.pop(),pk.deck.pop(),pk.deck.pop()];
  pk.selected     = [];
  pk.playsLeft    = 4;
  pk.discardsLeft = pk.blind === 2 && pk.bossEffect.id === 'one_discard' ? 1 : 3;
  pk.score        = 0;
  renderPoker();
}

function pokerToggleCard(idx) {
  const pk   = S.poker;
  const maxSel = pk.blind === 2 && pk.bossEffect.id === 'max_2_cards' ? 2 : 5;
  if (pk.selected.includes(idx)) {
    pk.selected = pk.selected.filter(i => i !== idx);
  } else if (pk.selected.length < maxSel) {
    pk.selected.push(idx);
  }
  renderPoker();
}

function pokerPlay() {
  const pk = S.poker;
  if (pk.state !== 'playing' || pk.playsLeft <= 0 || pk.selected.length === 0) return;

  const playedCards = pk.selected.map(i => pk.hand[i]);
  const handResult  = evaluatePokerHand(playedCards);
  const chipSum     = playedCards.reduce((s,c) => s + cardChips(c, pk.bossEffect.id), 0);
  const points      = (handResult.chips + chipSum) * handResult.mult;
  pk.score         += points;
  pk.playsLeft--;

  // Track royal flush
  if (handResult.isRoyalFlush) pk.hadRoyalFlush = true;

  // Remove played cards and draw new ones
  pk.hand = pk.hand.filter((_,i) => !pk.selected.includes(i));
  while (pk.hand.length < 8 && pk.deck.length > 0) pk.hand.push(pk.deck.pop());
  pk.selected = [];

  const blind = POKER_BLINDS[pk.blind];

  // Show what hand was played
  toast(`${handResult.name} — +${Math.round(points)} pts`, 'success');

  if (pk.score >= blind.target) {
    // Blind won!
    if (pk.blind === 2) {
      // Won the whole game!
      const prize = pk.bet * 3;
      S.money += pk.bet + prize;
      pk.state  = 'game_won';
      pk.result = { outcome:'win', earned: prize };
      renderHUD();
      API.savePoker('win', pk.bet, 3, pk.hadRoyalFlush).then(res => applyLevelUpResult(res)).catch(()=>{});
    } else {
      pk.blind++;
      pk.state = 'blind_won';
    }
  } else if (pk.playsLeft === 0) {
    // Out of plays — blind lost
    pk.state  = 'blind_lost';
    pk.result = { outcome:'lose' };
    API.savePoker('lose', pk.bet, pk.blind).catch(()=>{});
  }

  renderPoker();
}

function pokerDiscard() {
  const pk = S.poker;
  if (pk.state !== 'playing' || pk.discardsLeft <= 0 || pk.selected.length === 0) return;
  pk.hand = pk.hand.filter((_,i) => !pk.selected.includes(i));
  while (pk.hand.length < 8 && pk.deck.length > 0) pk.hand.push(pk.deck.pop());
  pk.selected = [];
  pk.discardsLeft--;
  renderPoker();
}

function pokerNextBlind() {
  S.poker.state = 'playing';
  pokerStartBlind();
}

function pokerSetBet(amount) {
  S.poker.bet = Math.max(100, Math.min(amount, S.money));
  renderPoker();
}

function pokerReset() {
  S.poker.state = 'idle';
  renderPoker();
}

function pokerHelp() {
  showModal(`
    <div style="max-height:80vh;overflow-y:auto;padding:4px">
      <h2 style="text-align:center;color:var(--gold);margin:0 0 16px">🎴 Cómo jugar BodegaPoker</h2>

      <div style="background:rgba(255,255,255,0.05);border-radius:12px;padding:14px;margin-bottom:14px">
        <div style="font-weight:700;color:var(--text1);margin-bottom:8px">🎯 Objetivo</div>
        <div style="font-size:0.85rem;color:var(--text2);line-height:1.6">
          Supera los <strong style="color:white">3 Blinds</strong> acumulando puntos con manos de póker.
          Si ganas los 3, recibes <strong style="color:var(--gold)">×4 tu apuesta</strong>. Si fallas uno, pierdes todo.
        </div>
      </div>

      <div style="background:rgba(255,255,255,0.05);border-radius:12px;padding:14px;margin-bottom:14px">
        <div style="font-weight:700;color:var(--text1);margin-bottom:10px">🃏 Cómo se juega</div>
        <div style="font-size:0.85rem;color:var(--text2);line-height:1.8">
          1. Tienes <strong style="color:white">8 cartas</strong> en mano.<br>
          2. <strong style="color:white">Toca</strong> las cartas que quieras seleccionar (hasta 5).<br>
          3. Pulsa <strong style="color:var(--gold)">▶ Jugar</strong> para puntuar con esa mano.<br>
          4. O pulsa <strong style="color:#90caf9">♻️ Descartar</strong> para cambiar cartas sin puntuar.<br>
          5. Tienes <strong style="color:white">4 jugadas</strong> y <strong style="color:white">3 descartes</strong> por blind.
        </div>
      </div>

      <div style="background:rgba(255,255,255,0.05);border-radius:12px;padding:14px;margin-bottom:14px">
        <div style="font-weight:700;color:var(--text1);margin-bottom:10px">📊 Cómo se calculan los puntos</div>
        <div style="font-size:0.82rem;color:var(--text2);line-height:1.6">
          <strong style="color:white">Puntos = (Chips base de la mano + Chips de tus cartas) × Multiplicador</strong><br><br>
          Chips de las cartas: 2-9 = su número · 10/J/Q/K = 10 · As = 11
        </div>
      </div>

      <div style="background:rgba(255,255,255,0.05);border-radius:12px;padding:14px;margin-bottom:14px">
        <div style="font-weight:700;color:var(--text1);margin-bottom:10px">🏆 Manos (de menor a mayor)</div>
        <div style="display:grid;gap:6px;font-size:0.82rem">
          ${[
            ['Carta Alta',       '5 chips',  '×1',  '#9e9e9e'],
            ['Par',              '20 chips', '×2',  '#2196f3'],
            ['Doble Par',        '30 chips', '×2',  '#2196f3'],
            ['Trío',             '50 chips', '×3',  '#9c27b0'],
            ['Escalera',         '80 chips', '×4',  '#ff9800'],
            ['Color',            '80 chips', '×4',  '#ff9800'],
            ['Full House',       '90 chips', '×4',  '#ff9800'],
            ['Póker',           '120 chips', '×7',  '#f44336'],
            ['Escalera de Color','200 chips','×8',  '#e91e63'],
            ['Escalera Real',   '200 chips', '×8',  '#ffd700'],
          ].map(([name, chips, mult, color]) => `
            <div style="display:flex;align-items:center;justify-content:space-between;
                 background:rgba(255,255,255,0.03);border-radius:8px;padding:6px 10px;
                 border-left:3px solid ${color}">
              <span style="color:${color};font-weight:600">${name}</span>
              <span style="color:var(--text2)">${chips} <strong style="color:white">${mult}</strong></span>
            </div>`).join('')}
        </div>
      </div>

      <div style="background:rgba(255,152,0,0.1);border:1px solid rgba(255,152,0,0.3);border-radius:12px;padding:14px;margin-bottom:14px">
        <div style="font-weight:700;color:#ff9800;margin-bottom:8px">💀 Boss Blind</div>
        <div style="font-size:0.82rem;color:var(--text2);line-height:1.6">
          El tercer blind siempre tiene un <strong style="color:#ff9800">efecto especial aleatorio</strong>:<br>
          • <strong style="color:white">J, Q, K valen 0 chips</strong> (pero siguen formando manos)<br>
          • <strong style="color:white">Máximo 2 cartas</strong> por jugada<br>
          • <strong style="color:white">Solo 1 descarte</strong> total
        </div>
      </div>

      <button class="btn-gold" style="width:100%;padding:12px" onclick="hideModal()">¡Entendido!</button>
    </div>
  `);
}

function renderPoker() {
  const el = document.getElementById('content');
  const pk = S.poker;

  const helpBtn = `<button onclick="pokerHelp()" style="
    background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);
    color:var(--text2);border-radius:8px;padding:5px 12px;font-size:0.8rem;cursor:pointer;
    float:right;margin-top:-4px">❓ Ayuda</button>`;

  // ── IDLE ──────────────────────────────────────────────────
  if (pk.state === 'idle') {
    el.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
        <div class="page-title" style="margin:0">🎴 BodegaPoker</div>
        ${helpBtn}
      </div>
      <div class="page-subtitle">Supera los 3 Blinds para ganar ×4 tu apuesta.</div>

      <!-- Blinds -->
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:16px">
        ${POKER_BLINDS.map((b,i) => `
          <div style="background:var(--card);border-radius:14px;padding:16px 12px;text-align:center;
               border:1px solid ${i===2?'rgba(255,152,0,0.3)':'rgba(255,255,255,0.07)'}">
            <div style="font-size:2rem;margin-bottom:6px">${b.emoji}</div>
            <div style="font-weight:700;font-size:0.9rem;color:var(--text1)">${b.name}</div>
            <div style="font-size:1.1rem;font-weight:700;color:var(--gold);margin:6px 0">${b.target.toLocaleString()}</div>
            <div style="font-size:0.7rem;color:var(--text2)">puntos</div>
            ${i===2?`<div style="font-size:0.65rem;color:#ff9800;margin-top:6px;font-weight:600">⚠️ Efecto especial</div>`:''}
          </div>`).join('')}
      </div>

      <!-- Apuesta -->
      <div style="background:var(--card);border-radius:14px;padding:18px;margin-bottom:16px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">
          <h3 style="margin:0;color:var(--text1)">💰 Tu Apuesta</h3>
          <div style="font-size:0.75rem;color:var(--text2)">Premio si ganas: <strong style="color:var(--gold)">${fmt(pk.bet * 4)}</strong></div>
        </div>
        <div style="font-size:2.2rem;font-weight:700;color:var(--gold);text-align:center;margin:10px 0;
             background:rgba(255,193,7,0.08);border-radius:10px;padding:12px">
          ${fmt(pk.bet)} 💰
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center;margin:12px 0">
          <div class="bj-chip chip-10"    onclick="pokerSetBet(S.poker.bet+100)">+100</div>
          <div class="bj-chip chip-25"    onclick="pokerSetBet(S.poker.bet+250)">+250</div>
          <div class="bj-chip chip-50"    onclick="pokerSetBet(S.poker.bet+500)">+500</div>
          <div class="bj-chip chip-100"   onclick="pokerSetBet(S.poker.bet+1000)">+1K</div>
          <div class="bj-chip chip-1000"  onclick="pokerSetBet(S.poker.bet+5000)">+5K</div>
          <div class="bj-chip chip-10000" onclick="pokerSetBet(S.poker.bet+10000)">+10K</div>
          <div class="bj-chip chip-10"    onclick="pokerSetBet(100)" style="background:#444;color:#ccc">↺</div>
        </div>
        <div style="font-size:0.75rem;color:var(--text2);text-align:center">
          Apuesta mínima: 100 · Disponible: <strong style="color:white">${fmt(S.money)}</strong>
        </div>
      </div>

      <button class="btn-gold" style="width:100%;padding:16px;font-size:1.05rem;font-weight:700"
        onclick="pokerStart()" ${S.money < pk.bet ? 'disabled' : ''}>
        🎴 Comenzar Partida
      </button>
      ${S.money < pk.bet ? `<div style="text-align:center;color:var(--danger);font-size:0.8rem;margin-top:8px">Sin fondos suficientes</div>` : ''}
    `;
    return;
  }

  // ── BLIND WON ─────────────────────────────────────────────
  if (pk.state === 'blind_won') {
    const nextBlind = POKER_BLINDS[pk.blind];
    el.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
        <div class="page-title" style="margin:0">🎴 BodegaPoker</div>
        ${helpBtn}
      </div>
      <div style="text-align:center;padding:30px 20px">
        <div style="font-size:5rem;margin-bottom:10px">✅</div>
        <h2 style="color:#4caf50;margin:0 0 8px;font-size:1.6rem">¡Blind Superado!</h2>
        <p style="color:var(--text2);margin:0 0 24px">Sigues en pie. Prepárate para el siguiente.</p>
        <div style="background:var(--card);border-radius:14px;padding:20px;margin-bottom:20px;
             border:1px solid ${pk.blind===2?'rgba(255,152,0,0.4)':'rgba(255,255,255,0.1)'}">
          <div style="font-size:2.5rem">${nextBlind.emoji}</div>
          <div style="font-size:1.2rem;font-weight:700;color:var(--text1);margin:8px 0">${nextBlind.name}</div>
          <div style="font-size:1.6rem;font-weight:700;color:var(--gold)">${nextBlind.target.toLocaleString()} pts</div>
          ${pk.blind === 2 ? `
            <div style="margin-top:12px;background:rgba(255,152,0,0.1);border-radius:8px;padding:10px;
                 font-size:0.82rem;color:#ff9800">
              ⚠️ <strong>Efecto Boss:</strong> ${pk.bossEffect.desc}
            </div>` : ''}
        </div>
        <button class="btn-gold" style="width:100%;padding:16px;font-size:1rem;font-weight:700" onclick="pokerNextBlind()">
          ${nextBlind.emoji} ¡Al ${nextBlind.name}!
        </button>
      </div>
    `;
    return;
  }

  // ── BLIND LOST ────────────────────────────────────────────
  if (pk.state === 'blind_lost') {
    el.innerHTML = `
      <div class="page-title">🎴 BodegaPoker</div>
      <div style="text-align:center;padding:30px 20px">
        <div style="font-size:5rem;margin-bottom:10px">💀</div>
        <h2 style="color:var(--danger);margin:0 0 8px;font-size:1.6rem">¡Fallaste el Blind!</h2>
        <p style="color:var(--text2);margin:0 0 20px">No alcanzaste el objetivo. Perdiste tu apuesta.</p>
        <div style="background:rgba(244,67,54,0.1);border:1px solid rgba(244,67,54,0.3);
             border-radius:14px;padding:20px;margin-bottom:20px;font-size:2rem;font-weight:700;color:var(--danger)">
          −${fmt(pk.bet)} 💰
        </div>
        <button class="btn-gold" style="width:100%;padding:16px;font-weight:700" onclick="pokerReset()">🔄 Nueva Partida</button>
      </div>
    `;
    return;
  }

  // ── GAME WON ──────────────────────────────────────────────
  if (pk.state === 'game_won') {
    el.innerHTML = `
      <div class="page-title">🎴 BodegaPoker</div>
      <div style="text-align:center;padding:30px 20px">
        <div style="font-size:5rem;margin-bottom:10px">🏆</div>
        <h2 style="color:var(--gold);margin:0 0 8px;font-size:1.6rem">¡Victoria Total!</h2>
        <p style="color:var(--text2);margin:0 0 20px">Superaste los 3 blinds. ¡Eres un maestro!</p>
        <div style="background:rgba(255,193,7,0.1);border:1px solid rgba(255,193,7,0.3);
             border-radius:14px;padding:24px;margin-bottom:20px">
          <div style="font-size:0.85rem;color:var(--text2);margin-bottom:4px">Ganancia neta</div>
          <div style="font-size:2.4rem;font-weight:700;color:var(--gold)">+${fmt(pk.result.earned)} 💰</div>
        </div>
        <button class="btn-gold" style="width:100%;padding:16px;font-weight:700" onclick="pokerReset()">🎴 Nueva Partida</button>
      </div>
    `;
    return;
  }

  // ── PLAYING ───────────────────────────────────────────────
  const blind      = POKER_BLINDS[pk.blind];
  const pct        = Math.min(100, Math.round(pk.score / blind.target * 100));
  const isBoss     = pk.blind === 2;
  const maxSel     = isBoss && pk.bossEffect.id === 'max_2_cards' ? 2 : 5;
  const bossEff    = isBoss ? pk.bossEffect.id : null;

  const selCards     = pk.selected.map(i => pk.hand[i]);
  const preview      = selCards.length > 0 ? evaluatePokerHand(selCards) : null;
  const previewChips = selCards.reduce((s,c) => s + cardChips(c, bossEff), 0);
  const previewScore = preview ? (preview.chips + previewChips) * preview.mult : 0;

  const suitColor = s => (s==='♥'||s==='♦') ? '#e53935' : '#1a1a2e';

  el.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
      <div class="page-title" style="margin:0">🎴 BodegaPoker</div>
      ${helpBtn}
    </div>

    <div style="background:radial-gradient(ellipse at center,#1a4a2a 0%,#0d2e18 100%);
         border:3px solid #2a6a3a;border-radius:24px;padding:18px;display:flex;flex-direction:column;gap:12px">

    <!-- Blind progress bar -->
    <div style="background:rgba(0,0,0,0.35);border-radius:14px;padding:14px 16px">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
        <div>
          <span style="font-size:1.1rem;font-weight:700">${blind.emoji} ${blind.name}</span>
          ${isBoss?`<span style="font-size:0.72rem;color:#ff9800;font-weight:600;margin-left:8px">⚠️ ${pk.bossEffect.desc}</span>`:''}
        </div>
        <span style="font-size:1rem;color:var(--gold);font-weight:700">${Math.round(pk.score).toLocaleString()} / ${blind.target.toLocaleString()}</span>
      </div>
      <div style="background:rgba(255,255,255,0.08);border-radius:8px;height:14px;overflow:hidden;margin-bottom:10px">
        <div style="width:${pct}%;height:100%;border-radius:8px;transition:width 0.4s;
             background:${pct>=100?'#4caf50':pct>60?'#ff9800':'#2196f3'}"></div>
      </div>
      <div style="display:flex;justify-content:space-around;font-size:0.82rem">
        <div style="text-align:center">
          <div style="color:#7fbf7f">Jugadas</div>
          <div style="font-size:1.3rem;font-weight:700;color:${pk.playsLeft<=1?'#f44336':'#fff'}">${pk.playsLeft}</div>
        </div>
        <div style="width:1px;background:rgba(255,255,255,0.15)"></div>
        <div style="text-align:center">
          <div style="color:#7fbf7f">Descartes</div>
          <div style="font-size:1.3rem;font-weight:700;color:${pk.discardsLeft===0?'#f44336':'#fff'}">${pk.discardsLeft}</div>
        </div>
        <div style="width:1px;background:rgba(255,255,255,0.15)"></div>
        <div style="text-align:center">
          <div style="color:#7fbf7f">Seleccionadas</div>
          <div style="font-size:1.3rem;font-weight:700;color:var(--gold)">${pk.selected.length} / ${maxSel}</div>
        </div>
      </div>
    </div>

    <!-- Hand preview -->
    <div style="min-height:52px;border-radius:12px;padding:10px 16px;
         display:flex;align-items:center;justify-content:space-between;
         background:${preview?'rgba(255,152,0,0.18)':'rgba(0,0,0,0.2)'};
         border:1px solid ${preview?'rgba(255,152,0,0.5)':'rgba(255,255,255,0.08)'}">
      ${preview ? `
        <div>
          <div style="font-size:1rem;font-weight:700;color:#ffb300">${preview.name}</div>
          <div style="font-size:0.75rem;color:#7fbf7f">(${preview.chips} + ${previewChips}) × ${preview.mult}</div>
        </div>
        <div style="text-align:right">
          <div style="font-size:1.3rem;font-weight:700;color:var(--gold)">+${previewScore}</div>
          <div style="font-size:0.7rem;color:#7fbf7f">puntos</div>
        </div>
      ` : `
        <span style="color:#7fbf7f;font-size:0.85rem;width:100%;text-align:center">
          Toca las cartas que quieras jugar (máx. ${maxSel})
        </span>
      `}
    </div>

    <!-- Cards: 4 arriba + 4 abajo -->
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px">
      ${pk.hand.map((c,i) => {
        const sel     = pk.selected.includes(i);
        const cc      = cardChips(c, bossEff);
        const dimmed  = bossEff==='no_figures' && ['J','Q','K'].includes(c.face);
        return `
        <div onclick="pokerToggleCard(${i})" style="
          background:${sel?'#fffde7':'#ffffff'};
          border:3px solid ${sel?'#ffc107':'#ddd'};
          border-radius:12px;padding:8px;cursor:pointer;
          transform:${sel?'translateY(-8px) scale(1.04)':'none'};
          transition:all 0.15s ease;
          box-shadow:${sel?'0 8px 20px rgba(255,193,7,0.4)':'0 2px 6px rgba(0,0,0,0.4)'};
          opacity:${dimmed?'0.45':'1'};
          min-height:260px;display:flex;flex-direction:column;align-items:center;justify-content:space-between;
          position:relative">
          <!-- Esquina superior izquierda -->
          <div style="align-self:flex-start;font-size:0.85rem;font-weight:700;
               color:${c.red?'#e53935':'#1a1a2e'};line-height:1;text-align:left">
            ${c.face}<br><span style="font-size:0.75rem">${c.suit}</span>
          </div>
          <!-- Palo central -->
          <div style="font-size:2.4rem;line-height:1;color:${c.red?'#e53935':'#1a1a2e'}">${c.suit}</div>
          <!-- Esquina inferior derecha (girado) -->
          <div style="align-self:flex-end;font-size:0.85rem;font-weight:700;
               color:${c.red?'#e53935':'#1a1a2e'};line-height:1;text-align:right;
               transform:rotate(180deg)">
            ${c.face}<br><span style="font-size:0.75rem">${c.suit}</span>
          </div>
          <!-- Chips abajo centrado -->
          <div style="position:absolute;bottom:-1px;left:0;right:0;text-align:center;
               font-size:0.6rem;font-weight:600;color:${cc>0?'#e65100':'#999'};
               background:${cc>0?'rgba(230,81,0,0.12)':'rgba(0,0,0,0.06)'};
               border-radius:0 0 9px 9px;padding:2px 0">${cc} chips</div>
        </div>`;
      }).join('')}
    </div>

    <!-- Botones de acción -->
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
      <button onclick="pokerPlay()" ${pk.playsLeft<=0||pk.selected.length===0?'disabled':''}
        style="padding:16px;font-size:1rem;font-weight:700;border-radius:12px;border:none;cursor:pointer;
               background:${pk.playsLeft>0&&pk.selected.length>0?'#ffc107':'#444'};
               color:${pk.playsLeft>0&&pk.selected.length>0?'#1a1a2e':'#666'};transition:all 0.15s">
        ▶ Jugar ${pk.selected.length>0?'('+pk.selected.length+')':''}
      </button>
      <button onclick="pokerDiscard()" ${pk.discardsLeft<=0||pk.selected.length===0?'disabled':''}
        style="padding:16px;font-size:1rem;font-weight:700;border-radius:12px;border:2px solid;cursor:pointer;
               background:transparent;transition:all 0.15s;
               border-color:${pk.discardsLeft>0&&pk.selected.length>0?'#2196f3':'#333'};
               color:${pk.discardsLeft>0&&pk.selected.length>0?'#2196f3':'#555'}">
        ♻️ Descartar (${pk.discardsLeft})
      </button>
    </div>

    </div>
  `;
}

// ─── LEVEL UP MODAL ───────────────────────────────────────
function showLevelUpModal(levelsGained, rewards) {
  const overlay = document.getElementById('levelup-overlay');
  if (!overlay) return;

  document.getElementById('levelup-title').textContent =
    levelsGained.length > 1 ? `¡+${levelsGained.length} Niveles!` : `¡Subiste de Nivel!`;

  document.getElementById('levelup-levels').innerHTML =
    levelsGained.map(lv => `<div class="levelup-level-badge">⭐ Nivel ${lv}</div>`).join('');

  const rewardsByLevel = {};
  rewards.forEach(r => {
    if (!rewardsByLevel[r.level]) rewardsByLevel[r.level] = [];
    rewardsByLevel[r.level].push(r);
  });

  document.getElementById('levelup-rewards').innerHTML = rewards.length === 0
    ? '<p style="color:var(--text2)">¡Sigue subiendo para desbloquear recompensas!</p>'
    : `<div class="levelup-rewards-list">${rewards.map(r => {
        if (r.type === 'coins')         return `<div class="reward-row">💰 +${fmt(r.amount)} monedas</div>`;
        if (r.type === 'bodega')        return `<div class="reward-row">🎁 Bodega ${r.id || ''} gratis</div>`;
        if (r.type === 'item')          return `<div class="reward-row">⭐ Objeto exclusivo: ${r.label || r.catalogId}</div>`;
        if (r.type === 'showcase_slots') return `<div class="reward-row">🖼️ +${r.count} slot${r.count>1?'s':''} de Vitrina desbloqueado${r.count>1?'s':''}</div>`;
        return '';
      }).join('')}</div>`;

  overlay.classList.remove('hidden');

  // Animación de estrellas
  const stars = ['⭐','🌟','✨','💫'];
  let i = 0;
  const starsEl = document.getElementById('levelup-stars');
  const starsAnim = setInterval(() => {
    starsEl.textContent = stars[i % stars.length];
    i++;
  }, 400);
  overlay._starsAnim = starsAnim;
}

function hideLevelUp() {
  const overlay = document.getElementById('levelup-overlay');
  if (overlay) {
    if (overlay._starsAnim) clearInterval(overlay._starsAnim);
    overlay.classList.add('hidden');
  }
  renderHUD();
  renderScreen();
}

// ─── RULETA ───────────────────────────────────────────────
function showRouletteModal() {
  const overlay = document.getElementById('roulette-overlay');
  if (!overlay) return;

  // Construir la rueda con los premios
  const wheel = document.getElementById('roulette-wheel');
  const total = ROULETTE_PRIZES.reduce((s, p) => s + p.weight, 0);
  let cumulAngle = 0;
  const segments = ROULETTE_PRIZES.map(p => {
    const angle = (p.weight / total) * 360;
    const seg   = { ...p, startAngle: cumulAngle, angle };
    cumulAngle += angle;
    return seg;
  });

  function prizeEmoji(p) {
    if (p.type === 'nothing') return '😕';
    if (p.type === 'xp')     return p.value >= 300 ? '🌟' : '⭐';
    if (p.type === 'coins')  return p.value >= 500 ? '💎' : '💰';
    if (p.type === 'bodega') return '🎁';
    return '❓';
  }

  // SVG wheel — emojis únicamente dentro de los segmentos
  const cx = 150, cy = 150, r = 138;
  const svgPaths = segments.map(seg => {
    const startRad = (seg.startAngle - 90) * Math.PI / 180;
    const endRad   = (seg.startAngle + seg.angle - 90) * Math.PI / 180;
    const x1 = cx + r * Math.cos(startRad);
    const y1 = cy + r * Math.sin(startRad);
    const x2 = cx + r * Math.cos(endRad);
    const y2 = cy + r * Math.sin(endRad);
    const largeArc = seg.angle > 180 ? 1 : 0;
    const midRad   = (seg.startAngle + seg.angle / 2 - 90) * Math.PI / 180;
    const tx = cx + (r * 0.68) * Math.cos(midRad);
    const ty = cy + (r * 0.68) * Math.sin(midRad);
    const emoji = prizeEmoji(seg);
    const fontSize = seg.angle < 40 ? 18 : 24;
    return `
      <path d="M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${largeArc},1 ${x2},${y2} Z"
            fill="${seg.color}" stroke="#0a0a12" stroke-width="3"/>
      <text x="${tx}" y="${ty}" text-anchor="middle" dominant-baseline="middle"
            font-size="${fontSize}"
            transform="rotate(${seg.startAngle + seg.angle / 2}, ${tx}, ${ty})">${emoji}</text>`;
  }).join('');

  wheel.innerHTML = `
    <svg viewBox="0 0 300 300" width="300" height="300" id="roulette-svg"
         style="transition:transform 4s cubic-bezier(0.17,0.67,0.12,0.99); display:block;">
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="#1a1a2e" stroke="var(--border)" stroke-width="2"/>
      ${svgPaths}
      <!-- aro exterior -->
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="4"/>
      <!-- centro -->
      <circle cx="${cx}" cy="${cy}" r="26" fill="var(--bg2)" stroke="var(--border)" stroke-width="3"/>
      <text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="middle"
            font-size="12" fill="var(--text2)" font-weight="bold">BV</text>
    </svg>
  `;

  // Leyenda de premios — tabla HTML para alineación exacta
  const legendEl = document.getElementById('roulette-legend');
  if (legendEl) {
    const left  = segments.slice(0, 3);
    const right = segments.slice(3);
    const rows  = left.map((seg, i) => {
      const r    = right[i];
      const pctL = Math.round((seg.weight / total) * 100);
      const pctR = r ? Math.round((r.weight / total) * 100) : null;
      return `<tr>
        <td><span class="rl-dot" style="background:${seg.color}"></span></td>
        <td class="rl-emoji">${prizeEmoji(seg)}</td>
        <td class="rl-label">${seg.label}</td>
        <td class="rl-pct">${pctL}%</td>
        <td class="rl-sep"></td>
        ${r ? `
        <td><span class="rl-dot" style="background:${r.color}"></span></td>
        <td class="rl-emoji">${prizeEmoji(r)}</td>
        <td class="rl-label">${r.label}</td>
        <td class="rl-pct">${pctR}%</td>
        ` : '<td colspan="4"></td>'}
      </tr>`;
    }).join('');
    legendEl.innerHTML = `<table class="rl-table"><tbody>${rows}</tbody></table>`;
  }

  document.getElementById('roulette-result').classList.add('hidden');
  document.getElementById('btn-spin').disabled = false;
  document.getElementById('btn-spin').textContent = '¡Girar!';
  overlay._segments = segments;
  overlay.classList.remove('hidden');
}

async function doSpin() {
  const overlay  = document.getElementById('roulette-overlay');
  const btn      = document.getElementById('btn-spin');
  btn.disabled   = true;
  btn.textContent = 'Girando...';

  try {
    const res      = await API.spinRoulette();
    const prize    = res.prize;
    S.rouletteLast = new Date().toISOString();

    // Aplicar resultados al estado local
    if (prize.type === 'coins') S.money += prize.value;
    if (prize.type === 'bodega') S.bodegaVouchers++;
    applyLevelUpResult(res);

    // Calcular ángulo destino: el segmento del premio ganado
    const segments = overlay._segments || [];
    const seg      = segments.find(s => s.type === prize.type && s.label === prize.label) || segments[0];
    const targetCenter = seg.startAngle + seg.angle / 2;
    // Girar 5 vueltas completas + ángulo para que el puntero (top) apunte al segmento
    const spins = 5 * 360;
    const finalAngle = spins + (360 - targetCenter);

    const svg = document.getElementById('roulette-svg');
    if (svg) svg.style.transform = `rotate(${finalAngle}deg)`;

    // Mostrar resultado tras la animación
    setTimeout(() => {
      const resultEl = document.getElementById('roulette-result');
      const p        = ROULETTE_PRIZES.find(p => p.type === prize.type && p.label === prize.label) || prize;
      resultEl.innerHTML = `
        <div class="roulette-prize-reveal" style="background:${p.color}22;border:2px solid ${p.color}">
          ${prize.type === 'nothing'  ? '😕 Sin suerte hoy…' : ''}
          ${prize.type === 'xp'       ? `🌟 +${fmt(prize.value)} XP` : ''}
          ${prize.type === 'coins'    ? `💰 +${fmt(prize.value)} monedas` : ''}
          ${prize.type === 'bodega'   ? '🎁 ¡Bodega gratis añadida!' : ''}
        </div>`;
      resultEl.classList.remove('hidden');
      renderHUD();
      btn.textContent = 'Cerrar';
      btn.onclick = hideRoulette;
      btn.disabled = false;
    }, 4200);

    // Level-up si subió de nivel
    if (res.xpResult?.levelsGained?.length > 0) {
      setTimeout(() => showLevelUpModal(res.xpResult.levelsGained, res.levelRewards || []), 4500);
    }

  } catch (err) {
    btn.disabled   = false;
    btn.textContent = 'Cerrar';
    btn.onclick    = hideRoulette;
    const resultEl = document.getElementById('roulette-result');
    resultEl.innerHTML = `<div class="roulette-prize-reveal" style="border:2px solid var(--danger);color:var(--danger)">⏳ ${err.message}</div>`;
    resultEl.classList.remove('hidden');
  }
}

function hideRoulette() {
  document.getElementById('roulette-overlay').classList.add('hidden');
  document.getElementById('btn-spin').onclick = doSpin;
  renderScreen();
}

// ─── REGALOS DE BODEGAS ───────────────────────────────────
function showGiftModal(bodegaId) {
  const bodega = BODEGAS.find(b => b.id === bodegaId);
  const allowed = S.level >= 10
    ? ['basica','estandar','premium','rara','misteriosa']
    : ['basica','estandar','premium'];

  if (!allowed.includes(bodegaId)) {
    toast('Necesitas nivel 10 para regalar Bodegas Raras y Misteriosas', 'error'); return;
  }
  if (!S.friends.length) {
    toast('No tienes amigos. ¡Agrega amigos primero!', 'error'); return;
  }

  showModal(`
    <h3>🎁 Regalar ${bodega.name}</h3>
    <p style="color:var(--text2);margin:8px 0 16px">Costo: 💰 ${fmt(bodega.cost)} — Se abrirá automáticamente al recibirla</p>
    <div class="gift-friend-list">
      ${S.friends.map(f => `
        <div class="gift-friend-item" onclick="doSendGift('${bodegaId}','${f.friendId}','${f.username}')">
          <span class="gift-friend-avatar">${f.avatar || '🧑'}</span>
          <div>
            <div class="gift-friend-name">${f.username}</div>
            <div class="gift-friend-level" style="color:var(--text2);font-size:0.8rem">Nivel ${f.level}</div>
          </div>
          <span style="margin-left:auto;color:var(--gold)">Enviar →</span>
        </div>`).join('')}
    </div>
    <button class="btn-outline" style="width:100%;margin-top:12px" onclick="hideModal()">Cancelar</button>
  `);
}

async function doSendGift(bodegaId, friendId, friendName) {
  hideModal();
  try {
    const res = await API.sendGift(friendId, bodegaId);
    S.money -= res.cost;
    renderHUD();
    toast(`🎁 ¡Bodega enviada a ${friendName}! Te quedan ${res.gifts_remaining} regalos hoy`, 'success');
  } catch (err) {
    toast(err.message || 'Error al enviar el regalo', 'error');
  }
}

async function openGift(giftId) {
  try {
    showLoading('Abriendo tu regalo...');
    const res = await API.openGift(giftId);
    hideLoading();

    // Actualizar estado local
    S.pendingGifts = S.pendingGifts.filter(g => g.id !== giftId);
    res.items.forEach(item => S.inventory.push({
      uid: item.id, catalogId: item.catalog_id,
      rarity: item.rarity, condition: item.condition,
      grade: item.grade, identified: item.identified, value: item.value,
    }));
    S.level   = res.new_level;
    S.xp      = res.new_xp;
    S.xpNext  = res.new_xp_next;
    S.notifications = S.notifications.map(n =>
      (n.metadata && n.metadata.gift_id === giftId) ? { ...n, read: true } : n
    );
    renderHUD();

    // Mostrar resultado como apertura de bodega
    const bodega = BODEGAS.find(b => b.id === res.bodega_id) || { name: 'Bodega Regalada', icon: '🎁', color: '#e91e63' };
    showGiftResult(bodega, res.items);

    if (res.levels_up && res.levels_up.length) {
      setTimeout(() => showLevelUpModal(res.levels_up, []), 500);
    }
  } catch (err) {
    hideLoading();
    toast(err.message || 'Error al abrir el regalo', 'error');
  }
}

function showGiftResult(bodega, items) {
  showModal(`
    <div style="text-align:center;margin-bottom:12px">
      <div style="font-size:2.5rem">${bodega.icon}</div>
      <h3 style="color:${bodega.color || 'var(--accent)'};margin:6px 0">🎁 ${bodega.name}</h3>
      <p style="color:var(--text2);font-size:0.85rem">¡Encontraste ${items.length} objetos!</p>
    </div>
    <div class="gift-items-grid">
      ${items.map(item => {
        const cat  = CATALOG.find(c => c.id === item.catalog_id);
        const r    = RARITIES[item.rarity];
        const cond = CONDITIONS[item.condition];
        return `
          <div class="gift-item-card" style="border-color:${r ? r.color : '#666'}">
            <div style="font-size:1.6rem">${cat ? cat.emoji : '❓'}</div>
            <div class="gift-item-name">${cat ? cat.name : (item.identified ? item.catalog_id : '???')}</div>
            <div style="color:${r ? r.color : '#666'};font-size:0.75rem">${r ? r.name : ''}</div>
            <div style="color:var(--text2);font-size:0.72rem">${cond ? cond.name : ''} · G${item.grade}</div>
          </div>`;
      }).join('')}
    </div>
    <button class="btn-primary" style="width:100%;margin-top:14px" onclick="hideModal();renderScreen()">¡Genial!</button>
  `);
}

function showPendingGiftsModal() {
  if (!S.pendingGifts.length) { toast('No tienes regalos pendientes', 'info'); return; }
  showModal(`
    <h3>🎁 Regalos Pendientes</h3>
    <p style="color:var(--text2);margin-bottom:12px">Toca un regalo para abrirlo</p>
    <div class="gift-friend-list">
      ${S.pendingGifts.map(g => {
        const bodega = BODEGAS.find(b => b.id === g.bodega_id) || { name: g.bodega_id, icon: '🎁' };
        return `
          <div class="gift-friend-item" onclick="hideModal();openGift('${g.id}')">
            <span style="font-size:1.5rem">${bodega.icon}</span>
            <div>
              <div class="gift-friend-name">${bodega.name}</div>
              <div style="color:var(--text2);font-size:0.8rem">De: ${g.sender_name} · ${timeAgo(g.created_at)}</div>
            </div>
            <span style="margin-left:auto;color:var(--gold)">Abrir →</span>
          </div>`;
      }).join('')}
    </div>
    <button class="btn-outline" style="width:100%;margin-top:12px" onclick="hideModal()">Cerrar</button>
  `);
}

// ─── REVESTIMIENTOS ───────────────────────────────────────
function showRevestimientosModal() {
  const active = S.activeRevestimiento;
  const revs   = S.revestimientos;

  if (!revs.length) {
    showModal(`
      <h3>🎨 Mis Revestimientos</h3>
      <div class="empty-state" style="padding:24px 0">
        <div class="empty-icon">🖼️</div>
        <h3>Sin revestimientos</h3>
        <p>Abre la Caja de Diseñador para obtener marcos únicos para tu vitrina.</p>
      </div>
      <button class="btn-outline" style="width:100%;margin-top:8px" onclick="hideModal()">Cerrar</button>
    `);
    return;
  }

  const html = revs.map(rev => {
    const r    = RARITIES[rev.rarity];
    const isEq = active === rev.catalog_id;
    const info = REVESTIMIENTOS.find(x => x.id === rev.catalog_id);
    return `
      <div class="rev-card ${info?.cssClass || ''}" style="border-color:${r.color}">
        <div class="rev-preview ${info?.cssClass || ''}"></div>
        <div class="rev-info">
          <div class="rev-name">${rev.name}</div>
          <span class="item-rarity-badge" style="background:${r.bg};color:${r.color}">${r.name}</span>
          <div class="rev-desc">${rev.description || ''}</div>
        </div>
        <div class="rev-actions">
          ${isEq
            ? `<button class="btn-gold btn-sm" onclick="doUnequipRevestimiento()">Desequipar</button>`
            : `<button class="btn-primary btn-sm" onclick="doEquipRevestimiento('${rev.catalog_id}')">Equipar</button>`
          }
        </div>
      </div>`;
  }).join('');

  showModal(`
    <h3>🎨 Mis Revestimientos (${revs.length})</h3>
    ${active ? `<p style="color:var(--text2);font-size:0.82rem;margin-bottom:10px">Activo: <strong>${revs.find(r=>r.catalog_id===active)?.name || active}</strong></p>` : ''}
    <div class="rev-list">${html}</div>
    <button class="btn-outline" style="width:100%;margin-top:12px" onclick="hideModal()">Cerrar</button>
  `);
}

async function doOpenDesignerBox() {
  if (S.money < CAJA_DISENADOR.cost) { toast('No tienes suficiente dinero', 'error'); return; }
  showLoading('Abriendo Caja de Diseñador...');
  try {
    const result = await API.openDesignerBox();
    S.money -= result.cost;
    const revData = await API.getRevestimientos();
    S.revestimientos      = revData?.revestimientos || [];
    S.activeRevestimiento = revData?.active || null;
    hideLoading();
    renderScreen();

    const r    = RARITIES[result.revestimiento.rarity];
    const info = REVESTIMIENTOS.find(x => x.id === result.revestimiento.id);
    showModal(`
      <div style="text-align:center;padding:8px 0">
        <div style="font-size:2.5rem;margin-bottom:8px">🎨</div>
        <h3 style="margin-bottom:4px">${result.is_duplicate ? '¡Diseño duplicado!' : '¡Nuevo revestimiento!'}</h3>
        ${result.is_duplicate ? `<p style="color:var(--text2);font-size:0.82rem;margin-bottom:12px">Ya tenías este diseño, pero gastaste el dinero de todas formas.</p>` : ''}
        <div class="rev-reveal ${info?.cssClass || ''}" style="margin:12px auto"></div>
        <div class="item-name" style="font-size:1.1rem;margin:8px 0">${result.revestimiento.name}</div>
        <span class="item-rarity-badge" style="background:${r.bg};color:${r.color};font-size:0.9rem">${r.name}</span>
        <p style="color:var(--text2);font-size:0.82rem;margin-top:8px">${result.revestimiento.description}</p>
        <p style="color:var(--text2);font-size:0.78rem">Costo: 💰 ${fmt(result.cost)}</p>
        ${!result.is_duplicate ? `
        <button class="btn-primary" style="width:100%;margin-top:12px"
          onclick="hideModal();doEquipRevestimiento('${result.revestimiento.id}')">
          ✨ Equipar ahora
        </button>` : ''}
        <button class="btn-outline" style="width:100%;margin-top:8px" onclick="hideModal()">Cerrar</button>
      </div>
    `);
  } catch (err) {
    hideLoading();
    toast(err.message || 'Error al abrir la caja', 'error');
  }
}

async function doEquipRevestimiento(id) {
  try {
    await API.equipRevestimiento(id);
    S.activeRevestimiento = id;
    toast('Revestimiento equipado', 'success');
    hideModal();
    if (S.screen === 'bodegas') renderScreen();
  } catch (err) {
    toast(err.message || 'Error al equipar', 'error');
  }
}

async function doUnequipRevestimiento() {
  try {
    await API.unequipRevestimiento();
    S.activeRevestimiento = null;
    toast('Revestimiento desequipado', 'success');
    hideModal();
    if (S.screen === 'bodegas') renderScreen();
  } catch (err) {
    toast(err.message || 'Error al desequipar', 'error');
  }
}

// ─── MODAL ────────────────────────────────────────────────
function showModal(html) {
  document.getElementById('modal-content').innerHTML = html;
  document.getElementById('modal').classList.remove('hidden');
  document.getElementById('modal-backdrop').classList.remove('hidden');
}
function hideModal() {
  document.getElementById('modal').classList.add('hidden');
  document.getElementById('modal-backdrop').classList.add('hidden');
}

// ─── ENTER ON INPUTS ──────────────────────────────────────
function setupKeyHandlers() {
  document.getElementById('login-pass').addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });
  document.getElementById('login-user').addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });
  document.getElementById('reg-pass').addEventListener('keydown', e => { if (e.key === 'Enter') doRegister(); });
}

// ─── NAV HANDLERS ─────────────────────────────────────────
function setupNavHandlers() {
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => switchScreen(btn.dataset.screen));
  });
}

// ─── INICIALIZACIÓN ───────────────────────────────────────
async function init() {
  setupKeyHandlers();

  if (isLoggedIn()) {
    // Validar token
    try {
      document.getElementById('auth-screen').classList.add('hidden');
      document.getElementById('game-container').classList.remove('hidden');
      await loadGameState();
      setupNavHandlers();
      renderHUD();
      switchScreen('hub');
    } catch (err) {
      console.warn('Token inválido, re-autenticando');
      clearToken();
      document.getElementById('auth-screen').classList.remove('hidden');
      document.getElementById('game-container').classList.add('hidden');
    }
  } else {
    document.getElementById('auth-screen').classList.remove('hidden');
    document.getElementById('game-container').classList.add('hidden');
  }
}

window.addEventListener('DOMContentLoaded', init);
