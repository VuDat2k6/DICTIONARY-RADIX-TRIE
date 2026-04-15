import React, { useState, useMemo } from "react";
import { RadixTrie } from "../data/RadixTrie";
import { vocabularyData } from "../data/vocabulary";
import { colors, Card, SectionHeader } from "../styles";
import OperationHistoryPanel, { type HistoryItem } from "./OperationHistoryPanel";

const initialWords = vocabularyData;

interface DictionaryTabProps {
  onWordCountChange: (count: number) => void;
  onNavigateToTree: () => void;
}

const DictionaryTab: React.FC<DictionaryTabProps> = ({ onWordCountChange, onNavigateToTree }) => {
  const [trie] = useState<RadixTrie>(() => {
    const t = new RadixTrie();
    initialWords.forEach(({ word, meaning }) => t.insert(word, meaning));
    return t;
  });

  const [addWord, setAddWord] = useState("");
  const [addMeaning, setAddMeaning] = useState("");
  const [deleteWord, setDeleteWord] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [searchResult, setSearchResult] = useState<{ word: string; meaning: string } | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);

  const allWords = useMemo(() => trie.getAllWords(), [trie]);

  const showNotification = (text: string, type: "success" | "error" | "info") => {
    setNotification({ text, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const addHistory = (text: string, type: "success" | "error" | "info", word?: string, meaning?: string) => {
    setHistory(prev => [{
      id: Math.random().toString(36).slice(2, 8),
      text,
      type,
      word,
      meaning,
    }, ...prev].slice(0, 20));
  };

  const handleAdd = () => {
    if (!addWord.trim() || !addMeaning.trim()) { showNotification("Vui lòng nhập đầy đủ từ và nghĩa!", "error"); return; }
    const result = trie.insert(addWord.trim(), addMeaning.trim());
    showNotification(result.message, result.changed ? "success" : "info");
    addHistory(result.message, result.changed ? "success" : "info", addWord.trim(), addMeaning.trim());
    setSearchResult(null);
    onWordCountChange(trie.getAllWords().length);
    setAddWord(""); setAddMeaning("");
  };

  const handleDelete = () => {
    if (!deleteWord.trim()) { showNotification("Vui lòng nhập từ cần xóa!", "error"); return; }
    const result = trie.delete(deleteWord.trim());
    showNotification(result.message, result.changed ? "success" : "error");
    addHistory(result.message, result.changed ? "success" : "error", deleteWord.trim());
    setSearchResult(null);
    onWordCountChange(trie.getAllWords().length);
    setDeleteWord("");
  };

  const handleSearchInput = (val: string) => {
    setSearchInput(val);
    if (val.trim() === "") {
      setSearchResult(null);
      setSelectedWord(null);
      return;
    }
    const result = trie.search(val.trim());
    setSearchResult(result.found ? { word: val.trim(), meaning: result.meaning } : null);
    if (result.found) {
      addHistory(result.message, "success", val.trim(), result.meaning);
    } else {
      addHistory(result.message, "error", val.trim());
    }
    setSelectedWord(val.trim());
  };

  const handleWordClick = (word: string) => {
    setSearchInput(word);
    const result = trie.search(word);
    setSearchResult(result.found ? { word, meaning: result.meaning } : null);
    setSelectedWord(word);
  };

  // Build word+meaning list
  const wordEntries = useMemo(() => {
    return allWords.map(word => {
      const result = trie.search(word);
      return { word, meaning: result.meaning || "—" };
    });
  }, [allWords, trie]);

  // Filter based on search
  const filteredEntries = searchInput
    ? wordEntries.filter(e => e.word.includes(searchInput.toLowerCase()) || e.meaning.includes(searchInput.toLowerCase()))
    : wordEntries;

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "280px 1fr 240px",
      height: "100%",
      overflow: "hidden",
      background: colors.bg,
    }}>
      {/* ── Left: Operations ── */}
      <div style={{
        borderRight: `1px solid ${colors.border}`,
        padding: "14px",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        overflowY: "auto",
      }}>
        {/* Search */}
        <Card glow={colors.yellow + "22"}>
          <SectionHeader icon="🔍" title="Tìm kiếm" color={colors.yellowLight} />
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <input
              type="text"
              placeholder="Tìm từ..."
              value={searchInput}
              onChange={(e) => handleSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && searchInput && handleWordClick(searchInput)}
              style={{
                width: "100%",
                padding: "9px 12px",
                background: "rgba(30, 41, 59, 0.9)",
                border: `1px solid ${colors.borderStrong}`,
                borderRadius: "8px",
                color: colors.text,
                fontSize: "13px",
                outline: "none",
                boxSizing: "border-box",
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = colors.yellow + "aa"; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = colors.borderStrong; }}
            />
            {searchResult && (
              <div style={{
                background: colors.greenBg,
                border: `1px solid ${colors.greenBorder}`,
                borderRadius: "8px",
                padding: "8px 10px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}>
                <span style={{ fontSize: "14px" }}>📖</span>
                <div>
                  <div style={{ color: colors.green, fontSize: "12px", fontWeight: 700, fontFamily: "monospace" }}>
                    "{searchResult.word}"
                  </div>
                  <div style={{ color: colors.greenLight, fontSize: "13px" }}>
                    {searchResult.meaning}
                  </div>
                </div>
              </div>
            )}
            {!searchResult && searchInput && (
              <div style={{
                background: colors.redBg,
                border: `1px solid ${colors.redBorder}`,
                borderRadius: "8px",
                padding: "8px 10px",
                fontSize: "12px",
                color: colors.red,
              }}>
                Không tìm thấy từ "{searchInput}"
              </div>
            )}
          </div>
        </Card>

        {/* Add */}
        <Card glow={colors.green + "22"}>
          <SectionHeader icon="➕" title="Thêm từ mới" color={colors.greenLight} />
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <input
              type="text"
              placeholder="Từ (VD: banana)"
              value={addWord}
              onChange={(e) => setAddWord(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              style={{
                width: "100%",
                padding: "9px 12px",
                background: "rgba(30, 41, 59, 0.9)",
                border: `1px solid ${colors.borderStrong}`,
                borderRadius: "8px",
                color: colors.text,
                fontSize: "13px",
                outline: "none",
                boxSizing: "border-box",
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = colors.green + "aa"; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = colors.borderStrong; }}
            />
            <input
              type="text"
              placeholder="Nghĩa (VD: quả chuối)"
              value={addMeaning}
              onChange={(e) => setAddMeaning(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              style={{
                width: "100%",
                padding: "9px 12px",
                background: "rgba(30, 41, 59, 0.9)",
                border: `1px solid ${colors.borderStrong}`,
                borderRadius: "8px",
                color: colors.text,
                fontSize: "13px",
                outline: "none",
                boxSizing: "border-box",
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = colors.green + "aa"; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = colors.borderStrong; }}
            />
            <button
              onClick={handleAdd}
              style={{
                width: "100%",
                padding: "9px",
                background: `linear-gradient(135deg, ${colors.green}, ${colors.greenDark})`,
                border: "none",
                borderRadius: "8px",
                color: "#fff",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
              }}
            >
              ➕ Thêm vào từ điển
            </button>
          </div>
        </Card>

        {/* Delete */}
        <Card glow={colors.red + "22"}>
          <SectionHeader icon="🗑️" title="Xóa từ" color={colors.redLight} />
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <input
              type="text"
              placeholder="Từ cần xóa (VD: cat)"
              value={deleteWord}
              onChange={(e) => setDeleteWord(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleDelete()}
              style={{
                width: "100%",
                padding: "9px 12px",
                background: "rgba(30, 41, 59, 0.9)",
                border: `1px solid ${colors.borderStrong}`,
                borderRadius: "8px",
                color: colors.text,
                fontSize: "13px",
                outline: "none",
                boxSizing: "border-box",
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = colors.red + "aa"; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = colors.borderStrong; }}
            />
            <button
              onClick={handleDelete}
              style={{
                width: "100%",
                padding: "9px",
                background: `linear-gradient(135deg, ${colors.red}, ${colors.redDark})`,
                border: "none",
                borderRadius: "8px",
                color: "#fff",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
              }}
            >
              🗑️ Xóa khỏi từ điển
            </button>
          </div>
        </Card>

        {/* Navigate to tree */}
        <button
          onClick={onNavigateToTree}
          style={{
            width: "100%",
            padding: "10px",
            background: `linear-gradient(135deg, ${colors.purple}, ${colors.blue})`,
            border: "none",
            borderRadius: "8px",
            color: "#fff",
            fontSize: "13px",
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
          }}
        >
          🌳 Xem cây Radix-Trie
        </button>

        {/* Notification toast */}
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

      {/* ── Center: Dictionary View ── */}
      <div style={{ overflow: "hidden", display: "flex", flexDirection: "column" }}>
        {/* Dictionary header */}
        <div style={{
          padding: "12px 20px",
          borderBottom: `1px solid ${colors.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "rgba(8, 12, 24, 0.5)",
          flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "18px" }}>📖</span>
            <div>
              <div style={{ color: colors.text, fontSize: "14px", fontWeight: 700 }}>
                TỪ ĐIỂN ANH — VIỆT
              </div>
              <div style={{ color: colors.textSubtle, fontSize: "10px" }}>
                English Dictionary • Radix Trie Structure
              </div>
            </div>
          </div>
          <div style={{
            background: colors.blueBg,
            border: `1px solid ${colors.blueBorder}`,
            borderRadius: "20px",
            padding: "4px 12px",
            color: colors.blueLight,
            fontSize: "12px",
            fontWeight: 700,
          }}>
            {allWords.length} từ
          </div>
        </div>

        {/* Dictionary entries */}
        <div style={{ flex: 1, overflow: "auto", padding: "16px 20px" }}>
          {filteredEntries.length === 0 && (
            <div style={{
              textAlign: "center",
              color: colors.textSubtle,
              padding: "40px",
              fontStyle: "italic",
              fontSize: "13px",
            }}>
              Không có từ nào được tìm thấy
            </div>
          )}
          {filteredEntries.map(({ word, meaning }, idx) => (
            <div
              key={word}
              onClick={() => handleWordClick(word)}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "12px",
                padding: "12px 16px",
                borderBottom: `1px solid ${colors.border}`,
                cursor: "pointer",
                transition: "background 0.15s",
                background: selectedWord === word ? colors.blueBg : "transparent",
                borderRadius: selectedWord === word ? "8px" : "0",
                marginBottom: "2px",
              }}
              onMouseOver={(e) => { if (selectedWord !== word) e.currentTarget.style.background = "rgba(30, 41, 59, 0.5)"; }}
              onMouseOut={(e) => { if (selectedWord !== word) e.currentTarget.style.background = "transparent"; }}
            >
              {/* Number */}
              <div style={{
                color: colors.textSubtle,
                fontSize: "11px",
                fontWeight: 700,
                minWidth: "28px",
                paddingTop: "2px",
              }}>
                {idx + 1}.
              </div>

              {/* Word */}
              <div style={{ flex: 1 }}>
                <div style={{
                  color: colors.blueLight,
                  fontSize: "16px",
                  fontWeight: 800,
                  fontFamily: "'Georgia', serif",
                  marginBottom: "3px",
                }}>
                  {word}
                </div>
                <div style={{
                  color: colors.text,
                  fontSize: "13px",
                  lineHeight: 1.4,
                }}>
                  {meaning}
                </div>
              </div>

              {/* Arrow indicator */}
              <div style={{
                color: colors.textSubtle,
                fontSize: "14px",
                opacity: selectedWord === word ? 1 : 0,
                transition: "opacity 0.15s",
                paddingTop: "2px",
              }}>
                ▶
              </div>
            </div>
          ))}
        </div>

        {/* Dictionary footer */}
        <div style={{
          padding: "8px 20px",
          borderTop: `1px solid ${colors.border}`,
          background: "rgba(8, 12, 24, 0.5)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexShrink: 0,
        }}>
          <span style={{ color: colors.textSubtle, fontSize: "10px" }}>
            Hiển thị {filteredEntries.length} / {allWords.length} từ
          </span>
          <span style={{ color: colors.textSubtle, fontSize: "10px" }}>
            {allWords.length > 0 ? `A → ${[...allWords].sort()[allWords.length - 1]}` : ""}
          </span>
        </div>
      </div>

      {/* ── Right: History + Detail ── */}
      <div style={{
        borderLeft: `1px solid ${colors.border}`,
        padding: "14px",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        overflowY: "auto",
      }}>
        {/* Stats */}
        <Card>
          <SectionHeader icon="📊" title="Thống kê" color={colors.text} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
            {[
              { label: "Tổng số từ", value: allWords.length, color: colors.blue },
              { label: "Từ đang chọn", value: selectedWord || "—", color: colors.green },
              { label: "Kết quả tìm", value: searchResult ? "✅" : "❌", color: colors.yellow },
              { label: "Thao tác", value: history.length, color: colors.purple },
            ].map(({ label, value, color }) => (
              <div key={label} style={{
                background: color + "15",
                border: `1px solid ${color}33`,
                borderRadius: "8px",
                padding: "8px",
                textAlign: "center",
              }}>
                <div style={{ color: color, fontSize: "18px", fontWeight: 800 }}>{value}</div>
                <div style={{ color: colors.textSubtle, fontSize: "9px", marginTop: "2px" }}>{label}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Selected word detail */}
        {selectedWord && (
          <Card glow={colors.blue + "22"}>
            <SectionHeader icon="📖" title={`Chi tiết: "${selectedWord}"`} color={colors.blueLight} />
            <div>
              {[
                { label: "Từ", value: selectedWord },
                { label: "Nghĩa", value: searchResult?.meaning || "—" },
              ].map(({ label, value }) => (
                <div key={label} style={{ marginBottom: "8px" }}>
                  <div style={{ color: colors.textSubtle, fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "2px" }}>
                    {label}
                  </div>
                  <div style={{
                    color: label === "Từ" ? colors.blueLight : colors.text,
                    fontSize: "13px",
                    fontWeight: label === "Từ" ? 700 : 400,
                    fontFamily: label === "Từ" ? "'Georgia', serif" : "inherit",
                  }}>
                    {value}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        <OperationHistoryPanel history={history} />
      </div>
    </div>
  );
};

export default DictionaryTab;
