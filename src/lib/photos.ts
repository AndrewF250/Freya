export type SitePhotoSrc = {
  src: string;
  alt: string;
};

export const PHOTOS = {
  portrait: {
    src: "/photos/kristina-portrait.webp",
    alt: "Кристина — парикмахер-стилист студии ФРЕЯ",
  },
  towel: {
    src: "/photos/davines-towel.webp",
    alt: "Полотенце Aquis for Davines в студии",
  },
  still1: {
    src: "/photos/davines-still-1.webp",
    alt: "Профессиональные инструменты Davines",
  },
  still2: {
    src: "/photos/davines-still-2.webp",
    alt: "Уход Davines: кисть, полотенце и эвкалипт",
  },
  hands: {
    src: "/photos/davines-hands.webp",
    alt: "Нанесение ухода Davines",
  },
  catShampoo: {
    src: "/photos/davines-cat-shampoo.webp",
    alt: "Davines — шампуни",
  },
  catConditioner: {
    src: "/photos/davines-cat-conditioner.webp",
    alt: "Davines — кондиционеры",
  },
  catMask: {
    src: "/photos/davines-cat-mask.webp",
    alt: "Davines — маски для волос",
  },
  catLeaveIn: {
    src: "/photos/davines-cat-leave-in.webp",
    alt: "Davines — несмываемый уход",
  },
  catStyling: {
    src: "/photos/davines-cat-styling.webp",
    alt: "Davines — стайлинг",
  },
  catMini: {
    src: "/photos/davines-cat-mini.webp",
    alt: "Davines — мини-формат",
  },
} as const satisfies Record<string, SitePhotoSrc>;

export const WORK_PHOTOS: SitePhotoSrc[] = [
  { src: "/photos/kristina-work-1.webp", alt: "Кристина за работой: уход у мойки" },
  { src: "/photos/kristina-work-2.webp", alt: "Кристина за работой: мытьё головы" },
  { src: "/photos/kristina-work-3.webp", alt: "Кристина за работой: ополаскивание" },
];
