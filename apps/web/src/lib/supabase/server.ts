import {
  createServerClient as createServerClientSSR,
  type CookieOptions,
} from "@supabase/ssr";

export const createServerClient = async () => {
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();

  return createServerClientSSR(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(
          cookiesToSet: {
            name: string;
            value: string;
            options: CookieOptions;
          }[],
        ) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Server Components can't set cookies — this is expected.
          }
        },
      },
    },
  );
};
