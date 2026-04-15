import React, { useState } from "react";
import Header from "./components/Header";
import DictionaryTab from "./components/DictionaryTab";
import RadixTrieTab from "./components/RadixTrieTab";
import { colors } from "./styles";

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"dictionary" | "tree">("dictionary");
  const [wordCount, setWordCount] = useState(103);

  return (
    <div style={{
      height: "100vh",
      display: "flex",
      flexDirection: "column",
      background: colors.bg,
      overflow: "hidden",
      fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
    }}>
      <Header
        wordCount={wordCount}
        onTabChange={setActiveTab}
        activeTab={activeTab}
      />

      <div style={{ flex: 1, overflow: "hidden", minHeight: 0 }}>
        {activeTab === "dictionary" ? (
          <DictionaryTab
            onWordCountChange={setWordCount}
            onNavigateToTree={() => setActiveTab("tree")}
          />
        ) : (
          <RadixTrieTab onWordCountChange={setWordCount} />
        )}
      </div>

      <div style={{
        background: "rgba(8, 12, 24, 0.98)",
        borderTop: `1px solid ${colors.border}`,
        padding: "5px 20px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexShrink: 0,
      }}>
        <span style={{ color: colors.textSubtle, fontSize: "10px", opacity: 0.4 }}>
          Radix Trie Dictionary — CS523 Data Structures & Algorithms Project
        </span>
        <span style={{ color: colors.textSubtle, fontSize: "10px", opacity: 0.4 }}>
          {wordCount} words
        </span>
      </div>
    </div>
  );
};

export default App;
