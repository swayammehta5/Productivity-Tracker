const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendReminderEmail = async (userEmail, userName, habits) => {
  const habitList = habits.map(h => `• ${h.name}`).join('\n');
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: userEmail,
    subject: '⏰ Daily Habit Reminder',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #3B82F6;">Hello ${userName}! 👋</h2>
        <p>Time to check off your daily habits:</p>
        <div style="background-color: #F3F4F6; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <pre style="font-family: Arial; margin: 0;">${habitList}</pre>
        </div>
        <p>Keep up the great work and maintain your streaks! 🔥</p>
        <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" 
           style="display: inline-block; background-color: #3B82F6; color: white; padding: 12px 24px; 
                  text-decoration: none; border-radius: 6px; margin-top: 10px;">
          Track Your Habits
        </a>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Reminder email sent to:', userEmail);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

const sendCollaborationEmail = async (userEmail, inviterName, itemName, itemType) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: userEmail,
    subject: `🤝 ${inviterName} shared a ${itemType} with you`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #3B82F6;">Collaboration Invitation</h2>
        <p><strong>${inviterName}</strong> has shared a ${itemType} with you:</p>
        <div style="background-color: #F3F4F6; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="font-size: 18px; margin: 0;"><strong>${itemName}</strong></p>
        </div>
        <p>Check it out in your Productivity Tracker!</p>
        <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" 
           style="display: inline-block; background-color: #3B82F6; color: white; padding: 12px 24px; 
                  text-decoration: none; border-radius: 6px; margin-top: 10px;">
          View ${itemType === 'task' ? 'Task' : 'Habit'}
        </a>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Collaboration email sent to:', userEmail);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

const sendOTPEmail = async (userEmail, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: userEmail,
    subject: '🔐 Your Two-Factor Authentication Code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #3B82F6;">Two-Factor Authentication</h2>
        <p>Your verification code is:</p>
        <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
          <p style="font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 0; color: #3B82F6;">${otp}</p>
        </div>
        <p>This code will expire in 10 minutes.</p>
        <p style="color: #6B7280; font-size: 12px;">If you didn't request this code, please ignore this email.</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('OTP email sent to:', userEmail);
  } catch (error) {
    console.error('Error sending OTP email:', error);
  }
};

module.exports = { sendReminderEmail, sendCollaborationEmail, sendOTPEmail };