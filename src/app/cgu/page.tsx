import LegalLayout from '@/components/landing/LegalLayout'

export const metadata = {
  title: "Conditions Générales d'Utilisation — Deviso",
  description: "CGU du service Deviso — logiciel de devis en ligne pour freelances et TPE.",
}

export default function CguPage() {
  return (
    <LegalLayout title="Conditions Générales d'Utilisation" lastUpdated="20 mars 2026">
      <h2>1. Objet</h2>
      <p>
        Les présentes Conditions Générales d'Utilisation (CGU) régissent l'accès et l'utilisation du
        service <strong>Deviso</strong> accessible sur <a href="https://deviso.fr">deviso.fr</a>. Deviso
        est un logiciel SaaS permettant à des professionnels indépendants et PME de créer, envoyer et
        faire signer des devis en ligne.
      </p>
      <p>
        En créant un compte, l'utilisateur accepte sans réserve les présentes CGU.
      </p>

      <hr />

      <h2>2. Accès au service</h2>
      <p>
        Le service est accessible à toute personne physique ou morale disposant d'une adresse email valide.
        L'inscription est gratuite. Un plan payant (Pro) est proposé pour accéder aux fonctionnalités avancées.
      </p>
      <p>
        L'utilisateur s'engage à fournir des informations exactes lors de son inscription et à les maintenir à jour.
        Tout compte créé avec des informations frauduleuses pourra être supprimé sans préavis.
      </p>

      <hr />

      <h2>3. Plans et tarification</h2>
      <p>
        Deviso propose deux plans :
      </p>
      <ul>
        <li><strong>Plan Gratuit</strong> : jusqu'à 3 devis par mois, sans engagement.</li>
        <li>
          <strong>Plan Pro</strong> : devis illimités, relances automatiques, personnalisation avancée
          (logo, couleur de marque). Facturation mensuelle (15 €/mois) ou annuelle (12 €/mois × 12).
        </li>
      </ul>
      <p>
        Les prix sont exprimés en euros TTC. L'abonnement Pro est reconduit automatiquement à chaque échéance.
        L'utilisateur peut résilier à tout moment depuis l'espace &quot;Facturation&quot;, avec effet à la fin
        de la période en cours.
      </p>

      <hr />

      <h2>4. Obligations de l'utilisateur</h2>
      <p>L'utilisateur s'engage à :</p>
      <ul>
        <li>Utiliser Deviso dans un cadre légal et professionnel uniquement.</li>
        <li>Ne pas tenter de contourner les restrictions techniques ou de sécurité du service.</li>
        <li>Ne pas partager ses identifiants de connexion.</li>
        <li>Ne pas utiliser le service pour envoyer du spam ou des communications non sollicitées.</li>
        <li>
          S'assurer que les devis émis via Deviso respectent la réglementation applicable (mentions
          légales obligatoires, TVA, etc.).
        </li>
      </ul>

      <hr />

      <h2>5. Données et contenu de l'utilisateur</h2>
      <p>
        L'utilisateur reste seul propriétaire des données qu'il saisit dans Deviso (informations clients,
        devis, coordonnées). En utilisant le service, il accorde à Deviso une licence limitée pour traiter
        ces données dans le seul but de fournir le service.
      </p>
      <p>
        Deviso ne vend, ne loue et ne cède aucune donnée personnelle de l'utilisateur à des tiers.
      </p>

      <hr />

      <h2>6. Disponibilité du service</h2>
      <p>
        Deviso s'efforce d'assurer une disponibilité maximale du service (objectif 99,5 % hors maintenances
        planifiées). Aucune indemnité ne pourra être réclamée en cas d'indisponibilité temporaire due à des
        opérations de maintenance, à une panne technique ou à un cas de force majeure.
      </p>

      <hr />

      <h2>7. Résiliation et suppression du compte</h2>
      <p>
        L'utilisateur peut supprimer son compte à tout moment depuis les paramètres de son profil ou en
        contactant <a href="mailto:hello@deviso.fr">hello@deviso.fr</a>. La suppression entraîne
        l'effacement définitif de toutes les données associées dans un délai de 30 jours.
      </p>
      <p>
        Deviso se réserve le droit de suspendre ou supprimer un compte en cas de violation des présentes CGU,
        sans préavis ni remboursement.
      </p>

      <hr />

      <h2>8. Limitation de responsabilité</h2>
      <p>
        Deviso est un outil d'aide à la création de devis et ne constitue pas un conseil juridique ou
        comptable. L'utilisateur est seul responsable du contenu de ses devis et de leur conformité aux
        obligations légales et fiscales en vigueur.
      </p>
      <p>
        La responsabilité de Deviso ne saurait être engagée au-delà du montant des sommes effectivement
        versées par l'utilisateur au cours des 12 derniers mois.
      </p>

      <hr />

      <h2>9. Modification des CGU</h2>
      <p>
        Deviso se réserve le droit de modifier les présentes CGU à tout moment. L'utilisateur sera informé
        par email de toute modification substantielle. L'utilisation continue du service après notification
        vaut acceptation des nouvelles conditions.
      </p>

      <hr />

      <h2>10. Droit applicable et litiges</h2>
      <p>
        Les présentes CGU sont soumises au droit français. En cas de litige, une solution amiable sera
        recherchée en priorité. À défaut, les tribunaux compétents du ressort du siège social de l'éditeur
        seront seuls compétents.
      </p>
      <p>
        Conformément à l'article L.616-1 du Code de la consommation, en cas de litige non résolu, le
        consommateur peut recourir à un médiateur de la consommation.
      </p>
    </LegalLayout>
  )
}
