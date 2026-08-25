import type { Metadata } from "next";
import { QuizFlow } from "@/components/quiz-flow";
import { PageHead } from "@/components/ui";
import { PHOTOS } from "@/lib/photos";
import { getVisibleProducts } from "@/lib/products";

export const metadata: Metadata = {
  title: "Подбор ухода Davines",
  description:
    "Онлайн-квиз: подберите шампунь, маску и уход Davines под тип волос. Результат можно купить или взять на консультацию к Кристине в Перми.",
  alternates: { canonical: "/quiz/" },
};

export default function QuizPage() {
  const products = getVisibleProducts();

  return (
    <>
      <PageHead
        eyebrow="Квиз подбора"
        title="Подберём уход за минуту"
        text="Пять вопросов о волосах и коже головы. В конце — готовый набор ухода Davines, который можно сразу купить или взять с собой на консультацию."
        photo={PHOTOS.catLeaveIn}
      />
      <QuizFlow
        products={products.map((p) => ({
          id: p.id,
          slug: p.slug,
          nameRu: p.nameRu,
          nameEn: p.nameEn,
          line: p.line,
          category: p.category,
          volume: p.volume,
          price: p.price,
          image: p.image,
          imageBg: p.imageBg,
          concerns: p.concerns,
          hairTypes: p.hairTypes,
        }))}
      />
    </>
  );
}
