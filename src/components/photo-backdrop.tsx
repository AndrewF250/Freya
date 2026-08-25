import { SitePhoto } from "./site-photo";

export type PhotoBackdropTone = "sand" | "cream" | "navy";

const OVERLAYS: Record<PhotoBackdropTone, string> = {
  sand: "from-sand via-sand/85 to-sand/20",
  cream: "from-cream via-cream/88 to-cream/15",
  navy: "from-navy via-navy/78 to-navy/25",
};

export function PhotoBackdrop({
  src,
  alt = "",
  tone = "sand",
  photoClassName = "",
  widthClass = "w-[38%] xl:w-[42%]",
  sizes = "42vw",
  objectPosition = "center",
}: {
  src: string;
  alt?: string;
  tone?: PhotoBackdropTone;
  photoClassName?: string;
  widthClass?: string;
  sizes?: string;
  objectPosition?: string;
}) {
  return (
    <div className={`pointer-events-none absolute inset-y-0 right-0 hidden lg:block ${widthClass}`} aria-hidden>
      <SitePhoto
        src={src}
        alt={alt}
        className={`h-full w-full ${photoClassName}`}
        sizes={sizes}
        objectPosition={objectPosition}
      />
      <div className={`absolute inset-0 bg-gradient-to-r ${OVERLAYS[tone]}`} />
    </div>
  );
}
