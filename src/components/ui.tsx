import Link from "next/link";
import { PhotoBackdrop, type PhotoBackdropTone } from "./photo-backdrop";

/** Заголовок секции с надзаголовком и опциональной ссылкой справа. */
export function SectionHead({
  eyebrow,
  title,
  text,
  href,
  hrefLabel,
}: {
  eyebrow?: string;
  title: string;
  text?: string;
  href?: string;
  hrefLabel?: string;
}) {
  return (
    <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
      <div className="max-w-[46ch] xl:max-w-[56ch]">
        {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
        <h2 className="display text-[24px] sm:text-[30px] md:text-[40px]">{title}</h2>
        {text && <p className="mt-4 text-[15px] leading-relaxed text-ink-soft">{text}</p>}
      </div>
      {href && hrefLabel && (
        <Link href={href} className="btn btn-outline btn-sm shrink-0">
          {hrefLabel} →
        </Link>
      )}
    </div>
  );
}

/** Шапка внутренней страницы. */
export function PageHead({
  eyebrow,
  title,
  text,
  children,
  photo,
  photoTone = "sand",
}: {
  eyebrow?: string;
  title: string;
  text?: string;
  children?: React.ReactNode;
  photo?: { src: string; alt: string };
  photoTone?: PhotoBackdropTone;
}) {
  return (
    <div className="relative overflow-hidden border-b border-line bg-sand">
      {photo && (
        <PhotoBackdrop
          src={photo.src}
          tone={photoTone}
          photoClassName={photoTone === "navy" ? "opacity-40" : "opacity-90"}
        />
      )}
      <div className="shell relative py-10 sm:py-14 md:py-20 xl:py-24">
        {eyebrow && <p className="eyebrow mb-4">{eyebrow}</p>}
        <h1 className="display max-w-[20ch] text-[28px] sm:text-[36px] md:text-[52px] xl:text-[58px]">{title}</h1>
        {text && (
          <p className="mt-4 max-w-[62ch] text-[15px] leading-relaxed text-ink-soft sm:mt-5 md:text-[16px]">{text}</p>
        )}
        {children && <div className="mt-8">{children}</div>}
      </div>
    </div>
  );
}

/** Нумерованный шаг в объяснялках «как это работает». */
export function Step({ n, title, text }: { n: string; title: string; text: string }) {
  return (
    <div className="border-t border-line pt-5">
      <p className="font-display text-[28px] leading-none text-olive">{n}</p>
      <h3 className="mt-4 text-[17px]">{title}</h3>
      <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">{text}</p>
    </div>
  );
}

/** Пустое состояние списка. */
export function Empty({ title, text, children }: { title: string; text?: string; children?: React.ReactNode }) {
  return (
    <div className="card-flat px-6 py-16 text-center">
      <p className="text-[17px]">{title}</p>
      {text && <p className="mx-auto mt-2 max-w-[44ch] text-[14px] leading-relaxed text-ink-soft">{text}</p>}
      {children && <div className="mt-6 flex justify-center gap-3">{children}</div>}
    </div>
  );
}
