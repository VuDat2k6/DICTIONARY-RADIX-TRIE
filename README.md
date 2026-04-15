# English Dictionary - Radix Trie

Ứng dụng từ điển Anh - Việt sử dụng cấu trúc dữ liệu **Radix Trie** (Trie nén), được xây dựng bằng React + TypeScript + Vite.

---

## Giới thiệu

### Radix Trie là gì?

**Radix Trie** (hay còn gọi là Compacted Trie) là một biến thể của Trie (Cây tiền tố) được tối ưu hóa bằng cách **gộp các node con có một con duy nhất** lại thành một node duy nhất. Mỗi cạnh trong Radix Trie có thể chứa **một chuỗi ký tự** (không chỉ một ký tự như Trie thông thường).

### Ưu điểm của Radix Trie

| Đặc điểm | Trie thông thường | Radix Trie |
|----------|-------------------|------------|
| Chiều cao | O(m) với m = độ dài từ dài nhất | O(log n) trung bình |
| Bộ nhớ | O(ALPHABET_SIZE × m × N) | O(m × N) |
| Insert/Search | O(m) | O(m) |
| Chia sẻ prefix | Có | Có (tốt hơn) |

### Các thao tác được hỗ trợ

1. **Insert** - Thêm từ mới vào từ điển
2. **Delete** - Xóa từ khỏi từ điển
3. **Search** - Tìm kiếm nghĩa của từ

---

## Cấu trúc dự án

```
dictionary-app/
├── src/
│   ├── components/
│   │   ├── App.tsx                    # Component chính
│   │   ├── Header.tsx                 # Header với tab điều hướng
│   │   ├── DictionaryTab.tsx          # Tab từ điển (CRUD)
│   │   ├── RadixTrieTab.tsx           # Tab cây Radix-Trie (trực quan hóa)
│   │   ├── SvgTreeView.tsx            # Render cây bằng SVG
│   │   ├── OperationHistoryPanel.tsx # Lịch sử thao tác
│   │   └── NodeDetailPanel.tsx        # Chi tiết node được chọn
│   ├── data/
│   │   ├── RadixTrie.ts               # Class Radix Trie
│   │   └── vocabulary.ts             # Dữ liệu từ điển mẫu (103 từ)
│   ├── styles.ts                      # Màu sắc & style dùng chung
│   ├── App.tsx                        # Entry point
│   ├── main.tsx                       # React mount
│   ├── index.css                      # Global styles
│   └── App.css                        # Component styles
├── index.html                         # HTML entry
├── package.json                       # Dependencies
├── vite.config.ts                     # Vite configuration
└── tsconfig.json                     # TypeScript configuration
```

---

## Hướng dẫn cài đặt

### Yêu cầu

- **Node.js** version 18+
- **npm** hoặc **pnpm**

### Các bước cài đặt

```bash
# 1. Di chuyển vào thư mục dự án
cd dictionary-app

# 2. Cài đặt dependencies
npm install

# 3. Chạy development server
npm run dev

# 4. Mở trình duyệt tại http://localhost:5173
```

### Các lệnh khác

```bash
# Build production
npm run build

# Xem trước bản production
npm run preview

# Kiểm tra lỗi TypeScript
npm run build

# Kiểm tra lint
npm run lint
```

---

## Hướng dẫn sử dụng

### Tab Từ Điển (Dictionary)

Tab mặc định khi mở ứng dụng, cho phép thực hiện các thao tác CRUD trên từ điển.

#### Tìm kiếm từ

1. Nhập từ cần tìm vào ô **"Tìm từ..."**
2. Kết quả sẽ hiển thị ngay bên dưới ô tìm kiếm
3. Click vào từ trong danh sách để xem chi tiết

#### Thêm từ mới

1. Nhấn tab **"Thêm từ mới"**
2. Nhập từ tiếng Anh vào ô đầu tiên
3. Nhập nghĩa tiếng Việt vào ô thứ hai
4. Nhấn nút **"➕ Thêm vào từ điển"**
5. Thao tác thành công sẽ hiển thị thông báo xanh

#### Xóa từ

1. Nhấn tab **"Xóa từ"**
2. Nhập từ cần xóa
3. Nhấn nút **"🗑️ Xóa khỏi từ điển"**
4. Thao tác thành công sẽ hiển thị thông báo xanh

### Tab Cây Radix-Trie

Tab trực quan hóa cấu trúc dữ liệu Radix Trie dưới dạng cây SVG.

#### Các thao tác trên cây

1. **Insert** - Thêm từ mới (node mới hiển thị màu xanh)
2. **Delete** - Xóa từ (node bị xóa hiển thị màu đỏ với đường gạch ngang)
3. **Search** - Tìm kiếm (highlight đường đi màu xanh dương)

#### Tương tác với cây

- **Zoom**: Cuộn chuột tại vị trí con trỏ để phóng to/thu nhỏ
- **Pan**: Kéo nền cây để di chuyển view
- **Chọn node**: Click vào node để xem chi tiết
- **Reset view**: Double-click hoặc nhấn nút Reset

#### Chú thích màu sắc

| Màu | Ý nghĩa |
|-----|---------|
| 🔵 Xanh dương | Đường đi được highlight |
| 🟢 Xanh lá | Node mới được thêm |
| 🔴 Đỏ | Node đã bị xóa |
| 🟡 Vàng | END node (kết thúc từ) |
| 🟣 Tím | Node đang được chọn |
| 🔵 Xanh dương nhạt | FOUND (tìm thấy) |

---

## Công nghệ sử dụng

| Công nghệ | Mô tả |
|-----------|-------|
| **React 19** | Thư viện UI |
| **TypeScript** | Ngôn ngữ lập trình có kiểu |
| **Vite** | Build tool & dev server |
| **SVG** | Trực quan hóa cây Radix Trie |
| **CSS-in-JS** | Inline styles |

---

## Chi tiết cấu trúc Radix Trie

### Class RadixTrie

```typescript
class RadixTrie {
  insert(word: string, meaning: string): InsertResult
  delete(word: string): DeleteResult
  search(word: string): SearchResult
  getAllWords(): string[]
  getSerializedTree(...): TrieNodeData
}
```

### TrieNodeData

Mỗi node trong cây bao gồm:

```typescript
interface TrieNodeData {
  id: string           // Unique identifier
  label: string        // Chuỗi ký tự trên cạnh cha
  isEndOfWord: boolean // Có phải kết thúc từ không
  meaning?: string     // Nghĩa của từ
  children: TrieNodeData[] // Các node con
  // Trạng thái visualization
  isNew?: boolean
  isDeleted?: boolean
  isFound?: boolean
  isHighlighted?: boolean
}
```

### Thuật toán Insert

1. Bắt đầu từ root
2. So sánh từ cần insert với các child
3. Tìm prefix chung:
   - Nếu prefix = label của child → đi tiếp
   - Nếu prefix < label → tách child ra
   - Nếu không có prefix chung → tạo child mới
4. Đánh dấu node cuối là END

### Thuật toán Search

1. Bắt đầu từ root
2. Duyệt theo các child phù hợp với ký tự trong từ
3. Nếu tìm đến node END và đã duyệt hết từ → Tìm thấy
4. Ngược lại → Không tìm thấy

### Thuật toán Delete

1. Tìm vị trí từ cần xóa
2. Bỏ đánh dấu END
3. Gộp các node con nếu có một con duy nhất (compression)

---

## Thông tin dự án

- **Môn học**: CS523 - Cấu trúc dữ liệu và giải thuật
- **Ngôn ngữ**: Tiếng Việt
- **Số từ mẫu**: 103 từ tiếng Anh phổ biến

---

## License

MIT License
