import express from 'express';
import serverless from 'serverless-http';
import cors from 'cors';
import { neon } from '@neondatabase/serverless';

const app = express();
app.use(cors());
app.use(express.json());

// ─── Constants ────────────────────────────────────────────────────────────────
const LEAGUE_ID      = 233;   // Egyptian Premier League
const TEAM_ID        = 14651; // Ceramica Cleopatra FC
const SEASON         = 2025;  // 2025-26 season (current)
const SEASON_FALLBACK = 2024; // fallback if 2025 not available on plan

// ─── DB helper ────────────────────────────────────────────────────────────────
const getSQL = () => {
  const s = neon(process.env.DATABASE_URL);
  return { query: (text, values) => s.query(text, values) };
};

// ─── API-Football helper ───────────────────────────────────────────────────────
async function apiFootball(path) {
  const apiKey = process.env.API_FOOTBALL_KEY || 'd38e461170b465ee0312915c9bcad93d';
  const res = await fetch(`https://v3.football.api-sports.io${path}`, {
    headers: { 'x-apisports-key': apiKey },
  });
  if (!res.ok) throw new Error(`API-Football ${res.status}: ${path}`);
  const data = await res.json();
  if (data.errors && Object.keys(data.errors).length > 0) {
    const errMsg = JSON.stringify(data.errors);
    // If season not available on free plan, signal for fallback
    if (errMsg.includes('Free plans do not have access to this season')) {
      const err = new Error(errMsg);
      err.seasonFallback = true;
      throw err;
    }
    throw new Error(errMsg);
  }
  return data.response;
}

// Try season, fall back automatically to SEASON_FALLBACK if plan restricts
async function apiFootballWithFallback(pathTemplate) {
  try {
    return { data: await apiFootball(pathTemplate(SEASON)), season: SEASON };
  } catch (err) {
    if (err.seasonFallback) {
      return { data: await apiFootball(pathTemplate(SEASON_FALLBACK)), season: SEASON_FALLBACK };
    }
    throw err;
  }
}

// ─── SQL helpers ──────────────────────────────────────────────────────────────
const SORT_FIELDS = {
  matches:   ['date', 'created_at', 'status'],
  news:      ['published_at', 'created_at', 'views', 'title'],
  players:   ['number', 'name', 'created_at', 'position'],
  media:     ['created_date', 'created_at'],
  polls:     ['created_date', 'created_at'],
  comments:  ['created_date', 'created_at'],
  standings: ['created_date', 'created_at'],
};

const BOOL_FIELDS = {
  matches:  ['is_ceramica_match'],
  news:     ['is_featured', 'is_breaking', 'is_club_news'],
  players:  ['is_captain'],
  polls:    ['is_active'],
  comments: [],
};

function parseSortClause(table, sort = '') {
  const desc = sort.startsWith('-');
  const field = sort.replace(/^-/, '') || 'created_at';
  const allowed = SORT_FIELDS[table] || ['created_at'];
  const safeField = allowed.includes(field) ? field : 'created_at';
  return `ORDER BY ${safeField} ${desc ? 'DESC' : 'ASC'}`;
}

function buildWhere(table, queryObj) {
  const reserved = new Set(['sort', 'limit', 'offset']);
  const bools = BOOL_FIELDS[table] || [];
  const conditions = [];
  const values = [];

  for (const [key, val] of Object.entries(queryObj)) {
    if (reserved.has(key) || val === undefined || val === '') continue;
    if (!/^[a-zA-Z_]+$/.test(key)) continue;
    values.push(bools.includes(key) ? val === 'true' : val);
    conditions.push(`${key} = $${values.length}`);
  }
  return {
    where: conditions.length ? `WHERE ${conditions.join(' AND ')}` : '',
    values,
  };
}

// ─── Generic CRUD factory ─────────────────────────────────────────────────────
function makeCRUD(router, table, writableFields) {
  router.get(`/${table}`, async (req, res) => {
    try {
      const { query } = getSQL();
      const { sort = '-created_at', limit = '100' } = req.query;
      const limitN = Math.min(parseInt(limit) || 100, 1000);
      const orderClause = parseSortClause(table, sort);
      const { where, values } = buildWhere(table, req.query);
      values.push(limitN);
      const rows = await query(
        `SELECT * FROM ${table} ${where} ${orderClause} LIMIT $${values.length}`,
        values,
      );
      res.json(rows);
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
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.post(`/${table}`, async (req, res) => {
    try {
      const { query } = getSQL();
      const data = req.body || {};
      const fields = writableFields.filter(f => data[f] !== undefined);
      if (fields.length === 0) return res.status(400).json({ error: 'No valid fields' });
      const cols = fields.join(', ');
      const placeholders = fields.map((_, i) => `$${i + 1}`).join(', ');
      const vals = fields.map(f => data[f]);
      const rows = await query(
        `INSERT INTO ${table} (${cols}) VALUES (${placeholders}) RETURNING *`,
        vals,
      );
      res.status(201).json(rows[0]);
    } catch (err) {
      console.error(`POST /${table}`, err);
      res.status(500).json({ error: err.message });
    }
  });

  router.put(`/${table}/:id`, async (req, res) => {
    try {
      const { query } = getSQL();
      const data = req.body || {};
      const fields = writableFields.filter(f => data[f] !== undefined);
      if (fields.length === 0) return res.status(400).json({ error: 'No valid fields' });
      const sets = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
      const vals = [...fields.map(f => data[f]), req.params.id];
      const hasUpdatedAt = !['media', 'standings', 'comments'].includes(table);
      const updateCols = hasUpdatedAt ? `, updated_at = NOW()` : '';
      const rows = await query(
        `UPDATE ${table} SET ${sets}${updateCols} WHERE id = $${vals.length} RETURNING *`,
        vals,
      );
      if (!rows[0]) return res.status(404).json({ error: 'Not found' });
      res.json(rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.delete(`/${table}/:id`, async (req, res) => {
    try {
      const { query } = getSQL();
      await query(`DELETE FROM ${table} WHERE id = $1`, [req.params.id]);
      res.json({ deleted: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// ─── API-Football Sync Routes ─────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

const syncRouter = express.Router();

// ── Sync: Standings ──────────────────────────────────────────────────────────
syncRouter.post('/standings', async (_req, res) => {
  try {
    const { query } = getSQL();
    const { data: response, season: usedSeason } = await apiFootballWithFallback(
      s => `/standings?league=${LEAGUE_ID}&season=${s}`
    );
    const league = response[0]?.league;
    if (!league) return res.status(404).json({ error: 'No standings data' });

    const groups = league.standings || [];
    let best = groups[0] || [];
    for (const g of groups) if (g.length > best.length) best = g;

    const teams = best.map(t => ({
      position:        t.rank,
      team:            t.team.name,
      team_id:         t.team.id,
      team_logo:       t.team.logo,
      played:          t.all.played,
      won:             t.all.win,
      drawn:           t.all.draw,
      lost:            t.all.lose,
      goals_for:       t.all.goals.for,
      goals_against:   t.all.goals.against,
      goal_difference: t.goalsDiff,
      points:          t.points,
      form:            t.form || '',
      description:     t.description || '',
    }));

    await query('DELETE FROM standings', []);
    await query(
      `INSERT INTO standings (competition, season, teams, created_date)
       VALUES ($1, $2, $3, $4)`,
      [
        'Egyptian Premier League',
        `${usedSeason}/${usedSeason + 1}`,
        JSON.stringify(teams),
        new Date().toISOString(),
      ],
    );

    res.json({
      synced: true, teams: teams.length,
      season: `${usedSeason}/${usedSeason + 1}`,
      note: usedSeason < SEASON ? `Season ${SEASON} not available on free plan – used ${usedSeason}` : undefined,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('sync/standings', err);
    res.status(500).json({ error: err.message });
  }
});

// ── Sync: Squad ───────────────────────────────────────────────────────────────
syncRouter.post('/squad', async (_req, res) => {
  try {
    const { query } = getSQL();
    const response = await apiFootball(`/players/squads?team=${TEAM_ID}`);
    const players  = response[0]?.players || [];

    // Get stats for each player (with season fallback)
    let statsMap = {};
    try {
      const { data: statsResp } = await apiFootballWithFallback(
        s => `/players?team=${TEAM_ID}&league=${LEAGUE_ID}&season=${s}&page=1`,
      );
      for (const item of statsResp) {
        if (item.player?.id) statsMap[item.player.id] = item.statistics?.[0] || {};
      }
    } catch {/* stats optional */}

    const positionMap = {
      Goalkeeper: 'Goalkeeper',
      Defender:   'Defender',
      Midfielder: 'Midfielder',
      Attacker:   'Forward',
    };

    await query('DELETE FROM players', []);
    let count = 0;
    for (const p of players) {
      const st = statsMap[p.id] || {};
      const stats = {
        appearances:  st.games?.appearences || 0,
        goals:        st.goals?.total       || 0,
        assists:      st.goals?.assists     || 0,
        yellow_cards: st.cards?.yellow      || 0,
        red_cards:    st.cards?.red         || 0,
        clean_sheets: st.goals?.conceded === 0 ? 1 : 0,
        rating:       parseFloat(st.games?.rating) || null,
      };
      await query(
        `INSERT INTO players
           (name, number, position, nationality, photo_url, status, is_captain, stats)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [
          p.name,
          p.number || null,
          positionMap[p.position] || p.position,
          p.nationality || 'Egyptian',
          p.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&size=400&background=1B2852&color=FFB81C`,
          'available',
          false,
          JSON.stringify(stats),
        ],
      );
      count++;
    }

    res.json({ synced: true, players: count, updatedAt: new Date().toISOString() });
  } catch (err) {
    console.error('sync/squad', err);
    res.status(500).json({ error: err.message });
  }
});

// ── Sync: Matches ─────────────────────────────────────────────────────────────
syncRouter.post('/matches', async (_req, res) => {
  try {
    const { query } = getSQL();

    // Fetch all Ceramica season fixtures (with fallback)
    const { data: ceramicaFixtures, season: usedSeason } = await apiFootballWithFallback(
      s => `/fixtures?team=${TEAM_ID}&league=${LEAGUE_ID}&season=${s}`,
    );

    // Fetch recent EPL round matches
    let allLeagueRecent = [];
    try {
      const { data } = await apiFootballWithFallback(
        s => `/fixtures?league=${LEAGUE_ID}&season=${s}&round=Regular Season - 17`,
      );
      allLeagueRecent = data;
    } catch { /* optional */ }

    const ceramicaIds = new Set(ceramicaFixtures.map(f => f.fixture.id));

    const statusMap = {
      FT: 'finished', AET: 'finished', PEN: 'finished',
      NS: 'scheduled', TBD: 'scheduled',
      '1H': 'live', '2H': 'live', HT: 'live', ET: 'live',
      P: 'live', SUSP: 'postponed', INT: 'postponed',
      PST: 'postponed', CANC: 'cancelled', ABD: 'cancelled',
    };

    // Combine: all Ceramica fixtures + recent league matches
    const allFixtures = [
      ...ceramicaFixtures,
      ...allLeagueRecent.filter(f => !ceramicaIds.has(f.fixture.id)),
    ];

    await query('DELETE FROM matches', []);
    let count = 0;
    for (const f of allFixtures) {
      const fix   = f.fixture;
      const home  = f.teams.home;
      const away  = f.teams.away;
      const goals = f.goals;
      const isCeramica = home.id === TEAM_ID || away.id === TEAM_ID;
      const status = statusMap[fix.status.short] || 'scheduled';

      await query(
        `INSERT INTO matches
           (home_team, away_team, date, venue, status, home_score, away_score,
            competition, match_type, is_ceramica_match,
            home_team_logo, away_team_logo, api_fixture_id)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
         ON CONFLICT (api_fixture_id) DO UPDATE SET
           status = EXCLUDED.status,
           home_score = EXCLUDED.home_score,
           away_score = EXCLUDED.away_score`,
        [
          home.name, away.name,
          fix.date,
          fix.venue?.name || null,
          status,
          goals.home, goals.away,
          f.league?.name || 'Egyptian Premier League',
          'league',
          isCeramica,
          home.logo, away.logo,
          fix.id,
        ],
      );
      count++;
    }

    res.json({
      synced: true, matches: count,
      season: `${usedSeason}/${usedSeason + 1}`,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('sync/matches', err);
    res.status(500).json({ error: err.message });
  }
});

// ── Sync: Top Scorers (store as news article) ─────────────────────────────────
syncRouter.post('/topscorers', async (_req, res) => {
  try {
    const { query } = getSQL();
    const { data: response, season: usedSeason } = await apiFootballWithFallback(
      s => `/players/topscorers?league=${LEAGUE_ID}&season=${s}`,
    );

    const top10 = response.slice(0, 10);
    const rows  = top10.map((item, i) => {
      const p = item.player;
      const s = item.statistics[0];
      return `${i + 1}. ${p.name} (${s.team.name}) – ${s.goals.total} goals`;
    }).join('\n');

    const article = {
      title:          `Egyptian Premier League Top Scorers – ${usedSeason}/${usedSeason + 1} Season`,
      excerpt:        `The Golden Boot race: ${top10[0]?.player?.name} leads with ${top10[0]?.statistics?.[0]?.goals?.total} goals.`,
      content:        `EGYPTIAN PREMIER LEAGUE – TOP SCORERS\n\n${rows}\n\nData updated live from API-Football.`,
      category:       'statistics',
      is_club_news:   top10.some(i => i.statistics[0]?.team?.id === TEAM_ID),
      is_featured:    false,
      is_breaking:    false,
      status:         'published',
      featured_image: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800',
      published_at:   new Date().toISOString(),
      tags:           ['top scorers','EPL','statistics'],
      views:          0,
    };

    await query(
      `INSERT INTO news (title,excerpt,content,category,is_club_news,is_featured,is_breaking,status,featured_image,published_at,tags,views)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
      [article.title, article.excerpt, article.content, article.category,
       article.is_club_news, article.is_featured, article.is_breaking,
       article.status, article.featured_image, article.published_at,
       article.tags, article.views],
    );

    res.json({ synced: true, topScorers: top10.length, updatedAt: new Date().toISOString() });
  } catch (err) {
    console.error('sync/topscorers', err);
    res.status(500).json({ error: err.message });
  }
});

// ── Sync: All ──────────────────────────────────────────────────────────────────
syncRouter.post('/all', async (req, res) => {
  const results = {};
  const callSync = async (name, path) => {
    try {
      const r = await fetch(
        `${req.protocol}://${req.get('host')}${req.baseUrl.replace('/sync', '')}/sync/${name}`,
        { method: 'POST', headers: { 'content-type': 'application/json' } },
      );
      results[name] = await r.json();
    } catch (err) {
      results[name] = { error: err.message };
    }
  };

  await callSync('standings', '/standings');
  await callSync('squad',     '/squad');
  await callSync('matches',   '/matches');
  await callSync('topscorers','/topscorers');

  res.json({ synced: true, results, updatedAt: new Date().toISOString() });
});

// ── Live data proxy: current live fixtures ────────────────────────────────────
const router = express.Router();

router.get('/live', async (_req, res) => {
  try {
    const data = await apiFootball(`/fixtures?live=all&league=${LEAGUE_ID}`);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Next match proxy ──────────────────────────────────────────────────────────
router.get('/next-match', async (_req, res) => {
  try {
    const data = await apiFootball(`/fixtures?team=${TEAM_ID}&next=1`);
    res.json(data[0] || null);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Health
router.get('/', (_req, res) => res.json({ status: 'ok', service: 'Ceramica Cleopatra FC API', leagueId: LEAGUE_ID, teamId: TEAM_ID }));

// Auth stub
router.get('/auth/me', (_req, res) => res.status(401).json({ error: 'Not authenticated' }));

// Attach sync router
router.use('/sync', syncRouter);

// CRUD routes
makeCRUD(router, 'matches', [
  'home_team', 'away_team', 'date', 'venue', 'status',
  'home_score', 'away_score', 'competition', 'match_type', 'is_ceramica_match',
  'home_team_logo', 'away_team_logo',
]);
makeCRUD(router, 'news', [
  'title', 'excerpt', 'content', 'category', 'league', 'status',
  'featured_image', 'is_featured', 'is_breaking', 'is_club_news',
  'published_at', 'tags', 'views',
]);
makeCRUD(router, 'players', [
  'name', 'number', 'position', 'position_detail', 'nationality',
  'photo_url', 'status', 'is_captain', 'stats',
]);
makeCRUD(router, 'media',    ['title', 'type', 'url', 'thumbnail_url', 'created_date']);
makeCRUD(router, 'polls',    ['question', 'options', 'total_votes', 'is_active', 'created_date']);
makeCRUD(router, 'comments', ['content', 'author_name', 'status', 'news_id', 'created_date']);
makeCRUD(router, 'standings',['competition', 'season', 'teams', 'created_date']);

app.use('/api', router);
app.use('/.netlify/functions/api', router);

export const handler = serverless(app);
