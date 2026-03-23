const express = require("express");
const router = express.Router();
const { login, register, getMe, changePassword } = require("../controllers/authController");
const { protect } = require("../middlewares/authMiddleware");
const { adminOnly } = require("../middlewares/adminMiddleware");
const {
  loginRules,
  registerRules,
  changePasswordRules,
  validate,
} = require("../middlewares/validator");
const { loginLimiter } = require("../middlewares/rateLimiter");

router.post("/login", loginLimiter, loginRules, validate, login);
router.post("/register", protect, adminOnly, registerRules, validate, register);
router.get("/me", protect, getMe);
router.put("/change-password", protect, changePasswordRules, validate, changePassword);

module.exports = router;
