"use client";

import { useCart } from "./cart-context";
import { OpenCart } from "./open-cart";
import { CartModal } from "./cart-modal";

export function CartButton() {
  const { totalQuantity, openCart } = useCart();

  return (
    <>
      <button aria-label="Open cart" onClick={openCart}>
        <OpenCart quantity={totalQuantity} />
      </button>
      <CartModal />
    </>
  );
}
