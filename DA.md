# Direction Artistique — Deviso Landing Page

## Identité visuelle

### Couleurs
| Token         | Valeur      | Usage                                      |
|---------------|-------------|--------------------------------------------|
| `brand`       | `#6CC531`   | CTA primaire, accents, glows, highlights   |
| `brand-dark`  | `#4FA31E`   | Hover sur brand, ombres profondes          |
| `brand-light` | `#E4F7D0`   | Tints légers, badges sur fond sombre       |
| `#0A0F1E`     | —           | Fond hero (landing) et sections sombres    |
| `#0F1A0A`     | —           | Fond alternatif légèrement teinté vert     |
| `#F7F8F5`     | canvas      | Fond sections claires (intérieur app)      |
| `#FFFFFF`     | surface     | Cards, tableaux, composants flottants      |
| `#1A1E17`     | —           | Texte principal (presque noir, légèrement vert) |
| `#EAECE7`     | —           | Bordures subtiles                          |

### Palette landing spécifique
- **Fond principal** : `#0A0F1E` — sombre, pas noir pur, légèrement bleuté-nuit
- **Glow hero** : `#6CC531` à 20–30% opacité, `blur-3xl`, décoratif
- **Texte clair** : `white` et `white/70` sur fond sombre
- **Accent texte** : `#6CC531` pour les mots clés dans les headlines
- **Mockup / UI flottante** : fond `#0F1812` (très sombre teinté vert), bordure `brand/20`

---

## Typographie

| Rôle              | Font      | Poids    | Taille           |
|-------------------|-----------|----------|------------------|
| Logo              | Sora      | 700      | 17–20px          |
| Headline hero     | Sora      | 800–900  | 64–96px (fluid)  |
| Sous-headline     | DM Sans   | 400–500  | 18–22px          |
| Titre de section  | Sora      | | 700      | 36–48px          |
| Corps de texte    | DM Sans   | 400      | 15–17px          |
| Labels / badges   | DM Sans   | 600      | 11–13px          |
| Chiffres (stats)  | Sora      | 700–800  | tabular-nums     |

**Règle absolue** : jamais Arial, jamais Roboto.
**Line-height** : `leading-tight` (1.15) sur les headlines, `leading-relaxed` (1.6) sur le corps.

---

## Langage des formes

- **Border-radius** : `rounded-2xl` (cards), `rounded-xl` (boutons), `rounded-lg` (petits éléments), `rounded-full` réservé aux badges de statut / avatars uniquement
- **Ombres** : `shadow-brand/25` sur les éléments brand, jamais d'ombre noire générique
- **Bordures** : `border-brand/20` sur fond sombre, `border-gray-100` sur fond clair
- **Espacement** : généreux — `py-24` minimum entre sections, `gap-6` dans les grilles
- **Glassmorphism** : `backdrop-blur-md bg-white/5 border border-white/10` pour la navbar sticky

---

## Glow pattern (réutilisable)

```tsx
// Glow décoratif brand
<div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-brand/20 rounded-full blur-3xl pointer-events-none" />
// Glow secondaire
<div className="absolute bottom-0 right-0 w-64 h-64 bg-brand/10 rounded-full blur-2xl pointer-events-none" />
```

---

## Composants clés landing

### Navbar
- Sticky top-0, `backdrop-blur-md`, `bg-[#0A0F1E]/80`, `border-b border-white/5`
- Logo : carré brand `rounded-lg` + "Deviso" en Sora bold
- Liens : `text-white/60 hover:text-white`
- CTA : `bg-brand hover:bg-brand-dark` + `shadow-brand/30` + léger glow au hover

### Bouton CTA primaire
```tsx
className="bg-brand hover:bg-brand-dark text-white font-semibold px-6 py-3 rounded-xl
           shadow-sm shadow-brand/30 hover:shadow-md hover:shadow-brand/40
           transition-all duration-200 hover:-translate-y-px"
```

### Bouton CTA secondaire
```tsx
className="border border-white/15 hover:border-brand/50 text-white/80 hover:text-white
           font-medium px-6 py-3 rounded-xl transition-all duration-200"
```

### Badge / tag
```tsx
className="inline-flex items-center gap-2 bg-brand/10 border border-brand/20
           text-brand-light rounded-full px-4 py-1.5 text-xs font-semibold"
```

### Card feature (fond sombre)
```tsx
className="bg-white/3 border border-white/8 rounded-2xl p-6
           hover:border-brand/30 hover:bg-brand/5 transition-all duration-300"
```

### Pricing card highlight (Pro)
```tsx
className="bg-brand/10 border-2 border-brand/40 rounded-2xl p-8
           shadow-xl shadow-brand/20 relative overflow-hidden"
// + glow interne en absolute
```

---

## Animations (Framer Motion)

### Entrance scroll (réutilisable)
```tsx
const fadeUp = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } }
}
// Wrapper : whileInView="visible" initial="hidden" viewport={{ once: true, margin: "-80px" }}
```

### Notification slide-in hero
```tsx
// Délai 1.5s, slide depuis droite
initial: { opacity: 0, x: 40, scale: 0.95 }
animate: { opacity: 1, x: 0, scale: 1 }
transition: { delay: 1.5, duration: 0.5, ease: [0.22, 1, 0.36, 1] }
```

### Compteurs (social proof)
- `useInView` + `useMotionValue` + `animate()` de 0 → valeur finale sur 1.5s
- Easing : `easeOut`

### Règle des animations
> Chaque animation doit INFORMER ou ENCHANTER, pas distraire.
> Maximum 1 animation simultanée visible à l'écran.
> Durée : 400–600ms. Jamais > 800ms.

---

## Références visuelles
- [Linear.app](https://linear.app) — typographie, espacement, minimalisme
- [Vercel.com](https://vercel.com) — hero sombre, UI flottante
- [Raycast.com](https://raycast.com) — animations, glow, mockup produit
- [Resend.com](https://resend.com) — lisibilité, features alternées

---

## Ce qu'on ne fait pas
- ❌ Gradient purple/rose sur fond blanc
- ❌ "Revolutionnez votre workflow" ou tout super-lativo générique
- ❌ Grid de 6 cards identiques pour les features
- ❌ Illustrations Undraw ou stock photos
- ❌ `rounded-full` sur les boutons principaux
- ❌ Section FAQ interminable
- ❌ Template Webflow 2021

---

## Structure de la page

```
1. <Navbar />           — sticky, frostée, logo + liens + CTA
2. <HeroSection />      — headline 8 mots max, mockup flottant, notification animée
3. <ProblemSection />   — 3 colonnes, douleurs sans le mot "problème"
4. <FeaturesSection />  — layout alterné gauche/droite, visuels animés
5. <SocialProof />      — compteurs animés
6. <PricingSection />   — 2 cards, Pro highlightée, toggle mensuel/annuel
7. <Footer />           — minimal, "Fait en France 🇫🇷"
```

---

## Tokens CSS utiles (référence rapide)
```
bg-[#0A0F1E]          Fond sombre landing
text-brand            Vert pomme #6CC531
bg-brand/10           Tint très léger brand
border-brand/20       Bordure brand subtile
shadow-brand/30       Ombre colorée brand
bg-white/5            Glassmorphisme léger
border-white/10       Bordure glass
font-display          Sora
font-sans             DM Sans
```
