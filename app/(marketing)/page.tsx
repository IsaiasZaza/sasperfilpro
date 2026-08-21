import { Examples } from "@/components/sections/examples";
import { FAQ } from "@/components/sections/faq";
import { FeaturesShowcase } from "@/components/sections/features-showcase";
import { FinalCta } from "@/components/sections/final-cta";
import { ForWho } from "@/components/sections/for-who";
import { Comparison } from "@/components/sections/comparison";
import { Hero } from "@/components/sections/hero";
import { HowItWorks } from "@/components/sections/how-it-works";
import { Pricing } from "@/components/sections/pricing";
import { ProofMarquee } from "@/components/sections/proof-marquee";
import { billingApi } from "@/lib/api-client";
import type { Plan } from "@/lib/types/billing";

export const dynamic = "force-dynamic";

export default async function Home() {
  let trialDays = 7;
  let plans: Plan[] = [];

  try {
    const catalog = await billingApi.plans();
    trialDays = catalog.trialDays;
    plans = catalog.plans;
  } catch {
    plans = [];
  }

  return (
    <main>
      <Hero />
      <ProofMarquee />
      <HowItWorks trialDays={trialDays} />
      <FeaturesShowcase />
      <Examples />
      <Comparison />
      <Pricing trialDays={trialDays} plans={plans} />
      <ForWho />
      <FAQ />
      <FinalCta />
    </main>
  );
}
