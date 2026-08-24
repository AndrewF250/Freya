"use client";

import { usePathname } from "next/navigation";
import { MasterNav } from "@/components/master/master-nav";
import { isMasterAuthenticated } from "@/lib/master-auth";

export default function MasterLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const authed = isMasterAuthenticated();
  const isLogin = pathname === "/master" || pathname === "/master/";

  if (!authed || isLogin) {
    return <div className="min-h-screen bg-cream">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-cream">
      <MasterNav />
      {children}
    </div>
  );
}
