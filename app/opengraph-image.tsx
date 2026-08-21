import { ImageResponse } from "next/og";

export const alt = "PerfilPro — Tudo o que você é, em um só link";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#D4E05C",
          padding: "72px",
          color: "#14110E",
        }}
      >
        <div
          style={{
            fontSize: 28,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: "#14110E",
          }}
        >
          PerfilPro
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              fontSize: 68,
              lineHeight: 1.05,
              maxWidth: 920,
            }}
          >
            Tudo o que você é. Em um só link.
          </div>
          <div style={{ fontSize: 28, color: "#3d3a32", maxWidth: 780 }}>
            Monte sua página, mostre serviços e leve o cliente direto para o
            WhatsApp.
          </div>
        </div>
      </div>
    ),
    size,
  );
}
