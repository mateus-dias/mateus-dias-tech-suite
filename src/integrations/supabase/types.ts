export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      contract_payments: {
        Row: {
          amount: number | null
          contract_id: string
          created_at: string
          description: string | null
          id: string
          payment_link: string | null
          pix_key: string | null
          qr_code_url: string | null
          type: string
        }
        Insert: {
          amount?: number | null
          contract_id: string
          created_at?: string
          description?: string | null
          id?: string
          payment_link?: string | null
          pix_key?: string | null
          qr_code_url?: string | null
          type?: string
        }
        Update: {
          amount?: number | null
          contract_id?: string
          created_at?: string
          description?: string | null
          id?: string
          payment_link?: string | null
          pix_key?: string | null
          qr_code_url?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "contract_payments_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
        ]
      }
      contract_signatures: {
        Row: {
          contract_id: string
          created_at: string
          id: string
          ip_address: string | null
          signature_image: string
          signer_name: string | null
          signer_type: string | null
        }
        Insert: {
          contract_id: string
          created_at?: string
          id?: string
          ip_address?: string | null
          signature_image: string
          signer_name?: string | null
          signer_type?: string | null
        }
        Update: {
          contract_id?: string
          created_at?: string
          id?: string
          ip_address?: string | null
          signature_image?: string
          signer_name?: string | null
          signer_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contract_signatures_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
        ]
      }
      contracts: {
        Row: {
          admin_signature_data: string | null
          admin_signature_date: string | null
          client_address: string | null
          client_document: string | null
          client_name: string | null
          client_signature_data: string | null
          client_signature_date: string | null
          client_signature_ip: string | null
          created_at: string
          deadline: string | null
          id: string
          lead_id: string
          mercadopago_link: string | null
          payment_terms: string | null
          pix_key: string | null
          pix_qr_code_url: string | null
          pix_value: number | null
          proposal_id: string | null
          public_token: string | null
          scope: string | null
          status: Database["public"]["Enums"]["contract_status"] | null
          title: string
          updated_at: string
          user_id: string
          value: number | null
        }
        Insert: {
          admin_signature_data?: string | null
          admin_signature_date?: string | null
          client_address?: string | null
          client_document?: string | null
          client_name?: string | null
          client_signature_data?: string | null
          client_signature_date?: string | null
          client_signature_ip?: string | null
          created_at?: string
          deadline?: string | null
          id?: string
          lead_id: string
          mercadopago_link?: string | null
          payment_terms?: string | null
          pix_key?: string | null
          pix_qr_code_url?: string | null
          pix_value?: number | null
          proposal_id?: string | null
          public_token?: string | null
          scope?: string | null
          status?: Database["public"]["Enums"]["contract_status"] | null
          title: string
          updated_at?: string
          user_id: string
          value?: number | null
        }
        Update: {
          admin_signature_data?: string | null
          admin_signature_date?: string | null
          client_address?: string | null
          client_document?: string | null
          client_name?: string | null
          client_signature_data?: string | null
          client_signature_date?: string | null
          client_signature_ip?: string | null
          created_at?: string
          deadline?: string | null
          id?: string
          lead_id?: string
          mercadopago_link?: string | null
          payment_terms?: string | null
          pix_key?: string | null
          pix_qr_code_url?: string | null
          pix_value?: number | null
          proposal_id?: string | null
          public_token?: string | null
          scope?: string | null
          status?: Database["public"]["Enums"]["contract_status"] | null
          title?: string
          updated_at?: string
          user_id?: string
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "contracts_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      files: {
        Row: {
          contract_id: string | null
          created_at: string
          id: string
          lead_id: string | null
          name: string
          proposal_id: string | null
          size: number | null
          type: string | null
          url: string
          user_id: string
        }
        Insert: {
          contract_id?: string | null
          created_at?: string
          id?: string
          lead_id?: string | null
          name: string
          proposal_id?: string | null
          size?: number | null
          type?: string | null
          url: string
          user_id: string
        }
        Update: {
          contract_id?: string | null
          created_at?: string
          id?: string
          lead_id?: string | null
          name?: string
          proposal_id?: string | null
          size?: number | null
          type?: string | null
          url?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "files_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "files_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "files_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      interactions: {
        Row: {
          created_at: string
          description: string | null
          id: string
          lead_id: string
          title: string
          type: Database["public"]["Enums"]["interaction_type"]
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          lead_id: string
          title: string
          type: Database["public"]["Enums"]["interaction_type"]
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          lead_id?: string
          title?: string
          type?: Database["public"]["Enums"]["interaction_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "interactions_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          best_contact_time: string | null
          company: string | null
          created_at: string
          email: string | null
          estimated_value: number | null
          id: string
          last_contact_at: string | null
          lovable_account: string | null
          name: string
          next_followup_at: string | null
          notes: string | null
          origin: string | null
          phone: string | null
          priority: Database["public"]["Enums"]["lead_priority"] | null
          segment: string | null
          status: Database["public"]["Enums"]["lead_status"] | null
          temperature: Database["public"]["Enums"]["lead_temperature"] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          best_contact_time?: string | null
          company?: string | null
          created_at?: string
          email?: string | null
          estimated_value?: number | null
          id?: string
          last_contact_at?: string | null
          lovable_account?: string | null
          name: string
          next_followup_at?: string | null
          notes?: string | null
          origin?: string | null
          phone?: string | null
          priority?: Database["public"]["Enums"]["lead_priority"] | null
          segment?: string | null
          status?: Database["public"]["Enums"]["lead_status"] | null
          temperature?: Database["public"]["Enums"]["lead_temperature"] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          best_contact_time?: string | null
          company?: string | null
          created_at?: string
          email?: string | null
          estimated_value?: number | null
          id?: string
          last_contact_at?: string | null
          lovable_account?: string | null
          name?: string
          next_followup_at?: string | null
          notes?: string | null
          origin?: string | null
          phone?: string | null
          priority?: Database["public"]["Enums"]["lead_priority"] | null
          segment?: string | null
          status?: Database["public"]["Enums"]["lead_status"] | null
          temperature?: Database["public"]["Enums"]["lead_temperature"] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          contract_id: string | null
          created_at: string
          description: string | null
          id: string
          lead_id: string
          mercadopago_link: string | null
          method: Database["public"]["Enums"]["payment_method"] | null
          paid_at: string | null
          pix_key: string | null
          pix_qr_code_url: string | null
          status: Database["public"]["Enums"]["payment_status"] | null
          updated_at: string
          user_id: string
          value: number
        }
        Insert: {
          contract_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          lead_id: string
          mercadopago_link?: string | null
          method?: Database["public"]["Enums"]["payment_method"] | null
          paid_at?: string | null
          pix_key?: string | null
          pix_qr_code_url?: string | null
          status?: Database["public"]["Enums"]["payment_status"] | null
          updated_at?: string
          user_id: string
          value: number
        }
        Update: {
          contract_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          lead_id?: string
          mercadopago_link?: string | null
          method?: Database["public"]["Enums"]["payment_method"] | null
          paid_at?: string | null
          pix_key?: string | null
          pix_qr_code_url?: string | null
          status?: Database["public"]["Enums"]["payment_status"] | null
          updated_at?: string
          user_id?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "payments_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      project_tasks: {
        Row: {
          completed: boolean | null
          created_at: string
          id: string
          project_id: string
          sort_order: number | null
          title: string
        }
        Insert: {
          completed?: boolean | null
          created_at?: string
          id?: string
          project_id: string
          sort_order?: number | null
          title: string
        }
        Update: {
          completed?: boolean | null
          created_at?: string
          id?: string
          project_id?: string
          sort_order?: number | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          contract_id: string | null
          created_at: string
          deadline: string | null
          description: string | null
          id: string
          lead_id: string
          scope: string | null
          status: Database["public"]["Enums"]["project_status"] | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          contract_id?: string | null
          created_at?: string
          deadline?: string | null
          description?: string | null
          id?: string
          lead_id: string
          scope?: string | null
          status?: Database["public"]["Enums"]["project_status"] | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          contract_id?: string | null
          created_at?: string
          deadline?: string | null
          description?: string | null
          id?: string
          lead_id?: string
          scope?: string | null
          status?: Database["public"]["Enums"]["project_status"] | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      proposal_adjustments: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          message: string
          proposal_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          message: string
          proposal_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          message?: string
          proposal_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "proposal_adjustments_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      proposal_items: {
        Row: {
          created_at: string
          description: string
          id: string
          proposal_id: string
          quantity: number | null
          sort_order: number | null
          unit_price: number | null
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          proposal_id: string
          quantity?: number | null
          sort_order?: number | null
          unit_price?: number | null
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          proposal_id?: string
          quantity?: number | null
          sort_order?: number | null
          unit_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "proposal_items_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      proposal_payments: {
        Row: {
          amount: number | null
          created_at: string
          description: string | null
          id: string
          payment_link: string | null
          pix_key: string | null
          proposal_id: string
          qr_code_url: string | null
          type: string
        }
        Insert: {
          amount?: number | null
          created_at?: string
          description?: string | null
          id?: string
          payment_link?: string | null
          pix_key?: string | null
          proposal_id: string
          qr_code_url?: string | null
          type?: string
        }
        Update: {
          amount?: number | null
          created_at?: string
          description?: string | null
          id?: string
          payment_link?: string | null
          pix_key?: string | null
          proposal_id?: string
          qr_code_url?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "proposal_payments_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      proposals: {
        Row: {
          client_comments: string | null
          created_at: string
          deadline: string | null
          description: string | null
          functional_scope: string | null
          guarantee: string | null
          hosting: string | null
          id: string
          lead_id: string
          objectives: string | null
          payment_terms: string | null
          project_overview: string | null
          public_token: string | null
          scope_excluded: string[] | null
          scope_included: string[] | null
          status: Database["public"]["Enums"]["proposal_status"] | null
          technologies: string | null
          title: string
          updated_at: string
          user_id: string
          validity_days: number | null
          value: number | null
        }
        Insert: {
          client_comments?: string | null
          created_at?: string
          deadline?: string | null
          description?: string | null
          functional_scope?: string | null
          guarantee?: string | null
          hosting?: string | null
          id?: string
          lead_id: string
          objectives?: string | null
          payment_terms?: string | null
          project_overview?: string | null
          public_token?: string | null
          scope_excluded?: string[] | null
          scope_included?: string[] | null
          status?: Database["public"]["Enums"]["proposal_status"] | null
          technologies?: string | null
          title: string
          updated_at?: string
          user_id: string
          validity_days?: number | null
          value?: number | null
        }
        Update: {
          client_comments?: string | null
          created_at?: string
          deadline?: string | null
          description?: string | null
          functional_scope?: string | null
          guarantee?: string | null
          hosting?: string | null
          id?: string
          lead_id?: string
          objectives?: string | null
          payment_terms?: string | null
          project_overview?: string | null
          public_token?: string | null
          scope_excluded?: string[] | null
          scope_included?: string[] | null
          status?: Database["public"]["Enums"]["proposal_status"] | null
          technologies?: string | null
          title?: string
          updated_at?: string
          user_id?: string
          validity_days?: number | null
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "proposals_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      public_links: {
        Row: {
          contract_id: string | null
          created_at: string
          expires_at: string | null
          id: string
          lead_id: string | null
          proposal_id: string | null
          token: string
          user_id: string
        }
        Insert: {
          contract_id?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          lead_id?: string | null
          proposal_id?: string | null
          token?: string
          user_id: string
        }
        Update: {
          contract_id?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          lead_id?: string | null
          proposal_id?: string | null
          token?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "public_links_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_links_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_links_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      site_settings: {
        Row: {
          created_at: string
          id: string
          key: string
          updated_at: string
          user_id: string
          value: Json | null
        }
        Insert: {
          created_at?: string
          id?: string
          key: string
          updated_at?: string
          user_id: string
          value?: Json | null
        }
        Update: {
          created_at?: string
          id?: string
          key?: string
          updated_at?: string
          user_id?: string
          value?: Json | null
        }
        Relationships: []
      }
      site_visits: {
        Row: {
          created_at: string
          id: string
          ip_address: string | null
          page: string | null
          referrer: string | null
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          ip_address?: string | null
          page?: string | null
          referrer?: string | null
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          ip_address?: string | null
          page?: string | null
          referrer?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      contract_status:
        | "rascunho"
        | "enviado"
        | "assinado_cliente"
        | "assinado_ambos"
        | "cancelado"
      interaction_type:
        | "mensagem"
        | "reuniao"
        | "mvp_enviado"
        | "proposta_enviada"
        | "follow_up"
        | "contrato_enviado"
        | "pagamento_recebido"
        | "ligacao"
        | "email"
        | "outro"
      lead_priority: "baixa" | "media" | "alta" | "urgente"
      lead_status:
        | "novo"
        | "contato_iniciado"
        | "alinhamento"
        | "mvp_enviado"
        | "proposta_enviada"
        | "negociacao"
        | "contrato_enviado"
        | "assinado"
        | "projeto_andamento"
        | "finalizado"
        | "perdido"
      lead_temperature: "frio" | "morno" | "quente"
      payment_method: "pix" | "cartao" | "boleto" | "transferencia"
      payment_status: "pendente" | "parcial" | "pago" | "cancelado"
      project_status:
        | "planejamento"
        | "em_andamento"
        | "pausado"
        | "concluido"
        | "cancelado"
      proposal_status:
        | "rascunho"
        | "enviada"
        | "aprovada"
        | "ajustes"
        | "recusada"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
      contract_status: [
        "rascunho",
        "enviado",
        "assinado_cliente",
        "assinado_ambos",
        "cancelado",
      ],
      interaction_type: [
        "mensagem",
        "reuniao",
        "mvp_enviado",
        "proposta_enviada",
        "follow_up",
        "contrato_enviado",
        "pagamento_recebido",
        "ligacao",
        "email",
        "outro",
      ],
      lead_priority: ["baixa", "media", "alta", "urgente"],
      lead_status: [
        "novo",
        "contato_iniciado",
        "alinhamento",
        "mvp_enviado",
        "proposta_enviada",
        "negociacao",
        "contrato_enviado",
        "assinado",
        "projeto_andamento",
        "finalizado",
        "perdido",
      ],
      lead_temperature: ["frio", "morno", "quente"],
      payment_method: ["pix", "cartao", "boleto", "transferencia"],
      payment_status: ["pendente", "parcial", "pago", "cancelado"],
      project_status: [
        "planejamento",
        "em_andamento",
        "pausado",
        "concluido",
        "cancelado",
      ],
      proposal_status: [
        "rascunho",
        "enviada",
        "aprovada",
        "ajustes",
        "recusada",
      ],
    },
  },
} as const
