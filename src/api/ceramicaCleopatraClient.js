// REST API client — Ceramica Cleopatra FC (with JWT auth support)

const API_BASE = '/api';

const getToken = () => localStorage.getItem('cc_token');
export const setToken = (t) => t ? localStorage.setItem('cc_token', t) : localStorage.removeItem('cc_token');

const apiFetch = async (method, path, body = null) => {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    ...(body !== null ? { body: JSON.stringify(body) } : {}),
  });

  if (!res.ok) {
    let msg = `API ${method} ${path}: ${res.status}`;
    try { const t = await res.text(); msg += ` — ${t}`; } catch (_) {}
    const err = new Error(msg);
    err.status = res.status;
    throw err;
  }
  return res.json();
};

// Normalize list/filter response — handle both array and { data, total } shapes
const normalize = (r) => Array.isArray(r) ? r : (r?.data ?? r ?? []);

const makeEntity = (resource) => ({
  list: (sort = '', limit = 100) => {
    const p = new URLSearchParams();
    if (sort)  p.set('sort', sort);
    if (limit) p.set('limit', String(limit));
    return apiFetch('GET', `/${resource}?${p}`).then(normalize);
  },
  filter: (filters = {}, sort = '', limit = 100) => {
    const p = new URLSearchParams();
    for (const [k, v] of Object.entries(filters))
      if (v !== undefined && v !== null) p.set(k, String(v));
    if (sort)  p.set('sort', sort);
    if (limit) p.set('limit', String(limit));
    return apiFetch('GET', `/${resource}?${p}`).then(normalize);
  },
  create: (data)     => apiFetch('POST',   `/${resource}`,       data),
  update: (id, data) => apiFetch('PUT',    `/${resource}/${id}`, data),
  delete: (id)       => apiFetch('DELETE', `/${resource}/${id}`),
  getOne: (id)       => apiFetch('GET',    `/${resource}/${id}`),
});

export const ceramicaCleopatra = {
  entities: {
    Match:    makeEntity('matches'),
    News:     makeEntity('news'),
    Player:   makeEntity('players'),
    Media:    makeEntity('media'),
    Poll:     makeEntity('polls'),
    Comment:  makeEntity('comments'),
    Standing: makeEntity('standings'),
    SubscriptionPlan: makeEntity('subscription_plans'),
  },

  auth: {
    register: (data) => apiFetch('POST', '/auth/register', data),
    login:    (data) => apiFetch('POST', '/auth/login', data),
    me:       ()     => apiFetch('GET',  '/auth/me'),
    updateProfile:  (data) => apiFetch('PUT', '/auth/profile', data),
    changePassword: (data) => apiFetch('PUT', '/auth/change-password', data),
    isAuthenticated: () => Promise.resolve(!!getToken()),
    logout: () => { setToken(null); },
    redirectToLogin: () => { window.location.href = '/Login'; },
  },

  admin: {
    getStats:  ()       => apiFetch('GET', '/admin/stats'),
    getUsers:  (params) => {
      const p = new URLSearchParams(params || {});
      return apiFetch('GET', `/admin/users?${p}`);
    },
    updateUser:  (id, data)   => apiFetch('PUT', `/admin/users/${id}`, data),
    deleteUser:  (id)         => apiFetch('DELETE', `/admin/users/${id}`),
    assignSub:   (id, data)   => apiFetch('POST', `/admin/users/${id}/subscription`, data),
    syncStandings:   () => apiFetch('POST', '/sync/standings'),
    syncSquad:       () => apiFetch('POST', '/sync/squad'),
    syncPlayerStats: () => apiFetch('POST', '/sync/player-stats'),
    syncMatches:     () => apiFetch('POST', '/sync/matches'),
    syncFixtures:    () => apiFetch('POST', '/sync/fixtures'),
    syncTopScorers:  () => apiFetch('POST', '/sync/topscorers'),
    syncNews:        () => apiFetch('POST', '/sync/news'),
    syncAll:         () => apiFetch('POST', '/sync/all'),
  },

  newsFeeds:        (cat)       => apiFetch('GET', `/news-feeds${cat ? `?category=${encodeURIComponent(cat)}` : ''}`),
  liveScores:       ()          => apiFetch('GET', '/live-scores'),
  ceramicaFixtures: ()          => apiFetch('GET', '/ceramica-fixtures'),
  matchDetails:     (eventId)   => apiFetch('GET', `/match-details/${eventId}`),
  matchLookup:         (home, away, date) => apiFetch('GET', `/match-lookup?home=${encodeURIComponent(home)}&away=${encodeURIComponent(away)}&date=${encodeURIComponent(date || '')}`),
  relegationStandings: () => apiFetch('GET', '/relegation-standings'),

  settings: {
    get:  ()     => apiFetch('GET', '/settings'),
    save: (data) => apiFetch('PUT', '/settings', data),
  },

  appLogs: { logUserInApp: () => Promise.resolve() },
  integrations: { Core: { InvokeLLM: () => Promise.resolve({}) } },
};
