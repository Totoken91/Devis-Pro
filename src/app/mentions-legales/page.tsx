import LegalLayout from '@/components/landing/LegalLayout'

export const metadata = {
  title: 'Mentions légales — Deviso',
  description: 'Mentions légales du service Deviso.',
}

export default function MentionsLegalesPage() {
  return (
    <LegalLayout title="Mentions légales" lastUpdated="20 mars 2026">
      <h2>1. Éditeur du site</h2>
      <p>
        Le site <strong>deviso.fr</strong> est édité par :<br />
        <strong>totoken</strong><br />
        Entreprise individuelle<br />
        Adresse : 21 Domaine de Montvoisin, 91400 Gometz-la-Ville<br />
        SIRET : <strong>[VOTRE NUMÉRO SIRET]</strong><br />
        Email : <a href="mailto:hello@deviso.fr">hello@deviso.fr</a>
      </p>
      <p>
        Directeur de la publication : <strong>Kenny Desaintfuscien</strong>
      </p>

      <hr />

      <h2>2. Hébergement</h2>
      <p>
        Le site est hébergé par :<br />
        <strong>Vercel Inc.</strong><br />
        440 N Barranca Ave #4133, Covina, CA 91723, États-Unis<br />
        <a href="https://vercel.com" target="_blank" rel="noopener noreferrer">vercel.com</a>
      </p>
      <p>
        La base de données et le stockage sont assurés par :<br />
        <strong>Supabase Inc.</strong><br />
        970 Toa Payoh North #07-04, Singapour 318992<br />
        <a href="https://supabase.com" target="_blank" rel="noopener noreferrer">supabase.com</a>
      </p>

      <hr />

      <h2>3. Propriété intellectuelle</h2>
      <p>
        L'ensemble du contenu de ce site (textes, images, logos, code source, interface) est la propriété
        exclusive de l'éditeur, sauf mention contraire. Toute reproduction, distribution ou utilisation
        sans autorisation préalable est strictement interdite.
      </p>

      <hr />

      <h2>4. Limitation de responsabilité</h2>
      <p>
        L'éditeur s'efforce d'assurer l'exactitude et la mise à jour des informations présentes sur ce site.
        Toutefois, il ne peut garantir l'exactitude, la complétude ou l'actualité des informations diffusées.
        L'utilisation du site se fait sous l'entière responsabilité de l'utilisateur.
      </p>

      <hr />

      <h2>5. Données personnelles</h2>
      <p>
        Le traitement des données personnelles collectées via ce site est décrit dans notre{' '}
        <a href="/confidentialite">Politique de confidentialité</a>.
      </p>

      <hr />

      <h2>6. Droit applicable</h2>
      <p>
        Les présentes mentions légales sont soumises au droit français. En cas de litige, les tribunaux
        compétents du ressort du siège social de l'éditeur seront seuls compétents.
      </p>
    </LegalLayout>
  )
}
