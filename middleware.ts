import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Renova a sessão do Mestre e protege /admin.
// Visitantes (sem cookie de login) passam direto, sem nenhuma chamada extra ao Supabase.
export async function middleware(request: NextRequest) {
  const isAdmin = request.nextUrl.pathname.startsWith("/admin");
  const hasAuthCookie = request.cookies.getAll().some((c) => c.name.startsWith("sb-"));

  const toLogin = () => {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    return NextResponse.redirect(url);
  };

  if (!hasAuthCookie) return isAdmin ? toLogin() : NextResponse.next();

  try {
    let response = NextResponse.next({ request });
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => request.cookies.getAll(),
          setAll: (list) => {
            list.forEach(({ name, value }) => request.cookies.set(name, value));
            response = NextResponse.next({ request });
            list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
          },
        },
      }
    );
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (isAdmin && !user) return toLogin();
    return response;
  } catch {
    return isAdmin ? toLogin() : NextResponse.next();
  }
}

export const config = {
  matcher: ["/admin/:path*", "/capitulo/:path*", "/personagens", "/login", "/"],
};
