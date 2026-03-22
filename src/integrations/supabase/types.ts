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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      admin_settings: {
        Row: {
          id: string
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string
          value?: Json
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      deals: {
        Row: {
          active: boolean
          color_instruction: string | null
          created_at: string
          deal_price: number
          id: string
          mediator_name: string | null
          order_details_required: Json | null
          order_form_link: string | null
          photos: string[] | null
          pp_price: number
          product_link: string | null
          rating_limit: string | null
          refund_available_after_days: number | null
          refund_form_link: string | null
          refund_form_name: string | null
          review_days: string | null
          review_type: string | null
          review_word_limit: string | null
          rules: Json | null
          slots_booked: number
          title: string
          total_slots: number
        }
        Insert: {
          active?: boolean
          color_instruction?: string | null
          created_at?: string
          deal_price?: number
          id?: string
          mediator_name?: string | null
          order_details_required?: Json | null
          order_form_link?: string | null
          photos?: string[] | null
          pp_price?: number
          product_link?: string | null
          rating_limit?: string | null
          refund_available_after_days?: number | null
          refund_form_link?: string | null
          refund_form_name?: string | null
          review_days?: string | null
          review_type?: string | null
          review_word_limit?: string | null
          rules?: Json | null
          slots_booked?: number
          title: string
          total_slots?: number
        }
        Update: {
          active?: boolean
          color_instruction?: string | null
          created_at?: string
          deal_price?: number
          id?: string
          mediator_name?: string | null
          order_details_required?: Json | null
          order_form_link?: string | null
          photos?: string[] | null
          pp_price?: number
          product_link?: string | null
          rating_limit?: string | null
          refund_available_after_days?: number | null
          refund_form_link?: string | null
          refund_form_name?: string | null
          review_days?: string | null
          review_type?: string | null
          review_word_limit?: string | null
          rules?: Json | null
          slots_booked?: number
          title?: string
          total_slots?: number
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string | null
          title: string
        }
        Insert: {
          created_at?: string
          id?: string
          message?: string | null
          title: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string | null
          title?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          address: string
          created_at: string
          deal_id: string
          full_name: string
          id: string
          note: string | null
          phone: string
          quantity: number
          status: string
          user_id: string
        }
        Insert: {
          address: string
          created_at?: string
          deal_id: string
          full_name: string
          id?: string
          note?: string | null
          phone: string
          quantity?: number
          status?: string
          user_id: string
        }
        Update: {
          address?: string
          created_at?: string
          deal_id?: string
          full_name?: string
          id?: string
          note?: string | null
          phone?: string
          quantity?: number
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          binance_address: string | null
          created_at: string
          email: string | null
          id: string
          mobile: string | null
          name: string
          points_balance: number
          referral_code: string | null
          referral_earnings: number
          referred_by: string | null
          tasks_completed: number
          total_earnings: number
          updated_at: string
          upi_id: string | null
          user_id: string
          wallet_balance: number
        }
        Insert: {
          binance_address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          mobile?: string | null
          name: string
          points_balance?: number
          referral_code?: string | null
          referral_earnings?: number
          referred_by?: string | null
          tasks_completed?: number
          total_earnings?: number
          updated_at?: string
          upi_id?: string | null
          user_id: string
          wallet_balance?: number
        }
        Update: {
          binance_address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          mobile?: string | null
          name?: string
          points_balance?: number
          referral_code?: string | null
          referral_earnings?: number
          referred_by?: string | null
          tasks_completed?: number
          total_earnings?: number
          updated_at?: string
          upi_id?: string | null
          user_id?: string
          wallet_balance?: number
        }
        Relationships: [
          {
            foreignKeyName: "profiles_referred_by_fkey"
            columns: ["referred_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      referrals: {
        Row: {
          created_at: string
          earnings: number
          id: string
          level: number
          referred_id: string
          referrer_id: string
        }
        Insert: {
          created_at?: string
          earnings?: number
          id?: string
          level: number
          referred_id: string
          referrer_id: string
        }
        Update: {
          created_at?: string
          earnings?: number
          id?: string
          level?: number
          referred_id?: string
          referrer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "referrals_referred_id_fkey"
            columns: ["referred_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      refunds: {
        Row: {
          created_at: string
          details: string | null
          id: string
          order_id: string
          reason: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          details?: string | null
          id?: string
          order_id: string
          reason: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          details?: string | null
          id?: string
          order_id?: string
          reason?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "refunds_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      task_slots: {
        Row: {
          assigned_at: string | null
          assigned_user_id: string | null
          id: string
          review_text: string
          slot_number: number
          status: string
          task_id: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_user_id?: string | null
          id?: string
          review_text?: string
          slot_number: number
          status?: string
          task_id: string
        }
        Update: {
          assigned_at?: string | null
          assigned_user_id?: string | null
          id?: string
          review_text?: string
          slot_number?: number
          status?: string
          task_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_slots_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_submissions: {
        Row: {
          comment: string | null
          form_data: Json | null
          id: string
          reviewed_at: string | null
          screenshot_url: string | null
          second_form_data: Json | null
          second_form_status: string | null
          status: Database["public"]["Enums"]["submission_status"]
          submitted_at: string
          task_id: string
          user_id: string
        }
        Insert: {
          comment?: string | null
          form_data?: Json | null
          id?: string
          reviewed_at?: string | null
          screenshot_url?: string | null
          second_form_data?: Json | null
          second_form_status?: string | null
          status?: Database["public"]["Enums"]["submission_status"]
          submitted_at?: string
          task_id: string
          user_id: string
        }
        Update: {
          comment?: string | null
          form_data?: Json | null
          id?: string
          reviewed_at?: string | null
          screenshot_url?: string | null
          second_form_data?: Json | null
          second_form_status?: string | null
          status?: Database["public"]["Enums"]["submission_status"]
          submitted_at?: string
          task_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_submissions_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          approval_days: number | null
          category: string | null
          created_at: string
          description: string | null
          end_date: string | null
          form_fields: Json | null
          guide_text: string | null
          guide_video_url: string | null
          has_refund: boolean | null
          id: string
          points: number
          review_text: string | null
          reward: number
          second_form_fields: Json | null
          slots_remaining: number
          slots_total: number
          start_date: string | null
          status: Database["public"]["Enums"]["task_status"]
          task_link: string | null
          title: string
          updated_at: string
        }
        Insert: {
          approval_days?: number | null
          category?: string | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          form_fields?: Json | null
          guide_text?: string | null
          guide_video_url?: string | null
          has_refund?: boolean | null
          id?: string
          points?: number
          review_text?: string | null
          reward?: number
          second_form_fields?: Json | null
          slots_remaining?: number
          slots_total?: number
          start_date?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          task_link?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          approval_days?: number | null
          category?: string | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          form_fields?: Json | null
          guide_text?: string | null
          guide_video_url?: string | null
          has_refund?: boolean | null
          id?: string
          points?: number
          review_text?: string | null
          reward?: number
          second_form_fields?: Json | null
          slots_remaining?: number
          slots_total?: number
          start_date?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          task_link?: string | null
          title?: string
          updated_at?: string
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
      withdraw_requests: {
        Row: {
          address: string
          amount: number
          id: string
          method: Database["public"]["Enums"]["withdraw_method"]
          processed_at: string | null
          requested_at: string
          status: Database["public"]["Enums"]["withdraw_status"]
          user_id: string
        }
        Insert: {
          address: string
          amount: number
          id?: string
          method: Database["public"]["Enums"]["withdraw_method"]
          processed_at?: string | null
          requested_at?: string
          status?: Database["public"]["Enums"]["withdraw_status"]
          user_id: string
        }
        Update: {
          address?: string
          amount?: number
          id?: string
          method?: Database["public"]["Enums"]["withdraw_method"]
          processed_at?: string | null
          requested_at?: string
          status?: Database["public"]["Enums"]["withdraw_status"]
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
      lookup_referrer_by_code: { Args: { _code: string }; Returns: string }
      set_referred_by: {
        Args: { _referrer_id: string; _user_id: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "user"
      submission_status: "pending" | "approved" | "rejected"
      task_status: "active" | "paused" | "completed"
      withdraw_method: "upi" | "binance"
      withdraw_status: "pending" | "approved" | "rejected" | "paid"
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
      app_role: ["admin", "user"],
      submission_status: ["pending", "approved", "rejected"],
      task_status: ["active", "paused", "completed"],
      withdraw_method: ["upi", "binance"],
      withdraw_status: ["pending", "approved", "rejected", "paid"],
    },
  },
} as const
