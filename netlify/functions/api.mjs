import express from 'express';
import serverless from 'serverless-http';
import cors from 'cors';
import { neon } from '@neondatabase/serverless';

const app = express();
app.use(cors());
app.use(express.json());

// ─── DB helper ────────────────────────────────────────────────────────────────
const getSQL = () => neon(process.env.DATABASE_URL);

// Allowed sort fields per table (prevent SQL injection)
const SORT_FIELDS = {
  matches:   ['date', 'created_at', 'status'],
  news:      ['published_at', 'created_at', 'views', 'title'],
  players:   ['number', 'name', 'created_at', 'position'],
  media:     ['created_date', 'created_at'],
  polls:     ['created_date', 'created_at'],
  comments:  ['created_date', 'created_at'],
  standings: ['created_date', 'created_at'],
};

// Boolean columns per table
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

function buildWhere(table, query) {
  const reserved = new Set(['sort', 'limit', 'offset']);
  const bools = BOOL_FIELDS[table] || [];
  const conditions = [];
  const values = [];

  for (const [key, val] of Object.entries(query)) {
    if (reserved.has(key) || val === undefined || val === '') continue;
    if (!/^[a-zA-Z_]+$/.test(key)) continue; // allow only safe field names
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
  // LIST / FILTER
  router.get(`/${table}`, async (req, res) => {
    try {
      const sql = getSQL();
      const { sort = '-created_at', limit = '100' } = req.query;
      const limitN = Math.min(parseInt(limit) || 100, 1000);
      const orderClause = parseSortClause(table, sort);
      const { where, values } = buildWhere(table, req.query);
      values.push(limitN);
      const rows = await sql(
        `SELECT * FROM ${table} ${where} ${orderClause} LIMIT $${values.length}`,
        values,
      );
      res.json(rows);
    } catch (err) {
      console.error(`GET /${table}`, err);
      res.status(500).json({ error: err.message });
    }
  });

  // GET ONE
  router.get(`/${table}/:id`, async (req, res) => {
    try {
      const sql = getSQL();
      const [row] = await sql(`SELECT * FROM ${table} WHERE id = $1`, [req.params.id]);
      if (!row) return res.status(404).json({ error: 'Not found' });
      res.json(row);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // CREATE
  router.post(`/${table}`, async (req, res) => {
    try {
      const sql = getSQL();
      const data = req.body || {};
      const fields = writableFields.filter(f => data[f] !== undefined);
      if (fields.length === 0) return res.status(400).json({ error: 'No valid fields provided' });
      const cols = fields.join(', ');
      const placeholders = fields.map((_, i) => `$${i + 1}`).join(', ');
      const vals = fields.map(f => data[f]);
      const [row] = await sql(
        `INSERT INTO ${table} (${cols}) VALUES (${placeholders}) RETURNING *`,
        vals,
      );
      res.status(201).json(row);
    } catch (err) {
      console.error(`POST /${table}`, err);
      res.status(500).json({ error: err.message });
    }
  });

  // UPDATE
  router.put(`/${table}/:id`, async (req, res) => {
    try {
      const sql = getSQL();
      const data = req.body || {};
      const fields = writableFields.filter(f => data[f] !== undefined);
      if (fields.length === 0) return res.status(400).json({ error: 'No valid fields provided' });
      const sets = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
      const vals = [...fields.map(f => data[f]), req.params.id];
      const updateCols = table !== 'media' && table !== 'standings' ? `, updated_at = NOW()` : '';
      const [row] = await sql(
        `UPDATE ${table} SET ${sets}${updateCols} WHERE id = $${vals.length} RETURNING *`,
        vals,
      );
      if (!row) return res.status(404).json({ error: 'Not found' });
      res.json(row);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // DELETE
  router.delete(`/${table}/:id`, async (req, res) => {
    try {
      const sql = getSQL();
      await sql(`DELETE FROM ${table} WHERE id = $1`, [req.params.id]);
      res.json({ deleted: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
}

// ─── Router ───────────────────────────────────────────────────────────────────
const router = express.Router();

// Health check
router.get('/', (_req, res) => res.json({ status: 'ok', service: 'Ceramica Cleopatra FC API' }));

// Auth stub (app runs without auth)
router.get('/auth/me', (_req, res) => res.status(401).json({ error: 'Not authenticated' }));

// ── matches ──────────────────────────────────────────────────────────────────
makeCRUD(router, 'matches', [
  'home_team', 'away_team', 'date', 'venue', 'status',
  'home_score', 'away_score', 'competition', 'match_type', 'is_ceramica_match',
]);

// ── news ─────────────────────────────────────────────────────────────────────
makeCRUD(router, 'news', [
  'title', 'excerpt', 'content', 'category', 'league', 'status',
  'featured_image', 'is_featured', 'is_breaking', 'is_club_news',
  'published_at', 'tags', 'views',
]);

// ── players ──────────────────────────────────────────────────────────────────
makeCRUD(router, 'players', [
  'name', 'number', 'position', 'position_detail', 'nationality',
  'photo_url', 'status', 'is_captain', 'stats',
]);

// ── media ─────────────────────────────────────────────────────────────────────
makeCRUD(router, 'media', ['title', 'type', 'url', 'thumbnail_url', 'created_date']);

// ── polls ─────────────────────────────────────────────────────────────────────
makeCRUD(router, 'polls', ['question', 'options', 'total_votes', 'is_active', 'created_date']);

// ── comments ─────────────────────────────────────────────────────────────────
makeCRUD(router, 'comments', ['content', 'author_name', 'status', 'news_id', 'created_date']);

// ── standings ─────────────────────────────────────────────────────────────────
makeCRUD(router, 'standings', ['competition', 'season', 'teams', 'created_date']);

// Mount router at both paths (direct access + via Netlify function name)
app.use('/api', router);
app.use('/.netlify/functions/api', router);

export const handler = serverless(app);
