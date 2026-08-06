import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { InvoiceData } from "@/types/interface";
import autoTable, { type Color } from "jspdf-autotable";

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

export const downloadInvoicePDF = async (data: InvoiceData) => {
  const { invoiceNo, date, customer, items, totals } = data;

  const logoBase64 = await imageToBase64("/invoice_cover.png");
  const whatsappBase64 = await imageToBase64("/sgo_whatsapp.png");
  const upiBase64 = await imageToBase64("/sgo_upi.png");

  const BG_LIGHT = "#edf6f8";
  const BG_ALT = "#e2f0f3";

  const doc = new jsPDF();
  const pageHeight = doc.internal.pageSize.getHeight();
  const pageWidth = doc.internal.pageSize.getWidth();
  const left = 15;

  const logoWidth = 200;
  const logoHeight = 50;
  const y = 10;

  doc.addImage(
    logoBase64,
    "PNG",
    (pageWidth - logoWidth) / 2,
    pageHeight / 2,
    logoWidth,
    logoHeight
  );
  doc.addImage(
    logoBase64,
    "PNG",
    (pageWidth - logoWidth) / 2,
    y - 5,
    logoWidth,
    logoHeight
  );

  let newY = y + logoHeight + 5;

  doc.setFont("helvetica");
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.text(`INVOICE NO. : ${invoiceNo}`, left, newY);

  const rectHeight = 12;
  const rectY = newY + 5;

  // 🔹 Light background bar only
  doc.setFillColor(BG_LIGHT);
  doc.rect(0, rectY, pageWidth, rectHeight, "F");

  const textY = rectY + rectHeight / 2 + 2;
  doc.text(`DATE : ${date}`, left, textY);
  doc.text(
    `PAYMENT DUE : ${(totals.total - totals.advance).toFixed(2)}`,
    pageWidth - 70,
    textY
  );

  newY = rectY + rectHeight + 10;

  doc.setFontSize(11);
  doc.text("SILAIGO", left, newY);

  doc.setFontSize(10);
  doc.text("Shop 5, Shiva Tower, Sector 66,", left, newY + 5);
  doc.text("Noida, Uttar Pradesh 201301", left, newY + 10);
  doc.text("GSTIN : 09GJCPS6885J1Z8", left, newY + 15);
  doc.text("HSN : 9988", left, newY + 20);

  const billX = pageWidth - 70;
  doc.setFontSize(11);
  doc.text("BILL TO:", billX, newY);

  doc.setFontSize(10);
  doc.text(`${customer.name} , ${customer.phone}`, billX, newY + 5);
  doc.text(customer.addressLine1, billX, newY + 10);
  doc.text(customer.addressLine2, billX, newY + 15);
  doc.text(customer.addressLine3, billX, newY + 20);

  const tableStartY = newY + 35;

  const rows = items
    .reverse()
    .map((item, index) => [
      String(index + 1),
      item.name,
      String(item.qty),
      item.unitCost.toFixed(2),
      (item.unitCost * item.qty).toFixed(2),
    ]);

  while (rows.length < 10) rows.push(["", "", "", "", ""]);

  autoTable(doc, {
    startY: tableStartY,
    head: [["NO.", "DESCRIPTION", "QTY", "UNIT COST", "AMT"]],
    body: rows,
    margin: { left: 15, right: 15 },
    theme: "plain",
    styles: {
      fontSize: 9,
      cellPadding: { left: 3, right: 3, top: 2, bottom: 2 },
      valign: "middle",
      textColor: 0,
    },
    didParseCell: (data) => {
      const bg = data.column.index % 2 === 0 ? BG_LIGHT : BG_ALT;
      data.cell.styles.fillColor = bg;

      if (data.section === "head") {
        data.cell.styles.fontStyle = "bold";
      }

      if (data.row.raw?.[0] === "") {
        data.cell.text = [""];
      }
    },
  });

  const bottomBlockY = pageHeight - 55;

  const qrSize = 40;

  doc.addImage(upiBase64, "PNG", left, bottomBlockY, qrSize, qrSize);
  doc.setFontSize(9);
  doc.text("For UPI Payments", left + 7, bottomBlockY - 3);

  const waX = left + qrSize + 5;
  doc.addImage(whatsappBase64, "PNG", waX, bottomBlockY, qrSize, qrSize);
  doc.text("For Whatsapp", waX + 10, bottomBlockY - 3);

  doc.setFontSize(10);

  doc.text("SUB TOTAL :", pageWidth - 70, pageHeight - 48);
  doc.text(totals.subtotal.toFixed(2), pageWidth - 30, pageHeight - 48);

  doc.text("TAX :", pageWidth - 70, pageHeight - 40);
  doc.text(totals.tax.toFixed(2), pageWidth - 30, pageHeight - 40);

  doc.text("TOTAL :", pageWidth - 70, pageHeight - 32);
  doc.text(totals.total.toFixed(2), pageWidth - 30, pageHeight - 32);

  doc.text("ADVANCE :", pageWidth - 70, pageHeight - 24);
  doc.text(totals.advance.toFixed(2), pageWidth - 30, pageHeight - 24);

  doc.text("PAYMENT DUE :", pageWidth - 70, pageHeight - 16);
  doc.text(
    (totals.total - totals.advance).toFixed(2),
    pageWidth - 30,
    pageHeight - 16
  );

  const footerY = pageHeight - 5;

  // 🔹 Light footer background only
  doc.setFillColor(BG_LIGHT);
  doc.rect(0, footerY - 8, pageWidth, 12, "F");

  doc.setFontSize(10);

  const padding = 15;
  const leftText = "www.silaigo.com";
  const middleText = "+91 88006 33755";
  const rightText = "silaigo.official@gmail.com";

  const leftX = padding;
  const rightTextWidth = doc.getTextWidth(rightText);
  const rightX = pageWidth - padding - rightTextWidth;

  const leftTextWidth = doc.getTextWidth(leftText);
  const centerX = (leftX + leftTextWidth + rightX) / 2;
  const middleX = centerX - doc.getTextWidth(middleText) / 2;

  doc.text(leftText, leftX, footerY);
  doc.text(middleText, middleX, footerY);
  doc.text(rightText, rightX, footerY);

  doc.save(`${invoiceNo}.pdf`);
};
