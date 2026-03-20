import Link from 'next/link'

const LINKS = {
  Produit: [
    { label: 'Fonctionnalités', href: '#features' },
    { label: 'Tarifs', href: '#pricing' },
    { label: 'Changelog', href: '#' },
  ],
  Ressources: [
    { label: 'Documentation', href: '#' },
    { label: 'Blog', href: '#' },
    { label: 'Support', href: 'mailto:kennydsf91@gmail.com' },
  ],
  Légal: [
    { label: 'Confidentialité', href: '/confidentialite' },
    { label: 'CGU', href: '/cgu' },
    { label: 'Mentions légales', href: '/mentions-legales' },
  ],
}

export default function Footer() {
  return (
    <footer className="relative bg-[#141C2E] border-t border-white/6 px-4 py-16">
      <div className="max-w-5xl mx-auto">

        {/* grid-cols-3 mobile : brand full-width (col-span-3), puis 3 cols de liens */}
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-8 sm:gap-10 mb-14">

          {/* Marque — full width mobile, 1 col desktop */}
          <div className="col-span-3 sm:col-span-1">
            <span className="font-display text-xl font-bold text-white tracking-tight">
              Devi<span className="text-brand">so</span>
            </span>
            <p className="text-white/30 text-sm mt-3 leading-relaxed max-w-xs">
              Devis professionnels pour freelances et TPE. Signés plus vite, suivis en temps réel.
            </p>
          </div>

          {/* 3 colonnes de liens — chacune 1 col */}
          {Object.entries(LINKS).map(([group, items]) => (
            <div key={group}>
              <p className="text-white/25 text-xs font-semibold tracking-widest uppercase mb-4">
                {group}
              </p>
              <ul className="flex flex-col gap-2.5">
                {items.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="text-white/45 hover:text-white text-sm transition-colors duration-150"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

        </div>

        {/* Barre basse */}
        <div className="border-t border-white/6 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/20 text-xs">
            &copy; {new Date().getFullYear()} Deviso. Fait avec soin en France.
          </p>
          <div className="flex items-center gap-5">
            <Link href="#" aria-label="Twitter / X" className="text-white/20 hover:text-white/50 transition-colors duration-150">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.264 5.638L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
              </svg>
            </Link>
            <Link href="#" aria-label="LinkedIn" className="text-white/20 hover:text-white/50 transition-colors duration-150">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </Link>
          </div>
        </div>

      </div>
    </footer>
  )
}
