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
      analytics_events: {
        Row: {
          created_at: string
          event_name: string
          event_properties: Json | null
          id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_name: string
          event_properties?: Json | null
          id?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_name?: string
          event_properties?: Json | null
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      audit_log_access_log: {
        Row: {
          access_type: string
          accessed_at: string | null
          admin_user_id: string
          filters_applied: Json | null
          id: string
          ip_address: unknown
          record_count: number | null
        }
        Insert: {
          access_type: string
          accessed_at?: string | null
          admin_user_id: string
          filters_applied?: Json | null
          id?: string
          ip_address?: unknown
          record_count?: number | null
        }
        Update: {
          access_type?: string
          accessed_at?: string | null
          admin_user_id?: string
          filters_applied?: Json | null
          id?: string
          ip_address?: unknown
          record_count?: number | null
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          id: string
          ip_address: unknown
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
          ip_address?: unknown
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
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      beta_signup_rate_limit: {
        Row: {
          email_hash: string
          first_attempt: string | null
          id: string
          last_attempt: string | null
          signup_count: number | null
        }
        Insert: {
          email_hash: string
          first_attempt?: string | null
          id?: string
          last_attempt?: string | null
          signup_count?: number | null
        }
        Update: {
          email_hash?: string
          first_attempt?: string | null
          id?: string
          last_attempt?: string | null
          signup_count?: number | null
        }
        Relationships: []
      }
      beta_waitlist: {
        Row: {
          created_at: string
          email: string
          id: string
          interested_features: string[] | null
          invite_sent_at: string | null
          name: string | null
          notes: string | null
          referral_source: string | null
          signup_date: string
          status: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          interested_features?: string[] | null
          invite_sent_at?: string | null
          name?: string | null
          notes?: string | null
          referral_source?: string | null
          signup_date?: string
          status?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          interested_features?: string[] | null
          invite_sent_at?: string | null
          name?: string | null
          notes?: string | null
          referral_source?: string | null
          signup_date?: string
          status?: string
        }
        Relationships: []
      }
      device_access_audit: {
        Row: {
          access_time: string
          access_type: string
          device_id: string | null
          id: string
          ip_hash: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          access_time?: string
          access_type: string
          device_id?: string | null
          id?: string
          ip_hash: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          access_time?: string
          access_type?: string
          device_id?: string | null
          id?: string
          ip_hash?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "device_access_audit_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "devices"
            referencedColumns: ["id"]
          },
        ]
      }
      devices: {
        Row: {
          created_at: string
          device_name: string
          device_type: string
          id: string
          ip_address: unknown
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
          ip_address?: unknown
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
          ip_address?: unknown
          is_active?: boolean | null
          last_seen?: string | null
          operating_system?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      error_logs: {
        Row: {
          context: Json | null
          created_at: string
          error_message: string
          error_stack: string | null
          error_type: string
          id: string
          url: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          context?: Json | null
          created_at?: string
          error_message: string
          error_stack?: string | null
          error_type: string
          id?: string
          url?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          context?: Json | null
          created_at?: string
          error_message?: string
          error_stack?: string | null
          error_type?: string
          id?: string
          url?: string | null
          user_agent?: string | null
          user_id?: string | null
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
      governance_settings: {
        Row: {
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string | null
        }
        Insert: {
          id?: string
          setting_key: string
          setting_value: Json
          updated_at?: string | null
        }
        Update: {
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string | null
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
          wallet_address: string | null
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
          wallet_address?: string | null
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
          wallet_address?: string | null
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
      security_alerts: {
        Row: {
          alert_type: string
          created_at: string | null
          details: Json | null
          id: string
          ip_address: unknown
          severity: string
          user_id: string | null
        }
        Insert: {
          alert_type: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown
          severity: string
          user_id?: string | null
        }
        Update: {
          alert_type?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown
          severity?: string
          user_id?: string | null
        }
        Relationships: []
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
      security_features: {
        Row: {
          created_at: string | null
          enforcement_method: string
          feature_name: string
          id: string
          implementation_details: string
          last_verified_at: string | null
          status: string
        }
        Insert: {
          created_at?: string | null
          enforcement_method: string
          feature_name: string
          id?: string
          implementation_details: string
          last_verified_at?: string | null
          status?: string
        }
        Update: {
          created_at?: string | null
          enforcement_method?: string
          feature_name?: string
          id?: string
          implementation_details?: string
          last_verified_at?: string | null
          status?: string
        }
        Relationships: []
      }
      stripe_webhook_log: {
        Row: {
          error_message: string | null
          event_id: string
          event_type: string
          id: string
          ip_address: unknown
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
          ip_address?: unknown
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
          ip_address?: unknown
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
      webhook_logs: {
        Row: {
          created_at: string
          data: Json
          error_message: string | null
          event_type: string
          id: string
          status: string
          user_id: string | null
          wallet_address: string
        }
        Insert: {
          created_at?: string
          data: Json
          error_message?: string | null
          event_type: string
          id?: string
          status: string
          user_id?: string | null
          wallet_address: string
        }
        Update: {
          created_at?: string
          data?: Json
          error_message?: string | null
          event_type?: string
          id?: string
          status?: string
          user_id?: string | null
          wallet_address?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      anonymize_old_vpn_sessions: { Args: never; Returns: undefined }
      cancel_own_subscription: { Args: never; Returns: undefined }
      check_security_active: { Args: never; Returns: boolean }
      cleanup_device_access_audit: { Args: never; Returns: undefined }
      cleanup_old_analytics_events: { Args: never; Returns: undefined }
      cleanup_old_audit_logs: { Args: never; Returns: undefined }
      cleanup_old_device_data: { Args: never; Returns: undefined }
      cleanup_old_device_ips: { Args: never; Returns: undefined }
      cleanup_old_error_logs: { Args: never; Returns: undefined }
      cleanup_old_vpn_sessions: { Args: never; Returns: undefined }
      cleanup_old_webhook_logs: { Args: never; Returns: undefined }
      cleanup_vpn_session_ips: { Args: never; Returns: undefined }
      get_anonymized_proposer: {
        Args: { proposal_proposer: string }
        Returns: string
      }
      get_audit_logs_safe: {
        Args: { limit_count?: number; offset_count?: number }
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
      get_audit_logs_sanitized: {
        Args: never
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
      get_beta_waitlist_safe: {
        Args: { limit_count?: number; offset_count?: number }
        Returns: {
          created_at: string
          email: string
          id: string
          interested_features: string[]
          invite_sent_at: string
          name: string
          notes: string
          referral_source: string
          signup_date: string
          status: string
        }[]
      }
      get_device_ip_admin: { Args: { device_id: string }; Returns: string }
      get_governance_proposals_anonymized: {
        Args: never
        Returns: {
          created_at: string
          description: string
          end_time: string
          execution_data: string
          id: string
          is_own_proposal: boolean
          proposal_type: string
          proposer_id: string
          quorum: number
          status: string
          title: string
          votes_abstain: number
          votes_against: number
          votes_for: number
        }[]
      }
      get_proposal_votes_safe: {
        Args: { p_proposal_id?: string }
        Returns: {
          created_at: string
          id: string
          proposal_id: string
          support: string
          voter: string
          voting_power: number
        }[]
      }
      get_sanitized_device_info: {
        Args: { device_id: string }
        Returns: {
          device_name: string
          device_type: string
          id: string
          ip_redacted: string
          is_active: boolean
          last_seen: string
          operating_system: string
        }[]
      }
      get_scheduled_security_jobs: {
        Args: never
        Returns: {
          active: boolean
          command: string
          database: string
          jobid: number
          jobname: string
          nodename: string
          nodeport: number
          schedule: string
          username: string
        }[]
      }
      get_security_status: {
        Args: never
        Returns: {
          enforcement_method: string
          implementation: string
          security_feature: string
          status: string
        }[]
      }
      get_subscription_monitoring: {
        Args: { limit_count?: number; offset_count?: number }
        Returns: {
          created_at: string
          id: string
          is_trial: boolean
          stripe_customer_id: string
          subscribed: boolean
          subscription_end: string
          subscription_tier: string
          trial_end: string
          updated_at: string
          user_id: string
        }[]
      }
      get_user_devices_safe: {
        Args: never
        Returns: {
          created_at: string
          device_name: string
          device_type: string
          id: string
          is_active: boolean
          last_seen: string
          operating_system: string
        }[]
      }
      get_user_subscription_admin: {
        Args: { target_user_id: string }
        Returns: {
          created_at: string
          id: string
          is_trial: boolean
          stripe_customer_id: string
          subscribed: boolean
          subscription_end: string
          subscription_tier: string
          trial_end: string
          updated_at: string
          user_id: string
        }[]
      }
      get_user_subscription_safe: {
        Args: never
        Returns: {
          is_trial: boolean
          subscribed: boolean
          subscription_end: string
          subscription_tier: string
          trial_end: string
        }[]
      }
      get_users_admin_safe: {
        Args: { limit_count?: number; offset_count?: number }
        Returns: {
          created_at: string
          display_name: string
          subscription_tier: string
          totp_enabled: boolean
          user_id: string
          xx_coin_balance: number
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
      is_super_admin: { Args: { _user_id: string }; Returns: boolean }
      run_security_checks: {
        Args: never
        Returns: {
          check_name: string
          message: string
          status: string
        }[]
      }
      safe_log_operation: {
        Args: { p_data?: Json; p_operation: string; p_table_name: string }
        Returns: undefined
      }
      sanitize_sensitive_data: { Args: { data: Json }; Returns: Json }
      validate_beta_signup: { Args: { p_email: string }; Returns: boolean }
      validate_device_ip_protection: { Args: never; Returns: boolean }
      validate_email_format: { Args: { email: string }; Returns: boolean }
      validate_subscribers_rls: { Args: never; Returns: boolean }
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
