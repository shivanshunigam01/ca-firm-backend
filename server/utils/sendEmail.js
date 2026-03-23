const nodemailer = require("nodemailer");
const config = require("../config/env");

const transporter = nodemailer.createTransport({
  host: config.SMTP_HOST,
  port: config.SMTP_PORT,
  secure: false,
  auth: config.SMTP_USER && config.SMTP_PASS ? {
    user: config.SMTP_USER,
    pass: config.SMTP_PASS,
  } : undefined,
});

const sendEmail = async ({ to, subject, text, html, attachments = [] }) => {
  if (!config.SMTP_HOST || !config.SMTP_USER || !config.SMTP_PASS) {
    const error = new Error("SMTP credentials are not configured");
    error.statusCode = 500;
    throw error;
  }

  return transporter.sendMail({
    from: config.SMTP_FROM,
    to,
    subject,
    text,
    html,
    attachments,
  });
};

module.exports = { sendEmail };
