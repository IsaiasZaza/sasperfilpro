import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#D4E05C",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 22,
            right: 22,
            width: 28,
            height: 28,
            borderRadius: 99,
            background: "#14110E",
          }}
        />
        <div
          style={{
            color: "#14110E",
            fontSize: 110,
            fontWeight: 700,
            fontFamily: "Georgia, serif",
            lineHeight: 1,
            marginTop: 8,
          }}
        >
          P
        </div>
      </div>
    ),
    size,
  );
}
