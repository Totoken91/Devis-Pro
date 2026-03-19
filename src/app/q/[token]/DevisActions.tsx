'use client'

import { useState } from 'react'
import { CheckCircle, XCircle, PenLine } from 'lucide-react'

interface DevisActionsProps {
  token: string
  statut: string
  signeL: string | null
}

export function DevisActions({ token, statut, signeL }: DevisActionsProps) {
  const [modal, setModal] = useState<'accepter' | 'refuser' | null>(null)
  const [nomSignataire, setNomSignataire] = useState('')
  const [consent, setConsent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState<'accepte' | 'refuse' | null>(null)
  const [error, setError] = useState<string | null>(null)

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })

  // Devis déjà accepté (depuis la DB)
  if (statut === 'accepte') {
    return (
      <div className="mt-8 bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
        <CheckCircle size={32} className="text-green-500 mx-auto mb-2" />
        <p className="font-semibold text-green-800 text-base">Devis accepté</p>
        {signeL && (
          <p className="text-sm text-green-600 mt-1">Signé le {formatDate(signeL)}</p>
        )}
      </div>
    )
  }

  // Devis déjà refusé (depuis la DB)
  if (statut === 'refuse') {
    return (
      <div className="mt-8 bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
        <XCircle size={32} className="text-red-400 mx-auto mb-2" />
        <p className="font-semibold text-red-800 text-base">Devis refusé</p>
      </div>
    )
  }

  const handleAction = async (action: 'accepte' | 'refuse') => {
    if (action === 'accepte' && !nomSignataire.trim()) {
      setError('Merci d\'indiquer votre nom complet.')
      return
    }
    if (action === 'accepte' && !consent) {
      setError('Merci de cocher la case de confirmation.')
      return
    }

    setLoading(true)
    setError(null)

    const res = await fetch(`/api/devis/${token}/action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, nom_signataire: nomSignataire }),
    })

    if (res.ok) {
      setDone(action)
      setModal(null)
    } else {
      const data = await res.json().catch(() => ({}))
      setError(data.error ?? 'Une erreur est survenue.')
    }
    setLoading(false)
  }

  // Résultat après action (sans reload page)
  if (done === 'accepte') {
    return (
      <div className="mt-8 bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
        <CheckCircle size={32} className="text-green-500 mx-auto mb-2" />
        <p className="font-semibold text-green-800 text-base">Devis accepté — merci !</p>
        <p className="text-sm text-green-600 mt-1">L&apos;émetteur a été notifié de votre acceptation.</p>
      </div>
    )
  }

  if (done === 'refuse') {
    return (
      <div className="mt-8 bg-gray-50 border border-gray-200 rounded-2xl p-6 text-center">
        <XCircle size={32} className="text-gray-400 mx-auto mb-2" />
        <p className="font-medium text-gray-700">Votre refus a bien été transmis.</p>
      </div>
    )
  }

  return (
    <>
      {/* Bandeau CTA */}
      <div className="mt-8 bg-blue-50 border border-blue-100 rounded-2xl p-6">
        <p className="text-sm font-semibold text-gray-800 text-center mb-1">Ce devis vous convient ?</p>
        <p className="text-xs text-gray-400 text-center mb-5">Votre réponse sera transmise directement à l&apos;émetteur.</p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => { setModal('refuser'); setError(null) }}
            className="flex items-center gap-2 border border-gray-300 text-gray-700 font-medium rounded-xl px-5 py-2.5 text-sm hover:bg-gray-50 transition-colors"
          >
            <XCircle size={16} className="text-red-400" />
            Refuser
          </button>
          <button
            onClick={() => { setModal('accepter'); setError(null) }}
            className="flex items-center gap-2 bg-[#2E86C1] hover:bg-[#1E3A5F] text-white font-semibold rounded-xl px-5 py-2.5 text-sm transition-colors"
          >
            <PenLine size={16} />
            Accepter & signer
          </button>
        </div>
      </div>

      {/* Modal — Accepter */}
      {modal === 'accepter' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-1">Signer & accepter ce devis</h2>
            <p className="text-sm text-gray-500 mb-5">En confirmant, vous acceptez les termes et conditions du devis.</p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Votre nom complet</label>
              <input
                type="text"
                value={nomSignataire}
                onChange={(e) => { setNomSignataire(e.target.value); setError(null) }}
                placeholder="Jean Dupont"
                autoFocus
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E86C1] focus:border-transparent"
              />
            </div>

            {/* Aperçu signature */}
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 mb-4 bg-gray-50 min-h-[60px] flex items-center justify-center">
              {nomSignataire.trim() ? (
                <p className="text-xl text-[#1E3A5F] italic" style={{ fontFamily: 'Georgia, serif' }}>
                  {nomSignataire}
                </p>
              ) : (
                <p className="text-xs text-gray-400">L&apos;aperçu de votre signature apparaîtra ici</p>
              )}
            </div>

            <label className="flex items-start gap-2.5 mb-5 cursor-pointer">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => { setConsent(e.target.checked); setError(null) }}
                className="mt-0.5 rounded accent-[#2E86C1]"
              />
              <span className="text-xs text-gray-500 leading-relaxed">
                Je confirme avoir lu ce devis et j&apos;accepte sans réserve ses termes, conditions et montants.
              </span>
            </label>

            {error && <p className="text-sm text-red-500 mb-3">{error}</p>}

            <div className="flex gap-3">
              <button
                onClick={() => setModal(null)}
                disabled={loading}
                className="flex-1 border border-gray-300 text-gray-700 font-medium rounded-xl py-2.5 hover:bg-gray-50 text-sm disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                onClick={() => handleAction('accepte')}
                disabled={loading}
                className="flex-1 bg-[#2E86C1] hover:bg-[#1E3A5F] text-white font-semibold rounded-xl py-2.5 text-sm disabled:opacity-50 transition-colors"
              >
                {loading ? 'Envoi...' : 'Confirmer & signer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal — Refuser */}
      {modal === 'refuser' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <XCircle size={24} className="text-red-400" />
            </div>
            <h2 className="text-base font-semibold text-gray-900 mb-2">Refuser ce devis ?</h2>
            <p className="text-sm text-gray-500 mb-5">L&apos;émetteur sera informé de votre refus.</p>
            {error && <p className="text-sm text-red-500 mb-3">{error}</p>}
            <div className="flex gap-3">
              <button
                onClick={() => setModal(null)}
                disabled={loading}
                className="flex-1 border border-gray-300 text-gray-700 font-medium rounded-xl py-2.5 text-sm disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                onClick={() => handleAction('refuse')}
                disabled={loading}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl py-2.5 text-sm disabled:opacity-50 transition-colors"
              >
                {loading ? 'Envoi...' : 'Confirmer le refus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
