const express = require("express");
const router = express.Router();
const {
  createLead,
  getLeads,
  getLead,
  updateLead,
  deleteLead,
} = require("../controllers/leadController");
const { protect } = require("../middlewares/authMiddleware");
const { leadRules, idRule, validate } = require("../middlewares/validator");

router.post("/", leadRules, validate, createLead);
router.get("/", protect, getLeads);
router.get("/:id", protect, idRule, validate, getLead);
router.patch("/:id", protect, idRule, validate, updateLead);
router.delete("/:id", protect, idRule, validate, deleteLead);

module.exports = router;
