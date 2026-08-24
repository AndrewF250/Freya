import Link from "next/link";

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
      <div className="max-w-[46ch]">
        {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
        <h2 className="display text-[30px] md:text-[40px]">{title}</h2>
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
}: {
  eyebrow?: string;
  title: string;
  text?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="border-b border-line bg-sand">
      <div className="shell py-14 md:py-20">
        {eyebrow && <p className="eyebrow mb-4">{eyebrow}</p>}
        <h1 className="display max-w-[20ch] text-[36px] md:text-[52px]">{title}</h1>
        {text && <p className="mt-5 max-w-[62ch] text-[15px] leading-relaxed text-ink-soft md:text-[16px]">{text}</p>}
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
