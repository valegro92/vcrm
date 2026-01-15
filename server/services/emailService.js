/**
 * Email Service for VAIB
 * Handles email verification and password reset emails
 */

const nodemailer = require('nodemailer');

// Create transporter based on environment
const createTransporter = () => {
  // If no SMTP config, use ethereal for testing (emails won't be sent)
  if (!process.env.SMTP_HOST) {
    console.warn('[Email] No SMTP config found. Emails will be logged but not sent.');
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};

let transporter = null;

// Initialize transporter lazily
const getTransporter = () => {
  if (!transporter) {
    transporter = createTransporter();
  }
  return transporter;
};

const APP_NAME = 'VAIB';
const APP_URL = process.env.APP_URL || 'http://localhost:3000';

/**
 * Send email verification
 */
const sendVerificationEmail = async (email, token, fullName) => {
  const verifyUrl = `${APP_URL}/verify-email/${token}`;

  const mailOptions = {
    from: `"${APP_NAME}" <${process.env.SMTP_FROM || 'noreply@vaib.app'}>`,
    to: email,
    subject: `Conferma la tua email - ${APP_NAME}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .logo { font-size: 32px; font-weight: 800; color: #6366f1; }
          .button { display: inline-block; padding: 14px 28px; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
          .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; font-size: 14px; color: #666; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">VAIB</div>
          </div>
          <h2>Ciao ${fullName || 'utente'}!</h2>
          <p>Grazie per esserti registrato su VAIB, il business assistant AI per freelancer.</p>
          <p>Per completare la registrazione, conferma il tuo indirizzo email cliccando il pulsante qui sotto:</p>
          <p style="text-align: center;">
            <a href="${verifyUrl}" class="button">Conferma Email</a>
          </p>
          <p>Oppure copia e incolla questo link nel tuo browser:</p>
          <p style="word-break: break-all; color: #6366f1;">${verifyUrl}</p>
          <p>Se non hai creato un account su VAIB, ignora questa email.</p>
          <div class="footer">
            <p>© ${new Date().getFullYear()} VAIB - AI Business Assistant</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  const transport = getTransporter();
  if (!transport) {
    console.log('[Email] Verification email would be sent to:', email);
    console.log('[Email] Verify URL:', verifyUrl);
    return { success: true, message: 'Email logged (no SMTP configured)' };
  }

  try {
    await transport.sendMail(mailOptions);
    console.log('[Email] Verification email sent to:', email);
    return { success: true };
  } catch (error) {
    console.error('[Email] Failed to send verification email:', error);
    throw error;
  }
};

/**
 * Send password reset email
 */
const sendPasswordResetEmail = async (email, token, fullName) => {
  const resetUrl = `${APP_URL}/reset-password/${token}`;

  const mailOptions = {
    from: `"${APP_NAME}" <${process.env.SMTP_FROM || 'noreply@vaib.app'}>`,
    to: email,
    subject: `Reimposta la tua password - ${APP_NAME}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .logo { font-size: 32px; font-weight: 800; color: #6366f1; }
          .button { display: inline-block; padding: 14px 28px; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
          .warning { background: #fef3cd; border: 1px solid #ffc107; padding: 12px; border-radius: 6px; margin: 20px 0; }
          .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; font-size: 14px; color: #666; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">VAIB</div>
          </div>
          <h2>Ciao ${fullName || 'utente'}!</h2>
          <p>Hai richiesto di reimpostare la password del tuo account VAIB.</p>
          <p>Clicca il pulsante qui sotto per creare una nuova password:</p>
          <p style="text-align: center;">
            <a href="${resetUrl}" class="button">Reimposta Password</a>
          </p>
          <p>Oppure copia e incolla questo link nel tuo browser:</p>
          <p style="word-break: break-all; color: #6366f1;">${resetUrl}</p>
          <div class="warning">
            <strong>Nota:</strong> Questo link scadrà tra 1 ora.
          </div>
          <p>Se non hai richiesto il reset della password, ignora questa email. La tua password rimarrà invariata.</p>
          <div class="footer">
            <p>© ${new Date().getFullYear()} VAIB - AI Business Assistant</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  const transport = getTransporter();
  if (!transport) {
    console.log('[Email] Password reset email would be sent to:', email);
    console.log('[Email] Reset URL:', resetUrl);
    return { success: true, message: 'Email logged (no SMTP configured)' };
  }

  try {
    await transport.sendMail(mailOptions);
    console.log('[Email] Password reset email sent to:', email);
    return { success: true };
  } catch (error) {
    console.error('[Email] Failed to send password reset email:', error);
    throw error;
  }
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail
};
