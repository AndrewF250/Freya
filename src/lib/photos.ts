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
  brandWide: {
    src: "/photos/davines-brand-wide.webp",
    alt: "Davines — атмосфера бренда",
  },
  brandTall: {
    src: "/photos/davines-brand-tall.webp",
    alt: "Davines — уход и стиль",
  },
  brandParma: {
    src: "/photos/davines-brand-parma.webp",
    alt: "Davines — итальянский бренд из Пармы",
  },
  brandStylist: {
    src: "/photos/davines-brand-stylist.webp",
    alt: "Davines — работа стилиста",
  },
  brandNature: {
    src: "/photos/davines-brand-nature.webp",
    alt: "Davines — натуральные ингредиенты",
  },
  careShampoo: {
    src: "/photos/davines-care-shampoo.webp",
    alt: "Davines — шампуни",
  },
  careConditioner: {
    src: "/photos/davines-care-conditioner.webp",
    alt: "Davines — кондиционеры",
  },
  careStyling: {
    src: "/photos/davines-care-styling.webp",
    alt: "Davines — стайлинг",
  },
  careWaves: {
    src: "/photos/davines-care-waves.webp",
    alt: "Davines — уход для вьющихся волос",
  },
  careMask: {
    src: "/photos/davines-care-mask.webp",
    alt: "Davines — маски для волос",
  },
  lineHero: {
    src: "/photos/davines-line-hero.webp",
    alt: "Davines Essential Haircare",
  },
  lineEssential1: {
    src: "/photos/davines-line-essential-1.webp",
    alt: "Davines Essential — линейка ухода",
  },
  lineEssential2: {
    src: "/photos/davines-line-essential-2.webp",
    alt: "Davines Essential — натуральные формулы",
  },
  lineEssential3: {
    src: "/photos/davines-line-essential-3.webp",
    alt: "Davines Essential — уход в салоне",
  },
} as const satisfies Record<string, SitePhotoSrc>;

export const BRAND_PHOTOS: SitePhotoSrc[] = [
  PHOTOS.brandWide,
  PHOTOS.brandNature,
  PHOTOS.brandStylist,
];

export const CARE_PHOTOS: SitePhotoSrc[] = [
  PHOTOS.careShampoo,
  PHOTOS.careConditioner,
  PHOTOS.careStyling,
  PHOTOS.careWaves,
  PHOTOS.careMask,
];

export const LINE_PHOTOS: SitePhotoSrc[] = [
  PHOTOS.lineHero,
  PHOTOS.lineEssential1,
  PHOTOS.lineEssential2,
  PHOTOS.lineEssential3,
];

export const WORK_PHOTOS: SitePhotoSrc[] = [
  { src: "/photos/kristina-work-1.webp", alt: "Кристина за работой: уход у мойки" },
  { src: "/photos/kristina-work-2.webp", alt: "Кристина за работой: мытьё головы" },
  { src: "/photos/kristina-work-3.webp", alt: "Кристина за работой: ополаскивание" },
];
