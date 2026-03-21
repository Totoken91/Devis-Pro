// Types générés automatiquement par Supabase CLI
// Commande : npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/supabase.ts

export type Database = {
  public: {
    Tables: {
      visitors: {
        Row: {
          visitor_id: string
          first_seen: string
          last_seen: string
        }
        Insert: {
          visitor_id: string
          first_seen?: string
          last_seen?: string
        }
        Update: {
          visitor_id?: string
          first_seen?: string
          last_seen?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          full_name: string | null
          company_name: string | null
          email: string
          phone: string | null
          address: string | null
          siret: string | null
          logo_url: string | null
          brand_color: string | null
          plan: 'free' | 'pro'
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          is_admin: boolean
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          company_name?: string | null
          phone?: string | null
          address?: string | null
          siret?: string | null
          logo_url?: string | null
          brand_color?: string | null
          plan?: 'free' | 'pro'
        }
        Update: {
          full_name?: string | null
          company_name?: string | null
          phone?: string | null
          address?: string | null
          siret?: string | null
          logo_url?: string | null
          brand_color?: string | null
          plan?: 'free' | 'pro'
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      clients: {
        Row: {
          id: string
          created_at: string
          user_id: string
          name: string
          email: string | null
          phone: string | null
          company: string | null
          address: string | null
        }
        Insert: {
          user_id: string
          name: string
          email?: string | null
          phone?: string | null
          company?: string | null
          address?: string | null
        }
        Update: {
          name?: string
          email?: string | null
          phone?: string | null
          company?: string | null
          address?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          id: string
          created_at: string
          user_id: string
          devis_id: string | null
          event: 'ouvert' | 'accepte' | 'refuse'
          devis_numero: string
          client_name: string
          is_read: boolean
        }
        Insert: {
          user_id: string
          devis_id?: string | null
          event: 'ouvert' | 'accepte' | 'refuse'
          devis_numero: string
          client_name: string
          is_read?: boolean
        }
        Update: {
          is_read?: boolean
        }
        Relationships: []
      }
      devis: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          user_id: string
          client_id: string | null
          numero: string
          titre: string
          statut: 'brouillon' | 'envoye' | 'ouvert' | 'accepte' | 'refuse' | 'expire'
          lignes: DevisLigne[]
          tva_taux: number
          montant_ht: number
          montant_tva: number
          montant_ttc: number
          notes: string | null
          conditions: string | null
          date_validite: string | null
          token_public: string
          template: 'classique' | 'moderne' | 'minimaliste'
          ouvert_le: string | null
          signe_le: string | null
          relance_active: boolean
          derniere_relance: string | null
        }
        Insert: {
          user_id: string
          client_id?: string | null
          numero: string
          titre: string
          statut?: 'brouillon' | 'envoye' | 'ouvert' | 'accepte' | 'refuse' | 'expire'
          lignes?: DevisLigne[]
          tva_taux?: number
          montant_ht?: number
          montant_tva?: number
          montant_ttc?: number
          notes?: string | null
          conditions?: string | null
          date_validite?: string | null
          token_public: string
          template?: 'classique' | 'moderne' | 'minimaliste'
          relance_active?: boolean
        }
        Update: {
          client_id?: string | null
          titre?: string
          statut?: 'brouillon' | 'envoye' | 'ouvert' | 'accepte' | 'refuse' | 'expire'
          lignes?: DevisLigne[]
          tva_taux?: number
          montant_ht?: number
          montant_tva?: number
          montant_ttc?: number
          notes?: string | null
          conditions?: string | null
          date_validite?: string | null
          template?: 'classique' | 'moderne' | 'minimaliste'
          ouvert_le?: string | null
          signe_le?: string | null
          relance_active?: boolean
          derniere_relance?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      devis_modeles: {
        Row: {
          id: string
          created_at: string
          user_id: string
          name: string
          lignes: DevisLigne[]
          tva_taux: number
          notes: string | null
          conditions: string | null
          template: 'classique' | 'moderne' | 'minimaliste'
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          name: string
          lignes?: DevisLigne[]
          tva_taux?: number
          notes?: string | null
          conditions?: string | null
          template?: 'classique' | 'moderne' | 'minimaliste'
        }
        Update: {
          name?: string
          lignes?: DevisLigne[]
          tva_taux?: number
          notes?: string | null
          conditions?: string | null
          template?: 'classique' | 'moderne' | 'minimaliste'
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
    PostgrestVersion: "12"
  }
}

export type DevisLigne = {
  id: string
  description: string
  quantite: number
  prix_unitaire: number
  total: number
}

// Types utilitaires
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Client = Database['public']['Tables']['clients']['Row']
export type Devis = Database['public']['Tables']['devis']['Row']
export type DevisStatut = Devis['statut']
export type DevisTemplate = Devis['template']
export type Plan = Profile['plan']
export type Notification = Database['public']['Tables']['notifications']['Row']
export type DevisModele = Database['public']['Tables']['devis_modeles']['Row']
