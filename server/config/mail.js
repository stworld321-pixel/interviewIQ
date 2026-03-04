import nodemailer from "nodemailer";

const getSmtpConfig = () => {
  const host = process.env.SMTP_HOST || process.env.MAIL_HOST;
  const port = process.env.SMTP_PORT || process.env.MAIL_PORT;
  const user = process.env.SMTP_USER || process.env.MAIL_USERNAME;
  const pass = process.env.SMTP_PASS || process.env.MAIL_PASSWORD;
  const secure = process.env.SMTP_SECURE || process.env.MAIL_SECURE || "false";
  const from = process.env.SMTP_FROM || process.env.MAIL_FROM || user;

  return { host, port, user, pass, secure, from };
};

const hasSmtpConfig = () =>
  !!getSmtpConfig().host &&
  !!getSmtpConfig().port &&
  !!getSmtpConfig().user &&
  !!getSmtpConfig().pass;

const getTransporter = () => {
  if (!hasSmtpConfig()) {
    throw new Error("SMTP is not configured");
  }

  const smtp = getSmtpConfig();

  return nodemailer.createTransport({
    host: smtp.host,
    port: Number(smtp.port),
    secure: String(smtp.secure) === "true",
    auth: {
      user: smtp.user,
      pass: smtp.pass,
    },
  });
};

export const sendPasswordResetEmail = async ({ to, name, resetUrl }) => {
  const transporter = getTransporter();
  const { from } = getSmtpConfig();

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
      <h2 style="margin: 0 0 8px;">Reset your Hireloop password</h2>
      <p style="margin: 0 0 16px;">Hi ${name || "there"},</p>
      <p style="margin: 0 0 16px;">
        We received a request to reset your password. Click the button below to set a new one.
      </p>
      <p style="margin: 0 0 20px;">
        <a
          href="${resetUrl}"
          style="display:inline-block;background:#0B3C6D;color:#fff;text-decoration:none;padding:10px 16px;border-radius:8px;"
        >
          Reset Password
        </a>
      </p>
      <p style="margin: 0 0 8px;">This link expires in 1 hour.</p>
      <p style="margin: 0;">If you did not request this, you can ignore this email.</p>
    </div>
  `;

  await transporter.sendMail({
    from,
    to,
    subject: "Hireloop Password Reset",
    html,
  });
};
