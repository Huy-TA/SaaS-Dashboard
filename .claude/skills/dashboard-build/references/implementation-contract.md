# Implementation Contract

## Vị trí — hai chữ `app` lồng nhau

```text
Dashboard/                       ← gốc project
├── docs/                        ← TÀI LIỆU, ngoài app
│   ├── 1-spec/specification.md
│   └── 2-design/{design,layout,components}.md
└── app/                         ← GỐC NEXT.JS
    ├── .env.local
    ├── package.json
    ├── app/                     ← App Router
    ├── lib/
    └── components/
```

Mọi đường dẫn trong tài liệu này tính từ **`Dashboard/app/`**. Nên `app/globals.css` là `Dashboard/app/app/globals.css`, còn tài liệu thiết kế nằm ở `../docs/`.

Đây là chỗ dễ sai nhất khi bắt đầu: tạo nhầm `Dashboard/app/app/app/` hoặc đặt `.env.local` ở gốc project (Next.js sẽ không đọc thấy).

---

## Stack

| | |
|---|---|
| Framework | Next.js App Router. **Không** Pages Router |
| Ngôn ngữ | TypeScript. **Không** dùng `any` |
| Style | `app/globals.css` chép từ `assets/`. Tailwind chỉ cho tiện ích lặt vặt |
| Chart | Recharts, **kích thước px cứng** |
| Dữ liệu | Google Sheets API v4 qua Service Account |
| Deploy | Vercel |

Phiên bản tham chiếu: Next 16 · React 19 · Tailwind 4 · Recharts 3.

Hệ thiết kế: **Monochrome Near-White**. Stack không đổi so với bản trước — chỉ hệ thiết kế và số đo đổi.

> Next.js bản này có breaking change so với dữ liệu huấn luyện. Trước khi viết code liên quan tới API của Next, đọc `node_modules/next/dist/docs/` — đừng viết theo trí nhớ.

---

## Biến môi trường

Tên phải khớp chính xác:

```env
GOOGLE_SHEETS_SPREADSHEET_ID
GOOGLE_SERVICE_ACCOUNT_EMAIL
GOOGLE_PRIVATE_KEY
```

Luôn chuẩn hoá private key:

```typescript
const privateKey = (process.env.GOOGLE_PRIVATE_KEY ?? '').replace(/\\n/g, '\n');
```

Thiếu dòng này sẽ gặp `error:1E08010C:DECODER routines::unsupported` — thông báo không nhắc gì tới xuống dòng.

### Credential chỉ sống ở server

| Luật | Vì sao |
|---|---|
| **Không** đặt tiền tố `NEXT_PUBLIC_` cho ba biến trên | `NEXT_PUBLIC_*` được nhúng thẳng vào bundle gửi xuống trình duyệt. Private key sẽ nằm trong file JS mà ai cũng tải được |
| **Không** import `lib/google-sheets.ts` vào component `'use client'` | Import là đủ để Next kéo module đó vào bundle client, kể cả khi không gọi hàm nào |
| Client chỉ `fetch('/api/data')` | Route handler chạy trên server, trả về **dữ liệu đã tổng hợp**, không trả khoá |

Cách kiểm sau khi build: DevTools → Network, xem response của `/api/data`; và tìm chuỗi `BEGIN PRIVATE KEY` trong source bundle — phải không có kết quả nào.

---

## Danh sách file cố định

Đây là **danh sách đóng**. Không thêm file ngoài danh sách, không gộp file trong danh sách.

```text
app/
  globals.css              chép nguyên văn từ assets/globals.css
  layout.tsx               <html data-theme> + nạp font Inter
  page.tsx                 trang giới thiệu, có nút vào /dashboard
  dashboard/page.tsx       state + bố cục, KHÔNG chứa JSX của chart
  api/data/route.ts        đọc Google Sheet, trả JSON

lib/
  tokens.ts                chép nguyên văn từ assets/tokens.ts
  icons.ts                 chép nguyên văn từ assets/icons.ts
  types.ts                 Row, Filters, Aggregate, PageId
  google-sheets.ts         gọi Sheets API
  aggregate.ts             agg / group / byGrain / alerts

components/
  Shell.tsx                #viewport + #stage, hàm fit
  Sidebar.tsx
  TopBar.tsx
  GreetBar.tsx
  KpiCard.tsx
  ChartCard.tsx
  Legend.tsx
  FilterDrawer.tsx
  ExportModal.tsx
  Icon.tsx                 sprite nhung san <symbol> + <use>
  charts/
    DonutChart.tsx  TrendAreaChart.tsx  MultiLineChart.tsx
    RankBarChart.tsx  SparkLine.tsx  MatrixTable.tsx
```

Danh sách này phải khớp **từng dòng** với mục Output Contract trong `../SKILL.md`. Lệch nhau thì `SKILL.md` đúng — báo lại chỗ lệch, đừng tự chọn một bên.

### Hai file mới so với bản trước

| File | Vì sao tách riêng |
|---|---|
| `components/Shell.tsx` | `#viewport` + `#stage` + hàm fit là **một cơ chế**, không phải một phần của trang dashboard. Trang giới thiệu dùng chung khung đó. Để trong `dashboard/page.tsx` thì `app/page.tsx` phải chép lại — hai bản sẽ trôi khỏi nhau |
| `components/Icon.tsx` | Sprite nạp **một lần** ở gốc cây (33 hình lấy từ `assets/icons.ts`), mọi chỗ dùng chỉ `<use href="#...">`. Nhúng `<svg>` rời tại từng chỗ là 33 bản path lặp lại, và chỉ cần một bản gõ lệch là hỏng im lặng |

`references/recharts-patterns.md` **đã đổi tên** thành `references/chart-patterns.md`; file cũ đã xoá. Tài liệu hay code nào còn trỏ tên cũ là bản cũ.

### Vì sao chia file thay vì dồn một chỗ

Prototype khoảng 1.200 dòng. Chuyển sang React + Recharts sẽ thành ~1.800 dòng — một file như vậy thì người học không debug nổi.

Nhưng "cứ tách khi thấy cần" lại làm mỗi lần chạy ra một cấu trúc khác. Nên danh sách này là **cố định và đóng**: vẫn cho kết quả giống nhau mọi lần, mà vẫn đọc được.

### Không tạo
- File nào ngoài danh sách trên
- `app/dashboard/layout.tsx`
- Route riêng cho từng tab — đổi tab bằng `useState`
- React Context — truyền props xuống là đủ ở quy mô này
- Bất cứ thứ gì dưới `skills/`

---

## Khung app — `#viewport` bọc `#stage`

Dashboard **không tràn sát mép màn hình**. Hai lớp, mỗi lớp đúng một việc:

| Lớp | Nền | Việc |
|---|---|---|
| `#viewport` | `--page` | mặt bàn phủ kín cửa sổ; sinh lề quanh shell bằng `scale` |
| `#stage` | `--shell` | tấm 1600×900, bo `--r-shell`, đổ bóng `--sh-shell` |

```css
#viewport { position: fixed; inset: 0; background: var(--page);
            display: grid; place-items: center; scale: .94 }
#stage    { width: 1600px; height: 900px; transform-origin: center center;
            background: var(--shell); border-radius: var(--r-shell);
            box-shadow: var(--sh-shell); overflow: hidden; display: flex }
```

Dashboard chạm mép màn hình là dấu hiệu làm sai — không phải chuyện thẩm mỹ: shell không nổi thì `--page` không xuất hiện ở đâu cả, và cả hệ ba sắc độ nền mất một bậc.

### Lề sinh bằng `scale`, KHÔNG phải `transform`

Lý do rất cụ thể, không phải sở thích:

Hàm fit gán `transform: scale(...)` vào **style inline** của `#stage`. Style inline thắng mọi khai báo trong stylesheet. Nếu lề cũng viết bằng `transform`, một trong hai bị đè — và cái bị đè luôn là cái trong CSS.

`scale` là **thuộc tính rời** (independent transform property), không phải viết tắt của `transform`. Trình duyệt **nhân** nó với `transform` thay vì thay thế. Hai phép co giãn cùng tồn tại.

```css
#viewport { scale: .94 }              /* đúng — nhân với transform inline */
#viewport { transform: scale(.94) }   /* sai — bị style inline của #stage đè */
```

So với `padding` cố định: lề bằng `scale` co theo cửa sổ nên **không bao giờ âm**. Padding 40px trên cửa sổ cao 600px thì shell bị bóp.

**Cách kiểm:** thử ở **hai tỉ lệ** cửa sổ, không chỉ 16:9 — 1600×900 **và** 1400×1000. Lề phải còn đủ bốn phía ở cả hai. Nếu chỉ kiểm ở đúng tỉ lệ 16:9 thì lỗi `transform` bị đè vẫn trông đúng, vì hệ số fit khi đó bằng 1.

### Cây DOM

```text
#viewport                     nền --page, scale: .94
└─ #stage                     nền --shell, transform: scale() gán inline
   ├─ #side                   206px mở · 58px thu gọn · hairline 1px bên phải
   └─ #main
      ├─ #top                 46px
      └─ #body                nền --page, padding 20px dọc / 24px ngang
         ├─ #greet            52px
         ├─ #kpis             118px
         ├─ #row2             301px
         └─ #row3             301px
```

`#body` dùng `--page` chứ không `--shell`: ở light theme `--shell` và `--card` cùng là `#FFFFFF`, card trắng trên nền trắng thì mất mép.

Drawer, modal và scrim nằm **bên trong `#stage`**. Đặt ra ngoài thì chúng không co giãn cùng dashboard, và lệch tỷ lệ ngay ở cửa sổ đầu tiên không phải 1600×900.

Số đo đầy đủ ở `layout-and-verification.md`; nguồn là `assets/tokens.ts`.

---

## Luồng dữ liệu

```
Google Sheet
   └─ lib/google-sheets.ts      đọc range, trả string[][]
        └─ app/api/data/route.ts     parse thành Row[], trả JSON
             └─ app/dashboard/page.tsx    fetch một lần, giữ trong useState
                  └─ useMemo filteredRows       lọc phía client
                       └─ lib/aggregate.ts           tổng hợp
                            └─ components/*               vẽ
```

Fetch **một lần** khi mount. Mọi thao tác lọc chạy trên mảng đã có trong bộ nhớ, không gọi lại API.

1.613 dòng × 12 cột nằm gọn trong RAM. Gọi API mỗi lần đổi bộ lọc là vừa chậm vừa tốn quota.

---

## Ép kiểu — nơi hay sai nhất

Google Sheets API trả về **mảng chuỗi**. Ép kiểu ngay ở tầng route, không đẩy xuống component:

```typescript
// app/api/data/route.ts
const rows: Row[] = values.slice(1).map((r) => ({
  date:       r[0],                    // giữ nguyên chuỗi 'yyyy-mm-dd'
  channel:    r[1],
  campaign:   r[2],
  objective:  r[3],
  spend:      Number(r[4])  || 0,
  impressions:Number(r[5])  || 0,
  clicks:     Number(r[6])  || 0,
  leads:      Number(r[7])  || 0,
  qualified:  Number(r[8])  || 0,
  conversions:Number(r[9])  || 0,
  revenue:    Number(r[10]) || 0,
  budget:     Number(r[11]) || 0,      // ATTRIBUTE — MAX, không SUM
}));
```

Ba điều bắt buộc:

1. **`Number()` cho mọi cột số.** `"5" + "3"` ra `"53"`, không phải `8`, và không có lỗi nào được ném ra.
2. **Giữ `date` dưới dạng chuỗi ISO.** Chuyển sang `Date` khi cần so sánh. `new Date('05/02/2026')` trong JavaScript hiểu là ngày 2 tháng 5 — lệch 3 tháng, im lặng.
3. **`|| 0` sau `Number()`.** Ô trống cho `NaN`, và `NaN` lan ra toàn bộ phép cộng phía sau.

---

## Quy tắc lọc

- Mọi thao tác lọc chạy client-side trên `filteredRows` từ `useMemo`.
- Mặc định là **30 ngày gần nhất**, tính từ ngày lớn nhất trong dữ liệu — không phải từ `new Date()`. Dữ liệu có thể cũ.
- Nguồn sự thật của khoảng ngày là **chỉ số ngày** (số nguyên `0..n-1`), không phải chuỗi ngày. Preset chỉ là nhãn.
- Sửa trong drawer là **nháp**. Chỉ ghi vào state thật khi bấm `Áp dụng`.
- Chỉ số đang chọn (parameter) nằm **trong bộ lọc**, đi chung đường `Áp dụng` với các điều kiện khác.

---

## Khi trình bày code cho người dùng

Mỗi khối code ghi **đường dẫn đích ở dòng đầu**:

```
app/dashboard/page.tsx
```

Người học cần biết dán vào đâu trước khi cần biết dán cái gì.
