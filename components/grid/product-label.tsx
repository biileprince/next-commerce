import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/utils";

interface ProductLabelProps {
  title: string;
  amount: number;
  currencyCode: string;
  position?: "bottom" | "center";
}

export function ProductLabel({
  title,
  amount,
  currencyCode,
  position = "bottom",
}: ProductLabelProps) {
  return (
    <div
      className={cn(
        "absolute bottom-0 left-0 flex w-full px-4 pb-4 @container/label",
        {
          "lg:px-20 lg:pb-[35%]": position === "center",
        }
      )}
    >
      <div className="flex items-center rounded-full border bg-white/70 p-1 text-xs font-semibold text-black backdrop-blur-md dark:border-neutral-800 dark:bg-black/70 dark:text-white">
        <h3 className="mr-4 line-clamp-2 grow pl-2 leading-none tracking-tight">
          {title}
        </h3>
        <span className="flex-none rounded-full bg-blue-600 p-2 text-white">
          {formatPrice(amount, currencyCode)}
        </span>
      </div>
    </div>
  );
}
