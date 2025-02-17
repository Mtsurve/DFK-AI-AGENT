const express = require("express");
const router = express.Router();
const otpController = require("../controllers/otpController");
const otpValidationsSchema = require("../validations/otpValidations")
const JoiMiddleWare = require("../middlewares/joi/joiMiddleware");
const userAuth = require("../middlewares/jsonwebtoken/joiAuthMiddleware");


router.post("/generate-otp",
    userAuth,
    otpController.generateOTPSendEmail);

router.post("/verify-otp",
    userAuth,
    JoiMiddleWare(otpValidationsSchema.verifyOTPSchema, "body"),
    otpController.verifyOTPEmail);


module.exports = router; 