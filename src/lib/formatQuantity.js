export function formatOrderItemQuantity(item) {
  // যদি ইতিমধ্যে কাস্টম লেবেল (যেমন: "১০ পিস", "৫০০ গ্রাম") সেভ করা থাকে
  if (item.unitLabel) return item.unitLabel;

  const qty = Number(item.quantity) || 0;
  const title = (item.title || "").toLowerCase();
  const isBox =
    item.sellingType === "box" ||
    title.includes("বক্স") ||
    title.includes("(box)");

  if (isBox) {
    const perBox = item.piecesPerBox > 0 ? item.piecesPerBox : 100;
    if (qty > 0 && qty < 1) {
      return `${Math.round(qty * perBox)} পিস`;
    }
    return `${qty} বক্স`;
  }

  const isPiece =
    item.sellingType === "piece" ||
    item.sellingType === "packet" ||
    title.includes("পিস") ||
    title.includes("টি");

  if (isPiece) {
    return `${qty} টি`;
  }

  // ওজনভিত্তিক পণ্য (কেজি / গ্রাম)
  if (qty > 0 && qty < 1) {
    return `${Math.round(qty * 1000)} গ্রাম`;
  }
  return `${qty} কেজি`;
}
