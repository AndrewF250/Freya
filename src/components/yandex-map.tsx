type MapSettings = {
  yandexMapEmbed?: string;
  yandexMapUrl?: string;
};

export function YandexMap({ settings }: { settings: MapSettings }) {
  const embed =
    settings.yandexMapEmbed ||
    "https://yandex.ru/map-widget/v1/?source=constructorLink&url=https%3A%2F%2Fyandex.ru%2Fmaps%2Forg%2Ffreya_studio%2F14233224141%2F";

  return (
    <div className="overflow-hidden rounded-card border border-line bg-sand">
      <iframe
        title="Freya Studio на карте"
        src={embed}
        className="aspect-[4/3] w-full border-0 lg:aspect-auto lg:min-h-[520px]"
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
