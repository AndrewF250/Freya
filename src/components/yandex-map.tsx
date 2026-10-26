import { yandexEmbedSrc } from "@/lib/settings";

type MapSettings = {
  yandexMapEmbed?: string;
  yandexMapUrl?: string;
  address?: string;
};

export function YandexMap({ settings }: { settings: MapSettings }) {
  const embed = yandexEmbedSrc(settings);

  return (
    <div className="overflow-hidden rounded-card border border-line bg-sand">
      <iframe
        title="Студия ФРЕЯ на карте"
        src={embed}
        className="aspect-[4/3] w-full max-w-full border-0 lg:aspect-auto lg:min-h-[520px]"
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
      {settings.yandexMapUrl && (
        <div className="border-t border-line bg-paper px-4 py-3">
          <a
            href={settings.yandexMapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[13px] text-ink-soft transition-colors hover:text-olive-deep"
          >
            Открыть в Яндекс Картах →
          </a>
        </div>
      )}
    </div>
  );
}
