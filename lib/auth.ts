import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { phoneNumber, emailOTP } from "better-auth/plugins";
import prisma from "@/lib/prisma";
import { sendVerificationOTP } from "@/lib/email/resend";
import { sendOTP } from "@/lib/sms/africastalking";

const trustedOrigins = [
  process.env.BETTER_AUTH_URL,
  process.env.NEXT_PUBLIC_APP_URL,
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined,
  "http://localhost:3000",
  "http://localhost:3001",
].filter((origin): origin is string => Boolean(origin));

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      enabled: !!(
        process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ),
    },
    facebook: {
      clientId: process.env.FACEBOOK_CLIENT_ID || "",
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET || "",
      enabled: !!(
        process.env.FACEBOOK_CLIENT_ID && process.env.FACEBOOK_CLIENT_SECRET
      ),
    },
  },
  plugins: [
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        await sendVerificationOTP(email, otp, type);
      },
      otpLength: 6,
      expiresIn: 600, // 10 minutes
      overrideDefaultEmailVerification: true,
    }),
    phoneNumber({
      sendOTP: async ({ phoneNumber, code }) => {
        // Send OTP via Africa's Talking SMS (non-blocking)
        await sendOTP(phoneNumber, code);
      },
      otpLength: 6,
      expiresIn: 600, // 10 minutes
      signUpOnVerification: {
        getTempEmail: (phoneNumber) => {
          return `${phoneNumber.replace(/\+/g, "")}@phone.temp`;
        },
        getTempName: (phoneNumber) => {
          return phoneNumber;
        },
      },
    }),
  ],
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "customer",
        required: false,
      },
    },
  },
  trustedOrigins,
});

export type Session = typeof auth.$Infer.Session & {
  user: typeof auth.$Infer.Session.user & {
    role?: string;
  };
};
