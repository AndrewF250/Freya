import Link from "next/link";
import { SitePhoto } from "@/components/site-photo";
import { CATEGORY_TILES } from "@/lib/photos";

export function CategoryStrip() {
  return (
    <section className="border-b border-line bg-sand">
      <div className="shell py-8 md:py-10">
        <p className="eyebrow mb-5">Категории</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 lg:gap-4">
          {CATEGORY_TILES.map((tile) => (
            <Link
              key={tile.href}
              href={tile.href}
              className="group overflow-hidden rounded-card border border-line bg-cream transition-colors hover:border-navy"
            >
              <SitePhoto
                src={tile.photo.src}
                alt={tile.photo.alt}
                sizes="(max-width: 640px) 50vw, 16vw"
                className="aspect-[4/5] transition-transform duration-300 group-hover:scale-[1.03]"
              />
              <p className="px-3 py-3 text-center text-[13px] leading-snug sm:text-[14px]">{tile.label}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
