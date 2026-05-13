// ─── Design Tokens ─────────────────────────────────────────────────────────────
// eslint-disable-next-line react-refresh/only-export-components
export const colors = {
  bg: "#0a0e1a",
  surface: "rgba(15, 23, 42, 0.9)",
  surfaceHover: "rgba(30, 41, 59, 0.95)",
  border: "rgba(71, 85, 105, 0.3)",
  borderStrong: "rgba(100, 116, 139, 0.5)",
  borderAccent: "rgba(148, 163, 184, 0.2)",

  text: "#f1f5f9",
  textMuted: "#94a3b8",
  textSubtle: "#64748b",

  blue: "#3b82f6",
  blueLight: "#60a5fa",
  blueDark: "#1d4ed8",
  blueBg: "rgba(59, 130, 246, 0.12)",
  blueBorder: "rgba(59, 130, 246, 0.4)",

  green: "#22c55e",
  greenLight: "#4ade80",
  greenDark: "#15803d",
  greenBg: "rgba(34, 197, 94, 0.1)",
  greenBorder: "rgba(34, 197, 94, 0.4)",

  red: "#ef4444",
  redLight: "#f87171",
  redDark: "#b91c1c",
  redBg: "rgba(239, 68, 68, 0.1)",
  redBorder: "rgba(239, 68, 68, 0.4)",

  yellow: "#f59e0b",
  yellowLight: "#fbbf24",
  yellowBg: "rgba(245, 158, 11, 0.1)",
  yellowBorder: "rgba(245, 158, 11, 0.4)",

  purple: "#a855f7",
  purpleLight: "#c084fc",
  purpleBg: "rgba(168, 85, 247, 0.1)",
  purpleBorder: "rgba(168, 85, 247, 0.4)",

  pink: "#ec4899",
  cyan: "#06b6d4",
};

// eslint-disable-next-line react-refresh/only-export-components
export const shadows = {
  sm: "0 1px 3px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.2)",
  md: "0 4px 6px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.2)",
  lg: "0 10px 15px rgba(0,0,0,0.3), 0 4px 6px rgba(0,0,0,0.2)",
  glow: (color: string) => `0 0 20px ${color}44`,
  glowStrong: (color: string) => `0 0 30px ${color}66`,
};

// eslint-disable-next-line react-refresh/only-export-components
export const radii = {
  sm: "6px",
  md: "10px",
  lg: "14px",
  xl: "18px",
  full: "9999px",
};

// eslint-disable-next-line react-refresh/only-export-components
export const transitions = {
  fast: "0.15s ease",
  normal: "0.2s ease",
  slow: "0.3s ease",
};

// ─── Shared Components ─────────────────────────────────────────────────────────

export function Card({ children, style, glow }: { children: React.ReactNode; style?: React.CSSProperties; glow?: string }) {
  return (
    <div style={{
      background: colors.surface,
      border: `1px solid ${colors.border}`,
      borderRadius: radii.lg,
      padding: "16px",
      boxShadow: glow ? shadows.glow(glow) : shadows.sm,
      backdropFilter: "blur(10px)",
      ...style,
    }}>
      {children}
    </div>
  );
}

export function SectionHeader({ icon, title, color }: { icon: string; title: string; color: string }) {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: "8px",
      marginBottom: "12px",
      paddingBottom: "10px",
      borderBottom: `1px solid ${colors.border}`,
    }}>
      <span style={{ fontSize: "16px" }}>{icon}</span>
      <span style={{ color, fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.8px" }}>
        {title}
      </span>
    </div>
  );
}

export function Input({ placeholder, value, onChange, onKeyDown, style }: {
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  style?: React.CSSProperties;
}) {
  return (
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={onKeyDown}
      style={{
        width: "100%",
        padding: "9px 12px",
        background: "rgba(30, 41, 59, 0.9)",
        border: `1px solid ${colors.borderStrong}`,
        borderRadius: radii.md,
        color: colors.text,
        fontSize: "13px",
        outline: "none",
        boxSizing: "border-box",
        transition: `border-color ${transitions.fast}`,
        ...style,
      }}
      onFocus={(e) => { e.currentTarget.style.borderColor = colors.blue + "aa"; }}
      onBlur={(e) => { e.currentTarget.style.borderColor = colors.borderStrong; }}
    />
  );
}

export function Button({ children, onClick, bg, hoverBg, fullWidth, style }: {
  children: React.ReactNode;
  onClick: () => void;
  bg: string;
  hoverBg?: string;
  fullWidth?: boolean;
  style?: React.CSSProperties;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        background: bg,
        color: "#fff",
        border: "none",
        padding: "9px 16px",
        borderRadius: radii.md,
        fontSize: "13px",
        fontWeight: 600,
        cursor: "pointer",
        width: fullWidth ? "100%" : "auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "6px",
        transition: `all ${transitions.fast}`,
        ...style,
      }}
      onMouseOver={(e) => { if (hoverBg) e.currentTarget.style.background = hoverBg; }}
      onMouseOut={(e) => { e.currentTarget.style.background = bg; }}
    >
      {children}
    </button>
  );
}

export function Badge({ children, color, bg, style }: {
  children: React.ReactNode;
  color: string;
  bg: string;
  style?: React.CSSProperties;
}) {
  return (
    <span style={{
      background: bg,
      color,
      padding: "2px 8px",
      borderRadius: radii.full,
      fontSize: "10px",
      fontWeight: 700,
      letterSpacing: "0.5px",
      ...style,
    }}>
      {children}
    </span>
  );
}

export function Divider({ label }: { label?: string }) {
  if (!label) {
    return <div style={{ height: "1px", background: colors.border, margin: "8px 0" }} />;
  }
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px", margin: "8px 0" }}>
      <div style={{ flex: 1, height: "1px", background: colors.border }} />
      <span style={{ color: colors.textSubtle, fontSize: "11px" }}>{label}</span>
      <div style={{ flex: 1, height: "1px", background: colors.border }} />
    </div>
  );
}
