// src/components/seller/SellerCashReceiveClient.jsx
'use client';

import { useState, useRef } from 'react';

export default function SellerCashReceiveClient({ initialRecords }) {
  const [records, setRecords] = useState(initialRecords);
  const [activeItem, setActiveItem] = useState(null);
  const [loading, setLoading] = useState(false);

  // HTML5 Canvas সিগনেচার রেফারেন্স
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSigned, setHasSigned] = useState(false);

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#111827';
    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
    setIsDrawing(true);
    setHasSigned(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSigned(false);
  };

  const handleApproveWithSignature = async () => {
    if (!hasSigned) {
      alert('অনুগ্রহ করে বক্সের ভেতরে আপনার সিগনেচার দিন।');
      return;
    }

    const signatureDataUrl = canvasRef.current.toDataURL('image/png');
    setLoading(true);

    try {
      const res = await fetch('/api/rider/cash-handover', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          handoverId: activeItem._id,
          action: 'seller_approve',
          sellerSignature: signatureDataUrl,
        }),
      });

      const result = await res.json();
      if (result.success) {
        setRecords((prev) =>
          prev.map((item) =>
            item._id === activeItem._id
              ? { ...item, status: 'seller_approved', sellerSignature: signatureDataUrl }
              : item
          )
        );
        setActiveItem(null);
        alert(result.message);
      } else {
        alert(result.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-6">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b bg-gray-50 text-xs text-gray-500 uppercase">
              <th className="py-3 px-4">তারিখ ও রাইডার</th>
              <th className="py-3 px-4">নোট</th>
              <th className="py-3 px-4">পরিমাণ</th>
              <th className="py-3 px-4">স্ট্যাটাস</th>
              <th className="py-3 px-4 text-right">অ্যাকশন</th>
            </tr>
          </thead>
          <tbody className="divide-y text-sm">
            {records.map((item) => (
              <tr key={item._id} className="hover:bg-gray-50">
                <td className="py-3.5 px-4">
                  <p className="font-semibold text-gray-900">{item.riderName}</p>
                  <p className="text-xs text-gray-500">{item.createdAt}</p>
                </td>
                <td className="py-3.5 px-4 text-xs text-gray-600">{item.referenceNote}</td>
                <td className="py-3.5 px-4 font-bold text-gray-900 text-base">৳{item.amount.toLocaleString()}</td>
                <td className="py-3.5 px-4">
                  {item.status === 'pending_seller' && (
                    <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-2.5 py-1 rounded-full">
                      আপনার সিগনেচার প্রয়োজন
                    </span>
                  )}
                  {item.status === 'seller_approved' && (
                    <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-1 rounded-full">
                      অ্যাডমিন ভেরিফিকেশনে আছে
                    </span>
                  )}
                  {item.status === 'admin_verified' && (
                    <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-1 rounded-full">
                      সম্পন্ন (Verified)
                    </span>
                  )}
                </td>
                <td className="py-3.5 px-4 text-right">
                  {item.status === 'pending_seller' ? (
                    <button
                      onClick={() => {
                        setActiveItem(item);
                        setHasSigned(false);
                      }}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3.5 py-2 rounded-lg transition"
                    >
                      ✍️ সিগনেচার ও Approve
                    </button>
                  ) : (
                    <span className="text-xs text-gray-400">অনুমোদিত</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ডিজিটাল সিগনেচার মডাল */}
      {activeItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900">ক্যাশ রিসিভ ও ডিজিটাল সিগনেচার</h3>
            <p className="text-xs text-gray-600 mt-1">
              রাইডার <strong>{activeItem.riderName}</strong>-এর কাছ থেকে <strong>৳{activeItem.amount}</strong> বুঝে পেয়ে নিচের বক্সে সিগনেচার দিন।
            </p>

            <div className="mt-4">
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-gray-700">এখানে সিগনেচার আঁকুন:</label>
                <button type="button" onClick={clearSignature} className="text-xs text-red-600 hover:underline">
                  মুছে ফেলুন (Clear)
                </button>
              </div>
              <canvas
                ref={canvasRef}
                width={360}
                height={140}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="w-full h-36 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 touch-none cursor-crosshair"
              />
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setActiveItem(null)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 bg-gray-100 rounded-lg"
              >
                বাতিল
              </button>
              <button
                disabled={loading}
                onClick={handleApproveWithSignature}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg"
              >
                {loading ? 'সেভ হচ্ছে...' : 'সিগনেচার কনফার্ম ও Approve'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
