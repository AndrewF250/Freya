"use client";

import { useState } from "react";
import { ProductImage } from "./product-image";

/** Галерея карточки товара: большое фото и превью остальных снимков с davines.ru. */
export function ProductGallery({
  images,
  alt,
  bgColor,
}: {
  images: string[];
  alt: string;
  bgColor?: string;
}) {
  const [active, setActive] = useState(0);
  const current = images[active] ?? images[0] ?? "";

  return (
    <div className="min-w-0">
      <ProductImage
        src={current}
        alt={alt}
        sizes="(max-width: 768px) 100vw, 45vw"
        priority
        bgColor={bgColor}
        className="aspect-square rounded-card border border-line"
      />
      {images.length > 1 && (
        <div className="mt-3 grid grid-cols-5 gap-2" role="list" aria-label="Фотографии продукта">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              role="listitem"
              onClick={() => setActive(i)}
              aria-label={`Фото ${i + 1} из ${images.length}`}
              aria-current={i === active}
              className={`overflow-hidden rounded-[10px] border transition-colors ${
                i === active ? "border-ink" : "border-line hover:border-muted"
              }`}
            >
              <ProductImage src={src} alt="" sizes="96px" bgColor={bgColor} padding="p-1.5" className="aspect-square" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
