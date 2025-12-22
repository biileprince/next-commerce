import { Resend } from "resend";

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send verification OTP email
 * @param email - User's email address
 * @param otp - 6-digit verification code
 * @param type - Type of verification: sign-in, email-verification, or forget-password
 */
export async function sendVerificationOTP(
  email: string,
  otp: string,
  type: "sign-in" | "email-verification" | "forget-password"
) {
  try {
    const subjects = {
      "sign-in": "Your Sign-In Verification Code",
      "email-verification": "Verify your email address",
      "forget-password": "Reset your password",
    };

    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
      to: [email],
      subject: subjects[type],
      html: getOTPEmailTemplate(otp, type),
    });

    if (error) {
      console.error("Failed to send verification OTP:", error);
      throw new Error("Failed to send verification OTP");
    }

    console.log("Verification OTP sent successfully:", data);
    return { success: true, data };
  } catch (error) {
    console.error("Failed to send verification OTP:", error);
    throw error;
  }
}

/**
 * Send password reset email
 * @param email - User's email address
 * @param resetUrl - URL with reset token
 */
export async function sendPasswordResetEmail(
  email: string,
  resetUrl: string,
  userName?: string
) {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
      to: [email],
      subject: "Reset your password",
      html: getPasswordResetEmailTemplate(resetUrl, userName),
    });

    if (error) {
      console.error("Failed to send password reset email:", error);
      throw new Error("Failed to send password reset email");
    }

    console.log("Password reset email sent successfully:", data);
    return { success: true, data };
  } catch (error) {
    console.error("Failed to send password reset email:", error);
    throw error;
  }
}

/**
 * Email template for OTP verification
 */
function getOTPEmailTemplate(
  otp: string,
  type: "sign-in" | "email-verification" | "forget-password"
) {
  const titles = {
    "sign-in": "Sign In to Your Account",
    "email-verification": "Verify Your Email Address",
    "forget-password": "Reset Your Password",
  };

  const messages = {
    "sign-in":
      "Use the verification code below to sign in to your NextCommerse account:",
    "email-verification":
      "Thanks for signing up! Use the verification code below to verify your email address:",
    "forget-password":
      "We received a request to reset your password. Use the code below to proceed:",
  };

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${titles[type]}</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f5f5;">
        <div style="background: #000000; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">NextCommerse</h1>
        </div>
        
        <div style="background: #ffffff; padding: 40px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333; margin-top: 0;">${titles[type]}</h2>
          
          <p>${messages[type]}</p>
          
          <div style="text-align: center; margin: 40px 0;">
            <div style="background: #f9f9f9; border: 2px solid #e0e0e0; border-radius: 8px; padding: 24px; display: inline-block;">
              <p style="color: #666; font-size: 14px; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 1px;">Your Verification Code</p>
              <p style="font-size: 36px; font-weight: bold; letter-spacing: 8px; margin: 0; color: #000000; font-family: 'Courier New', monospace;">
                ${otp}
              </p>
            </div>
          </div>
          
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            <strong>⏰ This code will expire in 10 minutes</strong> for security reasons.
          </p>
          
          <p style="color: #666; font-size: 14px; margin-top: 20px;">
            If you didn't request this code, you can safely ignore this email.
          </p>

          <div style="background: #f9f9f9; border-left: 4px solid #000000; padding: 16px; margin-top: 30px; border-radius: 4px;">
            <p style="color: #666; font-size: 13px; margin: 0;">
              <strong>Security Tip:</strong> Never share this code with anyone. NextCommerse will never ask for your verification code.
            </p>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
          <p>&copy; ${new Date().getFullYear()} NextCommerse. All rights reserved.</p>
        </div>
      </body>
    </html>
  `;
}

/**
 * Email template for password reset (legacy support)
 */
function getPasswordResetEmailTemplate(resetUrl: string, userName?: string) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f5f5;">
        <div style="background: #000000; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">NextCommerse</h1>
        </div>
        
        <div style="background: #ffffff; padding: 40px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333; margin-top: 0;">Reset Your Password</h2>
          
          ${userName ? `<p>Hi ${userName},</p>` : "<p>Hi there,</p>"}
          
          <p>We received a request to reset your password. Click the button below to create a new password:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background: #000000; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">
              Reset Password
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px;">Or copy and paste this link into your browser:</p>
          <p style="background: #f9f9f9; padding: 12px; border-radius: 4px; word-break: break-all; font-size: 14px; border: 1px solid #e0e0e0;">
            ${resetUrl}
          </p>
          
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            This link will expire in 1 hour for security reasons.
          </p>
          
          <p style="color: #666; font-size: 14px; margin-top: 20px;">
            If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
          <p>&copy; ${new Date().getFullYear()} NextCommerse. All rights reserved.</p>
        </div>
      </body>
    </html>
  `;
}
