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
import { JsonLd } from "@/components/seo/json-ld";
import { billingApi } from "@/lib/api-client";
import { MARKETING_FAQS } from "@/lib/marketing-faq";
import { absoluteUrl, SITE_DESCRIPTION, SITE_NAME, SITE_TITLE } from "@/lib/site";
import type { Plan } from "@/lib/types/billing";
import type { Metadata } from "next";

export const revalidate = 3600;

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

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

  const site = absoluteUrl();

  return (
    <main>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Organization",
              "@id": `${site}/#organization`,
              name: SITE_NAME,
              url: site,
              logo: `${site}/icon`,
              description: SITE_DESCRIPTION,
            },
            {
              "@type": "WebSite",
              "@id": `${site}/#website`,
              name: SITE_NAME,
              url: site,
              inLanguage: "pt-BR",
              publisher: { "@id": `${site}/#organization` },
            },
            {
              "@type": "SoftwareApplication",
              name: SITE_NAME,
              applicationCategory: "BusinessApplication",
              operatingSystem: "Web",
              description: SITE_DESCRIPTION,
              url: site,
              offers: {
                "@type": "AggregateOffer",
                priceCurrency: "BRL",
                lowPrice: "20",
                highPrice: "39",
              },
            },
            {
              "@type": "FAQPage",
              mainEntity: MARKETING_FAQS.map((item) => ({
                "@type": "Question",
                name: item.q,
                acceptedAnswer: {
                  "@type": "Answer",
                  text: item.a,
                },
              })),
            },
            {
              "@type": "WebPage",
              "@id": `${site}/#webpage`,
              url: site,
              name: SITE_TITLE,
              description: SITE_DESCRIPTION,
              inLanguage: "pt-BR",
              isPartOf: { "@id": `${site}/#website` },
            },
          ],
        }}
      />
      <Hero trialDays={trialDays} />
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
