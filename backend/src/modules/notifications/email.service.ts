import nodemailer, { type Transporter } from 'nodemailer';
import { config } from '../../config';
import { logger } from '../../common/utils/logger';

let transporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (transporter) return transporter;

  const isGmail =
    config.smtp.service?.toLowerCase() === 'gmail' ||
    config.smtp.host?.toLowerCase().includes('gmail') ||
    config.smtp.user?.toLowerCase().endsWith('@gmail.com');

  if (isGmail) {
    logger.info('Initializing Nodemailer with Gmail service transport');
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: config.smtp.user
        ? { user: config.smtp.user, pass: config.smtp.pass }
        : undefined,
    });
  } else {
    logger.info(`Initializing Nodemailer with SMTP (${config.smtp.host}:${config.smtp.port})`);
    transporter = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.port === 465 ? true : config.smtp.secure,
      auth: config.smtp.user
        ? { user: config.smtp.user, pass: config.smtp.pass }
        : undefined,
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  return transporter;
}

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(options: EmailOptions): Promise<void> {
  if (config.isTest) {
    logger.debug('Email suppressed in test mode:', { to: options.to, subject: options.subject });
    return;
  }

  if (!config.smtp.user || !config.smtp.pass) {
    const errorMsg =
      'Gmail / SMTP credentials are not configured. Please set GMAIL_USER and GMAIL_APP_PASSWORD in your .env file.';
    logger.error(errorMsg);
    throw new Error(errorMsg);
  }

  const transport = getTransporter();
  try {
    const fromAddress = config.smtp.user || config.smtp.fromAddress;
    const info = await transport.sendMail({
      from: `"${config.smtp.fromName}" <${fromAddress}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });
    logger.info('Email sent successfully:', {
      to: options.to,
      subject: options.subject,
      messageId: info.messageId,
    });
  } catch (error: any) {
    logger.error('Email send failed:', {
      to: options.to,
      subject: options.subject,
      error: error.message,
    });
    throw error;
  }
}

const storeUrl = config.server.frontendUrl;

export async function sendVerificationEmail(
  to: string,
  name: string,
  token: string
): Promise<void> {
  const verifyUrl = `${storeUrl}/verify-email?token=${token}`;
  await sendEmail({
    to,
    subject: `Verify your Crown Motors EVee Account`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0d0f12; color: #ffffff; padding: 32px; border-radius: 8px;">
        <h2 style="color: #d4e790; margin-top: 0;">Welcome to EVee, ${name}!</h2>
        <p style="color: #cfd4dc;">Please verify your email address to activate your account and access your electric vehicle reservation portal.</p>
        <p style="margin: 28px 0;">
          <a href="${verifyUrl}" style="
            display: inline-block;
            padding: 14px 28px;
            background-color: #d4e790;
            color: #0b0c0e;
            text-decoration: none;
            border-radius: 6px;
            font-weight: bold;
            font-size: 14px;
            letter-spacing: 0.5px;
          ">Verify Email Address</a>
        </p>
        <p style="color: #8892b0; font-size: 13px;">This verification link will expire in 24 hours.</p>
        <hr style="border: none; border-top: 1px solid #222; margin: 24px 0;" />
        <p style="color: #666; font-size: 11px;">${config.store.name} by ${config.store.company} Pakistan</p>
      </div>
    `,
    text: `Welcome to EVee! Verify your email address: ${verifyUrl}`,
  });
}

export async function sendPasswordResetEmail(
  to: string,
  name: string,
  token: string
): Promise<void> {
  const resetUrl = `${storeUrl}/reset-password?token=${token}`;
  await sendEmail({
    to,
    subject: `Reset your EVee password`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0d0f12; color: #ffffff; padding: 32px; border-radius: 8px;">
        <h2 style="color: #d4e790; margin-top: 0;">Password Reset Request</h2>
        <p style="color: #cfd4dc;">Hi ${name},</p>
        <p style="color: #cfd4dc;">We received a request to reset your password. Click the button below to choose a new password.</p>
        <p style="margin: 28px 0;">
          <a href="${resetUrl}" style="
            display: inline-block;
            padding: 14px 28px;
            background-color: #d4e790;
            color: #0b0c0e;
            text-decoration: none;
            border-radius: 6px;
            font-weight: bold;
          ">Reset Password</a>
        </p>
        <p style="color: #8892b0; font-size: 13px;">This link expires in 1 hour.</p>
        <hr style="border: none; border-top: 1px solid #222; margin: 24px 0;" />
        <p style="color: #666; font-size: 11px;">If you did not request this, please ignore this email.</p>
      </div>
    `,
    text: `Reset your EVee password: ${resetUrl} (expires in 1 hour)`,
  });
}

export async function sendOrderConfirmationEmail(
  to: string,
  name: string,
  orderNumber: string,
  items: Array<{ name: string; quantity: number; price: string }>,
  total: string
): Promise<void> {
  const orderUrl = `${storeUrl}/orders/${orderNumber}`;
  const itemsHtml = items
    .map(
      (item) =>
        `<tr>
          <td style="padding: 10px; border-bottom: 1px solid #222; color: #fff;">${item.name}</td>
          <td style="padding: 10px; border-bottom: 1px solid #222; text-align: center; color: #aaa;">${item.quantity}</td>
          <td style="padding: 10px; border-bottom: 1px solid #222; text-align: right; color: #d4e790; font-weight: bold;">${item.price}</td>
        </tr>`
    )
    .join('');

  await sendEmail({
    to,
    subject: `Order & Vehicle Reservation Confirmed — ${orderNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0d0f12; color: #ffffff; padding: 32px; border-radius: 8px;">
        <h2 style="color: #d4e790; margin-top: 0;">Reservation Confirmed!</h2>
        <p style="color: #cfd4dc;">Hello ${name}, thank you for choosing Crown Motors.</p>
        <p style="color: #cfd4dc;"><strong>Official Order Number:</strong> <span style="font-family: monospace; color: #d4e790;">${orderNumber}</span></p>
        <table style="width: 100%; border-collapse: collapse; margin: 24px 0;">
          <thead>
            <tr style="background: #16181d; color: #888; font-size: 12px; text-transform: uppercase;">
              <th style="padding: 10px; text-align: left;">Vehicle / Item</th>
              <th style="padding: 10px; text-align: center;">Qty</th>
              <th style="padding: 10px; text-align: right;">Price</th>
            </tr>
          </thead>
          <tbody>${itemsHtml}</tbody>
        </table>
        <p style="font-size: 18px; margin: 20px 0; color: #ffffff;"><strong>Total Paid: <span style="color: #d4e790;">${total}</span></strong></p>
        <p style="margin: 24px 0;">
          <a href="${orderUrl}" style="
            display: inline-block;
            padding: 12px 24px;
            background-color: #d4e790;
            color: #0b0c0e;
            text-decoration: none;
            border-radius: 6px;
            font-weight: bold;
          ">View Order Details & Delivery Tracking</a>
        </p>
        <hr style="border: none; border-top: 1px solid #222; margin: 24px 0;" />
        <p style="color: #666; font-size: 11px;">${config.store.name} by ${config.store.company}</p>
      </div>
    `,
    text: `Order ${orderNumber} confirmed. Total: ${total}. Track: ${orderUrl}`,
  });
}

export async function sendShipmentEmail(
  to: string,
  name: string,
  orderNumber: string,
  carrier: string,
  trackingNumber: string
): Promise<void> {
  await sendEmail({
    to,
    subject: `Your EVee Vehicle ${orderNumber} Has Dispatched!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0d0f12; color: #ffffff; padding: 32px; border-radius: 8px;">
        <h2 style="color: #d4e790;">Your Vehicle Is On The Way!</h2>
        <p>Hi ${name}, our white-glove carrier is en route with your vehicle.</p>
        <p><strong>Carrier:</strong> ${carrier}</p>
        <p><strong>Tracking / Dispatch ID:</strong> ${trackingNumber}</p>
        <hr style="border: none; border-top: 1px solid #222; margin: 24px 0;" />
        <p style="color: #666; font-size: 11px;">${config.store.name} by ${config.store.company}</p>
      </div>
    `,
    text: `Order ${orderNumber} shipped via ${carrier}. Tracking: ${trackingNumber}`,
  });
}

export async function sendCancellationEmail(
  to: string,
  name: string,
  orderNumber: string,
  reason?: string
): Promise<void> {
  await sendEmail({
    to,
    subject: `Order ${orderNumber} Cancelled`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0d0f12; color: #ffffff; padding: 32px; border-radius: 8px;">
        <h2 style="color: #ff6b6b;">Order Cancelled</h2>
        <p>Hi ${name}, your order ${orderNumber} has been cancelled.</p>
        ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
        <p>If you have questions, please reach out to our concierge at ${config.store.supportEmail}.</p>
      </div>
    `,
    text: `Order ${orderNumber} cancelled.${reason ? ` Reason: ${reason}` : ''}`,
  });
}

export async function sendRefundEmail(
  to: string,
  name: string,
  orderNumber: string,
  refundAmount: string
): Promise<void> {
  await sendEmail({
    to,
    subject: `Refund Processed for Order ${orderNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0d0f12; color: #ffffff; padding: 32px; border-radius: 8px;">
        <h2 style="color: #d4e790;">Refund Processed</h2>
        <p>Hi ${name}, a refund of <strong>${refundAmount}</strong> has been processed for order ${orderNumber}.</p>
        <p>Please allow 3–7 business days for the funds to reflect on your original payment card.</p>
      </div>
    `,
    text: `Refund of ${refundAmount} processed for order ${orderNumber}.`,
  });
}

/**
 * Sends a real 6-digit OTP verification code to the customer's Gmail inbox.
 */
export async function sendCheckoutOtpEmail(
  to: string,
  name: string,
  otp: string
): Promise<void> {
  await sendEmail({
    to,
    subject: `${otp} is your EVee Crown Motors Verification Code`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 580px; margin: 0 auto; background-color: #0b0c0e; color: #ffffff; padding: 36px; border-radius: 12px; border: 1px solid #1f232b;">
        <div style="border-bottom: 1px solid #222; padding-bottom: 20px; margin-bottom: 24px;">
          <h1 style="margin: 0; font-size: 22px; letter-spacing: 3px; color: #d4e790; text-transform: uppercase;">Crown Motors</h1>
          <p style="margin: 6px 0 0; font-size: 11px; letter-spacing: 1.5px; color: #8892b0; text-transform: uppercase;">Electric Vehicle Handover Verification</p>
        </div>
        <p style="font-size: 15px; color: #e0e0e0; margin-bottom: 16px;">Hello ${name || 'Valued Customer'},</p>
        <p style="font-size: 14px; color: #aaa; line-height: 1.6; margin-bottom: 28px;">
          To verify your email address and authorize your electric vehicle reservation and handover dispatch, please enter the following 6-digit security code:
        </p>
        <div style="background-color: #16181d; border: 1px solid #2a2d35; border-radius: 10px; text-align: center; padding: 26px; margin-bottom: 26px;">
          <span style="font-family: monospace; font-size: 40px; font-weight: bold; letter-spacing: 12px; color: #d4e790; display: inline-block;">${otp}</span>
          <p style="font-size: 12px; color: #777; margin: 14px 0 0;">This code is valid for 10 minutes. Never share this code with anyone.</p>
        </div>
        <p style="font-size: 13px; color: #888; line-height: 1.6;">
          Our concierge team verifies your email to ensure official VIN documentation, warranty certificate, and handover schedule reach you securely.
        </p>
        <hr style="border: none; border-top: 1px solid #222; margin: 30px 0 20px;" />
        <p style="font-size: 11px; color: #555; margin: 0;">
          © ${new Date().getFullYear()} Crown Motors / EVee Pakistan. All rights reserved.
        </p>
      </div>
    `,
    text: `Crown Motors Verification Code: ${otp}. Valid for 10 minutes. Use this code to authorize your electric vehicle reservation.`,
  });
}
