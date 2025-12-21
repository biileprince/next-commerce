import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getCart } from "@/lib/actions/cart";
import { getAddresses } from "@/lib/actions/address";
import { CheckoutForm } from "@/components/checkout/checkout-form";

export const metadata = {
  title: "Checkout",
  description: "Complete your purchase",
};

export default async function CheckoutPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect("/sign-in?redirect=/checkout");
  }

  const [cartResult, addressesResult] = await Promise.all([
    getCart(),
    getAddresses(),
  ]);

  if (
    !cartResult.success ||
    !cartResult.data ||
    cartResult.data.items.length === 0
  ) {
    redirect("/cart");
  }

  const cart = cartResult.data;
  const addresses = addressesResult.success ? addressesResult.data : [];

  return (
    <div className="mx-auto max-w-screen-2xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Checkout</h1>
        <p className="mt-2 text-neutral-500">Complete your order</p>
      </div>

      <CheckoutForm cart={cart} addresses={addresses || []} />
    </div>
  );
}
