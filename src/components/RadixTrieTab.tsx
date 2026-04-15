import React, { useState } from "react";
import { RadixTrie, type TrieNodeData } from "../data/RadixTrie";
import { vocabularyData } from "../data/vocabulary";
import { colors, Card, SectionHeader } from "../styles";
import SvgTreeView from "./SvgTreeView";
import OperationHistoryPanel, { type HistoryItem } from "./OperationHistoryPanel";
import NodeDetailPanel from "./NodeDetailPanel";

type RadixTrieNode = import("../data/RadixTrie").RadixTrieNode;

const initialWords = vocabularyData;

interface RadixTrieTabProps {
  onWordCountChange: (count: number) => void;
}

const RadixTrieTab: React.FC<RadixTrieTabProps> = ({ onWordCountChange }) => {
  const [trie] = useState<RadixTrie>(() => {
    const t = new RadixTrie();
    initialWords.forEach(({ word, meaning }) => t.insert(word, meaning));
    return t;
  });

  const [afterTree, setAfterTree] = useState<TrieNodeData>(() => trie.getSerializedTree());
  const [, setHighlightedPath] = useState<RadixTrieNode[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [selectedNode, setSelectedNode] = useState<TrieNodeData | null>(null);
  const [selectedPath, setSelectedPath] = useState("");
  const [notification, setNotification] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);

  // Quick demo controls
  const [demoInput, setDemoInput] = useState("");
  const [demoMeaning, setDemoMeaning] = useState("");
  const [demoOp, setDemoOp] = useState<"insert" | "delete" | "search">("insert");

  const addHistory = (text: string, type: "success" | "error" | "info", word?: string, meaning?: string) => {
    setHistory(prev => [{
      id: Math.random().toString(36).slice(2, 8),
      text,
      type,
      word,
      meaning,
    }, ...prev].slice(0, 20));
  };

  const showNotification = (text: string, type: "success" | "error" | "info") => {
    setNotification({ text, type });
    setTimeout(() => setNotification(null), 3500);
  };

  const runDemo = () => {
    if (demoOp === "insert") {
      if (!demoInput.trim() || !demoMeaning.trim()) {
        showNotification("Nhập đầy đủ từ và nghĩa!", "error");
        return;
      }
      const result = trie.insert(demoInput.trim(), demoMeaning.trim());
      showNotification(result.message, result.changed ? "success" : "info");
      addHistory(result.message, result.changed ? "success" : "info", demoInput.trim(), demoMeaning.trim());
      setHighlightedPath(result.highlightedPath);
      setAfterTree(trie.getSerializedTree(result.highlightedPath, result.newNodes, []));
      setSelectedNode(null);
      onWordCountChange(trie.getAllWords().length);
      setDemoInput(""); setDemoMeaning("");
    } else if (demoOp === "delete") {
      if (!demoInput.trim()) {
        showNotification("Nhập từ cần xóa!", "error");
        return;
      }
      const result = trie.delete(demoInput.trim());
      showNotification(result.message, result.changed ? "success" : "error");
      addHistory(result.message, result.changed ? "success" : "error", demoInput.trim());
      setHighlightedPath(result.highlightedPath);
      setAfterTree(trie.getSerializedTree(result.highlightedPath, [], result.deletedNodes));
      setSelectedNode(null);
      onWordCountChange(trie.getAllWords().length);
      setDemoInput("");
    } else {
      if (!demoInput.trim()) {
        showNotification("Nhập từ cần tìm!", "error");
        return;
      }
      const result = trie.search(demoInput.trim());
      showNotification(result.message, result.found ? "success" : "error");
      addHistory(result.message, result.found ? "success" : "error", demoInput.trim(), result.meaning);
      setHighlightedPath(result.highlightedPath);
      setAfterTree(trie.getSerializedTree(result.highlightedPath, [], [], result.highlightedPath));
      if (result.found) {
        // Find the node
        const findNode = (node: TrieNodeData, path: string): TrieNodeData | null => {
          if (node.isEndOfWord && path === demoInput.trim().toLowerCase()) return node;
          for (const child of node.children) {
            const found = findNode(child, path + child.label);
            if (found) return found;
          }
          return null;
        };
        const found = findNode(trie.getSerializedTree(), "");
        if (found) {
          setSelectedNode(found);
          setSelectedPath(demoInput.trim().toLowerCase());
        }
      }
    }
  };

  const handleNodeSelect = (node: TrieNodeData | null) => {
    setSelectedNode(node);
    if (node) {
      // Compute path by walking the tree
      const computePath = (n: TrieNodeData, root: TrieNodeData, acc: string): string => {
        if (n.id === root.id) return acc;
        for (const child of root.children) {
          const path = computePath(n, child, acc + child.label);
          if (path !== "") return path;
        }
        return "";
      };
      const path = computePath(node, afterTree, "");
      setSelectedPath(path);
    } else {
      setSelectedPath("");
    }
  };

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "1fr 280px",
      height: "100%",
      overflow: "hidden",
      background: colors.bg,
    }}>
      {/* ── Left: Tree View ── */}
      <div style={{ overflow: "hidden", display: "flex", flexDirection: "column" }}>
        <SvgTreeView
          tree={afterTree}
          selectedNode={selectedNode}
          onNodeSelect={handleNodeSelect}
        />
      </div>

      {/* ── Right: Controls + History + Detail ── */}
      <div style={{
        borderLeft: `1px solid ${colors.border}`,
        padding: "14px",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        overflowY: "auto",
      }}>
        {/* Quick demo controls */}
        <Card>
          <SectionHeader icon="⚡" title="Thao tác nhanh" color={colors.purpleLight} />
          {/* Op selector */}
          <div style={{ display: "flex", gap: "4px", marginBottom: "10px" }}>
            {[
              { id: "insert" as const, label: "Thêm", color: colors.green },
              { id: "delete" as const, label: "Xóa", color: colors.red },
              { id: "search" as const, label: "Tìm", color: colors.blue },
            ].map(({ id, label, color }) => (
              <button
                key={id}
                onClick={() => setDemoOp(id)}
                style={{
                  flex: 1,
                  padding: "6px",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "11px",
                  fontWeight: 600,
                  background: demoOp === id ? color : "rgba(30,41,59,0.9)",
                  color: demoOp === id ? "#fff" : colors.textSubtle,
                  transition: "all 0.15s",
                }}
              >
                {label}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <input
              type="text"
              placeholder={demoOp === "search" ? "Từ cần tìm..." : "Từ (VD: banana)..."}
              value={demoInput}
              onChange={(e) => setDemoInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && runDemo()}
              style={{
                width: "100%",
                padding: "8px 10px",
                background: "rgba(30,41,59,0.9)",
                border: `1px solid ${colors.borderStrong}`,
                borderRadius: "6px",
                color: colors.text,
                fontSize: "12px",
                outline: "none",
                boxSizing: "border-box",
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = colors.purple + "aa"; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = colors.borderStrong; }}
            />
            {demoOp === "insert" && (
              <input
                type="text"
                placeholder="Nghĩa (VD: quả chuối)..."
                value={demoMeaning}
                onChange={(e) => setDemoMeaning(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && runDemo()}
                style={{
                  width: "100%",
                  padding: "8px 10px",
                  background: "rgba(30,41,59,0.9)",
                  border: `1px solid ${colors.borderStrong}`,
                  borderRadius: "6px",
                  color: colors.text,
                  fontSize: "12px",
                  outline: "none",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = colors.purple + "aa"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = colors.borderStrong; }}
              />
            )}
            <button
              onClick={runDemo}
              style={{
                width: "100%",
                padding: "9px",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: 600,
                background: `linear-gradient(135deg, ${colors.purple}, ${colors.blue})`,
                color: "#fff",
              }}
            >
              ⚡ Thực hiện
            </button>
          </div>
        </Card>

        {/* Node detail */}
        <NodeDetailPanel node={selectedNode} path={selectedPath} />

        {/* History */}
        <OperationHistoryPanel history={history} />

        {/* Notification */}
        {notification && (
          <div style={{
            background: notification.type === "success" ? colors.greenBg
              : notification.type === "error" ? colors.redBg
              : colors.blueBg,
            border: `1px solid ${notification.type === "success" ? colors.greenBorder : notification.type === "error" ? colors.redBorder : colors.blueBorder}`,
            borderRadius: "8px",
            padding: "8px 12px",
            fontSize: "12px",
            color: notification.type === "success" ? colors.greenLight
              : notification.type === "error" ? colors.redLight
              : colors.blueLight,
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}>
            <span>{notification.type === "success" ? "✅" : notification.type === "error" ? "❌" : "ℹ️"}</span>
            {notification.text}
          </div>
        )}
      </div>
    </div>
  );
};

export default RadixTrieTab;
