const Quotation = require("../models/Quotation");
const Customer = require("../models/Customer");
const { generateQuotationNumber } = require("../utils/generateQuotationNumber");
const { buildQuotationPdf } = require("../utils/pdfGenerator");
const { sendEmail } = require("../utils/sendEmail");

const calculateQuotationPayload = (basePayload, customer) => {
  const items = (basePayload.items || []).map((item) => ({
    description: item.description,
    quantity: Number(item.quantity),
    rate: Number(item.rate),
    amount: Number(item.quantity) * Number(item.rate),
  }));

  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const taxRate = Number(basePayload.taxRate ?? 18);
  const taxAmount = (subtotal * taxRate) / 100;
  const total = subtotal + taxAmount;

  return {
    customerId: customer._id,
    customerName: customer.name,
    customerEmail: customer.email,
    items,
    subtotal,
    taxRate,
    taxAmount,
    total,
    notes: basePayload.notes,
    validUntil: basePayload.validUntil,
  };
};

const createQuotation = async (req, res, next) => {
  try {
    const { customerId } = req.body;

    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({ success: false, message: "Customer not found" });
    }

    const computed = calculateQuotationPayload(req.body, customer);

    const quotation = await Quotation.create({
      quotationNumber: await generateQuotationNumber(),
      ...computed,
      status: "draft",
    });

    res.status(201).json({ success: true, quotation });
  } catch (error) {
    next(error);
  }
};

const getQuotations = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const numericPage = Number(page);
    const numericLimit = Number(limit);

    const query = {};
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { quotationNumber: { $regex: search, $options: "i" } },
        { customerName: { $regex: search, $options: "i" } },
      ];
    }

    const total = await Quotation.countDocuments(query);
    const quotations = await Quotation.find(query)
      .sort("-createdAt")
      .skip((numericPage - 1) * numericLimit)
      .limit(numericLimit);

    res.json({
      success: true,
      quotations,
      pagination: {
        total,
        page: numericPage,
        pages: Math.ceil(total / numericLimit),
        limit: numericLimit,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getQuotation = async (req, res, next) => {
  try {
    const quotation = await Quotation.findById(req.params.id).populate("customerId");
    if (!quotation) {
      return res.status(404).json({ success: false, message: "Quotation not found" });
    }
    res.json({ success: true, quotation });
  } catch (error) {
    next(error);
  }
};

const updateQuotation = async (req, res, next) => {
  try {
    const existing = await Quotation.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: "Quotation not found" });
    }

    let updatePayload = { ...req.body };

    if (req.body.customerId || req.body.items || req.body.taxRate !== undefined || req.body.validUntil) {
      const customer = await Customer.findById(req.body.customerId || existing.customerId);
      if (!customer) {
        return res.status(404).json({ success: false, message: "Customer not found" });
      }

      updatePayload = {
        ...updatePayload,
        ...calculateQuotationPayload(
          {
            customerId: req.body.customerId || existing.customerId,
            items: req.body.items || existing.items,
            taxRate: req.body.taxRate ?? existing.taxRate,
            notes: req.body.notes ?? existing.notes,
            validUntil: req.body.validUntil || existing.validUntil,
          },
          customer
        ),
      };
    }

    const quotation = await Quotation.findByIdAndUpdate(req.params.id, updatePayload, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, quotation });
  } catch (error) {
    next(error);
  }
};

const deleteQuotation = async (req, res, next) => {
  try {
    const quotation = await Quotation.findByIdAndDelete(req.params.id);
    if (!quotation) {
      return res.status(404).json({ success: false, message: "Quotation not found" });
    }
    res.json({ success: true, message: "Quotation deleted" });
  } catch (error) {
    next(error);
  }
};

const updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const quotation = await Quotation.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!quotation) {
      return res.status(404).json({ success: false, message: "Quotation not found" });
    }

    res.json({ success: true, quotation });
  } catch (error) {
    next(error);
  }
};

const downloadQuotationPdf = async (req, res, next) => {
  try {
    const quotation = await Quotation.findById(req.params.id).populate("customerId");
    if (!quotation) {
      return res.status(404).json({ success: false, message: "Quotation not found" });
    }

    const pdfBuffer = await buildQuotationPdf(quotation);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${quotation.quotationNumber}.pdf`
    );
    res.send(pdfBuffer);
  } catch (error) {
    next(error);
  }
};

const emailQuotation = async (req, res, next) => {
  try {
    const quotation = await Quotation.findById(req.params.id).populate("customerId");
    if (!quotation) {
      return res.status(404).json({ success: false, message: "Quotation not found" });
    }

    if (!quotation.customerEmail) {
      return res.status(400).json({ success: false, message: "Customer email not available" });
    }

    const pdfBuffer = await buildQuotationPdf(quotation);
    await sendEmail({
      to: quotation.customerEmail,
      subject: `Quotation ${quotation.quotationNumber} from CA Shivanand Choudhary`,
      text: `Dear ${quotation.customerName},\n\nPlease find attached quotation ${quotation.quotationNumber}.\n\nRegards,\nCA Shivanand Choudhary`,
      attachments: [
        {
          filename: `${quotation.quotationNumber}.pdf`,
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    });

    quotation.status = quotation.status === "draft" ? "sent" : quotation.status;
    await quotation.save();

    res.json({ success: true, message: "Quotation emailed successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createQuotation,
  getQuotations,
  getQuotation,
  updateQuotation,
  deleteQuotation,
  updateStatus,
  downloadQuotationPdf,
  emailQuotation,
};
