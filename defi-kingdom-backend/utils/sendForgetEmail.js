const nodemailer = require("nodemailer");
const fs = require('fs');
const handlebars = require("handlebars");
const { promisify } = require('util');
const path = require("path")
require("dotenv").config();

const sendForgetEmail = async (userName, subject, token, email_id) => {
  try {
    const htmlToSend = `
    <h2>StockAI - Forgot Password </h2>

      <p>Hi ${userName},</p>

      <p>No worries! Forgetting a password happens to the best of us. Let's get you back into your account quickly.</p>

      <p>To Set your password, please click on the link below:</p>
      <p><a href="${process.env.REDIRECT_URL}/set-password/${token}">Set Password</a></p>
      
      <p>This link will expire in 5 hours, so please act promptly.</p>

      <p>If you didn't request a password set, please disregard this email. Your account is still secure.</p>

      <p>Need more help?</p>
  
      <p>If you encounter any issues, please reach out to our support team at <a href="mailto:jitendra.bechan.yadav@gmail.com">jitendra.bechan.yadav@gmail.com</a> or <a href="tel:+91 9555300168">+91 9555300168</a>. We're always happy to assist!</p>

      <p>Stay safe online!</p>

      <p>Sincerely,</p>
      <p>The StockAI Team</p>   

`;
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      port: 587,
      secure: true,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USERNAME,
      to: email_id,
      subject: subject,
      html: htmlToSend     
    });
    console.log("email sent sucessfully");
  } catch (error) {
    console.log("email not sent");
    console.log(error);
  }
};

module.exports = sendForgetEmail;