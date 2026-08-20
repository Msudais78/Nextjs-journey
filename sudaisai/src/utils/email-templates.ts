// ==============================================================================
// EMAIL TEMPLATES
// ==============================================================================
// This module provides HTML email template generators for transactional emails.
// Each function returns a complete HTML string ready to be sent via Nodemailer.
// Templates use inline CSS for maximum email client compatibility.
// ==============================================================================

/**
 * Generates the HTML content for the OTP verification email.
 * Sent during user registration to verify email ownership.
 * 
 * Template Structure:
 * - Header: Purple gradient banner with app name and "Email Verification Code" subtitle
 * - Body: Welcome message + prominently displayed OTP code in a dashed box
 * - Footer: Copyright notice with dynamic year
 * 
 * @param appName - The name of the application sending the email
 * @param otp - The one-time password code to display
 * @returns The complete HTML string for the verification email
 */
export function getOTPVerificationEmailHtml(appName: string, otp: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verification</title>
      </head>
      <!-- Email body with dark slate background for a modern look -->
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0f172a; color: #f8fafc; margin: 0; padding: 40px 20px;">
        <!-- Main content card with rounded corners and subtle border -->
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 520px; background-color: #1e293b; border-radius: 12px; overflow: hidden; border: 1px solid #334155; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
          <!-- Header: Purple gradient banner with app branding -->
          <tr>
            <td style="padding: 30px 40px; background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: 0.5px;">${appName}</h1>
              <p style="color: #e0e7ff; margin: 6px 0 0 0; font-size: 14px;">Email Verification Code</p>
            </td>
          </tr>
          <!-- Body: Welcome message and OTP display -->
          <tr>
            <td style="padding: 36px 40px;">
              <!-- Welcome paragraph explaining why the user is receiving this email -->
              <p style="margin: 0 0 20px 0; font-size: 15px; color: #cbd5e1; line-height: 1.6;">
                Thank you for registering with <strong>${appName}</strong>! Use the verification code below to complete your account setup:
              </p>
              
              <!-- OTP Display Box: Large monospace font with dashed border for visual emphasis -->
              <div style="background-color: #0f172a; border: 2px dashed #6366f1; border-radius: 8px; padding: 20px; text-align: center; margin: 25px 0;">
                <span style="font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #38bdf8; display: inline-block;">
                  ${otp}
                </span>
              </div>

              <!-- Expiration notice: Warns user the OTP is time-limited -->
              <p style="margin: 0 0 10px 0; font-size: 13px; color: #94a3b8; line-height: 1.5;">
                ⏱️ This code will expire in <strong>10 minutes</strong>.
              </p>
              <!-- Security disclaimer: Advises user to ignore if they didn't request this -->
              <p style="margin: 0; font-size: 13px; color: #94a3b8; line-height: 1.5;">
                🔒 If you did not initiate this registration request, please ignore this message.
              </p>
            </td>
          </tr>
          <!-- Footer: Copyright notice with dynamic year -->
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
}

/**
 * Generates the HTML content for the password reset email.
 * Sent when a user requests to reset their forgotten password.
 * 
 * Template Structure:
 * - Header: Amber/gold gradient banner with app name and "Password Reset Request" subtitle
 * - Body: Explanation message + prominent yellow "Reset Password" button + fallback plain-text link
 * - Footer: Copyright notice with dynamic year
 * 
 * @param appName - The name of the application sending the email
 * @param resetUrl - The complete URL with the raw token for resetting the password
 * @returns The complete HTML string for the password reset email
 */
export function getResetPasswordEmailHtml(appName: string, resetUrl: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
      </head>
      <!-- Email body with dark slate background for a modern look -->
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0f172a; color: #f8fafc; margin: 0; padding: 40px 20px;">
        <!-- Main content card with rounded corners and subtle border -->
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 520px; background-color: #1e293b; border-radius: 12px; overflow: hidden; border: 1px solid #334155; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
          <!-- Header: Amber/gold gradient banner with app branding -->
          <tr>
            <td style="padding: 30px 40px; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: 0.5px;">${appName}</h1>
              <p style="color: #fef3c7; margin: 6px 0 0 0; font-size: 14px;">Password Reset Request</p>
            </td>
          </tr>
          <!-- Body: Reset instructions and call-to-action button -->
          <tr>
            <td style="padding: 36px 40px;">
              <!-- Explanation paragraph telling the user why they received this email -->
              <p style="margin: 0 0 20px 0; font-size: 15px; color: #cbd5e1; line-height: 1.6;">
                We received a request to reset the password for your <strong>${appName}</strong> account. Click the button below to choose a new password:
              </p>
              
              <!-- Reset Button: Prominent yellow CTA button linking to the reset page with the token -->
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" style="background-color: #fde047; color: #000000; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; display: inline-block; transition: background-color 0.3s;">
                  Reset Password
                </a>
              </div>

              <!-- Fallback Link: Plain-text URL for email clients that don't render buttons properly -->
              <p style="margin: 0 0 10px 0; font-size: 13px; color: #94a3b8; line-height: 1.5;">
                Or copy and paste this link into your browser:<br>
                <a href="${resetUrl}" style="color: #38bdf8; word-break: break-all;">${resetUrl}</a>
              </p>
              
              <!-- Expiration notice: Warns user the link is time-limited (15 minutes) -->
              <p style="margin: 20px 0 10px 0; font-size: 13px; color: #94a3b8; line-height: 1.5;">
                ⏱️ This link will expire in <strong>15 minutes</strong>.
              </p>
              <!-- Security disclaimer: Advises user to ignore if they didn't request this -->
              <p style="margin: 0; font-size: 13px; color: #94a3b8; line-height: 1.5;">
                🔒 If you did not request a password reset, please ignore this email or contact support if you have concerns.
              </p>
            </td>
          </tr>
          <!-- Footer: Copyright notice with dynamic year -->
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
}
