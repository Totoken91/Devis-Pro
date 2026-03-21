-- Migration : table feedbacks
-- Exécuter dans Supabase Dashboard > SQL Editor

CREATE TABLE IF NOT EXISTS public.feedbacks (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email      TEXT NOT NULL,
  message    TEXT NOT NULL,
  is_read    BOOLEAN NOT NULL DEFAULT FALSE
);

ALTER TABLE public.feedbacks ENABLE ROW LEVEL SECURITY;

-- Les users peuvent insérer leurs propres feedbacks
CREATE POLICY feedbacks_insert_own
  ON public.feedbacks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Lecture uniquement via service role (admin)
-- Pas de SELECT policy pour les users normaux
