"use client";

import { useEffect, useState } from "react";
import { Eye, EyeOff, Plus, Star, Trash2 } from "lucide-react";
import {
  SOCIAL_NETWORKS,
  socialUrlPlaceholder,
  urlForSocialNetwork,
} from "@/components/editor/editor-meta";
import {
  BlockLookControls,
  mergeLook,
} from "@/components/editor/block-look-controls";
import { SocialIcon } from "@/components/profile/brand-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { avatarPixels, avatarRadius, lookFrom } from "@/lib/block-look";
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
import { formatWhatsAppPhone, isValidWhatsAppPhone, normalizeWhatsAppPhone } from "@/lib/phone";
import { isCompleteHttpUrl, normalizeHttpUrl } from "@/lib/url";
import { cn } from "@/lib/utils";

export function BlockInspector({
  block,
  onChange,
  services = [],
  testimonials = [],
  onServicesChange,
  onTestimonialsChange,
  hasLocationBlock = false,
}: {
  block: ProfileBlock;
  onChange: (next: ProfileBlock) => void;
  profile?: Profile | null;
  services?: ServiceItem[];
  testimonials?: TestimonialItem[];
  onServicesChange?: (next: ServiceItem[]) => void;
  onTestimonialsChange?: (next: TestimonialItem[]) => void;
  hasLocationBlock?: boolean;
}) {
  const setContent = (content: ProfileBlock["content"]) => {
    if (JSON.stringify(content) === JSON.stringify(block.content)) return;
    onChange({ ...block, content });
  };

  switch (block.type) {
    case "HERO": {
      const content = block.content as HeroContent;
      const name = content.name ?? "";
      const headline = content.headline ?? "";
      const bio = content.bio ?? "";
      const location = content.location ?? "";
      const avatarUrl = content.avatarUrl ?? "";
      const look = lookFrom(content);
      const photo = avatarPixels(look.avatarSize);
      const photoRadius = avatarRadius(look.avatarShape);
      return (
        <div className="space-y-5">
          <Section title="Foto">
            <AvatarUrlField
              value={avatarUrl}
              photo={photo}
              photoRadius={photoRadius}
              onChange={(next) =>
                setContent({
                  ...content,
                  avatarUrl: next,
                })
              }
            />
            <BlockLookControls
              look={lookFrom(content)}
              onChange={(nextLook) =>
                setContent(mergeLook(content, nextLook))
              }
              title={null}
              showAvatar
              showTextColor={false}
              showBackground={false}
              showBorder={false}
              showAlign={false}
              showFontSize={false}
              showRadius={false}
              showPadding={false}
              showShadow={false}
            />
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
              <Label>Frase de destaque</Label>
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
            {hasLocationBlock ? (
              <p className="rounded-xl bg-[#f7f4ef] px-3 py-2.5 text-[12px] leading-relaxed text-muted">
                A cidade aparece no bloco Localização. Edite o endereço lá para
                não ficar duplicada no cabeçalho.
              </p>
            ) : (
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
            )}
          </Section>
          <BlockLookControls
            look={lookFrom(content)}
            onChange={(look) => setContent(mergeLook(content, look))}
            showAvatar={false}
            showAlign
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
          <Section title="Estilo do botão">
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
            fallbackBackground="#14110e"
            backgroundLabel="Cor do botão"
            showWidth
            showPulse
          />
        </div>
      );
    }
    case "LINK_BUTTON": {
      const content = block.content as LinkButtonContent;
      const icon = content.icon || "auto";
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
            <Field hint="Cole o link completo, com https://. O ícone Automático lê a rede pelo endereço.">
              <Label>URL</Label>
              <Input
                value={content.url ?? ""}
                onChange={(event) =>
                  setContent({ ...content, url: event.target.value })
                }
                placeholder="https://instagram.com/seuuser"
              />
            </Field>
            <Field hint="Se vazio, aparece o domínio do link. Ex.: instagram.com">
              <Label>Subtítulo</Label>
              <Input
                value={content.subtitle ?? ""}
                onChange={(event) =>
                  setContent({ ...content, subtitle: event.target.value })
                }
                placeholder="instagram.com"
              />
            </Field>
          </Section>
          <Section title="Ícone">
            <div className="flex flex-wrap gap-1.5">
              {LINK_ICON_OPTIONS.map((option) => {
                const selected = icon === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() =>
                      setContent({
                        ...content,
                        icon: option.id === "auto" ? "auto" : option.id,
                      })
                    }
                    className={cn(
                      "inline-flex min-h-9 items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold",
                      selected
                        ? "border-ink bg-ink text-white"
                        : "border-line bg-card text-ink",
                    )}
                  >
                    {option.id !== "auto" && option.id !== "emoji" ? (
                      <SocialIcon
                        network={option.id as SocialNetwork}
                        className="h-3 w-3"
                      />
                    ) : null}
                    {option.label}
                  </button>
                );
              })}
            </div>
            <Field hint="Opcional. Se preencher, substitui o ícone da rede.">
              <Label>Emoji</Label>
              <Input
                value={
                  icon !== "auto" &&
                  !LINK_ICON_OPTIONS.some((item) => item.id === icon)
                    ? icon
                    : ""
                }
                onChange={(event) =>
                  setContent({
                    ...content,
                    icon: event.target.value.trim() || "auto",
                  })
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
            backgroundLabel="Cor do botão"
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
            <Field hint="Inclua o código do país. Ex.: 5511999999999 (BR), 351912345678 (PT), 5491123456789 (AR).">
              <Label>Telefone</Label>
              <Input
                value={formatWhatsAppPhone(content.phone ?? "")}
                inputMode="tel"
                autoComplete="tel"
                onChange={(event) =>
                  setContent({
                    ...content,
                    phone: normalizeWhatsAppPhone(event.target.value),
                  })
                }
                placeholder="+55 11 99999-9999"
              />
            </Field>
            {isValidWhatsAppPhone(content.phone ?? "") ? (
              <p className="text-[12px] text-muted">
                Abre wa.me/{normalizeWhatsAppPhone(content.phone ?? "")}
              </p>
            ) : content.phone ? (
              <p className="text-[12px] text-muted">
                Inclua o código do país. Ex.: 5511999999999
              </p>
            ) : null}
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
            fallbackBackground="#128c4b"
            backgroundLabel="Cor do botão"
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
                        if (network.id === item.network) return;
                        const next = [...items];
                        const label =
                          !item.label || item.label === networkLabel(item.network)
                            ? undefined
                            : item.label;
                        next[index] = {
                          ...item,
                          network: network.id,
                          url: urlForSocialNetwork(network.id, item.url),
                          label,
                        };
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
                    placeholder={socialUrlPlaceholder(item.network)}
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
                    {
                      network: "instagram",
                      url: urlForSocialNetwork("instagram"),
                    },
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
          <BlockLookControls
            look={lookFrom(content)}
            onChange={(look) => setContent(mergeLook(content, look))}
          />
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
          <BlockLookControls
            look={lookFrom(content)}
            onChange={(look) => setContent(mergeLook(content, look))}
          />
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

const LINK_ICON_OPTIONS: { id: string; label: string }[] = [
  { id: "auto", label: "Automático" },
  ...SOCIAL_NETWORKS,
];

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

function AvatarUrlField({
  value,
  photo,
  photoRadius,
  onChange,
}: {
  value: string;
  photo: number;
  photoRadius: string | number;
  onChange: (next: string) => void;
}) {
  const [broken, setBroken] = useState(false);
  const trimmed = value.trim();
  const normalized = trimmed ? normalizeHttpUrl(trimmed) : null;
  const formatInvalid = Boolean(trimmed) && !normalized;
  const previewSrc = normalized || (isCompleteHttpUrl(trimmed) ? trimmed : "");

  useEffect(() => {
    setBroken(false);
  }, [previewSrc]);

  return (
    <div className="space-y-2">
      {previewSrc && !broken ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={previewSrc}
          alt="Prévia da foto"
          className="mb-1 object-cover"
          style={{
            width: photo,
            height: photo,
            borderRadius: photoRadius,
            maxWidth: "100%",
          }}
          onError={() => setBroken(true)}
        />
      ) : null}
      {broken ? (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-[12px] text-red-700">
          Não foi possível carregar essa imagem. Confira se o link abre a foto
          direto (termine em .jpg, .png ou similar).
        </p>
      ) : null}
      {formatInvalid ? (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-[12px] text-red-700">
          Use um link completo começando com https://
        </p>
      ) : null}
      <Field hint="Copie o link direto da imagem (https://…), não o da página do Instagram ou Google.">
        <Label>URL da foto</Label>
        <Input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="https://exemplo.com/foto.jpg"
          inputMode="url"
          autoComplete="off"
        />
      </Field>
    </div>
  );
}
