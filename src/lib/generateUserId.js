const ROLE_PREFIX = {
  admin: "SUP",
  super_admin: "SUP",
  division_admin: "DIV",
  district_admin: "ZIL",
  upazila_admin: "UPZ",
  union_admin: "UNI",
  rider: "RID",
  seller: "SEL",
  customer: "CUS",
};

export function generateRoleUserId(role) {
  const prefix = ROLE_PREFIX[role] || "USR";
  const randomDigits = Math.floor(1000 + Math.random() * 9000); // ৪ ডিজিটের ইউনিক নম্বর
  return `UB-${prefix}-${randomDigits}`;
}

export function getDisplayUserId(user) {
  if (user?.customId) return user.customId;
  const prefix = ROLE_PREFIX[user?.role] || "USR";
  const tail = user?._id ? user._id.toString().slice(-4).toUpperCase() : "0000";
  return `UB-${prefix}-${tail}`;
}
