import pool from './_db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { sessionId, name } = req.body || {};
    console.log('[API] /name called', { sessionId, name });
    if (!sessionId || !name || !name.trim()) return res.status(400).json({ error: 'sessionId et name requis' });

    // Match schema: sessions(id, session_id UNIQUE, name, created_at)
    await pool.query(
      `
      INSERT INTO sessions (session_id, name)
      VALUES ($1, $2)
      ON CONFLICT (session_id)
      DO UPDATE SET name = EXCLUDED.name
      RETURNING id, session_id, name
      `,
      [sessionId, name.trim()]
    );

    console.log('[API] /name success', { sessionId, name });
    res.json({ ok: true });
  } catch (err) {
    console.error('[API] /name error', err?.message || err);
    res.status(500).json({ error: err?.message || 'DB error' });
  }
}
