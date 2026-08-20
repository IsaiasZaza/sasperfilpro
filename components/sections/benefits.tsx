import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";

const benefits = [
  {
    value: "1 página",
    label: "Tudo que seu cliente precisa.",
  },
  {
    value: "24h",
    label: "Sua página disponível o tempo todo.",
  },
  {
    value: "100%",
    label: "Adaptada para celular.",
  },
  {
    value: "1 clique",
    label: "Para seu cliente falar com você no WhatsApp.",
  },
];

export function Benefits() {
  return (
    <section className="py-16 sm:py-24">
      <Container>
        <div className="grid gap-8 rounded-3xl border border-line bg-card px-6 py-10 sm:grid-cols-2 sm:px-10 lg:grid-cols-4">
          {benefits.map((item, index) => (
            <Reveal key={item.value} delay={index * 70}>
              <div className="text-center lg:text-left">
                <p className="font-serif text-[2.15rem] leading-none text-ink">
                  {item.value}
                </p>
                <p className="mt-3 text-[15px] leading-[1.65] text-muted">
                  {item.label}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
