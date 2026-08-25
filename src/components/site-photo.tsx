import Image from "next/image";
import { withBasePath } from "@/lib/paths";

export function SitePhoto({
  src,
  alt,
  className = "",
  priority = false,
  sizes = "(max-width: 768px) 100vw, 50vw",
  objectPosition = "center",
}: {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
  objectPosition?: string;
}) {
  return (
    <div className={`relative overflow-hidden bg-sand ${className}`}>
      <Image
        src={withBasePath(src)}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className="object-cover"
        style={{ objectPosition }}
      />
    </div>
  );
}
