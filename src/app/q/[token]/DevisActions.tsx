'use client'

import { useState } from 'react'
import { CheckCircle2, XCircle, PenLine, X } from 'lucide-react'

export function DevisActions({ token, statut, signeL, brandColor = '#6CC531' }: { token: string; statut: string; signeL: string | null; brandColor?: string }) {
  const [modal,         setModal]         = useState<'accepter' | 'refuser' | null>(null)
  const [nomSignataire, setNomSignataire] = useState('')
  const [consent,       setConsent]       = useState(false)
  const [loading,       setLoading]       = useState(false)
  const [done,          setDone]          = useState<'accepte' | 'refuse' | null>(null)
  const [error,         setError]         = useState<string | null>(null)

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })

  const handleAction = async (action: 'accepte' | 'refuse') => {
    if (action === 'accepte' && !nomSignataire.trim()) { setError('Merci d\'indiquer votre nom complet.'); return }
    if (action === 'accepte' && !consent) { setError('Merci de cocher la case de confirmation.'); return }
    setLoading(true); setError(null)
    const res = await fetch(`/api/devis/${token}/action`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, nom_signataire: nomSignataire }),
    })
    if (res.ok) { setDone(action); setModal(null) } else {
      const data = await res.json().catch(() => ({}))
      setError(data.error ?? 'Une erreur est survenue.')
    }
    setLoading(false)
  }

  /* ── Already accepted ── */
  if (statut === 'accepte' || done === 'accepte') {
    return (
      <div className="mt-6 border-t border-gray-100 pt-6">
        <div className="bg-green-50 border border-green-100 rounded-2xl p-6 text-center">
          <CheckCircle2 size={28} className="text-green-500 mx-auto mb-2" />
          <p className="font-semibold text-green-800 text-sm">
            {done === 'accepte' ? 'Devis accepté — merci !' : 'Devis accepté'}
          </p>
          {signeL && <p className="text-xs text-green-600 mt-1">Signé le {formatDate(signeL)}</p>}
          {done === 'accepte' && (
            <p className="text-xs text-green-600 mt-1">L&apos;émetteur a été notifié de votre acceptation.</p>
          )}
        </div>
      </div>
    )
  }

  /* ── Already refused ── */
  if (statut === 'refuse' || done === 'refuse') {
    return (
      <div className="mt-6 border-t border-gray-100 pt-6">
        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 text-center">
          <XCircle size={28} className="text-gray-400 mx-auto mb-2" />
          <p className="text-sm font-medium text-gray-600">Votre refus a bien été transmis.</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* ── CTA section ── */}
      <div className="mt-6 border-t border-gray-100 pt-6">
        <div className="bg-[#F7F8F5] rounded-2xl p-6 border border-gray-100">
          <p className="text-sm font-semibold text-gray-800 text-center mb-0.5">Ce devis vous convient ?</p>
          <p className="text-xs text-gray-400 text-center mb-5">Votre réponse sera transmise directement à l&apos;émetteur.</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => { setModal('refuser'); setError(null) }}
              className="flex items-center gap-2 border border-gray-200 bg-white text-gray-600 font-medium rounded-xl px-5 py-2.5 text-sm hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <XCircle size={14} className="text-red-400" />
              Refuser
            </button>
            <button
              onClick={() => { setModal('accepter'); setError(null) }}
              className="flex items-center gap-2 text-white font-semibold rounded-xl px-5 py-2.5 text-sm transition-all shadow-sm cursor-pointer"
              style={{ backgroundColor: brandColor }}
            >
              <PenLine size={14} />
              Accepter & signer
            </button>
          </div>
        </div>
      </div>

      {/* ── Modal Accepter ── */}
      {modal === 'accepter' && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-900">Signer & accepter ce devis</h2>
              <button onClick={() => setModal(null)} className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg cursor-pointer"><X size={16} /></button>
            </div>
            <div className="px-6 py-5">
              <p className="text-sm text-gray-500 mb-5">En confirmant, vous acceptez les termes et conditions du devis.</p>

              <label className="block text-xs font-medium text-gray-500 mb-1.5">Votre nom complet</label>
              <input
                type="text"
                value={nomSignataire}
                onChange={(e) => { setNomSignataire(e.target.value); setError(null) }}
                placeholder="Jean Dupont"
                autoFocus
                className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 transition-all mb-4"
                style={{ '--tw-ring-color': `${brandColor}33` } as React.CSSProperties}
              />

              {/* Aperçu signature */}
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-5 mb-4 bg-gray-50 min-h-[72px] flex items-center justify-center">
                {nomSignataire.trim() ? (
                  <p className="text-2xl text-gray-700 italic" style={{ fontFamily: 'Brush Script MT, Segoe Script, cursive' }}>
                    {nomSignataire}
                  </p>
                ) : (
                  <p className="text-xs text-gray-400">Votre signature apparaîtra ici</p>
                )}
              </div>

              <label className="flex items-start gap-2.5 mb-5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => { setConsent(e.target.checked); setError(null) }}
                  className="mt-0.5 rounded"
                  style={{ accentColor: brandColor }}
                />
                <span className="text-xs text-gray-500 leading-relaxed">
                  Je confirme avoir lu ce devis et j&apos;accepte sans réserve ses termes, conditions et montants.
                </span>
              </label>

              {error && <p className="text-xs text-red-500 mb-3">{error}</p>}

              <div className="flex gap-3">
                <button
                  onClick={() => setModal(null)}
                  disabled={loading}
                  className="flex-1 border border-gray-200 text-gray-600 font-medium rounded-xl py-2.5 hover:bg-gray-50 text-sm cursor-pointer disabled:opacity-50"
                >
                  Annuler
                </button>
                <button
                  onClick={() => handleAction('accepte')}
                  disabled={loading}
                  className="flex-1 text-white font-semibold rounded-xl py-2.5 text-sm transition-colors cursor-pointer disabled:opacity-50"
                  style={{ backgroundColor: brandColor }}
                >
                  {loading ? 'Envoi…' : 'Confirmer & signer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Refuser ── */}
      {modal === 'refuser' && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-900">Refuser ce devis</h2>
              <button onClick={() => setModal(null)} className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg cursor-pointer"><X size={16} /></button>
            </div>
            <div className="px-6 py-5">
              <p className="text-sm text-gray-500 mb-5">L&apos;émetteur sera informé de votre refus.</p>
              {error && <p className="text-xs text-red-500 mb-3">{error}</p>}
              <div className="flex gap-3">
                <button onClick={() => setModal(null)} disabled={loading} className="flex-1 border border-gray-200 text-gray-600 font-medium rounded-xl py-2.5 text-sm cursor-pointer disabled:opacity-50">
                  Annuler
                </button>
                <button onClick={() => handleAction('refuse')} disabled={loading} className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl py-2.5 text-sm transition-colors cursor-pointer disabled:opacity-50">
                  {loading ? 'Envoi…' : 'Confirmer le refus'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
