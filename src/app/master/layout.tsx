"use client";

import { usePathname } from "next/navigation";
import { MasterNav } from "@/components/master/master-nav";

export default function MasterLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === "/master" || pathname === "/master/";

  if (isLogin) {
    return <div className="min-h-screen bg-cream">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-cream">
      <MasterNav />
      {children}
    </div>
  );
}
