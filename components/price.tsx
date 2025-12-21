import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/utils";

interface PriceProps {
  amount: number | string;
  className?: string;
  currencyCode?: string;
  currencyCodeClassName?: string;
}

export function Price({
  amount,
  className,
  currencyCode = "NGN",
  currencyCodeClassName,
}: PriceProps) {
  const numericAmount =
    typeof amount === "string" ? parseFloat(amount) : amount;

  return (
    <p suppressHydrationWarning={true} className={className}>
      {formatPrice(numericAmount, currencyCode)}
      <span className={cn("ml-1 inline", currencyCodeClassName)}>
        {currencyCode}
      </span>
    </p>
  );
}
