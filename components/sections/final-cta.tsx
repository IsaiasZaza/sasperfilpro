import { ClaimUsername } from "@/components/marketing/claim-username";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";

export function FinalCta() {
  return (
    <section className="bg-lime py-20 sm:py-28">
      <Container>
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-serif text-[2.3rem] leading-[1.08] text-ink sm:text-[3.2rem]">
              Comece o seu canto da internet hoje.
            </h2>
            <p className="mt-5 text-base leading-[1.7] text-ink/70">
              Reserve o link, escolha o plano e cadastre o cartão na Stripe.
              Seu próximo cliente pode estar a um toque de distância.
            </p>
            <div className="mt-8 flex justify-center">
              <ClaimUsername buttonLabel="Criar minha página" />
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
