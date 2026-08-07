/* =========================================================
   CAFEISH — SHARED SITE LOGIC
   =========================================================
   No backend, no accounts, no setup required. Menu items added
   via /admin.html, reviews, and theme/color changes save to
   YOUR browser's local storage — meaning they show up again
   when you come back to the same browser, but a different
   visitor (or you on a different device) won't see them.

   That's a deliberate tradeoff for zero setup. If you outgrow
   it later (want changes visible to every visitor everywhere),
   that's a "connect a database" upgrade — ask and I can wire
   that back in. For launch, this keeps things simple and free.
   ========================================================= */

// ---------- NAV ----------
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => links.classList.toggle('open'));
  }
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a[data-page]').forEach(a => {
    if (a.dataset.page === path) a.classList.add('active');
  });

  initTheme();
});

// ---------- TOAST ----------
function showToast(message) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => toast.classList.remove('show'), 3200);
}

// ---------- STORAGE HELPERS ----------
const STORE_KEYS = {
  menuItems: 'cafeish_menu_items',
  reviews: 'cafeish_reviews',
  catering: 'cafeish_catering',
  notifyMe: 'cafeish_notify_me',
  waitlist: 'cafeish_waitlist',
  team: 'cafeish_team',
  theme: 'cafeish_theme',
  pageEdits: 'cafeish_page_edits'
};

function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
}

function saveJSON(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* ignore */ }
}

// ---------- MENU ITEMS ----------
// Everything (the starter items from data.js AND anything added later) lives
// as one editable, deletable list once the page has loaded once — so you can
// edit or remove the original seed items too, not just ones you added.
function getAllMenuItems() {
  let items = loadJSON(STORE_KEYS.menuItems, null);
  if (items === null) {
    const base = typeof DEFAULT_MENU_ITEMS !== 'undefined' ? DEFAULT_MENU_ITEMS : [];
    items = base.map((it, i) => ({ ...it, id: it.id || ('seed_' + i) }));
    saveJSON(STORE_KEYS.menuItems, items);
  }
  return items;
}

function getCustomMenuItems() {
  return getAllMenuItems();
}

function addMenuItem(item) {
  const items = getAllMenuItems();
  items.push({ ...item, id: 'item_' + Date.now() });
  saveJSON(STORE_KEYS.menuItems, items);
}

function updateMenuItem(id, changes) {
  const items = getAllMenuItems();
  const idx = items.findIndex(i => i.id === id);
  if (idx > -1) {
    items[idx] = { ...items[idx], ...changes };
    saveJSON(STORE_KEYS.menuItems, items);
  }
}

function deleteCustomMenuItem(id) {
  let items = getAllMenuItems();
  items = items.filter(i => i.id !== id);
  saveJSON(STORE_KEYS.menuItems, items);
}

// ---------- REVIEWS ----------
function getReviews() {
  return loadJSON(STORE_KEYS.reviews, []);
}

function addReview(review) {
  const reviews = getReviews();
  reviews.unshift({ ...review, id: 'r_' + Date.now(), date: new Date().toISOString() });
  saveJSON(STORE_KEYS.reviews, reviews);
}

function averageRating() {
  const reviews = getReviews();
  if (!reviews.length) return 0;
  const sum = reviews.reduce((a, r) => a + Number(r.rating), 0);
  return (sum / reviews.length).toFixed(1);
}

function starString(rating) {
  const r = Math.round(rating);
  return '★'.repeat(r) + '☆'.repeat(5 - r);
}

// ---------- CATERING INQUIRIES ----------
function addCateringInquiry(entry) {
  const list = loadJSON(STORE_KEYS.catering, []);
  list.unshift({ ...entry, id: 'c_' + Date.now(), date: new Date().toISOString() });
  saveJSON(STORE_KEYS.catering, list);
}

// ---------- ORDER PAGE "NOTIFY ME" (ordering isn't live yet) ----------
function addNotifyMe(entry) {
  const list = loadJSON(STORE_KEYS.notifyMe, []);
  list.unshift({ ...entry, id: 'n_' + Date.now(), date: new Date().toISOString() });
  saveJSON(STORE_KEYS.notifyMe, list);
}

// ---------- WAITLIST ----------
function addWaitlistSignup(entry) {
  const list = loadJSON(STORE_KEYS.waitlist, []);
  list.unshift({ ...entry, id: 'w_' + Date.now(), date: new Date().toISOString() });
  saveJSON(STORE_KEYS.waitlist, list);
}

// ---------- TEAM MEMBERS ----------
function getTeamMembers() {
  let members = loadJSON(STORE_KEYS.team, null);
  if (members === null) {
    const base = typeof TEAM_MEMBERS !== 'undefined' ? TEAM_MEMBERS : [];
    members = base.map((m, i) => ({ ...m, id: m.id || ('seedteam_' + i) }));
    saveJSON(STORE_KEYS.team, members);
  }
  return members;
}

function getCustomTeamMembers() {
  return getTeamMembers();
}

function addTeamMember(member) {
  const members = getTeamMembers();
  members.push({ ...member, id: 'team_' + Date.now() });
  saveJSON(STORE_KEYS.team, members);
}

function updateTeamMember(id, changes) {
  const members = getTeamMembers();
  const idx = members.findIndex(m => m.id === id);
  if (idx > -1) {
    members[idx] = { ...members[idx], ...changes };
    saveJSON(STORE_KEYS.team, members);
  }
}

function deleteTeamMember(id) {
  let members = getTeamMembers();
  members = members.filter(m => m.id !== id);
  saveJSON(STORE_KEYS.team, members);
}

// ---------- THEME (decorations: colors + font) ----------
function getTheme() {
  const saved = loadJSON(STORE_KEYS.theme, null);
  return { ...DEFAULT_THEME, ...(saved || {}) };
}

function saveTheme(theme) {
  saveJSON(STORE_KEYS.theme, theme);
}

function applyTheme(theme) {
  const root = document.documentElement.style;
  root.setProperty('--bg', theme.bg);
  root.setProperty('--surface', theme.surface);
  root.setProperty('--nav', theme.nav);
  root.setProperty('--text', theme.text);
  root.setProperty('--muted', theme.muted);
  root.setProperty('--gold', theme.gold);

  const fontDef = (typeof FONT_OPTIONS !== 'undefined' ? FONT_OPTIONS : []).find(f => f.name === theme.font);
  if (fontDef) {
    root.setProperty('--font-family', fontDef.stack);
    if (!document.querySelector(`link[data-font="${fontDef.name}"]`)) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = fontDef.url;
      link.dataset.font = fontDef.name;
      document.head.appendChild(link);
    }
  }

  document.querySelectorAll('.logo-mark').forEach(mark => {
    const img = mark.querySelector('.logo-img');
    const fallback = mark.querySelector('.logo-fallback');
    if (theme.logo && img) {
      img.src = theme.logo;
      img.style.display = '';
      if (fallback) fallback.style.display = 'none';
    } else {
      if (img) img.style.display = 'none';
      if (fallback) fallback.style.display = '';
    }
  });
}

function initTheme() {
  applyTheme(getTheme());
}

// ---------- IMAGE UPLOADS ----------
// Converts a chosen photo to inline image data stored with the item.
// Works great for a handful of images. If you add many large photos and
// notice things slowing down, that's local storage's space limit — ask
// if you want a proper image host wired in later.
function uploadImage(file) {
  return new Promise((resolve, reject) => {
    if (!file) { resolve(''); return; }
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ---------- ADMIN SESSION GATE ----------
function isAdminUnlocked() {
  return sessionStorage.getItem('cafeish_admin_ok') === 'true';
}
function unlockAdmin(password) {
  if (typeof ADMIN_PASSWORD !== 'undefined' && password === ADMIN_PASSWORD) {
    sessionStorage.setItem('cafeish_admin_ok', 'true');
    return true;
  }
  return false;
}
function isEditModeOn() {
  return isAdminUnlocked() && sessionStorage.getItem('cafeish_edit_mode') === 'true';
}

// ---------- ON-PAGE TEXT/IMAGE EDITING ----------
// Powers the "Edit this page" toolbar: lets an unlocked admin click directly
// on text or photos anywhere on the site and change them, no code required.
// Everything saves to this browser's local storage, same as the rest of the
// admin tools (see README for what that does and doesn't mean).
function getPageEdits() {
  return loadJSON(STORE_KEYS.pageEdits, {});
}

function setPageEdit(key, value) {
  const edits = getPageEdits();
  edits[key] = value;
  saveJSON(STORE_KEYS.pageEdits, edits);
}

function clearPageEdit(key) {
  const edits = getPageEdits();
  delete edits[key];
  saveJSON(STORE_KEYS.pageEdits, edits);
}

function resetAllPageEdits() {
  saveJSON(STORE_KEYS.pageEdits, {});
}

// Applies any saved overrides to matching elements on the current page.
// Safe to call on every page load — does nothing if nothing's been edited.
function applyPageEdits() {
  const edits = getPageEdits();
  document.querySelectorAll('[data-edit-key]').forEach(el => {
    const key = el.dataset.editKey;
    if (edits[key] !== undefined) el.textContent = edits[key];
  });
  document.querySelectorAll('[data-edit-img-key]').forEach(el => {
    const key = el.dataset.editImgKey;
    if (edits[key] !== undefined) el.src = edits[key];
  });
}
