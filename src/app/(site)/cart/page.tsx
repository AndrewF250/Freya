import { Suspense } from "react";
import type { Metadata } from "next";
import { CartView } from "@/components/cart-view";
import { PageHead } from "@/components/ui";
import { PHOTOS } from "@/lib/photos";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Корзина",
  description: "Оформление заказа Davines в салоне ФРЕЯ, Пермь. Доставка по городу и СДЭК по России.",
  alternates: { canonical: "/cart/" },
};

export default function CartPage() {
  const settings = getSettings();

  return (
    <>
      <PageHead
        eyebrow="Заказ"
        title="Корзина"
        text="Оставьте контакты — заявка придёт в салон. Мы подтвердим наличие и согласуем получение в Telegram."
        photo={PHOTOS.catMini}
      />
      <Suspense fallback={<div className="shell section min-h-[40vh]" aria-busy="true" />}>
        <CartView deliveryText={settings.deliveryText} />
      </Suspense>
    </>
  );
}
