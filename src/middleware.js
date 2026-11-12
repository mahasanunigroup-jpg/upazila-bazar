import { NextResponse } from "next/server";
import { verifyToken } from "./lib/auth";

export async function middleware(request) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  const user = token ? await verifyToken(token) : null;

  if (!user && (pathname.startsWith("/seller") || pathname.startsWith("/rider") || pathname.startsWith("/admin"))) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

   // রোল অনুযায়ী অ্যাক্সেস কন্ট্রোল
  if (pathname.startsWith("/seller") && user?.role !== "seller") {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }
  if (pathname.startsWith("/rider") && user?.role !== "rider") {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }
  if (pathname.startsWith("/admin") && user?.role !== "admin") {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }


  return NextResponse.next();
}

export const config = {
  matcher: ["/seller/:path*", "/rider/:path*", "/admin/:path*"],
};
