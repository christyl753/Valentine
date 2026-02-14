import pool from './_db.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const result = await pool.query(`
      SELECT s.name, r.answer, r.updated_at
      FROM sessions s
      LEFT JOIN responses r ON r.session_id = s.session_id
      ORDER BY r.updated_at DESC NULLS LAST
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('API /all error', err?.message || err);
    res.status(500).json({ error: 'DB error' });
  }
}
