"use client";

import { motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { WORK_PHOTOS } from "@/lib/photos";
import { withBasePath } from "@/lib/paths";

const INTERVAL_MS = 5200;
const EASE = [0.22, 1, 0.36, 1] as const;

export function WorkPhotos({
  className = "",
  sizes = "(max-width: 768px) 100vw, 50vw",
  priority = false,
  fit = "cover",
}: {
  className?: string;
  sizes?: string;
  priority?: boolean;
  fit?: "cover" | "contain";
}) {
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reduceMotion) return;
    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % WORK_PHOTOS.length);
    }, INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [reduceMotion]);

  return (
    <div className={`relative overflow-hidden bg-sand ${className}`}>
      {WORK_PHOTOS.map((photo, i) => (
        <motion.div
          key={photo.src}
          className="absolute inset-0"
          initial={false}
          animate={{ opacity: i === index ? 1 : 0 }}
          transition={reduceMotion ? { duration: 0 } : { duration: 0.9, ease: EASE }}
          aria-hidden={i !== index}
        >
          <Image
            src={withBasePath(photo.src)}
            alt={i === index ? photo.alt : ""}
            fill
            sizes={sizes}
            priority={priority && i === 0}
            className={fit === "contain" ? "object-contain" : "object-cover object-[center_20%]"}
          />
        </motion.div>
      ))}
    </div>
  );
}
