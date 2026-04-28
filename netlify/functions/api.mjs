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
const JWT_SECRET       = process.env.JWT_SECRET || 'ceramica-cleopatra-secret-2025';
// Flashscore (sportdb.dev)
const FS_KEY           = process.env.FLASHSCORE_KEY || 'zmO3NRRbfutiLMeoToANRALmnTeHcPylzbYcuSED';
const FS_BASE          = 'https://api.sportdb.dev';
const EGYPT_ID         = 69;
const EPL_SLUG         = 'premier-league';
const EPL_ID           = 'xbpjAGxq';
const SEASON           = '2025-2026';
const CERAMICA_SLUG    = 'ceramica-cleopatra';
const CERAMICA_ID      = 'ATasWtPS';
const LOGO_CDN         = 'https://static.flashscore.com/res/image/data/';

// ─── DB helper ────────────────────────────────────────────────────────────────
const getSQL = () => {
  const s = neon(process.env.DATABASE_URL);
  return { query: (text, values) => s.query(text, values) };
};

// ─── Flashscore helper ────────────────────────────────────────────────────────
async function flashscore(path) {
  const url = path.startsWith('http') ? path : `${FS_BASE}${path}`;
  const res = await fetch(url, { headers: { 'X-API-Key': FS_KEY } });
  if (!res.ok) throw new Error(`Flashscore ${res.status}: ${path}`);
  return res.json();
}

// Build full logo URL from partial image string
const fsLogo = (part) => part ? (part.startsWith('http') ? part : `${LOGO_CDN}${part}`) : null;

// EPL base path
const EPL_PATH = `/api/flashscore/football/egypt:${EGYPT_ID}/${EPL_SLUG}:${EPL_ID}`;

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

// ── Flashscore Sync ───────────────────────────────────────────────────────────
const syncRouter = express.Router();

// ── Standings ────────────────────────────────────────────────────────────────
syncRouter.post('/standings', async (_req, res) => {
  try {
    const { query } = getSQL();

    // Fetch standings + results (to build logo map)
    const [standingsRaw, resultsRaw] = await Promise.all([
      flashscore(`${EPL_PATH}/${SEASON}/standings`),
      flashscore(`${EPL_PATH}/${SEASON}/results?page=1`).catch(() => []),
    ]);

    // Build teamId → logo map from match data
    const logoMap = {};
    for (const m of (Array.isArray(resultsRaw) ? resultsRaw : [])) {
      if (m.homeParticipantIds && m.homeLogo) logoMap[m.homeParticipantIds] = fsLogo(m.homeLogo);
      if (m.awayParticipantIds && m.awayLogo)  logoMap[m.awayParticipantIds] = fsLogo(m.awayLogo);
    }

    const teams = (Array.isArray(standingsRaw) ? standingsRaw : []).map(t => {
      const [gf, ga] = (t.goals || '0:0').split(':').map(Number);
      const form = (t.events || [])
        .filter(e => e.eventType !== 'upcoming')
        .map(e => e.eventSymbol === 'W' ? 'W' : e.eventSymbol === 'D' ? 'D' : 'L')
        .join('');
      return {
        position:       parseInt(t.rank),
        team:           t.teamName,
        team_id:        t.teamId,
        team_logo:      logoMap[t.teamId] || `https://ui-avatars.com/api/?name=${encodeURIComponent(t.teamName)}&size=100&background=1B2852&color=FFB81C`,
        played:         parseInt(t.matches || 0),
        won:            parseInt(t.winsRegular || t.wins || 0),
        drawn:          parseInt(t.draws || 0),
        lost:           parseInt(t.lossesRegular || 0),
        goals_for:      gf || 0,
        goals_against:  ga || 0,
        goal_difference: parseInt(t.goalDiff || 0),
        points:         parseInt(t.points || 0),
        form,
        description:    t.rankClass || '',
        rank_color:     t.rankColor || '',
      };
    });

    await query('DELETE FROM standings', []);
    await query(
      `INSERT INTO standings (competition, season, teams, created_date) VALUES ($1,$2,$3,$4)`,
      ['Egyptian Premier League', SEASON, JSON.stringify(teams), new Date().toISOString()],
    );

    res.json({ synced: true, teams: teams.length, season: SEASON, updatedAt: new Date().toISOString() });
  } catch (err) {
    console.error('sync/standings', err);
    res.status(500).json({ error: err.message });
  }
});

// ── Squad ────────────────────────────────────────────────────────────────────
syncRouter.post('/squad', async (_req, res) => {
  try {
    const { query } = getSQL();
    const teamData = await flashscore(`/api/flashscore/team/${CERAMICA_SLUG}/${CERAMICA_ID}`);

    // Collect all players from all squad groups, de-duplicate by id
    const seen = new Set();
    const allPlayers = [];
    for (const group of (teamData.squad || [])) {
      for (const p of (group.players || [])) {
        if (!seen.has(p.id) && p.position !== 'Coach') {
          seen.add(p.id);
          allPlayers.push(p);
        }
      }
    }

    const posMap = { Goalkeepers:'Goalkeeper', Defenders:'Defender', Midfielders:'Midfielder', Forwards:'Forward' };

    // Fetch player details + stats for every player (rate limit: 3 RPS → sleep 400ms)
    const sleep = (ms) => new Promise(r => setTimeout(r, ms));
    const playerDetails = {};
    for (const p of allPlayers) {
      try {
        const detail = await flashscore(`/api/flashscore/player/${p.slug}/${p.id}`);
        playerDetails[p.id] = detail;
        await sleep(400);
      } catch (_) {}
    }

    await query('DELETE FROM players', []);
    for (const p of allPlayers) {
      const detail = playerDetails[p.id] || {};
      const name = `${p.firstName} ${p.lastName}`.trim();
      const photo = detail.photo ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=400&background=1B2852&color=FFB81C&bold=true`;

      // Extract current-season stats from careers
      const seasonEntry = (detail.careers?.league || []).find(c => c.season === SEASON && c.teamId === CERAMICA_ID)
        || (detail.careers?.league || [])[0]
        || null;
      const sv = (key) => (seasonEntry?.stats || []).find(s => s.name === key)?.value ?? 0;

      const stats = {
        appearances:      sv('Matches Played'),
        goals:            sv('Goals'),
        assists:          sv('Assists'),
        yellow_cards:     sv('Yellow Cards'),
        red_cards:        sv('Red Cards'),
        rating:           sv('Rating') || null,
        save_percentage:  sv('Save Percentage') || null,
        clean_sheets:     sv('Shutouts') || null,
        minutes_played:   sv('Minutes Played') || null,
        dob:              detail.dob || null,
        market_value:     detail.marketValue || null,
        contract_expires: detail.contractExpires || null,
        flashscore_id:    p.id,
        flashscore_slug:  p.slug,   // store the real slug for future stat updates
        stats_season:     seasonEntry?.season || SEASON,
        stats_updated_at: new Date().toISOString(),
      };

      await query(
        `INSERT INTO players (name, number, position, nationality, photo_url, status, is_captain, stats)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [
          name,
          p.jerseyNumber ? parseInt(p.jerseyNumber) || null : null,
          posMap[p.position] || p.position || 'Midfielder',
          p.countryName || 'Egyptian',
          photo,
          detail.playerStatus === 'INJURED' ? 'injured' : 'available',
          false,
          JSON.stringify(stats),
        ],
      );
    }

    res.json({
      synced: true,
      players: allPlayers.length,
      withPhotos: Object.keys(playerDetails).length,
      team: teamData.teamName,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('sync/squad', err);
    res.status(500).json({ error: err.message });
  }
});

// ── Player Stats only (no re-insert, just UPDATE stats) ─────────────────────
syncRouter.post('/player-stats', async (_req, res) => {
  try {
    const { query } = getSQL();
    const sleep = (ms) => new Promise(r => setTimeout(r, ms));

    // 1. Build a fresh id→slug map from the Flashscore team endpoint
    const teamData = await flashscore(`/api/flashscore/team/${CERAMICA_SLUG}/${CERAMICA_ID}`).catch(() => ({}));
    const slugMap = {};
    for (const group of (teamData.squad || [])) {
      for (const p of (group.players || [])) {
        if (p.id && p.slug) slugMap[p.id] = p.slug;
      }
    }

    // 2. Fetch all DB players with a flashscore_id
    const rawResult = await query(
      `SELECT id, name, stats FROM players WHERE stats->>'flashscore_id' IS NOT NULL`,
      []
    );
    // neon() can return an array directly OR { rows: [] }
    const rows = Array.isArray(rawResult) ? rawResult : (rawResult?.rows || []);

    if (rows.length === 0) {
      return res.json({ synced: true, updated: 0, message: 'No players with flashscore_id. Run Squad sync first.' });
    }

    let updated = 0;
    for (const row of rows) {
      const existingStats = row.stats || {};
      const fsId = existingStats.flashscore_id;
      if (!fsId) continue;

      // Use the real slug from slugMap, then stored slug, then generated slug
      const slug = slugMap[fsId]
        || existingStats.flashscore_slug
        || row.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

      try {
        const detail = await flashscore(`/api/flashscore/player/${slug}/${fsId}`);

        const seasonEntry = (detail.careers?.league || []).find(c => c.season === SEASON && c.teamId === CERAMICA_ID)
          || (detail.careers?.league || []).find(c => c.teamId === CERAMICA_ID)
          || (detail.careers?.league || [])[0]
          || null;
        const sv = (key) => (seasonEntry?.stats || []).find(s => s.name === key)?.value ?? 0;

        const newStats = {
          ...existingStats,
          flashscore_slug:  slug,
          appearances:      sv('Matches Played'),
          goals:            sv('Goals'),
          assists:          sv('Assists'),
          yellow_cards:     sv('Yellow Cards'),
          red_cards:        sv('Red Cards'),
          rating:           sv('Rating') || null,
          save_percentage:  sv('Save Percentage') || null,
          clean_sheets:     sv('Shutouts') || null,
          minutes_played:   sv('Minutes Played') || null,
          dob:              detail.dob || existingStats.dob || null,
          market_value:     detail.marketValue || existingStats.market_value || null,
          contract_expires: detail.contractExpires || existingStats.contract_expires || null,
          stats_season:     seasonEntry?.season || SEASON,
          stats_updated_at: new Date().toISOString(),
        };

        const status = detail.playerStatus === 'INJURED' ? 'injured' : 'available';
        await query(
          `UPDATE players SET stats = $1, status = $2 WHERE id = $3`,
          [JSON.stringify(newStats), status, row.id]
        );
        updated++;
        await sleep(400);
      } catch (err) {
        console.warn(`Skipping player ${row.name}:`, err.message);
      }
    }

    res.json({ synced: true, updated, total: rows.length, season: SEASON, updatedAt: new Date().toISOString() });
  } catch (err) {
    console.error('sync/player-stats', err);
    res.status(500).json({ error: err.message });
  }
});

// ── Matches ────────────────────────────────────────────────────────────────
// Helper: fetch all pages from a paginated endpoint
async function fetchAllPages(basePath) {
  const all = [];
  for (let page = 1; page <= 5; page++) {
    const data = await flashscore(`${basePath}?page=${page}`).catch(() => null);
    if (!Array.isArray(data) || data.length === 0) break;
    all.push(...data);
    if (data.length < 50) break; // assume last page if fewer than 50 items
  }
  return all;
}

syncRouter.post('/matches', async (_req, res) => {
  try {
    const { query } = getSQL();

    const [resultsRaw, fixturesRaw] = await Promise.all([
      fetchAllPages(`${EPL_PATH}/${SEASON}/results`),
      fetchAllPages(`${EPL_PATH}/${SEASON}/fixtures`),
    ]);

    const stageMap = {
      '3':'finished','242':'finished',
      '12':'live','13':'live','38':'live','2':'live','6':'live',
      '1':'scheduled','7':'finished'
    };

    const processMatch = (m) => {
      const isCeramica = m.homeParticipantIds === CERAMICA_ID || m.awayParticipantIds === CERAMICA_ID;
      const status = stageMap[String(m.eventStageId)] || (m.eventStage === 'FINISHED' ? 'finished' : 'scheduled');
      const isPlayed = status !== 'scheduled';
      return {
        home_team:         m.homeName || '',
        away_team:         m.awayName || '',
        date:              m.startDateTimeUtc
                             || new Date(parseInt(m.startUtime || m.startTime || 0) * 1000).toISOString(),
        status,
        home_score:        isPlayed ? (parseInt(m.homeFullTimeScore ?? m.homeScore ?? 0) || 0) : 0,
        away_score:        isPlayed ? (parseInt(m.awayFullTimeScore ?? m.awayScore ?? 0) || 0) : 0,
        competition:       m.tournamentName || 'Egyptian Premier League',
        match_type:        'league',
        is_ceramica_match: isCeramica,
        home_team_logo:    fsLogo(m.homeLogo),
        away_team_logo:    fsLogo(m.awayLogo),
        round:             m.round || null,
        api_fixture_id:    m.eventId || null,
      };
    };

    const allMatches = [
      ...resultsRaw,
      ...fixturesRaw,
    ].map(processMatch);

    if (allMatches.length === 0) {
      return res.status(200).json({ synced: false, matches: 0, message: 'API returned no data' });
    }

    // Upsert: delete only if we have fresh data
    await query('DELETE FROM matches', []);
    for (const m of allMatches) {
      await query(
        `INSERT INTO matches
           (home_team, away_team, date, status, home_score, away_score,
            competition, match_type, is_ceramica_match, home_team_logo, away_team_logo, round, api_fixture_id)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
        [
          m.home_team, m.away_team, m.date, m.status,
          m.home_score, m.away_score, m.competition, m.match_type,
          m.is_ceramica_match, m.home_team_logo, m.away_team_logo, m.round, m.api_fixture_id,
        ],
      );
    }

    res.json({
      synced:   true,
      matches:  allMatches.length,
      ceramica: allMatches.filter(m => m.is_ceramica_match).length,
      season:   SEASON,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('sync/matches error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── Top Scorers ────────────────────────────────────────────────────────────
syncRouter.post('/topscorers', async (_req, res) => {
  try {
    const { query } = getSQL();
    const standings = await flashscore(`${EPL_PATH}/${SEASON}/standings`).catch(() => []);
    const top5 = (Array.isArray(standings) ? standings : []).slice(0, 5);
    const rows = top5.map((t, i) => `${i+1}. ${t.teamName} — ${t.points} pts (${t.goals} goals)`).join('\n');
    const title = `Egyptian Premier League ${SEASON} — Latest Standings`;
    const excerpt = top5[0] ? `${top5[0].teamName} leads the table with ${top5[0].points} points` : 'Updated standings';
    await query(
      `INSERT INTO news (title,excerpt,content,category,is_club_news,is_featured,is_breaking,status,featured_image,published_at,tags,views)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
      [title, excerpt, `EGYPTIAN PREMIER LEAGUE ${SEASON}\n\nLATEST STANDINGS\n\n${rows}`,
       'league', false, false, false, 'published',
       'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800',
       new Date().toISOString(), ['standings', 'EPL', SEASON], 0],
    );
    res.json({ synced: true, season: SEASON, updatedAt: new Date().toISOString() });
  } catch (err) {
    console.error('sync/topscorers', err);
    res.status(500).json({ error: err.message });
  }
});

// ── News from Ceramica Matches (real match reports) ─────────────────────────
syncRouter.post('/news', async (_req, res) => {
  try {
    const { query } = getSQL();
    const sleep = (ms) => new Promise(r => setTimeout(r, ms));

    // Get all EPL results
    const resultsRaw = await flashscore(`${EPL_PATH}/${SEASON}/results?page=1`).catch(() => []);
    const fixturesRaw = await flashscore(`${EPL_PATH}/${SEASON}/fixtures?page=1`).catch(() => []);

    // Filter Ceramica matches only
    const ceramicaResults  = (Array.isArray(resultsRaw)  ? resultsRaw  : []).filter(m =>
      m.homeParticipantIds === CERAMICA_ID || m.awayParticipantIds === CERAMICA_ID
    );
    const ceramicaFixtures = (Array.isArray(fixturesRaw) ? fixturesRaw : []).filter(m =>
      m.homeParticipantIds === CERAMICA_ID || m.awayParticipantIds === CERAMICA_ID
    );

    const matchImages = [
      'https://images.unsplash.com/photo-1508768787810-6adc1f613514?w=800',
      'https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=800',
      'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800',
      'https://images.unsplash.com/photo-1434648957308-5e6a859697e8?w=800',
      'https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?w=800',
      'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=800',
      'https://images.unsplash.com/photo-1596526131083-e8c633c948d2?w=800',
    ];

    const articlesCreated = [];

    // ── Match reports for finished Ceramica matches
    for (let i = 0; i < ceramicaResults.length; i++) {
      const m = ceramicaResults[i];
      const isCeramicaHome = m.homeParticipantIds === CERAMICA_ID;
      const ceramicaScore  = isCeramicaHome ? parseInt(m.homeFullTimeScore || m.homeScore || 0) : parseInt(m.awayFullTimeScore || m.awayScore || 0);
      const opponentScore  = isCeramicaHome ? parseInt(m.awayFullTimeScore || m.awayScore || 0) : parseInt(m.homeFullTimeScore || m.homeScore || 0);
      const opponent       = isCeramicaHome ? m.awayName : m.homeName;
      const opponentLogo   = isCeramicaHome ? fsLogo(m.awayLogo) : fsLogo(m.homeLogo);
      const venue          = isCeramicaHome ? 'Arab Contractors Stadium, Cairo' : `${opponent} Stadium`;
      const matchDate      = new Date(m.startDateTimeUtc || parseInt(m.startUtime || 0) * 1000);
      const round          = m.round || '';

      const result = ceramicaScore > opponentScore ? 'WIN' : ceramicaScore < opponentScore ? 'LOSS' : 'DRAW';
      const resultAr = result === 'WIN' ? 'فوز' : result === 'LOSS' ? 'خسارة' : 'تعادل';

      // Fetch match events for detail (with rate limiting)
      let events = [];
      try {
        const detail = await flashscore(`/api/flashscore/match/${m.eventId}/details?with_events=true`);
        events = detail.events || [];
        await sleep(400);
      } catch (_) {}

      // Build event timeline
      const goals = events.filter(e => {
        const types = Array.isArray(e.incidentType) ? e.incidentType : [e.incidentType];
        return types.includes('3'); // Goal type
      });
      const cards = events.filter(e => {
        const types = Array.isArray(e.incidentType) ? e.incidentType : [e.incidentType];
        return types.includes('1') || types.includes('2');
      });

      const goalLines = goals.map(g => {
        const scorer = Array.isArray(g.incidentPlayerName) ? g.incidentPlayerName[0] : g.incidentPlayerName;
        const assist  = Array.isArray(g.incidentPlayerName) && g.incidentPlayerName[1] ? ` (Assist: ${g.incidentPlayerName[1]})` : '';
        const side    = g.incidentSide === '1' ? 'Ceramica Cleopatra' : opponent;
        return `⚽ ${g.incidentTime} — ${scorer}${assist} (${side})`;
      }).join('\n');

      const title = result === 'WIN'
        ? `Ceramica Cleopatra Defeat ${opponent} ${ceramicaScore}-${opponentScore}`
        : result === 'DRAW'
        ? `Ceramica Cleopatra Draw ${ceramicaScore}-${ceramicaScore} Against ${opponent}`
        : `Ceramica Cleopatra Fall ${ceramicaScore}-${opponentScore} to ${opponent}`;

      const excerpt = `${resultAr}! سيراميكا كليوباترا ${ceramicaScore}-${opponentScore} ${opponent} في ${round}.`;

      const content = `${title}

MATCH REPORT — ${round}
${matchDate.toLocaleDateString('en-GB', { day:'numeric', month:'long', year:'numeric' })}
Venue: ${venue}

FINAL SCORE
Ceramica Cleopatra ${ceramicaScore} — ${opponentScore} ${opponent}

${goalLines ? `GOALS\n${goalLines}\n` : ''}
${cards.length > 0 ? `CARDS\n${cards.map(c => {
  const player = Array.isArray(c.incidentPlayerName) ? c.incidentPlayerName[0] : c.incidentPlayerName;
  const types = Array.isArray(c.incidentType) ? c.incidentType : [c.incidentType];
  const cardType = types.includes('2') ? '🟥 Red Card' : '🟨 Yellow Card';
  const side = c.incidentSide === '1' ? 'Ceramica Cleopatra' : opponent;
  return `${cardType} ${c.incidentTime} — ${player} (${side})`;
}).join('\n')}\n` : ''}
The match was played at ${venue} in Round ${round.replace('Round ', '')} of the Egyptian Premier League ${SEASON}.`;

      const img = matchImages[i % matchImages.length];

      await query(
        `INSERT INTO news (title,excerpt,content,category,is_club_news,is_featured,is_breaking,status,featured_image,published_at,tags,views)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
        [title, excerpt, content, 'match_report', true,
         result === 'WIN', false, 'published', img,
         matchDate.toISOString(), ['match report', result.toLowerCase(), 'Ceramica', SEASON, opponent], 0],
      );
      articlesCreated.push(title);
    }

    // ── Upcoming match previews
    for (const m of ceramicaFixtures.slice(0, 3)) {
      const isCeramicaHome = m.homeParticipantIds === CERAMICA_ID;
      const opponent   = isCeramicaHome ? m.awayName : m.homeName;
      const matchDate  = new Date(m.startDateTimeUtc || parseInt(m.startUtime || 0) * 1000);
      const round      = m.round || '';
      const title      = `Preview: Ceramica Cleopatra vs ${opponent} — ${round}`;
      const excerpt    = `Ceramica Cleopatra face ${opponent} in an important EPL ${SEASON} fixture.`;
      const content    = `MATCH PREVIEW\n\nCeramica Cleopatra are set to face ${opponent} in ${round} of the Egyptian Premier League ${SEASON}.\n\nThe match is scheduled for ${matchDate.toLocaleDateString('en-GB', { day:'numeric', month:'long', year:'numeric' })} at ${matchDate.toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit' })} (Cairo time).\n\nBoth teams will be looking to secure an important three points in this highly anticipated fixture.`;

      await query(
        `INSERT INTO news (title,excerpt,content,category,is_club_news,is_featured,is_breaking,status,featured_image,published_at,tags,views)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
        [title, excerpt, content, 'preview', true, false, false, 'published',
         matchImages[3], matchDate.toISOString(),
         ['preview', 'upcoming', 'Ceramica', SEASON, opponent], 0],
      );
      articlesCreated.push(title);
    }

    res.json({ synced: true, articles: articlesCreated.length, titles: articlesCreated, updatedAt: new Date().toISOString() });
  } catch (err) {
    console.error('sync/news', err);
    res.status(500).json({ error: err.message });
  }
});

// ── Upcoming Fixtures (detailed, with venue + preview news) ──────────────────
syncRouter.post('/fixtures', async (_req, res) => {
  try {
    const { query } = getSQL();
    const sleep = (ms) => new Promise(r => setTimeout(r, ms));

    const fixturesRaw = await flashscore(`${EPL_PATH}/${SEASON}/fixtures?page=1`).catch(() => []);
    const ceramicaFixtures = (Array.isArray(fixturesRaw) ? fixturesRaw : []).filter(m =>
      m.homeParticipantIds === CERAMICA_ID || m.awayParticipantIds === CERAMICA_ID
    );

    const previewImages = [
      'https://images.unsplash.com/photo-1516912481808-3406841bd33c?w=800',
      'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=800',
      'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800',
    ];

    const synced = [];

    for (let idx = 0; idx < ceramicaFixtures.length; idx++) {
      const m = ceramicaFixtures[idx];
      const isCeramicaHome = m.homeParticipantIds === CERAMICA_ID;
      const opponent    = isCeramicaHome ? m.awayName : m.homeName;
      const opponentId  = isCeramicaHome ? m.awayParticipantIds : m.homeParticipantIds;
      const matchDate   = new Date(m.startDateTimeUtc || parseInt(m.startUtime || 0) * 1000);
      const round       = m.round || `Round ${idx + 5}`;
      const homeLogo    = fsLogo(m.homeLogo);
      const awayLogo    = fsLogo(m.awayLogo);

      // Get venue details from match detail endpoint
      let venue = null;
      let venueCity = null;
      let capacity = null;
      try {
        const detail = await flashscore(`/api/flashscore/match/${m.eventId}/details?with_events=true`);
        venue     = detail.venue     || null;
        venueCity = detail.venueCity || null;
        capacity  = detail.capacity  || null;
        await sleep(400);
      } catch (_) {}

      const venueStr = venue ? `${venue}${venueCity ? ', ' + venueCity : ''}` : null;

      // Upsert into matches table
      await query(
        `INSERT INTO matches
           (home_team, away_team, date, venue, status, competition, match_type,
            is_ceramica_match, home_team_logo, away_team_logo)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
        [
          m.homeName, m.awayName, matchDate.toISOString(),
          venueStr, 'scheduled',
          m.tournamentName || 'Egyptian Premier League',
          'league', true, homeLogo, awayLogo,
        ],
      );

      // Generate preview news article
      const homeAway  = isCeramicaHome ? 'home' : 'away';
      const title     = `${round}: Ceramica Cleopatra ${isCeramicaHome ? 'host' : 'travel to face'} ${opponent}`;
      const dateStr   = matchDate.toLocaleDateString('en-GB', { weekday:'long', day:'numeric', month:'long', year:'numeric' });
      const timeStr   = matchDate.toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit' }) + ' (Cairo Time)';
      const excerpt   = `Ceramica Cleopatra face ${opponent} in ${round} of the Egyptian Premier League ${SEASON} on ${dateStr}.`;
      const content   = `MATCH PREVIEW — ${round}
Egyptian Premier League ${SEASON}

📅 Date: ${dateStr}
⏰ Time: ${timeStr}
🏟️ Venue: ${venueStr || (isCeramicaHome ? 'Arab Contractors Stadium, Cairo' : `${opponent}'s Stadium`)}
${capacity ? `👥 Capacity: ${capacity} fans` : ''}

Ceramica Cleopatra play ${homeAway} against ${opponent} in what promises to be an exciting fixture in the Egyptian Premier League ${SEASON} season.

${isCeramicaHome
  ? `The Pharaohs will be looking to use their home advantage at ${venueStr || 'their stadium'} to secure all three points and strengthen their position in the table.`
  : `Ceramica Cleopatra travel to face ${opponent} looking to pick up a positive result away from home.`
}

Both clubs will be eager to secure crucial points as the season progresses. This fixture is one to watch for all football fans.

Head-to-head record and team news will be available closer to kick-off.

#CeramicaCleopatra #EPL #EgyptianPremierLeague`;

      await query(
        `INSERT INTO news
           (title, excerpt, content, category, is_club_news, is_featured, is_breaking, status, featured_image, published_at, tags, views)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
        [title, excerpt, content, 'preview', true, false, false, 'published',
         previewImages[idx % previewImages.length],
         new Date().toISOString(),
         ['preview', 'upcoming', 'Ceramica', SEASON, opponent, round], 0],
      );

      synced.push({ match: `${m.homeName} vs ${m.awayName}`, date: matchDate.toISOString(), venue: venueStr, round });
    }

    res.json({ synced: true, fixtures: synced.length, details: synced, updatedAt: new Date().toISOString() });
  } catch (err) {
    console.error('sync/fixtures', err);
    res.status(500).json({ error: err.message });
  }
});

// ── Sync All ──────────────────────────────────────────────────────────────
syncRouter.post('/all', async (req, res) => {
  const results = {};
  const base = `${req.protocol}://${req.get('host')}${req.baseUrl.replace('/sync', '')}`;
  for (const name of ['standings', 'squad', 'matches', 'fixtures', 'topscorers', 'news']) {
    try {
      const r = await fetch(`${base}/sync/${name}`, { method: 'POST', headers: { 'content-type': 'application/json' } });
      results[name] = await r.json();
    } catch (err) { results[name] = { error: err.message }; }
  }
  res.json({ synced: true, results, updatedAt: new Date().toISOString() });
});

router.use('/sync', syncRouter);

// ── LIVE ──────────────────────────────────────────────────────────────────────
router.get('/live', async (_req, res) => {
  try {
    const data = await flashscore(`/api/flashscore/football/egypt:${EGYPT_ID}/${EPL_SLUG}:${EPL_ID}/live`);
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── EPL Live (all matches today) ─────────────────────────────────────────────
router.get('/live/all', async (_req, res) => {
  try {
    const data = await flashscore(`/api/flashscore/football/live?tz=2`);
    const egypt = Array.isArray(data) ? data.filter(m => m.tournamentTemplateId === EPL_ID) : [];
    res.json(egypt);
  } catch (err) { res.status(500).json({ error: err.message }); }
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

// ── Match Details + Stats (from Flashscore, by eventId) ─────────────────────
router.get('/match-details/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params;
    const [details, stats, lineups] = await Promise.all([
      flashscore(`/api/flashscore/match/${eventId}/details?with_events=true`).catch(() => ({})),
      flashscore(`/api/flashscore/match/${eventId}/stats`).catch(() => []),
      flashscore(`/api/flashscore/match/${eventId}/lineups`).catch(() => ({})),
    ]);

    // Normalise stats array (may be nested by period)
    const statsArr = Array.isArray(stats)
      ? stats.find(p => p.period === 'Match')?.stats || stats.flatMap(p => p.stats || p)
      : [];

    res.json({
      eventId,
      homeName:  details.homeName  || '',
      awayName:  details.awayName  || '',
      homeLogo:  details.homeLogo  || '',
      awayLogo:  details.awayLogo  || '',
      referee:   details.referee   || null,
      venue:     details.venue     || null,
      venueCity: details.venueCity || null,
      capacity:  details.capacity  || null,
      events:    details.events    || [],
      stats:     statsArr,
      lineups:   lineups,
    });
  } catch (err) {
    console.error('match-details', err);
    res.status(500).json({ error: err.message });
  }
});

// ── Ceramica Fixtures: last result + next match (from DB) ───────────────────
router.get('/ceramica-fixtures', async (_req, res) => {
  try {
    const { query } = getSQL();
    const [finishedRes, scheduledRes] = await Promise.all([
      query(
        `SELECT * FROM matches WHERE is_ceramica_match = true AND status = 'finished'
         ORDER BY date DESC LIMIT 1`,
        []
      ),
      query(
        `SELECT * FROM matches WHERE is_ceramica_match = true AND status = 'scheduled'
         ORDER BY date ASC LIMIT 1`,
        []
      ),
    ]);

    const finishedRows  = Array.isArray(finishedRes)  ? finishedRes  : (finishedRes?.rows  || []);
    const scheduledRows = Array.isArray(scheduledRes) ? scheduledRes : (scheduledRes?.rows || []);
    const lastResult = finishedRows[0]  || null;
    const nextMatch  = scheduledRows[0] || null;

    res.json({ lastResult, nextMatch });
  } catch (err) {
    console.error('ceramica-fixtures', err);
    res.status(500).json({ error: err.message, lastResult: null, nextMatch: null });
  }
});

// ── Live Scores (direct proxy from Flashscore, no DB) ────────────────────────
// Egyptian tournament IDs (main + relegation group + cup etc.)
const EGYPT_TOURNAMENT_IDS = new Set([
  '9QQBJ8Mn', // Premier League main
  'oWnUDxkJ', // Premier League - Relegation Group (old)
  '8djnQlDc', // Premier League - Relegation Group (current)
  'xbpjAGxq', // template id fallback
]);

const LIVE_STAGE_IDS = new Set(['12','13','38','2','6','31','32']); // flashscore live stageIds
const HT_STAGE_IDS   = new Set(['40','41']);

router.get('/live-scores', async (_req, res) => {
  try {
    const raw = await flashscore('/api/flashscore/football/live');
    const matches = (Array.isArray(raw) ? raw : []).filter(m => {
      const tName = (m.tournamentName || '').toLowerCase();
      return EGYPT_TOURNAMENT_IDS.has(m.tournamentId) || tName.includes('egypt');
    });

    const now = Math.floor(Date.now() / 1000);

    const mapped = matches.map(m => {
      const stageId = String(m.eventStageId || '');
      const isLive = LIVE_STAGE_IDS.has(stageId) || m.eventStage === 'LIVE';
      const isHT   = HT_STAGE_IDS.has(stageId)   || m.eventStage === 'HALFTIME';
      const isFT   = m.eventStage === 'FINISHED'  || stageId === '4' || stageId === '3';

      // Compute elapsed minutes from stageStartUtime (when current half started)
      let minute = null;
      if (isLive && m.stageStartUtime) {
        const elapsed = Math.max(0, now - parseInt(m.stageStartUtime));
        const half = stageId === '13' ? 2 : 1; // stageId 13 = 2nd half
        const base = half === 2 ? 45 : 0;
        minute = Math.min(base + Math.floor(elapsed / 60) + 1, half === 2 ? 90 : 45);
      } else if (isLive && m.gameTime && m.gameTime !== '') {
        minute = parseInt(m.gameTime);
      }

      return {
        event_id:    m.eventId,
        home_team:   m.homeName,
        away_team:   m.awayName,
        home_logo:   m.homeLogo,
        away_logo:   m.awayLogo,
        home_score:  isFT ? (m.homeFullTimeScore ?? m.homeScore ?? 0) : (m.homeScore ?? 0),
        away_score:  isFT ? (m.awayFullTimeScore ?? m.awayScore ?? 0) : (m.awayScore ?? 0),
        status:      isHT ? 'halftime' : isLive ? 'live' : isFT ? 'finished' : 'scheduled',
        minute,
        competition: m.tournamentName,
        date:        m.startDateTimeUtc,
        start_utime: m.startUtime,
        stage_start_utime: m.stageStartUtime || null,
        stage_id:    stageId,
      };
    });

    // Sort: live first, then halftime, then scheduled by start time, then finished
    const order = { live: 0, halftime: 1, scheduled: 2, finished: 3 };
    mapped.sort((a, b) => (order[a.status] ?? 9) - (order[b.status] ?? 9));

    res.json({ matches: mapped, count: mapped.length, updatedAt: new Date().toISOString() });
  } catch (err) {
    console.error('live-scores error:', err.message);
    res.status(500).json({ error: err.message, matches: [] });
  }
});

app.use('/api', router);
app.use('/.netlify/functions/api', router);

export const handler = serverless(app);
