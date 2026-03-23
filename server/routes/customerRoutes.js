const express = require("express");
const router = express.Router();
const {
  createCustomer,
  getCustomers,
  getCustomer,
  updateCustomer,
  deleteCustomer,
} = require("../controllers/customerController");
const { protect } = require("../middlewares/authMiddleware");
const { customerRules, idRule, validate } = require("../middlewares/validator");

router.use(protect);
router.post("/", customerRules, validate, createCustomer);
router.get("/", getCustomers);
router.get("/:id", idRule, validate, getCustomer);
router.put("/:id", idRule, validate, customerRules, validate, updateCustomer);
router.delete("/:id", idRule, validate, deleteCustomer);

module.exports = router;
