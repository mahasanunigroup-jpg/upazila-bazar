// প্রতিটি অ্যাডমিন তার নিচের কোন কোন রোল তৈরি ও কন্ট্রোল করতে পারবেন
export const MANAGEABLE_ROLES = {
  admin: ["division_admin", "district_admin", "upazila_admin", "union_admin", "seller", "rider"],
  super_admin: ["division_admin", "district_admin", "upazila_admin", "union_admin", "seller", "rider"],
  division_admin: ["district_admin", "upazila_admin", "union_admin", "seller", "rider"],
  district_admin: ["upazila_admin", "union_admin", "seller", "rider"],
  upazila_admin: ["union_admin", "seller", "rider"],
  union_admin: ["seller", "rider"],
};

// অ্যাডমিনের রোল অনুযায়ী তার নিজস্ব ড্যাশবোর্ড রুট
export function getAdminHomeRoute(role) {
  switch (role) {
    case "admin":
    case "super_admin":
      return "/admin";
    case "division_admin":
      return "/admin/division";
    case "district_admin":
      return "/admin/district";
    case "upazila_admin":
      return "/admin/upazila";
    case "union_admin":
      return "/admin/union";
    default:
      return "/login";
  }
}

// MongoDB কুয়েরি ফিল্টার: Super Admin সব ডাটা পাবেন, অন্যরা শুধু নিজ এলাকার ডাটা পাবেন
export function buildLocationScope(adminUser) {
  if (!adminUser) return { _id: null };

  switch (adminUser.role) {
    case "admin":
    case "super_admin":
      return {}; // মেইন অ্যাডমিন: সারা দেশের সব ডাটা

    case "division_admin":
      return adminUser.division ? { division: adminUser.division } : { _id: null };

    case "district_admin":
      return adminUser.district ? { district: adminUser.district } : { _id: null };

    case "upazila_admin":
      return adminUser.district && adminUser.upazila
        ? { district: adminUser.district, upazila: adminUser.upazila }
        : { _id: null };

    case "union_admin":
      return adminUser.district && adminUser.upazila && adminUser.union
        ? {
            district: adminUser.district,
            upazila: adminUser.upazila,
            union: adminUser.union,
          }
        : { _id: null };

    default:
      return { _id: null };
  }
}
