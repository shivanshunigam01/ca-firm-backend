const express = require("express");
const router = express.Router();
const { apiLimiter } = require("../middlewares/rateLimiter");

router.use(apiLimiter);
router.use("/admin", require("./authRoutes"));
router.use("/leads", require("./leadRoutes"));
router.use("/customers", require("./customerRoutes"));
router.use("/quotations", require("./quotationRoutes"));
router.use("/content", require("./contentRoutes"));
router.use("/dashboard", require("./dashboardRoutes"));
router.use("/chat", require("./chatRoutes"));

module.exports = router;
