import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  // For dashboard routes, check if user has auth cookies
  if (req.nextUrl.pathname.startsWith("/dashboard")) {
    const cookieNames = Array.from(req.cookies.getAll()).map((cookie) => cookie.name)
    const hasAuthCookie = cookieNames.some((name) => name.includes("auth-token") && !name.includes("api"))

    if (!hasAuthCookie) {
      console.log("No auth cookie found, redirecting to login")
      return NextResponse.redirect(new URL("/login", req.url))
    }
  }

  // For login/register pages, redirect to dashboard if has auth cookies
  if (req.nextUrl.pathname === "/login" || req.nextUrl.pathname === "/register") {
    const cookieNames = Array.from(req.cookies.getAll()).map((cookie) => cookie.name)
    const hasAuthCookie = cookieNames.some((name) => name.includes("auth-token") && !name.includes("api"))

    if (hasAuthCookie) {
      console.log("Auth cookie found, redirecting to dashboard")
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register"],
}
