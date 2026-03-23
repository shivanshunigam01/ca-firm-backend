const Quotation = require("../models/Quotation");

const generateQuotationNumber = async () => {
  const latest = await Quotation.findOne().sort("-createdAt").select("quotationNumber");

  if (!latest || !latest.quotationNumber) {
    return "QTN-0001";
  }

  const match = latest.quotationNumber.match(/QTN-(\d+)/);
  const current = match ? Number(match[1]) : 0;
  const next = current + 1;
  return `QTN-${String(next).padStart(4, "0")}`;
};

module.exports = { generateQuotationNumber };
