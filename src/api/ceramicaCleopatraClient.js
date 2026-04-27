// REST API client — replaces Base44 SDK.
// All pages import { ceramicaCleopatra } with the same interface as before.

const API_BASE = '/api';

const apiFetch = async (method, path, body = null) => {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    ...(body !== null ? { body: JSON.stringify(body) } : {}),
  });
  if (!res.ok) {
    let msg = `API ${method} ${path}: ${res.status}`;
    try { const t = await res.text(); msg += ` — ${t}`; } catch (_) {}
    throw new Error(msg);
  }
  return res.json();
};

const makeEntity = (resource) => ({
  /** list(sort?, limit?) → GET /api/<resource>?sort=...&limit=... */
  list: (sort = '', limit = 100) => {
    const p = new URLSearchParams();
    if (sort)  p.set('sort',  sort);
    if (limit) p.set('limit', String(limit));
    return apiFetch('GET', `/${resource}?${p}`);
  },

  /** filter(filters, sort?, limit?) → GET /api/<resource>?...filters...&sort=...&limit=... */
  filter: (filters = {}, sort = '', limit = 100) => {
    const p = new URLSearchParams();
    for (const [k, v] of Object.entries(filters)) {
      if (v !== undefined && v !== null) p.set(k, String(v));
    }
    if (sort)  p.set('sort',  sort);
    if (limit) p.set('limit', String(limit));
    return apiFetch('GET', `/${resource}?${p}`);
  },

  create: (data)      => apiFetch('POST',   `/${resource}`,       data),
  update: (id, data)  => apiFetch('PUT',    `/${resource}/${id}`, data),
  delete: (id)        => apiFetch('DELETE', `/${resource}/${id}`),
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
  },

  // Auth stubs — app runs in public/no-auth mode
  auth: {
    me:               () => apiFetch('GET', '/auth/me'),
    isAuthenticated:  async () => { try { await apiFetch('GET', '/auth/me'); return true; } catch { return false; } },
    logout:           () => {},
    redirectToLogin:  () => {},
  },

  // App logging — no-op
  appLogs: {
    logUserInApp: () => Promise.resolve(),
  },

  // Integrations — no-op (Admin page used Base44 LLM; leave stubs so page renders)
  integrations: {
    Core: {
      InvokeLLM: () => Promise.resolve({}),
    },
  },
};
