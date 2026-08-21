const ITEMS = [
  "/maria-beauty",
  "/joao-foto",
  "/carlos-imoveis",
  "/studio-luna",
  "/personal-rafa",
  "/doces-da-ana",
  "/barbearia-nobre",
  "/nutri-clara",
];

function Row() {
  return (
    <div className="flex shrink-0 items-center gap-10 px-5">
      {ITEMS.map((item) => (
        <span
          key={item}
          className="text-[15px] font-medium tracking-tight text-lime"
        >
          {item}
        </span>
      ))}
    </div>
  );
}

export function ProofMarquee() {
  return (
    <section className="overflow-hidden bg-ink py-4" aria-hidden="true">
      <div className="flex w-max animate-marquee">
        <Row />
        <Row />
      </div>
    </section>
  );
}
