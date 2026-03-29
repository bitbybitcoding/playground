#!/bin/bash
# bbbplayground-fixes.sh
# Run from the root of the bbbplayground repo:
#   chmod +x bbbplayground-fixes.sh && ./bbbplayground-fixes.sh

set -e
echo "==> Applying bbbplayground Vercel build fixes..."

# ─────────────────────────────────────────────
# 1. Create lib/supabase/client.ts
# ─────────────────────────────────────────────
mkdir -p lib/supabase
cat > lib/supabase/client.ts << 'ENDOFFILE'
import { createBrowserClient } from '@supabase/ssr';

// Client-side Supabase client — safe to import in Client Components
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
ENDOFFILE
echo "  [OK] lib/supabase/client.ts created"

# ─────────────────────────────────────────────
# 2. Create lib/supabase/server.ts
# ─────────────────────────────────────────────
cat > lib/supabase/server.ts << 'ENDOFFILE'
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { createClient as createAdminClient } from '@supabase/supabase-js';

// Server-side Supabase client (Server Components only)
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
            // Called from a Server Component — safe to ignore.
          }
        },
      },
    }
  );
}

// Admin Supabase client (service role, server-side only)
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
ENDOFFILE
echo "  [OK] lib/supabase/server.ts created"

# ─────────────────────────────────────────────
# 3. Rewrite lib/supabase.ts as a re-export barrel
#    (preserves the Types block below)
# ─────────────────────────────────────────────
# Extract just the Types section from the existing file
TYPES_BLOCK=$(sed -n '/^\/\/ Types/,$p' lib/supabase.ts)

cat > lib/supabase.ts << ENDOFFILE
// Re-export from split modules for backward compatibility.
// Client Components: import from '@/lib/supabase/client'
// Server Components: import from '@/lib/supabase/server'
export { createClient } from '@/lib/supabase/client';
export { createServerSupabaseClient, createAdminSupabaseClient } from '@/lib/supabase/server';

${TYPES_BLOCK}
ENDOFFILE
echo "  [OK] lib/supabase.ts rewritten as re-export barrel (Types block preserved)"

# ─────────────────────────────────────────────
# 4. next.config.mjs — add webpack externals block
# ─────────────────────────────────────────────
# Insert after the serverExternalPackages line
sed -i "s/  serverExternalPackages: \['pyodide'\],/  serverExternalPackages: ['pyodide'],\n  webpack: (config, { isServer }) => {\n    if (isServer) {\n      config.externals = [...(config.externals || []), 'pyodide'];\n    }\n    config.resolve = config.resolve || {};\n    config.resolve.fallback = { ...(config.resolve.fallback || {}), fs: false, path: false };\n    return config;\n  },/" next.config.mjs
echo "  [OK] next.config.mjs updated with webpack externals"

# ─────────────────────────────────────────────
# 5. components/TopNavBar.tsx — fix import
# ─────────────────────────────────────────────
sed -i "s|import { createClient } from '@/lib/supabase';|import { createClient } from '@/lib/supabase/client';|" components/TopNavBar.tsx
echo "  [OK] components/TopNavBar.tsx import fixed"

# ─────────────────────────────────────────────
# 6. app/workspace/page.tsx — fix import
# ─────────────────────────────────────────────
sed -i "s|import { createServerSupabaseClient } from '@/lib/supabase';|import { createServerSupabaseClient } from '@/lib/supabase/server';|" app/workspace/page.tsx
echo "  [OK] app/workspace/page.tsx import fixed"

# ─────────────────────────────────────────────
# 7. app/editor/[id]/page.tsx — fix 3 things
# ─────────────────────────────────────────────
# 7a. Fix supabase import
sed -i "s|import { createClient } from '@/lib/supabase';|import { createClient } from '@/lib/supabase/client';|" "app/editor/[id]/page.tsx"

# 7b. Fix error: any catch block
sed -i "s|const errLine = \`Error: \${error.message || 'Unknown error'}\`;|const errLine = \`Error: \${error instanceof Error ? error.message : 'Unknown error'}\`;|" "app/editor/[id]/page.tsx"

# 7c. Add eslint-disable comment to useEffect deps
sed -i "s|  }, \[challengeId\]);$|  }, [challengeId]); // eslint-disable-line react-hooks/exhaustive-deps|" "app/editor/[id]/page.tsx"

echo "  [OK] app/editor/[id]/page.tsx — import, error handler, and eslint comment fixed"

echo ""
echo "==> All fixes applied successfully!"
echo "    Next steps:"
echo "    1. git add -A && git diff --staged   (review changes)"
echo "    2. Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in Vercel"
echo "    3. git commit -m 'fix: resolve Vercel build failures' && git push"