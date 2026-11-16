"use client";

import { useState } from "react";
import { BD_LOCATIONS } from "@/data/bdLocations";
import { BD_DIVISIONS } from "@/lib/divisionMap";
import { ChevronRight, ChevronDown, MapPin, ShieldCheck, FileText } from "lucide-react";
import BiodataPrintModal from "./BiodataPrintModal";

const ROLE_DISPLAY = {
  union_admin: "Union Admin",
  upazila_admin: "Upazila Admin",
  district_admin: "Zila Admin",
  division_admin: "Division Admin",
};

function AdminDetailCard({ adm, onViewBio }) {
  return (
    <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200 text-xs flex flex-col justify-between gap-2.5">
      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <span className="font-bold text-gray-900 text-sm">{adm.name}</span>
          <span className="px-2 py-0.5 rounded bg-emerald-600 text-white text-[10px] font-bold shrink-0">
            {ROLE_DISPLAY[adm.role] || adm.role}
          </span>
        </div>

        {adm.customId && (
          <div className="inline-flex items-center gap-1.5 bg-white border border-emerald-200 px-2.5 py-0.5 rounded-full shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span className="text-[11px] font-mono font-bold tracking-wide text-slate-800">
              {adm.customId}
            </span>
          </div>
        )}

        <p className="text-gray-700 font-medium">
          📞 {adm.phone || "নম্বর নেই"}
        </p>
        {adm.email && <p className="text-gray-600">✉️ {adm.email}</p>}
        <p className="text-emerald-800 font-semibold flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5 shrink-0" />
          {[adm.union, adm.upazila, adm.district, adm.division]
            .filter(Boolean)
            .join(", ")}
        </p>
      </div>

      <button
        type="button"
        onClick={() => onViewBio(adm)}
        className="w-full py-1.5 px-3 bg-white hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-300 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
      >
        <FileText className="w-3.5 h-3.5" /> বায়োডাটা ও প্রিন্ট
      </button>
    </div>
  );
}

export default function AdminDirectoryBrowser({ users, currentAdmin }) {
  const [isOpen, setIsOpen] = useState(false);

  const isSuperAdmin =
    currentAdmin.role === "admin" || currentAdmin.role === "super_admin";

  const [drillDivision, setDrillDivision] = useState(
    isSuperAdmin ? "" : currentAdmin.division || "",
  );
  const [drillDistrict, setDrillDistrict] = useState(
    isSuperAdmin ? "" : currentAdmin.district || "",
  );
  const [drillUpazila, setDrillUpazila] = useState(
    isSuperAdmin ? "" : currentAdmin.upazila || "",
  );
  const [selectedBioUser, setSelectedBioUser] = useState(null);

  const divisionsList = Object.keys(BD_DIVISIONS);
  const allAdmins = users.filter((u) =>
    [
      "division_admin",
      "district_admin",
      "upazila_admin",
      "union_admin",
    ].includes(u.role),
  );

  const currentDivisionAdmins = allAdmins.filter(
    (a) =>
      a.role === "division_admin" &&
      (a.division === drillDivision ||
        (BD_DIVISIONS[drillDivision] || []).includes(a.district)),
  );

  const currentDistrictAdmins = allAdmins.filter(
    (a) => a.role === "district_admin" && a.district === drillDistrict,
  );

  const currentUpazilaAdmins = allAdmins.filter(
    (a) =>
      a.role === "upazila_admin" &&
      a.district === drillDistrict &&
      a.upazila === drillUpazila,
  );

  const currentUnionAdmins = allAdmins.filter(
    (a) =>
      a.role === "union_admin" &&
      a.district === drillDistrict &&
      a.upazila === drillUpazila,
  );

    return (
    <>
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs space-y-4">
        {/* ক্লিকেবল হেডার বার */}
        <div
          onClick={() => setIsOpen(!isOpen)}
          className={`flex flex-wrap items-center justify-between gap-2 cursor-pointer select-none ${
            isOpen ? "border-b pb-3" : ""
          }`}
        >
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-gray-800 text-sm">
              এলাকাভিত্তিক অ্যাডমিন ডিরেক্টরি (ক্লিক করে বিস্তারিত দেখুন)
            </h3>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-0.5">
              {isOpen ? (
                <>
                  বন্ধ করুন <ChevronDown className="w-3.5 h-3.5" />
                </>
              ) : (
                <>
                  খুলুন <ChevronRight className="w-3.5 h-3.5" />
                </>
              )}
            </span>
          </div>

          {isOpen && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="flex flex-wrap items-center gap-1.5 text-xs font-semibold"
            >
              {isSuperAdmin && (
                <button
                  onClick={() => {
                    setDrillDivision("");
                    setDrillDistrict("");
                    setDrillUpazila("");
                  }}
                  className={`px-2 py-1 rounded cursor-pointer ${
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
                      if (isSuperAdmin || !currentAdmin.district)
                        setDrillDistrict("");
                      if (isSuperAdmin || !currentAdmin.upazila)
                        setDrillUpazila("");
                    }}
                    className={`px-2 py-1 rounded cursor-pointer ${
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
                      if (isSuperAdmin || !currentAdmin.upazila)
                        setDrillUpazila("");
                    }}
                    className={`px-2 py-1 rounded cursor-pointer ${
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
          )}
        </div>

        {isOpen && (
          <>
            {/* ধাপ ১: সব বিভাগ */}
            {!drillDivision && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {divisionsList.map((div) => {
                  const divDistricts = BD_DIVISIONS[div] || [];
                  const count = allAdmins.filter(
                    (a) =>
                      a.division === div || divDistricts.includes(a.district),
                  ).length;
                  return (
                    <button
                      key={div}
                      onClick={() => setDrillDivision(div)}
                      className="p-3.5 rounded-xl border border-gray-200 hover:border-emerald-500 hover:bg-emerald-50/40 text-left transition cursor-pointer"
                    >
                      <p className="font-bold text-gray-800 text-sm">
                        {div} বিভাগ
                      </p>
                      <p className="text-xs text-emerald-700 font-semibold mt-1">
                        মোট অ্যাডমিন: {count} জন →
                      </p>
                    </button>
                  );
                })}
              </div>
            )}

            {/* ধাপ ২: বিভাগীয় অ্যাডমিন ডিটেইলস + জেলার তালিকা */}
            {drillDivision && !drillDistrict && (
              <div className="space-y-4">
                {currentDivisionAdmins.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-emerald-800">
                      🛡️ {drillDivision} বিভাগের বিভাগীয় অ্যাডমিন (Division Admin):
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {currentDivisionAdmins.map((adm) => (
                        <AdminDetailCard
                          key={adm._id}
                          adm={adm}
                          onViewBio={setSelectedBioUser}
                        />
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <p className="text-xs font-semibold text-gray-600 mb-2">
                    {drillDivision} বিভাগের জেলাসমূহ:
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {(BD_DIVISIONS[drillDivision] || []).map((dist) => {
                      const count = allAdmins.filter(
                        (a) => a.district === dist,
                      ).length;
                      const distAdmin = allAdmins.find(
                        (a) =>
                          a.district === dist && a.role === "district_admin",
                      );
                      return (
                        <button
                          key={dist}
                          onClick={() => setDrillDistrict(dist)}
                          className="p-3 rounded-xl border border-gray-200 hover:border-emerald-500 hover:bg-emerald-50/40 text-left transition cursor-pointer"
                        >
                          <p className="font-bold text-gray-800 text-sm">
                            {dist} জেলা
                          </p>
                          <p className="text-[11px] text-gray-500 truncate">
                            {distAdmin
                              ? `জেলা অ্যাডমিন: ${distAdmin.name}`
                              : "জেলা অ্যাডমিন নিয়োগ হয়নি"}
                          </p>
                          <p className="text-xs text-emerald-700 font-semibold mt-1">
                            মোট অ্যাডমিন: {count} জন →
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
            {/* ধাপ ৩: জেলা অ্যাডমিন ডিটেইলস + উপজেলার তালিকা */}
            {drillDistrict && !drillUpazila && (
              <div className="space-y-4">
                {currentDistrictAdmins.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-emerald-800">
                      🛡️ {drillDistrict} জেলার জেলা অ্যাডমিন (Zila Admin):
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {currentDistrictAdmins.map((adm) => (
                        <AdminDetailCard
                          key={adm._id}
                          adm={adm}
                          onViewBio={setSelectedBioUser}
                        />
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <p className="text-xs font-semibold text-gray-600 mb-2">
                    {drillDistrict} জেলার উপজেলাসমূহ:
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {Object.keys(BD_LOCATIONS[drillDistrict] || {}).map(
                      (upz) => {
                        const count = allAdmins.filter(
                          (a) =>
                            a.district === drillDistrict && a.upazila === upz,
                        ).length;
                        const upzAdmin = allAdmins.find(
                          (a) =>
                            a.district === drillDistrict &&
                            a.upazila === upz &&
                            a.role === "upazila_admin",
                        );
                        return (
                          <button
                            key={upz}
                            onClick={() => setDrillUpazila(upz)}
                            className="p-3 rounded-xl border border-gray-200 hover:border-emerald-500 hover:bg-emerald-50/40 text-left transition cursor-pointer"
                          >
                            <p className="font-bold text-gray-800 text-sm">
                              {upz} উপজেলা
                            </p>
                            <p className="text-[11px] text-gray-500 truncate">
                              {upzAdmin
                                ? `উপজেলা অ্যাডমিন: ${upzAdmin.name}`
                                : "উপজেলা অ্যাডমিন নেই"}
                            </p>
                            <p className="text-xs text-emerald-700 font-semibold mt-1">
                              মোট অ্যাডমিন: {count} জন →
                            </p>
                          </button>
                        );
                      },
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ধাপ ৪: উপজেলা ও ইউনিয়ন অ্যাডমিন ডিটেইলস */}
            {drillUpazila && (
              <div className="space-y-4">
                {currentUpazilaAdmins.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-emerald-800">
                      🛡️ {drillUpazila} উপজেলার উপজেলা অ্যাডমিন (Upazila Admin):
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {currentUpazilaAdmins.map((adm) => (
                        <AdminDetailCard
                          key={adm._id}
                          adm={adm}
                          onViewBio={setSelectedBioUser}
                        />
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <p className="text-xs font-bold text-gray-700">
                    📍 {drillUpazila} উপজেলার ইউনিয়ন অ্যাডমিনসমূহ (Union Admins):
                  </p>
                  {currentUnionAdmins.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {currentUnionAdmins.map((adm) => (
                        <AdminDetailCard
                          key={adm._id}
                          adm={adm}
                          onViewBio={setSelectedBioUser}
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 italic">
                      এই উপজেলায় এখনো কোনো ইউনিয়ন অ্যাডমিন নিয়োগ দেওয়া হয়নি।
                    </p>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {selectedBioUser && (
        <BiodataPrintModal
          user={selectedBioUser}
          onClose={() => setSelectedBioUser(null)}
        />
      )}
    </>
  );
}
