import nodemailer from "nodemailer";

// Create transporter using Gmail SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_FROM_EMAIL,
    pass: process.env.GOOGLE_MAIL_PASS
  }
});

// Verify transporter configuration
transporter.verify(function (error, success) {
  if (error) {
    console.error('Mail transporter configuration error:', error);
  } else {
    console.log('Mail server is ready to take our messages');
  }
});

const footer = "<br /><br /><br /><p>The mail is from ResQMeal</p>";

// Send email function
export const sendEmail = async (to, subject, html) => {
  try {
    const mailOptions = {
      from: process.env.GMAIL_FROM_EMAIL,
      to: to,
      subject: "ResQMeal --- " + subject,
      html: html + footer
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email');
  }
};