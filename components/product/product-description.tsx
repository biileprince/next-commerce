"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

export function ProductDescription({
  description,
  specifications,
}: {
  description?: string;
  specifications?: Record<string, string>;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!description && !specifications) return null;

  const shouldTruncate = description && description.length > 300;
  const displayText =
    shouldTruncate && !isExpanded
      ? description.slice(0, 300) + "..."
      : description;

  return (
    <div className="space-y-6 border-t border-neutral-200 pt-6 dark:border-neutral-800">
      {/* Description */}
      {description && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Product Description</h2>
          <div className="text-neutral-600 dark:text-neutral-400">
            <p className="leading-relaxed whitespace-pre-line">{displayText}</p>
            {shouldTruncate && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="mt-2 flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                {isExpanded ? "Show Less" : "Show More"}
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${
                    isExpanded ? "rotate-180" : ""
                  }`}
                />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Specifications */}
      {specifications && Object.keys(specifications).length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Specifications</h2>
          <dl className="space-y-2">
            {Object.entries(specifications).map(([key, value]) => (
              <div
                key={key}
                className="grid grid-cols-2 gap-4 border-b border-neutral-200 pb-2 text-sm last:border-0 dark:border-neutral-800"
              >
                <dt className="font-medium text-neutral-900 dark:text-neutral-100">
                  {key}
                </dt>
                <dd className="text-neutral-600 dark:text-neutral-400">
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </div>
  );
}
