const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendVerificationEmail = async (email, firstName, token) => {
  const verifyUrl = `${process.env.CLIENT_URL}/verify-email/${token}`;
  await transporter.sendMail({
    from: `"HuisVerhuur" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Verify your HuisVerhuur account",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:2rem;background:#f5f0e8;border-radius:10px;">
        <h1 style="font-family:Georgia,serif;color:#1B3A5C;margin-bottom:.5rem;">Welcome to HuisVerhuur, ${firstName}!</h1>
        <p style="color:#6B6860;line-height:1.6;margin-bottom:1.5rem;">
          Thanks for signing up. Please verify your email address to activate your account.
        </p>
        <a href="${verifyUrl}" style="display:inline-block;background:#E8533A;color:white;padding:.9rem 2rem;border-radius:6px;text-decoration:none;font-weight:600;font-size:1rem;">
          Verify Email Address
        </a>
        <p style="color:#C8BFB0;font-size:.8rem;margin-top:1.5rem;">
          This link expires in 24 hours. If you didn't create an account, ignore this email.
        </p>
        <hr style="border:none;border-top:1px solid #EEE9E0;margin:1.5rem 0;" />
        <p style="color:#C8BFB0;font-size:.75rem;">© 2026 HuisVerhuur B.V. · Amsterdam</p>
      </div>
    `,
  });
};

const sendPasswordResetEmail = async (email, firstName, token) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${token}`;
  await transporter.sendMail({
    from: `"HuisVerhuur" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Reset your HuisVerhuur password",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:2rem;background:#f5f0e8;border-radius:10px;">
        <h1 style="font-family:Georgia,serif;color:#1B3A5C;margin-bottom:.5rem;">Password Reset Request</h1>
        <p style="color:#6B6860;line-height:1.6;margin-bottom:.5rem;">Hi ${firstName},</p>
        <p style="color:#6B6860;line-height:1.6;margin-bottom:1.5rem;">
          We received a request to reset your password. Click the button below to set a new password.
        </p>
        <a href="${resetUrl}" style="display:inline-block;background:#E8533A;color:white;padding:.9rem 2rem;border-radius:6px;text-decoration:none;font-weight:600;font-size:1rem;">
          Reset Password
        </a>
        <p style="color:#C8BFB0;font-size:.8rem;margin-top:1.5rem;">
          This link expires in 1 hour. If you didn't request a reset, ignore this email.
        </p>
        <hr style="border:none;border-top:1px solid #EEE9E0;margin:1.5rem 0;" />
        <p style="color:#C8BFB0;font-size:.75rem;">© 2026 HuisVerhuur B.V. · Amsterdam</p>
      </div>
    `,
  });
};

module.exports = { sendVerificationEmail, sendPasswordResetEmail };



