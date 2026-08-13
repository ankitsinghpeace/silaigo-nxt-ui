import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const imageToBase64 = (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(img, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = reject;
    img.src = url;
  });
};

interface CustomerInfo {
  name: string;
  phone?: string;
}

/**
 * A single, well-organised multi-order PDF for a customer — one section
 * per order (style/customisations, measurements, payment) plus a combined
 * order summary table at the top. Used from the admin Orders > Customer
 * View modal to export everything for a customer in one document.
 */
export const downloadCustomerOrdersPDF = async (
  customer: CustomerInfo,
  orderDetails: any[],
) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const left = 15;
  let y = 15;

  let logoBase64: string | null = null;
  try {
    logoBase64 = await imageToBase64("/invoice_cover.png");
  } catch {
    logoBase64 = null;
  }

  if (logoBase64) {
    doc.addImage(logoBase64, "PNG", (pageWidth - 90) / 2, y, 90, 22);
    y += 28;
  }

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(`Order Summary — ${customer.name}`, left, y);
  y += 6;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(90);
  doc.text(
    `${customer.phone || ""}  ·  Generated on ${new Date().toLocaleDateString()}  ·  ${orderDetails.length} order(s)`,
    left,
    y,
  );
  doc.setTextColor(0);
  y += 8;

  const grandTotal = orderDetails.reduce(
    (sum, d) => sum + (d?.priceBreakup?.total || 0),
    0,
  );

  autoTable(doc, {
    startY: y,
    head: [["Order ID", "Product", "Delivery Date", "Status", "Amount"]],
    body: orderDetails.map((d) => [
      d?.order?._id?.slice(-8)?.toUpperCase() || "—",
      d?.style?.name || "—",
      d?.appointment?.date
        ? new Date(d.appointment.date).toLocaleDateString()
        : "—",
      d?.order?.status || "—",
      `Rs. ${Number(d?.priceBreakup?.total || 0).toLocaleString()}`,
    ]),
    foot: [["", "", "", "Grand Total", `Rs. ${grandTotal.toLocaleString()}`]],
    headStyles: { fillColor: [29, 126, 149] },
    footStyles: { fillColor: [237, 246, 248], textColor: [0, 0, 0], fontStyle: "bold" },
    styles: { fontSize: 9 },
    margin: { left, right: left },
  });

  y = (doc as any).lastAutoTable.finalY + 12;

  orderDetails.forEach((detail, index) => {
    if (y > doc.internal.pageSize.getHeight() - 60) {
      doc.addPage();
      y = 15;
    }

    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(29, 126, 149);
    doc.text(
      `Order ${index + 1} — ${detail?.style?.name || detail?.order?._id || ""}`,
      left,
      y,
    );
    doc.setTextColor(0);
    y += 5;

    const customizations = detail?.priceBreakup?.customizations || [];
    if (customizations.length > 0) {
      autoTable(doc, {
        startY: y,
        head: [["Customisation", "Price"]],
        body: customizations.map((c: any) => [
          c.title || "—",
          `Rs. ${Number(c.price || 0).toLocaleString()}`,
        ]),
        headStyles: { fillColor: [212, 175, 55], textColor: [0, 0, 0] },
        styles: { fontSize: 9 },
        margin: { left, right: left },
      });
      y = (doc as any).lastAutoTable.finalY + 6;
    }

    const measurements = detail?.measurements?.bodyMeasurement || {};
    const measurementEntries = Object.entries(measurements);
    if (measurementEntries.length > 0) {
      if (y > doc.internal.pageSize.getHeight() - 40) {
        doc.addPage();
        y = 15;
      }
      autoTable(doc, {
        startY: y,
        head: [["Measurement", "Value"]],
        body: measurementEntries.map(([k, v]) => [
          k.replace(/_/g, " "),
          String(v),
        ]),
        headStyles: { fillColor: [29, 126, 149] },
        styles: { fontSize: 8 },
        margin: { left, right: left },
        tableWidth: 90,
      });
      y = (doc as any).lastAutoTable.finalY + 6;
    }

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(
      `Delivery Address: ${[
        detail?.address?.addressLine1,
        detail?.address?.city,
        detail?.address?.state,
        detail?.address?.pincode,
      ]
        .filter(Boolean)
        .join(", ") || "—"}`,
      left,
      y,
      { maxWidth: pageWidth - left * 2 },
    );
    y += 10;
  });

  doc.save(`${customer.name.replace(/\s+/g, "_")}_orders.pdf`);
};
