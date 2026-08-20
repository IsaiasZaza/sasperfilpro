import { ImageResponse } from "next/og";

export const alt = "PerfilPro — Seu perfil profissional na bio do Instagram";
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
          background: "#F6F3EE",
          padding: "72px",
          color: "#14110E",
        }}
      >
        <div
          style={{
            fontSize: 28,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: "#9A7048",
          }}
        >
          PerfilPro
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              fontSize: 64,
              lineHeight: 1.1,
              maxWidth: 900,
            }}
          >
            Transforme o link da sua bio em uma página que vende por você.
          </div>
          <div style={{ fontSize: 28, color: "#6B645C", maxWidth: 780 }}>
            Seu Instagram apresenta. Seu PerfilPro transforma visitantes em
            clientes.
          </div>
        </div>
      </div>
    ),
    size,
  );
}
