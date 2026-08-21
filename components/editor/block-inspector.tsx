"use client";

import { Eye, EyeOff, Plus, Star, Trash2 } from "lucide-react";
import { SOCIAL_NETWORKS } from "@/components/editor/editor-meta";
import {
  BlockLookControls,
  mergeLook,
} from "@/components/editor/block-look-controls";
import { SocialIcon } from "@/components/profile/brand-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { lookFrom } from "@/lib/block-look";
import type {
  CtaButtonContent,
  CtaStyle,
  HeroContent,
  LinkButtonContent,
  LocationContent,
  Profile,
  ProfileBlock,
  ServiceItem,
  ServicesContent,
  SocialContent,
  SocialLayout,
  SocialNetwork,
  TestimonialsContent,
  TestimonialItem,
  WhatsAppContent,
} from "@/lib/types/profile";
import { formatPriceFromCents, parsePriceToCents } from "@/lib/types/profile";
import { cn } from "@/lib/utils";

export function BlockInspector({
  block,
  onChange,
  profile,
  services = [],
  testimonials = [],
  onServicesChange,
  onTestimonialsChange,
}: {
  block: ProfileBlock;
  onChange: (next: ProfileBlock) => void;
  profile?: Profile | null;
  services?: ServiceItem[];
  testimonials?: TestimonialItem[];
  onServicesChange?: (next: ServiceItem[]) => void;
  onTestimonialsChange?: (next: TestimonialItem[]) => void;
}) {
  const setContent = (content: ProfileBlock["content"]) =>
    onChange({ ...block, content });

  switch (block.type) {
    case "HERO": {
      const content = block.content as HeroContent;
      const avatarUrl = content.avatarUrl || profile?.avatarUrl || "";
      const name = content.name || profile?.displayName || "";
      const headline = content.headline || profile?.headline || "";
      const bio = content.bio || profile?.bio || "";
      const location = content.location || profile?.location || "";
      return (
        <div className="space-y-5">
          <Section title="Foto">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarUrl}
                alt=""
                className="mb-3 h-16 w-16 rounded-full object-cover"
              />
            ) : null}
            <Field hint="Cole o link de uma imagem (https://...).">
              <Label>URL da foto</Label>
              <Input
                value={avatarUrl}
                onChange={(event) =>
                  setContent({
                    ...content,
                    avatarUrl: event.target.value,
                  })
                }
                placeholder="https://..."
              />
            </Field>
          </Section>
          <Section title="Textos do topo">
            <Field hint="Como o nome aparece no cabeçalho da página.">
              <Label>Nome</Label>
              <Input
                value={name}
                onChange={(event) =>
                  setContent({ ...content, name: event.target.value })
                }
                placeholder="Maria Oliveira"
              />
            </Field>
            <Field>
              <Label>Headline</Label>
              <Input
                value={headline}
                onChange={(event) =>
                  setContent({ ...content, headline: event.target.value })
                }
                placeholder="Lash Designer"
              />
            </Field>
            <Field>
              <Label>Bio</Label>
              <Textarea
                value={bio}
                onChange={(event) =>
                  setContent({ ...content, bio: event.target.value })
                }
                placeholder="Uma frase sobre o seu trabalho"
              />
            </Field>
            <Field>
              <Label>Cidade no cabeçalho</Label>
              <Input
                value={location}
                onChange={(event) =>
                  setContent({ ...content, location: event.target.value })
                }
                placeholder="Brasília - DF"
              />
            </Field>
          </Section>
          <BlockLookControls
            look={lookFrom(content)}
            onChange={(look) => setContent(mergeLook(content, look))}
          />
        </div>
      );
    }
    case "LOCATION": {
      const content = block.content as LocationContent;
      return (
        <div className="space-y-5">
          <Section title="Endereço">
            <Field hint="Cidade, bairro ou endereço completo.">
              <Label>Local</Label>
              <Input
                value={content.address ?? ""}
                onChange={(event) =>
                  setContent({ ...content, address: event.target.value })
                }
                minLength={3}
                placeholder="Asa Norte, Brasília - DF"
              />
            </Field>
            <Field hint="Se vazio, aparece o endereço acima.">
              <Label>Texto do link</Label>
              <Input
                value={content.label ?? ""}
                onChange={(event) =>
                  setContent({ ...content, label: event.target.value })
                }
                placeholder="Ver no mapa"
              />
            </Field>
            <Field>
              <Label>Link do Maps</Label>
              <Input
                value={content.mapsUrl || content.url || ""}
                onChange={(event) =>
                  setContent({
                    ...content,
                    mapsUrl: event.target.value,
                    url: event.target.value,
                  })
                }
                placeholder="https://maps.google.com/?q=Brasilia"
              />
            </Field>
          </Section>
          <BlockLookControls
            look={lookFrom(content)}
            onChange={(look) => setContent(mergeLook(content, look))}
            showWidth
            showPulse
          />
        </div>
      );
    }
    case "CTA_BUTTON": {
      const content = block.content as CtaButtonContent;
      const style = (content.style ?? "primary") as CtaStyle;
      return (
        <div className="space-y-5">
          <Section title="Conteúdo">
            <Field>
              <Label>Texto do botão</Label>
              <Input
                value={content.label ?? ""}
                onChange={(event) =>
                  setContent({ ...content, label: event.target.value })
                }
                placeholder="Agendar horário"
              />
            </Field>
            <Field hint="Cole o link completo, com https://">
              <Label>URL</Label>
              <Input
                value={content.url ?? ""}
                onChange={(event) =>
                  setContent({ ...content, url: event.target.value })
                }
                placeholder="https://wa.me/5561999999999"
              />
            </Field>
          </Section>
          <Section title="Aparência deste botão">
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  ["primary", "Principal"],
                  ["secondary", "Suave"],
                  ["outline", "Contorno"],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setContent({ ...content, style: value })}
                  className={cn(
                    "rounded-xl border px-2 py-3 text-[12px] font-semibold transition",
                    style === value
                      ? "border-ink bg-ink text-white"
                      : "border-line bg-white text-ink hover:border-bronze/40",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </Section>
          <BlockLookControls
            look={lookFrom(content)}
            onChange={(look) => setContent(mergeLook(content, look))}
            fallbackTextColor="#ffffff"
            showWidth
            showPulse
          />
        </div>
      );
    }
    case "LINK_BUTTON": {
      const content = block.content as LinkButtonContent;
      return (
        <div className="space-y-5">
          <Section title="Conteúdo">
            <Field>
              <Label>Texto do botão</Label>
              <Input
                value={content.label ?? ""}
                onChange={(event) =>
                  setContent({ ...content, label: event.target.value })
                }
                placeholder="Portfólio"
              />
            </Field>
            <Field hint="Cole o link completo, com https://">
              <Label>URL</Label>
              <Input
                value={content.url ?? ""}
                onChange={(event) =>
                  setContent({ ...content, url: event.target.value })
                }
                placeholder="https://instagram.com/seuuser"
              />
            </Field>
            <Field hint="Opcional. Ex.: ✨ ou o nome da rede.">
              <Label>Ícone / prefixo</Label>
              <Input
                value={content.icon ?? ""}
                onChange={(event) =>
                  setContent({ ...content, icon: event.target.value })
                }
                placeholder="✨"
              />
            </Field>
          </Section>
          <BlockLookControls
            look={lookFrom(content)}
            onChange={(look) => setContent(mergeLook(content, look))}
            showWidth
            showPulse
          />
        </div>
      );
    }
    case "WHATSAPP": {
      const content = block.content as WhatsAppContent;
      return (
        <div className="space-y-5">
          <Section title="Contato">
            <Field>
              <Label>Texto do botão</Label>
              <Input
                value={content.label ?? "WhatsApp"}
                onChange={(event) =>
                  setContent({ ...content, label: event.target.value })
                }
                placeholder="Falar no WhatsApp"
              />
            </Field>
            <Field hint="Só números, com DDI. Ex.: 5561999999999">
              <Label>Telefone</Label>
              <Input
                value={content.phone ?? ""}
                inputMode="numeric"
                onChange={(event) =>
                  setContent({
                    ...content,
                    phone: event.target.value.replace(/\D/g, ""),
                  })
                }
                placeholder="5561999999999"
              />
            </Field>
            <Field hint="Abre o WhatsApp já com este texto.">
              <Label>Mensagem automática</Label>
              <Textarea
                value={content.message ?? ""}
                onChange={(event) =>
                  setContent({ ...content, message: event.target.value })
                }
                placeholder="Oi! Vi seu perfil e quero agendar."
              />
            </Field>
          </Section>
          <BlockLookControls
            look={lookFrom(content)}
            onChange={(look) => setContent(mergeLook(content, look))}
            fallbackTextColor="#ffffff"
            showWidth
            showPulse
          />
        </div>
      );
    }
    case "SOCIAL": {
      const content = block.content as SocialContent;
      const items = content.items ?? [];
      const layout: SocialLayout = content.layout || "icons";
      return (
        <div className="space-y-4">
          <Section title="Estilo">
            <div className="grid grid-cols-2 gap-1.5">
              {(
                [
                  ["icons", "Só ícones"],
                  ["buttons", "Botões com texto"],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setContent({ ...content, layout: value })}
                  className={cn(
                    "min-h-11 rounded-xl border px-2 text-[12px] font-semibold",
                    layout === value
                      ? "border-ink bg-ink text-white"
                      : "border-line bg-white text-ink hover:border-bronze/40",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </Section>
          <Section title="Redes">
            {items.length === 0 ? (
              <p className="text-[13px] text-muted">
                Nenhuma rede ainda. Adicione Instagram, TikTok ou o seu site.
              </p>
            ) : null}
            {items.map((item, index) => (
              <div
                key={`${item.network}-${index}`}
                className="space-y-3 rounded-2xl border border-line bg-white p-3.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="flex items-center gap-2 text-[12px] font-semibold text-ink">
                    <SocialIcon network={item.network} className="h-4 w-4" />
                    Rede {index + 1}
                  </p>
                  <button
                    type="button"
                    className="text-[12px] font-medium text-red-600"
                    onClick={() =>
                      setContent({
                        ...content,
                        items: items.filter((_, i) => i !== index),
                      })
                    }
                  >
                    Remover
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {SOCIAL_NETWORKS.map((network) => (
                    <button
                      key={network.id}
                      type="button"
                      onClick={() => {
                        const next = [...items];
                        next[index] = { ...item, network: network.id };
                        setContent({ ...content, items: next });
                      }}
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold",
                        item.network === network.id
                          ? "border-ink bg-ink text-white"
                          : "border-line bg-card text-ink",
                      )}
                    >
                      <SocialIcon network={network.id} className="h-3 w-3" />
                      {network.label}
                    </button>
                  ))}
                </div>
                <Field>
                  <Label>URL</Label>
                  <Input
                    value={item.url}
                    onChange={(event) => {
                      const next = [...items];
                      next[index] = { ...item, url: event.target.value };
                      setContent({ ...content, items: next });
                    }}
                    placeholder="https://instagram.com/seuuser"
                  />
                </Field>
                <Field hint="Usado no estilo de botões. Se vazio, usa o nome da rede.">
                  <Label>Texto no botão</Label>
                  <Input
                    value={item.label ?? ""}
                    onChange={(event) => {
                      const next = [...items];
                      next[index] = { ...item, label: event.target.value };
                      setContent({ ...content, items: next });
                    }}
                    placeholder={networkLabel(item.network)}
                  />
                </Field>
              </div>
            ))}
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() =>
                setContent({
                  ...content,
                  items: [
                    ...items,
                    { network: "instagram", url: "https://instagram.com/" },
                  ],
                })
              }
            >
              <Plus className="h-3.5 w-3.5" />
              Adicionar rede
            </Button>
          </Section>
          <BlockLookControls
            look={lookFrom(content)}
            onChange={(look) => setContent(mergeLook(content, look))}
            showWidth={layout === "buttons"}
            showPulse
          />
        </div>
      );
    }
    case "SERVICES": {
      const content = block.content as ServicesContent;
      return (
        <div className="space-y-5">
          <Section title="Seção">
            <Field>
              <Label>Título</Label>
              <Input
                value={content.heading ?? "Serviços"}
                onChange={(event) =>
                  setContent({ ...content, heading: event.target.value })
                }
              />
            </Field>
          </Section>
          <BlockLookControls
            look={lookFrom(content)}
            onChange={(look) => setContent(mergeLook(content, look))}
          />
          <Section title="Itens">
            {services.length === 0 ? (
              <p className="text-[13px] text-muted">
                Adicione os serviços que você oferece e o preço de cada um.
              </p>
            ) : null}
            {services.map((item, index) => (
              <div
                key={item.id}
                className="space-y-3 rounded-2xl border border-line bg-white p-3.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[12px] font-semibold text-ink">
                    Serviço {index + 1}
                  </p>
                  <div className="flex items-center gap-1">
                    <IconButton
                      label={item.isVisible ? "Ocultar" : "Mostrar"}
                      onClick={() =>
                        onServicesChange?.(
                          services.map((svc) =>
                            svc.id === item.id
                              ? { ...svc, isVisible: !svc.isVisible }
                              : svc,
                          ),
                        )
                      }
                    >
                      {item.isVisible ? (
                        <Eye className="h-3.5 w-3.5" />
                      ) : (
                        <EyeOff className="h-3.5 w-3.5" />
                      )}
                    </IconButton>
                    <IconButton
                      label="Remover serviço"
                      danger
                      onClick={() =>
                        onServicesChange?.(
                          services.filter((svc) => svc.id !== item.id),
                        )
                      }
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </IconButton>
                  </div>
                </div>
                <Field>
                  <Label>Nome</Label>
                  <Input
                    value={item.name}
                    onChange={(event) =>
                      onServicesChange?.(
                        services.map((svc) =>
                          svc.id === item.id
                            ? { ...svc, name: event.target.value }
                            : svc,
                        ),
                      )
                    }
                    placeholder="Extensão fio a fio"
                  />
                </Field>
                <Field>
                  <Label>Descrição</Label>
                  <Textarea
                    value={item.description ?? ""}
                    onChange={(event) =>
                      onServicesChange?.(
                        services.map((svc) =>
                          svc.id === item.id
                            ? { ...svc, description: event.target.value }
                            : svc,
                        ),
                      )
                    }
                    placeholder="Duração, o que está incluso..."
                    className="min-h-[72px]"
                  />
                </Field>
                <Field>
                  <Label>Preço (R$)</Label>
                  <Input
                    inputMode="decimal"
                    value={
                      item.priceCents
                        ? (item.priceCents / 100).toLocaleString("pt-BR", {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 2,
                          })
                        : ""
                    }
                    onChange={(event) =>
                      onServicesChange?.(
                        services.map((svc) => {
                          if (svc.id !== item.id) return svc;
                          const priceCents = parsePriceToCents(
                            event.target.value,
                          );
                          return {
                            ...svc,
                            priceCents,
                            priceFormatted: formatPriceFromCents(priceCents),
                          };
                        }),
                      )
                    }
                    placeholder="180"
                  />
                </Field>
              </div>
            ))}
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() =>
                onServicesChange?.([
                  ...services,
                  {
                    id: `tmp_${Date.now()}`,
                    name: "Novo serviço",
                    description: "",
                    priceCents: 0,
                    priceFormatted: "R$ 0,00",
                    sortOrder: services.length,
                    isVisible: true,
                  },
                ])
              }
            >
              <Plus className="h-3.5 w-3.5" />
              Adicionar serviço
            </Button>
          </Section>
        </div>
      );
    }
    case "TESTIMONIALS": {
      const content = (block.content || {}) as TestimonialsContent;
      return (
        <div className="space-y-5">
          <Section title="Seção">
            <Field>
              <Label>Título</Label>
              <Input
                value={content.heading ?? "Depoimentos"}
                onChange={(event) =>
                  setContent({ ...content, heading: event.target.value })
                }
              />
            </Field>
          </Section>
          <BlockLookControls
            look={lookFrom(content)}
            onChange={(look) => setContent(mergeLook(content, look))}
          />
          <Section title="Depoimentos">
            {testimonials.length === 0 ? (
              <p className="text-[13px] text-muted">
                Adicione falas reais de clientes para gerar confiança.
              </p>
            ) : null}
            {testimonials.map((item, index) => (
              <div
                key={item.id}
                className="space-y-3 rounded-2xl border border-line bg-white p-3.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[12px] font-semibold text-ink">
                    Cliente {index + 1}
                  </p>
                  <div className="flex items-center gap-1">
                    <IconButton
                      label={item.isVisible ? "Ocultar" : "Mostrar"}
                      onClick={() =>
                        onTestimonialsChange?.(
                          testimonials.map((tst) =>
                            tst.id === item.id
                              ? { ...tst, isVisible: !tst.isVisible }
                              : tst,
                          ),
                        )
                      }
                    >
                      {item.isVisible ? (
                        <Eye className="h-3.5 w-3.5" />
                      ) : (
                        <EyeOff className="h-3.5 w-3.5" />
                      )}
                    </IconButton>
                    <IconButton
                      label="Remover depoimento"
                      danger
                      onClick={() =>
                        onTestimonialsChange?.(
                          testimonials.filter((tst) => tst.id !== item.id),
                        )
                      }
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </IconButton>
                  </div>
                </div>
                <Field>
                  <Label>Nome</Label>
                  <Input
                    value={item.authorName}
                    onChange={(event) =>
                      onTestimonialsChange?.(
                        testimonials.map((tst) =>
                          tst.id === item.id
                            ? { ...tst, authorName: event.target.value }
                            : tst,
                        ),
                      )
                    }
                    placeholder="Ana Clara"
                  />
                </Field>
                <Field>
                  <Label>Depoimento</Label>
                  <Textarea
                    value={item.text}
                    onChange={(event) =>
                      onTestimonialsChange?.(
                        testimonials.map((tst) =>
                          tst.id === item.id
                            ? { ...tst, text: event.target.value }
                            : tst,
                        ),
                      )
                    }
                    placeholder="Ficou perfeito, super recomendo."
                  />
                </Field>
                <div>
                  <Label>Nota</Label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        type="button"
                        onClick={() =>
                          onTestimonialsChange?.(
                            testimonials.map((tst) =>
                              tst.id === item.id ? { ...tst, rating } : tst,
                            ),
                          )
                        }
                        className="inline-flex h-11 w-11 items-center justify-center rounded-lg hover:bg-background"
                        aria-label={`${rating} estrelas`}
                      >
                        <Star
                          className={cn(
                            "h-5 w-5",
                            rating <= (item.rating || 0)
                              ? "fill-amber-400 text-amber-400"
                              : "text-line",
                          )}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() =>
                onTestimonialsChange?.([
                  ...testimonials,
                  {
                    id: `tmp_${Date.now()}`,
                    authorName: "Cliente",
                    text: "Excelente atendimento.",
                    rating: 5,
                    sortOrder: testimonials.length,
                    isVisible: true,
                  },
                ])
              }
            >
              <Plus className="h-3.5 w-3.5" />
              Adicionar depoimento
            </Button>
          </Section>
        </div>
      );
    }
    default:
      return null;
  }
}

function networkLabel(network: SocialNetwork) {
  return SOCIAL_NETWORKS.find((item) => item.id === network)?.label ?? network;
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h3 className="text-[12px] font-semibold uppercase tracking-[0.12em] text-muted">
        {title}
      </h3>
      {children}
    </section>
  );
}

function Field({
  children,
  hint,
}: {
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div>
      {children}
      {hint ? (
        <p className="mt-1.5 text-[13px] leading-relaxed text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

function IconButton({
  children,
  onClick,
  label,
  danger,
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-lg border border-line",
        danger ? "text-red-600" : "text-muted",
      )}
    >
      {children}
    </button>
  );
}
