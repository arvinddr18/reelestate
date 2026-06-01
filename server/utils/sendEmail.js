const axios = require('axios');

const sendEmail = async (options) => {
  try {
    const data = {
      sender: { 
        name: "Nodexa Security", 
        email: "ad2b94001@smtp-brevo.com" // This must match your Brevo login email exactly
      },
      to: [{ email: options.email }],
      subject: options.subject,
      htmlContent: options.html
    };

    await axios.post('https://api.brevo.com/v3/smtp/email', data, {
      headers: {
        'accept': 'application/json',
        'api-key': process.env.BREVO_API_KEY,
        'content-type': 'application/json'
      }
    });

    console.log("🚀 Email sent successfully via Brevo HTTP API!");
  } catch (error) {
    console.error("❌ Brevo API Error:", error.response ? error.response.data : error.message);
    throw new Error("Failed to send email via API.");
  }
};

module.exports = sendEmail;