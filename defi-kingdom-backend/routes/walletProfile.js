const express = require("express");
const router = express.Router();
const JoiMiddleWare = require("../middlewares/joi/joiMiddleware");
const walletProfileSchema = require("../validations/walletProfileValidation");
const walletProfileController = require("../controllers/walletProfileController");

router.get("/profile-by-address", 
    JoiMiddleWare(walletProfileSchema.getProfileByWalletAddressSchema, "query"),
    walletProfileController.getProfileByWalletAddress
);

router.get("/profile-by-name", 
    JoiMiddleWare(walletProfileSchema.getProfileByNameSchema, "query"),
    walletProfileController.getProfileByName
);

module.exports = router;