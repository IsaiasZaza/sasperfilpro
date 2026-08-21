import type { Metadata } from "next";
import { SubscriptionManager } from "@/components/billing/subscription-manager";

export const metadata: Metadata = {
  title: "Assinatura",
  robots: { index: false, follow: false },
};

export default function AssinaturaPage() {
  return <SubscriptionManager />;
}
