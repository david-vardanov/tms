const nodemailer = require("nodemailer");
require('dotenv').config();

async function sendEmail(to, subject, text) {
  // Replace these with your G Suite email and generated app password
  const userEmail = process.env.USER_EMAIL;
  const appPassword = process.env.APP_PASSWORD;

  // Create a transporter object
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: userEmail,
      pass: appPassword,
    },
  });

  // Define the email options
  const mailOptions = {
    from: userEmail,
    to,
    subject,
    text,
  };

  // Send the email using the transporter
  try {
    const result = await transporter.sendMail(mailOptions);
    console.log("Email sent:", result.messageId);
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

// Usage example
//sendEmail("recipient@example.com", "Test Subject", "Hello, this is a test email!");
module.exports = sendEmail;