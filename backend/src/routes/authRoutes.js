const express = require("express");

const {
  login,
  employeeSsoLogin,
  getMe,
} = require("../controllers/authController");

const {
  authenticate,
} = require("../middleware/auth");

const router = express.Router();

// Admin login
router.post("/login", login);
// Employee SSO login
router.post("/employee-sso", employeeSsoLogin);

// Current logged-in admin
router.get("/me", authenticate, getMe);

module.exports = router;