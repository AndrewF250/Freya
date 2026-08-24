import type { Metadata } from "next";
import { QuizFlow } from "@/components/quiz-flow";
import { PageHead } from "@/components/ui";
import { getVisibleProducts } from "@/lib/products";

export const metadata: Metadata = {
  title: "Подбор ухода",
  description: "Пять вопросов о ваших волосах — и Кристина соберёт ритуал из продуктов Davines под вашу задачу.",
};

export default function QuizPage() {
  const products = getVisibleProducts();

  return (
    <>
      <PageHead
        eyebrow="Ритуал-квиз"
        title="Подберём уход за минуту"
        text="Пять вопросов о волосах и коже головы. В конце — готовый ритуал из продуктов Davines, который можно сразу купить или взять с собой на консультацию."
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
          concerns: p.concerns,
          hairTypes: p.hairTypes,
        }))}
      />
    </>
  );
}
