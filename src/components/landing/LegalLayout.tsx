import Link from 'next/link'
import Footer from './Footer'

export default function LegalLayout({
  title,
  lastUpdated,
  children,
}: {
  title: string
  lastUpdated: string
  children: React.ReactNode
}) {
  return (
    <>
      <div className="min-h-screen bg-[#0A0F1E]">
        {/* Nav minimaliste */}
        <nav className="border-b border-white/6 px-6 h-14 flex items-center justify-between max-w-5xl mx-auto">
          <Link href="/" className="font-display font-bold text-white text-lg tracking-tight">
            Devi<span className="text-brand">so</span>
          </Link>
          <Link href="/" className="text-white/40 hover:text-white text-sm transition-colors">
            ← Retour à l'accueil
          </Link>
        </nav>

        {/* Contenu */}
        <div className="max-w-3xl mx-auto px-6 py-14">
          <h1 className="font-display text-3xl font-bold text-white mb-2">{title}</h1>
          <p className="text-white/30 text-sm mb-10">Dernière mise à jour : {lastUpdated}</p>

          <div className="prose-legal">
            {children}
          </div>
        </div>
      </div>
      <Footer />

      <style>{`
        .prose-legal h2 {
          font-size: 1.125rem;
          font-weight: 700;
          color: rgba(255,255,255,0.9);
          margin-top: 2.5rem;
          margin-bottom: 0.75rem;
        }
        .prose-legal p, .prose-legal li {
          font-size: 0.9375rem;
          color: rgba(255,255,255,0.45);
          line-height: 1.75;
          margin-bottom: 0.75rem;
        }
        .prose-legal ul {
          list-style: disc;
          padding-left: 1.5rem;
          margin-bottom: 1rem;
        }
        .prose-legal a {
          color: #6CC531;
          text-decoration: underline;
          text-underline-offset: 3px;
        }
        .prose-legal strong {
          color: rgba(255,255,255,0.7);
          font-weight: 600;
        }
        .prose-legal hr {
          border-color: rgba(255,255,255,0.06);
          margin: 2rem 0;
        }
      `}</style>
    </>
  )
}
