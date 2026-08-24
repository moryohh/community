import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Local storage key for cached session JWT
const ADMIN_JWT_STORAGE_KEY = 'iraq_community_admin_jwt';
const ADMIN_USER_STORAGE_KEY = 'iraq_community_admin_user';

let cachedSupabaseAClient: SupabaseClient | null = null;

export interface PublicAuthConfig {
  supabaseAUrl: string;
  supabaseAAnonKey: string;
}

/**
 * Fetch public Supabase A config (URL + Anon Key) from server safely
 */
export async function fetchPublicAuthConfig(): Promise<PublicAuthConfig> {
  try {
    const res = await fetch('/api/v1/auth/public-config');
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn('[Supabase A Public Config Fetch]:', e);
  }
  return { supabaseAUrl: '', supabaseAAnonKey: '' };
}

/**
 * Get or initialize Supabase A Client on client-side
 */
export async function getSupabaseAClient(): Promise<SupabaseClient | null> {
  if (cachedSupabaseAClient) return cachedSupabaseAClient;

  const config = await fetchPublicAuthConfig();
  if (config.supabaseAUrl && config.supabaseAAnonKey) {
    try {
      cachedSupabaseAClient = createClient(config.supabaseAUrl, config.supabaseAAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      });
      return cachedSupabaseAClient;
    } catch (err) {
      console.warn('[Initialize Supabase A Client Error]:', err);
    }
  }
  return null;
}

/**
 * Get active Supabase A Session Token (from client session or localStorage)
 */
export async function getSupabaseASessionToken(): Promise<string | null> {
  // 1. Check active Supabase client session
  const client = await getSupabaseAClient();
  if (client) {
    try {
      const { data: { session } } = await client.auth.getSession();
      if (session?.access_token) {
        setStoredAdminJwt(session.access_token);
        return session.access_token;
      }
    } catch (e) {
      console.warn('[Get Supabase A Session Error]:', e);
    }
  }

  // 2. Fallback to stored token in localStorage
  return getStoredAdminJwt();
}

export function getStoredAdminJwt(): string | null {
  try {
    return localStorage.getItem(ADMIN_JWT_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setStoredAdminJwt(jwt: string): void {
  try {
    localStorage.setItem(ADMIN_JWT_STORAGE_KEY, jwt.trim());
  } catch {}
}

export function removeStoredAdminJwt(): void {
  try {
    localStorage.removeItem(ADMIN_JWT_STORAGE_KEY);
    localStorage.removeItem(ADMIN_USER_STORAGE_KEY);
  } catch {}
}
