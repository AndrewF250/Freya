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
  const [prev, setPrev] = useState(0);

  useEffect(() => {
    if (reduceMotion) return;
    const id = window.setInterval(() => {
      setIndex((current) => {
        setPrev(current);
        return (current + 1) % WORK_PHOTOS.length;
      });
    }, INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [reduceMotion]);

  const objectClass = fit === "contain" ? "object-contain" : "object-cover object-[center_20%]";
  const current = WORK_PHOTOS[index];
  const underneath = WORK_PHOTOS[prev];

  return (
    <div className={`relative overflow-hidden bg-[#1b2430] ${className}`}>
      <Image
        src={withBasePath(underneath.src)}
        alt=""
        fill
        sizes={sizes}
        priority={priority}
        className={objectClass}
        aria-hidden
      />
      <motion.div
        key={current.src}
        className="absolute inset-0"
        initial={reduceMotion || index === prev ? false : { opacity: 0, scale: 1.02 }}
        animate={{ opacity: 1, scale: reduceMotion ? 1 : 1 }}
        transition={reduceMotion ? { duration: 0 } : { duration: 1.15, ease: EASE }}
      >
        <Image
          src={withBasePath(current.src)}
          alt={current.alt}
          fill
          sizes={sizes}
          priority={priority}
          className={objectClass}
        />
      </motion.div>
    </div>
  );
}
