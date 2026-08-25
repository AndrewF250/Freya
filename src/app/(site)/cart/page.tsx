import type { Metadata } from "next";
import { CartView } from "@/components/cart-view";
import { PageHead } from "@/components/ui";
import { PHOTOS } from "@/lib/photos";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Корзина",
  description: "Оформление заказа продукции Davines у Кристины.",
};

export default function CartPage() {
  const settings = getSettings();

  return (
    <>
      <PageHead
        eyebrow="Заказ"
        title="Корзина"
        text="Оставьте контакты — заказ уйдёт Кристине в Telegram. Она подтвердит наличие и согласует получение."
        photo={PHOTOS.careMask}
      />
      <CartView deliveryText={settings.deliveryText} />
    </>
  );
}
