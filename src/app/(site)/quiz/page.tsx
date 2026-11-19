import type { Metadata } from "next";
import { QuizFlow } from "@/components/quiz-flow";
import { PageHead } from "@/components/ui";
import { PHOTOS } from "@/lib/photos";
import { getVisibleProducts } from "@/lib/products";
import { catalogFrom } from "@/lib/catalog";
import { resolveQuizSteps } from "@/lib/quiz";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Подбор ухода Davines",
  description:
    "Онлайн-квиз: подберите шампунь, маску и уход Davines под тип волос в Перми. Результат можно купить или взять на консультацию в салон ФРЕЯ.",
  alternates: { canonical: "/quiz/" },
};

export default function QuizPage() {
  // Все продукты: наборы и мини попадают в подбор, только если мастер закрепил их за ответом.
  const products = getVisibleProducts();
  const settings = getSettings();
  const catalog = catalogFrom(settings);
  const steps = resolveQuizSteps(settings);

  return (
    <>
      <PageHead
        eyebrow="Квиз подбора"
        title="Подберём уход за минуту"
        text="Пять вопросов о волосах и коже головы и комментарий своими словами. В конце — готовый набор ухода Davines, который можно сразу купить или взять с собой на консультацию."
        photo={PHOTOS.catLeaveIn}
      />
      <QuizFlow
        products={products.map((p) => ({
          id: p.id,
          slug: p.slug,
          nameRu: p.nameRu,
          nameEn: p.nameEn,
          line: p.line,
          series: p.series,
          category: p.category,
          volume: p.volume,
          price: p.price,
          image: p.image,
          imageBg: p.imageBg,
          concerns: p.concerns,
          hairTypes: p.hairTypes,
          variants: p.variants,
          related: p.related,
        }))}
        steps={steps}
        tagLabels={Object.fromEntries([...catalog.concerns, ...catalog.hairTypes].map((e) => [e.key, e.label]))}
      />
    </>
  );
}
