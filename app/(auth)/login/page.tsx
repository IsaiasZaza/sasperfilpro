import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Entrar — PerfilPro",
  robots: { index: false, follow: false },
};

type PageProps = {
  searchParams: Promise<{
    checkout?: string;
    session_id?: string;
    email?: string;
    next?: string;
  }>;
};

export default async function LoginPage({ searchParams }: PageProps) {
  const params = await searchParams;
  return (
    <LoginForm
      initialCheckout={params.checkout}
      initialSessionId={params.session_id}
      initialEmail={params.email}
      nextPath={params.next}
    />
  );
}
