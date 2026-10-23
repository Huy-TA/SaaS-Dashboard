# Monochrome Near-White Analytics Design System

Hệ thiết kế cho dashboard theo dõi (monitoring). Đơn sắc, tương phản thấp, màu chỉ xuất hiện ở nơi màu có nghĩa.

Bản chuẩn chạy được: `prototype/design-systems/_base.html`.
Bản token để chép: `assets/globals.css` trong skill **`dashboard-build`**.

Khi tài liệu này và `globals.css` khác nhau, **`globals.css` đúng**.

> Hệ này thay cho **Apple Liquid Glass** dùng đến 2026-09. Bản cũ còn ở
> `prototype/archive/dashboard-prototype-BEFORE-console-ds.html`. Nếu tài liệu nào
> còn nhắc "ba lớp vật liệu kính mờ", "canvas gradient", `--r-card:16px`, sidebar 240,
> row 280 — đó là tài liệu chưa cập nhật, **không phải hệ hiện hành**.

---

## Nguyên tắc số một — một mặt phẳng, không vật liệu

Hệ cũ tách lớp bằng độ mờ của kính. Hệ này tách lớp bằng **ba sắc độ nền + một hairline**. Không `backdrop-filter`, không gradient nền, không bóng đổ trừ hai chỗ.

| Lớp | Token | Light | Dùng cho |
|---|---|---|---|
| Mặt bàn | `--page` | `#E9E9EA` | nền ngoài shell — shell **nổi trên** nó |
| Khung app | `--shell` | `#FFFFFF` | sidebar + header + vùng nội dung |
| Sàn nội dung | `--page` | `#E9E9EA` | `#body` — card nổi trên sàn này |
| Card | `--card` | `#FFFFFF` | card KPI, card chart, bảng |

Hai điều dễ làm sai:

1. **Shell không tràn hết màn hình.** Nó là một tấm bo `--r-shell:20px` nổi trên `--page`, có `--sh-shell`. Dashboard tràn sát mép màn hình là dấu hiệu làm sai hệ này.
2. **`#body` không cùng màu với `--shell`.** Sàn phải là một bậc **thấp hơn** card, nếu không card trắng trên nền trắng sẽ mất mép. Đây là lý do sàn dùng `--page` chứ không dùng `--shell`.

Đổi lại việc bỏ kính: chữ 10px nằm trên nền đặc nên độ tương phản là hằng số, đọc được ở mọi vùng. Sàn 4,5:1 áp cho **mọi** chữ, kể cả nhãn trục.

---

## Ba luật màu

### Luật 1 — brand chỉ dành cho thứ bấm được

`--brand: #3D5AFE` chỉ xuất hiện ở: nút chính, checkbox đã tick, viền focus, link.

**Không bao giờ** làm màu chuỗi dữ liệu.

Khác hệ cũ ở một điểm: mục nav đang chọn **không** tô brand, nó tô nền `--sub2` + chữ `--ink`. Brand được để dành cho đúng một nút hành động trên mỗi màn.

### Luật 2 — ok / warn / bad chỉ mang nghĩa ngưỡng

`--ok: #128A54` · `--warn: #B45309` · `--bad: #C62B3C` chỉ dùng khi có **một con số so với một ngưỡng**: đạt/không đạt, tăng/giảm, mức cảnh báo.

Không bao giờ làm màu chuỗi dữ liệu. "TikTok = đỏ vì là chuỗi thứ 3" thì lúc TikTok thật sự lỗ sẽ không ai nhận ra.

### Luật 3 — không có ngoại lệ nào

Mọi màu trên màn hình đều là token của design system đang chạy. Không có bảng màu thương hiệu, không có "màu kênh", không có hex nào nằm ngoài bảng token.

Mọi dimension — kênh, chiến dịch, sản phẩm, vùng — đi chung **một** luật màu. Một giá trị không giữ màu cố định xuyên chart: màu của nó nói **thứ hạng**, không nói **danh tính**. Danh tính do icon và nhãn chở.

Cái giá phải trả, ghi ra để biết trước: người xem không còn nhận ra Google bằng màu đỏ. Cái được lớn hơn với mục đích học: đổi design system thì **cả** dashboard đổi theo, không còn vùng nào miễn nhiễm.

### Hệ quả: chuỗi dữ liệu không mang màu

```
--series-1  #2E3033   đậm nhất
--series-2  #55585D
--series-3  #83868C
--series-4  #AFB2B7
--series-5  #D3D5D8   nhạt nhất
--focus     #191A1C   hạng 1
```

Năm bậc chênh nhau về **độ sáng**, không về sắc — điều kiện để phân biệt được khi in đen trắng và với người mù màu.

Thứ tự quyết định màu (chính là `serColor()` trong bản chuẩn — đọc từ trên xuống, gặp là dừng):

```
1. dưới ngưỡng lỗ     →  --bad       (trạng thái thắng tất cả)
2. hạng 1             →  --focus
3. còn lại            →  --series-N theo hạng, tối đa bậc 5
```

Ngưỡng đứng trên cùng là có chủ ý: một kênh đang lỗ phải đỏ kể cả khi nó đang đứng hạng 1.

> **`--focus` không được trùng bất kỳ bậc `--series-2..5` nào.** Vì hạng 1 lấy `--focus` còn hạng 2 trở đi lấy `--series-2..5`, `--series-1` thực tế **không bao giờ được vẽ** — nó chỉ là bậc dự phòng cho trường hợp bạn đặt `--focus` = `--series-1`. Đặt `--focus` trùng một bậc giữa thang thì hai hạng khác nhau sẽ ra đúng một màu, và trên donut thì gần như không ai thấy.

---

## Bảng token

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

Dark **không phải đảo màu**. Nó là bảng riêng, và luật màu đảo được nguyên vẹn — đảo được thì mới chứng minh đó là một luật chứ không phải một bảng màu.

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

### Bo góc

```
--r-shell: 20px    --r-card: 11px    --r-inner: 9px
--r-menu:  9px     --r-sm:    7px    --r-sheet: 14px    --r-pill: 999px
```

Shell 20 → card 11 → phần tử trong card 9. Bo giảm dần theo độ sâu; bằng nhau sẽ thấy méo ở góc.

### Bóng — chỉ ba

```
--sh-card:  0 1px 2px rgba(18,20,24,.03)
--sh-pop:   0 14px 38px -10px rgba(18,20,24,.16), 0 2px 6px rgba(18,20,24,.05)
--sh-shell: 0 22px 56px -22px rgba(18,20,24,.22)
```

`--sh-card` gần như không thấy — card tách khỏi sàn chủ yếu bằng **chênh nền**, bóng chỉ để xác nhận. `--sh-pop` cho popover / drawer / modal. `--sh-shell` cho đúng một thứ: shell nổi trên mặt bàn.

### Chữ

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

---

## Bí danh tương thích — đọc trước khi sửa token

Trong `:root` có một khối bí danh:

```css
--label: var(--ink);   --label2: var(--ink2);   --label3: var(--ink3);
--bg: var(--card);     --separator: var(--line);
--blue: var(--brand);  --green: var(--ok);  --red: var(--bad);  --orange: var(--warn);
--fill4: var(--line2); --gray: var(--ink3); --lift-sm: var(--sh-card);
```

Lớp JS vẽ chart gọi `CSS('--label2')`, `CSS('--fill4')`… theo tên hệ cũ. Khối này ánh xạ chúng về hệ mới tại **một chỗ**.

**Không xoá khối này** khi đổi design system. Xoá là 40+ lời gọi `getComputedStyle` trả về chuỗi rỗng — chart vẫn vẽ nhưng không màu. Hỏng im lặng, không có thông báo lỗi nào.

Đây cũng là cơ chế cho phép **đổi cả hệ thiết kế mà không đụng một dòng JS**: viết lại `:root` + `[data-theme="dark"]`, giữ nguyên bí danh, xong.

---

## Đổi sang design system khác

Hệ mặc định trên đây là một trong bảy bản đã dựng. Sáu bản còn lại — Linear, Geist, Stripe, Raycast, Radix, Apple HIG — mỗi bản có `DESIGN.md` riêng mô tả đầy đủ 18 nhóm quyết định (layout, spacing, typography, color, background, card, border, radius, shadow, icon, button, input, navigation, chart, table, overlay, light/dark, checklist).

Khi muốn đổi:

1. Chọn style, đọc `DESIGN.md` của nó.
2. Ghi quyết định vào `docs/2-design/design.md` — **ghi vào tài liệu trước, sửa code sau**. Tài liệu là nguồn sự thật; code là hệ quả.
3. Thay `:root` + `[data-theme="dark"]`, **giữ nguyên khối bí danh tương thích**.
4. Phần sau `</style>` không đổi một byte nào.

Kiểm tra sau khi đổi: 4 trạng thái (sáng / tối / thu gọn sidebar / trang nguồn) đều không lỗi console, và mọi chữ vẫn đạt 4,5:1.
