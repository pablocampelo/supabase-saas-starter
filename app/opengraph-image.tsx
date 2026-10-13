import { ImageResponse } from "next/og";

export const alt = "Xerv — Build the product. Not the infrastructure.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: "100%", height: "100%", padding: 76, backgroundColor: "#08090a", color: "#f5f5f5", fontFamily: "Arial, sans-serif" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", background: "#e4f222", color: "#08090a", width: 54, height: 54, borderRadius: 12, fontSize: 30, fontWeight: 700 }}>X</div>
        <span style={{ fontSize: 32, fontWeight: 700, letterSpacing: -1 }}>Xerv</span>
        <span style={{ marginLeft: "auto", padding: "10px 18px", border: "1px solid #303238", borderRadius: 30, color: "#a3a9b4", fontSize: 18 }}>OPEN SOURCE · MIT</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
        <div style={{ fontSize: 74, fontWeight: 700, letterSpacing: -3, lineHeight: 1.09 }}>Build the product.<br />Not the infrastructure.</div>
        <div style={{ fontSize: 26, color: "#a3a9b4", letterSpacing: -0.3 }}>Authentication, billing, database, email and deployment. Wired up.</div>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 21, color: "#a3a9b4" }}>
        <span>Next.js  ·  Supabase  ·  Stripe  ·  Resend  ·  Vercel</span>
        <span style={{ color: "#e4f222", fontWeight: 700 }}>github.com/pablocampelo/xerv</span>
      </div>
    </div>,
    size,
  );
}
