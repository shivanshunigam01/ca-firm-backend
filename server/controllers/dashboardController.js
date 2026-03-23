const Lead = require("../models/Lead");
const Customer = require("../models/Customer");
const Quotation = require("../models/Quotation");

const getStats = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    weekAgo.setHours(0, 0, 0, 0);

    const [
      totalLeads,
      newLeads,
      contactedLeads,
      convertedLeads,
      todayLeads,
      weekLeads,
      totalCustomers,
      totalQuotations,
      quotationRevenue,
    ] = await Promise.all([
      Lead.countDocuments(),
      Lead.countDocuments({ status: "new" }),
      Lead.countDocuments({ status: "contacted" }),
      Lead.countDocuments({ status: "converted" }),
      Lead.countDocuments({ createdAt: { $gte: today } }),
      Lead.countDocuments({ createdAt: { $gte: weekAgo } }),
      Customer.countDocuments({ isActive: true }),
      Quotation.countDocuments(),
      Quotation.aggregate([
        { $match: { status: "accepted" } },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]),
    ]);

    res.json({
      success: true,
      stats: {
        totalLeads,
        newLeads,
        contactedLeads,
        convertedLeads,
        todayLeads,
        weekLeads,
        totalCustomers,
        totalQuotations,
        totalRevenue: quotationRevenue[0]?.total || 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getRecentLeads = async (req, res, next) => {
  try {
    const leads = await Lead.find()
      .sort("-createdAt")
      .limit(10)
      .select("name email phone status source createdAt");

    res.json({ success: true, leads });
  } catch (error) {
    next(error);
  }
};

module.exports = { getStats, getRecentLeads };
