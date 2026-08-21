import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Criar conta",
  robots: { index: false, follow: false },
};

type PageProps = {
  searchParams: Promise<{
    plan?: string;
    u?: string;
    username?: string;
  }>;
};

export default async function RegisterPage({ searchParams }: PageProps) {
  const params = await searchParams;
  return (
    <RegisterForm
      initialPlan={params.plan}
      initialUsername={params.u || params.username}
    />
  );
}
