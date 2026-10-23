# UI Components

Trước khi tạo class mới, tìm trong `app/globals.css` — gần như chắc chắn đã có. Không dùng Tailwind để dựng lại thứ đã có class.

`assets/globals.css` định nghĩa **40 selector class** cộng 9 id khung (`#viewport #stage #side #main #top #body #greet #kpis #row2 #row3` và `#scrim #drawer #modal`). Đó là tập đóng cho phần có sẵn:

```text
.card .card.kpi .chead .ctitle .plot
.kpi .kl .kl.dot .kv .ks .ks.up .ks.del .kspark .knote
.nav .nav.on .btn .btn.pri .btn.ghost .btn.icon
.seg .chip .chip.on .bdg .bdg.ok .bdg.warn .bdg.bad
.inp .heat .lgd .lgd.two .pop .dlist .sheet
.busy .err .empty .spin .lu .lu-sm .lu-xs
```

**Chỗ còn thiếu — cần quyết trước khi code.** Danh mục ở `dashboard-design/references/component-catalog.md` nói bản chuẩn có 113 class, và nó liệt kê những thứ `globals.css` **không** có: `.tip` `.cbx` `.box` `.rad` `.sw` `.dates` `.led`, cùng vài class trình bày nhỏ trong sidebar / header / greet bar (tên thương hiệu, chức danh, tiêu đề trang, dòng ngày).

Hai cách xử lý, chọn một và ghi lại:

1. **Không có class thì không có component.** Bỏ tooltip, switch, radio; dùng `.chip` và `.inp` thay thế. Đây là mặc định — `SKILL.md` nói `assets/` đúng khi tài liệu mâu thuẫn.
2. Dùng `style` inline cho vài dòng chữ phụ trong Sidebar/TopBar/GreetBar (chúng chỉ là cỡ chữ và màu mực), **không** thêm class mới vào `globals.css`.

Đừng tự viết thêm block CSS vào `globals.css` — nó là file chép nguyên văn, sửa nó là phá cam kết "mọi máy ra cùng một kết quả".

---

## Năm luật của hệ Monochrome Near-White

Năm điều này khác hệ cũ nhiều nhất, và là chỗ dễ trượt về thói quen cũ nhất:

| Luật | Vì sao |
|---|---|
| Mục nav đang chọn tô `--sub2` + chữ `--ink`, **không** tô brand | Brand để dành cho **hành động**. Tô brand vào vị trí hiện tại là tiêu một tín hiệu mạnh cho một thông tin người dùng đã biết |
| Một màn hình chỉ có **một** nút brand | Hai nút xanh nghĩa là chưa quyết được đâu là hành động chính — đẩy quyết định đó sang người dùng |
| Badge trạng thái chỉ dùng khi có **một số so với một ngưỡng** | `--ok/--warn/--bad` là phán xét. Dán lên thứ không có ngưỡng là nói dối người xem rằng nó tốt hay xấu |
| Card tách khỏi sàn bằng **chênh nền**, bóng chỉ để xác nhận | `#body` là `--page`, card là `--card`. Tăng `--sh-card` để card "nổi hơn" là đang chữa triệu chứng của một cái sàn sai màu |
| Đủ **bốn** trạng thái runtime | Trạng thái thứ tư — không dòng nào khớp bộ lọc — hay bị quên nhất |

Không kính mờ, không `backdrop-filter`, không nền gradient. Vật liệu của hệ này chỉ có: **ba sắc độ nền đặc + hairline 1px**.

---

## Khung ngoài — `components/Shell.tsx`

```tsx
'use client';
import { useEffect, useState, type ReactNode } from 'react';
import { CV } from '@/lib/tokens';

export function Shell({ children }: { children: ReactNode }) {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const fit = () => setScale(Math.min(innerWidth / CV.w, innerHeight / CV.h));
    fit();
    addEventListener('resize', fit);
    return () => removeEventListener('resize', fit);
  }, []);

  return (
    <div id="viewport">
      <div id="stage" style={{ transform: `scale(${scale})` }}>{children}</div>
    </div>
  );
}
```

Bốn điều bắt buộc:

1. **Không đặt `Math.min(1, scale)`.** Màn hình lớn hơn 1600×900 thì phóng to cho đầy, không giữ nguyên 1:1 rồi để một khung nhỏ lọt thỏm giữa màn hình.
2. **`#stage` là nơi duy nhất có `transform`.** Lề ngoài do `scale: .94` trên `#viewport` sinh ra — thuộc tính rời, trình duyệt nhân với `transform` này. Viết lề bằng `transform` sẽ bị style inline ở đây đè. Chi tiết ở `implementation-contract.md`.
3. **Drawer và modal nằm bên trong `#stage`** để co giãn cùng. Đặt ra ngoài là lệch tỷ lệ so với dashboard.
4. **`#stage` mang nền `--shell`, `#viewport` mang `--page`.** Thiếu một trong hai thì shell không nổi lên, và `--page` biến mất khỏi giao diện.

### Dùng trong trang

```tsx
<Shell>
  <Sidebar rail={rail} … />
  <main id="main">
    <TopBar … />
    <div id="body">
      <GreetBar … />
      <div id="kpis">{…}</div>
      <div id="row2">{…}</div>
      <div id="row3">{…}</div>
    </div>
  </main>
  <FilterDrawer … />
  <ExportModal … />
</Shell>
```

---

## Sidebar

Rộng **206px** khi mở, **58px** khi thu gọn. Ngăn với nội dung bằng `border-right: 1px solid var(--line)` — hairline, **không** bằng bóng đổ.

```tsx
<aside id="side" className={rail ? 'rail' : ''}>
  <div style={{ height: 46, display: 'flex', alignItems: 'center', gap: 8, padding: '0 10px' }}>
    <Icon name="layout-dashboard" />
    {!rail && <b style={{ minWidth: 0 }}>{APP.name}</b>}
    {!rail && (
      <button className="btn icon ghost" style={{ marginLeft: 'auto' }} onClick={onToggleRail}
              aria-label="Thu gọn">
        <Icon name="chevron-left" />
      </button>
    )}
  </div>

  <nav style={{ flex: 1, minHeight: 0, overflowY: 'auto', paddingTop: 4 }}>
    {PAGES.map(p => (
      <button key={p.id} className={`nav ${page === p.id ? 'on' : ''}`}
              onClick={() => setPage(p.id)} title={p.label}>
        <Icon name={p.icon} />
        <span className="nm">{p.label}</span>
      </button>
    ))}
  </nav>

  <div style={{ display: 'flex', flexDirection: 'column', gap: 1,
                padding: 10, borderTop: '1px solid var(--line)' }}>
    <b>{USER.name}</b>
    {!rail && <span style={{ fontSize: 11, color: 'var(--ink3)' }}>{USER.role}</span>}
  </div>
</aside>
```

**Nhãn nav phải bọc trong `<span className="nm">`.** CSS ẩn nhãn ở chế độ thu gọn bằng `#side.rail .nav .nm { display: none }` — để chữ trần thì không có gì để ẩn, và trong ô 58px chữ sẽ xuống 2–3 dòng, vỡ hẳn sidebar.

Mục đang chọn:

```css
.nav.on { background: var(--sub2); color: var(--ink); font-weight: 500 }
```

Nền `--sub2` chênh đúng một bậc so với `--shell`, đủ để thấy mà không hét lên. Không tô `--brand` — xem luật 1.

Ở chế độ thu gọn, nút thu gọn trong sidebar bị ẩn — 58px không đủ chỗ cho cả logo lẫn nút. Mở lại bằng nút `panel-left` trên header. Nếu ẩn cả hai thì sidebar thu gọn là một cánh cửa một chiều.

---

## TopBar

Cao **46px**, ngăn với `#body` bằng hairline.

```tsx
<header id="top">
  <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
    <button className="btn icon ghost" onClick={onToggleRail} aria-label="Thu gọn">
      <Icon name="panel-left" />
    </button>
    <b>{pageLabel}</b>
  </div>

  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>
    <span className="chip">Cập nhật <b>{clockVN()}</b></span>
    <button className="btn icon" onClick={refetch} aria-label="Tải lại">
      <Icon name="refresh-cw" />
    </button>
    <div style={{ position: 'relative' }}>
      <button className="btn icon" onClick={() => togglePop('notif')} aria-label="Thông báo">
        <Icon name="bell" />
      </button>
      {pop === 'notif' && <div className="pop">{…}</div>}
    </div>
    <button className="btn" onClick={openExport}>
      <Icon name="download" className="lu-sm" />Xuất dữ liệu
    </button>
    <button className="btn icon" onClick={toggleTheme} aria-label="Đổi giao diện">
      <Icon name={theme === 'light' ? 'moon' : 'sun'} />
    </button>
    <button className="btn pri" onClick={openDrawer}>
      <Icon name="sliders-horizontal" className="lu-sm" />Bộ lọc{filterCount ? ` (${filterCount})` : ''}
    </button>
  </div>
</header>
```

**Nút `Bộ lọc` là nút brand duy nhất của màn hình dashboard.** Mọi nút còn lại trên header là `.btn` thường hoặc `.btn.icon`. Thêm một `.btn.pri` thứ hai ở đâu đó là vi phạm luật 2.

`#top` có `position: relative; z-index: 20` sẵn trong `globals.css` — giữ nguyên. Không có nó, popover mở từ header bị card ở `#body` đè lên dù `z-index` của popover lớn hơn: card nằm trong một ngữ cảnh xếp chồng khác.

Header **không có** ô tìm kiếm, **không có** dòng phụ dưới tiêu đề.

---

## GreetBar

Băng **52px**.

```tsx
<div id="greet">
  <div style={{ minWidth: 0 }}>
    <div style={{ fontSize: 11, color: 'var(--ink3)' }}>{todayVN()} · {clockVN()} giờ Việt Nam</div>
    <div style={{ fontSize: 15, fontWeight: 600 }}>{greetVN()}, {USER.first}</div>
  </div>
  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 'auto' }}>
    {chips.map(c => (
      <span className="chip on" key={c.key}>
        {c.label}
        <button onClick={c.remove} aria-label={`Bỏ ${c.label}`}>
          <Icon name="x" className="lu-xs" />
        </button>
      </span>
    ))}
    {chips.length > 1 && (
      <button className="chip" onClick={clearAll}>Xoá tất cả</button>
    )}
  </div>
</div>
```

Giờ lấy từ `greetVN()` / `todayVN()` — đã tính sẵn UTC+7. **Không** gọi `new Date().getHours()`: người xem ở múi giờ khác sẽ thấy lời chào sai.

Đặt `setInterval(…, 30000)` để lời chào tự đổi khi qua mốc giờ.

Nút "Xoá tất cả" là `.chip` thường, **không** tô brand — nó là thao tác phụ trên một băng phụ.

Băng này **không chứa** bộ chọn chỉ số; chỉ số nằm trong drawer.

Không emoji ở đây. Không ở đâu cả.

---

## KpiCard

Băng **118px**, 5 thẻ, mỗi thẻ **259px** khi sidebar mở (289px khi thu gọn). Padding `.card.kpi` là `12px 13px`, **không** phải 14px như card thường.

```tsx
<div className="card kpi">
  <div className="kl">
    <span className="dot" style={{ background: `var(${token})` }} />{label}
  </div>
  <div className="kv">{format(value)}</div>
  <div className={`ks ${cls}`}>
    <Icon name={cls === 'del' ? 'arrow-down' : 'arrow-up'} className="lu-xs" />
    {pct(d)}
    <span className="knote">{note}</span>
  </div>
  <div className="kspark"><SparkLine width={kpiW - 28} height={30} … /></div>
</div>
```

Chiều mũi tên **đảo theo chỉ số**. Chi phí và CPL tăng là xấu:

```tsx
const d    = (now - prev) / prev;
const good = inverse ? d < 0 : d > 0;
const cls  = Math.abs(d) < 0.002 ? '' : good ? 'up' : 'del';
```

Ngưỡng `0,002` để chênh lệch dưới 0,2% hiển thị trung tính thay vì mũi tên xanh/đỏ vô nghĩa.

Ba luật:

1. **Sparkline phải có đường chuẩn gạch ngang.** Không có mốc thì sparkline chỉ cho thấy hình dáng, không cho biết đang trên hay dưới ngưỡng. Mốc = ngưỡng nghiệp vụ nếu có, còn lại là trung bình kỳ.
2. **Chỉ KPI có ngưỡng mới được tô màu.** Còn lại giữ `--series-2`. Đây là luật 3 áp vào thẻ KPI.
3. **Bề rộng sparkline là `kpiW − 28`** — đúng bằng `12 + 13 + ...` hai bên padding theo `.card.kpi`. Lệch một pixel là tràn, vì `overflow: hidden` cắt ngay.

Hàng chân (`.knote` — "mục tiêu 4,00x · đang thiếu 1,35x") hay bị **mất** khi CSS đè padding. Đếm đủ 5 dòng chú thích trước khi báo xong.

---

## ChartCard

```tsx
export function ChartCard({ width, title, subtitle, control, legend, children }: {
  width: number;
  title: string;
  subtitle?: string;
  control?: ReactNode;
  legend?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="card" style={{ width, flex: `0 0 ${width}px` }}>
      <div className="chead">
        <div>
          <div className="ctitle">{title}</div>
          {subtitle && <div style={{ fontSize: 11.5, color: 'var(--ink2)' }}>{subtitle}</div>}
        </div>
        {control}
      </div>
      {legend}
      <div className="plot">{children}</div>
    </div>
  );
}
```

Thứ tự bắt buộc: tiêu đề (`chead`, 43px) → legend → chart. Legend nằm **trên** chart.

`control` là điều khiển chỉ ảnh hưởng card này (Ngày/Tuần/Tháng), dùng `.seg`. Chỉ đặt ở card **có trục thời gian**. Card khác dùng chung `grain` thì ghi vào tiêu đề (`"Hiệu quả theo tuần"`), không đặt thêm một bộ nút nữa — hai bộ nút ghi vào cùng một biến làm người dùng tưởng là hai thiết lập riêng.

`.card` có `padding: 14px` — đúng bằng `CARD_PAD`. **Đừng đổi sang 16px cho "đúng thang spacing"**: `layout()` tính bề rộng `<svg>` bằng chính hằng số đó, và `overflow: hidden` sẽ xén mép phải cả bốn chart.

---

## Legend

```tsx
export function Legend({ items, two }: {
  items: { name: string; color: string }[];
  two?: boolean;
}) {
  return (
    <div className={`lgd${two ? ' two' : ''}`}>
      {items.map(i => (
        <span key={i.name}>
          <i style={{ background: i.color }} />{i.name}
        </span>
      ))}
    </div>
  );
}
```

| | |
|---|---|
| Dùng ở | donut (`two`, 44px) và line nhiều đường (1 hàng, 24px) |
| Không dùng ở | bar, area một chuỗi, bảng ma trận, sparkline |
| Nội dung | **chỉ màu + tên nhóm** — không giá trị, không phần trăm |
| Vị trí | trên chart, căn trái |

Chiều cao cố định 24 / 44 và **phải trừ khỏi chiều cao chart** khi gọi component chart. Quên trừ là card tràn. Bar không cần legend vì tên nhóm đã nằm cạnh thanh; area một chuỗi không cần vì tiêu đề card đã nói rõ đang vẽ gì.

---

## Nút, chip, segmented

| Class | Dùng cho | Nền |
|---|---|---|
| `.btn` | nút phụ | `--card`, viền `--line` |
| `.btn.pri` | **một nút duy nhất mỗi màn** | `--brand` |
| `.btn.ghost` | nút trong thanh công cụ dày đặc | trong suốt |
| `.btn.icon` | 30×30, chỉ icon | theo biến thể kèm theo |
| `.seg` | Ngày/Tuần/Tháng | vỏ `--sub2`, mục chọn là viên `--card` nổi |
| `.chip` | bộ lọc bật/tắt | viền `--line`, bật thì nền `--sub2` |

Mọi `.btn.icon` phải có `aria-label` — icon không có nhãn chữ thì trình đọc màn hình không đọc được gì.

`.seg button.on` dùng `box-shadow: var(--sh-card)` để viên nổi lên khỏi vỏ. Đây là chỗ hiếm hoi bóng làm việc chính; còn lại bóng chỉ xác nhận.

---

## Badge trạng thái

```tsx
<span className={`bdg ${level}`}>
  <Icon name={ICON[level]} className="lu-xs" />{text}
</span>
```

Ba mức, mỗi mức một cặp nền/chữ đã kiểm tương phản: `.bdg.ok` · `.bdg.warn` · `.bdg.bad`.

**Chỉ dán badge khi có một số so với một ngưỡng.** ROAS 0,82 so với ngưỡng lỗ 1,0 → `bad`. "Chiến dịch mùa hè" thì không có badge nào cả — nó không có ngưỡng để so.

Cùng một luật áp cho chấm màu trong `.kl` và cho màu sparkline. Nếu không tìm được ngưỡng để viết vào `THRESHOLD`, thì thứ đó giữ mực.

---

## Icon — `components/Icon.tsx`

Sprite `<symbol>` + `<use>`, nạp một lần ở gốc cây. **33 icon đã nhúng sẵn** trong skill — chép nguyên `assets/icons.ts` vào `lib/icons.ts`, không cài package, không tải gì.

`lib/icons.ts` (đã có sẵn, không sửa) xuất ra hai thứ:

```ts
export const ICON_SPRITE = `<symbol id="i-search" viewBox="0 0 24 24">…</symbol>…`;
export const ICON_NAMES = ['activity', 'search', …] as const;
export type IconName = (typeof ICON_NAMES)[number];
```

`components/Icon.tsx` chỉ còn hai hàm:

```tsx
import { ICON_SPRITE, type IconName } from '@/lib/icons';

export function IconSprite() {
  return (
    <svg width={0} height={0} style={{ position: 'absolute' }} aria-hidden
         dangerouslySetInnerHTML={{ __html: ICON_SPRITE }} />
  );
}

export function Icon({ name, className = 'lu' }: { name: IconName; className?: string }) {
  return <svg className={className} aria-hidden><use href={`#i-${name}`} /></svg>;
}
```

`dangerouslySetInnerHTML` ở đây an toàn: nội dung là một hằng số trong repo, không có dữ liệu người dùng đi vào.

**Không vẽ lại path theo trí nhớ, kể cả một icon.**

Đây không phải lời khuyên chung chung — lỗi này đã xảy ra trên chính dự án này: **5 trong 14 icon viết tay sai so với bản gốc**, và sai theo kiểu không ai nhận ra bằng mắt. Icon `search` đúng là:

```svg
<path d="m21 21-4.34-4.34" />
```

Bản viết tay ghi `m21 21-4.3-4.3`. Kính lúp vẫn ra kính lúp, cán vẫn dính vào vòng tròn, không ai phát hiện — nhưng đó là một hình khác. Nhân với 33 icon thì bộ icon trôi dần khỏi hệ mà không có một dấu hiệu nào. Vì vậy sprite được nhúng sẵn: không còn bước chép tay nào để sai.

Cần một icon chưa có trong 33 hình: thay bằng icon đã có, hoặc dùng chữ. Không tự vẽ thêm.

Ba cỡ, khai báo sẵn trong `globals.css`:

| Class | Cỡ | Stroke | Dùng ở |
|---|---|---|---|
| `.lu` | 16px | 1.75 | mặc định — nav, nút icon |
| `.lu-sm` | 14px | 1.75 | trong nút có chữ |
| `.lu-xs` | 12px | 2 | badge, chip, mũi tên KPI |

`.lu-xs` tăng stroke lên 2 vì nét 1.75 ở cỡ 12px mỏng tới mức mờ trên màn hình không HiDPI.

**Không dùng emoji làm icon.** Emoji đổi hình theo hệ điều hành, không đổi màu theo theme, không có cỡ thống nhất, và không nằm trong bất kỳ hệ thiết kế nào.

---

## FilterDrawer

Thứ tự từ trên xuống: **Chỉ số → Thời gian → Dimension 1 → Dimension 2 → Trạng thái → Chân**.

```tsx
const [draft, setDraft] = useState<Filters | null>(null);

function open()  { setDraft(structuredClone(filters)); setOpen(true); }
function apply() { if (draft) { setFilters(draft); setOpen(false); } }
```

Sửa trong drawer là **nháp**. Chỉ ghi vào state thật khi bấm `Áp dụng`. Người dùng phải đổi được nhiều thứ rồi mới xem kết quả một lần.

Chân drawer có hai nút: `Xoá lọc` (`.btn`) và `Áp dụng` (`.btn.pri`). Drawer là một màn riêng về mặt chú ý, nên nó được có nút brand của nó — nhưng vẫn chỉ **một**.

### Hai ô chọn ngày

```tsx
<input className="inp" type="date" value={isoOf(draft.from)}
       min={isoOf(0)} max={isoOf(draft.to)}
       onChange={e => setFrom(e.target.value)} />
<input className="inp" type="date" value={isoOf(draft.to)}
       min={isoOf(draft.from)} max={isoOf(DAYS - 1)}
       onChange={e => setTo(e.target.value)} />
```

`min`/`max` **giao nhau** ⇒ trình duyệt tự chặn chọn khoảng ngược. Không cần thông báo lỗi, không cần validate. Vẫn giữ clamp trong JS làm lưới an toàn.

Nguồn sự thật là **chỉ số ngày** (số nguyên), không phải chuỗi. Preset (`7 / 30 / 90 / toàn bộ`) chỉ là nhãn; chọn ngày tay thì chuyển sang `custom`.

### Trạng thái đóng

```css
transform: translateX(calc(100% + 34px));
visibility: hidden;
```

`translateX(100%)` **không đủ** nếu drawer đặt cách mép (`right: 14px`) — vẫn lòi ra đúng 14px. Phải cộng cả lề lẫn bóng. `visibility: hidden` để nó không bắt chuột khi đóng.

Danh sách dài cuộn trong khối của nó (`.dlist`), chiều cao là **bội số** của chiều cao một hàng: hàng 28px ⇒ 140px = 5 hàng. Cắt giữa hàng trông như lỗi render.

---

## ExportModal

Hai bước. Bấm nút ở header **không tải file**.

Bước 1 — bảng chọn:

| Mục | Kiểu |
|---|---|
| Phạm vi dòng | radio: theo bộ lọc dashboard / toàn bộ / tuỳ chỉnh — kèm số dòng từng lựa chọn |
| Khoảng ngày | 2 ô date riêng |
| Dimension chính | checkbox riêng |
| Cột xuất | checkbox từng cột + nút chọn/bỏ tất cả |
| Định dạng | CSV dấu phẩy · CSV dấu chấm phẩy cho Excel VN |
| Xem trước | `Sẽ xuất 330 dòng × 12 cột · 05/07 → 03/08` |

Bước 2 — nút `Tải xuống`, **mờ và không bấm được** khi không có dòng hoặc chưa chọn cột nào.

```tsx
function exportRows(): Row[] {
  if (scope === 'filter') return filteredRows;     // đúng tập đang hiển thị
  if (scope === 'all')    return allRows;
  return allRows.filter(r => inRange(r) && inChannels(r));
}
```

"Theo bộ lọc dashboard" phải trả **đúng `filteredRows`**, không được lọc lại từ đầu theo ngày + kênh — sẽ lệch khi dashboard đang lọc thêm chiến dịch hoặc mục tiêu. Sai ở đây là người dùng mang số sai đi họp.

Sửa trong modal **không đụng** bộ lọc dashboard. Hai ngữ cảnh khác nhau.

Xuất dữ liệu chỉ là xuất dữ liệu. Không xuất PNG, không xuất PDF.

### Sinh CSV

```tsx
const cell = (v: unknown): string => {
  const s = String(v);
  return /["\n]/.test(s) || s.includes(sep) ? `"${s.replace(/"/g, '""')}"` : s;
};
const csv = [cols.map(c => c.label).join(sep),
             ...rows.map(r => cols.map(c => cell(c.get(r))).join(sep))].join('\r\n');

new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' });
```

BOM `﻿` bắt buộc — thiếu nó Excel mở ra tiếng Việt thành ký tự lạ.

Bọc ngoặc kép theo RFC 4180: ô chứa dấu phân cách, dấu nháy kép hoặc xuống dòng thì bọc, và nháy kép bên trong nhân đôi.

Tên file kèm khoảng ngày: `marketpulse_2026-07-05_2026-08-03.csv`.

---

## Bốn trạng thái runtime

Mọi vùng dữ liệu phải có đủ bốn:

| Trạng thái | Class | Phải có |
|---|---|---|
| Đang tải | `.busy` + `.spin` | |
| Lỗi | `.err` | **nút thử lại** |
| Có dữ liệu | | |
| **Không dòng nào khớp bộ lọc** | `.empty` | **gợi ý nới lọc** |

```tsx
{state === 'loading' && <div className="busy"><span className="spin" />Đang tải…</div>}

{state === 'error' && (
  <div className="err">
    <Icon name="triangle-alert" />
    {message}
    <button className="btn" onClick={onRetry}>Thử lại</button>
  </div>
)}

{state === 'ready' && !rows.length && (
  <div className="empty">
    <b>Không có dòng nào khớp bộ lọc</b>
    Mở rộng khoảng thời gian hoặc bấm "Xoá tất cả".
  </div>
)}
```

Trạng thái thứ tư hay bị quên nhất. Lọc chặt tay mà chart trắng trơn không kèm lời giải thích thì người dùng tưởng app hỏng — và báo bug cho một thứ đang chạy đúng.

Lỗi **phải kèm nút thử lại**. Một thông báo lỗi không có lối ra buộc người dùng tải lại cả trang, mất hết bộ lọc đang đặt.
