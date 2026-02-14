import pool from './_db.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const sessionId = req.query?.sessionId || req.url && new URL(req.url, 'http://localhost').searchParams.get('sessionId');
    if (!sessionId) return res.json({});

    const result = await pool.query('SELECT name FROM sessions WHERE session_id = $1 LIMIT 1', [sessionId]);
    const row = result.rows[0];
    if (!row) return res.json({});
    res.json({ name: row.name });
  } catch (err) {
    console.error('API /user-data error', err?.message || err);
    res.status(500).json({ error: 'DB error' });
  }
}
