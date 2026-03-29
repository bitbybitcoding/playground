// Client-side re-export only. Safe for Client Components.
// Server Components must import directly from '@/lib/supabase/server'.
export { createClient } from '@/lib/supabase/client';

// Types
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          role: 'student' | 'admin';
          impact_points: number;
          weekly_hours: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          role?: 'student' | 'admin';
          impact_points?: number;
          weekly_hours?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          role?: 'student' | 'admin';
          impact_points?: number;
          weekly_hours?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      invite_codes: {
        Row: {
          id: string;
          code: string;
          used: boolean;
          used_by: string | null;
          used_at: string | null;
          created_by: string | null;
          created_at: string;
          expires_at: string | null;
          max_uses: number;
          use_count: number;
        };
        Insert: {
          id?: string;
          code: string;
          used?: boolean;
          used_by?: string | null;
          used_at?: string | null;
          created_by?: string | null;
          created_at?: string;
          expires_at?: string | null;
          max_uses?: number;
          use_count?: number;
        };
        Update: {
          id?: string;
          code?: string;
          used?: boolean;
          used_by?: string | null;
          used_at?: string | null;
          created_by?: string | null;
          created_at?: string;
          expires_at?: string | null;
          max_uses?: number;
          use_count?: number;
        };
      };
      challenges: {
        Row: {
          id: string;
          title: string;
          description: string;
          difficulty: 'beginner' | 'intermediate' | 'advanced';
          category: string;
          constraints: string | null;
          starter_code: string;
          test_cases: any;
          expected_output: string | null;
          time_estimate: number;
          points: number;
          is_published: boolean;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          difficulty: 'beginner' | 'intermediate' | 'advanced';
          category: string;
          constraints?: string | null;
          starter_code?: string;
          test_cases?: any;
          expected_output?: string | null;
          time_estimate?: number;
          points?: number;
          is_published?: boolean;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          difficulty?: 'beginner' | 'intermediate' | 'advanced';
          category?: string;
          constraints?: string | null;
          starter_code?: string;
          test_cases?: any;
          expected_output?: string | null;
          time_estimate?: number;
          points?: number;
          is_published?: boolean;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_progress: {
        Row: {
          id: string;
          user_id: string;
          challenge_id: string;
          status: 'in_progress' | 'completed' | 'attempted';
          code: string;
          attempts: number;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          challenge_id: string;
          status?: 'in_progress' | 'completed' | 'attempted';
          code?: string;
          attempts?: number;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          challenge_id?: string;
          status?: 'in_progress' | 'completed' | 'attempted';
          code?: string;
          attempts?: number;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      pathways: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          category: string;
          total_challenges: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          category: string;
          total_challenges?: number;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          category?: string;
          total_challenges?: number;
          is_active?: boolean;
          created_at?: string;
        };
      };
      user_pathway_progress: {
        Row: {
          id: string;
          user_id: string;
          pathway_id: string;
          completed_challenges: number;
          started_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          pathway_id: string;
          completed_challenges?: number;
          started_at?: string;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          pathway_id?: string;
          completed_challenges?: number;
          started_at?: string;
          completed_at?: string | null;
        };
      };
    };
  };
};
