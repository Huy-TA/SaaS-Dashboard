---
name: dashboard-build
description: Build a Next.js App Router TypeScript monitoring dashboard from the four design documents produced by dashboard-design, using the Monochrome Near-White design assets, fixed pixel chart sizes, and Google Sheets API v4. Use when the user has design documentation in docs/1-spec and docs/2-design, or asks to implement the dashboard app with sidebar, KPI cards, charts, filter drawer, and two-step data export.
---

# Dashboard Build

## Purpose
Dựng dashboard hoàn chỉnh từ bộ tài liệu do `dashboard-design` sinh ra.

Skill này **chỉ triển khai**. Hướng thiết kế, token, KPI, bố cục chart đã nằm trong tài liệu.

## Vị trí — đọc trước, sai chỗ này là sai hết

```text
Dashboard/                       ← gốc project
├── CLAUDE.md
├── MEMORY.md
├── .claude/skills/
├── docs/                        ← TÀI LIỆU, nằm NGOÀI app
│   ├── 1-spec/specification.md
│   └── 2-design/{design,layout,components}.md
└── app/                         ← GỐC NEXT.JS
    ├── .env.local               ← credential Google Sheets
    ├── package.json
    ├── next.config.ts
    ├── app/                     ← App Router
    ├── lib/
    └── components/
```

Hai chữ `app` lồng nhau. Mọi đường dẫn trong skill này tính từ **`Dashboard/app/`** (gốc Next.js), nên `app/globals.css` nghĩa là `Dashboard/app/app/globals.css`.

`docs/` ở cấp trên, tham chiếu bằng `../docs/`. Next.js không bao giờ đọc tới đó.

Môi trường đã được dựng sẵn ở bước trước: TypeScript · Tailwind · App Router · không dùng `src/` · đã cài `googleapis` `recharts` `next-auth` · `.env.local` đã có ba biến và đã nằm trong `.gitignore`.

**Không chạy `create-next-app`. Không `npm install` thêm gì** trừ khi tài liệu yêu cầu rõ.

## Inputs — bốn file, đọc đủ cả bốn trước khi gõ dòng code đầu tiên

```text
../docs/1-spec/specification.md      ← xây cái gì, KPI nào, ngưỡng bao nhiêu
../docs/2-design/design.md           ← design system nào, token gì
../docs/2-design/layout.md           ← số đo px từng trang
../docs/2-design/components.md       ← component nào, trạng thái nào
```

Mỗi tài liệu có mục **"Giả định cần bạn xác nhận"**. Đọc kỹ mục đó: nó cho biết chỗ nào trong thiết kế là suy ra chứ không phải chốt, tức chỗ dễ phải sửa lại nhất.

Thiếu file nào thì **dừng và báo**, đừng tự suy nội dung còn thiếu.

Tài liệu **mâu thuẫn với nhau** hoặc thiếu thông tin để implement thì cũng **dừng và hỏi** — đừng chọn bừa một bên rồi đi tiếp.

## Nguyên tắc số một — CHÉP, ĐỪNG DIỄN GIẢI

Thư mục `assets/` chứa bản đã được duyệt của phần khó nhất:

| File | Chép vào | Được sửa? |
|---|---|---|
| `assets/globals.css` | `app/globals.css` | **Không.** Từng con số px là hợp đồng bố cục |
| `assets/tokens.ts` | `lib/tokens.ts` | Chỉ sửa `THRESHOLD` cho khớp specification |
| `assets/icons.ts` | `lib/icons.ts` | **Không.** 33 path icon, sai một ký tự là hỏng im lặng |

Chép nguyên văn. Không "tối ưu", không đổi tên biến, không gộp token, không đổi hex, không chuyển sang Tailwind class.

`globals.css` có **619 dòng, 114 class** — đủ cả checkbox, radio, switch, tooltip, ô ngày, nội thất drawer, bảng xuất, màn đăng nhập, overlay scrollbar. Nếu thấy thiếu CSS cho một component nào đó, **tìm lại trong file trước khi tự viết**; gần như chắc chắn nó đã có.

Lý do: mọi con số trong hai file này đã được kiểm chứng trên bản chuẩn `_base.html`. Viết lại theo cách hiểu của mình là cách chắc chắn nhất để ra một dashboard trông "gần giống" — tức là sai.

Nếu tài liệu và `assets/` mâu thuẫn, **`assets/` đúng**. Báo lại chỗ mâu thuẫn.

### Khối bí danh tương thích — đừng dọn dẹp

Trong `:root` có một khối ánh xạ `--label`, `--fill4`, `--blue`, `--gray`… về token hệ mới. Nó **trông như** code thừa của hệ cũ. Không phải.

Lớp vẽ chart đọc màu qua những tên đó. Xoá khối này là `getComputedStyle` trả chuỗi rỗng, chart vẫn vẽ nhưng không màu — hỏng im lặng, không có lỗi nào trong console.

## Workflow
1. Đọc đủ bốn tài liệu trong `../docs/`, kể cả mục giả định.
2. Đọc `references/implementation-contract.md` — stack, biến môi trường, danh sách file.
3. Chép `assets/globals.css` → `app/globals.css`, `assets/tokens.ts` → `lib/tokens.ts`, `assets/icons.ts` → `lib/icons.ts`.
4. Cập nhật `THRESHOLD` trong `lib/tokens.ts` cho khớp mục "Ngưỡng nghiệp vụ" của specification.
5. Dựng tầng dữ liệu theo `references/nextjs-file-templates.md` — đọc Sheet qua Service Account, **chỉ ở phía server**.
6. Dựng component theo `references/ui-components.md`.
7. Dựng chart theo `references/chart-patterns.md` — đọc kỹ **Ba điều cấm** và **Hai chart phải viết SVG tay**.
8. Chạy dev server và làm hết `references/layout-and-verification.md` trước khi báo xong.

## Output Contract

Danh sách file **cố định**, tính từ `Dashboard/app/`. Không thêm file ngoài danh sách, không bớt file trong danh sách.

```text
app/globals.css                    ← chép từ assets/
app/layout.tsx
app/page.tsx                       ← trang giới thiệu
app/dashboard/page.tsx             ← chỉ giữ state + bố cục
app/api/data/route.ts              ← nơi DUY NHẤT chạm credential

lib/tokens.ts                      ← chép từ assets/
lib/google-sheets.ts
lib/aggregate.ts                   ← toàn bộ toán tổng hợp
lib/types.ts

components/Shell.tsx               ← #viewport + #stage, shell nổi trên mặt bàn
components/Sidebar.tsx
components/TopBar.tsx
components/GreetBar.tsx
components/KpiCard.tsx
components/ChartCard.tsx
components/Legend.tsx
components/FilterDrawer.tsx
components/ExportModal.tsx
components/Icon.tsx                ← sprite nhúng sẵn (assets/icons.ts)

components/charts/DonutChart.tsx
components/charts/TrendAreaChart.tsx
components/charts/MultiLineChart.tsx
components/charts/RankBarChart.tsx
components/charts/SparkLine.tsx    ← SVG tay, không Recharts
components/charts/MatrixTable.tsx  ← HTML tay, không Recharts
```

Khi báo hoàn thành, nêu: file đã đổi, URL local, và kết quả từng mục trong checklist kiểm tra.

## Core Constraints

### Stack
Next.js App Router · TypeScript (không `any`) · Tailwind CSS v4 · Recharts · Google Sheets API v4 qua Service Account · deploy Vercel.

Không dùng: Pages Router, Chart.js, D3, React Context, biến môi trường hardcode, `http://localhost:3000` hardcode, emoji trong giao diện.

### Credential chỉ sống ở server

`GOOGLE_PRIVATE_KEY` và `GOOGLE_SERVICE_ACCOUNT_EMAIL` **chỉ** được đọc trong `app/api/data/route.ts` và `lib/google-sheets.ts`.

- Không bao giờ đặt tiền tố `NEXT_PUBLIC_` cho ba biến này.
- Không import `lib/google-sheets.ts` vào bất kỳ component `'use client'` nào.
- Client gọi `fetch('/api/data')`, nhận về dữ liệu đã tổng hợp — không nhận khoá.

Private key trong `.env.local` là chuỗi một dòng với `\n` là hai ký tự. Thư viện cần xuống dòng thật:

```ts
key: process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, '\n')
```

Thiếu `.replace()` là lỗi `error:1E08010C:DECODER routines::unsupported` — thông báo không nhắc gì tới xuống dòng.

### Hai chart Recharts không vẽ được

Đây là giới hạn thật, biết trước thì đỡ mất buổi:

| Chart | Vì sao Recharts không làm được | Làm gì |
|---|---|---|
| **Sparkline có đường chuẩn** | Cần một đường tham chiếu ngang ở giá trị ngưỡng, vẽ trong hộp 30px không trục, không lề. `ReferenceLine` kéo theo cả hệ trục và lề mặc định | Viết `<svg>` tay, ~25 dòng |
| **Bảng ma trận tô nhiệt** | Không phải chart mà là bảng HTML có nền ô pha theo giá trị | Viết `<table>` tay, nền ô pha 5%..29% mực |

Bốn chart còn lại (donut, area, line nhiều đường, bar xếp hạng) dùng Recharts bình thường, nhưng **luôn truyền `width`/`height` là số px cứng**.

### Kích thước — không thương lượng
- Mọi chart nhận `width` và `height` là **số px cứng** từ `layout()` trong `lib/tokens.ts`.
- **Cấm `ResponsiveContainer`.** Cấm đọc `clientWidth`. Cấm `ResizeObserver`.
- Canvas 1600×900 + `transform: scale(min(vw/1600, vh/900))`.
- Không có breakpoint. Không cuộn trang. Bảng và danh sách dài cuộn **bên trong khối của nó**.
- Card có legend phải **trừ 24 hoặc 44** khỏi chiều cao chart.

### Shell phải nổi trên mặt bàn
Dashboard **không tràn sát mép màn hình**. `#viewport` mang nền `--page`, `#stage` là tấm bo `--r-shell` có `--sh-shell` nổi lên trên.

Lề sinh bằng `scale` (thuộc tính rời) trên `#viewport`, **không phải** `transform` — vì `transform` sẽ bị đè bởi `transform:scale()` mà hàm fit gán inline vào `#stage`.

### Ba điều cấm khi vẽ chart
1. **Cấm `Math.max(1, ...values)`** để tìm giá trị lớn nhất. Chỉ số tỷ lệ (0,0121) bị ép max = 1 → thanh dài nhất teo còn 10px, không báo lỗi. Dùng `maxOf()` trong `lib/tokens.ts`.
2. **Cấm `Math.max(...v) || 1`.** Mảng rỗng cho `-Infinity`, mà `-Infinity` là truthy nên `||` không cứu được.
3. **Cấm tô màu chuỗi dữ liệu bằng `--brand`, `--ok`, `--warn`, `--bad`.** Dùng `seriesColor()`.

Điều 3 **không có ngoại lệ**. Mọi dimension — kênh, chiến dịch, sản phẩm — đều đi qua `seriesColor()` và lấy thang `--series-*`. Không có bảng màu thương hiệu trong dự án này.

### Icon
Bộ **33 icon đã nhúng sẵn** trong skill: `assets/icons.ts`. Chép nguyên file đó vào `lib/icons.ts`; `components/Icon.tsx` chỉ nạp sprite một lần rồi gọi `<use>`. Không cài package, không tải gì.

**Không vẽ lại path theo trí nhớ** — lỗi này đã xảy ra: 5/14 icon viết tay sai so với bản gốc, sai kiểu không nhận ra bằng mắt (`m21 21-4.3-4.3` thay vì `-4.34-4.34`). Cần icon chưa có trong sprite thì thay bằng icon đã có, hoặc dùng chữ.

Không dùng emoji làm icon.

### Trạng thái runtime
Bắt buộc có: đang tải · lỗi kèm nút thử lại · có dữ liệu · **không có dòng nào khớp bộ lọc**.

Trạng thái thứ tư hay bị quên. Lọc chặt tay là chart trắng trơn không kèm lời giải thích.

### Kiểm tra trước khi báo xong
Phải chạy dev server thật và đối chiếu **số liệu tham chiếu** trong specification. Số không khớp thì lỗi ở khâu đọc hoặc tổng hợp dữ liệu — sửa ở đó, đừng chỉnh chart.

Kiểm cả bốn trạng thái: sáng · tối · sidebar thu gọn · trang Nguồn dữ liệu.

Và kiểm **không có credential nào lọt ra client**: mở DevTools → Network, xem response của `/api/data`; xem source bundle không chứa `BEGIN PRIVATE KEY`.

## Đổi design system sau khi đã build

Học viên có thể đổi sang Linear, Geist, Stripe, Raycast, Radix hoặc Apple HIG. Quy trình:

1. Ghi quyết định vào `../docs/2-design/design.md` **trước** — tài liệu là nguồn sự thật, code là hệ quả.
2. Thay khối `:root` + `[data-theme="dark"]` trong `app/globals.css`.
3. **Giữ nguyên** khối bí danh tương thích.
4. Không đụng `lib/tokens.ts` — kích thước không đổi theo design system.

Kiểm lại sau khi đổi: bốn trạng thái không lỗi console, mọi chữ đạt 4,5:1 kể cả nhãn trục 10.5px.
