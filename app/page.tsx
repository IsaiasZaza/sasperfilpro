import { About } from "@/components/sections/about";
import { Benefits } from "@/components/sections/benefits";
import { Comparison } from "@/components/sections/comparison";
import { CtaBanner } from "@/components/sections/cta-banner";
import { Examples } from "@/components/sections/examples";
import { FAQ } from "@/components/sections/faq";
import { FinalCta } from "@/components/sections/final-cta";
import { ForWho } from "@/components/sections/for-who";
import { Hero } from "@/components/sections/hero";
import { HowItWorks } from "@/components/sections/how-it-works";
import { Problem } from "@/components/sections/problem";
import { Solution } from "@/components/sections/solution";

export default function Home() {
  return (
    <main>
      <Hero />
      <Problem />
      <Solution />
      <HowItWorks />
      <About />
      <ForWho />
      <Examples />
      <Comparison />
      <Benefits />
      <CtaBanner />
      <FAQ />
      <FinalCta />
    </main>
  );
}
