-- Migration SQL minimale pour créer les tables utilisées par l'application
DROP TABLE IF EXISTS responses;
DROP TABLE IF EXISTS sessions;

CREATE TABLE sessions (
  id SERIAL PRIMARY KEY,
  session_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE responses (
  id SERIAL PRIMARY KEY,
  session_id TEXT UNIQUE NOT NULL,
  answer TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index pour recherche rapide par nom (CORRIGÉ: sur la table sessions)
CREATE INDEX IF NOT EXISTS idx_sessions_name ON sessions(name);
