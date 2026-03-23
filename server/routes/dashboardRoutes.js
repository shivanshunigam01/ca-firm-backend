const express = require("express");
const router = express.Router();
const { getStats, getRecentLeads } = require("../controllers/dashboardController");
const { protect } = require("../middlewares/authMiddleware");

router.use(protect);
router.get("/stats", getStats);
router.get("/recent-leads", getRecentLeads);

module.exports = router;
