const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});
// Email templates
const templates = {
  'blood-request': (context) => ({
    subject: `Urgent: Blood Donation Request - ${context.bloodType} Blood Needed`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #d32f2f; color: white; padding: 20px; text-align: center; }
          .content { background: #f9f9f9; padding: 20px; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          .button { background: #d32f2f; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>LifeStream Blood Donation Request</h1>
          </div>
          <div class="content">
            <h2>Hello ${context.name},</h2>
            <p>There is an urgent need for <strong>${context.bloodType}</strong> blood in your area.</p>
            
            <h3>Request Details:</h3>
            <ul>
              <li><strong>Patient:</strong> ${context.patientName}</li>
              <li><strong>Hospital:</strong> ${context.hospital}</li>
              <li><strong>Units Needed:</strong> ${context.units}</li>
              <li><strong>Urgency:</strong> ${context.urgency}</li>
              <li><strong>Contact:</strong> ${context.contact}</li>
            </ul>
            
            <p>If you are eligible and available to donate, please contact the number above immediately.</p>
            
            <p style="text-align: center;">
              <a href="${process.env.FRONTEND_URL}/respond/${context.requestId}" class="button">Respond to Request</a>
            </p>
            
            <p>Thank you for your life-saving contribution!</p>
          </div>
          <div class="footer">
            <p>LifeStream Blood Donation Network</p>
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),
  'donor-found': (context) => ({
    subject: 'Donor Found for Your Blood Request',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #388e3c; color: white; padding: 20px; text-align: center; }
          .content { background: #f9f9f9; padding: 20px; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Donor Found!</h1>
          </div>
          <div class="content">
            <h2>Hello ${context.name},</h2>
            <p>Great news! A donor has been found for your blood request.</p>
            
            <h3>Donor Details:</h3>
            <ul>
              <li><strong>Name:</strong> ${context.donorName}</li>
              <li><strong>Blood Type:</strong> ${context.bloodType}</li>
              <li><strong>Contact:</strong> ${context.contact}</li>
            </ul>
            
            <p>Please contact the donor to coordinate the donation process.</p>
            
            <p>Thank you for using LifeStream!</p>
          </div>
          <div class="footer">
            <p>LifeStream Blood Donation Network</p>
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `
  })
};

// Send email function
exports.sendEmail = async ({ to, subject, template, context }) => {
  try {
    const emailTemplate = templates[template](context);
    
    const mailOptions = {
      from: `LifeStream <${process.env.EMAIL_USER}>`,
      to,
      subject: subject || emailTemplate.subject,
      html: emailTemplate.html
    };
    
    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent:', result.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

// Test email connection
exports.verifyEmailConnection = async () => {
  try {
    await transporter.verify();
    console.log('Email server connection verified');
    return true;
  } catch (error) {
    console.error('Email connection error:', error);
    return false;
  }
};