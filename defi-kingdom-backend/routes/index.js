// routes/index.js
const express = require("express");
const router = express.Router();

// Import route handlers
const walletProfileRoutes = require("./walletProfile");
const heroesRoutes = require("./heroes");
const userRoutes = require("./user");
const tokenRoutes = require("./token");
const googleSuccess = require("./google_auth")
const otpSend = require("./otp")

// Register route handlers
router.use("/profile", walletProfileRoutes);
router.use("/heroes", heroesRoutes);
router.use("/user", userRoutes);
router.use("/token", tokenRoutes);
router.use("/auth",googleSuccess);
router.use("/otp",otpSend);

module.exports = router;
