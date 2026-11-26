"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import CustomerOrderCard from "@/components/orders/CustomerOrderCard";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openOrderId, setOpenOrderId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  useEffect(() => {
    const updatePerPage = () => {
      const w = window.innerWidth;
      if (w >= 1024) setItemsPerPage(8);
      else if (w >= 640) setItemsPerPage(6);
      else setItemsPerPage(5);
    };
    updatePerPage();
    window.addEventListener("resize", updatePerPage);
    return () => window.removeEventListener("resize", updatePerPage);
  }, []);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await fetch("/api/orders", { cache: "no-store" });
        const data = await res.json();
        if (data.success) {
          const list = data.orders || [];
          setOrders(list);
          if (list.length > 0) setOpenOrderId(list[0].id);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  const totalPages = Math.max(1, Math.ceil(orders.length / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages);

  const paginatedOrders = useMemo(() => {
    const start = (safePage - 1) * itemsPerPage;
    return orders.slice(start, start + itemsPerPage);
  }, [orders, safePage, itemsPerPage]);

  const pageNumbers = useMemo(() => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (safePage <= 3) return [1, 2, 3, 4, "...", totalPages];
    if (safePage >= totalPages - 2) {
      return [1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, "...", safePage - 1, safePage, safePage + 1, "...", totalPages];
  }, [totalPages, safePage]);

  const handlePageChange = (page) => {
    if (typeof page !== "number" || page < 1 || page > totalPages) return;
    setCurrentPage(page);
    const firstOnPage = orders[(page - 1) * itemsPerPage];
    if (firstOnPage) setOpenOrderId(firstOnPage.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleFeedbackSaved = (orderId, savedFeedback) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, feedback: savedFeedback } : o))
    );
  };

  if (loading) {
    return (
      <div className="w-full max-w-lg sm:max-w-2xl md:max-w-3xl lg:max-w-4xl mx-auto py-6 px-3 sm:px-6 space-y-3 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-48" />
        <div className="h-36 bg-white rounded-xl border p-4" />
        <div className="h-16 bg-white rounded-xl border p-4" />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gray-50 py-5 sm:py-8 md:py-10 px-3 sm:px-6">
      <div className="w-full max-w-lg sm:max-w-2xl md:max-w-3xl lg:max-w-4xl mx-auto transition-all">
        <div className="mb-3">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm md:text-base font-bold text-gray-600 hover:text-green-600 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
            <span>হোম পেজে ফিরুন</span>
          </Link>
        </div>

        <div className="flex items-center justify-between mb-4 sm:mb-5">
          <h1 className="text-base sm:text-xl md:text-2xl lg:text-3xl font-extrabold text-gray-800">
            আমার অর্ডার সমূহ
          </h1>
          <span className="text-[11px] sm:text-xs md:text-sm font-bold text-gray-600 bg-white px-3 py-1 md:px-4 md:py-1.5 rounded-full border border-gray-200">
            মোট {orders.length} টি
          </span>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-xl border p-8 text-center text-xs sm:text-sm md:text-base text-gray-500">
            আপনার এখনো কোনো অর্ডার নেই।
          </div>
        ) : (
          <>
            <div className="space-y-3 sm:space-y-4">
              {paginatedOrders.map((order) => (
                <CustomerOrderCard
                  key={order.id}
                  order={order}
                  isCardOpen={openOrderId === order.id}
                  onToggleCard={() =>
                    setOpenOrderId((prev) => (prev === order.id ? null : order.id))
                  }
                  onFeedbackSaved={handleFeedbackSaved}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-center gap-1.5 sm:gap-2 flex-wrap">
                <button
                  type="button"
                  disabled={safePage === 1}
                  onClick={() => handlePageChange(safePage - 1)}
                  className="p-1.5 sm:p-2 md:p-2.5 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-emerald-50 disabled:opacity-40 cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                </button>

                {pageNumbers.map((num, idx) =>
                  num === "..." ? (
                    <span key={`dots-${idx}`} className="px-1.5 text-xs sm:text-sm text-gray-400">
                      ...
                    </span>
                  ) : (
                    <button
                      key={num}
                      type="button"
                      onClick={() => handlePageChange(num)}
                      className={`min-w-[30px] sm:min-w-[36px] md:min-w-[40px] h-7 sm:h-9 md:h-10 px-2.5 rounded-lg text-xs sm:text-sm md:text-base font-bold transition cursor-pointer ${
                        safePage === num
                          ? "bg-emerald-600 text-white shadow-2xs"
                          : "bg-white border border-gray-200 text-gray-700 hover:bg-emerald-50"
                      }`}
                    >
                      {num}
                    </button>
                  )
                )}

                <button
                  type="button"
                  disabled={safePage === totalPages}
                  onClick={() => handlePageChange(safePage + 1)}
                  className="p-1.5 sm:p-2 md:p-2.5 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-emerald-50 disabled:opacity-40 cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
