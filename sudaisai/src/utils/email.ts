/**
 * @file src/utils/email.ts
 * @description Email dispatch utility module using Nodemailer with Gmail SMTP.
 * 
 * This module provides functions for sending transactional emails
 * (OTP verification, password reset) using Gmail's SMTP service
 * via Nodemailer. Each function returns a boolean indicating
 * whether the email was sent successfully.
 */

// --- Dependency Imports ---
import nodemailer from 'nodemailer';                                                    // Node.js library for sending emails via SMTP
import { getOTPVerificationEmailHtml, getResetPasswordEmailHtml } from '@/utils/email-templates'; // HTML email template generators

/**
 * Sends a secure 6-digit OTP verification email to the specified recipient using Gmail.
 * Used during the user registration flow to verify email ownership.
 * 
 * @param toEmail - Recipient email address
 * @param otp - 6-digit OTP string to include in the email body
 * @returns Promise<boolean> - True if sent successfully, false if sending failed
 */
export async function sendOTPEmail(toEmail: string, otp: string): Promise<boolean> {
  // Application name used in the email subject and template branding
  const appName = 'sudaisai';

  // Generate the styled HTML email body using the OTP template
  const htmlContent = getOTPVerificationEmailHtml(appName, otp);

  try {
    // Create a reusable SMTP transporter configured for Gmail
    // Uses an App Password (not the account password) for secure authentication
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'sudaisj27@gmail.com',
        pass: 'veix acok fmmz jicu'       // Gmail App Password (16-character code from Google Account settings)
      }
    });

    // Define the email envelope: sender, recipient, subject, and HTML body
    const mailOptions = {
      from: `"sudaisai" <sudaisj27@gmail.com>`,                         // Display name and sender address
      to: toEmail,                                                       // Recipient email address
      subject: `🔐 Your Verification Code for ${appName} - ${otp}`,    // Subject line includes the OTP for quick reference
      html: htmlContent,                                                 // Styled HTML email body
    };

    // Dispatch the email via Gmail's SMTP server and await the result
    const info = await transporter.sendMail(mailOptions);
    console.log(`[Nodemailer] OTP email dispatched successfully to ${toEmail}. Message ID: ${info.messageId}`);
    return true;
  } catch (error) {
    // Log the error for server-side debugging; return false to signal failure to the caller
    console.error('[Nodemailer Error] Failed to send OTP email:', error);
    return false;
  }
}

/**
 * Sends a password reset email to the specified recipient using Gmail.
 * Used during the forgot-password flow to deliver a secure reset link.
 * 
 * @param toEmail - Recipient email address
 * @param resetUrl - Full URL containing the raw reset token (e.g., https://example.com/auth/new-password?token=abc123)
 * @returns Promise<boolean> - True if sent successfully, false if sending failed
 */
export async function sendResetPasswordEmail(toEmail: string, resetUrl: string): Promise<boolean> {
  // Application name used in the email subject and template branding
  const appName = 'sudaisai';

  // Generate the styled HTML email body using the reset password template
  // The resetUrl is embedded as a clickable button and a fallback plain-text link
  const htmlContent = getResetPasswordEmailHtml(appName, resetUrl);

  try {
    // Create a reusable SMTP transporter configured for Gmail
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'sudaisj27@gmail.com',
        pass: 'veix acok fmmz jicu'       // Gmail App Password (16-character code from Google Account settings)
      }
    });

    // Define the email envelope: sender, recipient, subject, and HTML body
    const mailOptions = {
      from: `"sudaisai" <sudaisj27@gmail.com>`,                // Display name and sender address
      to: toEmail,                                              // Recipient email address
      subject: `🔐 Reset Your Password for ${appName}`,       // Subject line for the password reset email
      html: htmlContent,                                        // Styled HTML email body with reset link
    };

    // Dispatch the email via Gmail's SMTP server and await the result
    const info = await transporter.sendMail(mailOptions);
    console.log(`[Nodemailer] Reset password email dispatched successfully to ${toEmail}. Message ID: ${info.messageId}`);
    return true;
  } catch (error) {
    // Log the error for server-side debugging; return false to signal failure to the caller
    console.error('[Nodemailer Error] Failed to send reset password email:', error);
    return false;
  }
}
