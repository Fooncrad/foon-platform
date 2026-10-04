import nodemailer from 'nodemailer';
import { isIP } from 'node:net';

export type SmtpConnection = {
  smtp_host: string;
  smtp_port: number;
  smtp_secure: number | boolean;
  smtp_username: string;
  from_email: string;
  from_name: string;
};

function validateConnection(config: SmtpConnection) {
  const host = config.smtp_host.trim().toLowerCase();
  const port = Number(config.smtp_port);
  if (!host || host.length > 253 || !/^[a-z0-9.-]+$/.test(host) ||
      host === 'localhost' || host.endsWith('.localhost') ||
      host.endsWith('.local') || isIP(host) ||
      !Number.isInteger(port) || port < 1 || port > 65535 ||
      !config.smtp_username || !config.from_email) {
    throw new Error('SMTP_CONFIGURATION_INVALID');
  }
}

function transport(config: SmtpConnection, password: string) {
  validateConnection(config);
  const secure = Number(config.smtp_secure) === 1 || Number(config.smtp_port) === 465;
  return nodemailer.createTransport({
    host: config.smtp_host.trim(),
    port: Number(config.smtp_port),
    secure,
    requireTLS: !secure,
    auth: { user: config.smtp_username, pass: password },
    tls: { minVersion: 'TLSv1.2', rejectUnauthorized: true },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });
}

export async function verifySmtp(config: SmtpConnection, password: string) {
  const client = transport(config, password);
  try {
    await client.verify();
    return true;
  } finally {
    client.close();
  }
}

export async function sendSmtp(config: SmtpConnection, password: string, input: {
  to: string; subject: string; text: string; html: string; idempotencyKey: string;
}) {
  const client = transport(config, password);
  try {
    await client.sendMail({
      from: { name: config.from_name.replace(/[\\r\\n]/g, '').slice(0, 160), address: config.from_email },
      to: input.to,
      subject: input.subject,
      text: input.text,
      html: input.html,
      messageId: undefined,
      headers: { 'X-FOON-Idempotency-Key': input.idempotencyKey.slice(0, 200) },
    });
  } finally {
    client.close();
  }
}
