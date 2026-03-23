const express = require("express");
const router = express.Router();
const { chat } = require("../controllers/chatController");
const { chatLimiter } = require("../middlewares/rateLimiter");
const { chatRules, validate } = require("../middlewares/validator");

router.post("/", chatLimiter, chatRules, validate, chat);

module.exports = router;
