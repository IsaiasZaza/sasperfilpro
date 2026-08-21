export function InstagramBio() {
  return (
    <div className="rounded-[1.8rem] border border-white/10 bg-[#1a1a1a] p-5 shadow-[0_30px_60px_-28px_rgba(0,0,0,0.7)]">
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[linear-gradient(145deg,#e8c4b8,#c98978)] text-lg font-semibold text-white">
          MO
        </div>
        <div className="grid flex-1 grid-cols-3 gap-2 text-center text-white">
          {[
            ["128", "publicações"],
            ["4.2 mil", "seguidores"],
            ["312", "seguindo"],
          ].map(([value, label]) => (
            <div key={label}>
              <p className="text-sm font-semibold">{value}</p>
              <p className="text-[10px] text-white/50">{label}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-4 text-[13px] leading-relaxed text-white">
        <p className="font-semibold">Maria Oliveira</p>
        <p className="text-white/60">Lash Designer</p>
        <p className="mt-1 text-white/80">✨ Cílios naturais em Brasília</p>
        <p className="mt-2 font-medium text-lime">perfilpro.app/u/maria</p>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="rounded-lg bg-white/10 py-2 text-center text-[12px] font-medium text-white">
          Seguir
        </div>
        <div className="rounded-lg bg-white/10 py-2 text-center text-[12px] font-medium text-white">
          Mensagem
        </div>
      </div>
    </div>
  );
}
