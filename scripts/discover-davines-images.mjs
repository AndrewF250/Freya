const pages = [
  "https://davines.ru/",
  "https://davines.ru/essential-haircare/",
  "https://davines.ru/oi/",
  "https://davines.ru/naturaltech/",
  "https://davines.ru/more-inside/",
  "https://davines.ru/heart-of-glass/",
  "https://davines.ru/the-circle-chronicles/",
  "https://davines.ru/liquid-spell/",
  "https://davines.ru/alchemic/",
  "https://davines.ru/authentic/",
  "https://davines.ru/product-category/shampuni/",
  "https://davines.ru/product-category/konditsionery/",
  "https://davines.ru/product-category/maski-dlya-volos/",
  "https://davines.ru/product-category/nesmyvaemyj-uhod/",
  "https://davines.ru/product-category/stajling/",
];

const re = /https:\/\/davines\.ru\/wp-content\/uploads\/[^"'\s)]+\.(?:jpg|jpeg|png|webp)/gi;

const found = new Set();
for (const page of pages) {
  const res = await fetch(page);
  const html = await res.text();
  for (const m of html.matchAll(re)) found.add(m[0]);
}

const list = [...found].sort();
for (const url of list) {
  if (/es-hero|shampuni|maski|waves|18-scaled|aab892|1-1-scaled|2-1-scaled|3-1-scaled|konditsion|nesmyvaem|stajling/i.test(url)) {
    console.log(url);
  }
}
