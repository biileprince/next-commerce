import axios from "axios";

const paystackClient = axios.create({
  baseURL: "https://api.paystack.co",
  headers: {
    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
    "Content-Type": "application/json",
  },
});

export interface InitializePaymentData {
  email: string;
  amount: number; // In kobo (multiply NGN by 100)
  reference: string;
  callback_url: string;
  metadata?: Record<string, any>;
  channels?: string[]; // ["card", "bank", "ussd", "mobile_money"]
}

export interface PaystackInitializeResponse {
  authorization_url: string;
  access_code: string;
  reference: string;
}

export interface PaystackVerifyResponse {
  status: string; // "success", "failed", "abandoned"
  reference: string;
  amount: number;
  currency: string;
  channel: string; // "card", "bank", "ussd", "mobile_money"
  paid_at: string;
  customer: {
    email: string;
    customer_code: string;
  };
  authorization: {
    authorization_code: string;
    card_type: string;
    last4: string;
    exp_month: string;
    exp_year: string;
    bank: string;
  };
}

/**
 * Initialize a payment transaction with Paystack
 */
export async function initializePayment(
  data: InitializePaymentData
): Promise<PaystackInitializeResponse> {
  try {
    const response = await paystackClient.post("/transaction/initialize", data);

    if (!response.data.status) {
      throw new Error(response.data.message || "Payment initialization failed");
    }

    return response.data.data;
  } catch (error: any) {
    console.error(
      "Paystack initialization error:",
      error.response?.data || error.message
    );
    throw new Error(
      error.response?.data?.message || "Failed to initialize payment"
    );
  }
}

/**
 * Verify a payment transaction with Paystack
 */
export async function verifyPayment(
  reference: string
): Promise<PaystackVerifyResponse> {
  try {
    const response = await paystackClient.get(
      `/transaction/verify/${reference}`
    );

    if (!response.data.status) {
      throw new Error(response.data.message || "Payment verification failed");
    }

    return response.data.data;
  } catch (error: any) {
    console.error(
      "Paystack verification error:",
      error.response?.data || error.message
    );
    throw new Error(
      error.response?.data?.message || "Failed to verify payment"
    );
  }
}
