import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer'
import type { DevisLigne } from '@/types/supabase'

// Palette
const BLEU_FONCE = '#1E3A5F'
const BLEU_CLAIR = '#2E86C1'
const GRIS = '#6B7280'
const GRIS_LIGHT = '#F3F4F6'
const GRIS_BORDER = '#E5E7EB'

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: '#111827',
    paddingTop: 0,
    paddingBottom: 40,
    paddingHorizontal: 0,
  },
  // En-tête colorée
  header: {
    backgroundColor: BLEU_FONCE,
    paddingHorizontal: 40,
    paddingTop: 36,
    paddingBottom: 28,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: { flexDirection: 'column' },
  headerLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 8, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  headerNumero: { color: '#FFFFFF', fontSize: 22, fontFamily: 'Helvetica-Bold' },
  headerTitre: { color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 4 },
  headerRight: { alignItems: 'flex-end' },
  headerDateLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 8 },
  headerDateVal: { color: '#FFFFFF', fontSize: 9, fontFamily: 'Helvetica-Bold', marginTop: 2 },

  // Corps
  body: { paddingHorizontal: 40, paddingTop: 28 },

  // Parties émetteur / destinataire
  parties: { flexDirection: 'row', marginBottom: 28, gap: 16 },
  partie: { flex: 1 },
  partieLabel: { fontSize: 7, textTransform: 'uppercase', letterSpacing: 1, color: GRIS, marginBottom: 6, fontFamily: 'Helvetica-Bold' },
  partieNom: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: '#111827', marginBottom: 2 },
  partieLine: { fontSize: 8.5, color: GRIS, marginBottom: 1 },
  partieSmall: { fontSize: 7.5, color: '#9CA3AF', marginTop: 2 },

  // Séparateur
  sep: { borderBottomWidth: 1, borderBottomColor: GRIS_BORDER, marginBottom: 20 },

  // Table lignes
  tableHeader: { flexDirection: 'row', backgroundColor: GRIS_LIGHT, paddingVertical: 7, paddingHorizontal: 10, marginBottom: 0, borderRadius: 4 },
  tableHeaderText: { fontSize: 7.5, textTransform: 'uppercase', letterSpacing: 0.5, color: GRIS, fontFamily: 'Helvetica-Bold' },
  tableRow: { flexDirection: 'row', paddingVertical: 8, paddingHorizontal: 10, borderBottomWidth: 1, borderBottomColor: GRIS_BORDER },
  colDesc: { flex: 1 },
  colQty: { width: 40, textAlign: 'center' },
  colPU: { width: 70, textAlign: 'right' },
  colTotal: { width: 70, textAlign: 'right' },
  cellText: { fontSize: 8.5, color: '#374151' },
  cellBold: { fontSize: 8.5, fontFamily: 'Helvetica-Bold', color: '#111827' },

  // Totaux
  totauxWrap: { alignItems: 'flex-end', marginTop: 16, marginBottom: 24 },
  totauxBox: { width: 200 },
  totauxRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  totauxLabel: { fontSize: 8.5, color: GRIS },
  totauxVal: { fontSize: 8.5, fontFamily: 'Helvetica-Bold', color: '#111827' },
  totauxFinalRow: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1.5, borderTopColor: BLEU_FONCE, paddingTop: 8, marginTop: 4 },
  totauxFinalLabel: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: BLEU_FONCE },
  totauxFinalVal: { fontSize: 13, fontFamily: 'Helvetica-Bold', color: BLEU_FONCE },

  // Notes / Conditions
  notesSection: { marginBottom: 16 },
  notesLabel: { fontSize: 7.5, textTransform: 'uppercase', letterSpacing: 0.5, color: GRIS, fontFamily: 'Helvetica-Bold', marginBottom: 4 },
  notesText: { fontSize: 8.5, color: '#4B5563', lineHeight: 1.5 },

  // Pied de page
  footer: { position: 'absolute', bottom: 18, left: 40, right: 40, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  footerText: { fontSize: 7.5, color: '#9CA3AF' },
  footerBrand: { fontSize: 7.5, color: BLEU_CLAIR, fontFamily: 'Helvetica-Bold' },
})

function fmt(n: number) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n)
}

function fmtDate(s: string) {
  return new Intl.DateTimeFormat('fr-FR').format(new Date(s))
}

interface DevisPDFProps {
  devis: {
    numero: string
    titre: string
    created_at: string
    date_validite?: string | null
    lignes: DevisLigne[]
    tva_taux: number
    montant_ht: number
    montant_tva: number
    montant_ttc: number
    notes?: string | null
    conditions?: string | null
    statut: string
  }
  emetteur: {
    full_name?: string | null
    company_name?: string | null
    email?: string
    phone?: string | null
    address?: string | null
    siret?: string | null
  } | null
  destinataire: {
    name: string
    company?: string | null
    email?: string | null
    phone?: string | null
    address?: string | null
  } | null
}

export function DevisPDF({ devis, emetteur, destinataire }: DevisPDFProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* En-tête */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerLabel}>Devis</Text>
            <Text style={styles.headerNumero}>{devis.numero}</Text>
            <Text style={styles.headerTitre}>{devis.titre}</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.headerDateLabel}>Émis le</Text>
            <Text style={styles.headerDateVal}>{fmtDate(devis.created_at)}</Text>
            {devis.date_validite && (
              <>
                <Text style={[styles.headerDateLabel, { marginTop: 8 }]}>Valide jusqu&apos;au</Text>
                <Text style={styles.headerDateVal}>{fmtDate(devis.date_validite)}</Text>
              </>
            )}
          </View>
        </View>

        <View style={styles.body}>
          {/* Émetteur / Destinataire */}
          <View style={styles.parties}>
            <View style={styles.partie}>
              <Text style={styles.partieLabel}>De</Text>
              <Text style={styles.partieNom}>{emetteur?.company_name || emetteur?.full_name || '—'}</Text>
              {emetteur?.company_name && emetteur?.full_name && (
                <Text style={styles.partieLine}>{emetteur.full_name}</Text>
              )}
              {emetteur?.email && <Text style={styles.partieLine}>{emetteur.email}</Text>}
              {emetteur?.phone && <Text style={styles.partieLine}>{emetteur.phone}</Text>}
              {emetteur?.address && <Text style={styles.partieLine}>{emetteur.address}</Text>}
              {emetteur?.siret && <Text style={styles.partieSmall}>SIRET : {emetteur.siret}</Text>}
            </View>
            {destinataire && (
              <View style={styles.partie}>
                <Text style={styles.partieLabel}>À</Text>
                <Text style={styles.partieNom}>{destinataire.company || destinataire.name}</Text>
                {destinataire.company && <Text style={styles.partieLine}>{destinataire.name}</Text>}
                {destinataire.email && <Text style={styles.partieLine}>{destinataire.email}</Text>}
                {destinataire.phone && <Text style={styles.partieLine}>{destinataire.phone}</Text>}
                {destinataire.address && <Text style={styles.partieLine}>{destinataire.address}</Text>}
              </View>
            )}
          </View>

          <View style={styles.sep} />

          {/* Table lignes */}
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, styles.colDesc]}>Description</Text>
            <Text style={[styles.tableHeaderText, styles.colQty]}>Qté</Text>
            <Text style={[styles.tableHeaderText, styles.colPU]}>Prix unit.</Text>
            <Text style={[styles.tableHeaderText, styles.colTotal]}>Total HT</Text>
          </View>
          {(devis.lignes as DevisLigne[]).map((ligne) => (
            <View key={ligne.id} style={styles.tableRow}>
              <Text style={[styles.cellText, styles.colDesc]}>{ligne.description || '—'}</Text>
              <Text style={[styles.cellText, styles.colQty]}>{ligne.quantite}</Text>
              <Text style={[styles.cellText, styles.colPU]}>{fmt(ligne.prix_unitaire)}</Text>
              <Text style={[styles.cellBold, styles.colTotal]}>{fmt(ligne.total)}</Text>
            </View>
          ))}

          {/* Totaux */}
          <View style={styles.totauxWrap}>
            <View style={styles.totauxBox}>
              <View style={styles.totauxRow}>
                <Text style={styles.totauxLabel}>Montant HT</Text>
                <Text style={styles.totauxVal}>{fmt(devis.montant_ht)}</Text>
              </View>
              <View style={styles.totauxRow}>
                <Text style={styles.totauxLabel}>TVA ({devis.tva_taux}%)</Text>
                <Text style={styles.totauxVal}>{fmt(devis.montant_tva)}</Text>
              </View>
              <View style={styles.totauxFinalRow}>
                <Text style={styles.totauxFinalLabel}>Total TTC</Text>
                <Text style={styles.totauxFinalVal}>{fmt(devis.montant_ttc)}</Text>
              </View>
            </View>
          </View>

          {/* Notes & Conditions */}
          {(devis.notes || devis.conditions) && (
            <View style={styles.sep} />
          )}
          {devis.notes && (
            <View style={styles.notesSection}>
              <Text style={styles.notesLabel}>Notes</Text>
              <Text style={styles.notesText}>{devis.notes}</Text>
            </View>
          )}
          {devis.conditions && (
            <View style={styles.notesSection}>
              <Text style={styles.notesLabel}>Conditions</Text>
              <Text style={styles.notesText}>{devis.conditions}</Text>
            </View>
          )}
        </View>

        {/* Pied de page */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            {emetteur?.company_name || emetteur?.full_name || ''} — {devis.numero}
          </Text>
          <Text style={styles.footerBrand}>Deviso</Text>
        </View>
      </Page>
    </Document>
  )
}
