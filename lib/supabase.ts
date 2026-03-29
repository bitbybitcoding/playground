import { createBrowserClient } from '@supabase/ssr';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { createClient as createAdminClient } from '@supabase/supabase-js';

// Client-side Supabase client
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Server-side Supabase client (for Server Components)
export async function createServerSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing sessions.
          }
        },
      },
    }
  );
}

// Admin Supabase client (for server-side admin operations)
export function createAdminSupabaseClient() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

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
