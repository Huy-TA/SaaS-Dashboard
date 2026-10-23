# Template bốn file đầu ra

Skill này ra **bốn file**, không phải một:

```text
docs/
├── 1-spec/
│   └── specification.md      ← xây cái gì, cho ai, đo bằng chỉ số nào
└── 2-design/
    ├── design.md             ← thiết kế theo nguyên tắc nào
    ├── layout.md             ← bố cục ra sao, số đo px
    └── components.md         ← dùng những component nào
```

Bốn mục lớn dưới đây là cấu trúc của bốn file đó. Điền **mọi đề mục**. Dataset đơn giản cũng không được bỏ mục — mục trống là chỗ để `dashboard-build` tự bịa.

Quy ước đọc template:

| Ký hiệu | Nghĩa |
|---|---|
| `[...]` | thay bằng giá trị thật |
| số cứng (1600, 900, 301, 230, 206, 58) | **hợp đồng bố cục** — chép nguyên, không sửa |
| mục đánh dấu **bắt buộc** | thiếu là không qua được bước 7 |

Ghi thẳng cả bốn file trong **một lượt**, không in ra chat trước, không hỏi giữa chừng. Kết thúc bằng một báo cáo gộp theo đúng mục Output Contract của `SKILL.md`.

**Cả bốn file đều kết thúc bằng mục `## Giả định cần bạn xác nhận`.** Đánh số `G1, G2…` **liên tục xuyên bốn file** — người review cần một dãy số duy nhất để trỏ tới, không phải bốn dãy trùng nhau.

---

# 1 · `docs/1-spec/specification.md`

Ra ở **bước 3**. Nội dung, chưa động đến hình thức. Không có một hex màu nào trong file này.

```markdown
# [Tên dashboard] — Đặc tả

Domain: [tên] · Nguồn: Google Sheets `[tên spreadsheet]` / tab `[tên tab]`
Ngày lập: [yyyy-mm-dd] · Người duyệt: [tên]

## 1 · Mục tiêu

Một câu, do người dùng xác nhận nguyên văn:

> [Dashboard này giúp ... quyết định ... ]

## 2 · Người dùng

| Nhóm | Mở lúc nào | Quyết định việc gì |
|---|---|---|
| [...] | [...] | [...] |

## 3 · Vấn đề cần giải quyết

Cách làm hiện tại và chỗ tốn thời gian nhất:

- [Hiện đang xem bằng gì]
- [Khâu tốn thời gian nhất]
- [Con số từng bị hiểu sai hoặc gây tranh cãi]

Ba câu hỏi dashboard **bắt buộc** phải trả lời:

1. [...]
2. [...]
3. [...]

## 4 · Bốn trang

| # | Trang | Trả lời câu hỏi gì | Có băng KPI |
|---|---|---|---|
| 1 | Tổng quan | [...] | có |
| 2 | Theo [PRIMARY_DIM] | [...] | có |
| 3 | Theo [SECONDARY_DIM] | [...] | có |
| 4 | Nguồn dữ liệu | [...] | **không** |

Cấu trúc bốn trang là cố định, không thương lượng. Chỉ nội dung từng trang là chốt theo người dùng.

## 5 · Năm thẻ KPI

| # | Nhãn | Công thức | Chiều tốt | Đường chuẩn sparkline | Tô màu |
|---|---|---|---|---|---|
| 1 | [...] | [...] | cao hơn tốt hơn | ngưỡng [tên] | có |
| 2 | [...] | [...] | thấp hơn tốt hơn | trung bình kỳ | không |
| 3 | [...] | [...] | [...] | [...] | [...] |
| 4 | [...] | [...] | [...] | [...] | [...] |
| 5 | [...] | [...] | [...] | [...] | [...] |

Hai luật, ghi thẳng vào file:

1. **Đường chuẩn là bắt buộc.** Sparkline không có mốc chỉ cho thấy hình dáng, không cho biết đang trên hay dưới ngưỡng.
2. **Chỉ KPI có ngưỡng mới được tô màu.** Còn lại giữ mực. Tô màu một chỉ số chưa ai định nghĩa "thế nào là tốt" là nói dối người xem.

Chỉ số nghịch (chi phí, CPL, tỷ lệ rời bỏ, tỷ lệ hoàn): **tăng là xấu**, mũi tên phải đảo màu.

## 6 · Chức năng chính

| Chức năng | Mô tả | Ghi chú |
|---|---|---|
| Drawer bộ lọc | trượt từ phải, ẩn hoàn toàn khi đóng | chứa **4 lựa chọn chỉ số** |
| Bốn lựa chọn chỉ số | `[a]` · `[b]` · `[c]` · `[d]`, mặc định `[...]` | nằm **trong drawer**, không trên màn hình chính |
| Xuất dữ liệu hai bước | mở bảng chọn → xem trước số dòng → mới tải | chỉ xuất dữ liệu, không PNG/PDF |
| Thanh chào | ngày + lời chào theo **UTC+7** | không theo giờ máy |
| Sáng/tối | chuyển được, cả hai chế độ đều phải kiểm | |
| Cảnh báo | bấm vào → lọc tới nhóm đó + nhảy trang | [danh sách loại cảnh báo] |

## 7 · Dữ liệu và vai trò từng cột

Nguồn: `[spreadsheet]` / `[tab]` · Số dòng: [n] · Khoảng ngày: [từ] → [đến] · Hạt dữ liệu: 1 dòng = [...]

| # | Cột | Kiểu | Vai trò | Ví dụ |
|---|---|---|---|---|
| 1 | [...] | date | `DATE` | [...] |
| 2 | [...] | text | `PRIMARY_DIM` | [...] |
| 3 | [...] | text | `SECONDARY_DIM` | [...] |
| 4 | [...] | number | `METRIC` | [...] |
| ... | | | | |

Mỗi cột đúng **một** vai trò. Số lượng: `DATE` đúng 1 · `PRIMARY_DIM` đúng 1 · `SECONDARY_DIM` 1–3 · `METRIC` ≥ 3 · `ATTRIBUTE` 0–2.

### Cột ATTRIBUTE — không được SUM

| Cột | Cách tổng hợp | Lý do |
|---|---|---|
| [...] | `MAX` theo [thực thể] | lặp lại ở mọi dòng của cùng [thực thể] |

Không có cột nào thì ghi `Không có`. Có mà không ghi là mọi con số liên quan đều sai — `campaign_budget` cộng qua ngày ra ngân sách nhân lên bằng số ngày chiến dịch chạy.

Cột ảnh chụp tại thời điểm (`headcount`, `stock_on_hand`) cũng vào đây: kiểu số, đổi theo ngày, nhưng không cộng được qua ngày. Ghi rõ dùng giá trị cuối kỳ hay trung bình.

## 8 · Chỉ số phái sinh

| Chỉ số | Công thức đúng | Cách tính sai cần tránh |
|---|---|---|
| [...] | `SUM(tử) / SUM(mẫu)` | `AVG(tỷ lệ từng ngày)` |
| [...] | [...] | [...] |

Ghi cả cột "cách tính sai" vì đây là lỗi im lặng: không thông báo, không ngoại lệ, chỉ có một con số sai trông rất bình thường. Ngày có 2 click / 1 conversion cho 50%, đứng ngang hàng với ngày 2000 click / 40 conversion cho 2%; trung bình ra 26%, không phản ánh gì cả.

## 9 · Bốn ngưỡng nghiệp vụ

```
[tên ngưỡng 1]  [toán tử] [số]
[tên ngưỡng 2]  [toán tử] [số]
[tên ngưỡng 3]  [toán tử] [số]
[tên ngưỡng 4]  [toán tử] [số]
```

| Ngưỡng | Giá trị | Nguồn | Dùng ở đâu |
|---|---|---|---|
| [...] | [...] | người dùng chốt / suy từ dữ liệu | KPI [n], màu chuỗi, cảnh báo |

Mỗi ngưỡng phải là **số cụ thể**. "Cao", "thấp", "bất thường" không dùng được: máy không so sánh được ⇒ không tô màu được ⇒ KPI mất chú thích ngưỡng và sparkline mất đường chuẩn.

Ngưỡng nào suy từ dữ liệu chứ không từ mục tiêu kinh doanh thì phải ghi lại ở mục 12.

## 10 · Phạm vi phiên bản đầu

| Có trong v1 | Để lại sau |
|---|---|
| [...] | [...] |

Không có trong v1, và không thương lượng: trang phân tích thêm (phễu chuyển đổi, ma trận thời gian, cohort) · chatbox AI · ô tìm kiếm toàn cục · xuất PNG/PDF.

## 11 · Số liệu tham chiếu để tự kiểm

Sau khi build xong, các số này phải khớp:

| Hạng mục | Giá trị kỳ vọng |
|---|---|
| Tổng số dòng đọc được | [n] |
| Khoảng ngày | [từ] → [đến] |
| [KPI 1] ở kỳ mặc định | [giá trị] |
| [KPI 2] ở kỳ mặc định | [giá trị] |
| Số nhóm trong [PRIMARY_DIM] | [n] |

Lệch nghĩa là sai ở khâu đọc hoặc tổng hợp dữ liệu, **không phải** ở chart. Không có mục này thì mọi con số sai đều lọt.

## 12 · Giả định cần bạn xác nhận

Mục này có ở **cả bốn file**, luôn đứng cuối. Mỗi giả định đủ ba phần — quyết định gì · vì sao · sửa ở đâu nếu sai:

```
G3. [Cao] Chọn `channel` làm PRIMARY_DIM (5 giá trị) thay vì `campaign` (12 giá trị).
     Vì: trục phân tích chính nên có 3–8 nhóm để donut đọc được.
     Nếu sai: đổi ở specification.md §4, rồi chạy lại layout.md §2.
```

Mức rủi ro: **Cao** (sai là phải dựng lại spec) · **Vừa** (sai là sửa một mục) · **Thấp** (sai cũng không ảnh hưởng bố cục).

| # | Mức | Giả định đã đưa ra | Vì sao | Sửa ở đâu nếu sai |
|---|---|---|---|
| 1 | [...] | [...] | [...] |

Chỗ duy nhất được giả định mà không hỏi là **tên cột và kiểu dữ liệu** đọc trực tiếp từ dataset. Mọi giả định khác vào bảng này. Bảng trống chỉ hợp lệ khi người dùng đã xác nhận từng mục — không phải khi mình quên ghi.

## 13 · Dashboard này KHÔNG trả lời được gì

- [Câu hỏi 1 nằm ngoài phạm vi]
- [Câu hỏi 2 nằm ngoài phạm vi]
- [Chỗ dữ liệu dễ bị hiểu sai]

Dashboard theo dõi cho biết *cái gì đang xảy ra*, không cho biết *vì sao*. Viết mục này bằng câu hỏi thật người dùng sẽ hỏi, không phải một câu lấp chỗ kiểu "không phân tích sâu".
```

---

# 2 · `docs/2-design/design.md`

Ra ở **bước 4**. Nguyên tắc thị giác, chưa có số đo px — số đo là việc của `layout.md`.

Đọc `references/design-system.md` toàn bộ trước khi viết. Token chép từ đó, **không sửa hex, không thêm màu**.

```markdown
# [Tên dashboard] — Thiết kế

## 1 · Hướng thị giác

[2–3 câu: dashboard này trông như thế nào và vì sao chọn hướng đó cho nhóm người dùng ở specification.md mục 2.]

Ba quyết định nền:

| Quyết định | Chọn gì | Vì sao |
|---|---|---|
| Tách lớp bằng gì | ba sắc độ nền + một hairline | không kính mờ, không gradient, không bóng trừ hai chỗ |
| Màu xuất hiện ở đâu | chỉ nơi màu mang nghĩa | [...] |
| Mật độ | [...] | [màn hình người dùng đang dùng] |

## 2 · Design system đang dùng

**Monochrome Near-White Analytics Design System.**

Sáu bản thay thế đã dựng sẵn: Linear · Geist · Stripe · Raycast · Radix · Apple HIG. Chọn [giữ mặc định / đổi sang ...] vì [lý do].

Nguyên tắc số một — **một mặt phẳng, không vật liệu**:

| Lớp | Token | Dùng cho |
|---|---|---|
| Mặt bàn | `--page` | nền ngoài shell — shell **nổi trên** nó |
| Khung app | `--shell` | sidebar + header + vùng nội dung |
| Sàn nội dung | `--page` | `#body` — card nổi trên sàn này |
| Card | `--card` | card KPI, card chart, bảng |

Hai điều dễ làm sai, ghi thẳng vào file:

1. **Shell không tràn hết màn hình.** Nó là một tấm bo `--r-shell: 20px` nổi trên `--page`, có `--sh-shell`, thấy được bo góc và lề ở **cả bốn phía**. Dashboard tràn sát mép màn hình là dấu hiệu làm sai hệ này.
2. **`#body` không cùng màu với `--shell`.** Sàn phải thấp hơn card **một bậc**, nếu không card trắng trên nền trắng sẽ mất mép. Đó là lý do sàn dùng `--page` chứ không dùng `--shell`.

## 3 · Bảng token

### Nền và mực

| Token | Light | Dark | Dùng cho |
|---|---|---|---|
| `--page` | `#E9E9EA` | `#0A0A0B` | mặt bàn + sàn `#body` |
| `--shell` | `#FFFFFF` | `#131315` | khung app |
| `--card` | `#FFFFFF` | `#131315` | card |
| `--sub` | `#FAFAFA` | `#191A1C` | hover, ô nhập |
| `--sub2` | `#F4F4F5` | `#1F2023` | nav đang chọn, nút phụ |
| `--line` | `#EBEBEC` | `#232427` | hairline |
| `--line2` | `#F2F2F3` | `#1C1D20` | hairline nhạt hơn |
| `--ink` | `#191A1C` | `#F2F3F5` | chữ chính |
| `--ink2` | `#6C6E72` | `#9B9EA4` | chữ phụ |
| `--ink3` | `#A3A5AA` | `#6A6D73` | nhãn trục, placeholder |

### Brand và tín hiệu

| Token | Light | Dark |
|---|---|---|
| `--brand` | `#3D5AFE` | `#7C90FF` |
| `--brand-600` | `#2E48E0` | `#6478F5` |
| `--brand-50` | `#F0F2FF` | `#1A1E33` |
| `--on-brand` | `#FFFFFF` | `#0C1023` |
| `--ok` / `--ok-bg` | `#128A54` / `#E8F5EE` | `#34C98A` / `#0E2A1F` |
| `--warn` / `--warn-bg` | `#B45309` / `#FDF3E7` | `#E5A93B` / `#2A1E0B` |
| `--bad` / `--bad-bg` | `#C62B3C` / `#FBEBEC` | `#FF7080` / `#2C1517` |

### Chuỗi dữ liệu — 5 bậc mực

| Token | Hex | Hạng |
|---|---|---|
| `--focus` | `#191A1C` | hạng 1 |
| `--series-1` | `#2E3033` | đậm nhất |
| `--series-2` | `#55585D` | |
| `--series-3` | `#83868C` | |
| `--series-4` | `#AFB2B7` | |
| `--series-5` | `#D3D5D8` | nhạt nhất |

### Màu thương hiệu: không dùng

Không có token màu kênh. Mọi dimension — kênh, chiến dịch, sản phẩm — tô theo thang `--series-*` của design system đang chạy. Đổi design system thì màu chart đổi theo, không còn vùng nào miễn nhiễm.

### Bo góc và bóng

```
--r-shell: 20px    --r-card: 11px    --r-inner: 9px
--r-menu:  9px     --r-sm:    7px    --r-sheet: 14px    --r-pill: 999px

--sh-card:  0 1px 2px rgba(18,20,24,.03)
--sh-pop:   0 14px 38px -10px rgba(18,20,24,.16), 0 2px 6px rgba(18,20,24,.05)
--sh-shell: 0 22px 56px -22px rgba(18,20,24,.22)
```

Shell 20 → card 11 → phần tử trong card 9. Bo giảm dần theo độ sâu; bằng nhau sẽ thấy méo ở góc.

Đúng ba bóng, không thêm. `--sh-card` gần như không thấy — card tách khỏi sàn chủ yếu bằng **chênh nền**, bóng chỉ để xác nhận. `--sh-pop` cho popover / drawer / modal. `--sh-shell` cho đúng một thứ: shell nổi trên mặt bàn.

### Khối bí danh tương thích — không được xoá

```css
--label: var(--ink);   --label2: var(--ink2);   --label3: var(--ink3);
--bg: var(--card);     --separator: var(--line);
--blue: var(--brand);  --green: var(--ok);  --red: var(--bad);  --orange: var(--warn);
--fill4: var(--line2); --gray: var(--ink3); --lift-sm: var(--sh-card);
```

Lớp JS vẽ chart gọi `CSS('--label2')`, `CSS('--fill4')`… theo tên hệ cũ. Khối này ánh xạ chúng về hệ mới tại **một chỗ**.

Xoá khối này là 40+ lời gọi `getComputedStyle` trả về chuỗi rỗng — chart vẫn vẽ nhưng không màu, hỏng im lặng, không có thông báo lỗi nào. Nó cũng chính là cơ chế cho phép đổi cả design system mà không đụng một dòng JS.

## 4 · Typography

```
--sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif
--mono: ui-monospace, 'SF Mono', SFMono-Regular, Menlo, 'JetBrains Mono', Consolas, monospace
```

| Vai trò | Cỡ | Đậm |
|---|---|---|
| Lời chào | 22px | 600 |
| Số KPI | 28px | 600 |
| Tiêu đề card | 15px | 600 |
| Chữ thường | 13px | 400 |
| Chữ phụ / legend | 11.5px | 400–500 |
| Nhãn trục | 10.5px | 400 |

Mọi số dùng `font-variant-numeric: tabular-nums` để cột số không nhảy khi cập nhật.

## 5 · Ba luật màu

Ghi nguyên văn, **không tóm tắt lại thành "dùng màu có ý nghĩa"** — tóm tắt xong là mất luật.

**Luật 1 — `--brand` chỉ dành cho thứ bấm được.** Chỉ xuất hiện ở: nút chính, checkbox đã tick, viền focus, link. **Không bao giờ** làm màu chuỗi dữ liệu. Mục nav đang chọn cũng **không** tô brand — nó tô nền `--sub2` + chữ `--ink`. Brand để dành cho đúng một nút hành động trên mỗi màn.

**Luật 2 — `--ok` / `--warn` / `--bad` chỉ mang nghĩa ngưỡng.** Chỉ dùng khi có **một con số so với một ngưỡng**: đạt/không đạt, tăng/giảm, mức cảnh báo. Không bao giờ làm màu chuỗi dữ liệu. "TikTok tô đỏ vì là chuỗi thứ 3" nghĩa là lúc TikTok thật sự lỗ sẽ không ai nhận ra.

**Luật 3 — không có ngoại lệ nào.** Mọi màu đều là token của design system. Không có bảng màu thương hiệu. Mọi dimension đi chung một luật: màu nói **thứ hạng**, còn danh tính do icon và nhãn chở.

**Hệ quả — thứ tự quyết định màu chuỗi**, đọc từ trên xuống, gặp là dừng:

```
1. dưới ngưỡng lỗ   →  --bad      (trạng thái thắng tất cả)
2. hạng 1           →  --focus
3. còn lại          →  --series-N theo hạng, tối đa bậc 5
```

Ngưỡng đứng trên cùng là có chủ ý: một kênh đang lỗ phải đỏ **kể cả khi** nó là Facebook và lẽ ra mang màu xanh Facebook.

Năm bậc mực chênh nhau về **độ sáng**, không về sắc — điều kiện để phân biệt được khi in đen trắng và với người mù màu.

## 6 · Thứ bậc thị giác

| Bậc | Thành phần | Cách làm nổi |
|---|---|---|
| 1 | Số KPI | 28px/600, `--ink` |
| 2 | Chuỗi hạng 1 trong chart | `--focus` |
| 3 | Tiêu đề card | 15px/600 |
| 4 | Chuỗi còn lại | `--series-2..5` nhạt dần |
| 5 | Nhãn trục, chú thích | 10.5–11.5px, `--ink3` |

Làm nổi bằng **độ đậm và sắc độ mực**, không bằng màu. Màu đã bị ba luật ở mục 5 giữ chỗ hết rồi.

## 7 · Nguyên tắc tương tác

| Nguyên tắc | Nội dung |
|---|---|
| Một nút brand mỗi màn | Hai nút brand nghĩa là chưa quyết được đâu là hành động chính |
| Điều khiển một-chart ở header card đó | Căn phải trong `chead` |
| Điều khiển cả-trang trong drawer | Không đặt hai bản sao của cùng một điều khiển ở hai chỗ — chúng ghi vào cùng một biến, người dùng tưởng là hai thiết lập riêng |
| Sửa trong drawer là nháp | Chỉ áp dụng khi bấm `Áp dụng` |
| Hành động phá huỷ phải xác nhận | `Xoá hết` bộ lọc [có / không] cần xác nhận |
| Bốn trạng thái runtime | đang tải · lỗi + nút thử lại · có dữ liệu · **không dòng nào khớp bộ lọc** + gợi ý nới lọc |

## 8 · Light / dark

Cả hai chế độ đều phải viết vào tài liệu và đều phải kiểm, kể cả khi người dùng nói chỉ chạy sáng.

Dark **không phải đảo màu**. Nó là bảng riêng ở mục 3, và ba luật màu đảo được nguyên vẹn — đảo được thì mới chứng minh đó là một luật chứ không phải một bảng màu.

Kiểm sau khi đổi theme, bốn trạng thái: sáng · tối · thu gọn sidebar · trang Nguồn dữ liệu. Không lỗi console, và **mọi chữ đạt 4,5:1 ở cả hai theme** — kể cả nhãn trục 10.5px.
```

---


## 9 · Giả định cần bạn xác nhận

Đánh số tiếp nối file trước, không bắt đầu lại từ G1.

```
G12. [Vừa] <quyết định đã đưa ra, kèm con số nếu có>
     Vì: <tín hiệu nào trong dữ liệu hoặc luật nào dẫn tới quyết định đó>
     Nếu sai: <sửa ở file nào, mục nào, và phải chạy lại cái gì>
```

| Mức | Nghĩa |
|---|---|
| **Cao** | sai là phải dựng lại spec |
| **Vừa** | sai là sửa một mục |
| **Thấp** | sai cũng không ảnh hưởng bố cục |

Ở file này, giả định hay gặp nhất: **chọn design system** (mặc định Monochrome Near-White, mức Vừa).

---

# 3 · `docs/2-design/layout.md`

Ra ở **bước 5**. Mọi số trích từ `references/layout-contract.md`. **Không tự nghĩ số mới.**

```markdown
# [Tên dashboard] — Bố cục

## 1 · Canvas cố định 1600×900

Toàn bộ dashboard vẽ trên khung **1600×900 px cứng**, rồi thu vừa cửa sổ:

```js
scale = Math.min(innerWidth / 1600, innerHeight / 900)
```

Hai thứ đạt được cùng lúc: **không bao giờ phải cuộn**, và **mọi máy ra cùng một pixel** — không có breakpoint nào để sai.

Không `ResponsiveContainer`, không đọc `clientWidth`, không `ResizeObserver`. Mọi chart nhận **số px cứng**.

Hệ quả: không có gì để cuộn, nên không có hiệu ứng header mờ dần khi lướt. Header là thanh cố định 46px.

Dashboard **không tràn sát mép màn hình**: khung app là một tấm bo `--r-shell: 20px`, có `--sh-shell`, nổi trên nền `--page`, thấy được bo góc và lề ở **cả bốn phía**.

## 2 · Hằng số bố cục

```js
const SIDE_BORDER = 1, HDR = 46, BODY_PAD_X = 24, BODY_PAD_Y = 20,
      GAP = 14, KPI_GAP = 12;
const BAND = { greet: 52, kpi: 118, row2: 301, row3: 301 };
const CARD_PAD = 14, CHEAD = 43;     // CHEAD = khối tiêu đề trong card
const LGD1 = 24, LGD2 = 44;          // dải chú giải: 1 hàng · 2 hàng
let SIDE = 206;                      // 58 khi thu gọn
```

## 3 · Phép kiểm tổng chiều cao — phải đúng 900

```
46  header
20  body padding trên
52  thanh chào
14  gap
118 băng KPI
14  gap
301 row 2
14  gap
301 row 3
20  body padding dưới
─────
900  ✓
```

## 4 · Phép kiểm tổng bề rộng — phải đúng 1600

```
206  sidebar
1    hairline
24   body padding trái
1345 vùng nội dung
24   body padding phải
─────
1600 ✓
```

Hai phép cộng này không phải trang trí. Người sửa spacing về sau sẽ dùng đúng chúng để biết mình vừa làm vỡ cái gì.

`row2 === row3 === 301` là **bắt buộc**: bốn card chart phải cao bằng nhau, nếu không mắt sẽ đọc thành "hàng trên quan trọng hơn" — một thông điệp không ai chủ ý gửi.

## 5 · Suy ra kích thước chart

Mọi kích thước tính từ **một biến duy nhất** là `SIDE`:

```js
function LAY() {
  const mainW  = 1600 - SIDE - SIDE_BORDER;
  const innerW = mainW - BODY_PAD_X * 2;

  const a = Math.floor((innerW - GAP) * 0.30),  b = innerW - GAP - a;   // Row 2 = 30/70
  const c = Math.floor((innerW - GAP) * 0.40),  d = innerW - GAP - c;   // Row 3 = 40/60

  const plot = (w, bandH) => ({
    w: w - CARD_PAD * 2,
    h: bandH - CARD_PAD * 2 - CHEAD
  });

  return {
    mainW, innerW, a, b, c, d,
    kpiW: Math.floor((innerW - KPI_GAP * 4) / 5),
    p2a: plot(a, BAND.row2),  p2b: plot(b, BAND.row2),
    p3c: plot(c, BAND.row3),  p3d: plot(d, BAND.row3)
  };
}
```

### Bảng kích thước suy ra — cả hai trạng thái sidebar

| | Sidebar mở (206) | Sidebar thu gọn (58) |
|---|---|---|
| `mainW` | 1393 | 1541 |
| `innerW` | 1345 | 1493 |
| Row 2 · trái (30%) | 399 | 443 |
| Row 2 · phải (70%) | 932 | 1036 |
| Row 3 · trái (40%) | 532 | 591 |
| Row 3 · phải (60%) | 799 | 888 |
| Bề rộng thẻ KPI | 259 | 289 |
| **Chiều cao vẽ của cả 4 chart** | **230** | **230** |

Bề rộng vẽ = bề rộng card − `CARD_PAD × 2` = − 28. Chiều cao vẽ = `301 − 28 − 43` = **230**, giống nhau ở mọi card vì `row2 === row3`.

Không có số nào được hardcode riêng cho trạng thái thu gọn. Đổi `SIDE`, cả bảng tính lại.

### Card có legend — trừ trước khi vẽ

| Chart | Trừ khỏi 230 | Còn lại |
|---|---|---|
| Donut / pie | `LGD2` = 44 | 186 |
| Line nhiều đường | `LGD1` = 24 | 206 |
| Bar, area một chuỗi, bảng, sparkline | 0 | 230 |

Quên trừ thì card tràn — và tràn ở đây không báo lỗi, chỉ xén mất phần dưới chart.

## 6 · Bố cục bốn trang

### Trang 1 · Tổng quan

| Vị trí | Chart | Vùng vẽ (sidebar 206) | Legend |
|---|---|---|---|
| Row 2 · 30% | Donut tỷ trọng theo [PRIMARY_DIM] | 371 × 186 | 2 hàng (44) |
| Row 2 · 70% | Area xu hướng [chỉ số đang chọn] | 904 × 230 | không |
| Row 3 · 40% | Bar top [SECONDARY_DIM] | 504 × 230 | không |
| Row 3 · 60% | Bảng ma trận theo kỳ, tô nhiệt | 771 × 230 | không |

Điều khiển riêng: Ngày/Tuần/Tháng ở header card Area.
Tương tác: bấm donut → lọc theo nhóm đó · bấm thanh bar → lọc chéo.

### Trang 2 · Theo [PRIMARY_DIM]

| Vị trí | Chart | Vùng vẽ (sidebar 206) | Legend |
|---|---|---|---|
| Row 2 · 30% | Bar xếp hạng | 371 × 230 | không |
| Row 2 · 70% | Line nhiều đường qua thời gian, **top 5** | 904 × 206 | 1 hàng (24) |
| Row 3 · 40% | Donut tỷ trọng | 504 × 186 | 2 hàng (44) |
| Row 3 · 60% | Bảng chỉ số đầy đủ | 771 × 230 | không |

Trần 5 đường là giới hạn đọc được. Nhiều hơn thì các đường mực dính vào nhau.

### Trang 3 · Theo [SECONDARY_DIM]

Cùng bố cục trang 2, đổi dimension. Số lấy top: bar [n] · donut [n].

### Trang 4 · Nguồn dữ liệu

| Vị trí | Nội dung |
|---|---|
| Row 2 · 30% | Thông tin kết nối: tên spreadsheet, tab, số dòng, khoảng ngày, quyền, nhịp làm mới |
| Row 2 · 70% | Bảng schema: cột · kiểu · vai trò · ví dụ |
| Row 3 · 40% | Danh sách biến môi trường (**chỉ tên, không giá trị**) |
| Row 3 · 60% | Bảng kiểm tra chất lượng dữ liệu |

Trang 4 **không có băng KPI** và không có chỉ số đang chọn. Khi ẩn băng đó, row2 và row3 phải giãn lấp chỗ trống — nếu không sẽ để lại một dải trắng 132px ở đáy:

```css
#body.nokpi #row2,
#body.nokpi #row3 { flex: 1 1 0; height: auto }
```

Chỉ trang này mới bỏ px cứng. Ba trang theo dõi vẫn khoá pixel.

## 7 · Sidebar

| Trạng thái | Bề rộng | Hiện gì |
|---|---|---|
| Mở | 206px | icon + nhãn |
| Thu gọn | 58px | chỉ icon, nhãn thành tooltip |

Mặc định khi vào: [mở / thu gọn].

Ngăn với vùng nội dung bằng **1px hairline** `--line`, không bằng bóng, không bằng chênh nền.

Khi thu gọn, icon giữ nguyên vị trí — không được nhảy sang giữa.

## 8 · Drawer bộ lọc

Trượt từ phải, nền sau tối đi, **ẩn hoàn toàn khi đóng**.

Thứ tự nội dung từ trên xuống:

1. Chỉ số theo dõi — segmented control **4 lựa chọn**
2. Khoảng thời gian — preset `[7 / 30 / 90 / toàn bộ]` + 2 ô chọn ngày
3. [PRIMARY_DIM] — checkbox, kèm số dòng mỗi nhóm
4. [SECONDARY_DIM] — dropdown hoặc checkbox
5. Bộ lọc trạng thái — toggle `[điều kiện]`
6. Chân: `Xoá hết` · `Áp dụng`

Hai ô ngày đặt `min`/`max` giao nhau để trình duyệt tự chặn khoảng ngược.

Danh sách dài cuộn **trong khối của nó**, chiều cao là **bội số của chiều cao một hàng** — cắt giữa hàng trông như lỗi render. Ví dụ đã kiểm: hàng 28px thì `max-height: 140px` (đúng 5 hàng), không phải 150px.

## 9 · Quy tắc đặt điều khiển

| Loại | Đặt ở đâu |
|---|---|
| Ảnh hưởng **một chart** (Ngày/Tuần/Tháng) | Header của chính card đó, căn phải |
| Ảnh hưởng **cả trang** (khoảng ngày, dimension, chỉ số) | Trong drawer bộ lọc |

Không bao giờ đặt hai bản sao của cùng một điều khiển ở hai card. Chúng ghi vào cùng một biến, người dùng sẽ tưởng là hai thiết lập riêng.

## 10 · Ba cạm bẫy padding

1. **Padding card do JS quyết định, không do thang spacing quyết định.** `LAY()` tính kích thước `<svg>` bằng `CARD_PAD = 14`. Đặt `.card { padding: 16px }` cho "đúng thang spacing" là hộp chứa hẹp hơn svg 4px mỗi bên ⇒ `overflow: hidden` **cắt mép phải cả 4 chart**. Sparkline KPI còn nặng hơn vì bề rộng của nó tính bằng `kpiW − 28`. Muốn đổi thì đổi `CARD_PAD` trong JS, CSS theo sau.
2. **`.card { padding: X }` đặt sau `.kpi { padding: 0 }`** sẽ thắng (cùng độ đặc hiệu, đứng sau), làm thẻ KPI phình ra khỏi băng 118px và cắt mất hàng chân. Viết `.card:not(.kpi)` hoặc thêm lại `.card.kpi { padding: 0 }`.
3. **Drawer đặt `right: 14px` mà đẩy đi bằng `translateX(100%)`** sẽ vẫn lòi ra đúng 14px. Phải cộng cả khoảng cách mép lẫn bóng: `translateX(calc(100% + 34px))`, kèm `visibility: hidden` khi đóng để nó không bắt chuột.
```

---


## 11 · Giả định cần bạn xác nhận

Đánh số tiếp nối file trước, không bắt đầu lại từ G1.

```
G15. [Vừa] <quyết định đã đưa ra, kèm con số nếu có>
     Vì: <tín hiệu nào trong dữ liệu hoặc luật nào dẫn tới quyết định đó>
     Nếu sai: <sửa ở file nào, mục nào, và phải chạy lại cái gì>
```

| Mức | Nghĩa |
|---|---|
| **Cao** | sai là phải dựng lại spec |
| **Vừa** | sai là sửa một mục |
| **Thấp** | sai cũng không ảnh hưởng bố cục |

Ở file này, mục giả định **nên gần như rỗng**. Mọi số đo đều chép từ `layout-contract.md`. Nếu mục này dài hơn một dòng, nhiều khả năng đang tự nghĩ số mới — quay lại kiểm.

---

# 4 · `docs/2-design/components.md`

Ra ở **bước 6**. Danh mục là **tập đóng** — mọi component phải có trong `references/component-catalog.md`. Cần thêm một component mới là dấu hiệu đang trượt khỏi hệ: dừng lại hỏi người dùng, đừng tự thêm.

Mỗi component ghi đủ bốn ô: **vai trò · nội dung hiển thị · trạng thái · quy tắc dùng**.

```markdown
# [Tên dashboard] — Component

## 1 · Khung app

| Component | Vai trò | Nội dung hiển thị | Trạng thái | Quy tắc dùng |
|---|---|---|---|---|
| Shell | Tấm bo `--r-shell` nổi trên mặt bàn | toàn bộ app | — | Có `--sh-shell`, bo góc thấy được cả bốn phía, **không** tràn sát mép màn hình |
| Sidebar | Điều hướng chính | 4 mục trang + nút thu gọn | mở 206 · thu gọn 58 | Ngăn bằng 1px hairline, không bằng bóng |
| Header | Thanh 46px | breadcrumb, đồng bộ, thông báo, chủ đề, tài khoản | — | Cố định, không mờ dần khi cuộn (không có gì để cuộn) |
| Thanh chào | 52px | lời chào + ngày theo **UTC+7** | — | Tính theo giờ Việt Nam, không theo giờ máy. Bên phải là chip bộ lọc đang áp |

### Mục điều hướng

Ba trạng thái: thường · hover · đang chọn.

Mục đang chọn tô nền `--sub2` + chữ `--ink`, **không** tô brand. Brand để dành cho đúng một nút hành động trên mỗi màn.

Khi sidebar thu gọn, nhãn biến thành tooltip; icon giữ nguyên vị trí.

## 2 · Thẻ KPI

Băng 118px, 5 thẻ, mỗi thẻ 259px khi sidebar mở (289px khi thu gọn).

| Phần | Nội dung hiển thị |
|---|---|
| Nhãn + chấm màu | tên chỉ số |
| Số lớn | 28px / 600 / `tabular-nums` |
| So kỳ trước | `↑ 12,4%`, tự đảo chiều tốt/xấu với chỉ số nghịch |
| Sparkline | cao ~30px, kèm **đường chuẩn gạch ngang** |
| Chú thích ngưỡng | ví dụ `mục tiêu 4,00x · đang thiếu 1,35x` |

Trạng thái: đang tải · lỗi · có dữ liệu · không dòng nào khớp bộ lọc.

Quy tắc dùng:

1. **Đường chuẩn là bắt buộc.** Mốc = ngưỡng nghiệp vụ nếu có, còn lại là trung bình kỳ.
2. **Chỉ KPI có ngưỡng mới được tô màu.** Còn lại giữ mực.
3. Chỉ số nghịch (chi phí, CPL, tỷ lệ rời bỏ): tăng là **xấu**, phải đảo màu mũi tên.

Năm thẻ của dashboard này: [1] · [2] · [3] · [4] · [5] — khớp với `specification.md` mục 5.

## 3 · Card chart

```
┌─ card ──────────────────────────┐
│ chead  tiêu đề · điều khiển     │  43px
│ ┌ lgd  legend (tuỳ chart) ────┐ │  24 hoặc 44px
│ └─────────────────────────────┘ │
│ ┌ plot  vùng vẽ svg ──────────┐ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘   padding 14px
```

Điều khiển ảnh hưởng riêng card này (Ngày/Tuần/Tháng) đặt ở `chead`, căn phải. Điều khiển ảnh hưởng cả trang đặt trong drawer.

## 4 · Sáu loại visual

| Loại | Legend | Dùng khi | Dùng ở trang |
|---|---|---|---|
| Donut | có, 2 hàng (44px) | tỷ trọng, ≤ 6 nhóm | [1, 2] |
| Area một chuỗi | không | xu hướng một chỉ số qua thời gian | [1] |
| Line nhiều đường | có, 1 hàng (24px) | so sánh ≤ 5 nhóm qua thời gian | [2, 3] |
| Bar xếp hạng | không | top N, tên nhóm nằm ngay cạnh thanh | [1, 2, 3] |
| Bảng ma trận tô nhiệt | không | nhóm × kỳ | [1] |
| Sparkline | không | chỉ trong thẻ KPI | [1, 2, 3] |

Bar không cần legend vì tên nhóm đã nằm cạnh thanh. Area một chuỗi không cần vì tiêu đề card đã nói rõ đang vẽ gì.

Legend nằm **trên chart, căn trái**, chỉ hiện **màu ↔ tên nhóm**, không kèm số liệu. Số liệu đã có trong chart và trong tooltip.

### Hai cạm bẫy đã trả giá

- **Ô nhiệt pha quá mạnh** thì ô giá trị cao nhất lại là ô khó đọc nhất, và ở dark mode nó đảo ngược thành sáng nhất. Khoảng đã kiểm chứng: `5% + t × 24%`. Đừng dùng `8% + t × 40%`.
- **Nhãn trục cuối bị cắt**: nhãn x cuối nằm sát mép phải, `overflow: hidden` của card sẽ xén. Đặt `text-anchor="end"` cho điểm cuối.

## 5 · Điều khiển

| Component | Class | Vai trò | Trạng thái | Quy tắc dùng |
|---|---|---|---|---|
| Segmented control | `.seg` | chọn 1 trong N | thường · chọn · disabled | vỏ `--sub2`, mục chọn là viên nổi |
| Chip lọc | `.chip` | bật/tắt một giá trị | tắt · bật | dùng trong drawer |
| Nút chính | `.dbtn.pri` `.ubtn` | hành động chính | thường · hover · disabled · đang chạy | **duy nhất** được mang `--brand` |
| Nút phụ | `.ibtn` `.ghost` | hành động phụ | thường · hover · disabled | nền `--sub2` hoặc trong suốt |
| Checkbox | `.cbx` `.box` | chọn nhiều | bỏ · tick · nửa | tick tô brand |
| Radio | `.rad` | chọn một | bỏ · chọn | |
| Switch | `.sw` | bật/tắt | tắt · bật | |
| Ô ngày | `.dates` | khoảng ngày | thường · lỗi | hai ô có `min`/`max` giao nhau |
| Popover | `.pop` | menu nổi | đóng · mở | dùng `--sh-pop` |
| Tooltip | `.tip` | nhãn khi thu gọn sidebar, giải thích chỉ số | ẩn · hiện | |
| Badge trạng thái | `.bdg` `.led` | tình trạng so ngưỡng | ok · warn · bad | chỉ mang `--ok/--warn/--bad` |

Quy tắc số một cho nút: **một màn hình chỉ có một nút brand.** Có hai nút brand nghĩa là chưa quyết được đâu là hành động chính.

## 6 · Drawer bộ lọc

Trượt từ phải, nền sau tối đi, **ẩn hoàn toàn khi đóng** (`visibility: hidden`, và `translateX` phải cộng cả lề lẫn bóng).

Chứa: khoảng ngày (có preset) · [PRIMARY_DIM] · [SECONDARY_DIM] · **4 lựa chọn chỉ số** · nút `Xoá hết` · nút `Áp dụng`.

Bốn lựa chọn chỉ số nằm **ở đây**, không nằm trên màn hình chính.

Sửa trong drawer là **nháp** — chỉ áp dụng khi bấm `Áp dụng`.

Danh sách dài cuộn trong khối của nó, chiều cao là bội số của chiều cao một hàng.

## 7 · Bảng xuất dữ liệu — hai bước

Bấm nút **không tải file ngay**:

1. Mở bảng chọn: phạm vi dòng (theo bộ lọc dashboard / toàn bộ / tuỳ chỉnh, kèm số dòng mỗi lựa chọn) · khoảng ngày riêng · chọn từng cột có nút chọn/bỏ tất cả · định dạng CSV dấu phẩy hoặc dấu chấm phẩy cho Excel bản Việt.
2. **Xem trước**: `Sẽ xuất [n] dòng × [m] cột`.
3. Nút `Tải xuống`, mờ đi khi không có dòng hoặc chưa chọn cột.

Hai luật:

- "Theo bộ lọc dashboard" phải trả về **đúng** tập dòng đang hiển thị, không lọc lại từ đầu theo ngày và dimension — sẽ lệch khi dashboard đang lọc thêm điều kiện khác. Sai ở đây là người dùng mang số sai đi họp.
- Sửa trong bảng xuất **không được** đụng tới bộ lọc dashboard — hai ngữ cảnh khác nhau.

Xuất dữ liệu chỉ là xuất dữ liệu. Không xuất PNG, không xuất PDF.

## 8 · Cảnh báo

| Loại | Điều kiện | Màu |
|---|---|---|
| [...] | [ngưỡng cụ thể từ `specification.md` mục 9] | `--bad` / `--warn` |

Bấm vào một cảnh báo thì lọc thẳng tới nhóm đó và nhảy sang trang tương ứng.

## 9 · Bốn trạng thái runtime

Mọi vùng dữ liệu phải có đủ:

| Trạng thái | Class | Hiển thị |
|---|---|---|
| Đang tải | `.busy` `.spin` | skeleton hoặc spinner |
| Lỗi | `.err` | thông báo + **nút thử lại** |
| Có dữ liệu | | |
| **Không dòng nào khớp bộ lọc** | `.empty` | thông báo + **gợi ý nới lọc** |

Trạng thái thứ tư hay bị quên. Lọc chặt tay là chart trắng trơn không kèm lời giải thích, người dùng tưởng hỏng.

## 10 · Icon

Bộ **33 icon đã nhúng sẵn** trong skill: `assets/icon-sprite.html`. Dán nguyên khối đó sau `<body>`, gọi bằng `<use href="#i-<tên>"/>`. Ba cỡ: `.lu` · `.lu-sm` · `.lu-xs`.

**Không tự vẽ path theo trí nhớ.** Lỗi đã xảy ra: 5/14 icon viết tay sai, và sai kiểu không ai nhận ra bằng mắt (`m21 21-4.3-4.3` thay vì `-4.34-4.34`). Cần icon chưa có thì thay bằng icon đã có, hoặc dùng chữ.

Không dùng emoji làm icon.

Danh sách icon dùng trong dashboard này: [tên · dùng ở đâu].

## 11 · Đăng nhập

[Có màn riêng / nhúng sau cổng có sẵn].

Nếu có: logo, tên sản phẩm, nút đăng nhập, ghi chú pháp lý. Cùng hệ token, cùng shell bo góc.
```

---


## 12 · Giả định cần bạn xác nhận

Đánh số tiếp nối file trước, không bắt đầu lại từ G1.

```
G17. [Vừa] <quyết định đã đưa ra, kèm con số nếu có>
     Vì: <tín hiệu nào trong dữ liệu hoặc luật nào dẫn tới quyết định đó>
     Nếu sai: <sửa ở file nào, mục nào, và phải chạy lại cái gì>
```

| Mức | Nghĩa |
|---|---|
| **Cao** | sai là phải dựng lại spec |
| **Vừa** | sai là sửa một mục |
| **Thấp** | sai cũng không ảnh hưởng bố cục |

Ở file này, giả định hay gặp: **màn đăng nhập có hay không** (Google Sheets qua service account → có; CSV cục bộ → không) và **dấu phân tách khi xuất CSV** (mặc định dấu chấm phẩy cho Excel bản Việt). Cả hai mức Vừa.

---

## Trước khi kết thúc bước 6

Bốn file phải nhất quán với nhau. Chỗ hay lệch nhất:

| Kiểm | Giữa file nào |
|---|---|
| Tên KPI | `specification.md` §5 ↔ `components.md` §2 |
| Chart nào có legend | `specification.md` ↔ `layout.md` §6 ↔ `components.md` §4 |
| Chiều cao vẽ đã trừ legend chưa | `layout.md` §5 ↔ loại chart ở `specification.md` |
| KPI được tô màu ↔ ngưỡng tương ứng | `specification.md` §9 ↔ `components.md` §2 |
| Số lựa chọn chỉ số = 4 | `specification.md` §6 ↔ `components.md` §6 |
| Thang `--series-*` ↔ màu chuỗi | `design.md` §3 ↔ `components.md` §4 |

Rà đầy đủ ở **bước 7** bằng `rules-checklist.md`.
