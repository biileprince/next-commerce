import { getCart } from "@/lib/actions/cart";
import { CartContent } from "./cart-content";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { GuestCartContent } from "./guest-cart-content";

export default async function CartPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-6 text-3xl font-bold">Shopping Cart</h1>
        <GuestCartContent />
      </div>
    );
  }

  const result = await getCart();

  if (!result.success) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-red-600">{result.error}</p>
        </div>
      </div>
    );
  }

  const cart = result.data;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Shopping Cart</h1>

      {!cart || cart.items.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg mb-4">Your cart is empty</p>
          <a
            href="/products"
            className="inline-block bg-black text-white px-6 py-3 rounded hover:bg-gray-800 transition"
          >
            Continue Shopping
          </a>
        </div>
      ) : (
        <CartContent initialCart={cart} />
      )}
    </div>
  );
}
