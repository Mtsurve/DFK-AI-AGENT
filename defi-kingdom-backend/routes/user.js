const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController");
const userSchema = require("../validations/userValidation");
const JoiMiddleWare = require("../middlewares/joi/joiMiddleware");
const userAuth = require("../middlewares/jsonwebtoken/joiAuthMiddleware");

router.post("/register",
  JoiMiddleWare(userSchema.registerUser, "body"),
  userController.registerUser
);

router.post("/sign-in",
  JoiMiddleWare(userSchema.signIn, "body"),
  userController.userSignIn
);

router.post('/forgot-password',
  JoiMiddleWare(userSchema.forgotPassword, "body"),
  userController.forgotPassword)

router.get("/user-profiles-data",
  userAuth,
  userController.getUserProfilesData);

router.get("/get-user-activity",
  userAuth,
  userController.getUserActivity);

router.post('/telegram-verify',
  userAuth,
  userController.verifyTelegramUser
)

router.put("/telegram-username",
  userAuth,
  JoiMiddleWare(userSchema.updateTelegramUsername, "body"),
  userController.updateTelegramUsername);

router.put("/set-user-password",
  JoiMiddleWare(userSchema.setUserPassword, "body"),
  userController.setUserPassword)

module.exports = router;
