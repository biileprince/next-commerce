import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Edge-level protection for admin routes
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if this is an admin route
  if (pathname.startsWith("/admin")) {
    // Get session token from cookies (Better Auth uses this cookie name)
    const sessionToken =
      request.cookies.get("better-auth.session_token")?.value ||
      request.cookies.get("__Secure-better-auth.session_token")?.value;

    // If no session token, redirect to sign in
    if (!sessionToken) {
      const signInUrl = new URL("/sign-in", request.url);
      signInUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(signInUrl);
    }

    // Note: Full role verification happens at the page level via requireAdmin()
    // Edge middleware cannot query the database, so we only check for session existence
    // The requireAdmin() middleware in lib/middleware/admin.ts provides complete protection
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
