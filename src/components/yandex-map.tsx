import { yandexEmbedSrc } from "@/lib/settings";

type MapSettings = {
  yandexMapEmbed?: string;
  yandexMapUrl?: string;
  address?: string;
};

export function YandexMap({ settings, className = "" }: { settings: MapSettings; className?: string }) {
  const embed = yandexEmbedSrc(settings);

  return (
    <div className={`flex min-h-0 flex-col overflow-hidden rounded-card border border-line bg-sand ${className}`}>
      <iframe
        title="Студия ФРЕЯ на карте"
        src={embed}
        className="aspect-[4/3] w-full max-w-full flex-1 border-0 lg:aspect-auto lg:min-h-[420px]"
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
      {settings.yandexMapUrl && (
        <div className="shrink-0 border-t border-line bg-paper px-4 py-3">
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
