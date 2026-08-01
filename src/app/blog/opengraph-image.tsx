import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Starry Nova 博客";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #060912 0%, #0d1120 50%, #151b30 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "#f1f5f9",
          fontFamily: "Inter",
        }}
      >
        {/* Decorative stars */}
        <div
          style={{
            position: "absolute",
            top: 60,
            right: 100,
            fontSize: 20,
            color: "rgba(255,255,255,0.3)",
          }}
        >
          ✦
        </div>
        <div
          style={{
            position: "absolute",
            top: 200,
            left: 120,
            fontSize: 14,
            color: "rgba(255,255,255,0.2)",
          }}
        >
          ✧
        </div>

        <div style={{ fontSize: 64, fontWeight: 700, letterSpacing: "0.05em" }}>
          ✦ Starry Nova 博客
        </div>
        <div
          style={{
            fontSize: 28,
            color: "#94a3b8",
            marginTop: 16,
            letterSpacing: "0.1em",
          }}
        >
          技术笔记 · 思考碎片 · 星际日志
        </div>
      </div>
    ),
    { ...size }
  );
}
