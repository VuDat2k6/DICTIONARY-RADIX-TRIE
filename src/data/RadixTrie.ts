// ─── Serialized tree data types ──────────────────────────────────────────────
export interface TrieNodeData {
  id: string;
  label: string;
  isEndOfWord: boolean;
  meaning: string;
  children: TrieNodeData[];
  isHighlighted?: boolean;
  isNew?: boolean;
  isDeleted?: boolean;
  isFound?: boolean;
}

// ─── Radix Trie Node ─────────────────────────────────────────────────────────
export class RadixTrieNode {
  label: string;
  isEndOfWord: boolean;
  meaning: string;
  children: Map<string, RadixTrieNode>;
  private _id: string;

  constructor(label: string = "") {
    this.label = label;
    this.isEndOfWord = false;
    this.meaning = "";
    this.children = new Map();
    this._id = Math.random().toString(36).slice(2, 10);
  }

  serialize(
    highlightSet: Set<RadixTrieNode> = new Set(),
    newSet: Set<RadixTrieNode> = new Set(),
    deletedSet: Set<RadixTrieNode> = new Set(),
    foundSet: Set<RadixTrieNode> = new Set()
  ): TrieNodeData {
    const children: TrieNodeData[] = [];
    this.children.forEach((child) => {
      children.push(child.serialize(highlightSet, newSet, deletedSet, foundSet));
    });

    return {
      id: this._id,
      label: this.label,
      isEndOfWord: this.isEndOfWord,
      meaning: this.meaning,
      children,
      isHighlighted: highlightSet.has(this),
      isNew: newSet.has(this),
      isDeleted: deletedSet.has(this),
      isFound: foundSet.has(this),
    };
  }
}

// ─── Radix Trie ──────────────────────────────────────────────────────────────
export class RadixTrie {
  root: RadixTrieNode;
  private _allWords: string[] = [];

  constructor() {
    this.root = new RadixTrieNode();
    this._allWords = [];
  }

  private _rebuildAllWords(): void {
    this._allWords = [];
    this._collectWords(this.root, "");
  }

  private _collectWords(node: RadixTrieNode, prefix: string): void {
    if (node.isEndOfWord) {
      this._allWords.push(prefix);
    }

    for (const child of node.children.values()) {
      this._collectWords(child, prefix + child.label);
    }
  }

  // ── Insert ─────────────────────────────────────────────────────────────────
  insert(word: string, meaning: string): {
    changed: boolean;
    newNodes: RadixTrieNode[];
    highlightedPath: RadixTrieNode[];
    message: string;
  } {
    const w = word.toLowerCase();
    const newNodes: RadixTrieNode[] = [];
    const highlightedPath: RadixTrieNode[] = [];

    if (w === "") {
      this.root.isEndOfWord = true;
      this.root.meaning = meaning;
      highlightedPath.push(this.root);
      this._rebuildAllWords();

      return {
        changed: true,
        newNodes: [],
        highlightedPath,
        message: `Đã thêm từ gốc "${word}" với nghĩa: ${meaning}`,
      };
    }

    let current = this.root;
    let pos = 0;

    while (pos < w.length) {
      highlightedPath.push(current);
      const remaining = w.slice(pos);

      let foundChild: RadixTrieNode | null = null;
      let commonLen = 0;

      for (const child of current.children.values()) {
        if (!child.label || child.label[0] !== remaining[0]) continue;

        let cl = 0;
        while (
          cl < child.label.length &&
          cl < remaining.length &&
          child.label[cl] === remaining[cl]
        ) {
          cl++;
        }

        if (cl > 0) {
          foundChild = child;
          commonLen = cl;
          break;
        }
      }

      if (!foundChild) {
        const newNode = new RadixTrieNode(remaining);
        newNode.isEndOfWord = true;
        newNode.meaning = meaning;
        current.children.set(remaining[0], newNode);

        newNodes.push(newNode);
        highlightedPath.push(newNode);
        this._rebuildAllWords();

        return {
          changed: true,
          newNodes,
          highlightedPath,
          message: `Đã thêm từ mới "${word}" → ${meaning}`,
        };
      }

      if (commonLen === foundChild.label.length) {
        pos += foundChild.label.length;
        current = foundChild;
        continue;
      }

      const prefix = foundChild.label.slice(0, commonLen);
      const suffix1 = foundChild.label.slice(commonLen);
      const suffix2 = remaining.slice(commonLen);

      const middle = new RadixTrieNode(prefix);
      newNodes.push(middle);
      highlightedPath.push(middle);

      const existingChild = new RadixTrieNode(suffix1);
      existingChild.isEndOfWord = foundChild.isEndOfWord;
      existingChild.meaning = foundChild.meaning;
      existingChild.children = foundChild.children;
      middle.children.set(suffix1[0], existingChild);

      if (suffix2) {
        const newChild = new RadixTrieNode(suffix2);
        newChild.isEndOfWord = true;
        newChild.meaning = meaning;
        middle.children.set(suffix2[0], newChild);

        newNodes.push(newChild);
        highlightedPath.push(newChild);
      } else {
        middle.isEndOfWord = true;
        middle.meaning = meaning;
      }

      current.children.set(prefix[0], middle);
      this._rebuildAllWords();

      return {
        changed: true,
        newNodes,
        highlightedPath,
        message: `Đã thêm từ "${word}" → ${meaning}`,
      };
    }

    if (!current.isEndOfWord) {
      current.isEndOfWord = true;
      current.meaning = meaning;
      highlightedPath.push(current);

      this._rebuildAllWords();
      return {
        changed: true,
        newNodes: [],
        highlightedPath,
        message: `Đã thêm từ "${word}" → ${meaning}`,
      };
    }

    highlightedPath.push(current);
    current.meaning = meaning;
    this._rebuildAllWords();

    return {
      changed: false,
      newNodes: [],
      highlightedPath,
      message: `Từ "${word}" đã tồn tại — cập nhật nghĩa: ${meaning}`,
    };
  }

  // ── Delete ─────────────────────────────────────────────────────────────────
  delete(word: string): {
    changed: boolean;
    highlightedPath: RadixTrieNode[];
    deletedNodes: RadixTrieNode[];
    message: string;
  } {
    const w = word.toLowerCase();
    const highlightedPath: RadixTrieNode[] = [];
    const deletedNodes: RadixTrieNode[] = [];

    const result = this._deleteRecursive(this.root, w, 0, highlightedPath, deletedNodes);
    this._rebuildAllWords();
    return result;
  }

  private _deleteRecursive(
    node: RadixTrieNode,
    word: string,
    depth: number,
    hp: RadixTrieNode[],
    dn: RadixTrieNode[]
  ): {
    changed: boolean;
    highlightedPath: RadixTrieNode[];
    deletedNodes: RadixTrieNode[];
    message: string;
  } {
    hp.push(node);

    if (depth >= word.length) {
      if (!node.isEndOfWord) {
        return {
          changed: false,
          highlightedPath: hp,
          deletedNodes: dn,
          message: `Không tìm thấy từ "${word}"`,
        };
      }

      node.isEndOfWord = false;
      node.meaning = "";

      return {
        changed: true,
        highlightedPath: hp,
        deletedNodes: dn,
        message: `Đã xóa từ "${word}"`,
      };
    }

    const remaining = word.slice(depth);

    let child: RadixTrieNode | null = null;
    for (const c of node.children.values()) {
      if (c.label && c.label[0] === remaining[0]) {
        child = c;
        break;
      }
    }

    if (!child) {
      return {
        changed: false,
        highlightedPath: hp,
        deletedNodes: dn,
        message: `Không tìm thấy từ "${word}"`,
      };
    }

    // FIX: chiều so khớp đúng phải là remaining.startsWith(child.label)
    if (!remaining.startsWith(child.label)) {
      return {
        changed: false,
        highlightedPath: hp,
        deletedNodes: dn,
        message: `Không tìm thấy từ "${word}"`,
      };
    }

    // Case: child chính là đoạn cuối của từ cần xóa
    if (child.label === remaining) {
      if (!child.isEndOfWord) {
        return {
          changed: false,
          highlightedPath: hp,
          deletedNodes: dn,
          message: `Không tìm thấy từ "${word}"`,
        };
      }

      child.isEndOfWord = false;
      child.meaning = "";

      if (child.children.size === 0) {
        node.children.delete(child.label[0]);
        dn.push(child);
      } else if (child.children.size === 1) {
        const only = Array.from(child.children.values())[0];
        const merged = new RadixTrieNode(child.label + only.label);
        merged.isEndOfWord = only.isEndOfWord;
        merged.meaning = only.meaning;
        merged.children = only.children;

        node.children.set(child.label[0], merged);
        dn.push(child);
      }

      return {
        changed: true,
        highlightedPath: hp,
        deletedNodes: dn,
        message: `Đã xóa từ "${word}"`,
      };
    }

    const nextDepth = depth + child.label.length;
    const sub = this._deleteRecursive(child, word, nextDepth, hp, dn);

    if (!sub.changed) {
      return sub;
    }

    // Sau khi xóa ở dưới, nếu child trở thành node không kết thúc từ và không có con → xóa luôn
    if (!child.isEndOfWord && child.children.size === 0) {
      node.children.delete(child.label[0]);
      dn.push(child);
      return sub;
    }

    // Nếu child không phải end-of-word và chỉ còn 1 con → nén node
    if (!child.isEndOfWord && child.children.size === 1) {
      const only = Array.from(child.children.values())[0];
      const merged = new RadixTrieNode(child.label + only.label);
      merged.isEndOfWord = only.isEndOfWord;
      merged.meaning = only.meaning;
      merged.children = only.children;

      node.children.set(child.label[0], merged);
      dn.push(child);
    }

    return sub;
  }

  // ── Search ─────────────────────────────────────────────────────────────────
  search(word: string): {
    found: boolean;
    meaning: string;
    highlightedPath: RadixTrieNode[];
    message: string;
  } {
    const w = word.toLowerCase();
    const hp: RadixTrieNode[] = [];

    if (w === "") {
      if (this.root.isEndOfWord) {
        hp.push(this.root);
        return {
          found: true,
          meaning: this.root.meaning,
          highlightedPath: hp,
          message: `Tìm thấy: ${this.root.meaning}`,
        };
      }

      return {
        found: false,
        meaning: "",
        highlightedPath: hp,
        message: `Không tìm thấy từ "${word}"`,
      };
    }

    let current = this.root;
    let pos = 0;

    while (pos < w.length) {
      hp.push(current);
      const remaining = w.slice(pos);

      let child: RadixTrieNode | null = null;
      for (const c of current.children.values()) {
        if (c.label && c.label[0] === remaining[0]) {
          child = c;
          break;
        }
      }

      if (!child) {
        return {
          found: false,
          meaning: "",
          highlightedPath: hp,
          message: `Không tìm thấy từ "${word}"`,
        };
      }

      const matchLen = Math.min(child.label.length, remaining.length);

      for (let i = 0; i < matchLen; i++) {
        if (child.label[i] !== remaining[i]) {
          return {
            found: false,
            meaning: "",
            highlightedPath: hp,
            message: `Không tìm thấy từ "${word}"`,
          };
        }
      }

      pos += matchLen;
      current = child;
      hp.push(current);

      if (matchLen === child.label.length) {
        if (pos >= w.length) {
          if (current.isEndOfWord) {
            return {
              found: true,
              meaning: current.meaning,
              highlightedPath: hp,
              message: `Tìm thấy: ${current.meaning}`,
            };
          }

          return {
            found: false,
            meaning: "",
            highlightedPath: hp,
            message: `Không tìm thấy từ "${word}"`,
          };
        }
      } else {
        return {
          found: false,
          meaning: "",
          highlightedPath: hp,
          message: `Không tìm thấy từ "${word}"`,
        };
      }
    }

    return {
      found: false,
      meaning: "",
      highlightedPath: hp,
      message: `Không tìm thấy từ "${word}"`,
    };
  }

  // ── Helpers ─────────────────────────────────────────────────────────────────
  getAllWords(): string[] {
    this._rebuildAllWords();
    return [...this._allWords].sort();
  }

  getSerializedTree(
    hp: RadixTrieNode[] = [],
    newNodes: RadixTrieNode[] = [],
    deletedNodes: RadixTrieNode[] = [],
    foundNodes: RadixTrieNode[] = []
  ): TrieNodeData {
    return this.root.serialize(
      new Set(hp),
      new Set(newNodes),
      new Set(deletedNodes),
      new Set(foundNodes)
    );
  }

  // ── Clone ───────────────────────────────────────────────────────────────────
  clone(): RadixTrie {
    const t = new RadixTrie();
    t.root.isEndOfWord = this.root.isEndOfWord;
    t.root.meaning = this.root.meaning;

    this.root.children.forEach((child, key) => {
      t.root.children.set(key, this._cloneNode(child));
    });

    t._rebuildAllWords();
    return t;
  }

  private _cloneNode(node: RadixTrieNode): RadixTrieNode {
    const copy = new RadixTrieNode(node.label);
    copy.isEndOfWord = node.isEndOfWord;
    copy.meaning = node.meaning;

    node.children.forEach((child, key) => {
      copy.children.set(key, this._cloneNode(child));
    });

    return copy;
  }
}