/**
 * Hand-written types matching supabase/migrations/0001_init.sql.
 *
 * Once the migration has run against a real project, replace this file
 * with the generated one:
 *   npx supabase gen types typescript --project-id <ref> > src/lib/supabase/types.ts
 */

export type SubscriptionTier = "free" | "pro" | "agency";

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  github_username: string | null;
  github_access_token: string | null;
  created_at: string;
};

export type UserSubscription = {
  id: string;
  user_id: string;
  tier: SubscriptionTier;
  credit_balance: number;
  rollover_credits: number;
  credits_expire_at: string | null;
  updated_at: string;
};

export type Project = {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  github_repo_name: string | null;
  github_repo_owner: string | null;
  github_default_branch: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
};

export type ModelTier = "fast" | "deep";

export type GenerationLog = {
  id: string;
  project_id: string;
  user_id: string;
  prompt: string;
  model_tier: ModelTier | null;
  credits_deducted: number;
  code_guard_passed: boolean;
  error_details: string | null;
  commit_hash: string | null;
  created_at: string;
};

// Matches @supabase/postgrest-js's GenericTable exactly — Row, Insert,
// Update and Relationships are all required keys, or the typed client
// silently degrades every query result to `never` instead of erroring.
type TableDef<Row, Insert, Update = Partial<Insert>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      profiles: TableDef<
        Profile,
        Pick<Profile, "id" | "email"> & Partial<Omit<Profile, "id" | "email" | "created_at">>
      >;
      user_subscriptions: TableDef<
        UserSubscription,
        Pick<UserSubscription, "user_id"> &
          Partial<Omit<UserSubscription, "id" | "user_id" | "updated_at">>
      >;
      projects: TableDef<
        Project,
        Pick<Project, "owner_id" | "name" | "slug"> &
          Partial<Omit<Project, "id" | "owner_id" | "name" | "slug" | "created_at" | "updated_at">>
      >;
      generation_logs: TableDef<
        GenerationLog,
        Omit<GenerationLog, "id" | "created_at"> & { id?: string }
      >;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
};
