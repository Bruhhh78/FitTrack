const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async (options) => {
  const emailFrom = process.env.EMAIL_FROM || 'anmolsrivastava678@gmail.com';
  const emailFromName = process.env.EMAIL_FROM_NAME || 'FitTrack Support';

  const mailOptions = {
    from: `"${emailFromName}" <${emailFrom}>`,
    to: options.email,
    subject: options.subject,
    html: options.html,
  };

  await transporter.sendMail(mailOptions);
};

// Common Styles & Footer matching FitTrack Dark Theme
const emailFooter = `
  <div style="padding: 30px; text-align: center; background: #0f172a; border-top: 1px solid rgba(148, 163, 184, 0.12);">
    <div style="margin-bottom: 20px;">
      <a href="#" style="margin: 0 12px; text-decoration: none; color: #06b6d4; font-size: 14px; font-weight: 700;">Instagram</a>
      <a href="#" style="margin: 0 12px; text-decoration: none; color: #06b6d4; font-size: 14px; font-weight: 700;">Facebook</a>
      <a href="#" style="margin: 0 12px; text-decoration: none; color: #06b6d4; font-size: 14px; font-weight: 700;">Website</a>
    </div>
    <p style="color: #94a3b8; font-size: 13px; margin: 0 0 10px 0; font-family: 'Outfit', sans-serif; font-weight: 600; letter-spacing: 0.5px;">
      FITTRACK — HIGH PERFORMANCE COACHING
    </p>
    <p style="color: #64748b; font-size: 11px; margin: 0; line-height: 1.5;">
      You received this email because you are a registered member of FitTrack.<br>
      <a href="#" style="color: #94a3b8; text-decoration: underline;">Unsubscribe</a> | <a href="#" style="color: #94a3b8; text-decoration: underline;">Privacy Policy</a>
    </p>
  </div>
`;

// Welcome Email Template Redesigned (Electric Violet + Neon Cyan)
const sendWelcomeEmail = async (user) => {
  const html = `
    <div style="font-family: 'Outfit', 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 20px auto; background: #030712; color: #f1f5f9; border-radius: 24px; overflow: hidden; border: 1px solid rgba(148, 163, 184, 0.1); box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
      <div style="background: linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%); padding: 60px 40px; text-align: center; border-bottom: 1px solid rgba(148, 163, 184, 0.1);">
        <h1 style="color: #ffffff; margin: 0; font-size: 36px; font-weight: 900; letter-spacing: -1.5px; text-transform: uppercase;">FITTRACK</h1>
        <p style="color: #ffffff; font-weight: 700; margin: 10px 0 0 0; opacity: 0.9; font-size: 13px; letter-spacing: 3px; text-transform: uppercase;">The Transformation Begins</p>
      </div>
      
      <div style="padding: 50px 40px;">
        <h2 style="font-size: 26px; color: #ffffff; margin: 0 0 20px 0; font-weight: 800;">Welcome to the Elite, ${user.name.split(' ')[0]}!</h2>
        <p style="color: #94a3b8; line-height: 1.8; font-size: 16px; margin: 0 0 30px 0;">
          You've just taken the single biggest step toward your physical and mental goals. We don't just track metrics; we build discipline, daily streaks, and routines that endure.
        </p>
        
        <div style="background: #0f172a; padding: 30px; border-radius: 20px; border: 1px solid rgba(148, 163, 184, 0.12); margin-bottom: 40px;">
          <h3 style="color: #06b6d4; margin: 0 0 16px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; font-weight: 800;">Getting Started Checklist</h3>
          <ul style="padding-left: 0; margin: 0; list-style: none; color: #f1f5f9; font-size: 15px;">
            <li style="margin-bottom: 12px; display: table;">
              <span style="color: #8b5cf6; padding-right: 10px; font-weight: bold; display: table-cell;">✓</span>
              <span style="display: table-cell;">Complete your Day 1 Measurements & Photos</span>
            </li>
            <li style="margin-bottom: 12px; display: table;">
              <span style="color: #8b5cf6; padding-right: 10px; font-weight: bold; display: table-cell;">✓</span>
              <span style="display: table-cell;">Set your target weight and calorie goal</span>
            </li>
            <li style="margin-bottom: 0; display: table;">
              <span style="color: #8b5cf6; padding-right: 10px; font-weight: bold; display: table-cell;">✓</span>
              <span style="display: table-cell;">Review your custom batch curriculum & files</span>
            </li>
          </ul>
        </div>
        
        <div style="text-align: center;">
          <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/dashboard" style="background: linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%); color: #ffffff; padding: 18px 44px; border-radius: 50px; text-decoration: none; font-weight: 800; font-size: 15px; display: inline-block; box-shadow: 0 10px 25px rgba(139, 92, 246, 0.3); border: 1px solid rgba(139, 92, 246, 0.4); text-transform: uppercase; letter-spacing: 0.5px;">
            ENTER YOUR DASHBOARD
          </a>
        </div>
      </div>
      
      ${emailFooter}
    </div>
  `;

  await sendEmail({
    email: user.email,
    subject: 'Welcome to FitTrack! Your Transformation Starts Now 🚀',
    html,
  });
};

// Daily Reminder Template Redesigned (Electric Violet + Neon Cyan)
const sendDailyReminder = async (user) => {
  const html = `
    <div style="font-family: 'Outfit', 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 20px auto; background: #030712; color: #f1f5f9; border-radius: 24px; overflow: hidden; border: 1px solid rgba(148, 163, 184, 0.1); box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
      <div style="background: #0f172a; padding: 40px; border-bottom: 1px solid rgba(148, 163, 184, 0.12); text-align: center;">
        <span style="background: rgba(6, 182, 212, 0.08); color: #06b6d4; padding: 8px 20px; border-radius: 50px; font-size: 12px; font-weight: 800; letter-spacing: 1.5px; border: 1px solid rgba(6, 182, 212, 0.15); text-transform: uppercase;">
          MORNING CHECK-IN
        </span>
      </div>
      
      <div style="padding: 50px 40px; text-align: center;">
        <h2 style="font-size: 28px; color: #ffffff; margin: 0 0 12px 0; font-weight: 800;">Time to log, ${user.name.split(' ')[0]}! ☀️</h2>
        <p style="color: #94a3b8; line-height: 1.8; font-size: 16px; margin: 0 0 40px 0;">
          Consistency is the difference between goals and achievements. Open your tracker to log yesterday's data and keep your streak alive.
        </p>
        
        <!-- Table grid for compatibility -->
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 40px;">
          <tr>
            <td style="width: 33%; padding: 8px; border: none;">
              <div style="background: #0f172a; padding: 24px 12px; border-radius: 16px; border: 1px solid rgba(148, 163, 184, 0.12); text-align: center;">
                <div style="font-size: 24px; margin-bottom: 8px; line-height: 1;">⚖️</div>
                <div style="font-size: 11px; color: #94a3b8; font-weight: 800; letter-spacing: 1px; text-transform: uppercase;">WEIGHT</div>
              </div>
            </td>
            <td style="width: 33%; padding: 8px; border: none;">
              <div style="background: #0f172a; padding: 24px 12px; border-radius: 16px; border: 1px solid rgba(148, 163, 184, 0.12); text-align: center;">
                <div style="font-size: 24px; margin-bottom: 8px; line-height: 1;">📏</div>
                <div style="font-size: 11px; color: #94a3b8; font-weight: 800; letter-spacing: 1px; text-transform: uppercase;">MEASURES</div>
              </div>
            </td>
            <td style="width: 33%; padding: 8px; border: none;">
              <div style="background: #0f172a; padding: 24px 12px; border-radius: 16px; border: 1px solid rgba(148, 163, 184, 0.12); text-align: center;">
                <div style="font-size: 24px; margin-bottom: 8px; line-height: 1;">🍎</div>
                <div style="font-size: 11px; color: #94a3b8; font-weight: 800; letter-spacing: 1px; text-transform: uppercase;">MEALS</div>
              </div>
            </td>
          </tr>
        </table>
        
        <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/dashboard" style="background: #8b5cf6; color: #ffffff; padding: 18px 44px; border-radius: 50px; text-decoration: none; font-weight: 800; font-size: 15px; display: inline-block; box-shadow: 0 10px 25px rgba(139, 92, 246, 0.25); border: 1px solid rgba(139, 92, 246, 0.3); text-transform: uppercase; letter-spacing: 0.5px;">
          LOG TODAY'S PROGRESS
        </a>
      </div>
      
      ${emailFooter}
    </div>
  `;

  await sendEmail({
    email: user.email,
    subject: 'Wake up! Time for your daily stats ☀️',
    html,
  });
};

// Admin Missing Stats Alert Redesigned (Dark Danger Theme)
const sendAdminAlert = async (adminEmail, userData, daysMissed) => {
  const html = `
    <div style="font-family: 'Outfit', 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 20px auto; background: #030712; color: #f1f5f9; border-radius: 24px; overflow: hidden; border: 1px solid #ef4444; box-shadow: 0 20px 40px rgba(239, 68, 68, 0.15);">
      <div style="background: #ef4444; padding: 32px 40px; text-align: center; border-bottom: 1px solid rgba(148, 163, 184, 0.1);">
        <h2 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 900; letter-spacing: 1px; text-transform: uppercase; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">⚠️ Athlete Inactivity Alert</h2>
      </div>
      
      <div style="padding: 40px;">
        <p style="color: #94a3b8; font-size: 16px; margin: 0 0 28px 0; line-height: 1.6; text-align: center;">
          The following athlete has missed logging their metrics for <strong>${daysMissed === 'ever' ? 'multiple' : daysMissed} days</strong>. Personal coach reach-out is recommended.
        </p>
        
        <div style="background: #0f172a; padding: 25px; border-radius: 20px; border: 1px solid rgba(148, 163, 184, 0.12); margin-bottom: 32px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr style="border-bottom: 1px solid rgba(148, 163, 184, 0.08);">
              <td style="padding: 10px 0; color: #94a3b8; font-size: 14px; font-weight: 500;">👤 Athlete Name</td>
              <td style="padding: 10px 0; color: #ffffff; font-size: 14px; font-weight: 700; text-align: right;">${userData.name}</td>
            </tr>
            <tr style="border-bottom: 1px solid rgba(148, 163, 184, 0.08);">
              <td style="padding: 10px 0; color: #94a3b8; font-size: 14px; font-weight: 500;">🏋️ Program</td>
              <td style="padding: 10px 0; color: #06b6d4; font-size: 14px; font-weight: 700; text-align: right;">${userData.batchName}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #94a3b8; font-size: 14px; font-weight: 500;">📧 Email Address</td>
              <td style="padding: 10px 0; color: #ffffff; font-size: 13px; font-weight: 600; text-align: right;">${userData.email}</td>
            </tr>
          </table>
        </div>
        
        <div style="text-align: center;">
          <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/admin" style="background: #ef4444; color: #ffffff; padding: 16px 36px; border-radius: 50px; text-decoration: none; font-weight: 800; font-size: 14px; display: inline-block; box-shadow: 0 10px 20px rgba(239, 68, 68, 0.25); text-transform: uppercase; letter-spacing: 0.5px; border: 1px solid rgba(239, 68, 68, 0.4);">
            LAUNCH COACH CONSOLE
          </a>
        </div>
      </div>
      
      ${emailFooter}
    </div>
  `;

  await sendEmail({
    email: adminEmail,
    subject: `⚠️ Inactivity Alert: ${userData.name} is missing updates`,
    html,
  });
};

// Admin Enrollment Notification Template Redesigned (Electric Violet + Neon Cyan Theme)
const sendAdminEnrollmentNotification = async (adminEmail, user, batchName, method) => {
  const html = `
    <div style="font-family: 'Outfit', 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 20px auto; background: #030712; color: #f1f5f9; border-radius: 24px; overflow: hidden; border: 1px solid rgba(148, 163, 184, 0.1); box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);">
      <!-- Header Banner with Premium Gradient and Pattern -->
      <div style="background: linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%); padding: 48px 40px; text-align: center; border-bottom: 1px solid rgba(148, 163, 184, 0.1); position: relative;">
        <div style="font-size: 48px; margin-bottom: 16px; line-height: 1;">⚡</div>
        <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px; text-transform: uppercase; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">New Enrollment Active</h1>
        <p style="color: #ffffff; font-weight: 700; margin: 8px 0 0 0; font-size: 12px; letter-spacing: 2.5px; text-transform: uppercase; opacity: 0.95;">FitTrack Coach Dashboard Notification</p>
      </div>
      
      <!-- Content Section -->
      <div style="padding: 40px;">
        <p style="color: #94a3b8; font-size: 16px; margin: 0 0 32px 0; line-height: 1.6; text-align: center;">
          Hello Coach, a new athlete has just registered and unlocked their program. Here is the onboarding profile:
        </p>
        
        <!-- Profile Card -->
        <div style="background: #0f172a; border-radius: 20px; border: 1px solid rgba(148, 163, 184, 0.12); padding: 32px; margin-bottom: 32px; box-shadow: inset 0 2px 4px rgba(0,0,0,0.3);">
          
          <!-- Avatar and Basic Info using Table for Client Compatibility -->
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
            <tr>
              <td style="width: 56px; padding-right: 16px; vertical-align: middle;">
                <div style="width: 56px; height: 56px; background: linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #ffffff; font-weight: 800; font-size: 22px; text-align: center; line-height: 56px; box-shadow: 0 4px 10px rgba(139, 92, 246, 0.3);">
                  ${user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
              </td>
              <td style="vertical-align: middle;">
                <h3 style="color: #ffffff; margin: 0; font-size: 18px; font-weight: 700; line-height: 1.2;">${user.name}</h3>
                <p style="color: #94a3b8; margin: 4px 0 0 0; font-size: 14px; line-height: 1.2;">${user.email}</p>
              </td>
            </tr>
          </table>
          
          <hr style="border: 0; border-top: 1px solid rgba(148, 163, 184, 0.12); margin: 20px 0;" />
          
          <!-- Detail Grid / Rows -->
          <table style="width: 100%; border-collapse: collapse;">
            <tr style="border-bottom: 1px solid rgba(148, 163, 184, 0.08);">
              <td style="padding: 12px 0; color: #94a3b8; font-size: 14px; font-weight: 500; width: 40%;">📞 Phone Number</td>
              <td style="padding: 12px 0; color: #ffffff; font-size: 15px; font-weight: 600; text-align: right;">${user.phone || 'Not Provided'}</td>
            </tr>
            <tr style="border-bottom: 1px solid rgba(148, 163, 184, 0.08);">
              <td style="padding: 12px 0; color: #94a3b8; font-size: 14px; font-weight: 500;">🏋️ Selected Program</td>
              <td style="padding: 12px 0; color: #06b6d4; font-size: 15px; font-weight: 700; text-align: right;">${batchName}</td>
            </tr>
            <tr style="border-bottom: 1px solid rgba(148, 163, 184, 0.08);">
              <td style="padding: 12px 0; color: #94a3b8; font-size: 14px; font-weight: 500;">💳 Payment Method</td>
              <td style="padding: 12px 0; color: #8b5cf6; font-size: 15px; font-weight: 600; text-align: right;">
                <span style="background: rgba(139, 92, 246, 0.08); color: #a78bfa; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 700; border: 1px solid rgba(139, 92, 246, 0.15); text-transform: uppercase;">
                  ${method}
                </span>
              </td>
            </tr>
            <tr>
              <td style="padding: 12px 0; color: #94a3b8; font-size: 14px; font-weight: 500;">📅 Date Enrolled</td>
              <td style="padding: 12px 0; color: #06b6d4; font-size: 14px; font-weight: 600; text-align: right;">
                ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' })}
              </td>
            </tr>
          </table>
        </div>
        
        <!-- Action Button -->
        <div style="text-align: center; margin-top: 36px;">
          <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/admin" style="background: linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%); color: #ffffff; padding: 16px 36px; border-radius: 50px; text-decoration: none; font-weight: 800; font-size: 15px; letter-spacing: 0.5px; display: inline-block; box-shadow: 0 10px 20px rgba(139, 92, 246, 0.25); border: 1px solid rgba(139, 92, 246, 0.4); text-transform: uppercase;">
            LAUNCH COACH CONSOLE
          </a>
        </div>
      </div>
      
      ${emailFooter}
    </div>
  `;

  await sendEmail({
    email: adminEmail,
    subject: `🎓 New Enrollment: ${user.name} joined ${batchName}`,
    html,
  });
};

module.exports = { sendWelcomeEmail, sendDailyReminder, sendAdminAlert, sendAdminEnrollmentNotification };
