/**
 * @file src/utils/email.ts
 * @description Email dispatch utility module using Nodemailer with Gmail.
 */

import nodemailer from 'nodemailer';
import { getOTPVerificationEmailHtml } from '@/utils/email-templates';

/**
 * Sends a secure 6-digit OTP verification email to the specified recipient using Gmail.
 * 
 * @param toEmail - Recipient email address
 * @param otp - 6-digit OTP string
 * @returns Promise<boolean> - True if sent successfully, false if sending failed
 */
export async function sendOTPEmail(toEmail: string, otp: string): Promise<boolean> {
  const appName = 'sudaisai';
  const htmlContent = getOTPVerificationEmailHtml(appName, otp);

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'sudaisj27@gmail.com',
        pass: 'veix acok fmmz jicu'
      }
    });

    const mailOptions = {
      from: `"sudaisai" <sudaisj27@gmail.com>`,
      to: toEmail,
      subject: `🔐 Your Verification Code for ${appName} - ${otp}`,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[Nodemailer] OTP email dispatched successfully to ${toEmail}. Message ID: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error('[Nodemailer Error] Failed to send OTP email:', error);
    return false;
  }
}
