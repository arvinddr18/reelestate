const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    secure: false, // false for port 587
    auth: {
      user: process.env.BREVO_USER,
      pass: process.env.BREVO_PASS,
    },
  });

  const mailOptions = {
    from: `"Nodexa Security" <ad2b94001@smtp-brevo.com>`, // Use the login email as the sender
    to: options.email,
    subject: options.subject,
    html: options.html,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;