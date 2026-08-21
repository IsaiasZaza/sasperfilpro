import type { Metadata } from "next";
import { DashboardHome } from "@/components/app/dashboard-home";

export const metadata: Metadata = {
  title: "Painel — PerfilPro",
  robots: { index: false, follow: false },
};

export default function AppPage() {
  return <DashboardHome />;
}
