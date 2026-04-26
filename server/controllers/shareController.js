const Quotation = require("../models/Quotation");
const { buildQuotationPdf } = require("../utils/pdfGenerator");
const { sendEmail } = require("../utils/sendEmail");

/**
 * Digits for wa.me: prefer India 91 if 10 local digits, else E.164-style digits only.
 */
function normalizeWhatsapp(raw) {
  const digits = String(raw || "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.length === 10) {
    return `91${digits}`;
  }
  if (digits.length === 11 && digits.startsWith("0")) {
    return `91${digits.slice(1)}`;
  }
  if (digits.length === 12 && digits.startsWith("91")) {
    return digits;
  }
  if (digits.length > 6) {
    return digits;
  }
  return "";
}

const shareQuotation = async (req, res, next) => {
  try {
    const hasEmail = req.body.email != null && String(req.body.email).trim() !== "";
    const hasWhatsapp =
      req.body.whatsapp != null && String(req.body.whatsapp).trim() !== "";
    const email = hasEmail ? String(req.body.email).trim() : "";
    const whatsapp = hasWhatsapp ? String(req.body.whatsapp).trim() : "";

    if (!hasEmail && !hasWhatsapp) {
      return res.status(400).json({
        success: false,
        message: "Provide at least an email or a WhatsApp number",
      });
    }

    if (hasEmail) {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!re.test(email)) {
        return res.status(400).json({ success: false, message: "Valid email is required" });
      }
    }

    const quotation = await Quotation.findById(req.params.id).populate("customerId");
    if (!quotation) {
      return res.status(404).json({ success: false, message: "Quotation not found" });
    }

    const pdfBuffer = hasEmail ? await buildQuotationPdf(quotation) : null;
    let emailSent = false;

    if (hasEmail && pdfBuffer) {
      await sendEmail({
        to: email,
        subject: "Your Quotation from CA Shivanand Choudhary",
        text: `Dear ${quotation.customerName},\n\nPlease find your quotation attached.\n\nRegards,\nCA Shivanand Choudhary`,
        attachments: [
          {
            filename: `${quotation.quotationNumber}.pdf`,
            content: pdfBuffer,
            contentType: "application/pdf",
          },
        ],
      });
      emailSent = true;
      if (quotation.status === "draft") {
        quotation.status = "sent";
      }
      await quotation.save();
    }

    let whatsappUrl = null;
    if (hasWhatsapp) {
      const num = normalizeWhatsapp(whatsapp);
      if (!num || num.length < 10) {
        return res.status(400).json({ success: false, message: "Invalid WhatsApp number" });
      }
      const textMessage = `Hello, please find your quotation ${quotation.quotationNumber} from CA Shivanand Choudhary. Total: ₹${Number(quotation.total).toLocaleString("en-IN")}. Valid until: ${new Date(quotation.validUntil).toLocaleDateString("en-IN")}. The PDF is attached to your email if you requested it, or we can resend.`;
      whatsappUrl = `https://wa.me/${num}?text=${encodeURIComponent(textMessage)}`;
    }

    return res.json({
      success: true,
      emailSent,
      whatsappUrl,
      message: emailSent && hasWhatsapp
        ? "Email sent successfully; WhatsApp link is ready"
        : emailSent
          ? "Email sent successfully"
          : "WhatsApp link is ready",
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { shareQuotation };
