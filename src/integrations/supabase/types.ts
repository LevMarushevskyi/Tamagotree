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
      achievements: {
        Row: {
          created_at: string
          description: string | null
          icon: string | null
          id: string
          name: string
          xp_requirement: number | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          xp_requirement?: number | null
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          xp_requirement?: number | null
        }
        Relationships: []
      }
      neighborhoods: {
        Row: {
          created_at: string
          id: string
          member_count: number
          name: string
          total_xp: number
        }
        Insert: {
          created_at?: string
          id?: string
          member_count?: number
          name: string
          total_xp?: number
        }
        Update: {
          created_at?: string
          id?: string
          member_count?: number
          name?: string
          total_xp?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          acorns: number
          avatar_url: string | null
          bio: string | null
          created_at: string
          guardian_rank: string
          id: string
          level: number
          profile_private: boolean
          total_xp: number
          updated_at: string
          username: string
        }
        Insert: {
          acorns?: number
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          guardian_rank?: string
          id: string
          level?: number
          profile_private?: boolean
          total_xp?: number
          updated_at?: string
          username: string
        }
        Update: {
          acorns?: number
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          guardian_rank?: string
          id?: string
          level?: number
          profile_private?: boolean
          total_xp?: number
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      quests: {
        Row: {
          acorn_reward: number | null
          bp_reward: number | null
          category: string | null
          created_at: string
          description: string
          icon: string | null
          id: string
          name: string
          quest_type: string
          tree_specific: boolean | null
          xp_reward: number | null
        }
        Insert: {
          acorn_reward?: number | null
          bp_reward?: number | null
          category?: string | null
          created_at?: string
          description: string
          icon?: string | null
          id?: string
          name: string
          quest_type: string
          tree_specific?: boolean | null
          xp_reward?: number | null
        }
        Update: {
          acorn_reward?: number | null
          bp_reward?: number | null
          category?: string | null
          created_at?: string
          description?: string
          icon?: string | null
          id?: string
          name?: string
          quest_type?: string
          tree_specific?: boolean | null
          xp_reward?: number | null
        }
        Relationships: []
      }
      tasks: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          notes: string | null
          photo_url: string | null
          scheduled_date: string
          status: string
          task_type: string
          tree_id: string
          user_id: string
          xp_reward: number
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          photo_url?: string | null
          scheduled_date: string
          status?: string
          task_type: string
          tree_id: string
          user_id: string
          xp_reward?: number
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          photo_url?: string | null
          scheduled_date?: string
          status?: string
          task_type?: string
          tree_id?: string
          user_id?: string
          xp_reward?: number
        }
        Relationships: [
          {
            foreignKeyName: "tasks_tree_id_fkey"
            columns: ["tree_id"]
            isOneToOne: false
            referencedRelation: "tree"
            referencedColumns: ["id"]
          },
        ]
      }
      tree: {
        Row: {
          age_days: number
          created_at: string
          danger_score: number
          health_percentage: number
          health_status: string
          id: string
          latitude: number
          level: number
          longitude: number
          name: string
          photo_url: string | null
          species: string | null
          updated_at: string
          user_id: string | null
          xp_earned: number
        }
        Insert: {
          age_days?: number
          created_at?: string
          danger_score?: number
          health_percentage?: number
          health_status?: string
          id?: string
          latitude: number
          level?: number
          longitude: number
          name: string
          photo_url?: string | null
          species?: string | null
          updated_at?: string
          user_id?: string | null
          xp_earned?: number
        }
        Update: {
          age_days?: number
          created_at?: string
          danger_score?: number
          health_percentage?: number
          health_status?: string
          id?: string
          latitude?: number
          level?: number
          longitude?: number
          name?: string
          photo_url?: string | null
          species?: string | null
          updated_at?: string
          user_id?: string | null
          xp_earned?: number
        }
        Relationships: []
      }
      tree_graveyard: {
        Row: {
          cause_of_death: string | null
          created_at: string
          days_lived: number
          died_at: string
          id: string
          latitude: number
          longitude: number
          name: string
          notes: string | null
          original_tree_id: string | null
          photo_url: string | null
          planted_at: string
          species: string | null
          user_id: string
        }
        Insert: {
          cause_of_death?: string | null
          created_at?: string
          days_lived: number
          died_at?: string
          id?: string
          latitude: number
          longitude: number
          name: string
          notes?: string | null
          original_tree_id?: string | null
          photo_url?: string | null
          planted_at: string
          species?: string | null
          user_id: string
        }
        Update: {
          cause_of_death?: string | null
          created_at?: string
          days_lived?: number
          died_at?: string
          id?: string
          latitude?: number
          longitude?: number
          name?: string
          notes?: string | null
          original_tree_id?: string | null
          photo_url?: string | null
          planted_at?: string
          species?: string | null
          user_id?: string
        }
        Relationships: []
      }
      tree_reports: {
        Row: {
          created_at: string
          details: string | null
          id: string
          reason: string
          reporter_id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          tree_id: string
        }
        Insert: {
          created_at?: string
          details?: string | null
          id?: string
          reason: string
          reporter_id: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          tree_id: string
        }
        Update: {
          created_at?: string
          details?: string | null
          id?: string
          reason?: string
          reporter_id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          tree_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tree_reports_tree_id_fkey"
            columns: ["tree_id"]
            isOneToOne: false
            referencedRelation: "tree"
            referencedColumns: ["id"]
          },
        ]
      }
      user_achievements: {
        Row: {
          achievement_id: string
          unlocked_at: string
          user_id: string
        }
        Insert: {
          achievement_id: string
          unlocked_at?: string
          user_id: string
        }
        Update: {
          achievement_id?: string
          unlocked_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
        ]
      }
      user_neighborhoods: {
        Row: {
          joined_at: string
          neighborhood_id: string
          user_id: string
        }
        Insert: {
          joined_at?: string
          neighborhood_id: string
          user_id: string
        }
        Update: {
          joined_at?: string
          neighborhood_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_neighborhoods_neighborhood_id_fkey"
            columns: ["neighborhood_id"]
            isOneToOne: false
            referencedRelation: "neighborhoods"
            referencedColumns: ["id"]
          },
        ]
      }
      user_quests: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          created_at: string
          id: string
          last_reset_at: string
          progress: number | null
          quest_id: string
          tree_id: string | null
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string
          id?: string
          last_reset_at?: string
          progress?: number | null
          quest_id: string
          tree_id?: string | null
          user_id: string
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string
          id?: string
          last_reset_at?: string
          progress?: number | null
          quest_id?: string
          tree_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_quests_quest_id_fkey"
            columns: ["quest_id"]
            isOneToOne: false
            referencedRelation: "quests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_quests_tree_id_fkey"
            columns: ["tree_id"]
            isOneToOne: false
            referencedRelation: "tree"
            referencedColumns: ["id"]
          },
        ]
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
    Enums: {},
  },
} as const
