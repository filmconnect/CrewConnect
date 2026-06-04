import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const CREW_PROTECTED = ["/dashboard"];
const PRODUCER_PROTECTED = ["/producers/home", "/producers/search", "/producers/saved", "/producers/bookings"];

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not set");
  return new TextEncoder().encode(secret);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

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
  matcher: [
    "/dashboard/:path*",
    "/producers/home/:path*",
    "/producers/search/:path*",
    "/producers/saved/:path*",
    "/producers/bookings/:path*",
  ],
};
