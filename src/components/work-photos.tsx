"use client";

import { motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { WORK_PHOTOS } from "@/lib/photos";
import { withBasePath } from "@/lib/paths";

const INTERVAL_MS = 7200;
const FADE = { duration: 2.15, ease: [0.4, 0, 0.2, 1] } as const;
const KEN = { duration: INTERVAL_MS / 1000, ease: "linear" } as const;

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
  const animateIn = !reduceMotion && index !== prev;

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
        className="absolute inset-0 will-change-[opacity,transform]"
        initial={animateIn ? { opacity: 0 } : false}
        animate={{ opacity: 1 }}
        transition={reduceMotion ? { duration: 0 } : FADE}
      >
        <motion.div
          className="absolute inset-0"
          initial={animateIn ? { scale: 1.03 } : false}
          animate={{ scale: reduceMotion ? 1 : 1.06 }}
          transition={reduceMotion ? { duration: 0 } : KEN}
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
      </motion.div>
    </div>
  );
}
