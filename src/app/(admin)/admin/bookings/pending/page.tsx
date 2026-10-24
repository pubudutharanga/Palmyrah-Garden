import type { Metadata } from "next";

import { PendingApprovals } from "@/components/admin/pending-approvals";

export const metadata: Metadata = {
  title: "Pending approvals",
};

export default function PendingPage() {
  return <PendingApprovals />;
}
