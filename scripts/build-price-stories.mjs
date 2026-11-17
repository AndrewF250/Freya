// Собирает stories/price-stories.html из src/data/price.json.
// Открой файл как  price-stories.html?n=1 … ?n=4  в окне 1080×1920 и сохрани скриншот — это готовые сторис.
// Данные цен — те же, что на сайте (src/data/price.json), поэтому после правки цен просто запусти:
//   node scripts/build-price-stories.mjs
import { readFileSync, writeFileSync } from "node:fs";

const root = new URL("../", import.meta.url);
const { groups } = JSON.parse(readFileSync(new URL("src/data/price.json", root), "utf8"));
const settings = JSON.parse(readFileSync(new URL("src/data/settings.json", root), "utf8"));
const g = (id) => groups.find((x) => x.id === id);

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
const row = (i) =>
  `<li><span class="t">${esc(i.title)}${i.note ? `<small>${esc(i.note)}</small>` : ""}</span><i></i><b>${esc(i.price)}</b></li>`;

const cuts = g("cuts");
const color = g("color");
const care = g("care");

const slides = [
  {
    bg: "wash.jpg",
    ghost: "ПРАЙС",
    title: "Стрижки",
    body: `<ul class="list big">${cuts.items.map(row).join("")}</ul>`,
  },
  {
    bg: "a14.jpg",
    ghost: "ЦВЕТ",
    title: "Окрашивание",
    body: `<ul class="list">${color.items.map(row).join("")}</ul>
           <p class="foot">* ${esc(color.footnote)}</p>`,
  },
  {
    bg: "pour.jpg",
    ghost: "УХОД",
    title: "Уход",
    body:
      care.subgroups
        .map(
          (s) => `<h4>${esc(s.title)}</h4><p class="sub">${esc(s.note)}</p>
                  <ul class="list tight">${s.items.map(row).join("")}</ul>`,
        )
        .join("") + `<ul class="list tight extra">${care.items.map(row).join("")}</ul>`,
  },
  {
    bg: "scissors.jpg",
    ghost: "ЗАПИСЬ",
    title: "Запись",
    body: `<div class="contact">
      <p class="lead">Записывайтесь в личные сообщения или по телефону</p>
      <p class="big-line">${esc(settings.phone)}</p>
      <p>${esc(settings.address)}</p>
      <p>${esc(settings.hours)}</p>
      <p class="mute">Davines · ${esc(settings.salonName)} · Пермь</p>
    </div>`,
  },
];

const html = `<!doctype html>
<html lang="ru"><head><meta charset="utf-8">
<title>Сторис — прайс ФРЕЯ</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600&display=swap&subset=cyrillic" rel="stylesheet">
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  html,body{width:1080px;height:1920px;background:#1b2430;font-family:Montserrat,sans-serif;color:#faf6f0;overflow:hidden}
  .slide{display:none;position:relative;width:1080px;height:1920px;overflow:hidden}
  .slide.on{display:block}
  .bg{position:absolute;inset:0;background-size:cover;background-position:center;filter:blur(2px) saturate(.85);transform:scale(1.04)}
  .shade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(27,36,48,.58) 0%,rgba(27,36,48,.74) 40%,rgba(27,36,48,.9) 100%)}
  .ghost{position:absolute;left:0;right:0;top:318px;text-align:center;font-weight:600;font-size:230px;letter-spacing:.04em;line-height:1;color:rgba(250,246,240,.09);white-space:nowrap}
  .wrap{position:absolute;left:90px;right:90px;top:250px;bottom:260px;display:flex;flex-direction:column}
  .brand{font-size:26px;letter-spacing:.5em;text-transform:uppercase;color:#c6a15b;text-align:center;padding-left:.5em}
  h1{margin-top:44px;font-weight:300;font-size:84px;letter-spacing:.1em;text-transform:uppercase;text-align:center;padding-left:.1em}
  .rule{width:90px;height:2px;background:#c6a15b;margin:44px auto 56px}
  .body{flex:1;display:flex;flex-direction:column;justify-content:center}
  .list{list-style:none}
  .list li{display:flex;align-items:flex-end;gap:22px;padding:22px 0;font-size:40px;line-height:1.25;font-weight:400}
  .list li .t{flex:0 1 auto;max-width:640px}
  .list li small{display:block;font-size:26px;font-weight:300;color:rgba(250,246,240,.62);margin-top:4px}
  .list li i{flex:1;margin-bottom:12px;border-bottom:2px dotted rgba(250,246,240,.32);min-width:30px}
  .list li b{font-weight:500;white-space:nowrap;color:#faf6f0}
  .list.big li{padding:34px 0;font-size:46px}
  .list.tight li{padding:12px 0;font-size:38px}
  .list.extra{margin-top:34px;padding-top:22px;border-top:1px solid rgba(250,246,240,.2)}
  h4{font-weight:500;font-size:40px;letter-spacing:.08em;text-transform:uppercase;color:#c6a15b;margin-top:26px}
  h4:first-child{margin-top:0}
  .sub{font-size:27px;font-weight:300;color:rgba(250,246,240,.65);margin:6px 0 8px}
  .foot{margin-top:36px;font-size:27px;font-weight:300;color:rgba(250,246,240,.65)}
  .contact{text-align:center;display:flex;flex-direction:column;gap:30px;font-size:38px;font-weight:300}
  .contact .lead{font-size:42px;line-height:1.4;margin-bottom:20px}
  .contact .big-line{font-size:60px;font-weight:500;letter-spacing:.04em}
  .contact .mute{margin-top:40px;font-size:26px;letter-spacing:.3em;text-transform:uppercase;color:#c6a15b}
</style></head><body>
${slides
  .map(
    (s, i) => `<section class="slide" data-n="${i + 1}">
  <div class="bg" style="background-image:url(assets/${s.bg})"></div><div class="shade"></div>
  <div class="ghost" style="font-size:${s.ghost.length > 5 ? 185 : 230}px">${s.ghost}</div>
  <div class="wrap"><div class="brand">Фрея</div><h1>${s.title}</h1><div class="rule"></div><div class="body">${s.body}</div></div>
</section>`,
  )
  .join("\n")}
<script>
  const n = new URLSearchParams(location.search).get("n") || "1";
  document.querySelector('.slide[data-n="' + n + '"]').classList.add("on");
</script>
</body></html>`;

writeFileSync(new URL("stories/price-stories.html", root), html);
console.log("stories/price-stories.html готов, слайдов:", slides.length);
