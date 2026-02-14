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
      achievements: {
        Row: {
          created_at: string
          criteria_type: string
          criteria_value: number
          description: string
          icon: string
          id: string
          points: number
          rarity: string
          slug: string
          title: string
        }
        Insert: {
          created_at?: string
          criteria_type: string
          criteria_value?: number
          description: string
          icon?: string
          id?: string
          points?: number
          rarity?: string
          slug: string
          title: string
        }
        Update: {
          created_at?: string
          criteria_type?: string
          criteria_value?: number
          description?: string
          icon?: string
          id?: string
          points?: number
          rarity?: string
          slug?: string
          title?: string
        }
        Relationships: []
      }
      alumni_comments: {
        Row: {
          author_id: string
          content: string
          created_at: string | null
          id: string
          post_id: string
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string | null
          id?: string
          post_id: string
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string | null
          id?: string
          post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "alumni_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "alumni_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      alumni_connections: {
        Row: {
          created_at: string | null
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string | null
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string | null
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: []
      }
      alumni_group_members: {
        Row: {
          group_id: string
          id: string
          joined_at: string | null
          role: Database["public"]["Enums"]["group_role"] | null
          user_id: string
        }
        Insert: {
          group_id: string
          id?: string
          joined_at?: string | null
          role?: Database["public"]["Enums"]["group_role"] | null
          user_id: string
        }
        Update: {
          group_id?: string
          id?: string
          joined_at?: string | null
          role?: Database["public"]["Enums"]["group_role"] | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "alumni_group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "alumni_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      alumni_group_messages: {
        Row: {
          created_at: string | null
          group_id: string
          id: string
          media_url: string | null
          message: string
          sender_id: string
        }
        Insert: {
          created_at?: string | null
          group_id: string
          id?: string
          media_url?: string | null
          message: string
          sender_id: string
        }
        Update: {
          created_at?: string | null
          group_id?: string
          id?: string
          media_url?: string | null
          message?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "alumni_group_messages_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "alumni_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      alumni_groups: {
        Row: {
          cover_image: string | null
          created_at: string | null
          created_by: string
          description: string | null
          field: string
          id: string
          member_count: number | null
          name: string
        }
        Insert: {
          cover_image?: string | null
          created_at?: string | null
          created_by: string
          description?: string | null
          field: string
          id?: string
          member_count?: number | null
          name: string
        }
        Update: {
          cover_image?: string | null
          created_at?: string | null
          created_by?: string
          description?: string | null
          field?: string
          id?: string
          member_count?: number | null
          name?: string
        }
        Relationships: []
      }
      alumni_post_reactions: {
        Row: {
          created_at: string | null
          id: string
          post_id: string
          reaction_type:
            | Database["public"]["Enums"]["alumni_reaction_type"]
            | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id: string
          reaction_type?:
            | Database["public"]["Enums"]["alumni_reaction_type"]
            | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string
          reaction_type?:
            | Database["public"]["Enums"]["alumni_reaction_type"]
            | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "alumni_post_reactions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "alumni_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      alumni_posts: {
        Row: {
          author_id: string
          comments_count: number | null
          content: string
          created_at: string | null
          id: string
          likes_count: number | null
          media_urls: string[] | null
          post_type: Database["public"]["Enums"]["alumni_post_type"] | null
          updated_at: string | null
          visibility: Database["public"]["Enums"]["alumni_visibility"] | null
        }
        Insert: {
          author_id: string
          comments_count?: number | null
          content: string
          created_at?: string | null
          id?: string
          likes_count?: number | null
          media_urls?: string[] | null
          post_type?: Database["public"]["Enums"]["alumni_post_type"] | null
          updated_at?: string | null
          visibility?: Database["public"]["Enums"]["alumni_visibility"] | null
        }
        Update: {
          author_id?: string
          comments_count?: number | null
          content?: string
          created_at?: string | null
          id?: string
          likes_count?: number | null
          media_urls?: string[] | null
          post_type?: Database["public"]["Enums"]["alumni_post_type"] | null
          updated_at?: string | null
          visibility?: Database["public"]["Enums"]["alumni_visibility"] | null
        }
        Relationships: []
      }
      alumni_profiles: {
        Row: {
          achievements: string[] | null
          available_for_mentorship: boolean | null
          bio: string | null
          created_at: string | null
          current_company: string | null
          current_position: string | null
          expertise_areas: string[] | null
          graduation_year: number
          id: string
          industry: string | null
          linkedin_url: string | null
          portfolio_url: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          achievements?: string[] | null
          available_for_mentorship?: boolean | null
          bio?: string | null
          created_at?: string | null
          current_company?: string | null
          current_position?: string | null
          expertise_areas?: string[] | null
          graduation_year: number
          id?: string
          industry?: string | null
          linkedin_url?: string | null
          portfolio_url?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          achievements?: string[] | null
          available_for_mentorship?: boolean | null
          bio?: string | null
          created_at?: string | null
          current_company?: string | null
          current_position?: string | null
          expertise_areas?: string[] | null
          graduation_year?: number
          id?: string
          industry?: string | null
          linkedin_url?: string | null
          portfolio_url?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      applications: {
        Row: {
          cover_letter: string | null
          created_at: string
          id: string
          opportunity_id: string
          resume_url: string | null
          status: Database["public"]["Enums"]["application_status"]
          student_id: string
          updated_at: string
        }
        Insert: {
          cover_letter?: string | null
          created_at?: string
          id?: string
          opportunity_id: string
          resume_url?: string | null
          status?: Database["public"]["Enums"]["application_status"]
          student_id: string
          updated_at?: string
        }
        Update: {
          cover_letter?: string | null
          created_at?: string
          id?: string
          opportunity_id?: string
          resume_url?: string | null
          status?: Database["public"]["Enums"]["application_status"]
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      certificates: {
        Row: {
          application_id: string
          id: string
          issued_at: string
          student_id: string
          verification_code: string
        }
        Insert: {
          application_id: string
          id?: string
          issued_at?: string
          student_id: string
          verification_code?: string
        }
        Update: {
          application_id?: string
          id?: string
          issued_at?: string
          student_id?: string
          verification_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "certificates_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: true
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          application_id: string
          created_at: string
          id: string
          recruiter_id: string
          student_id: string
          updated_at: string
        }
        Insert: {
          application_id: string
          created_at?: string
          id?: string
          recruiter_id: string
          student_id: string
          updated_at?: string
        }
        Update: {
          application_id?: string
          created_at?: string
          id?: string
          recruiter_id?: string
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: true
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback: {
        Row: {
          application_id: string
          comments: string | null
          created_at: string
          evaluator_id: string
          id: string
          rating: number
          skills_demonstrated: string[]
        }
        Insert: {
          application_id: string
          comments?: string | null
          created_at?: string
          evaluator_id: string
          id?: string
          rating: number
          skills_demonstrated?: string[]
        }
        Update: {
          application_id?: string
          comments?: string | null
          created_at?: string
          evaluator_id?: string
          id?: string
          rating?: number
          skills_demonstrated?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "feedback_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      mentorship_requests: {
        Row: {
          created_at: string | null
          id: string
          mentee_id: string
          mentor_id: string
          message: string | null
          status: Database["public"]["Enums"]["mentorship_status"] | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          mentee_id: string
          mentor_id: string
          message?: string | null
          status?: Database["public"]["Enums"]["mentorship_status"] | null
        }
        Update: {
          created_at?: string | null
          id?: string
          mentee_id?: string
          mentor_id?: string
          message?: string | null
          status?: Database["public"]["Enums"]["mentorship_status"] | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          read_at: string | null
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          read_at?: string | null
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          read_at?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          metadata: Json | null
          read_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          metadata?: Json | null
          read_at?: string | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          metadata?: Json | null
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      opportunities: {
        Row: {
          company_name: string
          created_at: string
          deadline: string | null
          description: string
          duration_hours: number
          id: string
          is_remote: boolean
          level: Database["public"]["Enums"]["opportunity_level"]
          location: string | null
          max_applicants: number | null
          recruiter_id: string
          skills_required: string[]
          status: Database["public"]["Enums"]["opportunity_status"]
          title: string
          updated_at: string
        }
        Insert: {
          company_name: string
          created_at?: string
          deadline?: string | null
          description: string
          duration_hours?: number
          id?: string
          is_remote?: boolean
          level?: Database["public"]["Enums"]["opportunity_level"]
          location?: string | null
          max_applicants?: number | null
          recruiter_id: string
          skills_required?: string[]
          status?: Database["public"]["Enums"]["opportunity_status"]
          title: string
          updated_at?: string
        }
        Update: {
          company_name?: string
          created_at?: string
          deadline?: string | null
          description?: string
          duration_hours?: number
          id?: string
          is_remote?: boolean
          level?: Database["public"]["Enums"]["opportunity_level"]
          location?: string | null
          max_applicants?: number | null
          recruiter_id?: string
          skills_required?: string[]
          status?: Database["public"]["Enums"]["opportunity_status"]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          about_me: string | null
          avatar_url: string | null
          bio: string | null
          company_description: string | null
          company_logo: string | null
          company_name: string | null
          company_size: string | null
          company_website: string | null
          cover_image: string | null
          created_at: string
          deletion_requested_at: string | null
          deletion_scheduled_for: string | null
          email: string
          founded_year: number | null
          full_name: string | null
          github_url: string | null
          gpa: number | null
          graduation_year: number | null
          id: string
          industry: string | null
          is_deactivated: boolean | null
          language_preference: string | null
          location: string | null
          major: string | null
          portfolio_url: string | null
          resume_url: string | null
          semester: number | null
          status: string | null
          theme_preference: string | null
          university: string | null
          updated_at: string
          user_id: string
          website: string | null
        }
        Insert: {
          about_me?: string | null
          avatar_url?: string | null
          bio?: string | null
          company_description?: string | null
          company_logo?: string | null
          company_name?: string | null
          company_size?: string | null
          company_website?: string | null
          cover_image?: string | null
          created_at?: string
          deletion_requested_at?: string | null
          deletion_scheduled_for?: string | null
          email: string
          founded_year?: number | null
          full_name?: string | null
          github_url?: string | null
          gpa?: number | null
          graduation_year?: number | null
          id?: string
          industry?: string | null
          is_deactivated?: boolean | null
          language_preference?: string | null
          location?: string | null
          major?: string | null
          portfolio_url?: string | null
          resume_url?: string | null
          semester?: number | null
          status?: string | null
          theme_preference?: string | null
          university?: string | null
          updated_at?: string
          user_id: string
          website?: string | null
        }
        Update: {
          about_me?: string | null
          avatar_url?: string | null
          bio?: string | null
          company_description?: string | null
          company_logo?: string | null
          company_name?: string | null
          company_size?: string | null
          company_website?: string | null
          cover_image?: string | null
          created_at?: string
          deletion_requested_at?: string | null
          deletion_scheduled_for?: string | null
          email?: string
          founded_year?: number | null
          full_name?: string | null
          github_url?: string | null
          gpa?: number | null
          graduation_year?: number | null
          id?: string
          industry?: string | null
          is_deactivated?: boolean | null
          language_preference?: string | null
          location?: string | null
          major?: string | null
          portfolio_url?: string | null
          resume_url?: string | null
          semester?: number | null
          status?: string | null
          theme_preference?: string | null
          university?: string | null
          updated_at?: string
          user_id?: string
          website?: string | null
        }
        Relationships: []
      }
      rate_limits: {
        Row: {
          count: number
          created_at: string
          id: string
          key: string
          reset_at: string
        }
        Insert: {
          count?: number
          created_at?: string
          id?: string
          key: string
          reset_at: string
        }
        Update: {
          count?: number
          created_at?: string
          id?: string
          key?: string
          reset_at?: string
        }
        Relationships: []
      }
      student_certifications: {
        Row: {
          created_at: string | null
          credential_url: string | null
          expiry_date: string | null
          id: string
          issue_date: string
          issuer: string
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          credential_url?: string | null
          expiry_date?: string | null
          id?: string
          issue_date: string
          issuer: string
          name: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          credential_url?: string | null
          expiry_date?: string | null
          id?: string
          issue_date?: string
          issuer?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      student_experience: {
        Row: {
          company: string
          created_at: string | null
          description: string | null
          end_date: string | null
          id: string
          is_current: boolean | null
          location: string | null
          position: string
          start_date: string
          user_id: string
        }
        Insert: {
          company: string
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          is_current?: boolean | null
          location?: string | null
          position: string
          start_date: string
          user_id: string
        }
        Update: {
          company?: string
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          is_current?: boolean | null
          location?: string | null
          position?: string
          start_date?: string
          user_id?: string
        }
        Relationships: []
      }
      student_projects: {
        Row: {
          created_at: string | null
          description: string | null
          end_date: string | null
          github_url: string | null
          id: string
          image_url: string | null
          project_url: string | null
          start_date: string | null
          tech_stack: string[] | null
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          github_url?: string | null
          id?: string
          image_url?: string | null
          project_url?: string | null
          start_date?: string | null
          tech_stack?: string[] | null
          title: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          github_url?: string | null
          id?: string
          image_url?: string | null
          project_url?: string | null
          start_date?: string | null
          tech_stack?: string[] | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      student_skills: {
        Row: {
          created_at: string | null
          id: string
          proficiency: Database["public"]["Enums"]["skill_proficiency"] | null
          skill_name: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          proficiency?: Database["public"]["Enums"]["skill_proficiency"] | null
          skill_name: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          proficiency?: Database["public"]["Enums"]["skill_proficiency"] | null
          skill_name?: string
          user_id?: string
        }
        Relationships: []
      }
      task_submissions: {
        Row: {
          application_id: string
          feedback: string | null
          id: string
          notes: string | null
          reviewed_at: string | null
          status: Database["public"]["Enums"]["submission_status"]
          student_id: string
          submission_url: string | null
          submitted_at: string
          task_id: string | null
        }
        Insert: {
          application_id: string
          feedback?: string | null
          id?: string
          notes?: string | null
          reviewed_at?: string | null
          status?: Database["public"]["Enums"]["submission_status"]
          student_id: string
          submission_url?: string | null
          submitted_at?: string
          task_id?: string | null
        }
        Update: {
          application_id?: string
          feedback?: string | null
          id?: string
          notes?: string | null
          reviewed_at?: string | null
          status?: Database["public"]["Enums"]["submission_status"]
          student_id?: string
          submission_url?: string | null
          submitted_at?: string
          task_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "task_submissions_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
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
          created_at: string
          description: string | null
          due_days: number | null
          id: string
          opportunity_id: string
          order_index: number
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          due_days?: number | null
          id?: string
          opportunity_id: string
          order_index?: number
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          due_days?: number | null
          id?: string
          opportunity_id?: string
          order_index?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      user_2fa: {
        Row: {
          backup_codes: string[] | null
          created_at: string | null
          id: string
          totp_enabled: boolean | null
          totp_secret: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          backup_codes?: string[] | null
          created_at?: string | null
          id?: string
          totp_enabled?: boolean | null
          totp_secret?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          backup_codes?: string[] | null
          created_at?: string | null
          id?: string
          totp_enabled?: boolean | null
          totp_secret?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_id: string
          id: string
          unlocked_at: string
          user_id: string
        }
        Insert: {
          achievement_id: string
          id?: string
          unlocked_at?: string
          user_id: string
        }
        Update: {
          achievement_id?: string
          id?: string
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
      user_gamification: {
        Row: {
          created_at: string
          id: string
          last_active_at: string | null
          level: number
          longest_streak: number
          streak_days: number
          updated_at: string
          user_id: string
          xp: number
        }
        Insert: {
          created_at?: string
          id?: string
          last_active_at?: string | null
          level?: number
          longest_streak?: number
          streak_days?: number
          updated_at?: string
          user_id: string
          xp?: number
        }
        Update: {
          created_at?: string
          id?: string
          last_active_at?: string | null
          level?: number
          longest_streak?: number
          streak_days?: number
          updated_at?: string
          user_id?: string
          xp?: number
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
      profiles_public: {
        Row: {
          avatar_url: string | null
          bio: string | null
          cover_image: string | null
          created_at: string | null
          full_name: string | null
          github_url: string | null
          graduation_year: number | null
          id: string | null
          location: string | null
          major: string | null
          portfolio_url: string | null
          status: string | null
          university: string | null
          updated_at: string | null
          user_id: string | null
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          cover_image?: string | null
          created_at?: string | null
          full_name?: string | null
          github_url?: string | null
          graduation_year?: number | null
          id?: string | null
          location?: string | null
          major?: string | null
          portfolio_url?: string | null
          status?: string | null
          university?: string | null
          updated_at?: string | null
          user_id?: string | null
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          cover_image?: string | null
          created_at?: string | null
          full_name?: string | null
          github_url?: string | null
          graduation_year?: number | null
          id?: string | null
          location?: string | null
          major?: string | null
          portfolio_url?: string | null
          status?: string | null
          university?: string | null
          updated_at?: string | null
          user_id?: string | null
          website?: string | null
        }
        Relationships: []
      }
      user_2fa_status: {
        Row: {
          backup_codes_remaining: number | null
          created_at: string | null
          id: string | null
          totp_enabled: boolean | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          backup_codes_remaining?: never
          created_at?: string | null
          id?: string | null
          totp_enabled?: boolean | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          backup_codes_remaining?: never
          created_at?: string | null
          id?: string | null
          totp_enabled?: boolean | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      cancel_account_deletion: { Args: never; Returns: undefined }
      cleanup_expired_rate_limits: { Args: never; Returns: undefined }
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
      alumni_post_type:
        | "update"
        | "achievement"
        | "job_posting"
        | "advice"
        | "event"
      alumni_reaction_type: "like" | "celebrate" | "insightful" | "support"
      alumni_visibility: "public" | "connections" | "private"
      app_role: "student" | "recruiter" | "admin"
      application_status:
        | "pending"
        | "accepted"
        | "rejected"
        | "in_progress"
        | "completed"
        | "withdrawn"
      group_role: "admin" | "moderator" | "member"
      mentorship_status: "pending" | "accepted" | "declined"
      opportunity_level: "beginner" | "intermediate" | "advanced"
      opportunity_status: "draft" | "published" | "closed"
      skill_proficiency: "beginner" | "intermediate" | "advanced" | "expert"
      submission_status: "pending" | "approved" | "needs_revision"
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
      alumni_post_type: [
        "update",
        "achievement",
        "job_posting",
        "advice",
        "event",
      ],
      alumni_reaction_type: ["like", "celebrate", "insightful", "support"],
      alumni_visibility: ["public", "connections", "private"],
      app_role: ["student", "recruiter", "admin"],
      application_status: [
        "pending",
        "accepted",
        "rejected",
        "in_progress",
        "completed",
        "withdrawn",
      ],
      group_role: ["admin", "moderator", "member"],
      mentorship_status: ["pending", "accepted", "declined"],
      opportunity_level: ["beginner", "intermediate", "advanced"],
      opportunity_status: ["draft", "published", "closed"],
      skill_proficiency: ["beginner", "intermediate", "advanced", "expert"],
      submission_status: ["pending", "approved", "needs_revision"],
    },
  },
} as const
