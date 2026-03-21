-- ============================================================
-- DEVISO — Schema SQL à exécuter dans Supabase SQL Editor
-- ============================================================

-- ============================================================
-- TABLE: profiles
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id                    UUID        REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  created_at            TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at            TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  full_name             TEXT,
  company_name          TEXT,
  email                 TEXT        NOT NULL,
  phone                 TEXT,
  address               TEXT,
  siret                 TEXT,
  logo_url              TEXT,
  brand_color           TEXT        DEFAULT '#6CC531',
  tva_numero            TEXT,
  iban                  TEXT,
  bic                   TEXT,
  statut_juridique      TEXT,
  capital_social        TEXT,
  footer_custom         TEXT,
  plan                  TEXT        NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro')),
  stripe_customer_id    TEXT,
  stripe_subscription_id TEXT,
  is_admin              BOOLEAN     NOT NULL DEFAULT FALSE
);

-- ============================================================
-- TABLE: clients
-- ============================================================
CREATE TABLE IF NOT EXISTS public.clients (
  id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  user_id    UUID        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name       TEXT        NOT NULL,
  email      TEXT,
  phone      TEXT,
  company    TEXT,
  address    TEXT
);

-- ============================================================
-- RLS: profiles
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Les users peuvent mettre à jour leur profil SAUF le champ plan
-- (le plan est géré uniquement via le webhook Stripe avec le service role)
CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND plan = (SELECT plan FROM public.profiles WHERE id = auth.uid())
    AND is_admin = (SELECT is_admin FROM public.profiles WHERE id = auth.uid())
  );

-- ============================================================
-- RLS: clients
-- ============================================================
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "clients_all_own"
  ON public.clients FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- TRIGGER: updated_at automatique sur profiles
-- ============================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER profiles_set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- TABLE: devis
-- ============================================================
CREATE TABLE IF NOT EXISTS public.devis (
  id               UUID          DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at       TIMESTAMPTZ   DEFAULT NOW() NOT NULL,
  updated_at       TIMESTAMPTZ   DEFAULT NOW() NOT NULL,
  user_id          UUID          REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  client_id        UUID          REFERENCES public.clients(id) ON DELETE SET NULL,
  numero           TEXT          NOT NULL,
  titre            TEXT          NOT NULL DEFAULT 'Devis',
  statut           TEXT          NOT NULL DEFAULT 'brouillon'
                                 CHECK (statut IN ('brouillon','envoye','ouvert','accepte','refuse','expire')),
  lignes           JSONB         NOT NULL DEFAULT '[]',
  tva_taux         NUMERIC(5,2)  NOT NULL DEFAULT 20,
  montant_ht       NUMERIC(10,2) NOT NULL DEFAULT 0,
  montant_tva      NUMERIC(10,2) NOT NULL DEFAULT 0,
  montant_ttc      NUMERIC(10,2) NOT NULL DEFAULT 0,
  notes            TEXT,
  conditions       TEXT,
  date_validite    DATE,
  token_public     TEXT          NOT NULL DEFAULT encode(gen_random_bytes(6), 'hex'),
  template         TEXT          NOT NULL DEFAULT 'classique'
                                 CHECK (template IN ('classique','moderne','minimaliste')),
  ouvert_le        TIMESTAMPTZ,
  signe_le         TIMESTAMPTZ,
  relance_active   BOOLEAN       NOT NULL DEFAULT FALSE,
  derniere_relance TIMESTAMPTZ
);

-- RLS: devis
ALTER TABLE public.devis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "devis_all_own"
  ON public.devis FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Lecture anonyme via token public (page /q/[token])
-- NOTE: La lecture anonyme passe par l'admin client (service role) dans /q/[token]/page.tsx.
-- Cette policy est un fallback : on ne la rend pas permissive sans filtrage sur token.
-- Supprimée car non utilisée — le server component utilise createAdminClient().
-- Si besoin, utiliser une policy basée sur une variable de session :
--   USING (token_public = current_setting('app.devis_token', true))

-- ── Indexes pour performances ──
CREATE INDEX IF NOT EXISTS idx_devis_user_id       ON public.devis(user_id);
CREATE INDEX IF NOT EXISTS idx_devis_token_public   ON public.devis(token_public);
CREATE INDEX IF NOT EXISTS idx_devis_client_id      ON public.devis(client_id);
CREATE INDEX IF NOT EXISTS idx_clients_user_id      ON public.clients(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_devis_modeles_user_id ON public.devis_modeles(user_id);

CREATE OR REPLACE TRIGGER devis_set_updated_at
  BEFORE UPDATE ON public.devis
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- TABLE: notifications
-- ============================================================
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

CREATE POLICY "notifications_select_own"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "notifications_update_own"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- INSERT uniquement via service role (admin client) — pas d'insert direct par les users
-- Le service role bypasse les RLS, donc cette policy bloque seulement les appels client.
CREATE POLICY "notifications_insert_own"
  ON public.notifications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- NOTE: Pour activer le Realtime, aller dans Supabase Dashboard
-- → Database → Replication → cocher "notifications" dans Source Tables

-- ============================================================
-- TABLE: devis_modeles (modèles réutilisables)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.devis_modeles (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  lignes      JSONB NOT NULL DEFAULT '[]',
  tva_taux    NUMERIC(5,2) NOT NULL DEFAULT 20,
  notes       TEXT,
  conditions  TEXT,
  template    TEXT NOT NULL DEFAULT 'classique'
              CHECK (template IN ('classique','moderne','minimaliste'))
);

ALTER TABLE public.devis_modeles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "devis_modeles_select_own"
  ON public.devis_modeles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "devis_modeles_insert_own"
  ON public.devis_modeles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "devis_modeles_update_own"
  ON public.devis_modeles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "devis_modeles_delete_own"
  ON public.devis_modeles FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- TRIGGER: créer le profil automatiquement à l'inscription
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
