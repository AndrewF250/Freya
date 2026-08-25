"use client";

import { BRAND_PHOTOS } from "@/lib/photos";
import { RotatingPhotos } from "./rotating-photos";

export function BrandPhotos({
  className = "",
  sizes = "(max-width: 768px) 100vw, 50vw",
  priority = false,
  objectPosition = "center",
}: {
  className?: string;
  sizes?: string;
  priority?: boolean;
  objectPosition?: string;
}) {
  return (
    <RotatingPhotos
      photos={BRAND_PHOTOS}
      className={className}
      sizes={sizes}
      priority={priority}
      objectPosition={objectPosition}
    />
  );
}
