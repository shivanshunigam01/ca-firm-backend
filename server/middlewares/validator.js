const { validationResult, body, param } = require("express-validator");

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

const loginRules = [
  body("email").isEmail().withMessage("Valid email is required"),
  body("password").notEmpty().withMessage("Password is required"),
];

const registerRules = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Valid email is required"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  body("role").optional().isIn(["admin", "staff"]).withMessage("Invalid role"),
];

const changePasswordRules = [
  body("currentPassword").notEmpty().withMessage("Current password is required"),
  body("newPassword")
    .isLength({ min: 6 })
    .withMessage("New password must be at least 6 characters long"),
];

const leadRules = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("phone").trim().notEmpty().withMessage("Phone is required"),
  body("email").optional({ checkFalsy: true }).isEmail().withMessage("Valid email is required"),
  body("source")
    .optional()
    .isIn(["contact_form", "chatbot", "get_started", "service_page"])
    .withMessage("Invalid source"),
  body("status")
    .optional()
    .isIn(["new", "contacted", "converted", "closed"])
    .withMessage("Invalid status"),
];

const customerRules = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("phone").trim().notEmpty().withMessage("Phone is required"),
  body("email").optional({ checkFalsy: true }).isEmail().withMessage("Valid email required"),
];

const quotationRules = [
  body("customerId").notEmpty().withMessage("Customer is required"),
  body("items").isArray({ min: 1 }).withMessage("At least one item required"),
  body("items.*.description").notEmpty().withMessage("Item description required"),
  body("items.*.rate").isFloat({ min: 0 }).withMessage("Valid rate required"),
  body("items.*.quantity").isInt({ min: 1 }).withMessage("Valid quantity required"),
  body("taxRate").isFloat({ min: 0, max: 100 }).withMessage("Valid tax rate required"),
  body("validUntil").isISO8601().withMessage("Valid date required"),
  body("status")
    .optional()
    .isIn(["draft", "sent", "accepted", "rejected"])
    .withMessage("Invalid status"),
];

const quotationStatusRules = [
  body("status")
    .notEmpty()
    .isIn(["draft", "sent", "accepted", "rejected"])
    .withMessage("Valid status is required"),
];

const contentRules = [
  body("section").trim().notEmpty().withMessage("Section is required"),
  body("key").trim().notEmpty().withMessage("Key is required"),
  body("value").exists().withMessage("Value is required"),
  body("type").optional().isIn(["text", "html", "image", "json"]).withMessage("Invalid type"),
];

const chatRules = [body("message").trim().notEmpty().withMessage("Message is required")];

const idRule = [param("id").isMongoId().withMessage("Invalid ID")];

module.exports = {
  validate,
  loginRules,
  registerRules,
  changePasswordRules,
  leadRules,
  customerRules,
  quotationRules,
  quotationStatusRules,
  contentRules,
  chatRules,
  idRule,
};
