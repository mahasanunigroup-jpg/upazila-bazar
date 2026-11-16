// src/middleware.js
import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { ROLE_ROUTES } from './utils/roleRedirect';

const ADMIN_ROLES = [
  'super_admin',
  'division_admin',
  'district_admin',
  'upazila_admin',
  'union_admin',
  'admin'
  
];

// এই কমন পেজগুলোতে সব স্তরের অ্যাডমিন ঢুকতে পারবে (তাদের নিজস্ব এলাকার ডাটা দেখার জন্য)
const SHARED_ADMIN_PATHS = [
  '/admin/orders',
  '/admin/users',
  '/admin/products',
   '/admin/finance',
];

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('token')?.value;

  if (pathname.startsWith('/admin')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      const { payload } = await jwtVerify(token, secret);
      const userRole = payload.role;

      if (!ADMIN_ROLES.includes(userRole)) {
        return NextResponse.redirect(new URL('/', request.url));
      }

      // ১. সুপার অ্যাডমিন সব পেজে ঢুকতে পারবে
      if (userRole === 'super_admin' || userRole === 'admin') {
        return NextResponse.next();
      }

      // ২. কমন ম্যানেজমেন্ট পেজগুলোতে (orders, users, products) ঢুকতে পারবে
      const isSharedPath = SHARED_ADMIN_PATHS.some((path) => pathname.startsWith(path));
      if (isSharedPath) {
        return NextResponse.next();
      }

      // ৩. বাকি ক্ষেত্রে শুধু নিজের স্তরের ড্যাশবোর্ডে থাকতে পারবে
      const allowedDashboard = ROLE_ROUTES[userRole];
      if (allowedDashboard && !pathname.startsWith(allowedDashboard)) {
        return NextResponse.redirect(new URL(allowedDashboard, request.url));
      }

    } catch (error) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
