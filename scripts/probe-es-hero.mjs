const base = "https://davines.ru/wp-content/uploads/2025/12/";
const names = [
  "shampuni-1.jpg",
  "shampuni.jpg",
  "konditsionery.jpg",
  "konditsionery-1.jpg",
  "maski.jpg",
  "maski-1.jpg",
  "nesmyvaemyj-uhod.jpg",
  "stajling.jpg",
  "stajling-1.jpg",
  "nabory.jpg",
  "dlya-doma.jpg",
];

for (const name of names) {
  const url = base + name;
  const res = await fetch(url, { method: "HEAD" });
  if (res.ok) console.log(url);
}

const base2 = "https://davines.ru/wp-content/uploads/2026/04/";
for (let i = 1; i <= 8; i++) {
  for (const ext of ["png", "jpg"]) {
    const url = `${base2}es-hero-${i}-1.${ext}`;
    const res = await fetch(url, { method: "HEAD" });
    if (res.ok) console.log(url);
  }
}
