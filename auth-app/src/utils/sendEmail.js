import nodemailer from 'nodemailer';

const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: Number(SMTP_PORT || 587),
  secure: false,
  auth: { user: SMTP_USER, pass: SMTP_PASS }
});

export async function sendEmail({ to, subject, html, text }) {
  if (!to) throw new Error('Email "to" is required');
  const info = await transporter.sendMail({
    from: SMTP_FROM || 'no-reply@example.com',
    to,
    subject,
    text,
    html
  });
  return info;
}