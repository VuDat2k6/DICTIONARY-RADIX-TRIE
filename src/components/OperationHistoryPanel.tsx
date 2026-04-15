import React from "react";
import { colors, Card, SectionHeader } from "../styles";

export interface HistoryItem {
  id: string;
  text: string;
  type: "success" | "error" | "info";
  word?: string;
  meaning?: string;
}

interface OperationHistoryPanelProps {
  history: HistoryItem[];
}

const OperationHistoryPanel: React.FC<OperationHistoryPanelProps> = ({ history }) => {
  const getColor = (type: "success" | "error" | "info") => {
    if (type === "success") return { color: colors.green, bg: colors.greenBg, border: colors.greenBorder };
    if (type === "error") return { color: colors.red, bg: colors.redBg, border: colors.redBorder };
    return { color: colors.blue, bg: colors.blueBg, border: colors.blueBorder };
  };

  const getIcon = (type: "success" | "error" | "info") => {
    if (type === "success") return "✅";
    if (type === "error") return "❌";
    return "ℹ️";
  };

  return (
    <Card style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
      <SectionHeader icon="📜" title="Lịch sử thao tác" color={colors.text} />
      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "6px" }}>
        {history.length === 0 && (
          <div style={{ color: colors.textSubtle, fontSize: "12px", fontStyle: "italic", textAlign: "center", padding: "16px 0" }}>
            Chưa có thao tác nào
          </div>
        )}
        {history.map((item, idx) => {
          const c = getColor(item.type);
          return (
            <div
              key={item.id}
              style={{
                background: c.bg,
                border: `1px solid ${c.border}`,
                borderRadius: "8px",
                padding: "8px 10px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                opacity: Math.max(0.4, 1 - idx * 0.08),
                transition: "opacity 0.2s",
              }}
            >
              <span style={{ fontSize: "13px", flexShrink: 0 }}>{getIcon(item.type)}</span>
              <div style={{ flex: 1 }}>
                <div style={{ color: c.color, fontSize: "11px", fontWeight: 600 }}>
                  {item.text}
                </div>
                {item.meaning && (
                  <div style={{ color: colors.textSubtle, fontSize: "10px", marginTop: "1px" }}>
                    → {item.meaning}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default OperationHistoryPanel;
