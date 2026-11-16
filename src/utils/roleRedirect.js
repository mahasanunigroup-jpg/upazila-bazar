// src/utils/roleRedirect.js

export const ROLE_ROUTES = {
  // সাধারণ ইউজার রোল
  customer: '/orders',
  seller: '/seller/dashboard',
  rider: '/rider/dashboard',

  // ৫-স্তরের অ্যাডমিন রোল (আপনার ফোল্ডার স্ট্রাকচার অনুযায়ী)
  super_admin: '/admin',
  division_admin: '/admin/division',
  district_admin: '/admin/district',
  upazila_admin: '/admin/upazila',
  union_admin: '/admin/union',
  
  // ব্যাকআপ সাধারণ admin রোল
  admin: '/admin', 
};

export function getRedirectPathByRole(role) {
  return ROLE_ROUTES[role] || '/';
}
