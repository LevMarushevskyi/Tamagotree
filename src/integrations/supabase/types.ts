export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          acorn_reward: number | null
          bp_reward: number | null
          created_at: string
          description: string | null
          icon: string | null
          id: string
          name: string
          xp_requirement: number | null
        }
        Insert: {
          acorn_reward?: number | null
          bp_reward?: number | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          xp_requirement?: number | null
        }
        Update: {
          acorn_reward?: number | null
          bp_reward?: number | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          xp_requirement?: number | null
        }
        Relationships: []
      }
      decorations: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          display_name: string
          id: string
          image_url: string
          is_available: boolean | null
          name: string
          price_acorns: number
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          display_name: string
          id?: string
          image_url: string
          is_available?: boolean | null
          name: string
          price_acorns: number
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          display_name?: string
          id?: string
          image_url?: string
          is_available?: boolean | null
          name?: string
          price_acorns?: number
        }
        Relationships: []
      }
      friend_task_requests: {
        Row: {
          completed_at: string | null
          created_at: string
          expires_at: string
          helper_id: string
          helper_reward_acorns: number
          helper_reward_bp: number
          id: string
          requester_id: string
          requester_reward_acorns: number
          requester_reward_bp: number
          status: string
          task_type: string
          tree_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          expires_at?: string
          helper_id: string
          helper_reward_acorns?: number
          helper_reward_bp?: number
          id?: string
          requester_id: string
          requester_reward_acorns?: number
          requester_reward_bp?: number
          status?: string
          task_type: string
          tree_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          expires_at?: string
          helper_id?: string
          helper_reward_acorns?: number
          helper_reward_bp?: number
          id?: string
          requester_id?: string
          requester_reward_acorns?: number
          requester_reward_bp?: number
          status?: string
          task_type?: string
          tree_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "friend_task_requests_helper_id_fkey"
            columns: ["helper_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "friend_task_requests_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "friend_task_requests_tree_id_fkey"
            columns: ["tree_id"]
            isOneToOne: false
            referencedRelation: "tree"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "friend_task_requests_tree_id_fkey"
            columns: ["tree_id"]
            isOneToOne: false
            referencedRelation: "tree_with_age"
            referencedColumns: ["id"]
          },
        ]
      }
      friendships: {
        Row: {
          created_at: string
          friend_id: string
          id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          friend_id: string
          id?: string
          status: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          friend_id?: string
          id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "friendships_friend_id_fkey"
            columns: ["friend_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "friendships_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
          {
            foreignKeyName: "tasks_tree_id_fkey"
            columns: ["tree_id"]
            isOneToOne: false
            referencedRelation: "tree_with_age"
            referencedColumns: ["id"]
          },
        ]
      }
      tree: {
        Row: {
          age_days: number
          carbon_saved: number | null
          created_at: string
          daily_tasks_completed: number
          danger_score: number
          health_percentage: number
          health_status: string
          id: string
          last_watered_at: string | null
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
          carbon_saved?: number | null
          created_at?: string
          daily_tasks_completed?: number
          danger_score?: number
          health_percentage?: number
          health_status?: string
          id?: string
          last_watered_at?: string | null
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
          carbon_saved?: number | null
          created_at?: string
          daily_tasks_completed?: number
          danger_score?: number
          health_percentage?: number
          health_status?: string
          id?: string
          last_watered_at?: string | null
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
      tree_decorations: {
        Row: {
          decoration_id: string
          id: string
          placed_at: string
          position_x: number | null
          position_y: number | null
          tree_id: string
        }
        Insert: {
          decoration_id: string
          id?: string
          placed_at?: string
          position_x?: number | null
          position_y?: number | null
          tree_id: string
        }
        Update: {
          decoration_id?: string
          id?: string
          placed_at?: string
          position_x?: number | null
          position_y?: number | null
          tree_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tree_decorations_decoration_id_fkey"
            columns: ["decoration_id"]
            isOneToOne: false
            referencedRelation: "decorations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tree_decorations_tree_id_fkey"
            columns: ["tree_id"]
            isOneToOne: false
            referencedRelation: "tree"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tree_decorations_tree_id_fkey"
            columns: ["tree_id"]
            isOneToOne: false
            referencedRelation: "tree_with_age"
            referencedColumns: ["id"]
          },
        ]
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
          {
            foreignKeyName: "tree_reports_tree_id_fkey"
            columns: ["tree_id"]
            isOneToOne: false
            referencedRelation: "tree_with_age"
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
      user_decorations: {
        Row: {
          decoration_id: string
          id: string
          purchased_at: string
          user_id: string
        }
        Insert: {
          decoration_id: string
          id?: string
          purchased_at?: string
          user_id: string
        }
        Update: {
          decoration_id?: string
          id?: string
          purchased_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_decorations_decoration_id_fkey"
            columns: ["decoration_id"]
            isOneToOne: false
            referencedRelation: "decorations"
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
          {
            foreignKeyName: "user_quests_tree_id_fkey"
            columns: ["tree_id"]
            isOneToOne: false
            referencedRelation: "tree_with_age"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      tree_with_age: {
        Row: {
          age_days: number | null
          age_days_calculated: number | null
          carbon_saved: number | null
          created_at: string | null
          daily_tasks_completed: number | null
          danger_score: number | null
          health_percentage: number | null
          health_status: string | null
          id: string | null
          latitude: number | null
          level: number | null
          longitude: number | null
          name: string | null
          photo_url: string | null
          species: string | null
          updated_at: string | null
          user_id: string | null
          xp_earned: number | null
        }
        Insert: {
          age_days?: number | null
          age_days_calculated?: never
          carbon_saved?: number | null
          created_at?: string | null
          daily_tasks_completed?: number | null
          danger_score?: number | null
          health_percentage?: number | null
          health_status?: string | null
          id?: string | null
          latitude?: number | null
          level?: number | null
          longitude?: number | null
          name?: string | null
          photo_url?: string | null
          species?: string | null
          updated_at?: string | null
          user_id?: string | null
          xp_earned?: number | null
        }
        Update: {
          age_days?: number | null
          age_days_calculated?: never
          carbon_saved?: number | null
          created_at?: string | null
          daily_tasks_completed?: number | null
          danger_score?: number | null
          health_percentage?: number | null
          health_status?: string | null
          id?: string | null
          latitude?: number | null
          level?: number | null
          longitude?: number | null
          name?: string | null
          photo_url?: string | null
          species?: string | null
          updated_at?: string | null
          user_id?: string | null
          xp_earned?: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      add_tree_xp: {
        Args: { tree_id: string; xp_to_add: number }
        Returns: undefined
      }
      calculate_tree_health: {
        Args: { tree_id: string }
        Returns: undefined
      }
      get_tree_age_days: {
        Args: { tree_id: string }
        Returns: number
      }
      increment_user_rewards: {
        Args: { acorns_to_add: number; bp_to_add: number; user_id: string }
        Returns: undefined
      }
      update_all_trees_health: {
        Args: Record<PropertyKey, never>
        Returns: number
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
