const Response = require("../classes/Response");
const db = require("../config/db.config");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config/jwtTokenKey");
const { Op, QueryTypes } = require("sequelize");
const USER_CONSTANTS = require("../constants/userConstants");
const sendForgetEmail = require("../utils/sendForgetEmail");
const sendEmail = require("../utils/sendEmail");
const { ethers } = require("ethers");
const contractABI = require("../classes/IProfilesABI.json");
require("dotenv").config();
const axios = require("axios");

// Load environment variables
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const RPC_URL = "https://subnets.avax.network/defi-kingdoms/dfk-chain/rpc";

// Function to create a new wallet
async function generateWallet() {
  const wallet = ethers.Wallet.createRandom(); // No need for await here as it's synchronous
  return {
    address: wallet.address,
    privateKey: wallet.privateKey,
  };
}

async function createProfile(name, privateKey) {
  try {
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(privateKey, provider);

    const contractAddress = "0xC4cD8C09D1A90b21Be417be91A81603B03993E81";
    // Replace with the correct ABI file

    const contract = new ethers.Contract(contractAddress, contractABI, wallet);

    // Call the function
    const tx = await contract.createProfile(name, 0, 0);
    console.log("Transaction sent, waiting for confirmation...");

    const receipt = await tx.wait();

    console.log("Profile Created! Transaction Hash:", receipt);
    return receipt;
  } catch (error) {
    console.error("Error creating profile:", error);
  }
}

async function transferNativeToken(RECEIVER_ADDRESS) {
  try {
    const AMOUNT_TO_SEND = "0.001"; // Amount to send in JEWELS
    // Connect to the DFK Chain
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

    console.log(`Sender Address: ${wallet.address}`);
    console.log(`Receiver Address: ${RECEIVER_ADDRESS}`);

    // Get current gas price (Ethers v6)
    const feeData = await provider.getFeeData();
    const gasPrice = feeData.gasPrice;

    // Create transaction
    const tx = {
      to: RECEIVER_ADDRESS,
      value: ethers.parseEther(AMOUNT_TO_SEND), // Convert amount to Wei
      gasLimit: 21000, // Standard gas limit for native transfers
      gasPrice: gasPrice, // Fetch current gas price
    };

    // Send transaction
    const txResponse = await wallet.sendTransaction(tx);
    console.log(`Transaction Sent! Hash: ${txResponse.hash}`);

    // Wait for transaction confirmation
    const receipt = await txResponse.wait();
    console.log(`Transaction Confirmed! Block Number: ${receipt.blockNumber}`);
  } catch (error) {
    console.error("Error sending transaction:", error);
  }
}

const registerUser = async (req, res) => {
  try {
    let user_data = await db.users.findOne({
      where: { email: req.body.email },
    });

    if (user_data)
      return res
        .status(400)
        .send(
          Response.sendResponse(
            false,
            null,
            USER_CONSTANTS.EMAIL_ALREADY_EXISTS,
            400
          )
        );

    req.body.password = await bcrypt.hash(req.body.password, 10);

    let wallet_create = await generateWallet();

    req.body.wallet_address = wallet_create.address;
    req.body.wallet_private_key = wallet_create.privateKey;

    await transferNativeToken(req.body.wallet_address);

    await createProfile(req.body.name, req.body.wallet_private_key);

    let user = await db.users.create(req.body);

    const token = jwt.sign({ email: user.email }, JWT_SECRET, {
      expiresIn: "23h",
    });

    let emailData = {
      token: token,
      filePath: "../templates/userRegister.html",
      subject: "Verify Email",
      name: user.name,
    };

    await sendEmail(req.body.email, emailData.subject, emailData);
    res
      .status(201)
      .send(
        Response.sendResponse(true, user, USER_CONSTANTS.USER_CREATED, 201)
      );
  } catch (err) {
    console.log("errr", err);
    return res.status(500).send(Response.sendResponse(false, null, err, 500));
  }
};

const userSignIn = async (req, res) => {
  try {
    let user_data = await db.users.findOne({
      where: { email: req.body.email },
    });

    if (!user_data)
      return res
        .status(404)
        .send(
          Response.sendResponse(
            false,
            null,
            USER_CONSTANTS.EMAIL_AND_PASSWORD_INVALID,
            404
          )
        );

    let passwordMatch = await bcrypt.compare(
      req.body.password,
      user_data.password
    );

    if (!passwordMatch)
      return res
        .status(404)
        .send(
          Response.sendResponse(
            false,
            null,
            USER_CONSTANTS.EMAIL_AND_PASSWORD_INVALID,
            404
          )
        );

    delete user_data.dataValues.password;
    delete user_data.dataValues.wallet_private_key;
    // JWT Token creation
    const token = jwt.sign({ email: user_data.email }, JWT_SECRET, {
      expiresIn: "24h",
    });
    user_data.dataValues["token"] = token;
    res
      .status(200)
      .send(
        Response.sendResponse(
          true,
          user_data,
          USER_CONSTANTS.LOGIN_SUCCESSFUL,
          200
        )
      );
  } catch (err) {
    console.log("err", err);
    return res.status(500).send(Response.sendResponse(false, null, err, 500));
  }
};

const forgotPassword = async (req, res) => {
  try {
    let { email } = req.body;

    let user_data = await db.users.findOne({
      where: {
        email: email,
      },
    });

    if (!user_data) {
      return res
        .status(400)
        .send(
          Response.sendResponse(
            false,
            null,
            USER_CONSTANTS.EMAIL_AND_PASSWORD_INVALID,
            400
          )
        );
    }

    let userName = user_data.name;

    const token = jwt.sign({ email: email }, JWT_SECRET, { expiresIn: "5h" });
    await sendForgetEmail(userName, "Password Reset Request", token, email);

    return res
      .status(200)
      .send(Response.sendResponse(true, null, USER_CONSTANTS.EMAIL_SENT, 200));
  } catch (error) {
    return res.status(500).send(Response.sendResponse(false, null, error, 500));
  }
};

const setUserPassword = async (req, res) => {
  try {
    let { token, password } = req.body;
    const decoded = jwt.verify(token, JWT_SECRET);

    let user_data = await db.users.findOne({ where: { email: decoded.email } });

    if (!user_data) {
      return res
        .status(400)
        .send(
          Response.sendResponse(
            false,
            null,
            USER_CONSTANTS.EMAIL_AND_PASSWORD_INVALID,
            400
          )
        );
    } else {
      password = await bcrypt.hash(password, 10);

      let user_update = await db.users.update(
        { password: password },
        { where: { email: decoded.email } }
      );

      return res
        .status(200)
        .send(
          Response.sendResponse(
            true,
            user_update,
            USER_CONSTANTS.PASSWORD_UPDATE,
            200
          )
        );
    }
  } catch (error) {
    return res.status(500).send(Response.sendResponse(false, null, error, 500));
  }
};

const getUserProfilesData = async (req, res) => {
  try {
    let user_data = await db.users.findOne({
      where: { email: req.user.email },
      attributes: { exclude: ["password", "wallet_private_key"] },
    });

    return res
      .status(200)
      .send(
        Response.sendResponse(
          true,
          user_data,
          USER_CONSTANTS.USER_PROFILES,
          200
        )
      );
  } catch (error) {
    return res.status(500).send(Response.sendResponse(false, null, error, 500));
  }
};

const updateTelegramUsername = async (req, res) => {
  try {
    let { telegram_username, id } = req.body;
    let user_data = await db.users.findOne({ where: { id: id } });

    if (!user_data) {
      return res
        .status(400)
        .send(
          Response.sendResponse(false, null, USER_CONSTANTS.USER_NOT_FOUND, 400)
        );
    }

    let user_update = await db.users.update(
      { telegram_username: telegram_username },
      { where: { email: req.user.email } }
    );
    return res
      .status(200)
      .send(
        Response.sendResponse(
          true,
          user_update,
          USER_CONSTANTS.USER_UPDATED,
          200
        )
      );
  } catch (error) {
    return res.status(500).send(Response.sendResponse(false, null, error, 500));
  }
};

const verifyTelegramUser = async (req, res) => {
  try {
    const { telegramId } = req.body;

    if (!telegramId) {
      return res.status(400).json({ message: "Telegram ID is required" });
    }
    const response = await axios.get(process.env.TELEGRAM_GET_CHATID_API_URL);

    if (!response.data.ok) {
      return res
        .status(500)
        .json(Response.sendResponse(false, null, "Failed to fetch Telegram updates", 500));
    }
    const messages = response.data.result;

    if (messages.length === 0) {
      return res
        .status(500)
        .json(Response.sendResponse(false, null, "Something went wrong Please check in sometime", 500));
    }

    const userMessage = messages.find(
      (update) =>
        update.message?.from?.username &&
        update.message.from.username.toLowerCase() === telegramId.toLowerCase()
    );

    if (!userMessage) {
      return res.status(200).json(Response.sendResponse(true, null, USER_CONSTANTS.USER_VERIFICATION_FAILIED, 200));
    }

    const chatId = userMessage.message.chat.id;
    const user = await db.users.findOne({ where: { email: req.user.email, telegram_username: telegramId } });

    if (user) {
      await db.users.update({ telegram_chatid: chatId }, { where: { email: req.user.email, telegram_username: telegramId } });

      return res.status(200).json(Response.sendResponse(true, null, USER_CONSTANTS.USER_VERIFIED, 200));
    } else {
      return res.status(200).json(Response.sendResponse(true, null, USER_CONSTANTS.USER_VERIFICATION_FAILIED, 200));
    }
  } catch (error) {
    return res.status(500).send(Response.sendResponse(false, null, error.message, 500));
  }
};

const getUserActivity = async (req, res) => {
  try {

    let userActivity = await db.sequelize.query(`SELECT ua.*,us.name FROM user_activity ua INNER JOIN users us ON us.id = ua.user_id WHERE us.email = :emailId Order By id desc`, {
      type: QueryTypes.SELECT,
      replacements: { emailId: req.user.email },
    });

    return res.status(200).json(Response.sendResponse(true, userActivity, USER_CONSTANTS.SUCCESS, 200));

  } catch (error) {
    return res.status(500).send(Response.sendResponse(false, null, error.message, 500));
  }
}

module.exports = {
  registerUser,
  userSignIn,
  forgotPassword,
  setUserPassword,
  getUserProfilesData,
  updateTelegramUsername,
  verifyTelegramUser,
  getUserActivity
};
