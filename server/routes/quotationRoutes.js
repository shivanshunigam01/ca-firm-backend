const express = require("express");
const router = express.Router();
const {
  createQuotation,
  getQuotations,
  getQuotation,
  updateQuotation,
  deleteQuotation,
  updateStatus,
  downloadQuotationPdf,
  emailQuotation,
} = require("../controllers/quotationController");
const { protect } = require("../middlewares/authMiddleware");
const {
  quotationRules,
  quotationStatusRules,
  idRule,
  validate,
} = require("../middlewares/validator");

router.use(protect);
router.post("/", quotationRules, validate, createQuotation);
router.get("/", getQuotations);
router.get("/:id", idRule, validate, getQuotation);
router.put("/:id", idRule, validate, quotationRules, validate, updateQuotation);
router.delete("/:id", idRule, validate, deleteQuotation);
router.patch("/:id/status", idRule, quotationStatusRules, validate, updateStatus);
router.get("/:id/pdf", idRule, validate, downloadQuotationPdf);
router.post("/:id/email", idRule, validate, emailQuotation);

module.exports = router;
