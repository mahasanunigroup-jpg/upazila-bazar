"use client";

import { useState } from "react";
import { BD_LOCATIONS } from "@/data/bdLocations";
import { BD_DIVISIONS } from "@/lib/divisionMap";
import { ChevronRight, MapPin, ShieldCheck } from "lucide-react";

const ROLE_DISPLAY = {
  union_admin: "Union Admin",
  upazila_admin: "Upazila Admin",
  district_admin: "Zila Admin",
  division_admin: "Division Admin",
};

export default function AdminDirectoryBrowser({ users, currentAdmin }) {
  const isSuperAdmin =
    currentAdmin.role === "admin" || currentAdmin.role === "super_admin";

  const [drillDivision, setDrillDivision] = useState(currentAdmin.division || "");
  const [drillDistrict, setDrillDistrict] = useState(currentAdmin.district || "");
  const [drillUpazila, setDrillUpazila] = useState(currentAdmin.upazila || "");

  const divisionsList = Object.keys(BD_DIVISIONS);
  const allAdmins = users.filter((u) =>
    ["division_admin", "district_admin", "upazila_admin", "union_admin"].includes(u.role)
  );

  return (
    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          <h3 className="font-bold text-gray-800 text-sm">
            এলাকাভিত্তিক অ্যাডমিন ডিরেক্টরি (ক্লিক করে বিস্তারিত দেখুন)
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
          {isSuperAdmin && (
            <button
              onClick={() => {
                setDrillDivision("");
                setDrillDistrict("");
                setDrillUpazila("");
              }}
              className={`px-2 py-1 rounded ${
                !drillDivision
                  ? "bg-emerald-600 text-white"
                  : "text-emerald-700 hover:bg-emerald-50"
              }`}
            >
              সকল বিভাগ
            </button>
          )}
          {drillDivision && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
              <button
                onClick={() => {
                  if (!currentAdmin.district) setDrillDistrict("");
                  if (!currentAdmin.upazila) setDrillUpazila("");
                }}
                className={`px-2 py-1 rounded ${
                  drillDivision && !drillDistrict
                    ? "bg-emerald-600 text-white"
                    : "text-emerald-700 hover:bg-emerald-50"
                }`}
              >
                {drillDivision}
              </button>
            </>
          )}
          {drillDistrict && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
              <button
                onClick={() => {
                  if (!currentAdmin.upazila) setDrillUpazila("");
                }}
                className={`px-2 py-1 rounded ${
                  drillDistrict && !drillUpazila
                    ? "bg-emerald-600 text-white"
                    : "text-emerald-700 hover:bg-emerald-50"
                }`}
              >
                {drillDistrict}
              </button>
            </>
          )}
          {drillUpazila && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
              <span className="px-2 py-1 rounded bg-emerald-600 text-white">
                {drillUpazila}
              </span>
            </>
          )}
        </div>
      </div>

      {!drillDivision && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {divisionsList.map((div) => {
            const divDistricts = BD_DIVISIONS[div] || [];
            const count = allAdmins.filter(
              (a) => a.division === div || divDistricts.includes(a.district)
            ).length;
            return (
              <button
                key={div}
                onClick={() => setDrillDivision(div)}
                className="p-3.5 rounded-xl border border-gray-200 hover:border-emerald-500 hover:bg-emerald-50/40 text-left transition cursor-pointer"
              >
                <p className="font-bold text-gray-800 text-sm">{div} বিভাগ</p>
                <p className="text-xs text-emerald-700 font-semibold mt-1">
                  মোট অ্যাডমিন: {count} জন →
                </p>
              </button>
            );
          })}
        </div>
      )}

      {drillDivision && !drillDistrict && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {(BD_DIVISIONS[drillDivision] || []).map((dist) => {
            const distAdmins = allAdmins.filter((a) => a.district === dist);
            const zilaHead = distAdmins.find((a) => a.role === "district_admin");
            return (
              <button
                key={dist}
                onClick={() => setDrillDistrict(dist)}
                className="p-3 rounded-xl border border-gray-200 hover:border-emerald-500 hover:bg-emerald-50/40 text-left transition cursor-pointer"
              >
                <p className="font-bold text-gray-800 text-sm">{dist} জেলা</p>
                <p className="text-[11px] text-gray-500 mt-0.5 truncate">
                  জেলা অ্যাডমিন: {zilaHead ? zilaHead.name : "নিয়োগ হয়নি"}
                </p>
                <p className="text-xs text-emerald-700 font-semibold mt-1">
                  মোট অ্যাডমিন: {distAdmins.length} জন →
                </p>
              </button>
            );
          })}
        </div>
      )}

      {drillDistrict && !drillUpazila && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {Object.keys(BD_LOCATIONS[drillDistrict] || {}).map((upz) => {
            const upzAdmins = allAdmins.filter(
              (a) => a.district === drillDistrict && a.upazila === upz
            );
            const upzHead = upzAdmins.find((a) => a.role === "upazila_admin");
            return (
              <button
                key={upz}
                onClick={() => setDrillUpazila(upz)}
                className="p-3.5 rounded-xl border border-gray-200 hover:border-emerald-500 hover:bg-emerald-50/40 text-left transition cursor-pointer"
              >
                <p className="font-bold text-gray-800 text-sm">{upz} উপজেলা</p>
                <p className="text-xs text-gray-600 mt-1">
                  উপজেলা অ্যাডমিন:{" "}
                  <span className="font-semibold text-gray-800">
                    {upzHead ? `${upzHead.name} (${upzHead.phone})` : "নিয়োগ হয়নি"}
                  </span>
                </p>
                <p className="text-xs text-emerald-700 font-semibold mt-1">
                  ইউনিয়ন অ্যাডমিনসহ মোট: {upzAdmins.length} জন →
                </p>
              </button>
            );
          })}
        </div>
      )}

      {drillUpazila && (
        <div className="space-y-2">
          <p className="text-xs font-bold text-gray-700">
            📍 {drillUpazila} উপজেলার ইউনিয়ন ও আঞ্চলিক অ্যাডমিন তালিকা:
          </p>
          {allAdmins.filter(
            (a) => a.district === drillDistrict && a.upazila === drillUpazila
          ).length === 0 ? (
            <p className="text-xs text-gray-500 py-3">
              এই উপজেলায় এখনো কোনো অ্যাডমিন নিয়োগ দেওয়া হয়নি।
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {allAdmins
                .filter(
                  (a) =>
                    a.district === drillDistrict && a.upazila === drillUpazila
                )
                .map((adm) => (
                  <div
                    key={adm._id}
                    className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-200 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-900 text-sm">
                        {adm.name}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-emerald-600 text-white text-[10px] font-bold">
                        {ROLE_DISPLAY[adm.role] || adm.role}
                      </span>
                    </div>
                    <p className="text-gray-700">📞 {adm.phone || "নম্বর নেই"}</p>
                    {adm.email && <p className="text-gray-600">✉️ {adm.email}</p>}
                    <p className="text-emerald-800 font-semibold flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {adm.union || adm.upazila}
                    </p>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
