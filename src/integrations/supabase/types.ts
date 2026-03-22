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
      earnings: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          id: string
          paid_at: string | null
          status: string
          submission_id: string | null
          tester_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          id?: string
          paid_at?: string | null
          status?: string
          submission_id?: string | null
          tester_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          paid_at?: string | null
          status?: string
          submission_id?: string | null
          tester_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "earnings_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "test_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          age: number | null
          avatar_url: string | null
          bio: string | null
          created_at: string
          devices: string[] | null
          email: string | null
          full_name: string | null
          gender: string | null
          id: string
          interests: string[] | null
          location: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          age?: number | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          devices?: string[] | null
          email?: string | null
          full_name?: string | null
          gender?: string | null
          id?: string
          interests?: string[] | null
          location?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          age?: number | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          devices?: string[] | null
          email?: string | null
          full_name?: string | null
          gender?: string | null
          id?: string
          interests?: string[] | null
          location?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      question_answers: {
        Row: {
          answer_text: string | null
          created_at: string
          id: string
          question_id: string
          selected_option: number | null
          submission_id: string
        }
        Insert: {
          answer_text?: string | null
          created_at?: string
          id?: string
          question_id: string
          selected_option?: number | null
          submission_id: string
        }
        Update: {
          answer_text?: string | null
          created_at?: string
          id?: string
          question_id?: string
          selected_option?: number | null
          submission_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "question_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "test_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "question_answers_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "test_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      survey_questions: {
        Row: {
          created_at: string
          id: string
          logic_branch: Json | null
          options: Json | null
          question_text: string
          question_type: string
          required: boolean | null
          sort_order: number
          survey_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          logic_branch?: Json | null
          options?: Json | null
          question_text: string
          question_type?: string
          required?: boolean | null
          sort_order?: number
          survey_id: string
        }
        Update: {
          created_at?: string
          id?: string
          logic_branch?: Json | null
          options?: Json | null
          question_text?: string
          question_type?: string
          required?: boolean | null
          sort_order?: number
          survey_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "survey_questions_survey_id_fkey"
            columns: ["survey_id"]
            isOneToOne: false
            referencedRelation: "surveys"
            referencedColumns: ["id"]
          },
        ]
      }
      survey_responses: {
        Row: {
          answers: Json
          created_at: string
          id: string
          respondent_id: string
          survey_id: string
        }
        Insert: {
          answers?: Json
          created_at?: string
          id?: string
          respondent_id: string
          survey_id: string
        }
        Update: {
          answers?: Json
          created_at?: string
          id?: string
          respondent_id?: string
          survey_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "survey_responses_survey_id_fkey"
            columns: ["survey_id"]
            isOneToOne: false
            referencedRelation: "surveys"
            referencedColumns: ["id"]
          },
        ]
      }
      surveys: {
        Row: {
          created_at: string
          description: string | null
          id: string
          recruiter_id: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          recruiter_id: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          recruiter_id?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      test_questions: {
        Row: {
          created_at: string
          id: string
          options: Json | null
          question_text: string
          question_type: string
          required: boolean | null
          sort_order: number
          task_id: string | null
          test_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          options?: Json | null
          question_text: string
          question_type?: string
          required?: boolean | null
          sort_order?: number
          task_id?: string | null
          test_id: string
        }
        Update: {
          created_at?: string
          id?: string
          options?: Json | null
          question_text?: string
          question_type?: string
          required?: boolean | null
          sort_order?: number
          task_id?: string | null
          test_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "test_questions_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "test_tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "test_questions_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "tests"
            referencedColumns: ["id"]
          },
        ]
      }
      test_submissions: {
        Row: {
          attachments: string[] | null
          created_at: string
          feedback: string | null
          id: string
          rating: number | null
          recording_url: string | null
          reviewed_at: string | null
          status: string
          submitted_at: string | null
          test_id: string
          tester_id: string
        }
        Insert: {
          attachments?: string[] | null
          created_at?: string
          feedback?: string | null
          id?: string
          rating?: number | null
          recording_url?: string | null
          reviewed_at?: string | null
          status?: string
          submitted_at?: string | null
          test_id: string
          tester_id: string
        }
        Update: {
          attachments?: string[] | null
          created_at?: string
          feedback?: string | null
          id?: string
          rating?: number | null
          recording_url?: string | null
          reviewed_at?: string | null
          status?: string
          submitted_at?: string | null
          test_id?: string
          tester_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "test_submissions_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "tests"
            referencedColumns: ["id"]
          },
        ]
      }
      test_tasks: {
        Row: {
          created_at: string
          description: string | null
          id: string
          sort_order: number
          test_id: string
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          sort_order?: number
          test_id: string
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          sort_order?: number
          test_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "test_tasks_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "tests"
            referencedColumns: ["id"]
          },
        ]
      }
      tests: {
        Row: {
          browser_targeting: string[] | null
          category: string | null
          created_at: string
          current_testers: number | null
          description: string | null
          device_targeting: string[] | null
          estimated_duration: number
          id: string
          max_testers: number | null
          prototype_url: string | null
          recruiter_id: string
          requirements: string | null
          reward_amount: number
          screener_questions: Json | null
          status: string
          target_audience: Json | null
          test_type: string | null
          title: string
          updated_at: string
        }
        Insert: {
          browser_targeting?: string[] | null
          category?: string | null
          created_at?: string
          current_testers?: number | null
          description?: string | null
          device_targeting?: string[] | null
          estimated_duration?: number
          id?: string
          max_testers?: number | null
          prototype_url?: string | null
          recruiter_id: string
          requirements?: string | null
          reward_amount?: number
          screener_questions?: Json | null
          status?: string
          target_audience?: Json | null
          test_type?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          browser_targeting?: string[] | null
          category?: string | null
          created_at?: string
          current_testers?: number | null
          description?: string | null
          device_targeting?: string[] | null
          estimated_duration?: number
          id?: string
          max_testers?: number | null
          prototype_url?: string | null
          recruiter_id?: string
          requirements?: string | null
          reward_amount?: number
          screener_questions?: Json | null
          status?: string
          target_audience?: Json | null
          test_type?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
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
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "tester" | "recruiter" | "admin"
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
      app_role: ["tester", "recruiter", "admin"],
    },
  },
} as const
