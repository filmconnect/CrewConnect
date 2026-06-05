import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SITE_GATE_COOKIE = "cc_site_access";
const CREW_PROTECTED = ["/dashboard"];
const PRODUCER_PROTECTED = ["/producers/home", "/producers/search", "/producers/saved", "/producers/bookings"];

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not set");
  return new TextEncoder().encode(secret);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Site-wide access gate ──
  // Active only when SITE_ACCESS_CODE is set in the environment. The matcher
  // already excludes /gate and static assets, so any request hitting this
  // function needs the cookie to match.
  const expectedCode = process.env.SITE_ACCESS_CODE;
  if (expectedCode) {
    const provided = request.cookies.get(SITE_GATE_COOKIE)?.value;
    if (provided !== expectedCode) {
      return NextResponse.redirect(new URL("/gate", request.url));
    }
  }

  // ── Crew protected routes ──
  const isCrewProtected = CREW_PROTECTED.some((p) => pathname.startsWith(p));
  if (isCrewProtected) {
    const token = request.cookies.get("cc_session")?.value;
    if (!token) {
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      await jwtVerify(token, getJwtSecret());
      return NextResponse.next();
    } catch {
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // ── Producer protected routes ──
  const isProducerProtected = PRODUCER_PROTECTED.some((p) => pathname.startsWith(p));
  if (isProducerProtected) {
    const token = request.cookies.get("cc_producer_session")?.value;
    if (!token) {
      return NextResponse.redirect(new URL("/producers/signin", request.url));
    }

    try {
      const { payload } = await jwtVerify(token, getJwtSecret());
      if (payload.type !== "producer") {
        return NextResponse.redirect(new URL("/producers/signin", request.url));
      }
      return NextResponse.next();
    } catch {
      return NextResponse.redirect(new URL("/producers/signin", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  // Run middleware on every path except the gate page itself, Next's internal
  // asset paths, and the common public files. The `.*\\..*` clause excludes
  // anything that contains a dot (so static files like /logo.png, /robots.txt
  // and /favicon.ico are served without going through the gate).
  matcher: [
    "/((?!gate|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)",
  ],
};
