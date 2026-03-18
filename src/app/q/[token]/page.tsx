// Page publique du devis (accessible sans connexion)
export default function DevisPublicPage({
  params,
}: {
  params: { token: string }
}) {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <p className="text-gray-400">Devis public — Token : {params.token} — Semaine 5</p>
    </div>
  )
}
