//config/sendEmail.js
const nodemailer = require("nodemailer");
const fs = require('fs');
const handlebars = require("handlebars");
const { promisify } = require('util');
const path = require("path")
const readFile = promisify(fs.readFile);
require("dotenv").config();

const sendEmail = async (email_id,subject,emailData) => {
  try {
    const emailTemplateSource = await readFile(path.join(__dirname,emailData.filePath), "utf8")
    const template = handlebars.compile(emailTemplateSource)
    const htmlToSend = template({token: emailData.token , contact_person: emailData.contact_person, redirectUrl: emailData.redirectUrl})
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
    console.log("******************** MAIL SENT ?? ******************************")
  } catch (error) {
    console.log("********************************** EMAIL ERROR !!!!!!!!!!!!!!!!!!!!", error)
  }
};

module.exports = sendEmail;