export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      annotations: {
        Row: {
          content: string
          created_at: string | null
          id: string
          page_number: number | null
          position: Json | null
          research_upload_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          page_number?: number | null
          position?: Json | null
          research_upload_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          page_number?: number | null
          position?: Json | null
          research_upload_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "annotations_research_upload_id_fkey"
            columns: ["research_upload_id"]
            isOneToOne: false
            referencedRelation: "research_uploads"
            referencedColumns: ["id"]
          },
        ]
      }
      document_chats: {
        Row: {
          content: string
          created_at: string | null
          document_id: string | null
          id: string
          role: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          document_id?: string | null
          id?: string
          role: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          document_id?: string | null
          id?: string
          role?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "document_chats_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          content: string | null
          created_at: string | null
          file_path: string | null
          file_type: string | null
          id: string
          summary: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          file_path?: string | null
          file_type?: string | null
          id?: string
          summary?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string | null
          file_path?: string | null
          file_type?: string | null
          id?: string
          summary?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      feedback: {
        Row: {
          created_at: string | null
          email: string
          id: string
          message: string
          name: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          message: string
          name: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          message?: string
          name?: string
          user_id?: string | null
        }
        Relationships: []
      }
      flashcards: {
        Row: {
          back_content: string
          created_at: string | null
          document_id: string | null
          front_content: string
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          back_content: string
          created_at?: string | null
          document_id?: string | null
          front_content: string
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          back_content?: string
          created_at?: string | null
          document_id?: string | null
          front_content?: string
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "flashcards_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      group_members: {
        Row: {
          created_at: string | null
          group_id: string | null
          id: string
          role: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          group_id?: string | null
          id?: string
          role?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          group_id?: string | null
          id?: string
          role?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "research_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      institutions: {
        Row: {
          branding_colors: Json | null
          created_at: string | null
          domain: string
          id: string
          is_premium: boolean | null
          logo_url: string | null
          name: string
          selar_co_id: string | null
          subscription_expiry: string | null
          updated_at: string | null
        }
        Insert: {
          branding_colors?: Json | null
          created_at?: string | null
          domain: string
          id?: string
          is_premium?: boolean | null
          logo_url?: string | null
          name: string
          selar_co_id?: string | null
          subscription_expiry?: string | null
          updated_at?: string | null
        }
        Update: {
          branding_colors?: Json | null
          created_at?: string | null
          domain?: string
          id?: string
          is_premium?: boolean | null
          logo_url?: string | null
          name?: string
          selar_co_id?: string | null
          subscription_expiry?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          account_type: string | null
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          document_count: number | null
          email: string | null
          flashcard_count: number | null
          id: string
          institution_id: string | null
          last_active: string | null
          last_prompt_shown: string | null
          name: string | null
          streak_count: number | null
          study_hours: number | null
          updated_at: string | null
        }
        Insert: {
          account_type?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          document_count?: number | null
          email?: string | null
          flashcard_count?: number | null
          id: string
          institution_id?: string | null
          last_active?: string | null
          last_prompt_shown?: string | null
          name?: string | null
          streak_count?: number | null
          study_hours?: number | null
          updated_at?: string | null
        }
        Update: {
          account_type?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          document_count?: number | null
          email?: string | null
          flashcard_count?: number | null
          id?: string
          institution_id?: string | null
          last_active?: string | null
          last_prompt_shown?: string | null
          name?: string | null
          streak_count?: number | null
          study_hours?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      research_groups: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          institution_id: string | null
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          institution_id?: string | null
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          institution_id?: string | null
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "research_groups_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      research_uploads: {
        Row: {
          created_at: string | null
          description: string | null
          file_path: string
          file_type: string
          group_id: string | null
          id: string
          institution_id: string | null
          summary: string | null
          tags: Json | null
          title: string
          updated_at: string | null
          user_id: string | null
          visibility: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          file_path: string
          file_type: string
          group_id?: string | null
          id?: string
          institution_id?: string | null
          summary?: string | null
          tags?: Json | null
          title: string
          updated_at?: string | null
          user_id?: string | null
          visibility?: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          file_path?: string
          file_type?: string
          group_id?: string | null
          id?: string
          institution_id?: string | null
          summary?: string | null
          tags?: Json | null
          title?: string
          updated_at?: string | null
          user_id?: string | null
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "research_uploads_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "research_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "research_uploads_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      search_history: {
        Row: {
          created_at: string | null
          id: string
          institution_id: string | null
          query: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          institution_id?: string | null
          query: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          institution_id?: string | null
          query?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "search_history_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          created_at: string | null
          expires_at: string
          id: string
          institution_id: string | null
          plan_type: string
          selar_co_order_id: string | null
          starts_at: string
          status: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          expires_at: string
          id?: string
          institution_id?: string | null
          plan_type: string
          selar_co_order_id?: string | null
          starts_at?: string
          status: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          id?: string
          institution_id?: string | null
          plan_type?: string
          selar_co_order_id?: string | null
          starts_at?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          created_at: string | null
          id: string
          last_prompt_shown: string | null
          tour_completed: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_prompt_shown?: string | null
          tour_completed?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          last_prompt_shown?: string | null
          tour_completed?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
