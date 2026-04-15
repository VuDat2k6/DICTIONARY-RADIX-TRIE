import React from "react";
import { colors, Card, SectionHeader, Badge } from "../styles";
import type { TrieNodeData } from "../data/RadixTrie";

interface NodeDetailPanelProps {
  node: TrieNodeData | null;
  path: string;
}

const NodeDetailPanel: React.FC<NodeDetailPanelProps> = ({ node, path }) => {
  if (!node) {
    return (
      <Card style={{ height: "fit-content" }}>
        <SectionHeader icon="ℹ️" title="Chi tiết Node" color={colors.textMuted} />
        <div style={{ color: colors.textSubtle, fontSize: "12px", fontStyle: "italic", textAlign: "center", padding: "16px 0" }}>
          Nhấp vào node trên cây để xem chi tiết
        </div>
      </Card>
    );
  }

  const getStatusColor = () => {
    if (node.isNew) return colors.green;
    if (node.isDeleted) return colors.red;
    if (node.isFound) return colors.yellow;
    if (node.isHighlighted) return colors.blue;
    return colors.purple;
  };

  const getStatusBadge = () => {
    if (node.isNew) return <Badge color={colors.green} bg={colors.greenBg}>✨ NEW</Badge>;
    if (node.isDeleted) return <Badge color={colors.red} bg={colors.redBg}>🗑️ DELETED</Badge>;
    if (node.isFound) return <Badge color={colors.yellow} bg={colors.yellowBg}>🔍 FOUND</Badge>;
    if (node.isHighlighted) return <Badge color={colors.blue} bg={colors.blueBg}>✦ ACTIVE</Badge>;
    return null;
  };

  const statusColor = getStatusColor();

  return (
    <Card glow={statusColor + "33"}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
        <SectionHeader icon="ℹ️" title="Chi tiết Node" color={statusColor} />
        {getStatusBadge()}
      </div>

      {/* Node visualization */}
      <div style={{
        background: "rgba(10, 15, 30, 0.8)",
        border: `1px solid ${statusColor}55`,
        borderRadius: "10px",
        padding: "12px",
        marginBottom: "12px",
        textAlign: "center",
      }}>
        <div style={{
          fontFamily: "monospace",
          fontSize: "16px",
          fontWeight: 800,
          color: statusColor,
        }}>
          "{node.label}"
        </div>
        {node.meaning && (
          <div style={{
            fontSize: "12px",
            color: colors.yellow,
            marginTop: "4px",
            fontStyle: "italic",
          }}>
            {node.meaning}
          </div>
        )}
      </div>

      {/* Properties */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
        <PropertyItem label="Label" value={`"${node.label}"`} mono />
        <PropertyItem label="Có END?" value={node.isEndOfWord ? "✅ Có" : "❌ Không"} />
        <PropertyItem label="Nghĩa" value={node.meaning || "—"} />
        <PropertyItem label="Số con" value={String(node.children.length)} />
        <PropertyItem label="Path" value={path || "/"} mono />
        <PropertyItem
          label="Trạng thái"
          value={
            node.isNew ? "✨ Mới thêm" :
            node.isDeleted ? "🗑️ Đã xóa" :
            node.isHighlighted ? "✦ Đang hoạt động" :
            node.isFound ? "🔍 Đã tìm thấy" :
            "○ Bình thường"
          }
        />
      </div>
    </Card>
  );
};

interface PropertyItemProps {
  label: string;
  value: string;
  mono?: boolean;
}

const PropertyItem: React.FC<PropertyItemProps> = ({ label, value, mono }) => (
  <div>
    <div style={{ color: colors.textSubtle, fontSize: "10px", marginBottom: "2px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
      {label}
    </div>
    <div style={{
      color: colors.text,
      fontSize: "12px",
      fontFamily: mono ? "monospace" : "inherit",
      fontWeight: mono ? 600 : 400,
    }}>
      {value}
    </div>
  </div>
);

export default NodeDetailPanel;
