-- Migration SQL minimale pour créer les tables utilisées par l'application
CREATE TABLE IF NOT EXISTS sessions (
  session_id TEXT PRIMARY KEY,
  name TEXT
);

CREATE TABLE IF NOT EXISTS responses (
  session_id TEXT PRIMARY KEY,
  answer TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
