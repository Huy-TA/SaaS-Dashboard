# Vẽ chart

Sáu loại visual. **Bốn** dùng Recharts, **hai** phải viết SVG/HTML tay.

| Loại | Thư viện | Legend | Chiều cao vẽ |
|---|---|---|---|
| Donut | Recharts `PieChart` | ✅ 2 hàng | `h − LGD2` |
| Area một chuỗi | Recharts `AreaChart` | ❌ | `h` |
| Line nhiều đường | Recharts `LineChart` | ✅ 1 hàng | `h − LGD1` |
| Bar xếp hạng | Recharts `BarChart` | ❌ | `h` |
| **Sparkline có đường chuẩn** | **SVG tay** | ❌ | 30px |
| **Bảng ma trận tô nhiệt** | **`<table>` tay** | ❌ | — |

---

## Ba điều cấm

### 1. Cấm `Math.max(1, ...values)`

Chỉ số tỷ lệ (ROAS 0,0121) bị ép max = 1 → thanh dài nhất teo còn 10px. **Không báo lỗi.** Bạn chỉ phát hiện khi nhìn thấy chart trông kỳ.

### 2. Cấm `Math.max(...v) || 1`

Mảng rỗng cho `-Infinity`, mà `-Infinity` là **truthy** nên `||` không chạy. Chart nhận domain `[0, -Infinity]`.

Dùng `maxOf()` trong `lib/tokens.ts` cho cả hai trường hợp.

### 3. Cấm tô chuỗi dữ liệu bằng màu tín hiệu

`--brand`, `--ok`, `--warn`, `--bad` **không bao giờ** là màu của một chuỗi. Dùng `seriesColor()`.

Nếu "TikTok = đỏ vì là chuỗi thứ 3", thì lúc TikTok thật sự lỗ sẽ không ai nhận ra.

---

## Kích thước — luôn là px cứng

```tsx
const L = layout(sidebarOpen ? SIDE_WIDE : SIDE_RAIL);

<DonutChart      width={L.p2a.w} height={L.p2a.h - LGD2} data={byChannel} />
<TrendAreaChart  width={L.p2b.w} height={L.p2b.h}        data={trend} />
<RankBarChart    width={L.p3c.w} height={L.p3c.h}        data={topCampaigns} />
<MatrixTable     width={L.p3d.w} height={L.p3d.h}        data={matrix} />
```

**Cấm `ResponsiveContainer`.** Cấm `clientWidth`. Cấm `ResizeObserver`.

Card có legend phải **trừ** `LGD1` (24) hoặc `LGD2` (44), nếu không card tràn.

---

## Màu: một luật cho mọi dimension

```tsx
// Kênh, chiến dịch, sản phẩm — cùng một lời gọi
data.map((row, i) => (
  <Cell key={row.id} fill={seriesColor(row, i)} />
))
```

Không có nhánh riêng cho kênh. `seriesColor()` chỉ nhận `(row, rank)`; mọi màu ra đều là token của design system đang chạy.

Chiến dịch không có màu thương hiệu, và danh sách đổi theo bộ lọc — màu cố định sẽ vô nghĩa.

---

## Cạm bẫy: nhãn trục cuối bị xén

Nhãn x cuối nằm sát mép phải, `overflow: hidden` của card sẽ cắt mất một nửa.

```tsx
<XAxis
  tick={({ x, y, payload, index }) => (
    <text
      x={x} y={y + 12}
      textAnchor={index === lastIndex ? 'end' : 'middle'}
      fontSize={10.5} fill={CSS('--ink3')}
    >{payload.value}</text>
  )}
/>
```

Cùng lý do, nhãn đầu tiên có thể cần `textAnchor="start"` nếu chart không có lề trái.

---

## Hai chart Recharts không vẽ được

### SparkLine có đường chuẩn

Recharts `ReferenceLine` kéo theo cả hệ trục và lề mặc định — không vừa hộp 30px không trục, không lề. Viết tay:

```tsx
type SparkLineProps = {
  values: number[];
  baseline: number;      // ngưỡng nghiệp vụ, hoặc trung bình kỳ
  width: number;
  height: number;
  tone?: 'ok' | 'bad' | null;   // null = giữ mực, KPI không có ngưỡng
};

export function SparkLine({ values, baseline, width, height, tone = null }: SparkLineProps) {
  if (values.length < 2) return <svg width={width} height={height} />;

  const pad = 2;
  const hi = Math.max(maxOf(values), baseline);
  const lo = Math.min(...values, baseline, 0);
  const span = hi - lo || 1;

  const x = (i: number) => (i / (values.length - 1)) * width;
  const y = (v: number) => pad + (1 - (v - lo) / span) * (height - pad * 2);

  const line = values.map((v, i) => `${x(i)},${y(v)}`).join(' ');
  const stroke = tone ? CSS(`--${tone}`) : CSS('--ink2');

  return (
    <svg width={width} height={height} aria-hidden="true">
      {/* đường chuẩn — nhờ nó sparkline không chỉ cho thấy HÌNH DÁNG
          mà còn cho biết đang TRÊN hay DƯỚI mốc */}
      <line
        x1={0} x2={width} y1={y(baseline)} y2={y(baseline)}
        stroke={CSS('--ink3')} strokeWidth={1} strokeDasharray="3 3"
      />
      <polyline
        points={line} fill="none"
        stroke={stroke} strokeWidth={1.5}
        strokeLinejoin="round" strokeLinecap="round"
      />
    </svg>
  );
}
```

Hai luật đi kèm:

- **Đường chuẩn là bắt buộc.** Sparkline không có mốc chỉ cho thấy hình dáng.
- **Chỉ KPI có ngưỡng mới truyền `tone`.** Còn lại để `null`, giữ mực. Tô màu một chỉ số không có ngưỡng là nói dối người xem rằng nó tốt hay xấu.

### Bảng ma trận tô nhiệt

Không phải chart mà là `<table>` HTML, nền ô pha theo giá trị.

```tsx
type MatrixProps = {
  rows: { key: string; cells: number[] }[];
  cols: string[];
  width: number;
  height: number;
  inverse?: boolean;      // true với chỉ số nghịch (CPL): cao = xấu
};

export function MatrixTable({ rows, cols, width, height, inverse = false }: MatrixProps) {
  const all = rows.flatMap((r) => r.cells);
  const hi = maxOf(all);
  const lo = Math.min(...all, 0);

  /* Pha 5% → 29% mực. ĐỪNG dùng 8% → 48%: ô giá trị cao nhất sẽ thành ô
     KHÓ ĐỌC NHẤT, và ở dark mode nó đảo ngược thành ô sáng nhất. */
  const tint = (v: number) => {
    const t = (v - lo) / (hi - lo || 1);
    const pct = 5 + t * 24;
    return `color-mix(in srgb, ${inverse ? CSS('--bad') : CSS('--ink')} ${pct}%, transparent)`;
  };

  return (
    <div style={{ width, height, overflowY: 'auto' }}>
      <table>
        <thead>
          <tr>
            <th>Kỳ</th>
            {cols.map((c) => <th key={c} className="n">{c}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.key}>
              <td>{r.key}</td>
              {r.cells.map((v, i) => (
                <td key={cols[i]} className="n">
                  <span className="heat" style={{ background: tint(v) }}>
                    {fmt(v)}
                  </span>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

Bảng cuộn **bên trong khối của nó** (`overflow-y: auto` trên `div`), không làm cuộn cả trang.

---

## Bốn chart dùng Recharts

Mẫu chung — mọi chart đọc màu qua `CSS()` nên đổi theme là chart tự đổi:

```tsx
<AreaChart width={width} height={height} data={data}
           margin={{ top: 8, right: 8, bottom: 18, left: 56 }}>
  <CartesianGrid stroke={CSS('--fill4')} vertical={false} />
  <XAxis dataKey="date" tick={axisTick} axisLine={false} tickLine={false} />
  <YAxis tick={axisTick} axisLine={false} tickLine={false} width={48} />
  <Area type="monotone" dataKey="value"
        stroke={CSS('--focus')} fill={CSS('--focus')} fillOpacity={0.08}
        strokeWidth={1.75} dot={false} />
</AreaChart>
```

`margin.left = 56` là số đã kiểm: nhãn `338,9 tr` ở 10.5px cần 47px, cộng lề. Nếu đổi sang font mono, đo lại bằng `getBBox()` — mono rộng hơn sans khoảng 30% và sẽ bị xén.

### Legend

```tsx
<div className={`lgd${twoRows ? ' two' : ''}`}>
  {items.map((it) => (
    <span key={it.id}>
      <i style={{ background: it.color }} />{it.label}
    </span>
  ))}
</div>
```

Legend **chỉ** có ô màu + tên nhóm. Không kèm giá trị, không kèm phần trăm — số đã có ở tooltip, ở nhãn cuối thanh bar và ở bảng.

Đặt **trên** chart, căn trái, ngay dưới tiêu đề card.

---

## Bốn trạng thái runtime

```tsx
if (loading) return <div className="busy"><i className="spin" />Đang tải…</div>;
if (error)   return <div className="err">{error}<button className="btn" onClick={retry}>Thử lại</button></div>;
if (!rows.length) return <div className="empty">Không có dòng nào khớp bộ lọc<br />Thử nới khoảng ngày hoặc bỏ bớt kênh</div>;
return <Chart … />;
```

Trạng thái thứ ba hay bị quên. Lọc chặt tay là chart trắng trơn không kèm lời giải thích — người dùng tưởng app hỏng.
