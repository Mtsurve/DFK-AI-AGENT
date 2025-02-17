const nodemailer = require("nodemailer");
const fs = require('fs');
const handlebars = require("handlebars");
const { promisify } = require('util');
const path = require("path")
const readFile = promisify(fs.readFile);
require("dotenv").config();

const sendEmail = async (subject, email ,otp ) => {
    try {
      const htmlToSend = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #4CAF50; text-align: center;">DFK AI - OTP Verification</h2>
          <p>Hi ${email},</p>
          <p>You're one step away from securing your account.</p>
          <p>Your One-Time Password (OTP) for verification is:</p>
          <div style="text-align: center; margin: 20px 0;">
              <h3 style="color: #ff6600; font-size: 24px; border: 1px dashed #ff6600; display: inline-block; padding: 10px 20px;">${otp}</h3>
          </div>
          <p>This OTP is valid for the next 10 minutes. Please do not share it with anyone.</p>
          <p>If you didn't request this OTP, please ignore this email.</p>
         
          <p>Sincerely,</p>
          <p>The Pharmaalabs Team</p>
      </div>
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
        to: email,
        subject: subject,
        html: htmlToSend,
      });
  
      console.log("OTP email sent successfully");
    } catch (error) {
      console.log("OTP email not sent");
      console.log(error);
    }
  };
  

module.exports = sendEmail;