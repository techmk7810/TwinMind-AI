import { NextResponse, type NextRequest } from "next/server";

const protectedRoutes = ["/dashboard"];
const refreshTokenCookieName =
  process.env.REFRESH_TOKEN_COOKIE_NAME ?? "tm_refresh_token";

export function middleware(request: NextRequest) {
  const isProtectedRoute = protectedRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route),
  );

  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  const hasRefreshCookie = request.cookies.has(refreshTokenCookieName);
  if (!hasRefreshCookie) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
