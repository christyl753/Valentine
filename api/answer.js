import pool from './_db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { sessionId, answer } = req.body || {};
    if (!sessionId || !['oui', 'non'].includes(answer)) return res.status(400).json({ error: 'Données invalides' });

    await pool.query(
      `
      INSERT INTO responses (session_id, answer)
      VALUES ($1, $2)
      ON CONFLICT (session_id)
      DO UPDATE SET
        answer = EXCLUDED.answer,
        updated_at = NOW()
      `,
      [sessionId, answer]
    );

    res.json({ ok: true });
  } catch (err) {
    console.error('API /answer error', err?.message || err);
    res.status(500).json({ error: 'DB error' });
  }
}
