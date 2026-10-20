import nodemailer, { type Transporter } from 'nodemailer';
import { config } from '../../config';
import { logger } from '../../common/utils/logger';

let transporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.secure,
    auth: config.smtp.user
      ? { user: config.smtp.user, pass: config.smtp.pass }
      : undefined,
  });

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

  const transport = getTransporter();
  try {
    await transport.sendMail({
      from: `"${config.smtp.fromName}" <${config.smtp.fromAddress}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });
    logger.info('Email sent:', { to: options.to, subject: options.subject });
  } catch (error) {
    logger.error('Email send failed:', { to: options.to, subject: options.subject, error });
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
    subject: `Verify your EVee account`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a1a2e;">Welcome to EVee, ${name}!</h2>
        <p>Please verify your email address to activate your account.</p>
        <p>
          <a href="${verifyUrl}" style="
            display: inline-block;
            padding: 12px 24px;
            background-color: #00d4aa;
            color: white;
            text-decoration: none;
            border-radius: 6px;
            font-weight: bold;
          ">Verify Email Address</a>
        </p>
        <p style="color: #666;">This link expires in 24 hours.</p>
        <p style="color: #666; font-size: 12px;">If you did not create an account, please ignore this email.</p>
        <hr/>
        <p style="color: #999; font-size: 11px;">${config.store.name} by ${config.store.company}</p>
      </div>
    `,
    text: `Welcome to EVee! Verify your email: ${verifyUrl}`,
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
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a1a2e;">Password Reset Request</h2>
        <p>Hi ${name},</p>
        <p>We received a request to reset your password. Click the button below to set a new password.</p>
        <p>
          <a href="${resetUrl}" style="
            display: inline-block;
            padding: 12px 24px;
            background-color: #00d4aa;
            color: white;
            text-decoration: none;
            border-radius: 6px;
            font-weight: bold;
          ">Reset Password</a>
        </p>
        <p style="color: #666;">This link expires in 1 hour.</p>
        <p style="color: #666; font-size: 12px;">If you did not request a password reset, please ignore this email and your password will remain unchanged.</p>
        <hr/>
        <p style="color: #999; font-size: 11px;">${config.store.name} by ${config.store.company}</p>
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
          <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.name}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${item.price}</td>
        </tr>`
    )
    .join('');

  await sendEmail({
    to,
    subject: `Order Confirmed — ${orderNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a1a2e;">Order Confirmed!</h2>
        <p>Hi ${name}, thank you for your order.</p>
        <p><strong>Order Number:</strong> ${orderNumber}</p>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <thead>
            <tr style="background: #f5f5f5;">
              <th style="padding: 8px; text-align: left;">Product</th>
              <th style="padding: 8px; text-align: center;">Qty</th>
              <th style="padding: 8px; text-align: right;">Price</th>
            </tr>
          </thead>
          <tbody>${itemsHtml}</tbody>
        </table>
        <p><strong>Total: ${total}</strong></p>
        <p><a href="${orderUrl}">Track your order</a></p>
        <hr/>
        <p style="color: #999; font-size: 11px;">${config.store.name} by ${config.store.company}</p>
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
    subject: `Your EVee order ${orderNumber} has shipped!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a1a2e;">Your Order Has Shipped!</h2>
        <p>Hi ${name}, great news! Your order ${orderNumber} is on its way.</p>
        <p><strong>Carrier:</strong> ${carrier}</p>
        <p><strong>Tracking Number:</strong> ${trackingNumber}</p>
        <hr/>
        <p style="color: #999; font-size: 11px;">${config.store.name} by ${config.store.company}</p>
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
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a1a2e;">Order Cancelled</h2>
        <p>Hi ${name}, your order ${orderNumber} has been cancelled.</p>
        ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
        <p>If you have questions, please contact us at ${config.store.supportEmail}.</p>
        <hr/>
        <p style="color: #999; font-size: 11px;">${config.store.name} by ${config.store.company}</p>
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
    subject: `Refund processed for order ${orderNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a1a2e;">Refund Processed</h2>
        <p>Hi ${name}, a refund of <strong>${refundAmount}</strong> has been processed for order ${orderNumber}.</p>
        <p>Please allow 5–10 business days for the refund to appear in your account.</p>
        <hr/>
        <p style="color: #999; font-size: 11px;">${config.store.name} by ${config.store.company}</p>
      </div>
    `,
    text: `Refund of ${refundAmount} processed for order ${orderNumber}.`,
  });
}
