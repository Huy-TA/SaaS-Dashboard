---
name: dashboard-design
description: Read a real dataset (Google Sheets tab or CSV), analyze its schema, and produce four design documents in one pass — specification.md, design.md, layout.md, components.md — in the Monochrome Near-White analytics design system. Use when the user asks to design a dashboard, turn spreadsheet columns into KPI/page/chart requirements, or produce design documentation for a downstream dashboard builder.
---

# Dashboard Design

## Purpose
Đọc dataset thật, phân tích schema, rồi viết **bốn tài liệu thiết kế** cho dashboard theo dõi, theo hệ **Monochrome Near-White Analytics Design System**.

Skill này **chỉ thiết kế**. Không viết code, không tạo app. Dùng `dashboard-build` sau khi tài liệu được chốt.

## Nguyên tắc số một — CHẠY MỘT LƯỢT, GHI RA MỌI GIẢ ĐỊNH

Skill này **không phỏng vấn**. Đọc dataset, tự quyết, viết đủ bốn file trong một lượt.

Đổi lại, **mọi chỗ tự quyết phải ghi ra**. Mỗi tài liệu kết thúc bằng mục `## Giả định cần bạn xác nhận`, đánh số, mỗi dòng một giả định kèm:

```
G3. Chọn `channel` làm PRIMARY_DIM (5 giá trị) thay vì `campaign` (12 giá trị).
    Vì: trục phân tích chính nên có 3–8 nhóm để donut đọc được.
    Nếu sai: đổi ở specification.md §4, rồi chạy lại layout.md §2.
```

Ba phần đó là bắt buộc: **quyết định gì · vì sao · sửa ở đâu nếu sai**. Học viên sẽ review ở bước sau; giả định không ghi ra là giả định không ai kiểm được.

**Chỉ dừng lại hỏi khi thiếu thứ không suy ra được**: không kết nối được dataset, sheet rỗng, hoặc không có cột thời gian nào. Lúc đó hỏi đúng một câu rồi dừng — đừng đoán bừa.

## Inputs

Skill tự đọc dataset. Ba nguồn, theo thứ tự ưu tiên:

| Nguồn | Cách đọc |
|---|---|
| Google Sheets | `.env.local` ở gốc Next.js — `GOOGLE_SHEETS_SPREADSHEET_ID`, `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY`; tên tab do người dùng nêu |
| CSV | đường dẫn người dùng đưa |
| Chỉ có danh sách cột | người dùng dán vào chat |

Cần **header row + ít nhất 5 dòng sample**. Chỉ có tên cột thì vẫn chạy được, nhưng ghi vào giả định rằng chưa thấy giá trị thật.

Đọc chi tiết cách kết nối ở `references/data-access.md`.

## Workflow

Đọc `references/workflow.md` để biết chi tiết. Bảy bước, chạy liền mạch trong một lượt:

| Bước | Làm gì | Ra file |
|---|---|---|
| 1 | Đọc dataset; suy ra mục tiêu, người dùng, câu hỏi nghiệp vụ | |
| 2 | Gán vai trò từng cột; chốt chỉ số phái sinh và 4 ngưỡng | |
| 3 | Chốt 4 trang, 5 KPI, 4 chart mỗi trang | `docs/1-spec/specification.md` |
| 4 | Chốt hệ thiết kế, màu, chữ, nguyên tắc tương tác | `docs/2-design/design.md` |
| 5 | Chốt bố cục từng trang kèm số đo px | `docs/2-design/layout.md` |
| 6 | Chốt danh mục component, trạng thái, quy tắc dùng | `docs/2-design/components.md` |
| 7 | Rà chéo bốn file, gom mọi giả định lên đầu báo cáo | |

Các tài liệu tham chiếu, đọc đúng lúc cần:

- `references/data-access.md` — bước 1, cách đọc Google Sheets / CSV.
- `references/workflow.md` — bảy bước, cách suy ra từng quyết định.
- `references/domain-playbooks.md` — bước 1–2, phân loại domain.
- `references/design-system.md` — **trước khi** viết `design.md`. Token, luật màu, bí danh tương thích.
- `references/layout-contract.md` — **trước khi** viết `layout.md`. Số đo thật, đã kiểm chứng.
- `references/component-catalog.md` — **trước khi** viết `components.md`.
- `references/spec-output-template.md` — cấu trúc bốn file.
- `references/rules-checklist.md` — bước 7.
- `assets/icon-sprite.html` — 33 icon đã nhúng sẵn, dán nguyên vào prototype. Không cần tải gì.

## Output Contract

Bốn file, đúng đường dẫn này, tính từ gốc project `Dashboard/`:

```text
docs/
├── 1-spec/
│   └── specification.md      ← xây cái gì, cho ai, đo bằng chỉ số nào
└── 2-design/
    ├── design.md             ← thiết kế theo nguyên tắc nào
    ├── layout.md             ← bố cục ra sao, số đo px
    └── components.md         ← dùng những component nào
```

`docs/` nằm **ngoài** `app/`. Next.js không bao giờ đọc tới đây.

Ghi thẳng cả bốn file, không in ra chat trước — bốn file đầy đủ dài hơn một màn hình nhiều lần, in ra chỉ làm khó đọc. Kết thúc bằng một báo cáo ngắn:

```
✓ docs/1-spec/specification.md      (N dòng)
✓ docs/2-design/design.md           (N dòng)
✓ docs/2-design/layout.md           (N dòng)
✓ docs/2-design/components.md       (N dòng)

Đã đọc: <nguồn dữ liệu>, <số cột> cột, <số dòng> dòng sample

Giả định cần bạn xác nhận — <số lượng>, gom theo mức rủi ro:
  Cao   G1 …   (sai là phải dựng lại spec)
  Vừa   G4 …   (sai là sửa một mục)
  Thấp  G9 …   (sai cũng không ảnh hưởng bố cục)
```

**Không tự chuyển sang `dashboard-build`.** Người dùng phải review và chốt tài liệu trước.

## Core Constraints

### Cấu trúc — không thương lượng
- Đúng **4 trang**: Tổng quan · Theo dimension 1 · Theo dimension 2 · Nguồn dữ liệu.
- Đúng **5 thẻ KPI**, mỗi thẻ có sparkline và một đường chuẩn gạch ngang.
- Đúng **4 chart mỗi trang theo dõi**, chia `30/70` (Row 2) và `40/60` (Row 3).
- Đúng **4 lựa chọn chỉ số** (parameter), đặt **trong drawer bộ lọc**, không phải trên màn hình chính.
- Row 2 và Row 3 **cao bằng nhau** (301px) ⇒ 4 chart cùng chiều cao vẽ.

### Bố cục
- Canvas cố định **1600×900** + `transform: scale()`. Không breakpoint, không cuộn trang.
- Toàn bộ dashboard nằm trong **một shell bo góc nổi trên mặt bàn** — không tràn sát mép màn hình.
- Mọi kích thước chart là **px cứng** suy ra từ một biến duy nhất (bề rộng sidebar).

Số đo đầy đủ ở `references/layout-contract.md`. Không tự nghĩ số mới.

### Màu
- `--brand` **chỉ** cho phần tử tương tác. Không bao giờ làm màu chuỗi dữ liệu.
- `--ok` / `--warn` / `--bad` **chỉ** mang nghĩa ngưỡng. Không bao giờ làm màu chuỗi dữ liệu.
- Chuỗi dữ liệu dùng thang **5 bậc mực** + `--focus` cho hạng 1.
- **Không có ngoại lệ.** Mọi dimension — kênh, chiến dịch, sản phẩm — đi chung thang mực. `--focus` không được trùng bậc `--series-2..5` nào.

### Legend
- Chỉ pie/donut và line nhiều đường mới có legend. Bar, area một chuỗi, bảng thì không.
- Legend nằm **trên chart, căn trái**, và **chỉ hiện màu ↔ tên nhóm**, không kèm số liệu.
- Chiều cao legend (24px một hàng / 44px hai hàng) phải **trừ khỏi chiều cao chart**.

### Chức năng bắt buộc
- Drawer bộ lọc trượt từ phải, làm mờ nền phía sau, **ẩn hoàn toàn khi đóng**. Chứa đúng sáu nhóm: khoảng ngày (có preset) · chọn dimension 1 · chọn dimension 2 · chọn chỉ số · xoá lọc · áp dụng.
- Xuất dữ liệu **hai bước**: mở bảng chọn → xem trước số dòng → mới tải.
- Thanh chào hiển thị ngày và lời chào theo **giờ Việt Nam (UTC+7)**, không theo giờ máy.
- Chuyển sáng/tối, và cả hai chế độ đều phải kiểm tra.

### Không làm
- Không thêm trang phân tích (phễu chuyển đổi, ma trận thời gian) — đây là dashboard **theo dõi**, không phải công cụ phân tích sâu.
- Không thêm chatbox AI.
- Không thêm ô tìm kiếm toàn cục.
- Không xuất PNG hay PDF — xuất dữ liệu chỉ là xuất dữ liệu.
- Không emoji trong giao diện. Icon lấy từ `assets/icon-sprite.html` đã nhúng sẵn trong skill.
- Không viết code trong skill này.
