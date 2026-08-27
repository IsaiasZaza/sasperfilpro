import type { Metadata } from "next";
import { AuthProvider } from "@/components/auth/auth-provider";
import { AppShell } from "@/components/app/app-shell";
import { pageFontVariables } from "@/components/profile/page-font-loader";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AppGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <div className={pageFontVariables()}>
        <AppShell>{children}</AppShell>
      </div>
    </AuthProvider>
  );
}
