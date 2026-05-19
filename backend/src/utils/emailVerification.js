import crypto from "crypto";
import nodemailer from "nodemailer";

export const generateEmailVerificationToken = () => {
  const rawToken = crypto.randomBytes(32).toString("hex");

  const hashedToken = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");

  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24 hours

  return {
    rawToken,
    hashedToken,
    expiresAt,
  };
};

export const hashEmailVerificationToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

export const sendVerificationEmail = async ({ to, name, verificationUrl }) => {
  const {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_SECURE,
    SMTP_USER,
    SMTP_PASS,
    SMTP_FROM_NAME,
    SMTP_FROM_EMAIL,
  } = process.env;

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    console.log("SMTP not configured. Verification link:", verificationUrl);
    return {
      sent: false,
      reason: "SMTP not configured",
      verificationUrl,
    };
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: String(SMTP_SECURE) === "true",
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });

  const fromEmail = SMTP_FROM_EMAIL || SMTP_USER;
  const fromName = SMTP_FROM_NAME || "BeUnicorn";

  const html = `
    <div style="font-family: Arial, sans-serif; background:#f7f7f7; padding:30px;">
      <div style="max-width:600px; margin:auto; background:white; border-radius:16px; padding:30px;">
        <h2 style="margin:0 0 15px;">Verify your BeUnicorn email</h2>
        <p>Hi ${name || "there"},</p>
        <p>Thank you for registering with BeUnicorn. Please verify your email address to continue using your member account.</p>
        <p style="margin:30px 0;">
          <a href="${verificationUrl}" style="background:#facc15; color:#111; padding:14px 24px; border-radius:12px; text-decoration:none; font-weight:bold;">
            Verify Email
          </a>
        </p>
        <p>If the button does not work, copy and paste this link into your browser:</p>
        <p style="word-break:break-all; color:#555;">${verificationUrl}</p>
        <p style="color:#777; font-size:13px;">This link will expire in 24 hours.</p>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: `"${fromName}" <${fromEmail}>`,
    to,
    subject: "Verify your BeUnicorn email",
    html,
  });

  return {
    sent: true,
  };
};