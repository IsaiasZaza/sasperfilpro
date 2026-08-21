import { Examples } from "@/components/sections/examples";
import { FAQ } from "@/components/sections/faq";
import { FeaturesShowcase } from "@/components/sections/features-showcase";
import { FinalCta } from "@/components/sections/final-cta";
import { ForWho } from "@/components/sections/for-who";
import { Comparison } from "@/components/sections/comparison";
import { Hero } from "@/components/sections/hero";
import { HowItWorks } from "@/components/sections/how-it-works";
import { ProofMarquee } from "@/components/sections/proof-marquee";

export default function Home() {
  return (
    <main>
      <Hero />
      <ProofMarquee />
      <HowItWorks />
      <FeaturesShowcase />
      <Examples />
      <Comparison />
      <ForWho />
      <FAQ />
      <FinalCta />
    </main>
  );
}
