const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // 1. Create the transporter (The Mailtruck)
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',  
    port: 587,  
    secure: false,
    family: 4,              
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false  // ✅ Prevents TLS errors on Render
    }
  });

  // 2. Define the email options (The Letter)
  const mailOptions = {
    from: `Nodexa Security <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    html: options.html,
  };

  // 3. Send it!
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;