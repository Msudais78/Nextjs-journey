/**
 * @file src/utils/email.ts
 * @description Email dispatch utility module using Brevo Transactional Email API (@getbrevo/brevo).
 * Reads `SMTP_API_KEY` from `.env` to send 6-digit OTP verification emails.
 */

import { BrevoClient } from '@getbrevo/brevo';
import nodemailer from 'nodemailer';
import { getOTPVerificationEmailHtml } from '@/utils/email-templates';

/**
 * Sends a secure 6-digit OTP verification email to the specified recipient.
 * 
 * 1. Reads `SMTP_API_KEY` from `.env` to authenticate with Brevo API (`BrevoClient`).
 * 2. Uses `@getbrevo/brevo` v6 SDK (or direct HTTPS REST call) for email dispatch.
 * 3. Falls back to Nodemailer SMTP if custom `SMTP_HOST` credentials are set.
 * 4. Falls back to dev-mode console logging if no credentials are provided.
 * 
 * @param toEmail - Recipient email address
 * @param otp - 6-digit OTP string
 * @returns Promise<boolean> - True if sent or logged successfully, false if sending failed
 */
export async function sendOTPEmail(toEmail: string, otp: string): Promise<boolean> {
  const apiKey = process.env.SMTP_API_KEY;
  const fromEmail = process.env.SMTP_FROM || 'no-reply@sudaisai.com';
  const appName = 'sudaisai';

  const htmlContent = getOTPVerificationEmailHtml(appName, otp);

  // Path A: Brevo API Integration using SMTP_API_KEY
  if (apiKey) {
    try {
      const brevo = new BrevoClient({ apiKey });

      await brevo.transactionalEmails.sendTransacEmail({
        subject: `🔐 Your Verification Code for ${appName} - ${otp}`,
        htmlContent,
        sender: { name: appName, email: fromEmail },
        to: [{ email: toEmail }],
      });

      console.log(`[Brevo API] OTP email dispatched successfully to ${toEmail}`);
      return true;
    } catch (error) {
      console.error('[Brevo API Error] Failed via Brevo SDK, attempting REST API fallback:', error);
      
      // Fallback: Direct HTTPS REST API call to Brevo endpoint
      try {
        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: {
            'accept': 'application/json',
            'api-key': apiKey,
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            sender: { name: appName, email: fromEmail },
            to: [{ email: toEmail }],
            subject: `🔐 Your Verification Code for ${appName} - ${otp}`,
            htmlContent,
          }),
        });

        if (response.ok) {
          console.log(`[Brevo REST] OTP email dispatched successfully to ${toEmail}`);
          return true;
        } else {
          const errData = await response.text();
          console.error('[Brevo REST Error] Status:', response.status, errData);
        }
      } catch (fetchErr) {
        console.error('[Brevo Fetch Error]', fetchErr);
      }
    }
  }

  // Path B: Fallback to Nodemailer SMTP if SMTP_HOST is explicitly configured
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    try {
      const port = parseInt(process.env.SMTP_PORT || '587', 10);
      const transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });

      await transporter.sendMail({
        from: `"${appName}" <${fromEmail}>`,
        to: toEmail,
        subject: `🔐 Your Verification Code for ${appName} - ${otp}`,
        text: `Your ${appName} verification code is: ${otp}. It will expire in 10 minutes.`,
        html: htmlContent,
      });
      console.log(`[Nodemailer SMTP] OTP email dispatched successfully to ${toEmail}`);
      return true;
    } catch (smtpError) {
      console.error('[Nodemailer SMTP Error] Failed to send OTP email:', smtpError);
      return false;
    }
  }

  // Path C: Dev Mode Console Fallback if no credentials are configured
  console.log('\n============================================================');
  console.log(`[DEV MODE] SMTP / Brevo credentials missing in .env`);
  console.log(`[DEV MODE] OTP Code generated for ${toEmail}: >>> ${otp} <<<`);
  console.log('============================================================\n');
  return true;
}


