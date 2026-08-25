"use client";

import { motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { CARE_PHOTOS } from "@/lib/photos";
import { withBasePath } from "@/lib/paths";

const EASE = [0.22, 1, 0.36, 1] as const;

const TILES = [
  { photo: CARE_PHOTOS[0], className: "col-span-2 row-span-2" },
  { photo: CARE_PHOTOS[4], className: "col-span-1 row-span-1" },
  { photo: CARE_PHOTOS[2], className: "col-span-1 row-span-1" },
  { photo: CARE_PHOTOS[3], className: "col-span-1 row-span-2" },
  { photo: CARE_PHOTOS[1], className: "col-span-2 row-span-1" },
] as const;

export function CareMosaic({ className = "" }: { className?: string }) {
  const reduceMotion = useReducedMotion();

  return (
    <div className={`grid grid-cols-3 grid-rows-3 gap-2 sm:gap-3 ${className}`}>
      {TILES.map(({ photo, className: tileClass }, i) => (
        <motion.div
          key={photo.src}
          className={`relative overflow-hidden rounded-card bg-sand ${tileClass}`}
          initial={reduceMotion ? false : { opacity: 0, y: 18, scale: 0.97 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.55, delay: i * 0.07, ease: EASE }}
          whileHover={reduceMotion ? undefined : { scale: 1.02 }}
        >
          <Image
            src={withBasePath(photo.src)}
            alt={photo.alt}
            fill
            sizes="(max-width: 768px) 33vw, 18vw"
            className="object-cover"
          />
        </motion.div>
      ))}
    </div>
  );
}
