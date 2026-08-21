"use client";

import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";
import { useAuthGate } from "@/lib/hooks";

export default function OnboardingPage() {
  const { ready, profile } = useAuthGate();

  if (!ready || !profile) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-muted">
        Carregando...
      </div>
    );
  }

  return <OnboardingWizard profile={profile} />;
}
