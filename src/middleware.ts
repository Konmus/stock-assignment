import { NextRequest, NextResponse } from "next/server";
import { auth } from "./lib/auth";
import { DEFAULT_REDIRECT, PUBLIC_ROUTES, ROOT } from "@/lib/route";
import { decode, JWTDecodeParams } from "next-auth/jwt";
import { decodeJwt } from "./lib/jwt";

export async function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const sessionCookie = req.cookies.get("authjs.session-token")?.value;
  if (!sessionCookie) {
    url.pathname = "login";
    return NextResponse.redirect(url);
  }

  const decodedSessionToken = await decodeJwt(sessionCookie);
  console.log(sessionCookie);

  if (!decodedSessionToken) {
    url.pathname = "login";
    return NextResponse.redirect(url);
  }

  if (req.nextUrl.pathname === "/") {
    url.pathname = "/overview";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|register|login|_next/static|_next/image|robots.txt|public|images|manifest.json|sw.js|favicon.ico|workbox-*).*)",
    "/",
  ],
};
