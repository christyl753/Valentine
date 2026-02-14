import pool from './_db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { sessionId, name } = req.body || {};
    console.log('[API] /name called', { sessionId, name });
    if (!sessionId || !name || !name.trim()) return res.status(400).json({ error: 'sessionId et name requis' });

    await pool.query(
      `
      INSERT INTO sessions (session_id, name)
      VALUES ($1, $2)
      ON CONFLICT (session_id)
      DO UPDATE SET name = EXCLUDED.name
      `,
      [sessionId, name.trim()]
    );

    res.json({ ok: true });
  } catch (err) {
    console.error('API /name error', err?.message || err);
    // expose some error info to help debugging (not secrets)
    res.status(500).json({ error: err?.message || 'DB error' });
  }
}
