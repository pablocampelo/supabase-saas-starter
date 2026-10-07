import { ImageResponse } from "next/og";

const palette = {
  ink: "#17191d",
  muted: "#6f7278",
  border: "#deddd8",
  soft: "#f4f2ed",
  white: "#ffffff",
};

function MockField({ label }: { label: string }) {
  return <div style={{ display: "flex", flexDirection: "column", width: "100%", gap: 7 }}>
    <div style={{ display: "flex", fontSize: 15, fontWeight: 600, color: palette.ink }}>{label}</div>
    <div style={{ display: "flex", height: 44, width: "100%", border: `1px solid ${palette.border}`, borderRadius: 9, background: palette.white }} />
  </div>;
}

function Mark({ size = 38 }: { size?: number }) {
  return <div style={{ display: "flex", width: size, height: size, flexDirection: "column", justifyContent: "center", gap: 4 }}>
    <div style={{ display: "flex", width: size - 2, height: 12, border: "2px solid #17191d", borderRadius: 7, transform: "skewY(-10deg)" }} />
    <div style={{ display: "flex", width: size - 2, height: 12, border: "2px solid #17191d", borderRadius: 7, transform: "skewY(-10deg)" }} />
  </div>;
}

export function createSignupSocialImage() {
  return new ImageResponse(
    <div style={{ display: "flex", width: "100%", height: "100%", background: palette.white, color: palette.ink, fontFamily: "Arial, sans-serif" }}>
      <div style={{ display: "flex", width: "46%", height: "100%", padding: "42px 46px", position: "relative", overflow: "hidden", flexDirection: "column", justifyContent: "space-between", background: palette.soft, borderRight: `1px solid ${palette.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 25, fontWeight: 700, letterSpacing: "-0.03em" }}>
          <Mark size={32}/><span>SupaSaaS</span>
        </div>

        <div style={{ display: "flex", width: "100%", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <div style={{ display: "flex", width: 430, height: 350, flexDirection: "column", border: `1px solid ${palette.border}`, borderRadius: 16, background: palette.white, boxShadow: "0 18px 50px rgba(23,25,29,.08)", padding: 24 }}>
            <div style={{ display: "flex", width: "100%", alignItems: "center", paddingBottom: 20, borderBottom: `1px solid ${palette.border}` }}>
              <div style={{ display: "flex", gap: 7 }}>
                <span style={{ width: 9, height: 9, borderRadius: 99, background: "#b9b8b4" }} />
                <span style={{ width: 9, height: 9, borderRadius: 99, background: "#d1d0cc" }} />
                <span style={{ width: 9, height: 9, borderRadius: 99, background: "#d1d0cc" }} />
              </div>
              <span style={{ width: 76, height: 7, marginLeft: "auto", borderRadius: 99, background: palette.soft }} />
            </div>
            <div style={{ display: "flex", flex: 1, paddingTop: 24, gap: 22 }}>
              <div style={{ display: "flex", width: 92, flexDirection: "column", gap: 18, paddingRight: 20, borderRight: `1px solid ${palette.border}` }}>
                <span style={{ width: 28, height: 28, borderRadius: 7, border: `1px solid ${palette.border}`, background: palette.soft }} />
                <span style={{ width: 62, height: 8, borderRadius: 99, background: "#d4d2cd" }} />
                <span style={{ width: 48, height: 8, borderRadius: 99, background: "#deddd8" }} />
                <span style={{ width: 56, height: 8, borderRadius: 99, background: "#deddd8" }} />
              </div>
              <div style={{ display: "flex", flex: 1, flexDirection: "column", gap: 16 }}>
                <span style={{ width: 145, height: 10, borderRadius: 99, background: "#c9c7c1" }} />
                <span style={{ width: "100%", height: 8, borderRadius: 99, background: "#e0dfdb" }} />
                <div style={{ display: "flex", flex: 1, border: `1px solid ${palette.border}`, borderRadius: 10, background: "#faf9f7", padding: 16 }}>
                  <div style={{ display: "flex", width: "100%", height: "100%", border: "1px dashed #c9c7c1", borderRadius: 7 }} />
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <span style={{ width: 92, height: 32, borderRadius: 7, background: palette.ink }} />
                  <span style={{ width: 70, height: 32, borderRadius: 7, border: `1px solid ${palette.border}` }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          <span style={{ fontSize: 15, color: palette.muted }}>Next.js · Supabase · Stripe · Vercel</span>
          <span style={{ fontSize: 13, color: "#8b8d92" }}>Production-ready SaaS starter</span>
        </div>
      </div>

      <div style={{ display: "flex", width: "54%", height: "100%", padding: "38px 54px 42px", flexDirection: "column", background: palette.white }}>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, fontSize: 15, color: palette.muted }}>
          <span>Already have an account?</span><span style={{ color: palette.ink, fontWeight: 600 }}>Sign in</span>
        </div>

        <div style={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "center" }}>
          <div style={{ display: "flex", width: 390, flexDirection: "column" }}>
            <div style={{ display: "flex", marginBottom: 22 }}><Mark size={40}/></div>
            <div style={{ display: "flex", fontSize: 38, fontWeight: 700, letterSpacing: "-0.035em", lineHeight: 1.08 }}>Create your account</div>
            <div style={{ display: "flex", marginTop: 12, fontSize: 16, color: palette.muted }}>Create your account with Google or email and password.</div>

            <div style={{ display: "flex", height: 46, marginTop: 26, alignItems: "center", justifyContent: "center", border: `1px solid ${palette.border}`, borderRadius: 9, fontSize: 15, fontWeight: 600 }}>Continue with Google</div>

            <div style={{ display: "flex", alignItems: "center", margin: "18px 0", gap: 12 }}>
              <span style={{ height: 1, flex: 1, background: palette.border }} />
              <span style={{ fontSize: 11, letterSpacing: "0.12em", color: "#8a8c91" }}>OR CONTINUE WITH EMAIL</span>
              <span style={{ height: 1, flex: 1, background: palette.border }} />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
              <MockField label="Name"/><MockField label="Email"/><MockField label="Password"/>
            </div>

            <div style={{ display: "flex", height: 47, marginTop: 20, alignItems: "center", justifyContent: "center", borderRadius: 9, background: palette.ink, color: palette.white, fontSize: 15, fontWeight: 700 }}>Create account</div>
            <div style={{ display: "flex", marginTop: 14, fontSize: 11, color: "#8a8c91" }}>By creating an account, you agree to our Terms of Service and Privacy Policy.</div>
          </div>
        </div>
      </div>
    </div>,
    { width: 1200, height: 630 },
  );
}
