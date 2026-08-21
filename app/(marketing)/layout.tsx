import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { WhatsAppFloat } from "@/components/layout/whatsapp-float";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
