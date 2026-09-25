import { NextResponse, type NextRequest } from "next/server";

const PROTECTED_PREFIXES = ["/student", "/employee", "/admin"] as const;

/** Decode a JWT payload without verification (edge runtime, inspection only). */
function readRole(token: string | undefined): string | null {
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    return typeof payload.role === "string" ? payload.role : null;
  } catch {
    return null;
  }
}

/** Only same-origin relative paths allowed as redirect targets. */
function safeNext(raw: string | null): string | null {
  if (!raw) return null;
  if (!raw.startsWith("/") || raw.startsWith("//") || raw.includes("://")) return null;
  return raw;
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get("eduglobal_token")?.value;
  const { pathname } = request.nextUrl;
  const role = readRole(token);
  const roleHome = role === "admin" ? "/admin" : role === "employee" ? "/employee" : "/student";

  if (PROTECTED_PREFIXES.some((p) => pathname.startsWith(p)) && !token) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // Logged-in users skip the login page — land on their own dashboard.
  if (pathname === "/login" && token) {
    const url = request.nextUrl.clone();
    const next = safeNext(request.nextUrl.searchParams.get("next"));
    // Honor ?next= only for the user's own portal; otherwise go to their home.
    const allowed =
      next && (next === roleHome || next.startsWith(`/${role}`)) ? next : roleHome;
    url.pathname = allowed;
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/student/:path*", "/employee/:path*", "/admin/:path*", "/login"],
};
