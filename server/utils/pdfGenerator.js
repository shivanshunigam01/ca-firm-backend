const { jsPDF } = require("jspdf");
require("jspdf-autotable");

const money = (value) => `₹${Number(value || 0).toFixed(2)}`;

const buildQuotationPdf = async (quotation) => {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text("CA Shivanand Choudhary", 14, 18);
  doc.setFontSize(11);
  doc.text("Quotation Document", 14, 26);

  doc.setFontSize(10);
  doc.text(`Quotation No: ${quotation.quotationNumber}`, 14, 36);
  doc.text(`Date: ${new Date(quotation.createdAt || Date.now()).toLocaleDateString("en-IN")}`, 14, 42);
  doc.text(`Valid Until: ${new Date(quotation.validUntil).toLocaleDateString("en-IN")}`, 14, 48);
  doc.text(`Status: ${quotation.status}`, 14, 54);

  doc.text("Bill To:", 130, 36);
  doc.text(`${quotation.customerName}`, 130, 42);
  if (quotation.customerEmail) {
    doc.text(`${quotation.customerEmail}`, 130, 48);
  }
  if (quotation.customerId?.phone) {
    doc.text(`${quotation.customerId.phone}`, 130, 54);
  }
  if (quotation.customerId?.company) {
    doc.text(`${quotation.customerId.company}`, 130, 60);
  }

  doc.autoTable({
    startY: 68,
    head: [["Description", "Qty", "Rate", "Amount"]],
    body: quotation.items.map((item) => [
      item.description,
      String(item.quantity),
      money(item.rate),
      money(item.amount),
    ]),
    styles: { fontSize: 10 },
    headStyles: { fillColor: [45, 45, 45] },
  });

  const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 10 : 110;

  doc.text(`Subtotal: ${money(quotation.subtotal)}`, 140, finalY);
  doc.text(`Tax (${quotation.taxRate}%): ${money(quotation.taxAmount)}`, 140, finalY + 8);
  doc.setFontSize(12);
  doc.text(`Total: ${money(quotation.total)}`, 140, finalY + 18);
  doc.setFontSize(10);

  if (quotation.notes) {
    doc.text("Notes:", 14, finalY + 10);
    const splitNotes = doc.splitTextToSize(quotation.notes, 120);
    doc.text(splitNotes, 14, finalY + 16);
  }

  const output = doc.output("arraybuffer");
  return Buffer.from(output);
};

module.exports = { buildQuotationPdf };
