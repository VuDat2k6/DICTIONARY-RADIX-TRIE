import React, { useState } from "react";
import { colors, shadows, radii, transitions } from "../styles";
import type { TrieNodeData } from "../data/RadixTrie";

// ─── Node Box ────────────────────────────────────────────────────────────────
interface TreeNodeProps {
  node: TrieNodeData;
  level?: number;
  path?: string;
  onSelect?: (node: TrieNodeData, path: string) => void;
  selectedNodeId?: string | null;
  showPath?: boolean;
}

const TreeNode: React.FC<TreeNodeProps> = ({
  node,
  level = 0,
  path = "",
  onSelect,
  selectedNodeId,
  showPath = true,
}) => {
  const [isExpanded, setIsExpanded] = useState(level < 3);
  const hasChildren = node.children.length > 0;
  const isSelected = selectedNodeId === node.id;

  const currentPath = path + node.label;

  // ── Determine visual style ─────────────────────────────────────────────────
  let bgColor = "rgba(20, 30, 50, 0.95)";
  let borderColor = colors.borderStrong;
  let textColor = colors.text;
  let shadow = shadows.sm;
  let glow = "";

  if (node.isDeleted) {
    bgColor = "rgba(239, 68, 68, 0.18)";
    borderColor = colors.red + "aa";
    textColor = "#fca5a5";
    glow = shadows.glowStrong(colors.red);
    shadow = glow;
  } else if (node.isNew) {
    bgColor = "rgba(34, 197, 94, 0.18)";
    borderColor = colors.green + "aa";
    textColor = "#86efac";
    glow = shadows.glowStrong(colors.green);
    shadow = glow;
  } else if (node.isFound) {
    bgColor = "rgba(245, 158, 11, 0.18)";
    borderColor = colors.yellow + "aa";
    textColor = "#fcd34d";
    glow = shadows.glowStrong(colors.yellow);
    shadow = glow;
  } else if (node.isHighlighted) {
    bgColor = "rgba(59, 130, 246, 0.18)";
    borderColor = colors.blue + "aa";
    textColor = "#93c5fd";
    glow = shadows.glow(colors.blue);
    shadow = glow;
  } else if (isSelected) {
    bgColor = "rgba(168, 85, 247, 0.15)";
    borderColor = colors.purple + "cc";
    textColor = "#c4b5fd";
    glow = shadows.glow(colors.purple);
    shadow = glow;
  }

  const childBranchColor = node.isNew ? colors.green
    : node.isDeleted ? colors.red
    : node.isHighlighted ? colors.blue
    : node.isFound ? colors.yellow
    : colors.borderStrong;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>

      {/* Node box */}
      <div
        onClick={() => onSelect?.(node, currentPath)}
        style={{
          background: bgColor,
          border: `2px solid ${borderColor}`,
          borderRadius: radii.md,
          padding: "8px 14px",
          minWidth: "110px",
          maxWidth: "170px",
          textAlign: "center" as const,
          cursor: "pointer",
          boxShadow: shadow,
          transition: `all ${transitions.normal}`,
          position: "relative",
        }}
      >
        {/* Selection indicator */}
        {isSelected && (
          <div style={{
            position: "absolute",
            top: "-4px",
            right: "-4px",
            width: "10px",
            height: "10px",
            borderRadius: "50%",
            background: colors.purple,
            border: "2px solid #0a0e1a",
          }} />
        )}

        {/* Child count badge */}
        {hasChildren && (
          <div style={{
            position: "absolute",
            top: "-8px",
            right: "-8px",
            width: "18px",
            height: "18px",
            borderRadius: "50%",
            background: colors.surfaceHover,
            border: `1px solid ${colors.borderStrong}`,
            color: colors.textSubtle,
            fontSize: "10px",
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            {node.children.length}
          </div>
        )}

        {/* Label */}
        <div style={{
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          fontSize: "13px",
          fontWeight: 700,
          color: textColor,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "3px",
          flexWrap: "wrap",
        }}>
          <span style={{ color: colors.blueLight, fontSize: "10px" }}>"</span>
          <span>{node.label}</span>
          <span style={{ color: colors.blueLight, fontSize: "10px" }}>"</span>

          {node.isEndOfWord && (
            <span style={{
              background: colors.yellowBg,
              color: colors.yellow,
              border: `1px solid ${colors.yellowBorder}`,
              padding: "1px 5px",
              borderRadius: radii.full,
              fontSize: "8px",
              fontWeight: 700,
            }}>
              END
            </span>
          )}
          {node.isNew && (
            <span style={{
              background: colors.greenBg,
              color: colors.green,
              border: `1px solid ${colors.greenBorder}`,
              padding: "1px 5px",
              borderRadius: radii.full,
              fontSize: "8px",
              fontWeight: 700,
            }}>
              NEW
            </span>
          )}
          {node.isDeleted && (
            <span style={{
              background: colors.redBg,
              color: colors.red,
              border: `1px solid ${colors.redBorder}`,
              padding: "1px 5px",
              borderRadius: radii.full,
              fontSize: "8px",
              fontWeight: 700,
            }}>
              DEL
            </span>
          )}
          {node.isFound && (
            <span style={{
              background: colors.yellowBg,
              color: colors.yellow,
              border: `1px solid ${colors.yellowBorder}`,
              padding: "1px 5px",
              borderRadius: radii.full,
              fontSize: "8px",
              fontWeight: 700,
            }}>
              FOUND
            </span>
          )}
        </div>

        {/* Meaning */}
        {node.isEndOfWord && node.meaning && (
          <div style={{
            fontSize: "10px",
            color: colors.yellow,
            marginTop: "3px",
            opacity: 0.85,
            fontStyle: "italic",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap" as const,
            maxWidth: "150px",
          }}
          title={node.meaning}
          >
            {node.meaning}
          </div>
        )}

        {/* Path (subtle) */}
        {showPath && (
          <div style={{
            fontSize: "9px",
            color: colors.textSubtle,
            marginTop: "3px",
            fontFamily: "monospace",
            opacity: 0.5,
          }}>
            {currentPath}
          </div>
        )}
      </div>

      {/* Expand/collapse toggle for children */}
      {hasChildren && (
        <div style={{ marginTop: "4px" }}>
          <button
            onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
            style={{
              background: "none",
              border: "none",
              color: colors.textSubtle,
              fontSize: "11px",
              cursor: "pointer",
              padding: "1px 6px",
              borderRadius: radii.sm,
              transition: `background ${transitions.fast}`,
              fontFamily: "monospace",
            }}
            onMouseOver={(e) => { e.currentTarget.style.background = colors.surfaceHover; }}
            onMouseOut={(e) => { e.currentTarget.style.background = "none"; }}
          >
            {isExpanded ? "▼" : "▶"}
          </button>
        </div>
      )}

      {/* Children */}
      {hasChildren && isExpanded && (
        <div style={{
          display: "flex",
          gap: "12px",
          marginTop: "8px",
          paddingTop: "8px",
          borderTop: `1px solid ${childBranchColor}`,
        }}>
          {node.children.map((child, i) => (
            <div key={child.id + i} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              {/* Vertical connector */}
              <div style={{
                width: "1px",
                height: "8px",
                background: childBranchColor,
                opacity: 0.4,
              }} />
              <TreeNode
                node={child}
                level={level + 1}
                path={currentPath}
                onSelect={onSelect}
                selectedNodeId={selectedNodeId}
                showPath={showPath}
              />
            </div>
          ))}
        </div>
      )}

      {/* Collapsed indicator */}
      {hasChildren && !isExpanded && (
        <div style={{
          marginTop: "4px",
          fontSize: "10px",
          color: colors.textSubtle,
          opacity: 0.4,
          fontStyle: "italic",
        }}>
          +{node.children.length} child{node.children.length > 1 ? "ren" : ""}
        </div>
      )}
    </div>
  );
};

export default TreeNode;
