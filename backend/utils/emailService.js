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

module.exports = { sendReminderEmail };