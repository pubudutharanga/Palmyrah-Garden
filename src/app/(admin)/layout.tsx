import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AdminShell } from "@/components/admin/admin-shell";
import { isFrontDeskAuthenticated } from "@/lib/front-desk-session";

export const metadata: Metadata = {
  title: {
    default: "Front desk",
    template: "%s — Palmyrah front desk",
  },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!(await isFrontDeskAuthenticated())) {
    redirect("/admin/login");
  }

  return <AdminShell>{children}</AdminShell>;
}
