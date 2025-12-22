"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Mail,
  Phone,
  User,
  Loader2,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { authClient, useSession, signUp } from "@/lib/auth-client";
import { OTPInput } from "@/components/ui/otp-input";

type RegisterMethod = "email" | "phone";
type EmailStep = "register" | "verify-otp";
type PhoneStep = "register" | "otp";

export default function SignUpPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  // Check if already logged in
  useEffect(() => {
    if (session && !isPending) {
      router.push("/products");
    }
  }, [session, isPending, router]);

  const [method, setMethod] = useState<RegisterMethod>("email");
  const [emailStep, setEmailStep] = useState<EmailStep>("register");
  const [phoneStep, setPhoneStep] = useState<PhoneStep>("register");

  // Common fields
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Email specific
  const [email, setEmail] = useState("");
  const [emailOtp, setEmailOtp] = useState("");

  // Phone specific
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneOtp, setPhoneOtp] = useState("");

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(0);

  // Resend timer countdown
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  // Validate password
  function validatePassword(): string | null {
    if (password.length < 8) {
      return "Password must be at least 8 characters long";
    }
    if (password !== confirmPassword) {
      return "Passwords do not match";
    }
    return null;
  }

  // Email registration: Create account and send OTP
  async function handleEmailRegister(e: React.FormEvent) {
    e.preventDefault();

    const passwordError = validatePassword();
    if (passwordError) {
      setError(passwordError);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await signUp.email(
        {
          email,
          password,
          name,
        },
        {
          onSuccess: async () => {
            // Account created, now send email OTP for verification
            try {
              await authClient.emailOtp.sendVerificationOtp(
                {
                  email,
                  type: "email-verification",
                },
                {
                  onSuccess: () => {
                    setSuccess(
                      "Account created! Enter the verification code sent to your email."
                    );
                    setEmailStep("verify-otp");
                    setResendTimer(60);
                  },
                  onError: (ctx) => {
                    setError(
                      ctx.error.message || "Failed to send verification code"
                    );
                  },
                }
              );
            } catch {
              setError("Account created but failed to send verification code");
            }
          },
          onError: (ctx) => {
            setError(
              ctx.error.message || "Failed to create account. Please try again."
            );
          },
        }
      );
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  // Email: Verify OTP
  async function handleVerifyEmailOTP(e: React.FormEvent) {
    e.preventDefault();

    if (emailOtp.length !== 6) {
      setError("Please enter the complete 6-digit code");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await authClient.emailOtp.verifyEmail(
        {
          email,
          otp: emailOtp,
        },
        {
          onSuccess: () => {
            setSuccess("Email verified! Redirecting...");
            setTimeout(() => router.push("/products"), 1000);
          },
          onError: (ctx) => {
            setError(
              ctx.error.message || "Invalid or expired verification code"
            );
          },
        }
      );
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  // Email: Resend OTP
  async function handleResendEmailOTP() {
    setLoading(true);
    setError(null);

    try {
      await authClient.emailOtp.sendVerificationOtp(
        {
          email,
          type: "email-verification",
        },
        {
          onSuccess: () => {
            setSuccess("New verification code sent!");
            setResendTimer(60);
          },
          onError: (ctx) => {
            setError(ctx.error.message || "Failed to resend code");
          },
        }
      );
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  // Phone registration - send OTP
  async function handlePhoneRegister(e: React.FormEvent) {
    e.preventDefault();

    const passwordError = validatePassword();
    if (passwordError) {
      setError(passwordError);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await authClient.phoneNumber.sendOtp(
        {
          phoneNumber,
        },
        {
          onSuccess: () => {
            setSuccess("OTP sent to your phone!");
            setPhoneStep("otp");
            setResendTimer(60);
          },
          onError: (ctx) => {
            setError(ctx.error.message || "Failed to send OTP");
          },
        }
      );
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  // Verify phone OTP and create account
  async function handleVerifyPhoneOTP(e: React.FormEvent) {
    e.preventDefault();

    if (phoneOtp.length !== 6) {
      setError("Please enter the complete 6-digit code");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Verify OTP with Better Auth
      await authClient.phoneNumber.verify(
        {
          phoneNumber,
          code: phoneOtp,
        },
        {
          onSuccess: async () => {
            // Account is created automatically with signUpOnVerification
            setSuccess("Phone verified! Account created successfully!");
            setTimeout(() => router.push("/products"), 1000);
          },
          onError: (ctx) => {
            setError(ctx.error.message || "Invalid OTP code");
          },
        }
      );
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  // Resend phone OTP
  async function handleResendPhoneOTP() {
    setLoading(true);
    setError(null);

    try {
      await authClient.phoneNumber.sendOtp(
        {
          phoneNumber,
        },
        {
          onSuccess: () => {
            setSuccess("New OTP sent to your phone!");
            setResendTimer(60);
          },
          onError: (ctx) => {
            setError(ctx.error.message || "Failed to resend OTP");
          },
        }
      );
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  // Social signup
  async function handleSocialSignup(provider: "google" | "facebook") {
    setLoading(true);
    setError(null);

    try {
      await authClient.signIn.social({
        provider,
        callbackURL: "/products",
      });
    } catch {
      setError(`Failed to sign up with ${provider}`);
      setLoading(false);
    }
  }

  // Show loading spinner while checking session
  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Don't show sign-up form if already logged in
  if (session) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Create Account
          </CardTitle>
        </CardHeader>

        <CardContent>
          {error && (
            <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200 dark:bg-red-950/20 dark:border-red-900 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
              <p className="text-red-600 text-sm dark:text-red-400">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 rounded-md bg-green-50 border border-green-200 dark:bg-green-950/20 dark:border-green-900 flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
              <p className="text-green-600 text-sm dark:text-green-400">
                {success}
              </p>
            </div>
          )}

          {/* Social Auth at Top */}
          {emailStep === "register" && phoneStep === "register" && (
            <>
              <div className="space-y-3 mb-6">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleSocialSignup("google")}
                  disabled={loading}
                >
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Continue with Google
                </Button>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleSocialSignup("facebook")}
                  disabled={loading}
                >
                  <svg
                    className="mr-2 h-4 w-4"
                    fill="#1877F2"
                    viewBox="0 0 24 24"
                  >
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  Continue with Facebook
                </Button>
              </div>

              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>
            </>
          )}

          {/* Method Switcher */}
          {emailStep === "register" && phoneStep === "register" && (
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setMethod("email")}
                disabled={loading}
                className={`flex-1 py-2 rounded-md font-medium transition-colors ${
                  method === "email"
                    ? "bg-black text-white dark:bg-white dark:text-black"
                    : "border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
              >
                <Mail className="inline-block h-4 w-4 mr-2" />
                Email
              </button>
              <button
                onClick={() => setMethod("phone")}
                disabled={loading}
                className={`flex-1 py-2 rounded-md font-medium transition-colors ${
                  method === "phone"
                    ? "bg-black text-white dark:bg-white dark:text-black"
                    : "border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
              >
                <Phone className="inline-block h-4 w-4 mr-2" />
                Phone
              </button>
            </div>
          )}

          {/* Email Registration Form */}
          {method === "email" && emailStep === "register" && (
            <form onSubmit={handleEmailRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    required
                    disabled={loading}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@example.com"
                    required
                    disabled={loading}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  At least 8 characters
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>
          )}

          {/* Email OTP Verification */}
          {method === "email" && emailStep === "verify-otp" && (
            <div className="space-y-4">
              <div className="flex justify-center mb-4">
                <div className="h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                  <Mail className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
              </div>

              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">
                  Verify Your Email
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Enter the 6-digit verification code sent to{" "}
                  <span className="font-semibold">{email}</span>
                </p>
              </div>

              <form onSubmit={handleVerifyEmailOTP} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-center">
                    Verification Code
                  </label>
                  <OTPInput
                    length={6}
                    value={emailOtp}
                    onChange={setEmailOtp}
                    disabled={loading}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading || emailOtp.length !== 6}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Verify Email"
                  )}
                </Button>
              </form>

              <div className="mt-4 flex justify-between items-center text-sm">
                <button
                  onClick={() => {
                    setEmailStep("register");
                    setEmailOtp("");
                    setError(null);
                    setSuccess(null);
                  }}
                  disabled={loading}
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                >
                  Change email
                </button>

                {resendTimer > 0 ? (
                  <span className="text-gray-500">
                    Resend in {resendTimer}s
                  </span>
                ) : (
                  <button
                    onClick={handleResendEmailOTP}
                    disabled={loading}
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Resend code
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Phone Registration Form */}
          {method === "phone" && phoneStep === "register" && (
            <form onSubmit={handlePhoneRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    required
                    disabled={loading}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+233XXXXXXXXX"
                    required
                    disabled={loading}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Include country code (e.g., +233)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  At least 8 characters
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending OTP...
                  </>
                ) : (
                  "Continue with Phone"
                )}
              </Button>
            </form>
          )}

          {/* Phone OTP Verification */}
          {method === "phone" && phoneStep === "otp" && (
            <form onSubmit={handleVerifyPhoneOTP} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-3 text-center">
                  Enter the 6-digit code sent to {phoneNumber}
                </label>
                <OTPInput
                  value={phoneOtp}
                  onChange={setPhoneOtp}
                  length={6}
                  disabled={loading}
                />
              </div>

              <Button
                type="submit"
                disabled={loading || phoneOtp.length !== 6}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify & Create Account"
                )}
              </Button>

              <div className="flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => {
                    setPhoneStep("register");
                    setPhoneOtp("");
                    setError(null);
                  }}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:underline"
                >
                  Change phone number
                </button>

                {resendTimer > 0 ? (
                  <span className="text-sm text-gray-500">
                    Resend OTP in {resendTimer}s
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendPhoneOTP}
                    disabled={loading}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Resend OTP
                  </button>
                )}
              </div>
            </form>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-2">
          <p className="text-sm text-center text-gray-600 dark:text-gray-400">
            Already have an account?{" "}
            <Link
              href="/sign-in"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Sign In
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
