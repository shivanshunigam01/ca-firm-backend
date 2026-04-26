const Lead = require("../models/Lead");
const { sendEmail } = require("../utils/sendEmail");

const createLead = async (req, res, next) => {
  try {
    const payload = {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      subject: req.body.subject,
      message: req.body.message,
      service: req.body.service,
      subService: req.body.subService,
      leadType: req.body.leadType || "general",
      businessType: req.body.businessType,
      revenue: req.body.revenue,
      purpose: req.body.purpose,
      businessStage: req.body.businessStage,
      source: req.body.source,
      page: req.body.page,
      device: req.body.device,
    };

    const lead = await Lead.create(payload);

    if (lead.leadType === "valuation") {
      try {
        await sendEmail({
          to: process.env.SMTP_FROM || process.env.SMTP_USER,
          subject: `New Valuation Lead: ${lead.name}`,
          text: [
            "A new valuation enquiry has been submitted.",
            `Name: ${lead.name}`,
            `Phone: ${lead.phone}`,
            `Email: ${lead.email || "-"}`,
            `Business Type: ${lead.businessType || "-"}`,
            `Revenue: ${lead.revenue || "-"}`,
            `Purpose: ${lead.purpose || "-"}`,
            `Business Stage: ${lead.businessStage || "-"}`,
            `Service: ${lead.service || "-"}`,
            `Message: ${lead.message || "-"}`,
          ].join("\n"),
        });
      } catch (emailError) {
        console.warn("Lead notification email failed:", emailError.message);
      }
    }

    res.status(201).json({ success: true, lead });
  } catch (error) {
    next(error);
  }
};

const getLeads = async (req, res, next) => {
  try {
    const { status, leadType, service, search, page = 1, limit = 20, sort = "-createdAt" } = req.query;
    const numericPage = Number(page);
    const numericLimit = Number(limit);

    const query = {};
    if (status) query.status = status;
    if (leadType) query.leadType = leadType;
    if (service) query.service = service;

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    const total = await Lead.countDocuments(query);
    const leads = await Lead.find(query)
      .sort(sort)
      .skip((numericPage - 1) * numericLimit)
      .limit(numericLimit)
      .populate("assignedTo", "name email");

    res.json({
      success: true,
      leads,
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

const getLead = async (req, res, next) => {
  try {
    const lead = await Lead.findById(req.params.id).populate("assignedTo", "name email");
    if (!lead) {
      return res.status(404).json({ success: false, message: "Lead not found" });
    }
    res.json({ success: true, lead });
  } catch (error) {
    next(error);
  }
};

const updateLead = async (req, res, next) => {
  try {
    const lead = await Lead.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate("assignedTo", "name email");

    if (!lead) {
      return res.status(404).json({ success: false, message: "Lead not found" });
    }

    res.json({ success: true, lead });
  } catch (error) {
    next(error);
  }
};

const deleteLead = async (req, res, next) => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id);
    if (!lead) {
      return res.status(404).json({ success: false, message: "Lead not found" });
    }
    res.json({ success: true, message: "Lead deleted" });
  } catch (error) {
    next(error);
  }
};

module.exports = { createLead, getLeads, getLead, updateLead, deleteLead };
