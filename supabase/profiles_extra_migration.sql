-- Migration : ajout TVA, bancaire, mentions légales, signature
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS tva_numero      TEXT,
  ADD COLUMN IF NOT EXISTS iban            TEXT,
  ADD COLUMN IF NOT EXISTS bic             TEXT,
  ADD COLUMN IF NOT EXISTS statut_juridique TEXT,
  ADD COLUMN IF NOT EXISTS capital_social  TEXT,
  ADD COLUMN IF NOT EXISTS footer_custom   TEXT;
