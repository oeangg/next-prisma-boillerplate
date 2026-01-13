import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // const hasSession =
  //   request.cookies.has("better-auth.session_token") ||
  //   request.cookies.has("__Secure-better-auth.session_token");
  const allCookies = request.cookies.getAll();
  const sessionCookie = allCookies.find((c) =>
    c.name.includes("session_token"),
  );

  const hasSession = !!sessionCookie;

  if (pathname.startsWith("/dashboard") && !hasSession) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  if (
    (pathname.startsWith("/sign-in") || pathname.startsWith("/sign-up")) &&
    hasSession
  ) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/v/:path*", "/", "/sign-in", "/sign-up"],
};
