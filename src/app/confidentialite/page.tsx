import LegalLayout from '@/components/landing/LegalLayout'

export const metadata = {
  title: 'Politique de confidentialité — Deviso',
  description: 'Comment Deviso collecte, utilise et protège vos données personnelles.',
}

export default function ConfidentialitePage() {
  return (
    <LegalLayout title="Politique de confidentialité" lastUpdated="20 mars 2026">
      <h2>1. Responsable du traitement</h2>
      <p>
        Le responsable du traitement des données personnelles collectées via <strong>deviso.app</strong> est :<br />
        <strong>totoken</strong>, entreprise individuelle — <a href="mailto:kennydsf91@gmail.com">kennydsf91@gmail.com</a>
      </p>

      <hr />

      <h2>2. Données collectées</h2>
      <p>Deviso collecte les données suivantes :</p>
      <ul>
        <li>
          <strong>Données de compte :</strong> adresse email, mot de passe (haché), nom, raison sociale,
          SIRET, numéro de TVA, adresse, logo, couleur de marque.
        </li>
        <li>
          <strong>Données clients :</strong> nom, société, email, téléphone, adresse des clients que
          vous enregistrez dans votre carnet de contacts.
        </li>
        <li>
          <strong>Données de devis :</strong> contenu des devis (lignes, montants, TVA), statut, dates
          d'envoi et de signature.
        </li>
        <li>
          <strong>Données de facturation :</strong> informations de paiement gérées par Stripe (Deviso
          ne stocke aucun numéro de carte bancaire).
        </li>
        <li>
          <strong>Données de navigation :</strong> adresse IP, type de navigateur, pages consultées,
          à des fins de sécurité et d'amélioration du service.
        </li>
        <li>
          <strong>Tracking d'ouverture d'email :</strong> un pixel invisible permet de détecter si un
          devis envoyé par email a été ouvert.
        </li>
      </ul>

      <hr />

      <h2>3. Finalités du traitement</h2>
      <p>Les données sont traitées pour les finalités suivantes :</p>
      <ul>
        <li>Création et gestion du compte utilisateur.</li>
        <li>Fourniture du service (création, envoi, suivi et signature de devis).</li>
        <li>Facturation et gestion des abonnements via Stripe.</li>
        <li>Envoi d'emails transactionnels (devis, relances, notifications) via Resend.</li>
        <li>Amélioration du service et détection des anomalies.</li>
        <li>Respect des obligations légales et comptables.</li>
      </ul>

      <hr />

      <h2>4. Base légale</h2>
      <p>
        Les traitements reposent sur les bases légales suivantes (RGPD art. 6) :
      </p>
      <ul>
        <li><strong>Exécution du contrat</strong> : pour les données nécessaires à la fourniture du service.</li>
        <li><strong>Intérêt légitime</strong> : pour la sécurité, la prévention de la fraude et l'amélioration du service.</li>
        <li><strong>Obligation légale</strong> : pour les données de facturation conservées à des fins comptables.</li>
        <li><strong>Consentement</strong> : pour les cookies analytiques non essentiels, si applicable.</li>
      </ul>

      <hr />

      <h2>5. Durée de conservation</h2>
      <ul>
        <li><strong>Données de compte actif :</strong> conservées pendant toute la durée du compte.</li>
        <li>
          <strong>Après suppression du compte :</strong> effacement définitif dans un délai de 30 jours,
          sauf obligation légale.
        </li>
        <li>
          <strong>Données de facturation :</strong> conservées 10 ans conformément aux obligations comptables
          françaises.
        </li>
        <li><strong>Logs de sécurité :</strong> conservés 12 mois maximum.</li>
      </ul>

      <hr />

      <h2>6. Sous-traitants et transferts</h2>
      <p>Deviso fait appel aux sous-traitants suivants :</p>
      <ul>
        <li>
          <strong>Supabase</strong> (base de données et stockage) — données hébergées en Europe (région
          EU West lorsque disponible).
        </li>
        <li>
          <strong>Vercel</strong> (hébergement de l'application) — serveurs Edge en Europe.
        </li>
        <li>
          <strong>Stripe</strong> (paiement) — certifié PCI-DSS, données traitées aux États-Unis sous
          clauses contractuelles types (SCC).
        </li>
        <li>
          <strong>Resend</strong> (envoi d'emails transactionnels) — données traitées aux États-Unis
          sous SCC.
        </li>
      </ul>
      <p>
        Aucune donnée personnelle n'est vendue, louée ou cédée à des tiers à des fins commerciales.
      </p>

      <hr />

      <h2>7. Vos droits</h2>
      <p>
        Conformément au RGPD (Règlement UE 2016/679) et à la loi Informatique et Libertés, vous disposez des
        droits suivants :
      </p>
      <ul>
        <li><strong>Droit d'accès</strong> : obtenir une copie de vos données.</li>
        <li><strong>Droit de rectification</strong> : corriger des données inexactes.</li>
        <li><strong>Droit à l'effacement</strong> : demander la suppression de vos données.</li>
        <li><strong>Droit à la portabilité</strong> : recevoir vos données dans un format structuré.</li>
        <li><strong>Droit d'opposition</strong> : vous opposer à certains traitements.</li>
        <li><strong>Droit à la limitation</strong> : restreindre temporairement le traitement.</li>
      </ul>
      <p>
        Pour exercer ces droits, contactez-nous à{' '}
        <a href="mailto:kennydsf91@gmail.com">kennydsf91@gmail.com</a>. Nous répondrons dans un délai maximum de
        30 jours.
      </p>
      <p>
        Vous pouvez également introduire une réclamation auprès de la{' '}
        <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer">CNIL</a>.
      </p>

      <hr />

      <h2>8. Sécurité</h2>
      <p>
        Deviso met en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données :
      </p>
      <ul>
        <li>Chiffrement des communications (HTTPS/TLS).</li>
        <li>Mots de passe hachés (bcrypt via Supabase Auth).</li>
        <li>Tokens d'accès aux devis générés par cryptographie (Web Crypto API).</li>
        <li>Isolation des données par utilisateur (Row Level Security Supabase).</li>
        <li>Validation de toutes les entrées côté serveur (Zod).</li>
      </ul>

      <hr />

      <h2>9. Cookies</h2>
      <p>
        Deviso utilise uniquement des cookies strictement nécessaires au fonctionnement du service
        (session d'authentification). Aucun cookie publicitaire ou de tracking tiers n'est déposé à ce jour.
      </p>

      <hr />

      <h2>10. Modifications</h2>
      <p>
        Cette politique peut être mise à jour. En cas de modification substantielle, vous serez notifié
        par email. La date de dernière mise à jour est indiquée en haut de cette page.
      </p>
    </LegalLayout>
  )
}
