const express = require("express");
const router = express.Router();
const {
  getContent,
  updateContent,
  upsertContent,
  deleteContent,
} = require("../controllers/contentController");
const { protect } = require("../middlewares/authMiddleware");
const { contentRules, idRule, validate } = require("../middlewares/validator");

router.get("/", getContent);
router.post("/", protect, contentRules, validate, upsertContent);
router.put("/:id", protect, idRule, contentRules, validate, updateContent);
router.delete("/:id", protect, idRule, validate, deleteContent);

module.exports = router;
