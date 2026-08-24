import Image from "next/image";

/**
 * Фото продукта. Если файла нет — рисуем заглушку с названием,
 * чтобы Кристина позже загрузила своё изображение через кабинет.
 */
export function ProductImage({
  src,
  alt,
  sizes = "(max-width: 768px) 50vw, 25vw",
  priority = false,
  className = "",
}: {
  src: string;
  alt: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
}) {
  if (!src) return <Placeholder label={alt} className={className} />;

  return (
    <div className={`relative overflow-hidden bg-sand ${className}`}>
      <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className="object-contain p-5 mix-blend-multiply" />
    </div>
  );
}

/** Универсальная заглушка под фото, которого пока нет. */
export function Placeholder({
  label,
  hint,
  className = "",
}: {
  label: string;
  hint?: string;
  className?: string;
}) {
  return (
    <div className={`ph ${className}`}>
      <div className="relative z-10 max-w-[22ch] px-5 text-center">
        <svg
          width="26"
          height="26"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
          className="mx-auto mb-2.5 opacity-60"
          aria-hidden
        >
          <rect x="3" y="4.5" width="18" height="15" rx="2" />
          <circle cx="8.5" cy="10" r="1.6" />
          <path d="m3.5 17 4.8-4.6a1.6 1.6 0 0 1 2.2 0l3.4 3.3a1.6 1.6 0 0 0 2.2 0l1.6-1.5a1.6 1.6 0 0 1 2.2 0l1.6 1.5" />
        </svg>
        <p className="text-[11px] leading-snug tracking-[0.04em]">{label}</p>
        {hint && <p className="mt-1 text-[10px] opacity-70">{hint}</p>}
      </div>
    </div>
  );
}
