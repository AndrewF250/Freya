"use client";

import { motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { useEffect, useState } from "react";
import type { SitePhotoSrc } from "@/lib/photos";
import { withBasePath } from "@/lib/paths";

const EASE = [0.22, 1, 0.36, 1] as const;

export function RotatingPhotos({
  photos,
  intervalMs = 6000,
  className = "",
  sizes = "(max-width: 768px) 100vw, 50vw",
  priority = false,
  objectPosition = "center",
}: {
  photos: SitePhotoSrc[];
  intervalMs?: number;
  className?: string;
  sizes?: string;
  priority?: boolean;
  objectPosition?: string;
}) {
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reduceMotion || photos.length < 2) return;
    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % photos.length);
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [reduceMotion, photos.length, intervalMs]);

  return (
    <div className={`relative overflow-hidden bg-sand ${className}`}>
      {photos.map((photo, i) => (
        <motion.div
          key={photo.src}
          className="absolute inset-0"
          initial={false}
          animate={{
            opacity: i === index ? 1 : 0,
            scale: i === index ? 1 : 1.04,
          }}
          transition={reduceMotion ? { duration: 0 } : { duration: 1.1, ease: EASE }}
          aria-hidden={i !== index}
        >
          <Image
            src={withBasePath(photo.src)}
            alt={i === index ? photo.alt : ""}
            fill
            sizes={sizes}
            priority={priority && i === 0}
            className="object-cover"
            style={{ objectPosition }}
          />
        </motion.div>
      ))}
    </div>
  );
}
