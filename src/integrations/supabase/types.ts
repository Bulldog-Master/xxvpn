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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      audit_log_access_log: {
        Row: {
          access_type: string
          accessed_at: string | null
          admin_user_id: string
          filters_applied: Json | null
          id: string
          ip_address: unknown | null
          record_count: number | null
        }
        Insert: {
          access_type: string
          accessed_at?: string | null
          admin_user_id: string
          filters_applied?: Json | null
          id?: string
          ip_address?: unknown | null
          record_count?: number | null
        }
        Update: {
          access_type?: string
          accessed_at?: string | null
          admin_user_id?: string
          filters_applied?: Json | null
          id?: string
          ip_address?: unknown | null
          record_count?: number | null
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          id: string
          ip_address: unknown | null
          new_values: Json | null
          old_values: Json | null
          record_id: string | null
          table_name: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      devices: {
        Row: {
          created_at: string
          device_name: string
          device_type: string
          id: string
          ip_address: unknown | null
          is_active: boolean | null
          last_seen: string | null
          operating_system: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          device_name: string
          device_type: string
          id?: string
          ip_address?: unknown | null
          is_active?: boolean | null
          last_seen?: string | null
          operating_system?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          device_name?: string
          device_type?: string
          id?: string
          ip_address?: unknown | null
          is_active?: boolean | null
          last_seen?: string | null
          operating_system?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      governance_proposals: {
        Row: {
          created_at: string | null
          description: string
          end_time: string
          execution_data: string | null
          id: string
          proposal_type: string
          proposer: string
          quorum: number
          status: string
          title: string
          votes_abstain: number | null
          votes_against: number | null
          votes_for: number | null
        }
        Insert: {
          created_at?: string | null
          description: string
          end_time: string
          execution_data?: string | null
          id?: string
          proposal_type: string
          proposer: string
          quorum: number
          status?: string
          title: string
          votes_abstain?: number | null
          votes_against?: number | null
          votes_for?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string
          end_time?: string
          execution_data?: string | null
          id?: string
          proposal_type?: string
          proposer?: string
          quorum?: number
          status?: string
          title?: string
          votes_abstain?: number | null
          votes_against?: number | null
          votes_for?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          referrals: number
          subscription_tier: string
          totp_enabled: boolean | null
          updated_at: string
          user_id: string
          xx_coin_balance: number
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          referrals?: number
          subscription_tier?: string
          totp_enabled?: boolean | null
          updated_at?: string
          user_id: string
          xx_coin_balance?: number
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          referrals?: number
          subscription_tier?: string
          totp_enabled?: boolean | null
          updated_at?: string
          user_id?: string
          xx_coin_balance?: number
        }
        Relationships: []
      }
      proposal_votes: {
        Row: {
          created_at: string | null
          id: string
          proposal_id: string
          support: string
          voter: string
          voting_power: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          proposal_id: string
          support: string
          voter: string
          voting_power: number
        }
        Update: {
          created_at?: string | null
          id?: string
          proposal_id?: string
          support?: string
          voter?: string
          voting_power?: number
        }
        Relationships: [
          {
            foreignKeyName: "proposal_votes_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "governance_proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      security_config: {
        Row: {
          config_key: string
          config_value: Json
          id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          config_key: string
          config_value: Json
          id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          config_key?: string
          config_value?: Json
          id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      stripe_webhook_log: {
        Row: {
          error_message: string | null
          event_id: string
          event_type: string
          id: string
          ip_address: unknown | null
          processed_at: string | null
          processing_status: string
          received_at: string | null
          signature_verified: boolean
        }
        Insert: {
          error_message?: string | null
          event_id: string
          event_type: string
          id?: string
          ip_address?: unknown | null
          processed_at?: string | null
          processing_status: string
          received_at?: string | null
          signature_verified: boolean
        }
        Update: {
          error_message?: string | null
          event_id?: string
          event_type?: string
          id?: string
          ip_address?: unknown | null
          processed_at?: string | null
          processing_status?: string
          received_at?: string | null
          signature_verified?: boolean
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          created_at: string
          id: string
          is_trial: boolean
          stripe_customer_id: string | null
          subscribed: boolean
          subscription_end: string | null
          subscription_tier: string | null
          trial_end: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_trial?: boolean
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          trial_end?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_trial?: boolean
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          trial_end?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_security_secrets: {
        Row: {
          created_at: string | null
          encrypted_totp_secret: string | null
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          encrypted_totp_secret?: string | null
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          encrypted_totp_secret?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          created_at: string | null
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          setting_key: string
          setting_value: Json
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      vpn_sessions: {
        Row: {
          bytes_received: number | null
          bytes_sent: number | null
          connected_at: string
          connection_quality: string | null
          created_at: string
          device_id: string | null
          device_name: string
          disconnect_reason: string | null
          disconnected_at: string | null
          duration_seconds: number | null
          id: string
          server_location: string
          server_name: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          bytes_received?: number | null
          bytes_sent?: number | null
          connected_at?: string
          connection_quality?: string | null
          created_at?: string
          device_id?: string | null
          device_name: string
          disconnect_reason?: string | null
          disconnected_at?: string | null
          duration_seconds?: number | null
          id?: string
          server_location: string
          server_name: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          bytes_received?: number | null
          bytes_sent?: number | null
          connected_at?: string
          connection_quality?: string | null
          created_at?: string
          device_id?: string | null
          device_name?: string
          disconnect_reason?: string | null
          disconnected_at?: string | null
          duration_seconds?: number | null
          id?: string
          server_location?: string
          server_name?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vpn_sessions_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "devices"
            referencedColumns: ["id"]
          },
        ]
      }
      webauthn_credentials: {
        Row: {
          counter: number
          created_at: string
          credential_id: string
          device_name: string | null
          id: string
          last_used_at: string | null
          public_key: string
          user_id: string
        }
        Insert: {
          counter?: number
          created_at?: string
          credential_id: string
          device_name?: string | null
          id?: string
          last_used_at?: string | null
          public_key: string
          user_id: string
        }
        Update: {
          counter?: number
          created_at?: string
          credential_id?: string
          device_name?: string | null
          id?: string
          last_used_at?: string | null
          public_key?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_old_audit_logs: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_old_device_ips: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_old_vpn_sessions: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_old_webhook_logs: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_vpn_session_ips: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_audit_logs_sanitized: {
        Args: Record<PropertyKey, never>
        Returns: {
          action: string
          created_at: string
          id: string
          ip_address: string
          new_values: Json
          old_values: Json
          record_id: string
          table_name: string
          user_agent: string
          user_id: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_vote_count: {
        Args: { p_amount: number; p_field: string; p_proposal_id: string }
        Returns: undefined
      }
      is_super_admin: {
        Args: { _user_id: string }
        Returns: boolean
      }
      sanitize_sensitive_data: {
        Args: { data: Json }
        Returns: Json
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user" | "super_admin"
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
      app_role: ["admin", "moderator", "user", "super_admin"],
    },
  },
} as const
