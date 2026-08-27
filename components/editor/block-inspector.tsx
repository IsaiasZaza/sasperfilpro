"use client";

import { Eye, EyeOff, Plus, Star, Trash2 } from "lucide-react";
import {
  SOCIAL_NETWORKS,
  socialUrlPlaceholder,
  urlForSocialNetwork,
} from "@/components/editor/editor-meta";
import {
  BlockLookControls,
  ChoiceRow,
  mergeLook,
} from "@/components/editor/block-look-controls";
import { ImageUploadField } from "@/components/editor/image-upload-field";
import { ServicesEditor } from "@/components/editor/services-editor";
import { FieldHead, SizeRow } from "@/components/editor/size-pills";
import { SocialIcon, SOCIAL_BRAND } from "@/components/profile/brand-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { avatarPixels, lookFrom, lookFontSize } from "@/lib/block-look";
import { profileApi } from "@/lib/api-client";
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
import { formatWhatsAppPhone, isValidWhatsAppPhone, normalizeWhatsAppPhone } from "@/lib/phone";
import { cn } from "@/lib/utils";

export function BlockInspector({
  block,
  onChange,
  profile = null,
  services = [],
  testimonials = [],
  onServicesChange,
  onTestimonialsChange,
  canAddService = true,
  canAddTestimonial = true,
  onLimitReached,
  hasLocationBlock = false,
  onAvatarUploaded,
  canCustomizeTheme = false,
  onUpgrade,
}: {
  block: ProfileBlock;
  onChange: (next: ProfileBlock) => void;
  profile?: Profile | null;
  services?: ServiceItem[];
  testimonials?: TestimonialItem[];
  onServicesChange?: (next: ServiceItem[]) => void;
  onTestimonialsChange?: (next: TestimonialItem[]) => void;
  canAddService?: boolean;
  canAddTestimonial?: boolean;
  onLimitReached?: () => void;
  hasLocationBlock?: boolean;
  onAvatarUploaded?: (data: { avatarUrl: string; profile: Profile }) => void;
  canCustomizeTheme?: boolean;
  onUpgrade?: () => void;
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
      const avatarUrl = profile?.avatarUrl || content.avatarUrl || null;
      const look = lookFrom(content);
      const photo = avatarPixels(look.avatarSize);
      return (
        <div className="space-y-5">
          <Section title="Foto">
            <ImageUploadField
              value={avatarUrl}
              photoSize={photo}
              onUploaded={(url) => {
                setContent({
                  ...content,
                  avatarUrl: url,
                });
                if (profile) {
                  onAvatarUploaded?.({ avatarUrl: url, profile });
                } else {
                  onAvatarUploaded?.({
                    avatarUrl: url,
                    profile: { avatarUrl: url } as Profile,
                  });
                }
              }}
              upload={async (file) => {
                const data = await profileApi.uploadAvatar(file);
                return data.avatarUrl;
              }}
              onLocked={onUpgrade}
            />
            <ChoiceRow
              label="Layout do topo"
              hint="Empilhado: foto em cima. Ao lado: foto e texto na mesma linha. Capa: faixa larga com a foto por cima."
              value={
                content.layout ||
                (look.align === "left" || look.align === "right"
                  ? "split"
                  : "stack")
              }
              onChange={(layout) => setContent({ ...content, layout })}
              options={[
                { value: "stack", label: "Empilhado" },
                { value: "split", label: "Ao lado" },
                { value: "banner", label: "Capa" },
              ]}
            />
            {(content.layout || "stack") === "banner" && canCustomizeTheme ? (
              <Field hint="Envia a imagem agora. A capa só entra no ar quando você clicar em Atualizar.">
                <Label>Foto de capa</Label>
                <ImageUploadField
                  value={content.bannerUrl || null}
                  variant="cover"
                  buttonLabel={content.bannerUrl ? "Trocar capa" : "Enviar capa"}
                  removeLabel="Remover capa"
                  emptyLabel="Capa"
                  onUploaded={(bannerUrl) =>
                    setContent({ ...content, layout: "banner", bannerUrl })
                  }
                  onRemove={() =>
                    setContent({ ...content, bannerUrl: "" })
                  }
                  upload={async (file) => {
                    const data = await profileApi.uploadBanner(file);
                    return data.bannerUrl;
                  }}
                  onLocked={onUpgrade}
                />
              </Field>
            ) : null}
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
              showSurface={false}
              showHover={false}
            />
          </Section>
          <Section title="Textos do topo">
            <Field hint="Como o nome aparece no cabeçalho da página.">
              <FieldHead
                label="Nome"
                size={lookFontSize(look, "title")}
                onSizeChange={(titleFontSize) =>
                  setContent({ ...content, titleFontSize })
                }
              />
              <Input
                value={name}
                onChange={(event) =>
                  setContent({ ...content, name: event.target.value })
                }
                placeholder="Maria Oliveira"
              />
            </Field>
            <Field>
              <FieldHead
                label="Frase de destaque"
                size={lookFontSize(look, "headline")}
                onSizeChange={(headlineFontSize) =>
                  setContent({ ...content, headlineFontSize })
                }
              />
              <Input
                value={headline}
                onChange={(event) =>
                  setContent({ ...content, headline: event.target.value })
                }
                placeholder="Lash Designer"
              />
            </Field>
            <Field>
              <FieldHead
                label="Bio"
                size={lookFontSize(look, "bio")}
                onSizeChange={(bioFontSize) =>
                  setContent({ ...content, bioFontSize })
                }
              />
              <Textarea
                value={bio}
                onChange={(event) =>
                  setContent({ ...content, bio: event.target.value })
                }
                placeholder={"Atendo em Brasília\nHorário marcado\nCílios e sobrancelha"}
                rows={4}
              />
              <p className="mt-1.5 text-[12px] leading-relaxed text-muted-soft">
                Aperte Enter para colocar uma frase embaixo da outra.
              </p>
            </Field>
            {hasLocationBlock ? (
              <p className="rounded-xl bg-[#f7f4ef] px-3 py-2.5 text-[12px] leading-relaxed text-muted">
                A cidade aparece no bloco Localização. Edite o endereço lá para
                não ficar duplicada no cabeçalho.
              </p>
            ) : (
              <Field>
                <FieldHead
                  label="Cidade no cabeçalho"
                  size={lookFontSize(look, "meta")}
                  onSizeChange={(metaFontSize) =>
                    setContent({ ...content, metaFontSize })
                  }
                />
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
            onChange={(nextLook) => setContent(mergeLook(content, nextLook))}
            showAvatar={false}
            showAlign
            showHover={false}
            showFontSize={false}
            showRadius={content.layout !== "banner"}
          />
        </div>
      );
    }
    case "LOCATION": {
      const content = block.content as LocationContent;
      const look = lookFrom(content);
      return (
        <div className="space-y-5">
          <Section title="Endereço">
            <Field hint="Cidade, bairro ou endereço completo.">
              <FieldHead
                label="Local"
                size={lookFontSize(look, "body")}
                onSizeChange={(bodyFontSize) =>
                  setContent({ ...content, bodyFontSize })
                }
              />
              <Input
                value={content.address ?? ""}
                onChange={(event) =>
                  setContent({ ...content, address: event.target.value })
                }
                placeholder="Asa Norte, Brasília - DF"
              />
            </Field>
            <Field hint="Se vazio, aparece o endereço acima.">
              <FieldHead
                label="Texto do link"
                size={lookFontSize(look, "meta")}
                onSizeChange={(metaFontSize) =>
                  setContent({ ...content, metaFontSize })
                }
              />
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
            <ChoiceRow
              label="Como aparece"
              hint="Cartão mostra o endereço. Com mapa inclui uma prévia do Google Maps."
              value={content.layout || "card"}
              onChange={(layout) => setContent({ ...content, layout })}
              options={[
                { value: "card", label: "Cartão" },
                { value: "map", label: "Com mapa" },
              ]}
            />
            {(content.layout || "card") === "map" ? (
              <p className="text-[12px] leading-relaxed text-muted">
                O mapa é uma prévia. O visitante toca no cartão e abre o Google
                Maps — o botão Maps permanece visível, sem o iframe roubar o
                scroll da página.
              </p>
            ) : null}
          </Section>
          <BlockLookControls
            look={lookFrom(content)}
            onChange={(nextLook) => setContent(mergeLook(content, nextLook))}
            showWidth
            showFontSize={false}
          />
        </div>
      );
    }
    case "CTA_BUTTON": {
      const content = block.content as CtaButtonContent;
      const style = (content.style ?? "primary") as CtaStyle;
      const look = lookFrom(content);
      return (
        <div className="space-y-5">
          <Section title="Conteúdo">
            <Field>
              <FieldHead
                label="Texto do botão"
                size={lookFontSize(look, "button")}
                onSizeChange={(buttonFontSize) =>
                  setContent({ ...content, buttonFontSize })
                }
              />
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
          <Section
            title="Estilo do botão"
            hint="Principal chama mais atenção. Suave é mais leve. Contorno só desenha a borda."
          >
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
                    "min-h-11 rounded-xl border px-2 py-3 text-[12px] font-semibold transition",
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
            showFontSize={false}
          />
        </div>
      );
    }
    case "LINK_BUTTON": {
      const content = block.content as LinkButtonContent;
      const icon = content.icon || "auto";
      const look = lookFrom(content);
      return (
        <div className="space-y-5">
          <Section title="Conteúdo">
            <Field>
              <FieldHead
                label="Texto do botão"
                size={lookFontSize(look, "button")}
                onSizeChange={(buttonFontSize) =>
                  setContent({ ...content, buttonFontSize })
                }
              />
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
              <FieldHead
                label="Subtítulo"
                size={lookFontSize(look, "meta")}
                onSizeChange={(metaFontSize) =>
                  setContent({ ...content, metaFontSize })
                }
              />
              <Input
                value={content.subtitle ?? ""}
                onChange={(event) =>
                  setContent({ ...content, subtitle: event.target.value })
                }
                placeholder="instagram.com"
              />
            </Field>
            <Field hint="Foto quadrada à esquerda do botão. Cole um link https://.">
              <Label>Miniatura</Label>
              <Input
                value={content.thumbnailUrl ?? ""}
                onChange={(event) =>
                  setContent({ ...content, thumbnailUrl: event.target.value })
                }
                placeholder="https://…"
                inputMode="url"
              />
            </Field>
            <Field hint="Opcional. Ex.: Novo, Vagas.">
              <Label>Selo</Label>
              <Input
                value={content.badge ?? ""}
                onChange={(event) =>
                  setContent({ ...content, badge: event.target.value })
                }
                placeholder="Novo"
              />
            </Field>
            <ChoiceRow
              label="Formato do link"
              hint="Linha é o botão clássico. Capa usa a foto grande. Limpo é só o texto."
              value={content.layout || "row"}
              onChange={(layout) => setContent({ ...content, layout })}
              options={[
                { value: "row", label: "Linha" },
                { value: "cover", label: "Capa" },
                { value: "minimal", label: "Limpo" },
              ]}
            />
          </Section>
          <Section title="Ícone">
            <div className="flex flex-wrap gap-1.5">
              {LINK_ICON_OPTIONS.map((option) => {
                const selected = icon === option.id;
                const chip =
                  option.id !== "auto" && option.id in SOCIAL_BRAND
                    ? SOCIAL_BRAND[option.id as SocialNetwork]
                    : null;
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
                      "inline-flex min-h-9 items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition",
                      selected && !chip
                        ? "border-ink bg-ink text-white"
                        : !selected
                          ? "border-line bg-card text-ink hover:border-ink/20"
                          : "border-transparent text-white",
                    )}
                    style={
                      selected && chip
                        ? {
                            background: chip.background,
                            color: chip.color,
                          }
                        : undefined
                    }
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
            showFontSize={false}
          />
        </div>
      );
    }
    case "WHATSAPP": {
      const content = block.content as WhatsAppContent;
      const look = lookFrom(content);
      return (
        <div className="space-y-5">
          <Section
            title="Contato"
            hint="O botão verde abre o WhatsApp com o número e a mensagem. A prévia atualiza na hora."
          >
            <Field>
              <FieldHead
                label="Texto do botão"
                size={lookFontSize(look, "button")}
                onSizeChange={(buttonFontSize) =>
                  setContent({ ...content, buttonFontSize })
                }
              />
              <Input
                value={content.label ?? "WhatsApp"}
                onChange={(event) =>
                  setContent({ ...content, label: event.target.value })
                }
                placeholder="Falar no WhatsApp"
              />
            </Field>
            <Field hint="Só números, com código do país (DDI). Ex.: 5511999999999, 351912345678, 5491123456789.">
              <Label>Telefone</Label>
              <Input
                value={formatWhatsAppPhone(content.phone ?? "")}
                inputMode="numeric"
                autoComplete="tel"
                onChange={(event) =>
                  setContent({
                    ...content,
                    phone: normalizeWhatsAppPhone(event.target.value),
                  })
                }
                placeholder="5511999999999"
              />
            </Field>
            {isValidWhatsAppPhone(content.phone ?? "") ? (
              <p className="text-[12px] text-muted">
                Abre wa.me/{normalizeWhatsAppPhone(content.phone ?? "")}
              </p>
            ) : (
              <p className="text-[12px] text-amber-800/80">
                Preencha o telefone com DDI (10 a 15 dígitos) para o botão
                abrir o WhatsApp certo. Ex.: 5511999999999
              </p>
            )}
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
            fallbackBackground="#25D366"
            backgroundLabel="Cor do botão"
            showWidth
            showPulse
            showFontSize={false}
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
          <Section
            title="Como aparece"
            hint="A prévia à esquerda atualiza na hora. Ícones são bolinhas de cada rede; botões mostram o nome."
          >
            <ChoiceRow
              label="Formato"
              value={layout}
              onChange={(value) => setContent({ ...content, layout: value })}
              options={[
                { value: "icons", label: "Ícones" },
                { value: "buttons", label: "Botões" },
              ]}
            />
            <ChoiceRow
              label="Cores"
              hint="Da rede usa Instagram rosa, YouTube vermelho, TikTok preto. Do tema pinta tudo com a cor da página. Contorno deixa o fundo transparente."
              value={content.style || "brand"}
              onChange={(style) => setContent({ ...content, style })}
              options={[
                { value: "brand", label: "Da rede" },
                { value: "mono", label: "Do tema" },
                { value: "ghost", label: "Contorno" },
              ]}
            />
          </Section>
          <Section
            title="Redes"
            hint="Escolha a plataforma e cole o endereço. Visitantes tocam o ícone e abrem a rede."
          >
            {items.length === 0 ? (
              <p className="text-[13px] text-muted">
                Nenhuma rede ainda. Adicione Instagram, TikTok ou o seu site.
              </p>
            ) : null}
            {items.map((item, index) => {
              const brand = SOCIAL_BRAND[item.network] || SOCIAL_BRAND.site;
              return (
              <div
                key={`${item.network}-${index}`}
                className="space-y-3 rounded-2xl border border-line bg-white p-3.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="flex min-w-0 items-center gap-2 text-[13px] font-semibold text-ink">
                    <span
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white"
                      style={{ background: brand.background, color: brand.color }}
                    >
                      <SocialIcon network={item.network} className="h-4 w-4" />
                    </span>
                    {networkLabel(item.network)}
                  </p>
                  <button
                    type="button"
                    className="shrink-0 text-[12px] font-medium text-red-600"
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
                  {SOCIAL_NETWORKS.map((network) => {
                    const chip = SOCIAL_BRAND[network.id];
                    const selected = item.network === network.id;
                    return (
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
                        "inline-flex min-h-9 items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition",
                        selected
                          ? "border-transparent text-white"
                          : "border-line bg-card text-ink hover:border-ink/20",
                      )}
                      style={
                        selected
                          ? {
                              background: chip.background,
                              color: chip.color,
                            }
                          : undefined
                      }
                    >
                      <SocialIcon network={network.id} className="h-3 w-3" />
                      {network.label}
                    </button>
                    );
                  })}
                </div>
                <Field hint="Cole o endereço completo. Ex.: https://instagram.com/seunome">
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
              );
            })}
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
      const look = lookFrom(content);
      return (
        <div className="space-y-5">
          <Section title="Seção">
            <Field>
              <FieldHead
                label="Título"
                size={lookFontSize(look, "heading")}
                onSizeChange={(headingFontSize) =>
                  setContent({ ...content, headingFontSize })
                }
              />
              <Input
                value={content.heading ?? "Serviços"}
                onChange={(event) =>
                  setContent({ ...content, heading: event.target.value })
                }
              />
            </Field>
            <ChoiceRow
              label="Lista"
              hint="Linhas empilham nome e preço. Cards viram cartões, um embaixo do outro — mais fáceis de tocar no celular."
              value={content.layout || "list"}
              onChange={(layout) => setContent({ ...content, layout })}
              options={[
                { value: "list", label: "Linhas" },
                { value: "cards", label: "Cards" },
              ]}
            />
          </Section>
          <Section title="Tamanho dos itens">
            <div className="space-y-2 rounded-2xl border border-line bg-white p-3.5">
              <SizeRow
                label="Nome"
                value={lookFontSize(look, "body")}
                onChange={(bodyFontSize) =>
                  setContent({ ...content, bodyFontSize })
                }
              />
              <SizeRow
                label="Descrição"
                value={lookFontSize(look, "meta")}
                onChange={(metaFontSize) =>
                  setContent({ ...content, metaFontSize })
                }
              />
              <SizeRow
                label="Preço"
                value={lookFontSize(look, "price")}
                onChange={(priceFontSize) =>
                  setContent({ ...content, priceFontSize })
                }
              />
            </div>
          </Section>
          <Section title="Itens">
            <ServicesEditor
              services={services}
              onChange={(next) => onServicesChange?.(next)}
              canAdd={canAddService}
              onLimitReached={onLimitReached}
            />
          </Section>
          <BlockLookControls
            look={lookFrom(content)}
            onChange={(nextLook) => setContent(mergeLook(content, nextLook))}
            showFontSize={false}
          />
        </div>
      );
    }
    case "TESTIMONIALS": {
      const content = (block.content || {}) as TestimonialsContent;
      const look = lookFrom(content);
      return (
        <div className="space-y-5">
          <Section title="Seção">
            <Field>
              <FieldHead
                label="Título"
                size={lookFontSize(look, "heading")}
                onSizeChange={(headingFontSize) =>
                  setContent({ ...content, headingFontSize })
                }
              />
              <Input
                value={content.heading ?? "Depoimentos"}
                onChange={(event) =>
                  setContent({ ...content, heading: event.target.value })
                }
              />
            </Field>
            <ChoiceRow
              label="Estilo padrão"
              hint="Novos depoimentos herdam este estilo. Cada um pode ter o seu abaixo."
              value={content.layout || "stack"}
              onChange={(layout) => setContent({ ...content, layout })}
              options={[
                { value: "stack", label: "Cards" },
                { value: "quote", label: "Citação" },
              ]}
            />
          </Section>
          <Section title="Tamanho dos textos">
            <div className="space-y-2 rounded-2xl border border-line bg-white p-3.5">
              <SizeRow
                label="Depoimento"
                value={lookFontSize(look, "body")}
                onChange={(bodyFontSize) =>
                  setContent({ ...content, bodyFontSize })
                }
              />
              <SizeRow
                label="Nome do cliente"
                value={lookFontSize(look, "meta")}
                onChange={(metaFontSize) =>
                  setContent({ ...content, metaFontSize })
                }
              />
            </div>
          </Section>
          <Section title="Depoimentos">
            {testimonials.length === 0 ? (
              <p className="text-[13px] text-muted">
                Adicione falas reais de clientes para gerar confiança.
              </p>
            ) : null}
            {testimonials.map((item, index) => {
              const defaultLayout = content.layout || "stack";
              const itemLayout = item.layout ?? defaultLayout;
              const asQuote = itemLayout === "quote";
              return (
              <div
                key={item.id}
                className="space-y-3 rounded-2xl border border-line bg-white p-3.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[12px] font-semibold text-ink">
                    Cliente {index + 1}
                    {!item.isVisible ? (
                      <span className="ml-1.5 font-normal text-muted">· oculto</span>
                    ) : null}
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
                <ChoiceRow
                  label="Estilo"
                  hint={
                    asQuote
                      ? "Texto grande com aspas, sem estrelas."
                      : "Cartão com estrelas e fundo."
                  }
                  value={item.layout ?? defaultLayout}
                  onChange={(layout) =>
                    onTestimonialsChange?.(
                      testimonials.map((tst) =>
                        tst.id === item.id ? { ...tst, layout } : tst,
                      ),
                    )
                  }
                  options={[
                    { value: "stack", label: "Card" },
                    { value: "quote", label: "Citação" },
                  ]}
                />
                <div className={cn("grid gap-3", asQuote ? "" : "sm:grid-cols-2")}>
                  {!asQuote ? (
                    <ChoiceRow
                      label="Espaço interno"
                      hint="Padding dentro do card."
                      value={item.padding || "md"}
                      onChange={(padding) =>
                        onTestimonialsChange?.(
                          testimonials.map((tst) =>
                            tst.id === item.id ? { ...tst, padding } : tst,
                          ),
                        )
                      }
                      options={[
                        { value: "sm", label: "Compacto" },
                        { value: "md", label: "Normal" },
                        { value: "lg", label: "Amplo" },
                      ]}
                    />
                  ) : null}
                  <ChoiceRow
                    label="Espaço abaixo"
                    hint="Distância até o próximo depoimento."
                    value={item.spacing || "md"}
                    onChange={(spacing) =>
                      onTestimonialsChange?.(
                        testimonials.map((tst) =>
                          tst.id === item.id ? { ...tst, spacing } : tst,
                        ),
                      )
                    }
                    options={[
                      { value: "sm", label: "Pouco" },
                      { value: "md", label: "Normal" },
                      { value: "lg", label: "Muito" },
                    ]}
                  />
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
                {!asQuote ? (
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
                ) : (
                  <p className="text-[12px] leading-relaxed text-muted">
                    Citações não exibem estrelas na página.
                  </p>
                )}
              </div>
              );
            })}
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => {
                if (!canAddTestimonial) {
                  onLimitReached?.();
                  return;
                }
                onTestimonialsChange?.([
                  ...testimonials,
                  {
                    id: `tmp_${Date.now()}`,
                    authorName: "Cliente",
                    text: "Excelente atendimento.",
                    rating: 5,
                    sortOrder: testimonials.length,
                    isVisible: true,
                    layout: content.layout || "stack",
                    padding: "md",
                    spacing: "md",
                  },
                ]);
              }}
            >
              <Plus className="h-3.5 w-3.5" />
              Adicionar depoimento
            </Button>
          </Section>
          <BlockLookControls
            look={lookFrom(content)}
            onChange={(look) => setContent(mergeLook(content, look))}
            showFontSize={false}
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
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div>
        <h3 className="text-[12px] font-semibold uppercase tracking-[0.12em] text-muted">
          {title}
        </h3>
        {hint ? (
          <p className="mt-1 text-[12px] leading-snug text-muted">{hint}</p>
        ) : null}
      </div>
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
