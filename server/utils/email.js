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
  const mailOptions = {
    from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM}>`,
    to: options.email,
    subject: options.subject,
    html: options.html,
  };

  await transporter.sendMail(mailOptions);
};

// Common Styles & Footer
const emailFooter = `
  <div style="padding: 30px; text-align: center; background: #16181a; border-top: 1px solid #2d2f31;">
    <div style="margin-bottom: 20px;">
      <a href="#" style="margin: 0 10px; text-decoration: none; color: #f59e0b; font-size: 14px; font-weight: 700;">Instagram</a>
      <a href="#" style="margin: 0 10px; text-decoration: none; color: #f59e0b; font-size: 14px; font-weight: 700;">Facebook</a>
      <a href="#" style="margin: 0 10px; text-decoration: none; color: #f59e0b; font-size: 14px; font-weight: 700;">Website</a>
    </div>
    <p style="color: #6b7280; font-size: 12px; margin-bottom: 10px;">
      FitTrack - High Performance Coaching
    </p>
    <p style="color: #4b5563; font-size: 11px;">
      You received this email because you are a registered member of FitTrack.<br>
      <a href="#" style="color: #6b7280; text-decoration: underline;">Unsubscribe</a> | <a href="#" style="color: #6b7280; text-decoration: underline;">Privacy Policy</a>
    </p>
  </div>
`;

// Welcome Email Template
const sendWelcomeEmail = async (user) => {
  const html = `
    <div style="font-family: 'Outfit', 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f1012; color: #f3f4f6; border-radius: 20px; overflow: hidden; border: 1px solid #2d2f31;">
      <div style="background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%); padding: 60px 40px; text-align: center; position: relative;">
        <h1 style="color: #000; margin: 0; font-size: 32px; font-weight: 900; letter-spacing: -1px;">FITTRACK</h1>
        <p style="color: #000; font-weight: 700; margin-top: 10px; opacity: 0.8; font-size: 14px; letter-spacing: 2px;">THE TRANSFORMATION BEGINS</p>
      </div>
      
      <div style="padding: 50px 40px;">
        <h2 style="font-size: 24px; color: #fff; margin-bottom: 20px;">Welcome to the Elite, ${user.name.split(' ')[0]}!</h2>
        <p style="color: #9ca3af; line-height: 1.8; font-size: 16px; margin-bottom: 30px;">
          You've just taken the biggest step toward your fitness goals. We don't just track weight; we build discipline, strength, and a lifestyle that lasts.
        </p>
        
        <div style="background: #1a1c1e; padding: 30px; border-radius: 16px; border: 1px solid #2d2f31; margin-bottom: 40px;">
          <h3 style="color: #f59e0b; margin-top: 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Getting Started</h3>
          <ul style="padding-left: 0; list-style: none; color: #f3f4f6; font-size: 15px;">
            <li style="margin-bottom: 12px;">✅ Complete your Day 1 Measurements</li>
            <li style="margin-bottom: 12px;">✅ Set your Target Weight goal</li>
            <li style="margin-bottom: 12px;">✅ Check out your Batch Curriculum</li>
          </ul>
        </div>
        
        <div style="text-align: center;">
          <a href="${process.env.CLIENT_URL}/dashboard" style="background: #f59e0b; color: #000; padding: 18px 40px; border-radius: 12px; text-decoration: none; font-weight: 800; display: inline-block; box-shadow: 0 10px 20px rgba(245, 158, 11, 0.2);">ENTER YOUR DASHBOARD</a>
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

// Daily Reminder Template
const sendDailyReminder = async (user) => {
  const html = `
    <div style="font-family: 'Outfit', 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f1012; color: #f3f4f6; border-radius: 20px; overflow: hidden; border: 1px solid #2d2f31;">
      <div style="background: #1a1c1e; padding: 40px; border-bottom: 1px solid #2d2f31; text-align: center;">
        <span style="background: rgba(245, 158, 11, 0.1); color: #f59e0b; padding: 8px 16px; border-radius: 50px; font-size: 12px; font-weight: 800; letter-spacing: 1px;">MORNING CHECK-IN</span>
      </div>
      
      <div style="padding: 50px 40px; text-align: center;">
        <h2 style="font-size: 28px; color: #fff; margin-bottom: 10px;">Time to log, ${user.name.split(' ')[0]}! ☀️</h2>
        <p style="color: #9ca3af; line-height: 1.8; font-size: 16px; margin-bottom: 40px;">
          Yesterday is history, tomorrow is a mystery, but today is where the work happens. Don't break the streak!
        </p>
        
        <div style="display: table; width: 100%; margin-bottom: 40px;">
          <div style="display: table-cell; padding: 10px;">
            <div style="background: #16181a; padding: 20px; border-radius: 12px; border: 1px solid #2d2f31;">
              <div style="color: #f59e0b; font-size: 20px; margin-bottom: 5px;">⚖️</div>
              <div style="font-size: 12px; color: #6b7280; font-weight: 700;">WEIGHT</div>
            </div>
          </div>
          <div style="display: table-cell; padding: 10px;">
            <div style="background: #16181a; padding: 20px; border-radius: 12px; border: 1px solid #2d2f31;">
              <div style="color: #f59e0b; font-size: 20px; margin-bottom: 5px;">📏</div>
              <div style="font-size: 12px; color: #6b7280; font-weight: 700;">MEASURE</div>
            </div>
          </div>
          <div style="display: table-cell; padding: 10px;">
            <div style="background: #16181a; padding: 20px; border-radius: 12px; border: 1px solid #2d2f31;">
              <div style="color: #f59e0b; font-size: 20px; margin-bottom: 5px;">🍎</div>
              <div style="font-size: 12px; color: #6b7280; font-weight: 700;">MEALS</div>
            </div>
          </div>
        </div>
        
        <a href="${process.env.CLIENT_URL}/dashboard" style="background: #f59e0b; color: #000; padding: 18px 40px; border-radius: 12px; text-decoration: none; font-weight: 800; display: inline-block;">LOG TODAY'S PROGRESS</a>
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

// Admin Missing Stats Alert
const sendAdminAlert = async (adminEmail, userData, daysMissed) => {
  const html = `
    <div style="font-family: 'Outfit', 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f1012; color: #f3f4f6; border-radius: 20px; overflow: hidden; border: 1px solid #ef4444;">
      <div style="background: #ef4444; padding: 30px; text-align: center;">
        <h2 style="color: white; margin: 0; font-size: 18px; font-weight: 900; letter-spacing: 1px;">ATTENTION: USER INACTIVITY ⚠️</h2>
      </div>
      
      <div style="padding: 40px;">
        <p style="color: #9ca3af; font-size: 16px; margin-bottom: 30px;">
          The following student has been inactive for <strong>${daysMissed === 'ever' ? 'multiple' : daysMissed} days</strong>. They might need a personal touch-base.
        </p>
        
        <div style="background: #1a1c1e; padding: 25px; border-radius: 12px; border: 1px solid #2d2f31; margin-bottom: 30px;">
          <p style="margin: 8px 0; color: #fff;"><strong>User:</strong> ${userData.name}</p>
          <p style="margin: 8px 0; color: #f59e0b;"><strong>Batch:</strong> ${userData.batchName}</p>
          <p style="margin: 8px 0; color: #6b7280; font-size: 14px;"><strong>Email:</strong> ${userData.email}</p>
        </div>
        
        <div style="text-align: center;">
          <a href="${process.env.CLIENT_URL}/admin" style="background: #fff; color: #000; padding: 14px 30px; border-radius: 8px; text-decoration: none; font-weight: 800; display: inline-block;">TAKE ACTION IN ADMIN PANEL</a>
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

module.exports = { sendWelcomeEmail, sendDailyReminder, sendAdminAlert };
