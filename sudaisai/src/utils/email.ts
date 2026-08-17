/**
 * @file src/utils/email.ts
 * @description Email dispatch utility module using MailerSend.
 * Reads `MAILERSEND_API_KEY` from `.env` to send 6-digit OTP verification emails.
 */

import { MailerSend, EmailParams, Sender, Recipient } from 'mailersend';
import { getOTPVerificationEmailHtml } from '@/utils/email-templates';

/**
 * Sends a secure 6-digit OTP verification email to the specified recipient.
 * 
 * 1. Reads `MAILERSEND_API_KEY` from `.env` to authenticate with MailerSend API.
 * 2. Uses `mailersend` for email dispatch.
 * 3. Falls back to dev-mode console logging if no credentials are provided.
 * 
 * @param toEmail - Recipient email address
 * @param otp - 6-digit OTP string
 * @returns Promise<boolean> - True if sent or logged successfully, false if sending failed
 */
export async function sendOTPEmail(toEmail: string, otp: string): Promise<boolean> {
  const apiKey = process.env.MAILERSEND_API_KEY;
  const fromEmail = process.env.SMTP_FROM;
  const appName = 'sudaisai';

  const htmlContent = getOTPVerificationEmailHtml(appName, otp);

  // Path A: MailerSend API Integration
  if (apiKey) {
    try {
      const mailerSend = new MailerSend({
        apiKey,
      });

      const sentFrom = new Sender(fromEmail as string, appName);
      const recipients = [
        new Recipient(toEmail)
      ];

      const emailParams = new EmailParams()
        .setFrom(sentFrom)
        .setTo(recipients)
        .setSubject(`🔐 Your Verification Code for ${appName} - ${otp}`)
        .setHtml(htmlContent);

      await mailerSend.email.send(emailParams);

      console.log(`[MailerSend API] OTP email dispatched successfully to ${toEmail}`);
      return true;
    } catch (error) {
      console.error('[MailerSend API Error] Failed to send OTP email:', error);
      return false;
    }
  }

  // Path B: Dev Mode Console Fallback if no credentials are configured
  console.log('\n============================================================');
  console.log(`[DEV MODE] MailerSend credentials missing in .env`);
  console.log(`[DEV MODE] OTP Code generated for ${toEmail}: >>> ${otp} <<<`);
  console.log('============================================================\n');
  return true;
}

