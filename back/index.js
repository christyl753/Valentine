// server.js
import dotenv from "dotenv";
// Charger explicitement le .env à la racine du projet (dossier parent)
dotenv.config({ path: '../.env' });

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

// ==================== BASE DE DONNÉES ====================
const DB_URL = process.env.DATABASE_URL;

if (!DB_URL) {
  console.error("ERREUR : DATABASE_URL est manquante dans les variables d'environnement !");
  process.exit(1);
}

const pool = new Pool({
  connectionString: DB_URL,
  ssl: { rejectUnauthorized: false }, // nécessaire pour Supabase, Render, etc.
  connectionTimeoutMillis: 7000,
  idleTimeoutMillis: 30000,
  max: 20, // limite le nombre de connexions simultanées
});

// Gestion des erreurs du pool (évite que le serveur crash)
pool.on('error', (err) => {
  console.error('Erreur inattendue du pool PostgreSQL :', err);
  // On ne crash pas – le pool se reconnecte automatiquement
});

// Test de connexion au démarrage
(async () => {
  try {
    const client = await pool.connect();
    console.log("Connexion PostgreSQL établie avec succès");
    client.release();
  } catch (err) {
    console.error("Échec de la connexion à la base de données :", err.message);
    console.error(err.stack);
    // On continue quand même (mode dégradé possible)
  }
})();

// ==================== Gestion de session simple (temporaire) ====================
const sessions = new Map(); // sessionId → { name?, answer? }

app.use((req, res, next) => {
  const sessionId = req.headers["x-session-id"] || req.query.sessionId || (req.body && req.body.sessionId);
  
  // Si pas de sessionId, on passe (pour les routes publiques)
  if (!sessionId) return next();

  if (!sessions.has(sessionId)) {
    sessions.set(sessionId, {});
  }
  
  req.session = sessions.get(sessionId);
  next();
});

// ==================== ROUTES ====================

// Page d'accueil
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../html/hello.html"));
});

// État de la base de données (pour debug)
app.get("/db-status", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ ok: true, status: "connecté" });
  } catch (err) {
    res.status(503).json({
      ok: false,
      status: "déconnecté",
      error: err.message,
    });
  }
});

// Voir toutes les réponses (pour debug)
app.get("/all-responses", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM responses ORDER BY created_at DESC");
    res.json({ ok: true, data: result.rows });
  } catch (err) {
    res.json({ ok: false, error: err.message });
  }
});

// Enregistrer le nom
app.post("/name", async (req, res) => {
  const { name, sessionId } = req.body;

  if (!name?.trim()) {
    return res.status(400).json({ error: "Le nom est requis" });
  }

  if (!sessionId) {
    return res.status(400).json({ error: "sessionId est requis" });
  }

  const nom = name.trim();
  req.session.name = nom;

  try {
    await pool.query(
      `INSERT INTO responses (name, created_at)
       VALUES ($1, NOW())
       ON CONFLICT (name) DO UPDATE SET name = $1`,
      [nom]
    );
    res.json({ ok: true, name: nom });
  } catch (err) {
    console.error("Erreur insertion DB :", err.message);
    // On renvoie quand même au client (non bloquant)
    res.json({ ok: true, name: nom, avertissement: "sauvegarde DB échouée" });
  }
});

// Enregistrer la réponse (oui / non)
app.post("/answer", async (req, res) => {
  const { answer, sessionId } = req.body;

  console.log(`[DEBUG] POST /answer - sessionId: ${sessionId}, answer: ${answer}`);
  console.log(`[DEBUG] Sessions existantes: ${sessions.size}`);
  console.log(`[DEBUG] req.session: ${req.session ? JSON.stringify(req.session) : 'undefined'}`);

  if (!["oui", "non"].includes(answer)) {
    return res.status(400).json({ error: "La réponse doit être 'oui' ou 'non'" });
  }

  if (!sessionId) {
    return res.status(400).json({ error: "sessionId requis" });
  }

  if (!req.session || !req.session.name) {
    console.log(`[DEBUG] Pas de nom trouvé pour sessionId: ${sessionId}`);
    return res.status(400).json({ error: "Le nom doit être défini d'abord" });
  }

  req.session.answer = answer;

  try {
    const result = await pool.query(
      `UPDATE responses 
       SET answer = $1, updated_at = NOW()
       WHERE name = $2
       RETURNING *`,
      [answer, req.session.name]
    );

    console.log(`[DEBUG] Mise à jour réussie - rowCount: ${result.rowCount}`);

    if (result.rowCount === 0) {
      return res.status(400).json({ error: "Aucun enregistrement trouvé pour ce nom" });
    }

    res.json({ ok: true, answer });
  } catch (err) {
    console.error("Erreur mise à jour DB :", err.message);
    res.json({ ok: true, answer, avertissement: "sauvegarde DB échouée" });
  }
});

// Servir les fichiers statiques (après les routes API)
app.use(express.static(path.join(__dirname, "../")));

// Gestion 404
app.use((req, res) => {
  res.status(404).send("Page non trouvée");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});