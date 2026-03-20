# Deviso — Roadmap

> Référence rapide de l'état du projet. Le document de design complet est dans `Deviso_Roadmap_v2.html`.

---

## Phase 1 — MVP `✅ TERMINÉ`

| Fonctionnalité | État |
|---|---|
| Auth email + Google OAuth | ✅ |
| Reset de mot de passe | ✅ |
| Profil (nom, société, SIRET, logo_url, couleur marque) | ✅ |
| Carnet de clients | ✅ |
| Création / édition de devis (lignes, TVA, totaux) | ✅ |
| Numérotation automatique DEV-YYYY-0001 | ✅ |
| Page publique `/q/[token]` (lecture client sans compte) | ✅ |
| Envoi par email (Resend) avec tracking pixel ouverture | ✅ |
| Signature électronique (accepter / refuser) | ✅ |
| Notifications temps réel (Supabase Realtime) | ✅ |
| Dashboard (stats : devis envoyés, taux acceptation, MRR) | ✅ |
| Landing page + pricing | ✅ |
| Responsive mobile | ✅ |
| Middleware de protection des routes | ✅ |
| RLS Supabase (isolation multi-tenant) | ✅ |

### Sécurité appliquée (sprint audit 2026-03)
- `generateToken()` → Web Crypto API (64 bits d'entropie, plus `Math.random`)
- Validation Zod sur toutes les routes API publiques
- Headers HTTP de sécurité (`X-Frame-Options`, `X-Content-Type-Options`, etc.)
- Validation du format token dans chaque route (`/api/track`, `/api/notify-owner`, `/api/devis/[token]/action`)

### Reste à faire avant lancement public
- [x] Limitation plan gratuit : max 3 devis/mois — mur de blocage sur `/devis/nouveau`, barre de progression dans le dashboard
- [ ] Export PDF réel (actuellement : impression navigateur uniquement)
- [x] Relances automatiques — toggle dans le formulaire, cron Vercel `/api/cron/reminders` (expire + relance email tous les 7 jours)
- [ ] Logo upload (champ `logo_url` en base, pas d'UI d'upload)
- [ ] Tests de bout en bout sur les flows auth + devis

---

## Phase 2 — Monétisation `🔄 À VENIR`

Objectif : **30 abonnés payants** | Délai cible : 3 mois après lancement public

### Stripe — checklist d'intégration

**Setup**
- [ ] Créer compte Stripe, activer payments
- [ ] Créer 2 produits : Pro Mensuel (15 €) + Pro Annuel (12 €/mois × 12)
- [ ] Ajouter `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRO_MONTHLY_PRICE_ID`, `STRIPE_PRO_YEARLY_PRICE_ID` dans Vercel

**Backend**
- [ ] `POST /api/stripe/checkout` — crée une Stripe Checkout Session, redirige vers Stripe
- [ ] `POST /api/stripe/portal` — crée une Customer Portal Session (gestion abonnement self-service)
- [ ] `POST /api/stripe/webhook` — reçoit et vérifie les événements Stripe :
  - `checkout.session.completed` → passer `profiles.plan` à `pro`, stocker `stripe_customer_id`
  - `customer.subscription.updated` → mettre à jour le statut
  - `customer.subscription.deleted` → repasser en `free`
  - `invoice.payment_failed` → email de relance paiement
- [ ] Migration SQL : ajouter `stripe_subscription_id` sur `profiles` (déjà dans le schéma)
- [ ] Helper `isPro(userId): boolean` — lit `profiles.plan`

**Frontend**
- [ ] Bouton "Passer Pro" dans `/profil` et dans le modal de limite atteinte
- [ ] Page `/settings/billing` — affiche statut abonnement + lien Customer Portal
- [ ] Modal "Limite atteinte" quand un utilisateur free essaie de créer un 4e devis
- [ ] Badge "PRO" dans la sidebar
- [ ] Toggle mensuel/annuel sur la landing page pricing

**Sécurité Stripe**
- [ ] Vérifier la signature du webhook (`stripe.webhooks.constructEvent`)
- [ ] Ne jamais lire le plan côté client — toujours depuis la DB via une Server Component ou API route

---

## Phase 3 — Rétention `📋 PLANIFIÉ`

Objectif : **100–200 abonnés** | MRR cible : 1 500–3 000 €

- [x] Relances automatiques (Vercel Cron + `CRON_SECRET`) ← fait en Phase 1
- [ ] PDF serveur via `@react-pdf/renderer` ou Puppeteer
- [ ] Templates visuels (classique / moderne / minimaliste — champ en base, rendu non différencié)
- [ ] Programme de parrainage (Stripe coupons)
- [ ] Analytiques dans le dashboard (courbe MRR, taux de conversion)
- [ ] Sentry pour le monitoring des erreurs
- [ ] Mentions légales / CGU / Politique de confidentialité

---

## Suggestions & idées backlog

| Idée | Impact | Effort | Note |
|---|---|---|---|
| Aperçu en temps réel dans le formulaire | Élevé | Moyen | Déjà fait ✅ |
| Numérotation personnalisable (préfixe, année) | Moyen | Faible | Utile pour les agences |
| Devis récurrents / modèles réutilisables | Élevé | Moyen | Forte demande freelance |
| Multi-devises (CHF, GBP…) | Moyen | Faible | Marché international |
| Intégration Notion / Airtable | Faible | Élevé | Scope trop large |
| Application mobile (PWA) | Élevé | Élevé | Phase 4 éventuelle |
| Signature avancée (eIDAS) | Moyen | Élevé | Marché premium |

---

_Dernière mise à jour : 2026-03-20 — Phase 1 quasiment terminée, Phase 2 (Stripe) à venir_
