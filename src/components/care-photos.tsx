"use client";

import { CARE_PHOTOS } from "@/lib/photos";
import { RotatingPhotos } from "./rotating-photos";

export function CarePhotos({
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
      photos={CARE_PHOTOS}
      intervalMs={5500}
      className={className}
      sizes={sizes}
      priority={priority}
      objectPosition={objectPosition}
    />
  );
}
