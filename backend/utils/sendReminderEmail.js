const nodemailer = require('nodemailer');

// Create a transporter using environment variables
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS // Changed from EMAIL_PASSWORD to EMAIL_PASS to match .env
  }
});

/**
 * Sends a reminder email to the specified user
 * @param {Object} user - The user to send the reminder to
 * @param {Array} habits - Array of habit reminders
 * @param {Array} tasks - Array of task reminders
 * @returns {Promise} Promise that resolves when email is sent
 */
const sendReminderEmail = async (user, habits = [], tasks = []) => {
  try {
    if (!user.email) {
      console.error('No email address provided for user:', user._id);
      return false;
    }

    // Format email content
    const habitList = habits.length > 0 
      ? `\n📌 Habits to track today:\n${habits.map(h => `- ${h.name} (${h.frequency})`).join('\n')}`
      : '';

    const taskList = tasks.length > 0
      ? `\n📋 Tasks due soon:\n${tasks.map(t => `- ${t.title} (Due: ${new Date(t.dueDate).toLocaleDateString()})`).join('\n')}`
      : '';

    const mailOptions = {
      from: `"Habit Tracker" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: '📅 Your Daily Habit & Task Reminder',
      text: `Hello ${user.name || 'there'},${habitList}${taskList}\n\nStay productive! 🚀`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Hello ${user.name || 'there'},</h2>
          ${habits.length > 0 ? `
            <h3>📌 Habits to track today:</h3>
            <ul>${habits.map(h => `<li>${h.name} <small>(${h.frequency})</small></li>`).join('')}</ul>
          ` : ''}
          ${tasks.length > 0 ? `
            <h3>📋 Tasks due soon:</h3>
            <ul>${tasks.map(t => `<li>${t.title} <small>(Due: ${new Date(t.dueDate).toLocaleDateString()})</small></li>`).join('')}</ul>
          ` : ''}
          <p>Stay productive! 🚀</p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Reminder email sent to ${user.email}:`, info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending reminder email:', error);
    return false;
  }
};

module.exports = sendReminderEmail;
