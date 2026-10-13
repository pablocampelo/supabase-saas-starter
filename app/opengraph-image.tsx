import { ImageResponse } from "next/og";
import { productConfig } from "@/config/product";

export const alt = "Xerv — Build the product. Not the infrastructure.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: "100%", height: "100%", padding: 76, backgroundColor: "#08090a", color: "#f5f5f5", fontFamily: "Arial, sans-serif" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <svg width="54" height="54" viewBox="0 0 100 100" aria-label="Xerv Split X" role="img">
          <path fill="#e4f222" d="M8 12H37L48 27 36 40H34L8 12Z" />
          <path fill="#e4f222" d="M7 89H32L93 12H69L7 89Z" />
          <path fill="#e4f222" d="M63 60H73L94 89H69L54 72Z" />
        </svg>
        <span style={{ fontSize: 32, fontWeight: 600, letterSpacing: -0.64, color: "#f7f8f8" }}>Xerv</span>
        <span style={{ marginLeft: "auto", padding: "10px 18px", border: "1px solid #303238", borderRadius: 30, color: "#a3a9b4", fontSize: 18 }}>OPEN SOURCE · MIT</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
        <div style={{ display: "flex", flexDirection: "column", fontSize: 74, fontWeight: 700, letterSpacing: -3, lineHeight: 1.09 }}><span>Build the product.</span><span>Not the infrastructure.</span></div>
        <div style={{ fontSize: 26, color: "#a3a9b4", letterSpacing: -0.3 }}>Authentication, billing, database, email and deployment. Wired up.</div>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 21, color: "#a3a9b4" }}>
        <span>Next.js  ·  Supabase  ·  Stripe  ·  Resend  ·  Vercel</span>
        <span style={{ color: "#e4f222", fontWeight: 700 }}>{productConfig.repositoryUrl.replace(/^https?:\/\//, "")}</span>
      </div>
    </div>,
    size,
  );
}
