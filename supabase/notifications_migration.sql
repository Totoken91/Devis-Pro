-- Migration: table notifications
-- Executer dans Supabase Dashboard > SQL Editor

CREATE TABLE IF NOT EXISTS public.notifications (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  devis_id     UUID REFERENCES public.devis(id) ON DELETE CASCADE,
  event        TEXT NOT NULL,
  devis_numero TEXT NOT NULL,
  client_name  TEXT NOT NULL,
  is_read      BOOLEAN NOT NULL DEFAULT FALSE
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY notifications_select_own
  ON public.notifications
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY notifications_update_own
  ON public.notifications
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY notifications_insert_service
  ON public.notifications
  FOR INSERT
  WITH CHECK (true);
