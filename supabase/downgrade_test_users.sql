-- ============================================================
-- DOWNGRADE utilisateurs test pré-prod → plan free
-- À exécuter dans Supabase SQL Editor (service role)
-- Date : 2026-03-21
-- ============================================================

UPDATE public.profiles
SET
  plan                   = 'free',
  stripe_subscription_id = NULL,
  updated_at             = NOW()
WHERE email IN (
  'kennydsf@gmail.com',
  'djviteau@gmail.com',
  'michel.desaintfuscien@gmail.com'
);

-- Vérification : affiche les profils concernés après mise à jour
SELECT id, email, plan, stripe_customer_id, stripe_subscription_id, updated_at
FROM public.profiles
WHERE email IN (
  'kennydsf@gmail.com',
  'djviteau@gmail.com',
  'michel.desaintfuscien@gmail.com'
);
