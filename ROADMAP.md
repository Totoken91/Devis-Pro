# Deviso — Roadmap

> Référence rapide de l'état du projet. Le document de design complet est dans `Deviso_Roadmap_v2.html`.

---

## Phase 1 — MVP `✅ TERMINÉ`

| Fonctionnalité | État |
|---|---|
| Auth email + Google OAuth | ✅ |
| Reset de mot de passe | ✅ |
| Profil (nom, société, SIRET, logo_url, couleur marque) | ✅ |
| Upload logo (Supabase Storage bucket `logos`) | ✅ |
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
| Limitation plan gratuit : max 3 devis/mois + barre progression | ✅ |
| Relances automatiques (Vercel Cron, tous les 7 jours) | ✅ |

### Sécurité appliquée (sprint audit 2026-03)
- `generateToken()` → Web Crypto API (64 bits d'entropie, plus `Math.random`)
- Validation Zod sur toutes les routes API publiques
- Headers HTTP de sécurité (`X-Frame-Options`, `X-Content-Type-Options`, etc.)
- Validation du format token dans chaque route (`/api/track`, `/api/notify-owner`, `/api/devis/[token]/action`)

### Blocages avant lancement public
- [ ] Export PDF réel (actuellement : impression navigateur `window.print()`)
- [ ] Tests de bout en bout sur les flows auth + devis

---

## Phase 2 — Monétisation `🔄 EN COURS`

Objectif : **30 abonnés payants** | Délai cible : 3 mois après lancement public

### Stripe — état d'avancement

**Setup** *(à faire côté compte Stripe + Vercel)*
- [ ] Créer compte Stripe, activer payments
- [ ] Créer 2 produits : Pro Mensuel (15 €) + Pro Annuel (12 €/mois × 12)
- [ ] Ajouter `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRO_MONTHLY_PRICE_ID`, `STRIPE_PRO_YEARLY_PRICE_ID` dans Vercel

**Backend** *(code fait)*
- [x] `POST /api/stripe/checkout` — Stripe Checkout Session
- [x] `POST /api/stripe/portal` — Customer Portal Session
- [x] `POST /api/stripe/webhook` — vérifie signature + gère `checkout.session.completed`, `subscription.updated/deleted`, `invoice.payment_failed`
- [x] `lib/stripe.ts` — helper `isPro`, constantes price IDs

**Frontend** *(partiellement fait)*
- [x] Page `/parametres/facturation` — statut abonnement + boutons Upgrade / Portal
- [x] Badge "PRO" dans la sidebar
- [x] Bouton "Passer Pro" dans `/parametres/facturation`
- [ ] Modal "Limite atteinte" quand un free essaie de créer un 4e devis (actuellement : redirect silencieux)
- [ ] Toggle mensuel/annuel sur la landing page pricing

**Sécurité Stripe**
- [x] Vérification signature webhook (`stripe.webhooks.constructEvent`)
- [x] Plan lu depuis la DB via Server Component (jamais côté client)

---

## Phase 3 — Rétention `📋 PLANIFIÉ`

Objectif : **100–200 abonnés** | MRR cible : 1 500–3 000 €

- [x] Relances automatiques (Vercel Cron + `CRON_SECRET`)
- [ ] Export PDF serveur via `@react-pdf/renderer` ou Puppeteer
- [ ] Templates visuels (classique / moderne / minimaliste)
- [ ] Programme de parrainage (Stripe coupons)
- [ ] Analytiques avancées dans le dashboard (courbe MRR, taux de conversion)
- [ ] Sentry pour le monitoring des erreurs en prod
- [ ] Mentions légales / CGU / Politique de confidentialité

---

## ✈️ Checklist lancement public

> À cocher avant de passer le DNS en prod et d'annoncer le produit.

### Critique (bloquant)
- [ ] Variables d'env Vercel complètes (Stripe, Resend, Supabase, CRON_SECRET)
- [ ] Bucket Supabase Storage `logos` créé avec policy RLS correcte
- [ ] Webhook Stripe configuré avec l'URL de prod (pas localhost)
- [ ] Test end-to-end : créer un devis → envoyer → signer → passer Pro → annuler
- [ ] Mentions légales + CGU + Politique de confidentialité (obligatoire RGPD)
- [ ] Domaine custom vérifié sur Resend (réputation email)

### Important (non bloquant mais à faire rapidement)
- [ ] Modal "Limite atteinte" pour les utilisateurs free
- [ ] Export PDF réel
- [ ] Page 404 custom
- [ ] Favicon / OG image pour le partage social
- [ ] Google Analytics ou Plausible pour tracker l'acquisition

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

_Dernière mise à jour : 2026-03-20 — Phase 2 Stripe backend terminé, frontend partiel, lancement public imminent_
