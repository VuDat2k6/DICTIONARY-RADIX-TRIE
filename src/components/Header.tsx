import React from "react";
import { colors, shadows, transitions } from "../styles";

interface HeaderProps {
  wordCount: number;
  onTabChange: (tab: "dictionary" | "tree") => void;
  activeTab: "dictionary" | "tree";
}

const Header: React.FC<HeaderProps> = ({ wordCount, onTabChange, activeTab }) => {
  return (
    <div style={{
      background: "rgba(8, 12, 24, 0.98)",
      borderBottom: `1px solid ${colors.border}`,
      flexShrink: 0,
    }}>
      {/* Top bar */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "10px 20px",
        borderBottom: `1px solid ${colors.border}`,
      }}>
        {/* Logo + Title */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            width: "36px",
            height: "36px",
            borderRadius: "10px",
            background: `linear-gradient(135deg, ${colors.blue}, ${colors.purple})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "18px",
            boxShadow: shadows.md,
          }}>
            📖
          </div>
          <div>
            <div style={{
              fontSize: "16px",
              fontWeight: 800,
              background: `linear-gradient(135deg, ${colors.blueLight}, ${colors.purpleLight})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              letterSpacing: "0.3px",
            }}>
              English Dictionary
            </div>
            <div style={{ color: colors.textSubtle, fontSize: "10px", display: "flex", alignItems: "center", gap: "4px" }}>
              <span style={{ color: colors.green }}>●</span> Radix Trie Structure
            </div>
          </div>
        </div>

        {/* Right info */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ color: colors.textMuted, fontSize: "10px" }}>Số từ trong từ điển</div>
            <div style={{ color: colors.blueLight, fontSize: "18px", fontWeight: 800 }}>{wordCount}</div>
          </div>
          <div style={{
            width: "1px",
            height: "30px",
            background: colors.border,
          }} />
          <div style={{ textAlign: "right" }}>
            <div style={{ color: colors.textSubtle, fontSize: "10px" }}>Project</div>
            <div style={{ color: colors.purple, fontSize: "12px", fontWeight: 600 }}>CS523</div>
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ display: "flex", gap: "4px", padding: "0 20px" }}>
        {[
          { id: "dictionary" as const, label: "Từ Điển", icon: "📖", color: colors.blue },
          { id: "tree" as const, label: "Cây Radix-Trie", icon: "🌳", color: colors.purple },
        ].map(({ id, label, icon, color }) => (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            style={{
              padding: "10px 24px",
              border: "none",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: 600,
              background: "transparent",
              color: activeTab === id ? color : colors.textSubtle,
              borderBottom: `2px solid ${activeTab === id ? color : "transparent"}`,
              transition: `all ${transitions.fast}`,
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
            onMouseOver={(e) => { if (activeTab !== id) e.currentTarget.style.color = colors.textMuted; }}
            onMouseOut={(e) => { if (activeTab !== id) e.currentTarget.style.color = colors.textSubtle; }}
          >
            <span>{icon}</span>
            <span>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Header;
