"use client";

import { LINE_PHOTOS } from "@/lib/photos";
import { RotatingPhotos } from "./rotating-photos";

export function LinePhotos({
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
      photos={LINE_PHOTOS}
      intervalMs={6500}
      className={className}
      sizes={sizes}
      priority={priority}
      objectPosition={objectPosition}
    />
  );
}
