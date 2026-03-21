-- Migration: table visitors pour le tracking des visiteurs uniques
CREATE TABLE IF NOT EXISTS visitors (
  visitor_id  TEXT PRIMARY KEY,
  first_seen  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Pas de RLS : insertions via le service role (admin client)
