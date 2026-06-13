export interface Env {
  VITE_SUPABASE_URL?: string;
  VITE_SUPABASE_ANON_KEY?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  ADMIN_GITHUB_USERNAMES?: string;
}

export type Fetcher = typeof fetch;

export interface ApiErrorBody {
  ok: false;
  error: {
    code: string;
    message: string;
  };
}

export interface ApiOkBody<T> {
  ok: true;
  data: T;
}

export type AdminResult =
  | { ok: true; githubUsername: string; user: unknown }
  | { ok: false; response: Response };

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  serviceRoleKey: string;
}
