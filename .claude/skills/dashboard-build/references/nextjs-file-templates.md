# Next.js File Templates

Khung cho tầng dữ liệu và ba file khung app. Phần component xem `ui-components.md`.

Hệ thiết kế: **Monochrome Near-White**. Markup dựng theo cấu trúc `#viewport > #stage > (#side | #main > (#top, #body))`. Không còn lớp panel/glass nào — nếu thấy `--canvas`, `--glass-bg`, `backdrop-filter` ở đâu thì đó là bản cũ.

> Next.js bản này có breaking change so với dữ liệu huấn luyện. Trước khi dùng API của Next (route handler, metadata, font), đọc `node_modules/next/dist/docs/`.

---

## `lib/types.ts`

```typescript
export type Row = {
  date: string;            // ISO 'yyyy-mm-dd', GIỮ NGUYÊN chuỗi
  t: number;               // chỉ số ngày 0..n-1, tính khi parse
  channel: string;
  campaign: string;
  objective: string;
  spend: number;
  impressions: number;
  clicks: number;
  leads: number;
  qualified: number;
  conversions: number;
  revenue: number;
  budget: number;          // ATTRIBUTE — MAX, không SUM
};

export type PageId = 'home' | 'channel' | 'campaign' | 'source';
export type Grain  = 'day' | 'week' | 'month';
export type ParamKey = 'spend' | 'revenue' | 'conversions' | 'roas';

export type Filters = {
  param: ParamKey;
  preset: 7 | 30 | 90 | 180 | 'custom';
  from: number;            // chỉ số ngày, KHÔNG phải chuỗi
  to: number;
  channels: string[];
  campaigns: string[];
  objective: string;       // 'all' hoặc một giá trị
  losing: boolean;
};

export type Aggregate = {
  spend: number; revenue: number; impressions: number; clicks: number;
  leads: number; qualified: number; conversions: number;
  roas: number; cpl: number; cpa: number; ctr: number;
};
```

`t` — chỉ số ngày dạng số nguyên — là nguồn sự thật của khoảng thời gian. So sánh số nhanh hơn và không dính bẫy múi giờ như so sánh `Date`.

---

## `lib/google-sheets.ts`

```typescript
import 'server-only';
import { google } from 'googleapis';

const RANGE = 'campaign_daily!A:L';   // đổi theo spec

export async function fetchSheetValues(): Promise<string[][]> {
  const privateKey = (process.env.GOOGLE_PRIVATE_KEY ?? '').replace(/\\n/g, '\n');
  const email      = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ?? '';
  const sheetId    = process.env.GOOGLE_SHEETS_SPREADSHEET_ID ?? '';

  if (!privateKey || !email || !sheetId) {
    throw new Error(
      'Thiếu biến môi trường. Cần GOOGLE_SHEETS_SPREADSHEET_ID, ' +
      'GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY trong .env.local'
    );
  }

  const auth = new google.auth.JWT({
    email,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });

  const sheets = google.sheets({ version: 'v4', auth });
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: RANGE,
    valueRenderOption: 'UNFORMATTED_VALUE',
  });

  return (res.data.values ?? []) as string[][];
}
```

Scope là `spreadsheets.readonly` — dashboard chỉ đọc, không bao giờ ghi. Xin quyền ghi là mở ra rủi ro không cần thiết.

Kiểm tra biến môi trường **trước** khi gọi API, kèm thông báo nói rõ thiếu gì. Không có bước này thì lỗi hiện ra là `invalid_grant` — không ai đoán được nguyên nhân.

`import 'server-only'` ở dòng đầu là chốt an toàn: nếu có ai lỡ import file này vào một component `'use client'`, build **fail ngay** kèm thông báo rõ ràng. Không có nó thì private key lặng lẽ đi vào bundle client và không gì báo động cả. Cài bằng `npm i server-only` nếu chưa có.

Ba lỗi hay gặp khi chạy lần đầu:

| Thông báo | Nguyên nhân |
|---|---|
| `The caller does not have permission` | Chưa share Sheet cho `client_email` của service account — đây là lỗi **cấu hình**, không phải lỗi code |
| `Unable to parse range` | Sai tên tab; tên có dấu cách phải bọc nháy đơn: `'Dashboard Data'!A:L` |
| `DECODER routines::unsupported` | Thiếu `.replace(/\n/g, '
')` |

---

## `app/api/data/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { fetchSheetValues } from '@/lib/google-sheets';
import type { Row } from '@/lib/types';

export const revalidate = 900;        // cache 15 phút

export async function GET() {
  try {
    const values = await fetchSheetValues();
    if (values.length < 2) {
      return NextResponse.json(
        { error: 'Sheet rỗng hoặc chỉ có dòng tiêu đề.', rows: [], count: 0 },
        { status: 200 }
      );
    }

    const body = values.slice(1).filter(r => r[0]);          // bỏ dòng trống cuối
    const dates = [...new Set(body.map(r => String(r[0])))].sort();
    const index = new Map(dates.map((d, i) => [d, i]));      // ngày → chỉ số

    const rows: Row[] = body.map(r => ({
      date:        String(r[0]),
      t:           index.get(String(r[0])) ?? 0,
      channel:     String(r[1]),
      campaign:    String(r[2]),
      objective:   String(r[3]),
      spend:       Number(r[4])  || 0,
      impressions: Number(r[5])  || 0,
      clicks:      Number(r[6])  || 0,
      leads:       Number(r[7])  || 0,
      qualified:   Number(r[8])  || 0,
      conversions: Number(r[9])  || 0,
      revenue:     Number(r[10]) || 0,
      budget:      Number(r[11]) || 0,
    }));

    return NextResponse.json({ rows, count: rows.length, days: dates.length });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Lỗi không xác định';
    return NextResponse.json({ error: msg, rows: [], count: 0 }, { status: 500 });
  }
}
```

Bốn điểm cần nhớ:

1. **`Number()` cho mọi cột số.** Sheets trả chuỗi. `"5" + "3"` ra `"53"` mà không báo lỗi.
2. **`|| 0` sau `Number()`.** Ô trống cho `NaN`, và `NaN` lan ra mọi phép cộng phía sau.
3. **Chỉ số ngày tính ở server**, từ danh sách ngày duy nhất đã sắp xếp. Làm ở client thì mỗi component tính lại một kiểu.
4. **`filter(r => r[0])`** bỏ dòng trống — Google Sheets hay trả thêm vài dòng rỗng ở cuối.

Kiểm tra: mở `/api/data`, `count` phải khớp số dòng trong `schema.md`.

---

## `lib/aggregate.ts`

```typescript
import type { Row, Aggregate, Grain } from '@/lib/types';

const SUMMED = ['spend', 'revenue', 'impressions', 'clicks',
                'leads', 'qualified', 'conversions'] as const;

export function agg(rows: Row[]): Aggregate {
  const a = Object.fromEntries(SUMMED.map(k => [k, 0])) as Record<string, number>;
  for (const r of rows) for (const k of SUMMED) a[k] += r[k];

  return {
    ...a,
    roas: a.spend  ? a.revenue / a.spend            : 0,
    cpl:  a.leads  ? a.spend   / a.leads            : 0,
    cpa:  a.conversions ? a.spend / a.conversions   : 0,
    ctr:  a.impressions ? a.clicks / a.impressions  : 0,
  } as Aggregate;
}
```

**`budget` không có trong `SUMMED`.** Nó là ATTRIBUTE, lặp lại ở mọi dòng của cùng chiến dịch. Cộng lại sẽ ra con số gấp vài chục lần thực tế.

Muốn tổng ngân sách thì lấy `MAX` theo từng chiến dịch trước, rồi mới cộng:

```typescript
export function totalBudget(rows: Row[]): number {
  const byCampaign = new Map<string, number>();
  for (const r of rows) {
    byCampaign.set(r.campaign, Math.max(byCampaign.get(r.campaign) ?? 0, r.budget));
  }
  return [...byCampaign.values()].reduce((s, v) => s + v, 0);
}
```

### Nhóm theo dimension

```typescript
export function group(rows: Row[], key: 'channel' | 'campaign' | 'objective') {
  const m = new Map<string, Row[]>();
  for (const r of rows) {
    const k = r[key];
    (m.get(k) ?? m.set(k, []).get(k)!).push(r);
  }
  return [...m.entries()].map(([k, rs]) => ({ key: k, ...agg(rs) }));
}
```

Tỷ lệ được tính **lại từ tổng** trong `agg()`, không phải trung bình tỷ lệ từng dòng. Đây là chỗ dễ sai nhất và sai thì không có lỗi nào được ném ra.

### Gom theo kỳ

```typescript
export function byGrain(rows: Row[], grain: Grain) {
  const key = (r: Row) => {
    if (grain === 'day')   return r.date;
    if (grain === 'month') return r.date.slice(0, 7);          // 'yyyy-mm'
    const d = new Date(r.date);
    d.setDate(d.getDate() - ((d.getDay() + 6) % 7));           // về thứ hai
    return d.toISOString().slice(0, 10);
  };
  // …gom rồi agg từng nhóm
}
```

`(d.getDay() + 6) % 7` đưa về thứ hai đầu tuần theo chuẩn ISO. `getDay()` trả 0 cho Chủ nhật, nên `+6 % 7` biến Chủ nhật thành 6 — đúng là ngày thứ 7 của tuần theo cách đếm Việt Nam và ISO.

---

## `app/dashboard/page.tsx` — khung

Trang này **chỉ giữ state và bố cục**. Không JSX của chart, không toán tổng hợp.

```tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import { Shell } from '@/components/Shell';
import { Sidebar } from '@/components/Sidebar';
import { TopBar } from '@/components/TopBar';
import { GreetBar } from '@/components/GreetBar';
import { FilterDrawer } from '@/components/FilterDrawer';
import { ExportModal } from '@/components/ExportModal';
import { layout, SIDE_WIDE, SIDE_RAIL } from '@/lib/tokens';
import { applyFilters, DEFAULT_FILTERS } from '@/lib/aggregate';
import type { Row, Filters, Grain, PageId } from '@/lib/types';

type LoadState = 'loading' | 'error' | 'ready';

export default function DashboardPage() {
  const [rows,    setRows]    = useState<Row[]>([]);
  const [state,   setState]   = useState<LoadState>('loading');
  const [error,   setError]   = useState('');
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [page,    setPage]    = useState<PageId>('home');
  const [grain,   setGrain]   = useState<Grain>('week');
  const [rail,    setRail]    = useState(false);

  useEffect(() => { void load(); }, []);

  async function load(): Promise<void> {
    setState('loading');
    try {
      const res  = await fetch('/api/data');
      const json = (await res.json()) as { rows: Row[]; error?: string };
      if (json.error) throw new Error(json.error);
      setRows(json.rows);
      // mặc định 30 ngày CUỐI CÙNG TRONG DỮ LIỆU, không phải 30 ngày tính từ hôm nay
      const maxT = Math.max(...json.rows.map((r) => r.t));
      setFilters((f) => ({ ...f, from: Math.max(0, maxT - 29), to: maxT }));
      setState('ready');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Lỗi không xác định');
      setState('error');
    }
  }

  const filtered = useMemo(() => applyFilters(rows, filters), [rows, filters]);
  const L        = useMemo(() => layout(rail ? SIDE_RAIL : SIDE_WIDE), [rail]);

  return (
    <Shell>
      <Sidebar rail={rail} page={page} onPage={setPage}
               onToggleRail={() => setRail((v) => !v)} />

      <main id="main">
        <TopBar page={page} onToggleRail={() => setRail((v) => !v)} onRetry={load} />

        <div id="body" className={page === 'source' ? 'nokpi' : ''}>
          <GreetBar filters={filters} onFilters={setFilters} />

          {state === 'loading' && <div className="busy"><span className="spin" />Đang tải…</div>}
          {state === 'error'   && <ErrorState message={error} onRetry={load} />}

          {state === 'ready' && (
            filtered.length === 0
              ? <EmptyState />
              : <>
                  <div id="kpis">{/* 5 × KpiCard, bề rộng L.kpiW */}</div>
                  <div id="row2">{/* ChartCard L.a / L.b · chiều cao vẽ L.p2a.h, L.p2b.h */}</div>
                  <div id="row3">{/* ChartCard L.c / L.d · chiều cao vẽ L.p3c.h, L.p3d.h */}</div>
                </>
          )}
        </div>
      </main>

      <FilterDrawer filters={filters} onApply={setFilters} rows={rows} />
      <ExportModal filteredRows={filtered} allRows={rows} />
    </Shell>
  );
}
```

Năm điều bắt buộc ở file này:

1. **Khoảng ngày mặc định tính từ ngày lớn nhất trong dữ liệu**, không phải từ `new Date()`. Dữ liệu dạy có thể cũ vài tháng — lấy theo hôm nay thì dashboard mở ra trống trơn.
2. **`layout()` chỉ tính lại khi sidebar đổi trạng thái.** Nó không phụ thuộc cỡ cửa sổ — cỡ cửa sổ do `Shell` xử lý bằng `transform: scale()`.
3. **Trạng thái tải/lỗi/rỗng nằm TRONG `#body`**, không thay thế cả trang. Thay cả trang là mất sidebar và header, người dùng không còn chỗ bấm "Thử lại" hay nới bộ lọc.
4. **`#body.nokpi` cho trang Nguồn dữ liệu.** Chỉ ẩn `#kpis` mà không giãn hai hàng còn lại sẽ để lại dải trống 132px ở đáy.
5. **Drawer và modal là con của `Shell`**, tức nằm trong `#stage`. Đặt ra ngoài là lệch tỷ lệ so với dashboard.

Chiều cao bốn băng cộng lại đúng 900 — đó là lý do không băng nào được đặt `flex: 1` ở trạng thái thường:

```
46 + 20 + 52 + 14 + 118 + 14 + 301 + 14 + 301 + 20 = 900
hdr  pad  greet gap  kpi  gap  row2  gap  row3  pad
```

---

## `app/layout.tsx`

```tsx
import type { Metadata, ReactNode } from 'next';
import { Inter } from 'next/font/google';
import { IconSprite } from '@/components/Icon';
import './globals.css';

const inter = Inter({ subsets: ['latin', 'vietnamese'], display: 'swap' });

export const metadata: Metadata = { title: '…', description: '…' };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="vi" data-theme="light" className={inter.className}>
      <body>
        <IconSprite />
        {children}
      </body>
    </html>
  );
}
```

Bốn điểm:

1. **`subsets` phải có `'vietnamese'`.** Thiếu nó thì dấu tiếng Việt rơi về font dự phòng, chữ có dấu và không dấu trông khác hẳn nhau.
2. **`data-theme` trên `<html>`** là thứ CSS bám vào để đổi sáng/tối. Đổi bằng `document.documentElement.dataset.theme`. Đặt ở `<body>` thì `[data-theme="dark"]` trong `globals.css` không khớp.
3. **`<IconSprite />` nạp một lần ở đây**, trước `{children}`. Sprite phải có trong DOM trước khi bất kỳ `<use href="#i-…">` nào render, nếu không icon ra ô trống — không lỗi console.
4. **Không bọc thêm `<div>` nào quanh `{children}`.** `#viewport` dùng `position: fixed; inset: 0`, một lớp bọc thừa không làm hỏng nó nhưng làm cây DOM lệch khỏi cấu trúc trong tài liệu, và người đọc tài liệu sau này sẽ đi tìm nó.

`globals.css` đặt `html, body { height: 100%; overflow: hidden }` — trang không bao giờ cuộn. Đừng thêm `min-height: 100vh` ở đâu cả.

---

## `app/page.tsx` — trang giới thiệu

Ngắn: tên dashboard, một câu mô tả, nút vào `/dashboard`, và trạng thái kết nối dữ liệu.

Dùng **cùng `Shell`** với dashboard — cùng `#viewport` nền `--page`, cùng `#stage` bo `--r-shell` có `--sh-shell`. Cấu trúc bên trong `#stage` thì đơn giản hơn: không sidebar, không header.

```tsx
import Link from 'next/link';
import { Shell } from '@/components/Shell';
import { Icon } from '@/components/Icon';

export default function HomePage() {
  return (
    <Shell>
      <div style={{ margin: 'auto', display: 'flex', flexDirection: 'column',
                    alignItems: 'center', gap: 12, textAlign: 'center' }}>
        <Icon name="layout-dashboard" />
        <h1>{APP.name}</h1>
        <p>{APP.tagline}</p>
        <Link className="btn pri" href="/dashboard">
          Mở dashboard<Icon name="arrow-right" className="lu-sm" />
        </Link>
        <span className="chip">
          <Icon name="database" className="lu-xs" />{rowCount} dòng · cập nhật {updatedAt}
        </span>
      </div>
    </Shell>
  );
}
```

Hai luật:

- **Cùng shell, cùng token.** Trang giới thiệu tràn sát mép rồi dashboard lại có lề là một cú giật thị giác ngay lần bấm đầu tiên — người dùng đọc đó là "hai app khác nhau".
- **Một nút brand.** `Mở dashboard` là hành động chính; chip trạng thái dữ liệu là thông tin, không phải nút.
