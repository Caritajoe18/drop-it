import nodemailer from 'nodemailer';
import { env } from '../config/env';
import { logger } from '../utils/logger';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: env.gmail.user,
    pass: env.gmail.appPassword,
  },
});

export async function sendVerificationEmail(to: string, verificationUrl: string, name?: string  ) {
  const mailOptions = {
    from: `"Drops" <${env.gmail.user}>`,
    to,
    subject: 'Verify your Drops account',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #edf2f5; padding: 2rem; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 1.5rem;">
          <svg width="40" height="40" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
            <defs><linearGradient id="eg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#A7DBF3"/><stop offset="100%" stop-color="#5DACD4"/></linearGradient></defs>
            <path d="M16 2 C16 2 6 14 6 20 a10 10 0 0 0 20 0 C26 14 16 2 16 2Z" fill="url(#eg)"/>
          </svg>
          <h2 style="color: #1a2b3c; margin: 0.5rem 0 0;">Welcome to Drops</h2>
        </div>
        <div style="background: #ffffff; padding: 1.5rem; border-radius: 8px;">
          <p style="color: #1a2b3c;">${name ? `Hello   ${name},` : ''} Please verify your email address by clicking the button below:</p>
          <div style="text-align: center; margin: 1.5rem 0;">
            <a href="${verificationUrl}"
               style="display: inline-block; padding: 12px 28px; background: #5DACD4; color: #fff; text-decoration: none; border-radius: 8px; font-weight: 600;">
              Verify Email
            </a>
          </div>
          <p style="color: #6b7f8e; font-size: 14px;">
            Or copy this link into your browser:<br/>
            <a href="${verificationUrl}" style="color: #5DACD4;">${verificationUrl}</a>
          </p>
        </div>
        <p style="color: #6b7f8e; font-size: 12px; text-align: center; margin-top: 1rem;">This link expires in 12 hours. If you didn't create an account, you can ignore this email.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    logger.info(`Verification email sent to ${to}`);
  } catch (error) {
    logger.error(`Failed to send verification email to ${to}:`, error);
    throw new Error('Failed to send verification email. Please try again later.');
  }
}
