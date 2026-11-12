// src/middleware.js
import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET || 'your-super-secret-key');

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // ১. সাধারণ হোমপেজে সরাসরি অ্যাক্সেস দেওয়া
  if (pathname === '/') {
    return NextResponse.next();
  }

  // 🚀 ২. রোল অনুযায়ী নির্দিষ্ট কুকি টোকেন রিড করা
  const customerToken = request.cookies.get('customer_token')?.value;
  const sellerToken = request.cookies.get('seller_token')?.value;
  const riderToken = request.cookies.get('rider_token')?.value;

  // ৩. কাস্টমার রাউট প্রোটেকশন (/orders)
  if (pathname.startsWith('/orders')) {
    if (!customerToken) return NextResponse.redirect(new URL('/login', request.url));
    try {
      const { payload } = await jwtVerify(customerToken, SECRET_KEY);
      if (payload.role !== 'customer') return NextResponse.redirect(new URL('/unauthorized', request.url));
    } catch {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // ৪. সেলার রাউট প্রোটেকশন (/seller)
  if (pathname.startsWith('/seller')) {
    if (!sellerToken) return NextResponse.redirect(new URL('/login', request.url));
    try {
      const { payload } = await jwtVerify(sellerToken, SECRET_KEY);
      if (payload.role !== 'seller') return NextResponse.redirect(new URL('/unauthorized', request.url));
    } catch {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // ৫. রাইডার রাউট প্রোটেকশন (/rider)
  if (pathname.startsWith('/rider')) {
    if (!riderToken) return NextResponse.redirect(new URL('/login', request.url));
    try {
      const { payload } = await jwtVerify(riderToken, SECRET_KEY);
      if (payload.role !== 'rider') return NextResponse.redirect(new URL('/unauthorized', request.url));
    } catch {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/orders/:path*', '/seller/:path*', '/rider/:path*'],
};
