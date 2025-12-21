"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

export function PaymentCallback() {
  const searchParams = useSearchParams();
  const payment = searchParams.get("payment");

  useEffect(() => {
    if (payment === "success") {
      toast.success("Payment initiated! We'll confirm your payment shortly.");
    } else if (payment === "cancelled") {
      toast.error("Payment was cancelled");
    }
  }, [payment]);

  return null;
}
