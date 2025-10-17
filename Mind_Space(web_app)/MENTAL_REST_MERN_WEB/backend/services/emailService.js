const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    // For development, we'll use a simple console log
    // In production, you would configure with real email service
    this.transporter = null;
    this.isConfigured = false;
    
    // Initialize email service if credentials are provided
    this.initialize();
  }

  initialize() {
    // Check if email credentials are provided
    if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      this.transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT || 587,
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });
      this.isConfigured = true;
      console.log('✅ Email service configured');
    } else {
      console.log('⚠️  Email service not configured - using console logging for development');
    }
  }

  async sendPasswordResetEmail(email, resetUrl) {
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@mindspace.com',
      to: email,
      subject: 'Reset Your MindSpace Password',
      html: this.getPasswordResetTemplate(resetUrl)
    };

    if (this.isConfigured) {
      try {
        await this.transporter.sendMail(mailOptions);
        console.log(`✅ Password reset email sent to ${email}`);
        return true;
      } catch (error) {
        console.error('❌ Failed to send email:', error);
        return false;
      }
    } else {
      // Development mode - log the email content
      console.log('\n📧 PASSWORD RESET EMAIL (Development Mode)');
      console.log('=====================================');
      console.log(`To: ${email}`);
      console.log(`Subject: ${mailOptions.subject}`);
      console.log(`Reset URL: ${resetUrl}`);
      console.log('=====================================\n');
      return true;
    }
  }

  getPasswordResetTemplate(resetUrl) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password - MindSpace</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Reset Your Password</h1>
            <p>MindSpace - Your Mental Wellness Journey</p>
          </div>
          <div class="content">
            <h2>Hello!</h2>
            <p>We received a request to reset your password for your MindSpace account.</p>
            <p>Click the button below to reset your password:</p>
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">Reset Password</a>
            </div>
            <p><strong>This link will expire in 1 hour for security reasons.</strong></p>
            <p>If you didn't request this password reset, please ignore this email. Your password will remain unchanged.</p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
            <p><strong>Security Tips:</strong></p>
            <ul>
              <li>Never share your password with anyone</li>
              <li>Use a strong, unique password</li>
              <li>Enable two-factor authentication if available</li>
            </ul>
          </div>
          <div class="footer">
            <p>© 2024 MindSpace. All rights reserved.</p>
            <p>This email was sent from a notification-only address. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  async sendWelcomeEmail(email, name) {
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@mindspace.com',
      to: email,
      subject: 'Welcome to MindSpace! 🌟',
      html: this.getWelcomeTemplate(name)
    };

    if (this.isConfigured) {
      try {
        await this.transporter.sendMail(mailOptions);
        console.log(`✅ Welcome email sent to ${email}`);
        return true;
      } catch (error) {
        console.error('❌ Failed to send welcome email:', error);
        return false;
      }
    } else {
      console.log('\n📧 WELCOME EMAIL (Development Mode)');
      console.log('=====================================');
      console.log(`To: ${email}`);
      console.log(`Subject: ${mailOptions.subject}`);
      console.log('=====================================\n');
      return true;
    }
  }

  getWelcomeTemplate(name) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to MindSpace</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🌟 Welcome to MindSpace!</h1>
            <p>Your Mental Wellness Journey Starts Here</p>
          </div>
          <div class="content">
            <h2>Hello ${name}!</h2>
            <p>Welcome to MindSpace! We're thrilled to have you join our community of people committed to mental wellness and personal growth.</p>
            <p>Here's what you can do with MindSpace:</p>
            <ul>
              <li>📝 <strong>Journal Your Thoughts:</strong> Express yourself freely in a safe, private space</li>
              <li>🧠 <strong>AI-Powered Insights:</strong> Get personalized wellness recommendations</li>
              <li>📊 <strong>Track Your Progress:</strong> Monitor your mental wellness journey</li>
              <li>🎯 <strong>Set Wellness Goals:</strong> Work towards your mental health objectives</li>
            </ul>
            <div style="text-align: center;">
              <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/dashboard" class="button">Start Your Journey</a>
            </div>
            <p><strong>Getting Started Tips:</strong></p>
            <ul>
              <li>Write your first journal entry today</li>
              <li>Set a wellness goal that matters to you</li>
              <li>Explore our mindfulness resources</li>
              <li>Check in with your mood regularly</li>
            </ul>
            <p>Remember, taking care of your mental health is a journey, not a destination. We're here to support you every step of the way.</p>
          </div>
          <div class="footer">
            <p>© 2024 MindSpace. All rights reserved.</p>
            <p>Questions? Contact us at support@mindspace.com</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

module.exports = new EmailService();
