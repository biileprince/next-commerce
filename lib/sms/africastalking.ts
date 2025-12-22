import AfricasTalking from "africastalking";

// Initialize Africa's Talking
const africastalking = AfricasTalking({
  apiKey: process.env.AFRICASTALKING_API_KEY || "",
  username: process.env.AFRICASTALKING_USERNAME || "",
});

// SMS service
const sms = africastalking.SMS;

/**
 * Send SMS using Africa's Talking
 * @param phoneNumber - Phone number in international format (e.g., +233XXXXXXXXX)
 * @param message - SMS message content
 */
export async function sendSMS(phoneNumber: string, message: string) {
  try {
    // Validate phone number format
    if (!phoneNumber.startsWith("+")) {
      throw new Error(
        "Phone number must be in international format (e.g., +233XXXXXXXXX)"
      );
    }

    // Send SMS
    const result = await sms.send({
      to: [phoneNumber],
      message,
      from: process.env.AFRICASTALKING_SENDER_ID, // Optional sender ID
    });

    console.log("SMS sent successfully:", result);
    return { success: true, data: result };
  } catch (error) {
    console.error("Failed to send SMS:", error);
    throw new Error("Failed to send SMS. Please try again.");
  }
}

/**
 * Send OTP via SMS
 * @param phoneNumber - Phone number in international format
 * @param otp - One-time password (6-digit code)
 */
export async function sendOTP(phoneNumber: string, otp: string) {
  const message = `Your verification code is: ${otp}. Valid for 10 minutes. Do not share this code with anyone.`;
  return sendSMS(phoneNumber, message);
}
