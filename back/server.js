// server.js
import dotenv from "dotenv";
dotenv.config({ path: "../.env" });

import express from "express";
import cors from "cors";
import { Pool } from "pg";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// ==================== POSTGRES ====================
if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL manquante");
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

(async () => {
  try {
    await pool.query("SELECT 1");
    console.log("Connexion PostgreSQL établie avec succès");
  } catch (err) {
    console.error("Erreur DB :", err.message);
  }
})();

// ==================== ROUTES ====================

// Page d'accueil
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../html/hello.html"));
});

// ---------- ENREGISTRER LE NOM ----------
app.post("/name", async (req, res) => {
  const { sessionId, name } = req.body;

  if (!sessionId || !name?.trim()) {
    return res.status(400).json({ error: "sessionId et name requis" });
  }

  try {
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
    console.error("Erreur /name :", err.message);
    res.status(500).json({ error: "DB error" });
  }
});

// ---------- ENREGISTRER LA RÉPONSE ----------
app.post("/answer", async (req, res) => {
  const { sessionId, answer } = req.body;

  console.log(`[DEBUG] POST /answer - sessionId=${sessionId} answer=${answer}`);

  if (!sessionId || !["oui", "non"].includes(answer)) {
    return res.status(400).json({ error: "Données invalides" });
  }

  try {
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
    console.error("Erreur /answer :", err.message);
    res.status(500).json({ error: "DB error" });
  }
});

// ---------- VOIR TOUT ----------
app.get("/all", async (req, res) => {
  const result = await pool.query(`
    SELECT s.name, r.answer, r.updated_at
    FROM sessions s
    LEFT JOIN responses r ON r.session_id = s.session_id
    ORDER BY r.updated_at DESC NULLS LAST
  `);
  res.json(result.rows);
});

// ---------- FICHIERS STATIQUES ----------
app.use(express.static(path.join(__dirname, "../")));

// ---------- 404 ----------
app.use((req, res) => {
  res.status(404).send("Page non trouvée");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Serveur démarré sur le port", PORT);
});
