import { CartProvider } from "@/components/cart";
import { PageEnter } from "@/components/motion";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getSettings } from "@/lib/settings";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = getSettings();

  return (
    <CartProvider>
      <div className="flex min-h-screen flex-col">
        <SiteHeader salonName={settings.salonName} />
        <main className="flex-1">
          <PageEnter>{children}</PageEnter>
        </main>
        <SiteFooter settings={settings} />
      </div>
    </CartProvider>
  );
}
