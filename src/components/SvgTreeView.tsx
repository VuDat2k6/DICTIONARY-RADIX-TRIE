import React, { useState, useRef, useMemo } from "react";
import type { TrieNodeData } from "../data/RadixTrie";
import { colors } from "../styles";

// ─── Layout constants ─────────────────────────────────────────────────────────
const NODE_W = 140;
const NODE_H = 64;
const H_GAP = 56;
const V_GAP = 140;
const PADDING_X = 24;
const PADDING_Y = 24;

// ─── Positioned node for rendering ───────────────────────────────────────────
interface PosNode {
  node: TrieNodeData;
  cx: number;
  y: number;
  children: PosNode[];
  depth: number;
}

// ─── Layout algorithm ─────────────────────────────────────────────────────────
function buildLayout(root: TrieNodeData, depth: number): PosNode {
  const childPos: PosNode[] = root.children.map(c => buildLayout(c, depth + 1));

  const childWidths = childPos.map(c => getSubtreeWidth(c));
  const totalChildWidth = childWidths.reduce((s, w) => s + w, 0);
  const totalGaps = Math.max(0, childPos.length - 1) * H_GAP;

  const subtreeWidth = Math.max(NODE_W, totalChildWidth + totalGaps);

  let childCx = -totalChildWidth / 2 - totalGaps / 2;
  childPos.forEach((cp, i) => {
    cp.cx += childCx + subtreeWidth / 2;
    childCx += childWidths[i] + H_GAP;
  });

  return {
    node: root,
    cx: subtreeWidth / 2,
    y: depth * (NODE_H + V_GAP),
    children: childPos,
    depth,
  };
}

function getSubtreeWidth(pos: PosNode): number {
  if (pos.children.length === 0) return NODE_W;
  const childWidths = pos.children.map(c => getSubtreeWidth(c));
  const total = childWidths.reduce((s, w) => s + w, 0);
  const gaps = Math.max(0, pos.children.length - 1) * H_GAP;
  return Math.max(NODE_W, total + gaps);
}

function getSubtreeHeight(pos: PosNode): number {
  if (pos.children.length === 0) return pos.y + NODE_H;
  return Math.max(pos.y + NODE_H, ...pos.children.map(getSubtreeHeight));
}

// ─── SVG Node box ─────────────────────────────────────────────────────────────
interface NodeBoxProps {
  pos: PosNode;
  selectedId: string | null;
  onSelect: (node: TrieNodeData) => void;
}

const NodeBox: React.FC<NodeBoxProps> = ({ pos, selectedId, onSelect }) => {
  const { node, cx, y } = pos;
  const isSelected = selectedId === node.id;

  let borderColor = isSelected ? colors.purple : colors.borderStrong;
  let bgColor = "rgba(15, 23, 42, 0.97)";
  let textColor = colors.text;
  let shadow = "";

  if (node.isDeleted) {
    borderColor = colors.red;
    bgColor = "rgba(239,68,68,0.2)";
    textColor = "#fca5a5";
    shadow = `drop-shadow(0 0 10px ${colors.red}66)`;
  } else if (node.isNew) {
    borderColor = colors.green;
    bgColor = "rgba(34,197,94,0.2)";
    textColor = "#86efac";
    shadow = `drop-shadow(0 0 10px ${colors.green}66)`;
  } else if (node.isFound || node.isHighlighted) {
    borderColor = colors.blue;
    bgColor = "rgba(59,130,246,0.2)";
    textColor = "#93c5fd";
    shadow = `drop-shadow(0 0 10px ${colors.blue}55)`;
  }

  if (isSelected) {
    borderColor = colors.purple;
    bgColor = "rgba(168,85,247,0.15)";
    textColor = "#c4b5fd";
    shadow = `drop-shadow(0 0 14px ${colors.purple}99)`;
  }

  const x = cx - NODE_W / 2;

  const badges: Array<{ text: string; color: string; bg: string; border: string }> = [];
  if (node.isEndOfWord) badges.push({ text: "END", color: colors.yellow, bg: colors.yellowBg, border: colors.yellowBorder });
  if (node.isNew) badges.push({ text: "NEW", color: colors.green, bg: colors.greenBg, border: colors.greenBorder });
  if (node.isDeleted) badges.push({ text: "DEL", color: colors.red, bg: colors.redBg, border: colors.redBorder });
  if (node.isFound) badges.push({ text: "FOUND", color: colors.blueLight, bg: colors.blueBg, border: colors.blueBorder });

  const badgeY = y + NODE_H - 17;
  const badgeW = 32;
  const totalBadgeW = badges.length > 0 ? badges.length * (badgeW + 4) - 4 : 0;
  let badgeX = cx - totalBadgeW / 2;

  return (
    <g
      data-node-box="true"
      onClick={() => onSelect(node)}
      style={{ cursor: "pointer", filter: shadow }}
    >
      <rect
        x={x}
        y={y}
        width={NODE_W}
        height={NODE_H}
        rx={10}
        ry={10}
        fill={bgColor}
        stroke={borderColor}
        strokeWidth={isSelected ? 2.5 : 1.5}
      />

      <rect x={x} y={y} width={NODE_W} height={3} rx={10} fill={borderColor} />

      <text
        x={cx}
        y={y + 24}
        textAnchor="middle"
        fill={textColor}
        fontSize={13}
        fontWeight={700}
        fontFamily="'JetBrains Mono', monospace"
      >
        "{node.label}"
      </text>

      {isSelected && node.isEndOfWord && node.meaning && (
        <text
          x={cx}
          y={y + 40}
          textAnchor="middle"
          fill={colors.yellow}
          fontSize={9}
          fontStyle="italic"
        >
          {node.meaning.length > 17 ? node.meaning.slice(0, 15) + "…" : node.meaning}
        </text>
      )}

      {badges.map((b, i) => {
        const currentX = badgeX;
        badgeX += badgeW + 4;

        return (
          <React.Fragment key={i}>
            <rect
              x={currentX}
              y={badgeY}
              width={badgeW}
              height={13}
              rx={6}
              fill={b.bg}
              stroke={b.border}
              strokeWidth={0.5}
            />
            <text
              x={currentX + badgeW / 2}
              y={badgeY + 9.5}
              textAnchor="middle"
              fill={b.color}
              fontSize={8}
              fontWeight={700}
              fontFamily="sans-serif"
            >
              {b.text}
            </text>
          </React.Fragment>
        );
      })}

      {pos.children.length > 0 && !badges.length && (
        <>
          <circle
            cx={x + NODE_W - 8}
            cy={y + 8}
            r={7}
            fill="rgba(30,41,59,0.9)"
            stroke={colors.borderStrong}
            strokeWidth={1}
          />
          <text
            x={x + NODE_W - 8}
            y={y + 12}
            textAnchor="middle"
            fill={colors.textSubtle}
            fontSize={9}
            fontWeight={700}
          >
            {pos.children.length}
          </text>
        </>
      )}

      {isSelected && (
        <circle
          cx={x + NODE_W - 5}
          cy={y + NODE_H - 5}
          r={5}
          fill={colors.purple}
          stroke="#0a0e1a"
          strokeWidth={1.5}
        />
      )}
    </g>
  );
};

// ─── Recursive renderer ───────────────────────────────────────────────────────
interface RenderTreeProps {
  pos: PosNode;
  selectedId: string | null;
  onSelect: (node: TrieNodeData) => void;
  parentCx?: number;
  parentBottomY?: number;
}

const RenderTree: React.FC<RenderTreeProps> = ({
  pos,
  selectedId,
  onSelect,
  parentCx = -999,
  parentBottomY = 0,
}) => {
  const hasParent = parentCx !== -999;
  const topY = pos.y;
  const myCx = pos.cx;

  const edgeColor = pos.node.isNew
    ? colors.green
    : pos.node.isDeleted
      ? colors.red
      : pos.node.isHighlighted || pos.node.isFound
        ? colors.blue
        : colors.borderStrong;

  const edgeWidth =
    pos.node.isNew || pos.node.isDeleted || pos.node.isHighlighted || pos.node.isFound
      ? 2.5
      : 1.5;

  const midY = parentBottomY + (topY - parentBottomY) * 0.5;
  const edgeD = hasParent
    ? `M ${parentCx} ${parentBottomY} C ${parentCx} ${midY}, ${myCx} ${midY}, ${myCx} ${topY}`
    : null;

  return (
    <g>
      {edgeD && (
        <path
          d={edgeD}
          stroke={edgeColor}
          strokeWidth={edgeWidth}
          fill="none"
          strokeDasharray={pos.node.isDeleted ? "5 3" : ""}
          style={{ filter: `drop-shadow(0 0 3px ${edgeColor}44)` }}
        />
      )}

      <NodeBox pos={pos} selectedId={selectedId} onSelect={onSelect} />

      {pos.children.map(child => (
        <RenderTree
          key={child.node.id}
          pos={child}
          selectedId={selectedId}
          onSelect={onSelect}
          parentCx={pos.cx}
          parentBottomY={pos.y + NODE_H}
        />
      ))}
    </g>
  );
};

// ─── Main SvgTreeView ─────────────────────────────────────────────────────────
interface SvgTreeViewProps {
  tree: TrieNodeData;
  selectedNode?: TrieNodeData | null;
  onNodeSelect?: (node: TrieNodeData | null) => void;
}

const SvgTreeView: React.FC<SvgTreeViewProps> = ({
  tree,
  selectedNode,
  onNodeSelect,
}) => {
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const lastMouse = useRef({ x: 0, y: 0 });

  const mainPos = useMemo(() => buildLayout(tree, 0), [tree]);

  const treeW = useMemo(() => getSubtreeWidth(mainPos), [mainPos]);
  const treeH = useMemo(() => getSubtreeHeight(mainPos), [mainPos]);

  const svgW = Math.max(treeW + PADDING_X * 2, 500);
  const svgH = Math.max(treeH + PADDING_Y * 2, 320);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();

    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;

    setScale(prevScale => {
      const nextScale = Math.min(3, Math.max(0.15, prevScale * zoomFactor));

      setPan(prevPan => {
        const worldX = (mouseX - prevPan.x) / prevScale;
        const worldY = (mouseY - prevPan.y) / prevScale;

        return {
          x: mouseX - worldX * nextScale,
          y: mouseY - worldY * nextScale,
        };
      });

      return nextScale;
    });
  };

  const onMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;

    const target = e.target as HTMLElement;
    const clickedNode = target.closest("[data-node-box='true']");
    if (clickedNode) return;

    setIsPanning(true);
    lastMouse.current = { x: e.clientX, y: e.clientY };
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isPanning) return;

    const dx = e.clientX - lastMouse.current.x;
    const dy = e.clientY - lastMouse.current.y;

    setPan(prev => ({
      x: prev.x + dx,
      y: prev.y + dy,
    }));

    lastMouse.current = { x: e.clientX, y: e.clientY };
  };

  const onMouseUp = () => {
    setIsPanning(false);
  };

  const resetView = () => {
    setScale(1);
    setPan({ x: 0, y: 0 });
    setIsPanning(false);
  };

  const selectedId = selectedNode?.id ?? null;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "7px 16px",
          borderBottom: `1px solid ${colors.border}`,
          background: "rgba(8,12,24,0.7)",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ color: colors.text, fontSize: "13px", fontWeight: 700 }}>
            🌳 Cây Radix-Trie
          </span>
          <span
            style={{
              background: colors.blueBg,
              color: colors.blueLight,
              border: `1px solid ${colors.blueBorder}`,
              borderRadius: "12px",
              padding: "2px 8px",
              fontSize: "10px",
              fontWeight: 600,
            }}
          >
            {Math.round(scale * 100)}%
          </span>
        </div>

        <div style={{ display: "flex", gap: "4px" }}>
          <button
            onClick={() => setScale(s => Math.min(3, s * 1.2))}
            style={{
              padding: "4px 10px",
              background: "rgba(30,41,59,0.9)",
              border: `1px solid ${colors.borderStrong}`,
              borderRadius: "6px",
              color: colors.textMuted,
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            ＋
          </button>
          <button
            onClick={() => setScale(s => Math.max(0.15, s * 0.8))}
            style={{
              padding: "4px 10px",
              background: "rgba(30,41,59,0.9)",
              border: `1px solid ${colors.borderStrong}`,
              borderRadius: "6px",
              color: colors.textMuted,
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            −
          </button>
          <button
            onClick={resetView}
            style={{
              padding: "4px 10px",
              background: "rgba(30,41,59,0.9)",
              border: `1px solid ${colors.borderStrong}`,
              borderRadius: "6px",
              color: colors.textMuted,
              cursor: "pointer",
              fontSize: "10px",
              fontWeight: 600,
            }}
          >
            Reset
          </button>
        </div>
      </div>

      <div
        ref={containerRef}
        style={{
          flex: 1,
          overflow: "hidden",
          position: "relative",
          cursor: isPanning ? "grabbing" : "grab",
          background: "rgba(6, 10, 20, 0.98)",
        }}
        onWheel={handleWheel}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onDoubleClick={resetView}
      >
        <div
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
            transformOrigin: "0 0",
            position: "absolute",
            top: 0,
            left: 0,
          }}
        >
          <svg width={svgW} height={svgH} viewBox={`0 0 ${svgW} ${svgH}`}>
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path
                  d="M 40 0 L 0 0 0 40"
                  fill="none"
                  stroke="rgba(71,85,105,0.08)"
                  strokeWidth="0.5"
                />
              </pattern>
            </defs>

            <rect width={svgW} height={svgH} fill="url(#grid)" />

            <g transform={`translate(${PADDING_X}, ${PADDING_Y})`}>
              <RenderTree
                pos={mainPos}
                selectedId={selectedId}
                onSelect={(n) => onNodeSelect?.(n)}
              />
            </g>
          </svg>
        </div>

        <div
          style={{
            position: "absolute",
            bottom: "8px",
            right: "8px",
            background: "rgba(8,12,24,0.85)",
            border: `1px solid ${colors.border}`,
            borderRadius: "6px",
            padding: "4px 8px",
            color: colors.textSubtle,
            fontSize: "9px",
            pointerEvents: "none",
          }}
        >
          🖱 Kéo nền để di chuyển • Cuộn zoom tại con trỏ • Double-click reset
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "18px",
          padding: "6px 16px",
          borderTop: `1px solid ${colors.border}`,
          background: "rgba(8,12,24,0.7)",
          flexShrink: 0,
          flexWrap: "wrap",
        }}
      >
        {[
          { color: colors.blue, label: "Đường đi", dash: false },
          { color: colors.green, label: "Node mới", dash: false },
          { color: colors.red, label: "Node xóa", dash: true },
          { color: colors.yellow, label: "END", dash: false },
          { color: colors.purple, label: "Đang chọn", dash: false },
          { color: colors.blueLight, label: "FOUND", dash: false },
        ].map(({ color, label, dash }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <svg width="22" height="8" viewBox="0 0 22 8">
              <line
                x1="0"
                y1="4"
                x2="22"
                y2="4"
                stroke={color}
                strokeWidth={2}
                strokeDasharray={dash ? "4 2" : ""}
              />
            </svg>
            <span style={{ color: colors.textSubtle, fontSize: "10px" }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SvgTreeView;