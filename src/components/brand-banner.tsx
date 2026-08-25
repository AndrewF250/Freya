"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import Image from "next/image";
import { withBasePath } from "@/lib/paths";

export function BrandBanner({
  src,
  alt,
  className = "",
  overlay = "from-navy/80 via-navy/50 to-transparent",
}: {
  src: string;
  alt: string;
  className?: string;
  overlay?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const scale = useTransform(scrollYProgress, [0, 1], [1.08, 1]);
  const y = useTransform(scrollYProgress, [0, 1], ["-4%", "4%"]);

  return (
    <section ref={ref} className={`relative min-h-[min(52vh,480px)] overflow-hidden ${className}`}>
      <motion.div className="absolute inset-0" style={reduceMotion ? undefined : { scale, y }}>
        <Image
          src={withBasePath(src)}
          alt={alt}
          fill
          sizes="100vw"
          className="object-cover"
          priority={false}
        />
      </motion.div>
      <div className={`absolute inset-0 bg-gradient-to-r ${overlay}`} aria-hidden />
    </section>
  );
}
