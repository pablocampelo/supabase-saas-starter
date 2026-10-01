export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  "graphql_public": {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      "graphql": {
        Args: { "extensions"?: Json; "operationName"?: string; "query"?: string; "variables"?: Json }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  "public": {
    Tables: {
      "billing_checkout_attempts": {
        Row: {
          "billing_interval": string
          "completed_at": string | null
          "created_at": string
          "id": string
          "status": string
          "stripe_checkout_session_id": string | null
          "stripe_customer_id": string | null
          "stripe_price_id": string
          "stripe_subscription_id": string | null
          "updated_at": string
          "user_id": string
        }
        Insert: {
          "billing_interval": string
          "completed_at"?: string | null
          "created_at"?: string
          "id"?: string
          "status"?: string
          "stripe_checkout_session_id"?: string | null
          "stripe_customer_id"?: string | null
          "stripe_price_id": string
          "stripe_subscription_id"?: string | null
          "updated_at"?: string
          "user_id": string
        }
        Update: {
          "billing_interval"?: string
          "completed_at"?: string | null
          "created_at"?: string
          "id"?: string
          "status"?: string
          "stripe_checkout_session_id"?: string | null
          "stripe_customer_id"?: string | null
          "stripe_price_id"?: string
          "stripe_subscription_id"?: string | null
          "updated_at"?: string
          "user_id"?: string
        }
        Relationships: []
      }
      "billing_event_receipts": {
        Row: {
          "failure_code": string | null
          "processed_at": string | null
          "received_at": string
          "status": string
          "stripe_created_at": string
          "stripe_event_id": string
          "stripe_event_type": string
        }
        Insert: {
          "failure_code"?: string | null
          "processed_at"?: string | null
          "received_at"?: string
          "status"?: string
          "stripe_created_at": string
          "stripe_event_id": string
          "stripe_event_type": string
        }
        Update: {
          "failure_code"?: string | null
          "processed_at"?: string | null
          "received_at"?: string
          "status"?: string
          "stripe_created_at"?: string
          "stripe_event_id"?: string
          "stripe_event_type"?: string
        }
        Relationships: []
      }
      "billing_projection": {
        Row: {
          "billing_interval": string | null
          "created_at": string
          "last_paid_invoice_id": string | null
          "last_paid_period_end": string | null
          "last_paid_period_start": string | null
          "last_stripe_event_created_at": string | null
          "last_stripe_event_id": string | null
          "paid_through": string | null
          "projection_version": number
          "stripe_customer_id": string | null
          "stripe_price_id": string | null
          "stripe_subscription_id": string | null
          "subscription_status": string | null
          "synced_at": string
          "updated_at": string
          "user_id": string
        }
        Insert: {
          "billing_interval"?: string | null
          "created_at"?: string
          "last_paid_invoice_id"?: string | null
          "last_paid_period_end"?: string | null
          "last_paid_period_start"?: string | null
          "last_stripe_event_created_at"?: string | null
          "last_stripe_event_id"?: string | null
          "paid_through"?: string | null
          "projection_version"?: number
          "stripe_customer_id"?: string | null
          "stripe_price_id"?: string | null
          "stripe_subscription_id"?: string | null
          "subscription_status"?: string | null
          "synced_at"?: string
          "updated_at"?: string
          "user_id": string
        }
        Update: {
          "billing_interval"?: string | null
          "created_at"?: string
          "last_paid_invoice_id"?: string | null
          "last_paid_period_end"?: string | null
          "last_paid_period_start"?: string | null
          "last_stripe_event_created_at"?: string | null
          "last_stripe_event_id"?: string | null
          "paid_through"?: string | null
          "projection_version"?: number
          "stripe_customer_id"?: string | null
          "stripe_price_id"?: string | null
          "stripe_subscription_id"?: string | null
          "subscription_status"?: string | null
          "synced_at"?: string
          "updated_at"?: string
          "user_id"?: string
        }
        Relationships: []
      }
      "example_resources": {
        Row: {
          "content": string
          "created_at": string
          "id": string
          "title": string
          "updated_at": string
          "user_id": string
        }
        Insert: {
          "content"?: string
          "created_at"?: string
          "id"?: string
          "title": string
          "updated_at"?: string
          "user_id"?: string
        }
        Update: {
          "content"?: string
          "created_at"?: string
          "id"?: string
          "title"?: string
          "updated_at"?: string
          "user_id"?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      "has_pro": {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
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
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
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
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  "graphql_public": {
    Enums: {},
  },
  "public": {
    Enums: {},
  },
} as const
