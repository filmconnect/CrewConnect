import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const PROTECTED_PATHS = ["/dashboard"];

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not set");
  return new TextEncoder().encode(secret);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  const token = request.cookies.get("cc_session")?.value;
  if (!token) {
    console.info(`[middleware] no session token, redirecting to login from ${pathname}`);
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    await jwtVerify(token, getJwtSecret());
    return NextResponse.next();
  } catch (err) {
    console.warn(`[middleware] invalid/expired token for ${pathname}`, err);
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
