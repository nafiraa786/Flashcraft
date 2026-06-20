import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

// Server-side Supabase client
export function createServerSupabaseClient() {
  const cookieStore = cookies();

  return createClient(
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
            // Handle cookie setting errors
          }
        },
      },
    }
  );
}

// Get authenticated user from server
export async function getServerUser() {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

// Get user from server (with error handling)
export async function getServerUserOrThrow() {
  const user = await getServerUser();
  if (!user) {
    throw new Error("Unauthorized: No user session found");
  }
  return user;
}

// Validate auth token from API request
export async function validateAuthToken(authHeader?: string) {
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.slice(7);
  const supabase = createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser(token);

  return user;
}
