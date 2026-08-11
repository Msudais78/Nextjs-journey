import nodemailer from 'nodemailer';

/**
 * Creates and returns a Nodemailer SMTP transporter using environment variables.
 */
function createTransporter() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // true for 465, false for other ports
    auth: {
      user,
      pass,
    },
  });
}

/**
 * Sends a secure 6-digit OTP verification email to the specified recipient.
 * 
 * In development mode (if SMTP environment variables are unconfigured),
 * it logs the OTP code to the console for testing convenience.
 * 
 * @param toEmail - Recipient email address
 * @param otp - 6-digit OTP string
 * @returns Promise<boolean> - True if sent or logged successfully, false if sending failed
 */
export async function sendOTPEmail(toEmail: string, otp: string): Promise<boolean> {
  const fromEmail = process.env.SMTP_FROM || 'no-reply@sudaisai.com';
  const appName = 'sudaisai';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verification</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0f172a; color: #f8fafc; margin: 0; padding: 40px 20px;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 520px; background-color: #1e293b; border-radius: 12px; overflow: hidden; border: 1px solid #334155; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
          <!-- Header -->
          <tr>
            <td style="padding: 30px 40px; background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: 0.5px;">${appName}</h1>
              <p style="color: #e0e7ff; margin: 6px 0 0 0; font-size: 14px;">Email Verification Code</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding: 36px 40px;">
              <p style="margin: 0 0 20px 0; font-size: 15px; color: #cbd5e1; line-height: 1.6;">
                Thank you for registering with <strong>${appName}</strong>! Use the verification code below to complete your account setup:
              </p>
              
              <!-- OTP Display Box -->
              <div style="background-color: #0f172a; border: 2px dashed #6366f1; border-radius: 8px; padding: 20px; text-align: center; margin: 25px 0;">
                <span style="font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #38bdf8; display: inline-block;">
                  ${otp}
                </span>
              </div>

              <p style="margin: 0 0 10px 0; font-size: 13px; color: #94a3b8; line-height: 1.5;">
                ⏱️ This code will expire in <strong>10 minutes</strong>.
              </p>
              <p style="margin: 0; font-size: 13px; color: #94a3b8; line-height: 1.5;">
                🔒 If you did not initiate this registration request, please ignore this message.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 20px 40px; background-color: #0f172a; text-align: center; border-top: 1px solid #334155;">
              <p style="margin: 0; font-size: 12px; color: #64748b;">
                © ${new Date().getFullYear()} ${appName}. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  const transporter = createTransporter();

  if (!transporter) {
    console.log('\n============================================================');
    console.log(`[DEV MODE] SMTP credentials missing in .env`);
    console.log(`[DEV MODE] OTP Code generated for ${toEmail}: >>> ${otp} <<<`);
    console.log('============================================================\n');
    return true;
  }

  try {
    await transporter.sendMail({
      from: `"${appName}" <${fromEmail}>`,
      to: toEmail,
      subject: `🔐 Your Verification Code for ${appName} - ${otp}`,
      text: `Your ${appName} verification code is: ${otp}. It will expire in 10 minutes.`,
      html: htmlContent,
    });
    return true;
  } catch (error) {
    console.error('Failed to send OTP email via Nodemailer:', error);
    return false;
  }
}
