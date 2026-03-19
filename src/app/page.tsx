import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0F2540] via-[#1E3A5F] to-[#2E86C1] flex items-center justify-center px-4">
      <div className="text-center text-white max-w-2xl">
        <p className="text-xs font-bold tracking-widest uppercase text-white/50 mb-6">
          En construction
        </p>
        <h1 className="text-6xl font-bold mb-4">
          Devi<span className="text-[#7EC8E3]">so</span>
        </h1>
        <p className="text-xl text-white/80 mb-8">
          Créez, envoyez et faites signer vos devis professionnels en quelques minutes.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/inscription"
            className="bg-[#2E86C1] hover:bg-[#1E6A9F] text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Commencer gratuitement
          </Link>
          <Link
            href="/connexion"
            className="border border-white/30 hover:border-white/60 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Se connecter
          </Link>
        </div>
      </div>
    </main>
  )
}
