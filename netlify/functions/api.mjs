import express from 'express';
import serverless from 'serverless-http';
import cors from 'cors';
import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// ─── Constants ────────────────────────────────────────────────────────────────
const LEAGUE_ID       = 233;
const TEAM_ID         = 14651;
const SEASON          = 2024;
const SEASON_FALLBACK = 2024;
const JWT_SECRET      = process.env.JWT_SECRET || 'ceramica-cleopatra-secret-2025';

// ─── DB helper ────────────────────────────────────────────────────────────────
const getSQL = () => {
  const s = neon(process.env.DATABASE_URL);
  return { query: (text, values) => s.query(text, values) };
};

// ─── API-Football helper ──────────────────────────────────────────────────────
async function apiFootball(path) {
  const apiKey = process.env.API_FOOTBALL_KEY || 'd38e461170b465ee0312915c9bcad93d';
  const res = await fetch(`https://v3.football.api-sports.io${path}`, {
    headers: { 'x-apisports-key': apiKey },
  });
  if (!res.ok) throw new Error(`API-Football ${res.status}: ${path}`);
  const data = await res.json();
  if (data.errors && Object.keys(data.errors).length > 0) {
    const err = new Error(JSON.stringify(data.errors));
    if (JSON.stringify(data.errors).includes('Free plans')) err.seasonFallback = true;
    throw err;
  }
  return data.response;
}

async function apiFootballWithFallback(pathFn) {
  try {
    return { data: await apiFootball(pathFn(SEASON)), season: SEASON };
  } catch (err) {
    if (err.seasonFallback) {
      return { data: await apiFootball(pathFn(SEASON_FALLBACK)), season: SEASON_FALLBACK };
    }
    throw err;
  }
}

// ─── JWT helpers ─────────────────────────────────────────────────────────────
const signToken = (user) =>
  jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

const verifyToken = (token) => {
  try { return jwt.verify(token, JWT_SECRET); }
  catch { return null; }
};

// ─── Auth middleware ──────────────────────────────────────────────────────────
const requireAuth = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No token' });
  const decoded = verifyToken(token);
  if (!decoded) return res.status(401).json({ error: 'Invalid token' });
  req.user = decoded;
  next();
};

const requireAdmin = (req, res, next) => {
  requireAuth(req, res, () => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
    next();
  });
};

// ─── SQL helpers ─────────────────────────────────────────────────────────────
const SORT_FIELDS = {
  matches:   ['date', 'created_at', 'status'],
  news:      ['published_at', 'created_at', 'views', 'title'],
  players:   ['number', 'name', 'created_at', 'position'],
  media:     ['created_date', 'created_at'],
  polls:     ['created_date', 'created_at'],
  comments:  ['created_date', 'created_at'],
  standings: ['created_date', 'created_at'],
  users:     ['created_at', 'full_name', 'email', 'last_login'],
  user_subscriptions: ['created_at', 'expires_at'],
};

const BOOL_FIELDS = {
  matches:  ['is_ceramica_match'],
  news:     ['is_featured', 'is_breaking', 'is_club_news'],
  players:  ['is_captain'],
  polls:    ['is_active'],
  comments: [],
  users:    ['email_verified'],
  subscription_plans: ['is_active'],
};

function parseSortClause(table, sort = '') {
  const desc   = sort.startsWith('-');
  const field  = sort.replace(/^-/, '') || 'created_at';
  const allowed = SORT_FIELDS[table] || ['created_at'];
  const safe   = allowed.includes(field) ? field : (allowed[0] || 'created_at');
  return `ORDER BY ${safe} ${desc ? 'DESC' : 'ASC'}`;
}

function buildWhere(table, queryObj) {
  const reserved = new Set(['sort', 'limit', 'offset', 'page']);
  const bools    = BOOL_FIELDS[table] || [];
  const conditions = [];
  const values     = [];
  for (const [key, val] of Object.entries(queryObj)) {
    if (reserved.has(key) || val === undefined || val === '') continue;
    if (!/^[a-zA-Z_]+$/.test(key)) continue;
    values.push(bools.includes(key) ? val === 'true' : val);
    conditions.push(`${key} = $${values.length}`);
  }
  return { where: conditions.length ? `WHERE ${conditions.join(' AND ')}` : '', values };
}

// ─── Generic CRUD factory ─────────────────────────────────────────────────────
function makeCRUD(router, table, writableFields, protect = false) {
  const guard = protect ? requireAdmin : (r, s, n) => n();

  router.get(`/${table}`, async (req, res) => {
    try {
      const { query } = getSQL();
      const { sort = '-created_at', limit = '100', offset = '0' } = req.query;
      const limitN  = Math.min(parseInt(limit) || 100, 1000);
      const offsetN = parseInt(offset) || 0;
      const order   = parseSortClause(table, sort);
      const { where, values } = buildWhere(table, req.query);
      values.push(limitN, offsetN);
      const rows = await query(
        `SELECT * FROM ${table} ${where} ${order} LIMIT $${values.length - 1} OFFSET $${values.length}`,
        values,
      );

      // Get total count
      const countVals = values.slice(0, -2);
      const countRes  = await query(`SELECT COUNT(*) FROM ${table} ${where}`, countVals);
      res.json({ data: rows, total: parseInt(countRes[0].count), limit: limitN, offset: offsetN });
    } catch (err) {
      console.error(`GET /${table}`, err);
      res.status(500).json({ error: err.message });
    }
  });

  router.get(`/${table}/:id`, async (req, res) => {
    try {
      const { query } = getSQL();
      const rows = await query(`SELECT * FROM ${table} WHERE id = $1`, [req.params.id]);
      if (!rows[0]) return res.status(404).json({ error: 'Not found' });
      res.json(rows[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
  });

  router.post(`/${table}`, guard, async (req, res) => {
    try {
      const { query } = getSQL();
      const data   = req.body || {};
      const fields = writableFields.filter(f => data[f] !== undefined);
      if (!fields.length) return res.status(400).json({ error: 'No valid fields' });
      const rows = await query(
        `INSERT INTO ${table} (${fields.join(', ')}) VALUES (${fields.map((_, i) => `$${i + 1}`).join(', ')}) RETURNING *`,
        fields.map(f => data[f]),
      );
      res.status(201).json(rows[0]);
    } catch (err) {
      console.error(`POST /${table}`, err);
      res.status(500).json({ error: err.message });
    }
  });

  router.put(`/${table}/:id`, guard, async (req, res) => {
    try {
      const { query } = getSQL();
      const data   = req.body || {};
      const fields = writableFields.filter(f => data[f] !== undefined);
      if (!fields.length) return res.status(400).json({ error: 'No valid fields' });
      const sets = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
      const hasUpdated = !['media','standings','comments','user_subscriptions'].includes(table);
      const rows = await query(
        `UPDATE ${table} SET ${sets}${hasUpdated ? ', updated_at = NOW()' : ''} WHERE id = $${fields.length + 1} RETURNING *`,
        [...fields.map(f => data[f]), req.params.id],
      );
      if (!rows[0]) return res.status(404).json({ error: 'Not found' });
      res.json(rows[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
  });

  router.delete(`/${table}/:id`, guard, async (req, res) => {
    try {
      const { query } = getSQL();
      await query(`DELETE FROM ${table} WHERE id = $1`, [req.params.id]);
      res.json({ deleted: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// ─── Router ───────────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
const router = express.Router();

// Health
router.get('/', (_req, res) => res.json({ status: 'ok', service: 'Ceramica Cleopatra FC API v2' }));

// ── AUTH ─────────────────────────────────────────────────────────────────────
router.post('/auth/register', async (req, res) => {
  try {
    const { query } = getSQL();
    const { email, password, full_name, phone, plan_id } = req.body;
    if (!email || !password || !full_name)
      return res.status(400).json({ error: 'email, password and full_name are required' });
    if (password.length < 6)
      return res.status(400).json({ error: 'Password must be at least 6 characters' });

    const exists = await query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (exists[0]) return res.status(409).json({ error: 'Email already registered' });

    const hash = await bcrypt.hash(password, 10);
    const rows = await query(
      `INSERT INTO users (email, password_hash, full_name, phone, role, status, email_verified)
       VALUES ($1,$2,$3,$4,'member','active',true) RETURNING id, email, full_name, role, status, created_at`,
      [email.toLowerCase(), hash, full_name, phone || null],
    );
    const user = rows[0];

    // Assign subscription if plan_id provided
    if (plan_id) {
      const plan = await query('SELECT * FROM subscription_plans WHERE id = $1', [plan_id]);
      if (plan[0]) {
        const expiresAt = plan[0].price === 0 ? null :
          new Date(Date.now() + plan[0].duration_days * 86400000).toISOString();
        await query(
          `INSERT INTO user_subscriptions (user_id, plan_id, status, expires_at, amount_paid)
           VALUES ($1,$2,'active',$3,$4)`,
          [user.id, plan_id, expiresAt, plan[0].price],
        );
      }
    }

    const token = signToken(user);
    res.status(201).json({ token, user });
  } catch (err) {
    console.error('register', err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/auth/login', async (req, res) => {
  try {
    const { query } = getSQL();
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const rows = await query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
    const user = rows[0];
    if (!user) return res.status(401).json({ error: 'Invalid email or password' });
    if (user.status === 'banned') return res.status(403).json({ error: 'Account suspended' });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid email or password' });

    await query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);

    // Get active subscription
    const sub = await query(
      `SELECT us.*, sp.name as plan_name, sp.name_ar, sp.badge_color, sp.features
       FROM user_subscriptions us
       JOIN subscription_plans sp ON sp.id = us.plan_id
       WHERE us.user_id = $1 AND us.status = 'active'
       ORDER BY us.created_at DESC LIMIT 1`,
      [user.id],
    );

    const token = signToken(user);
    const { password_hash, ...safeUser } = user;
    res.json({ token, user: safeUser, subscription: sub[0] || null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/auth/me', requireAuth, async (req, res) => {
  try {
    const { query } = getSQL();
    const rows = await query(
      'SELECT id, email, full_name, phone, avatar_url, role, status, email_verified, created_at, last_login FROM users WHERE id = $1',
      [req.user.id],
    );
    if (!rows[0]) return res.status(404).json({ error: 'User not found' });

    const sub = await query(
      `SELECT us.*, sp.name as plan_name, sp.name_ar, sp.badge_color, sp.features, sp.price
       FROM user_subscriptions us
       JOIN subscription_plans sp ON sp.id = us.plan_id
       WHERE us.user_id = $1 AND us.status = 'active'
       ORDER BY us.created_at DESC LIMIT 1`,
      [req.user.id],
    );
    res.json({ user: rows[0], subscription: sub[0] || null });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/auth/profile', requireAuth, async (req, res) => {
  try {
    const { query } = getSQL();
    const { full_name, phone, avatar_url } = req.body;
    const rows = await query(
      `UPDATE users SET full_name=$1, phone=$2, avatar_url=$3, updated_at=NOW()
       WHERE id=$4 RETURNING id,email,full_name,phone,avatar_url,role,status`,
      [full_name, phone, avatar_url, req.user.id],
    );
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/auth/change-password', requireAuth, async (req, res) => {
  try {
    const { query } = getSQL();
    const { current_password, new_password } = req.body;
    const rows = await query('SELECT password_hash FROM users WHERE id=$1', [req.user.id]);
    if (!rows[0]) return res.status(404).json({ error: 'User not found' });
    const valid = await bcrypt.compare(current_password, rows[0].password_hash);
    if (!valid) return res.status(401).json({ error: 'Current password incorrect' });
    const hash = await bcrypt.hash(new_password, 10);
    await query('UPDATE users SET password_hash=$1, updated_at=NOW() WHERE id=$2', [hash, req.user.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── SUBSCRIPTION PLANS (public read, admin write) ────────────────────────────
router.get('/subscription-plans', async (_req, res) => {
  try {
    const { query } = getSQL();
    const rows = await query('SELECT * FROM subscription_plans WHERE is_active=true ORDER BY sort_order', []);
    res.json({ data: rows, total: rows.length });
  } catch (err) { res.status(500).json({ error: err.message }); }
});
makeCRUD(router, 'subscription_plans',
  ['name','name_ar','description','description_ar','price','currency','duration_days','features','badge_color','is_active','sort_order'],
  true);

// ── USERS MANAGEMENT (admin only) ─────────────────────────────────────────────
router.get('/admin/users', requireAdmin, async (req, res) => {
  try {
    const { query } = getSQL();
    const { search = '', role = '', status = '', limit = '50', offset = '0' } = req.query;
    const limitN  = Math.min(parseInt(limit) || 50, 200);
    const offsetN = parseInt(offset) || 0;
    let where = 'WHERE 1=1';
    const vals = [];
    if (search) { vals.push(`%${search}%`); where += ` AND (u.full_name ILIKE $${vals.length} OR u.email ILIKE $${vals.length})`; }
    if (role)   { vals.push(role);  where += ` AND u.role = $${vals.length}`; }
    if (status) { vals.push(status); where += ` AND u.status = $${vals.length}`; }

    vals.push(limitN, offsetN);
    const rows = await query(
      `SELECT u.id, u.email, u.full_name, u.phone, u.role, u.status,
              u.email_verified, u.created_at, u.last_login,
              sp.name as plan_name, sp.badge_color,
              us.expires_at as sub_expires
       FROM users u
       LEFT JOIN user_subscriptions us ON us.user_id = u.id AND us.status = 'active'
         AND (us.expires_at IS NULL OR us.expires_at > NOW())
       LEFT JOIN subscription_plans sp ON sp.id = us.plan_id
       ${where} ORDER BY u.created_at DESC
       LIMIT $${vals.length - 1} OFFSET $${vals.length}`,
      vals,
    );
    const countVals = vals.slice(0, -2);
    const total = await query(`SELECT COUNT(*) FROM users u ${where}`, countVals);
    res.json({ data: rows, total: parseInt(total[0].count) });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/admin/users/:id', requireAdmin, async (req, res) => {
  try {
    const { query } = getSQL();
    const { role, status, full_name, email_verified } = req.body;
    const rows = await query(
      `UPDATE users SET role=COALESCE($1,role), status=COALESCE($2,status),
       full_name=COALESCE($3,full_name), email_verified=COALESCE($4,email_verified), updated_at=NOW()
       WHERE id=$5 RETURNING id, email, full_name, role, status`,
      [role, status, full_name, email_verified, req.params.id],
    );
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/admin/users/:id', requireAdmin, async (req, res) => {
  try {
    const { query } = getSQL();
    await query('DELETE FROM users WHERE id=$1', [req.params.id]);
    res.json({ deleted: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Assign subscription to user (admin)
router.post('/admin/users/:id/subscription', requireAdmin, async (req, res) => {
  try {
    const { query } = getSQL();
    const { plan_id, notes, payment_ref } = req.body;
    const plan = await query('SELECT * FROM subscription_plans WHERE id=$1', [plan_id]);
    if (!plan[0]) return res.status(404).json({ error: 'Plan not found' });
    const expiresAt = plan[0].price === 0 ? null :
      new Date(Date.now() + plan[0].duration_days * 86400000).toISOString();
    await query(`UPDATE user_subscriptions SET status='expired' WHERE user_id=$1`, [req.params.id]);
    const rows = await query(
      `INSERT INTO user_subscriptions (user_id, plan_id, status, expires_at, payment_ref, amount_paid, notes)
       VALUES ($1,$2,'active',$3,$4,$5,$6) RETURNING *`,
      [req.params.id, plan_id, expiresAt, payment_ref || null, plan[0].price, notes || null],
    );
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── SITE SETTINGS ────────────────────────────────────────────────────────────
router.get('/settings', async (_req, res) => {
  try {
    const { query } = getSQL();
    const rows = await query('SELECT key, value FROM site_settings', []);
    const settings = {};
    for (const r of rows) settings[r.key] = r.value;
    res.json(settings);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/settings', requireAdmin, async (req, res) => {
  try {
    const { query } = getSQL();
    const updates = req.body;
    for (const [key, value] of Object.entries(updates)) {
      await query(
        `INSERT INTO site_settings (key, value, updated_at) VALUES ($1,$2,NOW())
         ON CONFLICT (key) DO UPDATE SET value=$2, updated_at=NOW()`,
        [key, JSON.stringify(value)],
      );
    }
    res.json({ saved: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── ADMIN STATS ───────────────────────────────────────────────────────────────
router.get('/admin/stats', requireAdmin, async (req, res) => {
  try {
    const { query } = getSQL();
    const [users, members, news, matches, players, revenue] = await Promise.all([
      query('SELECT COUNT(*) FROM users', []),
      query(`SELECT COUNT(*) FROM user_subscriptions WHERE status='active' AND (expires_at IS NULL OR expires_at > NOW())`, []),
      query('SELECT COUNT(*) FROM news', []),
      query('SELECT COUNT(*) FROM matches', []),
      query('SELECT COUNT(*) FROM players', []),
      query(`SELECT COALESCE(SUM(amount_paid),0) as total FROM user_subscriptions WHERE status='active'`, []),
    ]);
    res.json({
      total_users:       parseInt(users[0].count),
      active_members:    parseInt(members[0].count),
      total_news:        parseInt(news[0].count),
      total_matches:     parseInt(matches[0].count),
      total_players:     parseInt(players[0].count),
      total_revenue:     parseFloat(revenue[0].total),
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── API-Football Sync ─────────────────────────────────────────────────────────
const syncRouter = express.Router();

syncRouter.post('/standings', async (_req, res) => {
  try {
    const { query } = getSQL();
    const { data: response, season: s } = await apiFootballWithFallback(
      ss => `/standings?league=${LEAGUE_ID}&season=${ss}`
    );
    const league = response[0]?.league;
    if (!league) return res.status(404).json({ error: 'No standings data' });
    const groups = league.standings || [];
    let best = groups[0] || [];
    for (const g of groups) if (g.length > best.length) best = g;
    const teams = best.map(t => ({
      position: t.rank, team: t.team.name, team_id: t.team.id, team_logo: t.team.logo,
      played: t.all.played, won: t.all.win, drawn: t.all.draw, lost: t.all.lose,
      goals_for: t.all.goals.for, goals_against: t.all.goals.against,
      goal_difference: t.goalsDiff, points: t.points, form: t.form || '', description: t.description || '',
    }));
    await query('DELETE FROM standings', []);
    await query(`INSERT INTO standings (competition,season,teams,created_date) VALUES ($1,$2,$3,$4)`,
      ['Egyptian Premier League', `${s}/${s+1}`, JSON.stringify(teams), new Date().toISOString()]);
    res.json({ synced: true, teams: teams.length, season: `${s}/${s+1}`, updatedAt: new Date().toISOString() });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

syncRouter.post('/squad', async (_req, res) => {
  try {
    const { query } = getSQL();
    const response = await apiFootball(`/players/squads?team=${TEAM_ID}`);
    const players  = response[0]?.players || [];
    let statsMap = {};
    try {
      const { data: statsResp } = await apiFootballWithFallback(
        ss => `/players?team=${TEAM_ID}&league=${LEAGUE_ID}&season=${ss}&page=1`
      );
      for (const item of statsResp) {
        if (item.player?.id) statsMap[item.player.id] = item.statistics?.[0] || {};
      }
    } catch {}
    const posMap = { Goalkeeper:'Goalkeeper', Defender:'Defender', Midfielder:'Midfielder', Attacker:'Forward' };
    await query('DELETE FROM players', []);
    for (const p of players) {
      const st = statsMap[p.id] || {};
      const stats = {
        appearances: st.games?.appearences || 0, goals: st.goals?.total || 0,
        assists: st.goals?.assists || 0, yellow_cards: st.cards?.yellow || 0,
        red_cards: st.cards?.red || 0, rating: parseFloat(st.games?.rating) || null,
      };
      await query(
        `INSERT INTO players (name,number,position,nationality,photo_url,status,is_captain,stats)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [p.name, p.number || null, posMap[p.position] || p.position, 'Egyptian',
         p.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&size=400&background=1B2852&color=FFB81C`,
         'available', false, JSON.stringify(stats)],
      );
    }
    res.json({ synced: true, players: players.length, updatedAt: new Date().toISOString() });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

syncRouter.post('/matches', async (_req, res) => {
  try {
    const { query } = getSQL();
    const { data: fixtures, season: s } = await apiFootballWithFallback(
      ss => `/fixtures?team=${TEAM_ID}&league=${LEAGUE_ID}&season=${ss}`
    );
    let otherMatches = [];
    try {
      const { data } = await apiFootballWithFallback(
        ss => `/fixtures?league=${LEAGUE_ID}&season=${ss}&round=Regular Season - 17`
      );
      otherMatches = data;
    } catch {}
    const ceramicaIds = new Set(fixtures.map(f => f.fixture.id));
    const all = [...fixtures, ...otherMatches.filter(f => !ceramicaIds.has(f.fixture.id))];
    const statusMap = { FT:'finished',AET:'finished',PEN:'finished',NS:'scheduled',TBD:'scheduled','1H':'live','2H':'live',HT:'live',ET:'live',PST:'postponed',CANC:'cancelled' };
    await query('DELETE FROM matches', []);
    for (const f of all) {
      const fix = f.fixture; const home = f.teams.home; const away = f.teams.away;
      await query(
        `INSERT INTO matches (home_team,away_team,date,venue,status,home_score,away_score,competition,match_type,is_ceramica_match,home_team_logo,away_team_logo,api_fixture_id)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) ON CONFLICT (api_fixture_id) DO UPDATE SET status=EXCLUDED.status,home_score=EXCLUDED.home_score,away_score=EXCLUDED.away_score`,
        [home.name, away.name, fix.date, fix.venue?.name, statusMap[fix.status.short] || 'scheduled',
         f.goals.home, f.goals.away, f.league?.name || 'EPL', 'league',
         home.id === TEAM_ID || away.id === TEAM_ID, home.logo, away.logo, fix.id],
      );
    }
    res.json({ synced: true, matches: all.length, season: `${s}/${s+1}`, updatedAt: new Date().toISOString() });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

syncRouter.post('/topscorers', async (_req, res) => {
  try {
    const { query } = getSQL();
    const { data: response, season: s } = await apiFootballWithFallback(
      ss => `/players/topscorers?league=${LEAGUE_ID}&season=${ss}`
    );
    const top10 = response.slice(0, 10);
    const rows = top10.map((item, i) => `${i+1}. ${item.player.name} (${item.statistics[0].team.name}) – ${item.statistics[0].goals.total} goals`).join('\n');
    await query(
      `INSERT INTO news (title,excerpt,content,category,is_club_news,is_featured,is_breaking,status,featured_image,published_at,tags,views)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
      [`EPL Top Scorers ${s}/${s+1}`, `${top10[0]?.player?.name} leads with ${top10[0]?.statistics?.[0]?.goals?.total} goals.`,
       `TOP SCORERS\n\n${rows}`, 'statistics', true, false, false, 'published',
       'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800',
       new Date().toISOString(), ['top scorers','EPL'], 0],
    );
    res.json({ synced: true, topScorers: top10.length, updatedAt: new Date().toISOString() });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

syncRouter.post('/all', async (req, res) => {
  const results = {};
  const base = `${req.protocol}://${req.get('host')}${req.baseUrl.replace('/sync','')}`;
  for (const name of ['standings','squad','matches','topscorers']) {
    try {
      const r = await fetch(`${base}/sync/${name}`, { method:'POST', headers:{'content-type':'application/json'} });
      results[name] = await r.json();
    } catch (err) { results[name] = { error: err.message }; }
  }
  res.json({ synced: true, results, updatedAt: new Date().toISOString() });
});

router.use('/sync', syncRouter);

// ── LIVE ──────────────────────────────────────────────────────────────────────
router.get('/live', async (_req, res) => {
  try { res.json(await apiFootball(`/fixtures?live=all&league=${LEAGUE_ID}`)); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

// ── CRUD TABLES ───────────────────────────────────────────────────────────────
makeCRUD(router, 'matches', [
  'home_team','away_team','date','venue','status','home_score','away_score',
  'competition','match_type','is_ceramica_match','home_team_logo','away_team_logo',
], true);
makeCRUD(router, 'news', [
  'title','excerpt','content','category','league','status','featured_image',
  'is_featured','is_breaking','is_club_news','published_at','tags','views',
], true);
makeCRUD(router, 'players', [
  'name','number','position','position_detail','nationality','photo_url','status','is_captain','stats',
], true);
makeCRUD(router, 'media',    ['title','type','url','thumbnail_url','created_date'], true);
makeCRUD(router, 'polls',    ['question','options','total_votes','is_active','created_date'], true);
makeCRUD(router, 'comments', ['content','author_name','status','news_id','created_date'], true);
makeCRUD(router, 'standings',['competition','season','teams','created_date'], true);

app.use('/api', router);
app.use('/.netlify/functions/api', router);

export const handler = serverless(app);
