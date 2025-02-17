const express = require("express");
const router = express.Router();
const passport = require("passport");
const db = require("../config/db.config");
const ethers = require('ethers');
const { JWT_SECRET } = require("../config/jwtTokenKey");
const jwt = require("jsonwebtoken");
require("dotenv").config();

async function generateWallet() {
  const wallet = ethers.Wallet.createRandom();
  return {
    address: wallet.address,
    privateKey: wallet.privateKey,
  };
}

router.get("/google", passport.authenticate("google", { scope: ["profile","email"]  }));

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login/failed" }),
  async (req, res) => {
    try {
      const user_data = req.user;
      if (!user_data) {
        return res.status(404).json({ message: "User not found" });
      }

      const email = user_data.emails[0].value;
      let userExist = await db.users.findOne({ where: { email } });

      let wallet_address;
      
      if (!userExist) {
        const wallet_create = await generateWallet();
        wallet_address = wallet_create.address; 

        userExist = await db.users.create({
          email,
          name: user_data.displayName,
          wallet_address,
          wallet_private_key: wallet_create.privateKey
        });
      } else {
        wallet_address = userExist.wallet_address;
      }

      const token = jwt.sign(
        {
          email: userExist.email,
          name: userExist.name,
        },
        JWT_SECRET,
        { expiresIn: "24h" }
      );

      res.cookie("googleAuthToken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

      const CLIENT_URL = `http://localhost:5173/auth/google/success/${token}/${wallet_address}`;
      res.redirect(CLIENT_URL);
    } catch (error) {
      console.error("Error during Google callback:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);


module.exports = router;