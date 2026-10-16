import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const createClient = (cookieStore: Awaited<ReturnType<typeof cookies>>) => {
  return createServerClient(
    supabaseUrl!,
    supabaseKey!,
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
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
};

// Pure anonymous Supabase client with zero session/cookie state for public digital business card queries.
// Reused as a singleton to allow HTTP/TLS keep-alive connection reuse across requests.
let globalAnonymousClient: any = null;

export const createAnonymousClient = () => {
  if (!globalAnonymousClient) {
    globalAnonymousClient = createSupabaseClient(supabaseUrl!, supabaseKey!, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }
  return globalAnonymousClient;
};

