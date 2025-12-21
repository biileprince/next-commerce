"use client";

import { useState } from "react";
import Image from "next/image";

export function Gallery({
  images,
  productName,
}: {
  images: string[];
  productName: string;
}) {
  const [currentImage, setCurrentImage] = useState(0);

  const imageUrls = images.length > 0 ? images : ["/placeholder-product.png"];

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative aspect-square overflow-hidden rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-black">
        <Image
          className="h-full w-full object-contain"
          fill
          sizes="(min-width: 1024px) 66vw, 100vw"
          alt={productName}
          src={imageUrls[currentImage] || "/placeholder-product.png"}
          priority
        />
      </div>

      {/* Thumbnail Grid */}
      {imageUrls.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {imageUrls.map((image, index) => (
            <button
              key={index}
              onClick={() => setCurrentImage(index)}
              className={`relative aspect-square overflow-hidden rounded-lg border-2 transition-all ${
                index === currentImage
                  ? "border-black dark:border-white"
                  : "border-neutral-200 dark:border-neutral-800"
              }`}
            >
              <Image
                className="h-full w-full object-cover"
                fill
                sizes="(min-width: 1024px) 20vw, 25vw"
                alt={`${productName} thumbnail ${index + 1}`}
                src={image}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
